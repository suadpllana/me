import { useEffect, useState } from 'react'

// A tiny history router: the shell only has four top-level tabs, the hosted
// apps do their own routing inside their frames.
const EVENT = 'me:navigate'

function current() {
  const { pathname, search, hash } = window.location
  return { pathname, search, hash }
}

export function navigate(url, { replace = false } = {}) {
  const here = window.location.pathname + window.location.search + window.location.hash
  if (url === here) return
  window.history[replace ? 'replaceState' : 'pushState'](null, '', url)
  window.dispatchEvent(new Event(EVENT))
}

export function useLocation() {
  const [loc, setLoc] = useState(current)
  useEffect(() => {
    const update = () => setLoc(current())
    window.addEventListener('popstate', update)
    window.addEventListener(EVENT, update)
    return () => {
      window.removeEventListener('popstate', update)
      window.removeEventListener(EVENT, update)
    }
  }, [])
  return loc
}
