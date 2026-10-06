import { useEffect, useState } from 'react'

// Read-only peeks at the hosted apps' data. Everything is served from one
// origin, so the shell can read the same localStorage the apps write.

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : (JSON.parse(raw) ?? fallback)
  } catch {
    return fallback
  }
}

const pad = (n) => String(n).padStart(2, '0')
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Ascend's goal date (see apps/ascend: "clear every quest before 1 July 2027").
const ASCEND_DEADLINE = new Date(2027, 6, 1)

function ascendSnapshot() {
  // { "YYYY-MM-DD": { [taskId]: snapshot } }
  const completions = readJson('solo-completions', {})
  const perDay = Object.fromEntries(
    Object.entries(completions).map(([day, tasks]) => [day, Object.keys(tasks ?? {}).length]),
  )
  const total = Object.values(perDay).reduce((a, b) => a + b, 0)
  const activeDays = Object.values(perDay).filter((n) => n > 0).length

  const today = new Date()
  // A streak still counts if today has nothing yet but yesterday does.
  let streak = 0
  const d = new Date(today)
  if (!perDay[dayKey(d)]) d.setDate(d.getDate() - 1)
  while (perDay[dayKey(d)]) {
    streak++
    d.setDate(d.getDate() - 1)
  }

  const daysLeft = Math.max(0, Math.floor((ASCEND_DEADLINE - today) / 86_400_000))
  return {
    hasData: total > 0 || Object.keys(readJson('solo-progress', {})).length > 0,
    linked: Boolean(readJson('solo-sync-key', null)),
    total,
    activeDays,
    today: perDay[dayKey(today)] ?? 0,
    streak,
    daysLeft,
  }
}

const VAULT_WORLDS = [
  ['movie', 'Movies'],
  ['tv', 'TV'],
  ['anime', 'Anime'],
  ['book', 'Books'],
  ['game', 'Games'],
  ['documentary', 'Docs'],
  ['youtube', 'YouTube'],
]

function vaultSnapshot() {
  const items = readJson('vault:library', [])
  const list = Array.isArray(items) ? items : []
  const byWorld = VAULT_WORLDS.map(([key, label]) => ({
    key,
    label,
    count: list.filter((i) => i?.category === key).length,
  })).filter((w) => w.count > 0)
  return {
    hasData: list.length > 0,
    linked: Boolean(localStorage.getItem('vault:sync:code')),
    total: list.length,
    finished: list.filter((i) => i?.status === 'completed').length,
    inProgress: list.filter((i) => i?.status === 'in_progress').length,
    byWorld,
  }
}

function read() {
  return { ascend: ascendSnapshot(), vault: vaultSnapshot() }
}

// Re-reads when a hosted app writes (the storage event fires in the shell for
// writes made inside its same-origin frames) and when the tab regains focus.
export function useSnapshot() {
  const [snap, setSnap] = useState(read)
  useEffect(() => {
    const update = () => setSnap(read())
    window.addEventListener('storage', update)
    window.addEventListener('focus', update)
    return () => {
      window.removeEventListener('storage', update)
      window.removeEventListener('focus', update)
    }
  }, [])
  return snap
}
