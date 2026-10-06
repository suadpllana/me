// Server-side relay to the sync function of one of the original sites. The
// hosted apps keep their data in the original sites' sync stores, so a sync
// code created on ascendpath.netlify.app or all-in-one-media.netlify.app opens
// the same data here, and both sites stay in sync with each other.
// (The original functions send no CORS headers, so the browser cannot call
// them directly from this origin.)
export function relay(upstream) {
  return async (req) => {
    const url = new URL(req.url)
    const target = `${upstream}?key=${encodeURIComponent(url.searchParams.get('key') ?? '')}`
    if (req.method !== 'GET' && req.method !== 'PUT') {
      return Response.json({ error: 'method not allowed' }, { status: 405 })
    }
    const res = await fetch(target, {
      method: req.method,
      headers: { 'content-type': 'application/json' },
      body: req.method === 'PUT' ? await req.text() : undefined,
    })
    return new Response(await res.text(), {
      status: res.status,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    })
  }
}
