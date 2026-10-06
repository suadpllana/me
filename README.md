# me

Everything about Suad Pllana in one app.

| Tab | URL | What it is |
| --- | --- | --- |
| Home | `/` | Who I am, plus live numbers from the other tabs |
| Self Improvement | `/self-improvement` | **Ascend** (from [solo-leveling](https://github.com/suadpllana/solo-leveling) @ `6c987b1`) |
| Entertainment | `/entertainment` | **Vault** (from [all-in-one](https://github.com/suadpllana/all-in-one) @ `fbd4237`) |
| My Opinions | `/opinions` | **The Case Against God** (prebuilt copy of disprovinggod.netlify.app) |

## How it fits together

```
src/              the shell: top tab bar + home page (React + Vite)
apps/ascend/      Self Improvement app, built to dist/app/ascend/
apps/vault/       Entertainment app,    built to dist/app/vault/
apps/opinions/    My Opinions, prebuilt static files -> dist/app/opinions/
scripts/build.mjs builds all of the above into dist/
netlify.toml      SPA fallbacks + the sync proxies
```

Each tab shows its app in a same-origin frame that stays alive while you
switch tabs. The app's own route is mirrored into the address bar, so
`/entertainment/books` or `/self-improvement#/stats` can be bookmarked and
refreshed.

Changes made to the copied apps:

- Vite `base` set to `/app/<name>/` (and `BrowserRouter basename` for Vault).
- Sync endpoint changed to `/api/ascend-sync` / `/api/vault-sync`.
- Ascend's "Media tracker" link opens the Entertainment tab instead of the old site.

## Data

All data stays in the browser's `localStorage`. Because every tab is served
from this one site, the home page can read the same data the apps write.

Device sync: `/api/ascend-sync` and `/api/vault-sync` are proxied to the sync
functions of **ascendpath.netlify.app** and **all-in-one-media.netlify.app**.
Entering a sync code from an old app here opens the same data, and the old app
and this one keep syncing with each other.

## Develop

```bash
npm install
npm run build      # installs each app's deps on first run, builds everything into dist/
npm run dev        # shell only (the tabs need a build in dist/ to show the apps)
```

Entertainment discovery (movies, TV, documentaries, games, YouTube) needs the
same build-time keys as the original Vault site: set `VITE_TMDB_API_KEY`,
`VITE_RAWG_API_KEY`, `VITE_YOUTUBE_API_KEY` (optional `VITE_GOOGLE_BOOKS_API_KEY`)
in the Netlify site's environment variables. Anime and books work without keys.
