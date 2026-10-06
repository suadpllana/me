// The tabs of the shell. `app` is where the hosted app is served from (see
// scripts/build.mjs); `path` is the shell URL for the tab.
//
// The hosted app's own route travels in the shell URL's hash, e.g.
// /entertainment#/movies shows /app/vault/movies and /self-improvement#/stats
// shows /app/ascend/#/stats. Keeping it in the hash means every shell URL maps
// to a real file, so deep links and refreshes work without server rewrites.
// `router` says how the app routes: 'hash' (HashRouter) or 'path' (BrowserRouter).
export const SECTIONS = [
  { key: 'home', path: '/', label: 'Home', short: 'Home' },
  {
    key: 'self',
    path: '/self-improvement',
    label: 'Self Improvement',
    short: 'Improve',
    app: '/app/ascend/',
    router: 'hash',
    title: 'Ascend: self-improvement tracker',
    accent: 'var(--c-self)',
  },
  {
    key: 'media',
    path: '/entertainment',
    label: 'Entertainment',
    short: 'Media',
    app: '/app/vault/',
    router: 'path',
    title: 'Vault: entertainment tracker',
    accent: 'var(--c-media)',
  },
  {
    key: 'opinions',
    path: '/opinions',
    label: 'My Opinions',
    short: 'Opinions',
    app: '/app/opinions/',
    router: 'hash',
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

// The app route ("/movies", "/stats", "" for the app's home) in a shell URL.
// Also accepts the path form /entertainment/movies (used by older links).
export function routeFromShell(section, { pathname, search, hash }) {
  if (hash.length > 1) return normalize(hash.slice(1))
  const rest = pathname.slice(section.path.length).replace(/^\/+/, '')
  return rest ? normalize('/' + rest + search) : ''
}

// The app route a hosted app's frame is currently showing.
export function routeFromApp(section, { pathname, search, hash }) {
  if (section.router === 'hash') return normalize(hash.slice(1))
  const rest = pathname.startsWith(section.app) ? pathname.slice(section.app.length) : ''
  return normalize('/' + rest + search + hash)
}

export const shellUrl = (section, route) => section.path + (route ? '#' + route : '')

// URL that loads the app showing `route`. Path-routed apps always load their
// root (a real file) and are moved to the route after load, see AppFrame.
export function appSrc(section, route) {
  if (section.router === 'hash') return section.app + (route ? '#' + route : '')
  return section.app
}

export const appPathFor = (section, route) => section.app + route.replace(/^\//, '')

const normalize = (route) => (route === '/' ? '' : route)
