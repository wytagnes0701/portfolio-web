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
import { publicUrl } from '../lib/format'
import {
  Card,
  Copy,
  Heading,
  Overlay,
  Pill,
  Polaroid,
  StatRow,
  TagList,
  Tabs,
  TextButton,
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
      pad={compact ? undefined : 'xl'}
      className={
        compact
          ? 'mx-auto grid max-w-3xl items-center gap-8 p-8 md:grid-cols-[200px_1fr] md:p-12'
          : 'grid items-center gap-10 md:grid-cols-[240px_1fr]'
      }
    >
      {compact ? null : (
        <>
          <span className="washi-corner left-8 rotate-[-8deg] bg-morandi-sage" />
          <span className="washi-corner right-10 rotate-[7deg] bg-morandi-pink" />
        </>
      )}
      <Polaroid src="/images/about_me.jpg" caption={strings.polaroidCaption} large={!compact} />
      <Copy variant="body" className="whitespace-pre-wrap">{strings.about}</Copy>
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
        <Copy className="text-center" variant="nav">{strings.labelEmptyResult}</Copy>
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
          src={publicUrl('/images/youtube_icon.png')}
          alt={channel.creatorName || strings.youtubeCreatorName}
          className="h-16 w-16 rounded-full bg-white object-cover"
        />
        <div className="flex-1">
          <Heading as="h3" size="title">{channelName}</Heading>
          <Copy variant="nav">{handle}</Copy>
          {channel.slogan ? <p className="mt-1 text-sm text-ink">{channel.slogan}</p> : null}
        </div>
        {social.channelUrl ? (
          <Pill href={social.channelUrl} variant="ghost">
            {strings.youtubeOpenChannel}
          </Pill>
        ) : null}
      </div>
      {channel.description ? (
        <Copy variant="nav" className="mt-4 whitespace-pre-wrap">{channel.description}</Copy>
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
          <Heading as="h3" size="sub" className="mb-3 mt-8 text-center md:text-left">
            {strings.youtubeSectionTags}
          </Heading>
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
      <Card pad="sm" className="w-full max-w-2xl">
        <p className="mb-3 line-clamp-2 font-heading">{video.title}</p>
        <YoutubeEmbed videoId={video.id} />
        <TextButton className="mt-3 font-normal" onClick={onClose}>
          {strings.youtubeClosePlayer}
        </TextButton>
      </Card>
    </Overlay>
  )
}
