import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The API serves /api, plus the images it keeps on disk under /static and
// /assets. Dev and preview both need these, and `preview` does not inherit
// `server.proxy`, so the object is shared explicitly.
const proxy = {
  '/api': { target: 'http://localhost:3000', changeOrigin: true },
  '/static': { target: 'http://localhost:3000', changeOrigin: true },
  '/assets': { target: 'http://localhost:3000', changeOrigin: true },
}

export default defineConfig({
  plugins: [react()],
  // Not the default 'assets': that path is already proxied to the API, which
  // serves product images there, so a built bundle under /assets never loads.
  build: { assetsDir: 'bundle' },
  server: { proxy },
  preview: { proxy },
})
