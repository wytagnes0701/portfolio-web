import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TechoDialog } from '../components/Dialogs'
import { BackLink, LinkifiedLine, PageWrap, Pill, SkillIcon, Thumbnail, YoutubeEmbed } from '../components/ui'
import { usePortfolio } from '../data/portfolio-context'
import { SKILLS, skillsFromTagIndex } from '../data/skills'
import { strings } from '../data/strings'
import { publicUrl } from '../lib/format'

export function ProjectDetailPage() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { getProject, resolveGallery } = usePortfolio()
  const project = getProject(Number(itemId))
  const [images, setImages] = useState<string[]>([])
  const [showIcons, setShowIcons] = useState(false)
  const skills = useMemo(() => skillsFromTagIndex(project?.tagIndex ?? []), [project])

  useEffect(() => {
    if (!project) return
    void resolveGallery(project).then(setImages)
  }, [project, resolveGallery])

  if (!project) {
    return (
      <PageWrap>
        <p>{strings.labelEmptyResult}</p>
      </PageWrap>
    )
  }

  const cover = images[0] ?? project.cover

  return (
    <PageWrap>
      <BackLink onClick={() => navigate('/projects')}>← {strings.labelProject}</BackLink>
      <h1 className="font-heading text-4xl font-bold md:text-5xl">{project.title}</h1>
      <p className="mt-3 max-w-3xl text-ink/70">{project.basicInfo}</p>
      <div className="mt-4 flex gap-2">
        <Pill variant="white" onClick={() => navigate(`/gallery/${project.id}`)}>
          {strings.gallery}
        </Pill>
        <Pill variant="white" onClick={() => setShowIcons(true)}>
          {strings.info}
        </Pill>
      </div>
      {cover ? <img src={publicUrl(cover)} alt="" className="site-card mt-8 aspect-video w-full object-cover" /> : null}
      {project.description.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-heading text-2xl font-bold">{strings.descriptionTitle}</h2>
          <ul className="mt-3 space-y-1 text-ink/80">
            {project.description.map((line) => (
              <LinkifiedLine key={line} text={line} />
            ))}
          </ul>
        </section>
      ) : null}
      {skills.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {skills.map((skill) => (
            <SkillIcon key={skill.key} src={skill.icon} label={skill.label} />
          ))}
        </div>
      ) : null}
      {project.furtherInfo.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-heading text-2xl font-bold">{strings.furtherInfoTitle}</h2>
          <ul className="mt-3 space-y-1 text-ink/80">
            {project.furtherInfo.map((line) => (
              <LinkifiedLine key={line} text={line} />
            ))}
          </ul>
        </section>
      ) : null}
      <div className="mt-8 space-y-4">
        {project.vidURL.filter(Boolean).map((id) => (
          <YoutubeEmbed key={id} videoId={id} />
        ))}
      </div>
      {showIcons ? (
        <TechoDialog title={strings.iconList} confirmLabel={strings.cancel} onConfirm={() => setShowIcons(false)}>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {SKILLS.map((skill) => (
              <div key={skill.key} className="grid grid-cols-[40%_1fr] items-center gap-3">
                <SkillIcon src={skill.icon} />
                <span>{skill.label}</span>
              </div>
            ))}
          </div>
        </TechoDialog>
      ) : null}
    </PageWrap>
  )
}

export function GalleryPage() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { getProject, resolveGallery } = usePortfolio()
  const project = getProject(Number(itemId))
  const [images, setImages] = useState<string[]>([])
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (!project) return
    void resolveGallery(project).then(setImages)
  }, [project, resolveGallery])

  return (
    <PageWrap>
      <BackLink onClick={() => navigate(-1)}>← Back</BackLink>
      <h1 className="mb-8 font-heading text-4xl font-bold">{strings.gallery}</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {images.map((src) => (
          <Thumbnail key={src} src={src} onClick={() => setActive(src)} />
        ))}
      </div>
      {active ? (
        <TechoDialog title={strings.gallery} confirmLabel={strings.cancel} onConfirm={() => setActive(null)}>
          <img src={publicUrl(active)} alt="" className="aspect-video w-full object-contain" />
        </TechoDialog>
      ) : null}
    </PageWrap>
  )
}
