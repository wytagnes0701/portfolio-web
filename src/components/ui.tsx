import { useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type PointerEvent, type ReactNode, type SelectHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import type { ContactItem } from '../data/contacts'
import { cx, publicUrl, splitHttpUrlParts } from '../lib/format'

function externalProps(href: string) {
  return href.startsWith('http') ? { target: '_blank' as const, rel: 'noreferrer' } : {}
}

export function PageWrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto max-w-6xl px-5 py-12 md:py-16', className)}>{children}</div>
}

export function Card({
  children,
  className,
  pad,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  pad?: 'sm' | 'md' | 'lg' | 'xl'
  as?: 'div' | 'article' | 'form' | 'section'
}) {
  const pads = {
    sm: 'p-4',
    md: 'card-pad',
    lg: 'p-8 md:p-10',
    xl: 'p-8 md:p-12',
  } as const
  return <Tag className={cx('site-card', pad && pads[pad], className)}>{children}</Tag>
}

const headingClass = {
  hero: 'heading-hero',
  page: 'heading-page',
  section: 'heading-section',
  card: 'heading-card',
  title: 'heading-title',
  project: 'heading-project',
  dialog: 'heading-dialog',
  sub: 'heading-sub',
  brand: 'heading-brand',
  stat: 'heading-stat',
} as const

export function Heading({
  as: Tag = 'h2',
  size = 'section',
  className,
  children,
}: {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  size?: keyof typeof headingClass
  className?: string
  children: ReactNode
}) {
  return <Tag className={cx(headingClass[size], className)}>{children}</Tag>
}

const copyClass = {
  muted: 'copy-muted',
  caption: 'copy-caption',
  body: 'copy-body',
  lede: 'copy-lede',
  sm: 'copy-sm',
  soft: 'copy-soft',
  empty: 'copy-empty',
  label: 'copy-label',
  error: 'copy-error',
  nav: 'text-nav',
} as const

export function Copy({
  as: Tag = 'p',
  variant = 'muted',
  className,
  children,
}: {
  as?: 'p' | 'span' | 'div' | 'label' | 'li' | 'h2'
  variant?: keyof typeof copyClass
  className?: string
  children?: ReactNode
}) {
  return <Tag className={cx(copyClass[variant], className)}>{children}</Tag>
}

export function TextButton({ className, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cx('btn-text', className)} {...props} />
}

export function TechoButton({ className, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cx('btn-techo', className)} {...props} />
}

export function InkButton({ className, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cx('btn-ink', className)} {...props} />
}

export function IconButton({
  label,
  className,
  type = 'button',
  ...props
}: { label: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} aria-label={label} className={cx('btn-icon', className)} {...props} />
}

export function CopyList({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cx('list-copy', className)}>{children}</ul>
}

export function TwoCol({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('grid-2', className)}>{children}</div>
}

const pillClass = {
  solid: 'pill-btn bg-gold text-white',
  ghost: 'pill-btn border border-nav/40 bg-transparent text-nav',
  soft: 'pill-btn bg-gold-soft text-gold',
  white: 'pill-btn bg-white',
  muted: 'pill-btn bg-techo-blue text-ink',
} as const

export function Pill({
  to,
  href,
  children,
  variant = 'solid',
  className,
  ...buttonProps
}: {
  to?: string
  href?: string
  children: ReactNode
  variant?: keyof typeof pillClass
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = cx(pillClass[variant], className)
  if (href) {
    return (
      <a href={href} className={classes} {...externalProps(href)}>
        {children}
      </a>
    )
  }
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }
  return (
    <button type={buttonProps.type ?? 'button'} className={classes} {...buttonProps}>
      {children}
    </button>
  )
}

export function Badge({ children }: { children: ReactNode }) {
  return <p className="badge">{children}</p>
}

export function Tag({
  children,
  className,
  selected,
}: {
  children: ReactNode
  className?: string
  selected?: boolean
}) {
  return (
    <span
      className={cx('tag-pill', selected && 'is-selected', className)}
    >
      {children}
    </span>
  )
}

function tagClass(variant: 'pill' | 'pillar' | 'price', selected: boolean) {
  if (variant === 'pillar') return 'tag-pillar'
  if (variant === 'price') return cx('tag-price', selected && 'is-selected')
  return cx('tag-pill', selected && 'is-selected')
}

