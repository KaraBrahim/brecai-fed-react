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
const BASE_URL = (typeof __BACKEND_URL__ !== 'undefined' ? __BACKEND_URL__ : 'https://breast-cancer-detection-backend-main-5kbnz8.laravel.cloud') + '/api';

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

/* ── Response interceptor — handle 401 / 403 globally ───────── */
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Clear stored token and redirect to the auth page.
      setAuthToken(null);
      window.location.href = '/auth';
    }

    if (status === 403) {
      // Tag the error so catch blocks can detect permission boundary violations
      // without having to re-inspect the status code themselves.
      error.isPermissionError = true;
    }

    // 422 (validation), 404, 500 — let each page handle these in its own catch block.
    return Promise.reject(error);
  }
);

export default client;
