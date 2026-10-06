import { Icon } from '../components/Icon'
import { navigate } from '../lib/router'
import { useSnapshot } from '../lib/snapshot'
import { PROFILE } from '../profile'

const nf = new Intl.NumberFormat()

function go(e, url) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
  e.preventDefault()
  navigate(url)
}

function Stat({ value, label }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function SectionCard({ section, href, eyebrow, title, blurb, children }) {
  return (
    <a className="card" data-section={section} href={href} onClick={(e) => go(e, href)}>
      <div className="card-head">
        <span className="card-icon">
          <Icon name={section} size={20} />
        </span>
        <span className="card-eyebrow">{eyebrow}</span>
      </div>
      <h3 className="card-title">{title}</h3>
      <p className="card-blurb">{blurb}</p>
      <div className="card-body">{children}</div>
      <span className="card-cta">
        Open <Icon name="arrow" size={16} />
      </span>
    </a>
  )
}

function Empty({ children }) {
  return <p className="card-empty">{children}</p>
}

export default function Home() {
  const { ascend, vault } = useSnapshot()

  return (
    <div className="home">
      <section className="hero">
        <p className="hero-eyebrow">Hi, I&rsquo;m</p>
        <h1 className="hero-name">{PROFILE.name}</h1>
        <p className="hero-lede">
          I&rsquo;m {PROFILE.age} years old, and this is everything about me: how I&rsquo;m working
          on myself, everything I watch, read and play, and what I think about the big questions.
        </p>
        <ul className="facts">
          <li>{PROFILE.age} years old</li>
          <li>Leveling up until 1 July 2027</li>
          <li>Always watching something</li>
        </ul>
      </section>

      <section className="cards" aria-label="Sections">
        <SectionCard
          section="self"
          href="/self-improvement"
          eyebrow="Self Improvement"
          title="Ascend"
          blurb="My path across Spirituality, Money, Mind and Body, with every quest cleared before 1 July 2027."
        >
          {ascend.hasData ? (
            <div className="stats">
              <Stat value={nf.format(ascend.total)} label="quests cleared" />
              <Stat value={nf.format(ascend.activeDays)} label="active days" />
              <Stat value={ascend.streak ? `${ascend.streak}d` : '0'} label="streak" />
              <Stat value={nf.format(ascend.daysLeft)} label="days left" />
            </div>
          ) : (
            <Empty>No progress on this device yet. Link your data below.</Empty>
          )}
        </SectionCard>

        <SectionCard
          section="media"
          href="/entertainment"
          eyebrow="Entertainment"
          title="Vault"
          blurb="Everything I watch, read and play: movies, TV, anime, books, games, documentaries and YouTube."
        >
          {vault.hasData ? (
            <>
              <div className="stats">
                <Stat value={nf.format(vault.total)} label="in library" />
                <Stat value={nf.format(vault.finished)} label="finished" />
                <Stat value={nf.format(vault.inProgress)} label="in progress" />
              </div>
              <ul className="chips">
                {vault.byWorld.map((w) => (
                  <li key={w.key}>
                    {w.label} <b>{w.count}</b>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <Empty>Library is empty on this device. Link your data below.</Empty>
          )}
        </SectionCard>

        <SectionCard
          section="opinions"
          href="/opinions"
          eyebrow="My Opinions"
          title="The Case Against God"
          blurb="Arguments with their premises, the strongest counter-argument, and a response. No strawmen."
        >
          <div className="stats">
            <Stat value="170" label="arguments" />
            <Stat value="46" label="quotes" />
          </div>
          <ul className="chips">
            {['Philosophy', 'Islam', 'Biology', 'Psychology', 'Concepts', 'Quotes'].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </SectionCard>
      </section>

      <section className="data" aria-labelledby="data-title">
        <div className="data-intro">
          <h2 id="data-title">
            <Icon name="link" size={20} /> Bring my data over
          </h2>
          <p>
            Browsers keep every website&rsquo;s saved data separate, so progress saved on{' '}
            <code>ascendpath.netlify.app</code> and <code>all-in-one-media.netlify.app</code> does
            not show up here on its own. Link each app once with its sync code. After that this site
            and the old app share the same data, on every device.
          </p>
        </div>
        <ol className="steps">
          <li className="step" data-section="self">
            <div className="step-head">
              <strong>Self Improvement</strong>
              <LinkStatus linked={ascend.linked} />
            </div>
            <p>
              On the PC with your progress, open{' '}
              <a href="https://ascendpath.netlify.app/" target="_blank" rel="noreferrer">
                ascendpath.netlify.app
              </a>
              , tap <b>Sync</b> (the cloud icon) and create a sync code (or copy the one you already use). Then open{' '}
              <a href="/self-improvement" onClick={(e) => go(e, '/self-improvement')}>
                Self Improvement
              </a>{' '}
              here, tap <b>Sync</b> and enter the same code.
            </p>
          </li>
          <li className="step" data-section="media">
            <div className="step-head">
              <strong>Entertainment</strong>
              <LinkStatus linked={vault.linked} />
            </div>
            <p>
              Open{' '}
              <a href="https://all-in-one-media.netlify.app/account" target="_blank" rel="noreferrer">
                all-in-one-media.netlify.app/account
              </a>{' '}
              and under <b>Device sync</b> create a sync code. Then enter it under{' '}
              <a href="/entertainment#/account" onClick={(e) => go(e, '/entertainment#/account')}>
                Entertainment &rsaquo; Settings &rsaquo; Link device
              </a>
              . A JSON backup from the old Settings page can be restored there too.
            </p>
          </li>
        </ol>
      </section>

      <footer className="foot">
        <span>&copy; {new Date().getFullYear()} {PROFILE.name}</span>
      </footer>
    </div>
  )
}

function LinkStatus({ linked }) {
  return linked ? (
    <span className="badge badge-ok">
      <Icon name="check" size={14} /> Linked
    </span>
  ) : (
    <span className="badge">Not linked</span>
  )
}
