# My Opinions: The Case Against God

Prebuilt copy of https://disprovinggod.netlify.app (Vite + React, hash routing),
served by the shell under `/app/opinions/`. The only change from the live build
is the asset paths in `index.html` (`/assets/` -> `/app/opinions/assets/`).

To update it: rebuild the source project with `base: '/app/opinions/'` and
replace `index.html` and `assets/` here (or move the source into this folder
with a `package.json`, and `scripts/build.mjs` will build it like the others).