export function TagList({
  tags,
  prefix = '#',
  selected,
  onSelect,
  variant = 'pill',
}: {
  tags: string[]
  prefix?: string
  selected?: string | null
  onSelect?: (tag: string | null) => void
  variant?: 'pill' | 'pillar' | 'price'
}) {
  return (
    <div
      className={cx(
        'flex flex-wrap justify-center md:justify-start',
        variant === 'price' ? 'gap-x-3 gap-y-2' : 'gap-2',
      )}
    >
      {tags.map((tag) =>
        onSelect ? (
          <button
            key={tag}
            type="button"
            className={tagClass(variant, selected === tag)}
            onClick={() => onSelect(selected === tag ? null : tag)}
          >
            {prefix}
            {tag}
          </button>
        ) : (
          <span key={tag} className={tagClass(variant, false)}>
            {prefix}
            {tag}
          </span>
        ),
      )}
    </div>
  )
}

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: { id: string | number; label: string }[]
  value: number
  onChange: (index: number) => void
}) {
  return (
    <div className="mb-8 flex flex-wrap justify-center gap-2">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(index)}
          className={cx('tab-btn', value === index && 'is-active')}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function Stat({ value, label, size = 'lg' }: { value: string; label: string; size?: 'lg' | 'sm' }) {
  if (size === 'sm') {
    return (
      <div className="rounded-xl bg-[#f4efe6] px-3 py-3 text-center">
        <p className="font-heading font-bold">{value}</p>
        <Copy variant="caption">{label}</Copy>
      </div>
    )
  }
  return (
    <div className="min-w-[110px] px-5">
      <Heading as="p" size="stat">{value}</Heading>
      <Copy variant="caption" className="mt-1">{label}</Copy>
    </div>
  )
}

export function StatRow({
  items,
  size = 'lg',
}: {
  items: { value: string; label: string }[]
  size?: 'lg' | 'sm'
}) {
  if (size === 'sm') {
    return (
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item) => (
          <Stat key={item.label} {...item} size="sm" />
        ))}
      </div>
    )
  }
  return (
    <div className="stat-split mx-auto mt-12 flex max-w-lg justify-center">
      {items.map((item) => (
        <Stat key={item.label} {...item} />
      ))}
    </div>
  )
}

export function Polaroid({ src, caption, large }: { src: string; caption?: string; large?: boolean }) {
  return (
    <div className="text-center">
      <div className="mx-auto w-fit rotate-[-2deg] bg-white p-3 shadow-md">
        <img src={publicUrl(src)} alt="" className={large ? 'h-52 w-52 object-cover' : 'h-44 w-44 object-cover'} />
      </div>
      {caption ? <p className="eyebrow mt-3">{caption}</p> : null}
    </div>
  )
}

