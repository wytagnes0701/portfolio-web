import { useState } from 'react'
import { ChannelCard, VideoPlayer } from '../components/sections'
import { ContactGroup, MediaCard, MediaGrid, PageWrap, SectionHeading } from '../components/ui'
import { youtuberContacts } from '../data/contacts'
import { strings } from '../data/strings'
import { YoutubeChannelContent, youtubeThumb, type YoutubeVideo } from '../data/youtube'

export function YoutubePage() {
  const [playing, setPlaying] = useState<YoutubeVideo | null>(null)
  const videos = YoutubeChannelContent.videos
  const social = youtuberContacts()
  const collab = social.filter((item) => item.label === strings.labelEmail)

  return (
    <PageWrap>
      <SectionHeading
        eyebrow={strings.youtubeEyebrow}
        title={strings.youtubeChannelName}
        subtitle={strings.channelsSubtitle}
      />
      <ChannelCard />

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
        subtitle={strings.youtubeCollabInvite}
        items={collab}
        variant="row"
      />

      {playing ? <VideoPlayer video={playing} onClose={() => setPlaying(null)} /> : null}
    </PageWrap>
  )
}
