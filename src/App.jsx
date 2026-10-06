import { useEffect, useRef, useState } from 'react'
import TopBar from './components/TopBar'
import AppFrame from './components/AppFrame'
import Home from './pages/Home'
import { useLocation } from './lib/router'
import { getCodes } from './lib/link'
import { OpinionsNav, TopicPage } from './opinions/Opinions'
import { topicRoute } from './opinions/topics'
import { SECTIONS, appSrc, routeFromShell, sectionForPath } from './sections'

export default function App() {
  const loc = useLocation()
  const active = sectionForPath(loc.pathname)
  // My Opinions: a written topic (#/topic/...) or, when null, the Religion app.
  const topic = active.key === 'opinions' ? topicRoute(loc.hash) : null
  const showsApp = active.app && !topic

  // Each frame's src is fixed when it is first opened. Later URL changes come
  // from the frame itself (mirrored up), so changing src would only reload it.
  // opened: { [sectionKey]: route the frame was first opened at }
  const [opened, setOpened] = useState(() => {
    const initial = showsApp ? { [active.key]: routeFromShell(active, loc) } : {}
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
    if (showsApp && !(active.key in opened)) {
      setOpened((o) => ({ ...o, [active.key]: routeFromShell(active, loc) }))
    }
  }, [active, showsApp, loc, opened])

  // Remember where each tab was left so the tab bar returns there.
  const lastUrl = useRef({})
  lastUrl.current[active.key] = loc.pathname + loc.search + loc.hash
  const lastReligion = useRef('/opinions')
  if (active.key === 'opinions' && !topic) lastReligion.current = loc.pathname + loc.search + loc.hash

  useEffect(() => {
    document.title = active.app ? `${active.label} · Me` : 'Me'
    document.documentElement.dataset.section = active.key
  }, [active])

  return (
    <div className="shell">
      <TopBar active={active} lastUrl={lastUrl.current} />
      <main className="stage">
        {active.key === 'home' && <Home />}
        {active.key === 'opinions' && <OpinionsNav topic={topic} religionUrl={lastReligion.current} />}
        {topic && <TopicPage slug={topic.slug} postId={topic.postId} />}
        {SECTIONS.filter((s) => s.key in opened).map((s) => (
          <AppFrame
            key={s.key}
            section={s}
            src={appSrc(s, opened[s.key])}
            initialRoute={opened[s.key]}
            route={active.key === s.key && showsApp ? routeFromShell(s, loc) : undefined}
            active={active.key === s.key && showsApp}
            belowSubnav={s.key === 'opinions'}
          />
        ))}
      </main>
    </div>
  )
}
