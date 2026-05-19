import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const BACKEND  = env.VITE_API_URL   || 'https://breast-cancer-detection-backend-main-5kbnz8.laravel.cloud'
  const FASTAPI  = env.VITE_FASTAPI_URL || 'https://ahmedchikhsalah-brecai-fed-api.hf.space'

  return {
    plugins: [react(), tailwindcss()],
    // Inject both URLs as compile-time constants — no .env needed in frontend code
    define: {
      __FASTAPI_URL__: JSON.stringify(FASTAPI),
    },
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
  }
})
