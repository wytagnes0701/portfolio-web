import { useState, type ReactNode } from 'react'
import type {
  EduItem,
  ExpItem,
  YoutubeChannel,
  YoutubeLiveStats,
  YoutubeSocial,
  YoutubeVideo,
} from '../data/types'
import { strings } from '../data/strings'
import {
  subscriberDisplay,
  videoCountDisplay,
  viewCountDisplay,
} from '../data/youtube'
import {
  Card,
  Overlay,
  Pill,
  Polaroid,
  StatRow,
  TagList,
  Tabs,
  TimelineCard,
  YoutubeEmbed,
} from './ui'

export function Notebook({ children }: { children: ReactNode }) {
  return (
    <section className="px-4 pb-8 pt-6 md:px-8 md:pt-10">
      <div className="notebook-page relative mx-auto max-w-6xl overflow-hidden px-6 py-20 text-center md:px-16 md:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <span className="absolute left-10 top-0 h-5 w-28 -rotate-6 bg-morandi-sage/80" />
          <span className="absolute right-16 top-2 h-4 w-24 rotate-8 bg-morandi-pink/80" />
          <span className="absolute left-1/3 top-3 h-3.5 w-20 rotate-[-3deg] bg-morandi-yellow/70" />
        </div>
        <div className="relative">{children}</div>
      </div>
    </section>
  )
}

export function AboutCard({ compact }: { compact?: boolean }) {
  return (
    <Card
      className={
        compact
          ? 'mx-auto grid max-w-3xl items-center gap-8 p-8 md:grid-cols-[200px_1fr] md:p-12'
          : 'grid items-center gap-10 p-8 md:grid-cols-[240px_1fr] md:p-12'
      }
    >
      {compact ? null : (
        <>
          <span className="washi-corner left-8 rotate-[-8deg] bg-morandi-sage" />
          <span className="washi-corner right-10 rotate-[7deg] bg-morandi-pink" />
        </>
      )}
      <Polaroid src="/images/about_me.jpg" caption={strings.polaroidCaption} large={!compact} />
      <p className="whitespace-pre-wrap leading-relaxed text-nav">{strings.about}</p>
    </Card>
  )
}

export function ExperiencePanel({ items }: { items: ExpItem[] }) {
  const [tab, setTab] = useState(0)
  const item = items[tab]
  return (
    <>
      <Tabs items={items.map((entry) => ({ id: entry.id, label: entry.category }))} value={tab} onChange={setTab} />
      {item ? (
        <TimelineCard
          when={item.year}
          titles={item.title}
          body={item.description}
          className="gap-6 md:grid-cols-[200px_1fr] md:p-10"
        />
      ) : (
        <p className="text-center text-nav">{strings.labelEmptyResult}</p>
      )}
    </>
  )
}

export function EducationList({ items }: { items: EduItem[] }) {
  return (
    <div className="space-y-6">
      {items.map((item) => (
        <TimelineCard key={item.id} when={item.year} titles={item.title} subtitle={item.subTitle} body={item.description} />
      ))}
    </div>
  )
}

export function ChannelCard({
  channel,
  social,
  liveStats,
  selectedTag,
  onSelectTag,
}: {
  channel: YoutubeChannel
  social: YoutubeSocial
  liveStats: YoutubeLiveStats | null
  selectedTag?: string | null
  onSelectTag?: (tag: string | null) => void
}) {
  const channelName = channel.channelName || strings.youtubeChannelName
  const handle = channel.handle || strings.youtubeChannelHandle
  return (
    <Card className="mb-12 p-8">
      <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
        <img
          src="/images/youtube_icon.png"
          alt={channel.creatorName || strings.youtubeCreatorName}
          className="h-16 w-16 rounded-full bg-white object-cover"
        />
        <div className="flex-1">
          <h3 className="font-heading text-2xl font-bold">{channelName}</h3>
          <p className="text-nav">{handle}</p>
          {channel.slogan ? <p className="mt-1 text-sm text-ink">{channel.slogan}</p> : null}
        </div>
        {social.channelUrl ? (
          <Pill href={social.channelUrl} variant="ghost">
            {strings.youtubeOpenChannel}
          </Pill>
        ) : null}
      </div>
      {channel.description ? (
        <p className="mt-4 whitespace-pre-wrap text-nav">{channel.description}</p>
      ) : null}
      <StatRow
        size="sm"
        items={[
          { value: subscriberDisplay(channel, liveStats), label: strings.youtubeStatSubscribers },
          { value: videoCountDisplay(channel, liveStats), label: strings.youtubeStatVideos },
          { value: viewCountDisplay(channel, liveStats), label: strings.youtubeStatViews },
          { value: channel.joinedDate, label: strings.youtubeStatJoined },
        ].filter((item) => Boolean(item.value))}
      />
      {channel.pillars.length > 0 ? (
        <div className="mt-6">
          <TagList tags={channel.pillars} prefix="" variant="pillar" />
        </div>
      ) : null}
      {channel.tags.length > 0 ? (
        <>
          <h3 className="mb-3 mt-8 text-center font-heading text-lg font-bold md:text-left">
            {strings.youtubeSectionTags}
          </h3>
          <TagList
            tags={channel.tags}
            selected={selectedTag}
            onSelect={onSelectTag}
            variant="price"
          />
        </>
      ) : null}
    </Card>
  )
}

export function VideoPlayer({ video, onClose }: { video: YoutubeVideo; onClose: () => void }) {
  return (
    <Overlay>
      <Card className="w-full max-w-2xl p-4">
        <p className="mb-3 line-clamp-2 font-heading">{video.title}</p>
        <YoutubeEmbed videoId={video.id} />
        <button type="button" className="mt-3 text-sm text-nav" onClick={onClose}>
          {strings.youtubeClosePlayer}
        </button>
      </Card>
    </Overlay>
  )
}
