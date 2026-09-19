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
import { decodeRtdbNewlines } from '../lib/format'
import type {
  EduItem,
  ExpItem,
  MasterAccountInfo,
  MasterLogin,
  PortfolioItem,
  PortfolioSnapshot,
  YoutubeChannel,
  YoutubeLiveStats,
  YoutubeLiveVideo,
  YoutubeSocial,
  YoutubeVideo,
} from './types'
import {
  emptyYoutubeChannel,
  emptyYoutubeSocial,
  fetchYoutubeLive,
} from './youtube'

type PortfolioContextValue = {
  snapshot: PortfolioSnapshot
  accountInfo: MasterAccountInfo | null
  youtubeSocial: YoutubeSocial
  liveStats: YoutubeLiveStats | null
  liveVideos: YoutubeLiveVideo[]
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
  youtubeChannel: emptyYoutubeChannel,
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
  if (typeof value === 'string') return decodeRtdbNewlines(value)
  if (typeof value === 'number') return String(value)
  return ''
}

function splitLines(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => asString(item)).filter(Boolean)
  if (typeof value === 'string' && value.length > 0) return asString(value).split('\n').filter(Boolean)
  return []
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => asString(item)).filter(Boolean)
  if (typeof value === 'string' && value.length > 0) return asString(value).split('\n').filter(Boolean)
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map((item) => asString(item))
      .filter(Boolean)
  }
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

function parseYoutubeVideo(raw: unknown): YoutubeVideo | null {
  if (!raw || typeof raw !== 'object') return null
  const source = raw as Record<string, unknown>
  const id = asString(source.Id)
  if (!id) return null
  return {
    id,
    title: asString(source.Title),
    tags: asStringList(source.Tags),
  }
}

function parseYoutubeVideos(raw: unknown): YoutubeVideo[] {
  if (!raw || typeof raw !== 'object') return []
  return Object.entries(raw as Record<string, unknown>)
    .sort(([left], [right]) => {
      const leftIndex = Number.parseInt(left, 10)
      const rightIndex = Number.parseInt(right, 10)
      const leftValid = !Number.isNaN(leftIndex)
      const rightValid = !Number.isNaN(rightIndex)
      if (leftValid && rightValid) return leftIndex - rightIndex
      if (leftValid) return -1
      if (rightValid) return 1
      return left.localeCompare(right)
    })
    .map(([, value]) => parseYoutubeVideo(value))
    .filter((video): video is YoutubeVideo => video != null)
}

function parseYoutubeChannel(raw: unknown): YoutubeChannel {
  if (!raw || typeof raw !== 'object') return emptyYoutubeChannel
  const source = raw as Record<string, unknown>
  return {
    handle: asString(source.Handle),
    channelId: asString(source.ChannelId),
    subscriberCount: asString(source.SubscriberCount),
    videoCount: asString(source.VideoCount),
    viewCount: asString(source.ViewCount),
    joinedDate: asString(source.JoinedDate),
    creatorName: asString(source.CreatorName),
    creatorBio: asString(source.CreatorBio),
    channelName: asString(source.ChannelName),
    slogan: asString(source.Slogan),
    description: asString(source.Description),
    collabInvite: asString(source.CollabInvite),
    collabEmail: asString(source.CollabEmail),
    pillars: asStringList(source.Pillars),
    tags: asStringList(source.Tags),
    videos: parseYoutubeVideos(source.Videos),
  }
}

function parseContact(raw: unknown): MasterAccountInfo | null {
  if (!raw || typeof raw !== 'object') return null
  const source = raw as Record<string, unknown>
  const info: MasterAccountInfo = {
    whatsApp: asString(source.WhatsApp),
    email: asString(source.Email),
    linkedIn: asString(source.LinkedIn),
    web: asString(source.Web),
  }
  if (!info.whatsApp && !info.email && !info.linkedIn && !info.web) return null
  return info
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
    if (typeof value === 'number') return String(value)
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

function parseYoutubeSocial(raw: string): YoutubeSocial {
  const source = readJsonObject(raw)
  if (!source) return emptyYoutubeSocial
  return {
    channelUrl: readField(source, 'ChannelUrl'),
    instagramUrl: readField(source, 'InstagramUrl'),
    facebookUrl: readField(source, 'FacebookUrl'),
    instagramHandle: readField(source, 'InstagramHandle'),
    facebookHandle: readField(source, 'FacebookHandle'),
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
  const [youtubeSocial, setYoutubeSocial] = useState<YoutubeSocial>(emptyYoutubeSocial)
  const [liveStats, setLiveStats] = useState<YoutubeLiveStats | null>(null)
  const [liveVideos, setLiveVideos] = useState<YoutubeLiveVideo[]>([])
  const [masterLogin, setMasterLogin] = useState<MasterLogin | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [isReady, setIsReady] = useState(false)
  const masterLoginRef = useRef<MasterLogin | null>(null)
  const liveLoadId = useRef(0)
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
    const nextSocial = parseYoutubeSocial(getValue(remoteConfig, 'youtube_social').asString())
    masterLoginRef.current = nextLogin
    setMasterLogin(nextLogin)
    setYoutubeSocial(nextSocial)
    return nextLogin
  }, [])

  const loadAll = useCallback(async () => {
    const { database } = getFirebase()
    const root = dbRef(database)
    const [workingSnap, educationSnap, portfolioSnap, youtubeSnap, contactSnap] = await withTimeout(
      Promise.all([
        get(child(root, 'WorkingExperience')),
        get(child(root, 'Education')),
        get(child(root, 'Portfolio')),
        get(child(root, 'YoutubeChannel')),
        get(child(root, 'Contact')),
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
    const youtubeChannel = parseYoutubeChannel(youtubeSnap.val())
    const contact = parseContact(contactSnap.val())
    setSnapshot({
      portfolios: resolved,
      education,
      workingExperience,
      youtubeChannel,
    })
    setAccountInfo(contact)
    setLiveStats(null)
    setLiveVideos([])
    setIsReady(true)
    const loadId = liveLoadId.current + 1
    liveLoadId.current = loadId
    void fetchYoutubeLive(youtubeChannel.handle, youtubeChannel.channelId).then((live) => {
      if (liveLoadId.current !== loadId) return
      setLiveStats(live?.stats ?? null)
      setLiveVideos(live?.videos ?? [])
    })
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
    setAccountInfo(null)
    setLiveStats(null)
    setLiveVideos([])
    liveLoadId.current += 1
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
      youtubeSocial,
      liveStats,
      liveVideos,
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
      youtubeSocial,
      liveStats,
      liveVideos,
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
