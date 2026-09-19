import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { strings } from '../data/strings'
import { publicUrl } from '../lib/format'

const links = [
  { to: '/home#about', label: strings.labelAbout },
  { to: '/home#work', label: strings.labelPortfolio },
  { to: '/home#experience', label: strings.labelWorkingExp },
  { to: '/home#education', label: strings.labelEducation },
  { to: '/home#videos', label: strings.labelYoutube },
  { to: '/home#contact', label: strings.labelContact },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header className="sticky top-0 z-30 bg-paper/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="flex shrink-0 items-center gap-2.5"
        >
          <img src={publicUrl('/images/about_me.jpg')} alt="" className="h-8 w-8 rounded-full object-cover" />
          <span className="font-heading text-lg font-medium">{strings.brandName}</span>
        </button>
        <nav className="hidden items-center gap-x-5 lg:flex">
          {links.map((link) => {
            const active = location.pathname + location.hash === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`whitespace-nowrap text-sm ${active ? 'text-ink' : 'text-nav hover:text-ink'}`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
        <button
          type="button"
          className="rounded-full border border-nav/20 px-3 py-2 text-sm lg:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
      </div>
      {open ? (
        <nav className="flex flex-col gap-1 px-5 pb-4 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2 text-nav"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  )
}

export function SiteFooter({
  onLogout,
  email,
}: {
  onLogout: () => void
  email: string
}) {
  return (
    <footer className="py-12 text-center text-sm text-nav">
      <p>{strings.footerCopy}</p>
      <p className="mt-1">{strings.footerFrom}</p>
      {email ? <p className="mt-3 text-xs">{email}</p> : null}
      <button type="button" onClick={onLogout} className="mt-3 text-xs underline">
        {strings.labelLogout}
      </button>
    </footer>
  )
}
