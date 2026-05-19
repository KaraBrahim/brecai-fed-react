import axios from 'axios';

/* ── Token helpers ───────────────────────────────────────────────
   The backend issues a Bearer token on POST /api/auth/verify-otp.
   We keep it in localStorage under this key so it survives page
   reloads and is picked up by the request interceptor below.
──────────────────────────────────────────────────────────────── */
const TOKEN_KEY = 'auth_token';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/* ── Axios instance ──────────────────────────────────────────── */
const BASE_URL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'https://breast-cancer-detection-backend-main-5kbnz8.laravel.cloud') + '/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

/* ── Request interceptor — attach Bearer token ───────────────── */
client.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ── Response interceptor — handle 401 globally ─────────────── */
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default client;
