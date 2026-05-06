import axios from 'axios'
import log from '@/lib/logger'

// In development the Vite dev-server proxy forwards /api/* and /sanctum/*
// to the real backend, so we use a relative base URL — no CORS issue.
// In production (Vercel) we point directly at the backend.
const BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL || 'https://breast-cancer-detection-backend-main-p7c9cg.laravel.cloud')

log.info('API', `Axios client — base URL: "${BASE_URL || '(relative — via dev proxy)'}"`)

const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,   // sends HttpOnly session cookie on every request
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
})

export default instance
