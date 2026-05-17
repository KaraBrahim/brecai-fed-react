import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const BACKEND = process.env.VITE_API_URL || 'https://breast-cancer-detection-backend-main-p7c9cg.laravel.cloud'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    watch: {
      ignored: ['**/.local/**', '**/.cache/**', '**/.git/**'],
    },
    // ── Dev proxy ──────────────────────────────────────────────────
    // All /api/* and /sanctum/* requests are forwarded to the backend.
    // This avoids CORS issues in local dev because the browser sees the
    // requests as same-origin (localhost:5000 → localhost:5000/api/...).
    // In production (Vercel) the full VITE_API_URL is used directly.
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        secure: true,
      },
      '/sanctum': {
        target: BACKEND,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