export function Overlay({ children }: { children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">{children}</div>
}

export function BackLink({
  onClick,
  children,
  className,
}: {
  onClick: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button type="button" onClick={onClick} className={cx('copy-muted mb-6', className)}>
      {children}
    </button>
  )
}

export function Field({
  label,
  hint,
  error,
  trailing,
  className,
  ...inputProps
}: {
  label: string
  hint?: string
  error?: string
  trailing?: ReactNode
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-4">
      <Copy as="label" className="mb-1 block">{label}</Copy>
      <div className="relative">
        <input
          {...inputProps}
          className={cx('w-full border-b border-nav bg-transparent py-2 outline-none', trailing ? 'pr-12' : '', className)}
        />
        {trailing ? <div className="absolute right-0 top-1/2 -translate-y-1/2 copy-muted">{trailing}</div> : null}
      </div>
      {error ? <Copy variant="error" className="mt-1">{error}</Copy> : null}
      {!error && hint ? <Copy className="mt-1">{hint}</Copy> : null}
    </div>
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx('rounded-xl border border-ink/15 bg-transparent px-3 py-2', props.className)} />
}

export function ContactIcon({ src, className }: { src?: string; className?: string }) {
  if (!src) return null
  return <img src={publicUrl(src)} alt="" className={cx('h-5 w-5 shrink-0 object-contain', className)} />
}

export function SettingsRow({ icon, label, value, href, onClick }: ContactItem) {
  const body = (
    <>
      <ContactIcon src={icon} className="h-6 w-6" />
      {value ? (
        <span className="min-w-0 flex-1">
          <Copy as="span" variant="caption" className="block">{label}</Copy>
          <span className="block truncate text-ink">{value}</span>
        </span>
      ) : (
        <span className="text-ink">{label}</span>
      )}
    </>
  )
  const className = 'flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left hover:bg-white/60'
  if (href) {
    return (
      <a href={href} className={className} {...externalProps(href)}>
        {body}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  )
}

export function ContactLine({
  icon,
  label,
  value,
  href,
}: {
  icon?: string
  label: string
  value?: string
  href?: string
}) {
  if (!value) return null
  const body = (
    <>
      <Copy variant="caption" className="flex items-center justify-center gap-2">
        <ContactIcon src={icon} />
        {label}
      </Copy>
      <p className="mt-1 break-all font-heading text-gold">{value}</p>
    </>
  )
  const className = 'block rounded-xl bg-[#f4efe6] px-4 py-3 text-center'
  if (!href) return <div className={className}>{body}</div>
  return (
    <a href={href} className={className} {...externalProps(href)}>
      {body}
    </a>
  )
}

export function ContactGroup({
  title,
  kicker,
  subtitle,
  items,
  variant = 'line',
  className,
}: {
  title: string
  kicker?: string
  subtitle?: string
  items: ContactItem[]
  variant?: 'line' | 'row'
  className?: string
}) {
  return (
    <Card pad="md" className={className}>
      <Heading as="h3" size="card" className="text-center">{title}</Heading>
      {kicker ? <p className="mt-1 text-center font-heading text-lg">{kicker}</p> : null}
      {subtitle ? <Copy className="mt-2 text-center">{subtitle}</Copy> : null}
      <div className={variant === 'line' ? 'mt-6 space-y-3' : 'mt-4'}>
        {items.map((item) =>
          variant === 'line' ? (
            <ContactLine
              key={item.label + (item.value ?? '')}
              icon={item.icon}
              label={item.label}
              value={item.value}
              href={item.href}
            />
          ) : (
            <SettingsRow key={item.label + (item.value ?? '')} {...item} />
          ),
        )}
      </div>
    </Card>
  )
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-16">
      <img src={publicUrl('/images/empty_state.png')} alt="" className="h-40 w-40 object-contain" />
      <p className="mt-4 text-xl">{label}</p>
    </div>
  )
}

export function Chip({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <button type="button" className="rounded-full bg-techo-purple/25 px-3 py-1 text-sm" onClick={onRemove}>
      {children} ×
    </button>
  )
}

export function MediaCard({
  imageUrl,
  title,
  subtitle,
  onClick,
}: {
  imageUrl?: string | null
  title: string
  subtitle?: string
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="group relative overflow-hidden rounded-2xl text-left">
      <img
        src={publicUrl(imageUrl || '/images/empty_state.png')}
        alt=""
        className="aspect-video w-full object-cover transition duration-300 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-white/80">{subtitle}</p> : null}
      </div>
    </button>
  )
}

export function MediaGrid({ children, tight }: { children: ReactNode; tight?: boolean }) {
  return <div className={cx('grid sm:grid-cols-2 lg:grid-cols-3', tight ? 'gap-5' : 'gap-6')}>{children}</div>
}

