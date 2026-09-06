import { ExperiencePanel } from '../components/sections'
import { PageWrap, SectionHeading } from '../components/ui'
import { usePortfolio } from '../data/PortfolioContext'
import { strings } from '../data/strings'

export function ExperiencePage() {
  const { snapshot } = usePortfolio()
  return (
    <PageWrap>
      <SectionHeading eyebrow={strings.expEyebrow} title={strings.labelWorkingExp} />
      <ExperiencePanel items={snapshot.workingExperience} />
    </PageWrap>
  )
}
