import type {
  YoutubeChannel,
  YoutubeLiveData,
  YoutubeLiveStats,
  YoutubeLiveVideo,
  YoutubeSocial,
  YoutubeVideo,
} from './types'

export type { YoutubeVideo }

export const emptyYoutubeChannel: YoutubeChannel = {
  handle: '',
  channelId: '',
  subscriberCount: '',
  videoCount: '',
  viewCount: '',
  joinedDate: '',
  creatorName: '',
  creatorBio: '',
  channelName: '',
  slogan: '',
  description: '',
  collabInvite: '',
  collabEmail: '',
  pillars: [],
  tags: [],
  videos: [],
}

export const emptyYoutubeSocial: YoutubeSocial = {
  channelUrl: '',
  instagramUrl: '',
  facebookUrl: '',
  instagramHandle: '',
  facebookHandle: '',
}

const CHANNELS_URL = 'https://www.googleapis.com/youtube/v3/channels'
const PLAYLIST_ITEMS_URL = 'https://www.googleapis.com/youtube/v3/playlistItems'
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos'
const MAX_RESULTS = 50
const TIMEOUT_MS = 10_000
const YOUTUBE_SHORTS_MAX_SECONDS = 180
const HIDDEN_TITLES = new Set(['Private video', 'Deleted video'])

export function youtubeThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

export function formatCount(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

export function subscriberDisplay(channel: YoutubeChannel, live: YoutubeLiveStats | null) {
  if (live && !live.subscribersHidden && live.subscriberCount != null) {
    return formatCount(live.subscriberCount)
  }
  return channel.subscriberCount
}

export function videoCountDisplay(channel: YoutubeChannel, live: YoutubeLiveStats | null) {
  return live?.videoCount != null ? formatCount(live.videoCount) : channel.videoCount
}

export function viewCountDisplay(channel: YoutubeChannel, live: YoutubeLiveStats | null) {
  return live?.viewCount != null ? formatCount(live.viewCount) : channel.viewCount
}

export function videosFor(
  channel: YoutubeChannel,
  liveVideos: YoutubeLiveVideo[],
  tag: string | null,
): YoutubeVideo[] {
  const tagsById = new Map(channel.videos.map((video) => [video.id, video.tags]))
  const source =
    liveVideos.length === 0
      ? channel.videos
      : liveVideos.map((live) => ({
          id: live.id,
          title: live.title,
          tags: tagsById.get(live.id) ?? [],
        }))
  return source.filter((video) => tag == null || video.tags.includes(tag))
}

export function youtubeDurationSeconds(iso8601: string | null | undefined): number | null {
  if (!iso8601?.trim()) return null
  try {
    const match = iso8601.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/)
    if (!match) return null
    const days = Number(match[1] ?? 0)
    const hours = Number(match[2] ?? 0)
    const minutes = Number(match[3] ?? 0)
    const seconds = Number(match[4] ?? 0)
    return days * 86400 + hours * 3600 + minutes * 60 + Math.floor(seconds)
  } catch {
    return null
  }
}

export function isYoutubeShort(durationSeconds: number | null | undefined) {
  return durationSeconds != null && durationSeconds >= 1 && durationSeconds <= YOUTUBE_SHORTS_MAX_SECONDS
}

export async function fetchYoutubeLive(
  handle: string,
  channelId: string | null | undefined,
): Promise<YoutubeLiveData | null> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY?.trim() ?? ''
  if (!apiKey) return null
  const lookup = channelId?.trim()
    ? `id=${encodeURIComponent(channelId.trim())}`
    : handle.replace(/^@/, '').trim()
      ? `forHandle=${encodeURIComponent(handle.replace(/^@/, '').trim())}`
      : null
  if (!lookup) return null
  try {
    return await loadLive(lookup, apiKey)
  } catch {
    return null
  }
}

async function loadLive(lookup: string, apiKey: string): Promise<YoutubeLiveData | null> {
  const channelUrl = `${CHANNELS_URL}?part=statistics,contentDetails&${lookup}&key=${encodeURIComponent(apiKey)}`
  const payload = await getJson<ChannelsResponse>(channelUrl)
  const item = payload?.items?.[0]
  if (!item) return null
  const statistics = item.statistics
  const stats: YoutubeLiveStats = statistics
    ? {
        subscriberCount: toCount(statistics.subscriberCount),
        videoCount: toCount(statistics.videoCount),
        viewCount: toCount(statistics.viewCount),
        subscribersHidden: Boolean(statistics.hiddenSubscriberCount),
        channelId: item.id ?? null,
      }
    : {
        subscriberCount: null,
        videoCount: null,
        viewCount: null,
        subscribersHidden: false,
        channelId: item.id ?? null,
      }
  const uploadsId = item.contentDetails?.relatedPlaylists?.uploads?.trim()
  const videos = uploadsId ? await loadUploads(uploadsId, apiKey).catch(() => []) : []
  return { stats, videos }
}

async function loadUploads(playlistId: string, apiKey: string): Promise<YoutubeLiveVideo[]> {
  const url =
    `${PLAYLIST_ITEMS_URL}?part=snippet,contentDetails` +
    `&playlistId=${encodeURIComponent(playlistId)}&maxResults=${MAX_RESULTS}&key=${encodeURIComponent(apiKey)}`
  const payload = await getJson<PlaylistItemsResponse>(url)
  const videos = (payload?.items ?? [])
    .map((item) => {
      const id = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId || ''
      const title = item.snippet?.title ?? ''
      if (!id || HIDDEN_TITLES.has(title)) return null
      return { id, title }
    })
    .filter((video): video is YoutubeLiveVideo => video != null)
  try {
    return await dropShorts(videos, apiKey)
  } catch {
    return videos
  }
}

async function dropShorts(videos: YoutubeLiveVideo[], apiKey: string): Promise<YoutubeLiveVideo[]> {
  if (videos.length === 0) return videos
  const ids = videos.map((video) => video.id).join(',')
  const url = `${VIDEOS_URL}?part=contentDetails&id=${ids}&maxResults=${MAX_RESULTS}&key=${encodeURIComponent(apiKey)}`
  const payload = await getJson<VideosResponse>(url)
  if (!payload) return videos
  const durationById = new Map(
    (payload.items ?? [])
      .filter((item): item is VideoItem & { id: string } => Boolean(item.id))
      .map((item) => [item.id, youtubeDurationSeconds(item.contentDetails?.duration)] as const),
  )
  return videos.filter((video) => !isYoutubeShort(durationById.get(video.id) ?? null))
}

async function getJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
  }
}

function toCount(value: string | undefined) {
  if (!value) return null
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

type ChannelsResponse = {
  items?: Array<{
    id?: string
    statistics?: {
      subscriberCount?: string
      videoCount?: string
      viewCount?: string
      hiddenSubscriberCount?: boolean
    }
    contentDetails?: { relatedPlaylists?: { uploads?: string } }
  }>
}

type PlaylistItemsResponse = {
  items?: Array<{
    snippet?: { title?: string; resourceId?: { videoId?: string } }
    contentDetails?: { videoId?: string }
  }>
}

type VideoItem = {
  id?: string
  contentDetails?: { duration?: string }
}

type VideosResponse = {
  items?: VideoItem[]
}
