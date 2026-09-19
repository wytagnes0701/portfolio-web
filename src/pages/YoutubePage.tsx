import { useState } from 'react'
import { ChannelCard, VideoPlayer } from '../components/sections'
import { ContactGroup, MediaCard, MediaGrid, PageWrap, SectionHeading } from '../components/ui'
import { youtubeCollabContacts, youtuberSocialContacts } from '../data/contacts'
import { usePortfolio } from '../data/PortfolioContext'
import { strings } from '../data/strings'
import { videosFor, youtubeThumb, type YoutubeVideo } from '../data/youtube'

export function YoutubePage() {
  const { snapshot, accountInfo, youtubeSocial, liveStats, liveVideos } = usePortfolio()
  const channel = snapshot.youtubeChannel
  const [playing, setPlaying] = useState<YoutubeVideo | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const videos = videosFor(channel, liveVideos, selectedTag)
  const social = youtuberSocialContacts(channel, youtubeSocial)
  const collab = youtubeCollabContacts(channel, accountInfo)

  return (
    <PageWrap>
      <SectionHeading
        eyebrow={strings.youtubeEyebrow}
        title={channel.channelName || strings.youtubeChannelName}
        subtitle={channel.slogan || strings.channelsSubtitle}
      />
      <ChannelCard
        channel={channel}
        social={youtubeSocial}
        liveStats={liveStats}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
      />

      <h3 className="mb-6 text-center font-heading text-2xl font-bold">{strings.featuredVideos}</h3>
      {videos.length === 0 ? (
        <p className="py-6 text-center text-nav">{strings.youtubeEmptyVideos}</p>
      ) : (
        <MediaGrid tight>
          {videos.map((video) => (
            <MediaCard
              key={video.id}
              imageUrl={youtubeThumb(video.id)}
              title={video.title}
              onClick={() => setPlaying(video)}
            />
          ))}
        </MediaGrid>
      )}

      <ContactGroup
        className="mx-auto mt-12 max-w-2xl text-center"
        title={strings.youtubeSectionSocial}
        subtitle={strings.youtubeSocialInvite}
        items={social}
        variant="row"
      />
      <ContactGroup
        className="mx-auto mt-6 max-w-2xl text-center"
        title={strings.youtubeSectionCollab}
        subtitle={channel.collabInvite || strings.youtubeCollabInvite}
        items={collab}
        variant="row"
      />

      {playing ? <VideoPlayer video={playing} onClose={() => setPlaying(null)} /> : null}
    </PageWrap>
  )
}
