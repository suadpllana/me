// The tabs of the shell. `app` is where the hosted app is served from (see
// netlify.toml and scripts/build.mjs); `path` is the shell URL for the tab.
// A hosted app's own route is mirrored after the tab path, so
// /entertainment/movies shows /app/vault/movies.
export const SECTIONS = [
  { key: 'home', path: '/', label: 'Home', short: 'Home' },
  {
    key: 'self',
    path: '/self-improvement',
    label: 'Self Improvement',
    short: 'Improve',
    app: '/app/ascend/',
    title: 'Ascend: self-improvement tracker',
    accent: 'var(--c-self)',
  },
  {
    key: 'media',
    path: '/entertainment',
    label: 'Entertainment',
    short: 'Media',
    app: '/app/vault/',
    title: 'Vault: entertainment tracker',
    accent: 'var(--c-media)',
  },
  {
    key: 'opinions',
    path: '/opinions',
    label: 'My Opinions',
    short: 'Opinions',
    app: '/app/opinions/',
    title: 'The Case Against God',
    accent: 'var(--c-opinions)',
  },
]

export function sectionForPath(pathname) {
  return (
    SECTIONS.find((s) => s.app && (pathname === s.path || pathname.startsWith(s.path + '/'))) ??
    SECTIONS[0]
  )
}

// Shell URL -> hosted app URL. "/entertainment/movies?x#y" -> "/app/vault/movies?x#y"
export function appUrlFor(section, { pathname, search, hash }) {
  const rest = pathname.slice(section.path.length).replace(/^\//, '')
  return section.app + rest + search + hash
}

// Hosted app URL -> shell URL. The inverse of appUrlFor.
export function shellUrlFor(section, { pathname, search, hash }) {
  const rest = pathname.startsWith(section.app) ? pathname.slice(section.app.length) : ''
  return section.path + (rest ? '/' + rest : '') + search + hash
}
