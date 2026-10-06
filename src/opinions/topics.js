// The written topics under My Opinions (Religion is the separate prebuilt app).
//
// To write: edit a post below, or copy one to add more. Posts show newest first.
//   id     - used in the link (/opinions#/topic/<topic>/<id>), keep it unique
//   date   - YYYY-MM-DD
//   body   - one string per paragraph. A string starting with "## " is a
//            heading, "- " a bullet point, "> " a quote.
//   draft  - true shows a "Placeholder" label; delete it once the post is real
//
// To add a topic, add an entry to TOPICS. To remove one, delete it.

export const TOPICS = [
  {
    slug: 'geopolitics',
    label: 'Geopolitics',
    blurb: 'Great powers, wars, alliances and where the world is heading.',
    posts: [
      {
        id: 'world-order',
        title: 'Placeholder: where the world order is heading',
        date: '2026-10-01',
        summary: 'One or two sentences with your main claim. This shows on the topic page.',
        draft: true,
        body: [
          'Placeholder text. Replace this with your opening: what the question is and why it matters.',
          '## My view',
          'State your position plainly here.',
          '## Why',
          '- First reason',
          '- Second reason',
          '- Third reason',
          '## The strongest objection',
          'The best case against your view, put fairly.',
          '## My answer',
          'Why you still hold your view.',
        ],
      },
      {
        id: 'europe-and-the-us',
        title: 'Placeholder: Europe and the United States',
        date: '2026-09-20',
        summary: 'Short summary of the post.',
        draft: true,
        body: ['Placeholder text. Write the post here.', '> A quote that supports or challenges the point.'],
      },
    ],
  },
  {
    slug: 'kosovo',
    label: 'Kosovo',
    blurb: 'Politics in Kosovo: parties, elections, the state and its future.',
    posts: [
      {
        id: 'kosovo-serbia-dialogue',
        title: 'Placeholder: the Kosovo–Serbia dialogue',
        date: '2026-10-02',
        summary: 'Short summary of the post.',
        draft: true,
        body: [
          'Placeholder text. Write the post here.',
          '## My view',
          'Your position.',
          '## Why',
          '- Reason one',
          '- Reason two',
        ],
      },
      {
        id: 'elections',
        title: 'Placeholder: elections and the parties',
        date: '2026-09-25',
        summary: 'Short summary of the post.',
        draft: true,
        body: ['Placeholder text. Write the post here.'],
      },
      {
        id: 'eu-and-nato',
        title: 'Placeholder: the road to the EU and NATO',
        date: '2026-09-10',
        summary: 'Short summary of the post.',
        draft: true,
        body: ['Placeholder text. Write the post here.'],
      },
    ],
  },
  {
    slug: 'balkans',
    label: 'Balkans',
    blurb: 'Albania, Serbia, North Macedonia, Bosnia and the wider region.',
    posts: [
      {
        id: 'region',
        title: 'Placeholder: the region in ten years',
        date: '2026-09-28',
        summary: 'Short summary of the post.',
        draft: true,
        body: ['Placeholder text. Write the post here.'],
      },
    ],
  },
  {
    slug: 'economy',
    label: 'Economy',
    blurb: 'Money, work, markets and how countries get rich.',
    posts: [
      {
        id: 'growth',
        title: 'Placeholder: what actually makes a country richer',
        date: '2026-09-15',
        summary: 'Short summary of the post.',
        draft: true,
        body: ['Placeholder text. Write the post here.'],
      },
    ],
  },
  {
    slug: 'society',
    label: 'Society',
    blurb: 'Culture, education, family and how people live.',
    posts: [
      {
        id: 'education',
        title: 'Placeholder: what school should teach',
        date: '2026-09-05',
        summary: 'Short summary of the post.',
        draft: true,
        body: ['Placeholder text. Write the post here.'],
      },
    ],
  },
]

export const topicBySlug = (slug) => TOPICS.find((t) => t.slug === slug)

// "#/topic/<slug>[/<postId>]" -> { slug, postId } for a known topic, else null
// (null means the hash belongs to the Religion app).
export function topicRoute(hash) {
  const m = /^#\/topic\/([^/?#]+)(?:\/([^/?#]+))?/.exec(hash ?? '')
  if (!m || !topicBySlug(m[1])) return null
  return { slug: m[1], postId: m[2] ?? null }
}

export const topicUrl = (slug, postId) => `/opinions#/topic/${slug}${postId ? '/' + postId : ''}`
