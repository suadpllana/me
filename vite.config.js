import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The shell (home page + tab bar). The three hosted apps live in apps/ and are
// built separately into dist/app/<name>/ by scripts/build.mjs.
export default defineConfig({
  plugins: [react()],
})
