// Builds the whole site into dist/:
//   dist/                 the shell (home page + tab bar), from src/
//   dist/app/ascend/      Self Improvement  (apps/ascend, a Vite app)
//   dist/app/vault/       Entertainment     (apps/vault, a Vite app)
//   dist/app/opinions/    My Opinions       (apps/opinions, prebuilt static files)
// Each Vite app keeps its own package.json and lockfile, so it is installed
// and built on its own, exactly as in its original repo.
import { execSync } from 'node:child_process'
import { cpSync, existsSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const dist = join(root, 'dist')

const run = (cmd, cwd = root) => {
  console.log(`\n$ ${cmd}   (${cwd.replace(root, '.') || '.'})`)
  execSync(cmd, { cwd, stdio: 'inherit' })
}

rmSync(dist, { recursive: true, force: true })
run('npx vite build')

for (const name of ['ascend', 'vault']) {
  const dir = join(root, 'apps', name)
  if (!existsSync(join(dir, 'node_modules'))) run('npm ci --no-audit --no-fund', dir)
  run(`npx vite build --outDir ${join(dist, 'app', name)} --emptyOutDir`, dir)
}

cpSync(join(root, 'apps', 'opinions'), join(dist, 'app', 'opinions'), {
  recursive: true,
  filter: (src) => !src.endsWith('README.md'),
})

console.log('\nBuilt dist/')
