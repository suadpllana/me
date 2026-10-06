import { Icon } from '../components/Icon'
import LinkData from '../components/LinkData'
import { navigate } from '../lib/router'
import { useSnapshot } from '../lib/snapshot'

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
        <h1 className="hero-name">Everything in one place</h1>
        <p className="hero-lede">
          Self improvement, everything watched, read and played, and opinions on the big questions.
        </p>
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

      <LinkData />
    </div>
  )
}

