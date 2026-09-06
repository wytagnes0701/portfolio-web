import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { child, get, ref as dbRef } from 'firebase/database'
import { ensureInitialized, fetchAndActivate, getValue } from 'firebase/remote-config'
import { getDownloadURL, ref as storageRef } from 'firebase/storage'
import { decryptAesCbc } from './aes'
import { sortWorkingExperience } from './experience'
import { getFirebase, isFirebaseConfigured } from './firebase'
import type {
  EduItem,
  ExpItem,
  MasterAccountInfo,
  MasterLogin,
  PortfolioItem,
  PortfolioSnapshot,
} from './types'

type PortfolioContextValue = {
  snapshot: PortfolioSnapshot
  accountInfo: MasterAccountInfo | null
  loginEmail: string
  isReady: boolean
  fetchConfig: () => Promise<MasterLogin | null>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  validatePasscode: (passcode: string) => Promise<boolean>
  fillMasterCredentials: () => Promise<{ email: string; password: string }>
  getProject: (id: number) => PortfolioItem | undefined
  resolveGallery: (item: PortfolioItem) => Promise<string[]>
}

const emptySnapshot: PortfolioSnapshot = {
  portfolios: [],
  education: [],
  workingExperience: [],
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

function asNumber(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value)
  }
  return null
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function splitLines(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean)
  if (typeof value === 'string' && value.length > 0) return value.split('\n')
  return []
}

function asIntList(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => asNumber(item))
    .filter((item): item is number => item != null)
}

function parsePortfolio(raw: Record<string, unknown>): PortfolioItem | null {
  const id = asNumber(raw.ID ?? raw.Id)
  if (id == null) return null
  return {
    id,
    title: asString(raw.Title),
    basicInfo: asString(raw.BasicInfo),
    description: splitLines(raw.Description),
    furtherInfo: splitLines(raw.FurtherInfo),
    cover: asString(raw.Cover) || null,
    imgURL: splitLines(raw.ImgURL),
    tagIndex: asIntList(raw.TagIndex),
    vidURL: splitLines(raw.VidURL),
    typeID: asNumber(raw.TypeID),
  }
}

function parseEducation(raw: Record<string, unknown>): EduItem | null {
  const id = asNumber(raw.Id ?? raw.ID)
  if (id == null) return null
  return {
    id,
    year: asString(raw.Year),
    title: asString(raw.Title),
    subTitle: asString(raw.Subtitle ?? raw.SubTitle),
    description: asString(raw.Description),
  }
}

function parseExperience(raw: Record<string, unknown>): ExpItem | null {
  const id = asNumber(raw.Id ?? raw.ID)
  if (id == null) return null
  return {
    id,
    year: splitLines(raw.Year),
    title: splitLines(raw.Title),
    description: asString(raw.Description),
    category: '',
  }
}

function snapshotToList(value: unknown): Record<string, unknown>[] {
  if (!value || typeof value !== 'object') return []
  return Object.values(value as Record<string, unknown>).filter(
    (item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object',
  )
}

function readJsonObject(raw: string): Record<string, unknown> | null {
  if (!raw.trim()) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

function readField(source: Record<string, unknown>, ...keys: string[]) {
  const lookup = Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key.toLowerCase(), value]),
  )
  for (const key of keys) {
    const value = lookup[key.toLowerCase()]
    if (typeof value === 'string' && value.length > 0) return value
  }
  return ''
}

function parseMasterLogin(raw: string): MasterLogin | null {
  const source = readJsonObject(raw)
  if (!source) return null
  const email = readField(source, 'email')
  const password = readField(source, 'password')
  const passCode = readField(source, 'passCode', 'passcode')
  if (!email || !password || !passCode) return null
  return { email, password, passCode }
}

function parseAccountInfo(raw: string): MasterAccountInfo | null {
  const source = readJsonObject(raw)
  if (!source) return null
  return {
    whatsApp: readField(source, 'whatsApp', 'whatsapp'),
    email: readField(source, 'email'),
    linkedIn: readField(source, 'linkedIn', 'linkedin'),
    web: readField(source, 'web'),
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        window.clearTimeout(timer)
        reject(error)
      },
    )
  })
}

