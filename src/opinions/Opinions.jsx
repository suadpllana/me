import { navigate } from '../lib/router'
import { Icon } from '../components/Icon'
import { TOPICS, topicBySlug, topicUrl } from './topics'

function go(e, url) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
  e.preventDefault()
  navigate(url)
}

const formatDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

const newestFirst = (posts) => [...posts].sort((a, b) => b.date.localeCompare(a.date))

// Sub-tabs of My Opinions. Religion is the hosted app; `religionUrl` returns
// to where it was left.
export function OpinionsNav({ topic, religionUrl }) {
  return (
    <nav className="subnav" aria-label="Opinion topics">
      <a
        href={religionUrl}
        className="subtab"
        aria-current={!topic ? 'page' : undefined}
        onClick={(e) => go(e, religionUrl)}
      >
        Religion
      </a>
      {TOPICS.map((t) => (
        <a
          key={t.slug}
          href={topicUrl(t.slug)}
          className="subtab"
          aria-current={topic?.slug === t.slug ? 'page' : undefined}
          onClick={(e) => go(e, topicUrl(t.slug))}
        >
          {t.label}
        </a>
      ))}
    </nav>
  )
}

function Placeholder() {
  return <span className="post-draft">Placeholder</span>
}

// Paragraph strings with a tiny bit of markup: "## " heading, "- " bullet, "> " quote.
function Body({ blocks }) {
  const out = []
  let list = null
  blocks.forEach((text, i) => {
    if (text.startsWith('- ')) {
      if (!list) out.push((list = { key: i, items: [] }))
      list.items.push(text.slice(2))
      return
    }
    list = null
    if (text.startsWith('## ')) out.push(<h2 key={i}>{text.slice(3)}</h2>)
    else if (text.startsWith('> ')) out.push(<blockquote key={i}>{text.slice(2)}</blockquote>)
    else out.push(<p key={i}>{text}</p>)
  })
  return out.map((b) =>
    b.items ? (
      <ul key={b.key}>
        {b.items.map((t, j) => (
          <li key={j}>{t}</li>
        ))}
      </ul>
    ) : (
      b
    ),
  )
}

export function TopicPage({ slug, postId }) {
  const topic = topicBySlug(slug)
  const post = postId && topic.posts.find((p) => p.id === postId)

  if (post) {
    return (
      <article className="topic post">
        <a className="post-back" href={topicUrl(slug)} onClick={(e) => go(e, topicUrl(slug))}>
          <Icon name="arrow" size={16} /> {topic.label}
        </a>
        <header>
          <p className="post-meta">
            {formatDate(post.date)} {post.draft && <Placeholder />}
          </p>
          <h1>{post.title}</h1>
          {post.summary && <p className="post-summary">{post.summary}</p>}
        </header>
        <div className="post-body">
          <Body blocks={post.body ?? []} />
        </div>
      </article>
    )
  }

  const posts = newestFirst(topic.posts)
  return (
    <div className="topic">
      <header className="topic-head">
        <h1>{topic.label}</h1>
        <p>{topic.blurb}</p>
        {postId && <p className="post-missing">That post was not found.</p>}
      </header>
      {posts.length ? (
        <ul className="post-list">
          {posts.map((p) => (
            <li key={p.id}>
              <a href={topicUrl(slug, p.id)} onClick={(e) => go(e, topicUrl(slug, p.id))}>
                <span className="post-meta">
                  {formatDate(p.date)} {p.draft && <Placeholder />}
                </span>
                <span className="post-title">{p.title}</span>
                {p.summary && <span className="post-summary">{p.summary}</span>}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="card-empty">Nothing written here yet.</p>
      )}
    </div>
  )
}
