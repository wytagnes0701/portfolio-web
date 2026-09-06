import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Chip, EmptyState, MediaCard, MediaGrid, PageWrap, Pill, SectionHeading, Select } from '../components/ui'
import { usePortfolio } from '../data/PortfolioContext'
import { PROJECT_TYPES } from '../data/skills'
import { strings, YEAR_FILTERS } from '../data/strings'

export function ProjectsPage() {
  const navigate = useNavigate()
  const { snapshot } = usePortfolio()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [year, setYear] = useState('')
  const [typeId, setTypeId] = useState<number | ''>('')
  const [appliedYear, setAppliedYear] = useState('')
  const [appliedTypeId, setAppliedTypeId] = useState<number | ''>('')

  const projects = useMemo(() => {
    return snapshot.portfolios.filter((item) => {
      const matchesType = appliedTypeId === '' || item.typeID === appliedTypeId
      const matchesYear = !appliedYear || item.basicInfo.includes(appliedYear)
      return matchesType && matchesYear
    })
  }, [snapshot.portfolios, appliedTypeId, appliedYear])

  const typeLabel = PROJECT_TYPES.find((type) => type.id === appliedTypeId)?.label

  return (
    <PageWrap>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow={strings.workEyebrow} title={strings.labelProject} align="left" />
        <Pill variant="white" className="border border-ink/15" onClick={() => setFiltersOpen((value) => !value)}>
          {strings.labelFilter}
        </Pill>
      </div>

      {filtersOpen ? (
        <Card className="mb-8 grid gap-4 p-6 md:grid-cols-2">
          <Select value={year} onChange={(event) => setYear(event.target.value)}>
            <option value="">{strings.labelYear}</option>
            {YEAR_FILTERS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select value={typeId} onChange={(event) => setTypeId(event.target.value ? Number(event.target.value) : '')}>
            <option value="">{strings.labelProjectType}</option>
            {PROJECT_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </Select>
          <Pill
            variant="muted"
            onClick={() => {
              setYear('')
              setTypeId('')
              setAppliedYear('')
              setAppliedTypeId('')
            }}
          >
            {strings.buttonReset}
          </Pill>
          <Pill
            onClick={() => {
              setAppliedYear(year)
              setAppliedTypeId(typeId)
              setFiltersOpen(false)
            }}
          >
            {strings.buttonSearch}
          </Pill>
        </Card>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {appliedYear ? <Chip onRemove={() => setAppliedYear('')}>{appliedYear}</Chip> : null}
        {typeLabel ? <Chip onRemove={() => setAppliedTypeId('')}>{typeLabel}</Chip> : null}
      </div>

      {projects.length === 0 ? (
        <EmptyState label={strings.labelEmptyResult} />
      ) : (
        <MediaGrid>
          {projects.map((item) => (
            <MediaCard
              key={item.id}
              imageUrl={item.cover}
              title={item.title}
              subtitle={item.basicInfo}
              onClick={() => navigate(`/project/${item.id}`)}
            />
          ))}
        </MediaGrid>
      )}
    </PageWrap>
  )
}
