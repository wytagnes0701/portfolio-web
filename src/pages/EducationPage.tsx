import { EducationList } from '../components/sections'
import { PageWrap, SectionHeading } from '../components/ui'
import { usePortfolio } from '../data/PortfolioContext'
import { strings } from '../data/strings'

export function EducationPage() {
  const { snapshot } = usePortfolio()
  return (
    <PageWrap>
      <SectionHeading eyebrow={strings.eduEyebrow} title={strings.labelEducation} />
      <EducationList items={snapshot.education} />
    </PageWrap>
  )
}
