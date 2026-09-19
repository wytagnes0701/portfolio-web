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
