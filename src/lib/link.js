// Linking this browser to the two apps' sync documents. The codes live where
// the apps read them: Ascend's useLocalStorage keeps JSON ("solo-sync-key"),
// Vault keeps the raw string ("vault:sync:code").

const ASCEND_KEY = 'solo-sync-key'
const VAULT_KEY = 'vault:sync:code'
const CODE_RE = /^[a-z0-9][a-z0-9-]{7,63}$/

export const normalizeCode = (input) => {
  const code = String(input ?? '').trim().toLowerCase()
  return CODE_RE.test(code) ? code : null
}

export function getCodes() {
  let ascend = null
  try {
    ascend = normalizeCode(JSON.parse(localStorage.getItem(ASCEND_KEY)))
  } catch {
    // unreadable value: treat as not linked
  }
  return { ascend, vault: normalizeCode(localStorage.getItem(VAULT_KEY)) }
}

export function saveCodes({ ascend, vault }) {
  if (ascend) localStorage.setItem(ASCEND_KEY, JSON.stringify(ascend))
  if (vault) localStorage.setItem(VAULT_KEY, vault)
}

// Read-only look at what a code holds, so a typo isn't linked by mistake.
// Returns { found, summary } or throws on network errors.
export async function peek(app, code) {
  const res = await fetch(`/.netlify/functions/${app}-sync?key=${encodeURIComponent(code)}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const { data } = await res.json()
  if (data == null) return { found: false, summary: 'Nothing saved under this code yet' }
  if (app === 'vault') {
    const n = (data.items ?? []).length
    return { found: true, summary: `${n} item${n === 1 ? '' : 's'} in the library` }
  }
  const days = Object.values(data.completions ?? {}).filter((d) => Object.keys(d ?? {}).length)
  return { found: true, summary: `${days.length} active day${days.length === 1 ? '' : 's'} of progress` }
}

// A link that links another browser in one tap. The codes ride in the hash,
// which browsers never send to the server.
export function deviceLink({ ascend, vault }) {
  const parts = []
  if (ascend) parts.push(`a=${ascend}`)
  if (vault) parts.push(`v=${vault}`)
  return `${location.origin}/#link&${parts.join('&')}`
}

// Called once at startup: takes codes from a device link and cleans the URL.
export function consumeDeviceLink() {
  if (!location.hash.startsWith('#link&')) return
  const params = new URLSearchParams(location.hash.slice('#link&'.length))
  saveCodes({ ascend: normalizeCode(params.get('a')), vault: normalizeCode(params.get('v')) })
  history.replaceState(null, '', location.pathname + location.search)
}
