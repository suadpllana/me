import { useEffect, useRef } from 'react'
import { navigate } from '../lib/router'
import { appPathFor, routeFromApp, shellUrl } from '../sections'

// Move a loaded frame to `route` the way the app's router expects.
function goTo(win, section, route) {
  if (section.router === 'hash') {
    win.location.hash = route || '/'
  } else {
    win.history.pushState(null, '', appPathFor(section, route))
    win.dispatchEvent(new PopStateEvent('popstate'))
  }
}

// Hosts one app in a same-origin frame. Frames stay mounted once opened, so
// switching tabs keeps each app's state (scroll, open pages) intact.
//
// The app's own route is mirrored into the shell URL's hash, which keeps deep
// links and refreshes working: /entertainment#/movies <-> /app/vault/movies.
export default function AppFrame({ section, src, initialRoute, route, active, belowSubnav }) {
  const ref = useRef(null)
  const activeRef = useRef(active)
  const startedRef = useRef(false)

  const mirror = () => {
    const win = ref.current?.contentWindow
    if (!win || !activeRef.current) return
    try {
      if (!win.location.pathname.startsWith(section.app)) return
      navigate(shellUrl(section, routeFromApp(section, win.location)), { replace: true })
    } catch {
      /* not same-origin: nothing to mirror */
    }
  }

  // The shell asked for a route the frame isn't showing (a link on the home
  // page, a tab returning to where it was left, the back button): follow it.
  // Routes that came from the frame itself already match, so this can't loop.
  useEffect(() => {
    activeRef.current = active
    const win = ref.current?.contentWindow
    if (!active || !startedRef.current || !win) return
    try {
      if (routeFromApp(section, win.location) !== route) goTo(win, section, route)
    } catch {
      /* not same-origin */
    }
  }, [active, route, section])

  const onLoad = () => {
    const win = ref.current?.contentWindow
    if (!win) return
    try {
      // A path-routed app is loaded at its root (a real file, no server
      // rewrite needed) and moved to the requested route on first load.
      if (!startedRef.current && section.router === 'path' && initialRoute) {
        win.history.replaceState(null, '', appPathFor(section, initialRoute))
        win.dispatchEvent(new PopStateEvent('popstate'))
      }
      startedRef.current = true

      // Report client-side navigations inside the app. Re-run on every load
      // (a full reload replaces the window).
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
      /* not same-origin */
    }
    mirror()
  }

  return (
    <iframe
      ref={ref}
      className={belowSubnav ? 'app-frame below-subnav' : 'app-frame'}
      src={src}
      title={section.title}
      onLoad={onLoad}
      hidden={!active}
      allow="fullscreen; autoplay; encrypted-media; picture-in-picture; clipboard-write"
      allowFullScreen
    />
  )
}