async function resolveStorageUrl(path: string | null | undefined) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  try {
    const { storage } = getFirebase()
    return await withTimeout(
      getDownloadURL(storageRef(storage, path)),
      15000,
      'Storage timeout',
    )
  } catch {
    return null
  }
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot>(emptySnapshot)
  const [accountInfo, setAccountInfo] = useState<MasterAccountInfo | null>(null)
  const [masterLogin, setMasterLogin] = useState<MasterLogin | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [isReady, setIsReady] = useState(false)
  const masterLoginRef = useRef<MasterLogin | null>(null)
  masterLoginRef.current = masterLogin

  const fetchConfig = useCallback(async () => {
    if (masterLoginRef.current) return masterLoginRef.current
    if (!isFirebaseConfigured()) {
      throw new Error('missing-config')
    }
    const { remoteConfig } = getFirebase()
    await fetchAndActivate(remoteConfig)
    await ensureInitialized(remoteConfig)
    const nextLogin = parseMasterLogin(getValue(remoteConfig, 'master_login').asString())
    const nextAccount = parseAccountInfo(getValue(remoteConfig, 'master_account_info').asString())
    masterLoginRef.current = nextLogin
    setMasterLogin(nextLogin)
    setAccountInfo(nextAccount)
    return nextLogin
  }, [])

  const loadAll = useCallback(async () => {
    const { database } = getFirebase()
    const root = dbRef(database)
    const [workingSnap, educationSnap, portfolioSnap] = await withTimeout(
      Promise.all([
        get(child(root, 'WorkingExperience')),
        get(child(root, 'Education')),
        get(child(root, 'Portfolio')),
      ]),
      20000,
      'Database timeout',
    )
    const workingExperience = sortWorkingExperience(
      snapshotToList(workingSnap.val())
        .map(parseExperience)
        .filter((item): item is ExpItem => item != null),
    )
    const education = snapshotToList(educationSnap.val())
      .map(parseEducation)
      .filter((item): item is EduItem => item != null)
      .sort((a, b) => b.id - a.id)
    const portfolios = snapshotToList(portfolioSnap.val())
      .map(parsePortfolio)
      .filter((item): item is PortfolioItem => item != null)
    const resolved = await Promise.all(
      portfolios.map(async (item) => {
        const cover = await resolveStorageUrl(item.cover)
        return { ...item, cover }
      }),
    )
    setSnapshot({ portfolios: resolved, education, workingExperience })
    setIsReady(true)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const { auth } = getFirebase()
      await signInWithEmailAndPassword(auth, email, password)
      await loadAll()
      setLoginEmail(email)
    },
    [loadAll],
  )

  const logout = useCallback(async () => {
    if (isFirebaseConfigured()) {
      await signOut(getFirebase().auth)
    }
    setSnapshot(emptySnapshot)
    setLoginEmail('')
    setIsReady(false)
  }, [])

  const validatePasscode = useCallback(
    async (passcode: string) => {
      const login = masterLogin ?? (await fetchConfig())
      if (!login?.passCode) {
        throw new Error('missing-config')
      }
      try {
        const expected = await decryptAesCbc(login.passCode)
        return passcode.trim() === expected
      } catch {
        return false
      }
    },
    [fetchConfig, masterLogin],
  )

  const fillMasterCredentials = useCallback(async () => {
    const login = masterLogin ?? (await fetchConfig())
    if (!login) throw new Error('Master login is not available')
    const password = await decryptAesCbc(login.password)
    return { email: login.email, password }
  }, [fetchConfig, masterLogin])

  const getProject = useCallback(
    (id: number) => snapshot.portfolios.find((item) => item.id === id),
    [snapshot.portfolios],
  )

  const resolveGallery = useCallback(async (item: PortfolioItem) => {
    const cover = item.cover ? [item.cover] : []
    const gallery = await Promise.all(item.imgURL.map((path) => resolveStorageUrl(path)))
    return [...cover, ...gallery.filter((url): url is string => Boolean(url))]
  }, [])

  const value = useMemo(
    () => ({
      snapshot,
      accountInfo,
      loginEmail,
      isReady,
      fetchConfig,
      login,
      logout,
      validatePasscode,
      fillMasterCredentials,
      getProject,
      resolveGallery,
    }),
    [
      snapshot,
      accountInfo,
      loginEmail,
      isReady,
      fetchConfig,
      login,
      logout,
      validatePasscode,
      fillMasterCredentials,
      getProject,
      resolveGallery,
    ],
  )

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolio must be used inside PortfolioProvider')
  }
  return context
}
