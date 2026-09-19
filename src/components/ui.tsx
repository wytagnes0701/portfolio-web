import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import type { ContactItem } from '../data/contacts'
import { cx, publicUrl } from '../lib/format'

function externalProps(href: string) {
  return href.startsWith('http') ? { target: '_blank' as const, rel: 'noreferrer' } : {}
}

export function PageWrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto max-w-6xl px-5 py-12 md:py-16', className)}>{children}</div>
}

export function Card({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'article' | 'form' | 'section'
}) {
  return <Tag className={cx('site-card', className)}>{children}</Tag>
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
  return <p className="mx-auto w-fit rounded-full bg-[#eceae6] px-4 py-1 text-sm text-nav">{children}</p>
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
      className={cx(
        'rounded-full px-4 py-2 text-sm shadow-sm',
        selected ? 'bg-gold-soft text-gold' : 'bg-white text-nav',
        className,
      )}
    >
      {children}
    </span>
  )
}

function tagClass(variant: 'pill' | 'pillar' | 'price', selected: boolean) {
  if (variant === 'pillar') return 'tag-pillar'
  if (variant === 'price') return cx('tag-price', selected && 'is-selected')
  return cx('rounded-full px-4 py-2 text-sm shadow-sm', selected ? 'bg-gold-soft text-gold' : 'bg-white text-nav')
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
          className={cx('rounded-full px-4 py-2 text-sm', value === index ? 'bg-gold text-white' : 'bg-white text-ink/70')}
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
        <p className="text-xs text-nav">{label}</p>
      </div>
    )
  }
  return (
    <div className="min-w-[110px] px-5">
      <p className="font-heading text-3xl font-bold md:text-4xl">{value}</p>
      <p className="mt-1 text-xs text-nav">{label}</p>
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

export function BackLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="mb-6 text-sm text-nav">
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
      <label className="mb-1 block text-sm text-nav">{label}</label>
      <div className="relative">
        <input
          {...inputProps}
          className={cx('w-full border-b border-nav bg-transparent py-2 outline-none', trailing ? 'pr-12' : '', className)}
        />
        {trailing ? <div className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-nav">{trailing}</div> : null}
      </div>
      {error ? <p className="mt-1 text-sm text-red-700">{error}</p> : null}
      {!error && hint ? <p className="mt-1 text-sm text-nav">{hint}</p> : null}
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
          <span className="block text-xs text-nav">{label}</span>
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
      <p className="flex items-center justify-center gap-2 text-xs text-nav">
        <ContactIcon src={icon} />
        {label}
      </p>
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
    <Card className={cx('p-6 md:p-8', className)}>
      <h3 className="text-center font-heading text-xl font-bold md:text-2xl">{title}</h3>
      {kicker ? <p className="mt-1 text-center font-heading text-lg">{kicker}</p> : null}
      {subtitle ? <p className="mt-2 text-center text-sm text-nav">{subtitle}</p> : null}
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
      <h2 className="mt-1 font-heading text-[30px] font-bold md:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-nav">{subtitle}</p> : null}
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
}: {
  id?: string
  eyebrow: string
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cx('scroll-mt-24', className)}>
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      {children}
    </section>
  )
}

export function CenterAction({ children }: { children: ReactNode }) {
  return <div className="mt-8 text-center">{children}</div>
}

export function YoutubeEmbed({ videoId }: { videoId: string }) {
  return (
    <iframe
      title={videoId}
      className="aspect-video w-full rounded-2xl"
      src={`https://www.youtube.com/embed/${videoId}`}
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
    <Card as="article" className={cx('grid gap-4 p-6 md:grid-cols-[180px_1fr] md:p-8', className)}>
      <div>
        {whenList.map((item) => (
          <p key={item} className="mb-2 text-sm font-medium text-nav">
            {item}
          </p>
        ))}
      </div>
      <div>
        {titleList.map((item) => (
          <h3 key={item} className="mb-2 font-heading text-2xl font-bold">
            {item}
          </h3>
        ))}
        {subtitle ? <p className="mt-1 text-sm">{subtitle}</p> : null}
        {body ? <p className="mt-3 whitespace-pre-wrap text-ink/80">{body}</p> : null}
      </div>
    </Card>
  )
}
