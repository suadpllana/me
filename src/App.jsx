import { useEffect, useRef, useState } from 'react'
import TopBar from './components/TopBar'
import AppFrame from './components/AppFrame'
import Home from './pages/Home'
import { useLocation } from './lib/router'
import { getCodes } from './lib/link'
import { SECTIONS, appSrc, routeFromShell, sectionForPath } from './sections'

export default function App() {
  const loc = useLocation()
  const active = sectionForPath(loc.pathname)

  // Each frame's src is fixed when it is first opened. Later URL changes come
  // from the frame itself (mirrored up), so changing src would only reload it.
  // opened: { [sectionKey]: route the frame was first opened at }
  const [opened, setOpened] = useState(() => {
    const initial = active.app ? { [active.key]: routeFromShell(active, loc) } : {}
    // Linked apps load in the background so they sync right away and the home
    // page numbers stay current without opening each tab.
    const codes = getCodes()
    const linked = { self: codes.ascend, media: codes.vault }
    for (const s of SECTIONS) {
      if (linked[s.key] && !(s.key in initial)) initial[s.key] = ''
    }
    return initial
  })
  useEffect(() => {
    if (active.app && !(active.key in opened)) {
      setOpened((o) => ({ ...o, [active.key]: routeFromShell(active, loc) }))
    }
  }, [active, loc, opened])

  // Remember where each tab was left so the tab bar returns there.
  const lastUrl = useRef({})
  lastUrl.current[active.key] = loc.pathname + loc.search + loc.hash

  useEffect(() => {
    document.title = active.app ? `${active.label} · Me` : 'Me'
    document.documentElement.dataset.section = active.key
  }, [active])

  return (
    <div className="shell">
      <TopBar active={active} lastUrl={lastUrl.current} />
      <main className="stage">
        {active.key === 'home' && <Home />}
        {SECTIONS.filter((s) => s.key in opened).map((s) => (
          <AppFrame
            key={s.key}
            section={s}
            src={appSrc(s, opened[s.key])}
            initialRoute={opened[s.key]}
            route={active.key === s.key ? routeFromShell(s, loc) : undefined}
            active={active.key === s.key}
          />
        ))}
      </main>
    </div>
  )
}
