import { useState } from 'react'
import { Icon } from './Icon'
import { deviceLink, getCodes, normalizeCode, peek, saveCodes } from '../lib/link'

const APPS = [
  {
    key: 'ascend',
    section: 'self',
    label: 'Self Improvement',
    where: (
      <>
        On <a href="https://ascendpath.netlify.app/" target="_blank" rel="noreferrer">ascendpath.netlify.app</a>,
        tap <b>Sync</b> (the cloud icon) and copy your code.
      </>
    ),
  },
  {
    key: 'vault',
    section: 'media',
    label: 'Entertainment',
    where: (
      <>
        On{' '}
        <a href="https://all-in-one-media.netlify.app/account" target="_blank" rel="noreferrer">
          all-in-one-media.netlify.app/account
        </a>
        , under <b>Device sync</b>, copy your code.
      </>
    ),
  },
]

// One form that links both apps to their sync codes, after a read-only check
// of what each code holds. Linked apps then keep syncing in the background.
export default function LinkData() {
  const [saved, setSaved] = useState(getCodes)
  const [input, setInput] = useState(saved)
  const [checks, setChecks] = useState({}) // { [app]: { found, summary } | { error } }
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const allLinked = saved.ascend && saved.vault
  const editing = !allLinked || input.ascend !== saved.ascend || input.vault !== saved.vault

  const link = async (e) => {
    e.preventDefault()
    setBusy(true)
    const next = {}
    const results = {}
    for (const app of APPS) {
      const raw = input[app.key]
      if (!raw) continue
      const code = normalizeCode(raw)
      if (!code) {
        results[app.key] = { error: 'Codes look like abcd-efgh-jkmn' }
        continue
      }
      try {
        results[app.key] = await peek(app.key, code)
        if (results[app.key].found) next[app.key] = code
      } catch {
        results[app.key] = { error: 'Could not reach sync. Try again.' }
      }
    }
    setChecks(results)
    setBusy(false)
    if (Object.keys(next).length) {
      saveCodes(next)
      setSaved(getCodes())
      // Reload so both apps start with the new codes and pull the saved data.
      setTimeout(() => location.reload(), 900)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(deviceLink(saved))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt('Copy this link:', deviceLink(saved))
    }
  }

  return (
    <section className="data" aria-labelledby="data-title">
      <div className="data-intro">
        <h2 id="data-title">
          <Icon name="link" size={20} /> {allLinked ? 'Synced' : 'Link my data'}
        </h2>
        {allLinked ? (
          <p>
            Both apps are linked on this browser and keep in sync with the original sites and every
            other linked device. To link another phone or computer, open this link there once.
          </p>
        ) : (
          <p>
            Enter the sync codes from the original apps once. This site then picks up exactly where
            you left off, and stays in sync with the old apps on every device.
          </p>
        )}
        {(saved.ascend || saved.vault) && (
          <button type="button" className="btn btn-ghost" onClick={copy}>
            <Icon name={copied ? 'check' : 'link'} size={16} />
            {copied ? 'Link copied' : 'Copy link for another device'}
          </button>
        )}
      </div>
      <form className="steps" onSubmit={link}>
        {APPS.map((app) => {
          const check = checks[app.key]
          return (
            <div key={app.key} className="step" data-section={app.section}>
              <div className="step-head">
                <strong>{app.label}</strong>
                {saved[app.key] ? (
                  <span className="badge badge-ok">
                    <Icon name="check" size={14} /> Linked
                  </span>
                ) : (
                  <span className="badge">Not linked</span>
                )}
              </div>
              {!saved[app.key] && <p>{app.where}</p>}
              <input
                className="code-input"
                value={input[app.key] ?? ''}
                onChange={(e) => setInput((v) => ({ ...v, [app.key]: e.target.value }))}
                placeholder="abcd-efgh-jkmn"
                aria-label={`${app.label} sync code`}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck="false"
              />
              {check && (
                <p className={check.found ? 'check-ok' : 'check-bad'}>
                  {check.error ?? (check.found ? `Found ${check.summary}` : `${check.summary}. Check the code.`)}
                </p>
              )}
            </div>
          )
        })}
        {editing && (
          <button className="btn" type="submit" disabled={busy || !(input.ascend || input.vault)}>
            {busy ? 'Checking…' : 'Link and sync'}
          </button>
        )}
      </form>
    </section>
  )
}
