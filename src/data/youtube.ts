export type YoutubeVideo = {
  id: string
  title: string
  tags: string[]
}

export const YoutubeTags = {
  CHUBU: '日本中部',
  KANTO: '日本關東',
  ITINERARY: '行程規劃',
  STAY: '住宿評測',
  TRANSIT: '交通攻略',
  BUDGET: '旅費分析',
  ONSEN: '溫泉',
  DISNEY: 'DisneySea',
  KOYO: '紅葉',
} as const

export const youtubeTagList = Object.values(YoutubeTags)

export const youtubePillars = [
  YoutubeTags.ITINERARY,
  YoutubeTags.STAY,
  YoutubeTags.TRANSIT,
  YoutubeTags.BUDGET,
]

export const YoutubeChannelContent = {
  channelUrl: 'https://www.youtube.com/@TING.CHANNEL.777',
  instagramUrl: 'https://www.instagram.com/ting.channel.777_official/',
  facebookUrl: 'https://www.facebook.com/share/1AxyLo7h22',
  instagramHandle: 'ting.channel.777_official',
  facebookHandle: '乾物女-Ting-',
  collabEmail: 'ting.channel.777@gmail.com',
  subscriberCount: '50',
  videoCount: '8',
  viewCount: '3,689',
  joinedDate: '2025年8月3日',
  videos: [
    {
      id: 'lZl6zjNq4As',
      title:
        '【日本中部】名古屋機場進市區交通＆犬山一日遊｜住宿分享、旅費公開、交通安排｜EP.1',
      tags: [
        YoutubeTags.CHUBU,
        YoutubeTags.ITINERARY,
        YoutubeTags.STAY,
        YoutubeTags.TRANSIT,
        YoutubeTags.BUDGET,
      ],
    },
    {
      id: '4s4aEiSa8rE',
      title:
        '【日本關東】Disney Sea一日玩10+項目！「地陪」到底值不值得買？｜鎌倉＋迪士尼海洋攻略｜Ep.2',
      tags: [YoutubeTags.KANTO, YoutubeTags.ITINERARY, YoutubeTags.STAY, YoutubeTags.DISNEY],
    },
    {
      id: 'uJRaMK8SKBI',
      title:
        '【關東紅葉】追到人生首個日出紅富士！河口湖、山中湖多個富士山絕景｜紅葉季自駕遊｜Ep.1',
      tags: [YoutubeTags.KANTO, YoutubeTags.ITINERARY, YoutubeTags.STAY, YoutubeTags.KOYO],
    },
  ] as YoutubeVideo[],
}

export function youtubeThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}
