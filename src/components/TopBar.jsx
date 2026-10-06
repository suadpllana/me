import { navigate } from '../lib/router'
import { SECTIONS } from '../sections'
import { Icon } from './Icon'

export default function TopBar({ active, lastUrl }) {
  const go = (e, section) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    // Return to where the tab was left (e.g. /entertainment/books), not its root.
    navigate(lastUrl[section.key] ?? section.path)
  }

  return (
    <header className="topbar">
      <a className="brand" href="/" onClick={(e) => go(e, SECTIONS[0])} aria-label="Home">
        <span className="brand-mark" aria-hidden="true">Me</span>
        <span className="brand-name">Me</span>
      </a>
      <nav className="tabs" aria-label="Sections">
        {SECTIONS.map((s) => (
          <a
            key={s.key}
            href={s.path}
            className="tab"
            data-section={s.key}
            aria-current={active.key === s.key ? 'page' : undefined}
            onClick={(e) => go(e, s)}
          >
            <Icon name={s.key} />
            <span className="tab-label">{s.label}</span>
            <span className="tab-short">{s.short}</span>
          </a>
        ))}
      </nav>
    </header>
  )
}
