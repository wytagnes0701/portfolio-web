import { EXPERIENCE_TABS } from './strings'
import type { ExpItem } from './types'

function dateKey(token: string): number {
  const value = token.trim().toLowerCase()
  if (!value) return 0
  if (/present|now|current|至今|現在/.test(value)) return 999912
  const monthYear = value.match(/(\d{1,2})\s*[/\-.]\s*(\d{4})/)
  if (monthYear) return Number(monthYear[2]) * 100 + Number(monthYear[1])
  const yearMonth = value.match(/(\d{4})\s*[/\-.]\s*(\d{1,2})/)
  if (yearMonth) return Number(yearMonth[1]) * 100 + Number(yearMonth[2])
  const year = value.match(/\d{4}/)
  if (year) return Number(year[0]) * 100 + 12
  return 0
}

export function periodSortKey(period: string): number {
  const parts = period.split(/\s*[-–—~]+\s*/)
  return Math.max(0, ...parts.map(dateKey))
}

function latestPeriodKey(item: ExpItem): number {
  if (item.year.length === 0) return 0
  return Math.max(...item.year.map(periodSortKey))
}

export function sortExperiencePeriods(item: ExpItem): ExpItem {
  const count = Math.max(item.year.length, item.title.length)
  const pairs = Array.from({ length: count }, (_, index) => ({
    year: item.year[index] ?? '',
    title: item.title[index] ?? '',
    key: periodSortKey(item.year[index] ?? item.title[index] ?? ''),
  }))
  pairs.sort((a, b) => b.key - a.key)
  return {
    ...item,
    year: pairs.map((pair) => pair.year).filter(Boolean),
    title: pairs.map((pair) => pair.title).filter(Boolean),
  }
}

export function sortWorkingExperience(items: ExpItem[]): ExpItem[] {
  const byId = [...items].sort((a, b) => b.id - a.id)
  const labeled = byId.map((item, index) =>
    sortExperiencePeriods({
      ...item,
      category: EXPERIENCE_TABS[index] ?? item.title[0] ?? 'role',
    }),
  )
  return labeled.sort((a, b) => latestPeriodKey(b) - latestPeriodKey(a) || b.id - a.id)
}
