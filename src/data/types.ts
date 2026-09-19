export type PortfolioItem = {
  id: number
  title: string
  basicInfo: string
  description: string[]
  furtherInfo: string[]
  cover: string | null
  imgURL: string[]
  tagIndex: number[]
  vidURL: string[]
  typeID: number | null
}

export type ExpItem = {
  id: number
  year: string[]
  title: string[]
  description: string
  category: string
}

export type EduItem = {
  id: number
  year: string
  title: string
  subTitle: string
  description: string
}

export type MasterLogin = {
  email: string
  password: string
  passCode: string
}

export type MasterAccountInfo = {
  whatsApp: string
  email: string
  linkedIn: string
  web: string
}

export type YoutubeVideo = {
  id: string
  title: string
  tags: string[]
}

export type YoutubeChannel = {
  handle: string
  channelId: string
  subscriberCount: string
  videoCount: string
  viewCount: string
  joinedDate: string
  creatorName: string
  creatorBio: string
  channelName: string
  slogan: string
  description: string
  collabInvite: string
  collabEmail: string
  pillars: string[]
  tags: string[]
  videos: YoutubeVideo[]
}

export type YoutubeSocial = {
  channelUrl: string
  instagramUrl: string
  facebookUrl: string
  instagramHandle: string
  facebookHandle: string
}

export type YoutubeLiveStats = {
  subscriberCount: number | null
  videoCount: number | null
  viewCount: number | null
  subscribersHidden: boolean
  channelId: string | null
}

export type YoutubeLiveVideo = {
  id: string
  title: string
}

export type YoutubeLiveData = {
  stats: YoutubeLiveStats | null
  videos: YoutubeLiveVideo[]
}

export type PortfolioSnapshot = {
  portfolios: PortfolioItem[]
  education: EduItem[]
  workingExperience: ExpItem[]
  youtubeChannel: YoutubeChannel
}
