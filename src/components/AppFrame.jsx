import { useEffect, useRef } from 'react'
import { navigate } from '../lib/router'
import { shellUrlFor } from '../sections'

// Hosts one app in a same-origin frame. Frames stay mounted once opened, so
// switching tabs keeps each app's state (scroll, open pages) intact.
//
// The app's own route is mirrored into the shell URL, which keeps deep links
// and refreshes working: /entertainment/movies <-> /app/vault/movies.
export default function AppFrame({ section, src, active }) {
  const ref = useRef(null)
  const activeRef = useRef(active)

  const mirror = () => {
    const win = ref.current?.contentWindow
    if (!win || !activeRef.current) return
    let loc
    try {
      loc = win.location
      if (!loc.pathname.startsWith(section.app)) return
    } catch {
      return // not same-origin (should not happen)
    }
    navigate(shellUrlFor(section, loc), { replace: true })
  }

  useEffect(() => {
    activeRef.current = active
    if (active) mirror()
  })

  // Patch the frame's history so client-side navigations inside the app are
  // reported back. Re-run on every load (a full reload replaces the window).
  const onLoad = () => {
    const win = ref.current?.contentWindow
    if (!win) return
    try {
      for (const method of ['pushState', 'replaceState']) {
        const original = win.history[method]
        win.history[method] = function (...args) {
          const result = original.apply(this, args)
          mirror()
          return result
        }
      }
      win.addEventListener('popstate', mirror)
      win.addEventListener('hashchange', mirror)
    } catch {
      /* cross-origin frame: nothing to mirror */
    }
    mirror()
  }

  return (
    <iframe
      ref={ref}
      className="app-frame"
      src={src}
      title={section.title}
      onLoad={onLoad}
      hidden={!active}
      allow="fullscreen; autoplay; encrypted-media; picture-in-picture; clipboard-write"
      allowFullScreen
    />
  )
}
