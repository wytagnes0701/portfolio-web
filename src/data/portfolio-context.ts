import { createContext, useContext } from 'react'
import type {
  MasterAccountInfo,
  MasterLogin,
  PortfolioItem,
  PortfolioSnapshot,
  YoutubeLiveStats,
  YoutubeLiveVideo,
  YoutubeSocial,
} from './types'

export type PortfolioContextValue = {
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

export const PortfolioContext = createContext<PortfolioContextValue | null>(null)

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolio must be used inside PortfolioProvider')
  }
  return context
}
