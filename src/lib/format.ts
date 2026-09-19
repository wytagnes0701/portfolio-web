export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

/** `public/` files. Vite `base` is `/` locally and `/portfolio-web/` on GitHub Pages. */
export function publicUrl(path: string) {
  if (!path || /^(https?:|data:|blob:)/i.test(path)) return path
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${path.replace(/^\/+/, '')}`
}

export function mailTo(email: string, subject?: string, body?: string) {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const query = params.toString()
  return `mailto:${email}${query ? `?${query}` : ''}`
}

export function waTo(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}`
}

export function webUrl(url: string) {
  return url.startsWith('http') ? url : `https://${url}`
}

/** Firebase Console string fields are single-line. Typed `\\n` becomes a line break. */
export function decodeRtdbNewlines(value: string) {
  return value.replace(/\r\n/g, '\n').replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n')
}

export type HttpUrlMatch = {
  start: number
  endExclusive: number
  url: string
}

const TRAILING_URL_PUNCTUATION = /[.,;:!?)"']+$/

export function httpUrlMatches(text: string): HttpUrlMatch[] {
  const matches: HttpUrlMatch[] = []
  const pattern = /https?:\/\/[^\s<>"']+/gi
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0
    let url = match[0]
    url = url.replace(TRAILING_URL_PUNCTUATION, '')
    if (url.length <= 'http://x'.length) continue
    matches.push({ start, endExclusive: start + url.length, url })
  }
  return matches
}

export type TextPart = { text: string; href?: string }

export function splitHttpUrlParts(text: string): TextPart[] {
  const matches = httpUrlMatches(text)
  if (matches.length === 0) return [{ text }]
  const parts: TextPart[] = []
  let cursor = 0
  for (const match of matches) {
    if (cursor < match.start) parts.push({ text: text.slice(cursor, match.start) })
    parts.push({ text: text.slice(match.start, match.endExclusive), href: match.url })
    cursor = match.endExclusive
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) })
  return parts
}
