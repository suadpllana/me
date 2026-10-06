import { useEffect, useRef, useState } from 'react'
import TopBar from './components/TopBar'
import AppFrame from './components/AppFrame'
import Home from './pages/Home'
import { useLocation } from './lib/router'
import { SECTIONS, appUrlFor, sectionForPath } from './sections'

export default function App() {
  const loc = useLocation()
  const active = sectionForPath(loc.pathname)

  // Each frame's src is fixed when it is first opened. Later URL changes come
  // from the frame itself (mirrored up), so changing src would only reload it.
  const [opened, setOpened] = useState(() =>
    active.app ? { [active.key]: appUrlFor(active, loc) } : {},
  )
  useEffect(() => {
    if (active.app && !opened[active.key]) {
      setOpened((o) => ({ ...o, [active.key]: appUrlFor(active, loc) }))
    }
  }, [active, loc, opened])

  // Remember where each tab was left so the tab bar returns there.
  const lastUrl = useRef({})
  lastUrl.current[active.key] = loc.pathname + loc.search + loc.hash

  useEffect(() => {
    document.title = active.app ? `${active.label} · Suad Pllana` : 'Suad Pllana'
    document.documentElement.dataset.section = active.key
  }, [active])

  return (
    <div className="shell">
      <TopBar active={active} lastUrl={lastUrl.current} />
      <main className="stage">
        {active.key === 'home' && <Home />}
        {SECTIONS.filter((s) => opened[s.key]).map((s) => (
          <AppFrame key={s.key} section={s} src={opened[s.key]} active={active.key === s.key} />
        ))}
      </main>
    </div>
  )
}
