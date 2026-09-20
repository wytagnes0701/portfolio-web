import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TechoDialog } from '../components/Dialogs'
import { BackLink, Copy, CopyList, CoverPager, Heading, IconButton, InkButton, LinkifiedLine, PageWrap, SkillIcon, Thumbnail, YoutubeEmbed } from '../components/ui'
import { usePortfolio } from '../data/portfolio-context'
import { SKILLS, skillsFromTagIndex } from '../data/skills'
import { strings } from '../data/strings'
import { publicUrl } from '../lib/format'

function displayBasicInfo(text: string) {
  return text.replace(/\s+(?=(Date:|Position involved:|Keywords:))/g, '\n').trim()
}

function splitParagraphs(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function ProjectDetailPage() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { getProject, resolveGallery } = usePortfolio()
  const project = getProject(Number(itemId))
  const [images, setImages] = useState<string[]>([])
  const [showIcons, setShowIcons] = useState(false)
  const skills = useMemo(() => skillsFromTagIndex(project?.tagIndex ?? []), [project])
  const videos = useMemo(() => project?.vidURL.filter(Boolean) ?? [], [project])

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

  const descriptionText = project.description.join('\n').trim()
  const showDescription = descriptionText.length > 0 && descriptionText !== project.basicInfo.trim()
  const videoParagraphs = [
    ...splitParagraphs(project.basicInfo),
    ...(showDescription ? project.description.map((line) => line.trim()).filter(Boolean) : []),
  ]

  const backButton = (className: string) => (
    <InkButton onClick={() => navigate('/projects')} className={className}>
      {strings.labelBack}
    </InkButton>
  )

  const skillsRow =
    skills.length > 0 ? (
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {skills.map((skill) => (
          <SkillIcon key={skill.key} src={skill.icon} label={skill.label} />
        ))}
      </div>
    ) : null

  const furtherInfo =
    project.furtherInfo.length > 0 ? (
      <section className="mt-8">
        <Copy as="h2" variant="label">{strings.furtherInfoTitle}</Copy>
        <CopyList>
          {project.furtherInfo.map((line) => (
            <LinkifiedLine key={line} text={line} />
          ))}
        </CopyList>
      </section>
    ) : null

  const copy = videos.length > 0 ? (
    <div>
      <Heading as="h1" size="project">{project.title}</Heading>
      {videoParagraphs.length > 0 ? (
        <div className="mt-4 space-y-3">
          {videoParagraphs.map((line) => (
            <Copy key={line} variant="sm">
              {line}
            </Copy>
          ))}
        </div>
      ) : null}
      {skillsRow}
      {furtherInfo}
      {backButton('mt-8 hidden lg:inline-flex')}
    </div>
  ) : (
    <div>
      <Heading as="h1" size="project">{project.title}</Heading>
      {project.basicInfo ? (
        <Copy variant="sm" className="mt-4 whitespace-pre-wrap">{displayBasicInfo(project.basicInfo)}</Copy>
      ) : null}
      {showDescription ? (
        <section className="mt-8">
          <Copy as="h2" variant="label">{strings.descriptionTitle}</Copy>
          <CopyList>
            {project.description.map((line) => (
              <LinkifiedLine key={line} text={line} />
            ))}
          </CopyList>
        </section>
      ) : null}
      {skillsRow}
      {furtherInfo}
      {backButton('mt-8')}
    </div>
  )

  const leadVideo = videos[0]
  const moreVideos = videos.slice(1)
  const media =
    leadVideo != null ? (
      <YoutubeEmbed videoId={leadVideo} className="rounded-sm" />
    ) : (
      <CoverPager key={project.id} images={images} fallback={project.cover} />
    )
  const restVideos =
    moreVideos.length > 0 ? (
      <div className="space-y-6">
        {moreVideos.map((id) => (
          <YoutubeEmbed key={id} videoId={id} className="rounded-sm" />
        ))}
      </div>
    ) : null

  return (
    <PageWrap className="py-6 lg:py-12">
      <div className={videos.length > 0 ? 'mx-auto max-w-[980px]' : undefined}>
        <div className="mb-4 flex justify-end gap-1">
          <IconButton
            label={strings.gallery}
            onClick={() => navigate(`/gallery/${project.id}`)}
          >
            <img src={publicUrl('/icons/icon_gallery.svg')} alt="" className="icon-mono" />
          </IconButton>
          <IconButton
            label={strings.info}
            onClick={() => setShowIcons(true)}
          >
            <img src={publicUrl('/icons/icon_info.svg')} alt="" className="icon-mono" />
          </IconButton>
        </div>
        <ProjectSplit
          hasVideo={videos.length > 0}
          media={media}
          copy={copy}
          rest={restVideos}
          mobileBack={
            videos.length > 0
              ? backButton('mt-2 lg:hidden')
              : null
          }
        />
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

function ProjectSplit({
  hasVideo,
  media,
  copy,
  rest,
  mobileBack,
}: {
  hasVideo: boolean
  media: ReactNode
  copy: ReactNode
  rest?: ReactNode
  mobileBack?: ReactNode
}) {
  return (
    <div
      className={
        hasVideo
          ? 'grid items-start gap-6 lg:grid-cols-[minmax(0,600px)_minmax(16rem,340px)] lg:gap-x-8 lg:gap-y-6'
          : 'grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(20rem,24rem)] lg:gap-12'
      }
    >
      <div>{media}</div>
      <div>{copy}</div>
      {rest ? <div className="lg:col-start-1">{rest}</div> : null}
      {mobileBack ? <div>{mobileBack}</div> : null}
    </div>
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
      <Heading as="h1" size="page" className="mb-8">{strings.gallery}</Heading>
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
