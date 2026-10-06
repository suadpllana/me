import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Served under /app/vault/ inside the "me" shell (see root netlify.toml).
  base: '/app/vault/',
  plugins: [react(), tailwindcss()],
})
