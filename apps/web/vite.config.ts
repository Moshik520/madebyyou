import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
        proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Images the API serves from disk. Same-origin in the browser, so the
      // relative URLs the API returns work unchanged in dev and in production.
      '/static': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
        '/assets': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },

    },

  },
})
