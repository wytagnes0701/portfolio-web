import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollOnRouteChange() {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const scrollToHash = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      if (document.getElementById(id)) {
        scrollToHash()
        return
      }
      const frame = window.requestAnimationFrame(scrollToHash)
      return () => window.cancelAnimationFrame(frame)
    }

    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