export function CoverPager({
  images,
  fallback,
  className,
}: {
  images: string[]
  fallback?: string | null
  className?: string
}) {
  const urls = useMemo(() => {
    const resolved = images.filter(Boolean)
    return resolved.length > 0 ? resolved : fallback ? [fallback] : []
  }, [images, fallback])
  const [page, setPage] = useState(0)
  const dragStartX = useRef<number | null>(null)
  const currentPage = urls.length === 0 ? 0 : page % urls.length

  useEffect(() => {
    if (urls.length <= 1) return
    const timer = window.setInterval(() => {
      setPage((current) => (current + 1) % urls.length)
    }, 2000)
    return () => window.clearInterval(timer)
  }, [urls.length, currentPage])

  if (urls.length === 0) return null

  const goBy = (delta: number) => {
    setPage((current) => (current + delta + urls.length) % urls.length)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (urls.length <= 1) return
    dragStartX.current = event.clientX
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current == null || urls.length <= 1) return
    const delta = event.clientX - dragStartX.current
    dragStartX.current = null
    if (Math.abs(delta) < 40) return
    goBy(delta < 0 ? 1 : -1)
  }

  return (
    <div
      className={cx('site-card overflow-hidden', className)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        dragStartX.current = null
      }}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{
            width: `${urls.length * 100}%`,
            transform: `translateX(-${currentPage * (100 / urls.length)}%)`,
          }}
        >
          {urls.map((src) => (
            <img
              key={src}
              src={publicUrl(src)}
              alt=""
              draggable={false}
              className="h-full object-cover"
              style={{ width: `${100 / urls.length}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function Thumbnail({ src, onClick }: { src: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="site-card aspect-square overflow-hidden">
      <img src={publicUrl(src)} alt="" className="h-full w-full object-cover" />
    </button>
  )
}

export function SkillIcon({ src, label }: { src: string; label?: string }) {
  return <img src={publicUrl(src)} alt={label ?? ''} className="h-6 w-6 shrink-0 object-contain" />
}

export function LinkifiedLine({ text }: { text: string }) {
  const parts = splitHttpUrlParts(text)
  return (
    <li>
      -{' '}
      {parts.map((part, index) =>
        part.href ? (
          <a
            key={`${part.href}-${index}`}
            href={part.href}
            target="_blank"
            rel="noreferrer"
            className="text-gold underline underline-offset-2 hover:text-washi-coral"
          >
            {part.text}
          </a>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </li>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
}) {
  return (
    <div className={align === 'center' ? 'mb-10 text-center' : 'mb-8'}>
      <p className="eyebrow">{eyebrow}</p>
      <Heading className="mt-1">{title}</Heading>
      {subtitle ? <Copy className="mt-2">{subtitle}</Copy> : null}
    </div>
  )
}

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className,
  spaced,
}: {
  id?: string
  eyebrow: string
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  spaced?: boolean
}) {
  return (
    <section id={id} className={cx('scroll-mt-24', spaced && 'mt-24', className)}>
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      {children}
    </section>
  )
}

export function CenterAction({ children }: { children: ReactNode }) {
  return <div className="mt-8 text-center">{children}</div>
}

function youtubeId(value: string) {
  const trimmed = value.trim()
  const fromQuery = trimmed.match(/[?&]v=([\w-]{6,})/)
  if (fromQuery) return fromQuery[1]
  const fromShort = trimmed.match(/youtu\.be\/([\w-]{6,})/)
  if (fromShort) return fromShort[1]
  const fromEmbed = trimmed.match(/embed\/([\w-]{6,})/)
  if (fromEmbed) return fromEmbed[1]
  return trimmed
}

export function YoutubeEmbed({ videoId, className }: { videoId: string; className?: string }) {
  const id = youtubeId(videoId)
  return (
    <iframe
      title={id}
      className={cx('aspect-video w-full bg-ink', className ?? 'rounded-2xl')}
      src={`https://www.youtube.com/embed/${id}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

export function TimelineCard({
  when,
  titles,
  subtitle,
  body,
  className,
}: {
  when: string | string[]
  titles: string | string[]
  subtitle?: string
  body?: string
  className?: string
}) {
  const whenList = Array.isArray(when) ? when : [when]
  const titleList = Array.isArray(titles) ? titles : [titles]
  return (
    <Card as="article" pad="md" className={cx('grid gap-4 md:grid-cols-[180px_1fr]', className)}>
      <div>
        {whenList.map((item) => (
          <Copy key={item} className="mb-2 font-medium">
            {item}
          </Copy>
        ))}
      </div>
      <div>
        {titleList.map((item) => (
          <Heading as="h3" size="title" key={item} className="mb-2">
            {item}
          </Heading>
        ))}
        {subtitle ? <p className="mt-1 text-sm">{subtitle}</p> : null}
        {body ? <p className="mt-3 whitespace-pre-wrap text-ink/80">{body}</p> : null}
      </div>
    </Card>
  )
}
