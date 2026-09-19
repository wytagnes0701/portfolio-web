import { useNavigate } from 'react-router-dom'
import { AboutCard, ChannelCard, EducationList, ExperiencePanel, Notebook } from '../components/sections'
import {
  Badge,
  CenterAction,
  ContactGroup,
  MediaCard,
  MediaGrid,
  PageWrap,
  Pill,
  Section,
  StatRow,
} from '../components/ui'
import { developerContacts, youtuberContacts } from '../data/contacts'
import { usePortfolio } from '../data/PortfolioContext'
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
        <h1 className="mt-8 font-heading text-4xl font-bold leading-tight md:text-[60px]">
          {strings.heroHello} <span className="text-gold">{strings.heroName}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-nav md:text-lg">{strings.heroTagline}</p>
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

        <Section id="work" className="mt-24" eyebrow={strings.workEyebrow} title={strings.labelPortfolio}>
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

        <Section id="experience" className="mt-24" eyebrow={strings.expEyebrow} title={strings.labelWorkingExp}>
          <ExperiencePanel items={snapshot.workingExperience} />
          <CenterAction>
            <Pill to="/experience" variant="ghost">
              {strings.labelWorkingExp}
            </Pill>
          </CenterAction>
        </Section>

        <Section id="education" className="mt-24" eyebrow={strings.eduEyebrow} title={strings.labelEducation}>
          <EducationList items={snapshot.education} />
          <CenterAction>
            <Pill to="/education" variant="ghost">
              {strings.labelEducation}
            </Pill>
          </CenterAction>
        </Section>

        <Section
          id="videos"
          className="mt-24"
          eyebrow={strings.youtubeEyebrow}
          title={channel.channelName || strings.youtubeChannelName}
          subtitle={channel.slogan || strings.channelsSubtitle}
        >
          <ChannelCard channel={channel} social={youtubeSocial} liveStats={liveStats} />
          <Section eyebrow="featured videos" title={strings.featuredVideos}>
            {latestVideos.length === 0 ? (
              <p className="py-6 text-center text-nav">{strings.youtubeEmptyVideos}</p>
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

        <Section id="contact" className="mt-24" eyebrow={strings.contactEyebrow} title={strings.labelContact}>
          <div className="grid gap-6 md:grid-cols-2">
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
          </div>
        </Section>
      </PageWrap>
    </div>
  )
}
