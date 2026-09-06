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

export type PortfolioSnapshot = {
  portfolios: PortfolioItem[]
  education: EduItem[]
  workingExperience: ExpItem[]
}
