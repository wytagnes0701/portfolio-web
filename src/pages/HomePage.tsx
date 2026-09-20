import { useNavigate } from 'react-router-dom'
import { AboutCard, ChannelCard, EducationList, ExperiencePanel, Notebook } from '../components/sections'
import {
  Badge,
  CenterAction,
  ContactGroup,
  Copy,
  Heading,
  MediaCard,
  MediaGrid,
  PageWrap,
  Pill,
  Section,
  StatRow,
  TwoCol,
} from '../components/ui'
import { developerContacts, youtuberContacts } from '../data/contacts'
import { usePortfolio } from '../data/portfolio-context'
import { strings } from '../data/strings'
import { videosFor, youtubeThumb } from '../data/youtube'

export function HomePage() {
  const navigate = useNavigate()
  const { snapshot, accountInfo, youtubeSocial, liveStats, liveVideos } = usePortfolio()
  const channel = snapshot.youtubeChannel
  const latestVideos = videosFor(channel, liveVideos, null).slice(0, 6)

  return (
    <div>
      <Notebook>
        <Badge>{strings.heroBadge}</Badge>
        <Heading as="h1" size="hero" className="mt-8">
          {strings.heroHello} <span className="text-gold">{strings.heroName}</span>
        </Heading>
        <Copy variant="lede" className="mx-auto mt-6 max-w-xl">{strings.heroTagline}</Copy>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Pill to="/home#work">{strings.ctaWork}</Pill>
          <Pill to="/home#experience" variant="ghost">
            {strings.ctaExperience}
          </Pill>
          <Pill to="/home#education" variant="ghost">
            {strings.ctaEducation}
          </Pill>
          <Pill to="/home#videos" variant="soft">
            {strings.ctaChannel}
          </Pill>
        </div>
        <StatRow
          items={[
            { value: `${snapshot.portfolios.length}+`, label: strings.statProjects },
            { value: `${snapshot.workingExperience.length}`, label: strings.statExperience },
            { value: `${snapshot.education.length}`, label: strings.statEducation },
          ]}
        />
      </Notebook>

      <PageWrap>
        <Section id="about" eyebrow={strings.aboutEyebrow} title={strings.labelAbout}>
          <AboutCard />
        </Section>

        <Section id="work" spaced eyebrow={strings.workEyebrow} title={strings.labelPortfolio}>
          <MediaGrid>
            {snapshot.portfolios.slice(0, 6).map((item) => (
              <MediaCard
                key={item.id}
                imageUrl={item.cover}
                title={item.title}
                subtitle={item.basicInfo}
                onClick={() => navigate(`/project/${item.id}`)}
              />
            ))}
          </MediaGrid>
          <CenterAction>
            <Pill to="/projects" variant="ghost">
              {strings.viewAllWork}
            </Pill>
          </CenterAction>
        </Section>

        <Section id="experience" spaced eyebrow={strings.expEyebrow} title={strings.labelWorkingExp}>
          <ExperiencePanel items={snapshot.workingExperience} />
          <CenterAction>
            <Pill to="/experience" variant="ghost">
              {strings.labelWorkingExp}
            </Pill>
          </CenterAction>
        </Section>

        <Section id="education" spaced eyebrow={strings.eduEyebrow} title={strings.labelEducation}>
          <EducationList items={snapshot.education} />
          <CenterAction>
            <Pill to="/education" variant="ghost">
              {strings.labelEducation}
            </Pill>
          </CenterAction>
        </Section>

        <Section
          id="videos"
          spaced
          eyebrow={strings.youtubeEyebrow}
          title={channel.channelName || strings.youtubeChannelName}
          subtitle={channel.slogan || strings.channelsSubtitle}
        >
          <ChannelCard channel={channel} social={youtubeSocial} liveStats={liveStats} />
          <Section eyebrow="featured videos" title={strings.featuredVideos}>
            {latestVideos.length === 0 ? (
              <Copy variant="empty">{strings.youtubeEmptyVideos}</Copy>
            ) : (
              <MediaGrid tight>
                {latestVideos.map((video) => (
                  <MediaCard
                    key={video.id}
                    imageUrl={youtubeThumb(video.id)}
                    title={video.title}
                    onClick={() => navigate('/youtube')}
                  />
                ))}
              </MediaGrid>
            )}
          </Section>
          <CenterAction>
            <Pill to="/youtube" variant="ghost">
              {strings.youtubeMore}
            </Pill>
          </CenterAction>
        </Section>

        <Section id="contact" spaced eyebrow={strings.contactEyebrow} title={strings.labelContact}>
          <TwoCol>
            <ContactGroup
              title={strings.contactDeveloper}
              subtitle={strings.developerInvite}
              items={developerContacts(accountInfo)}
            />
            <ContactGroup
              title={strings.contactYoutuber}
              kicker={channel.channelName || strings.youtubeChannelName}
              subtitle={strings.youtubeSocialInvite}
              items={youtuberContacts(channel, youtubeSocial)}
            />
          </TwoCol>
        </Section>
      </PageWrap>
    </div>
  )
}
