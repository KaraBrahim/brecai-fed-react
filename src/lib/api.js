/**
 * BRECAI-FED · API client
 *
 * Thin wrapper over the axios instance in src/api/axios.js.
 * That instance has withCredentials: true so every request
 * automatically carries the HttpOnly session cookie that Laravel
 * Sanctum sets after login/verifyOtp.
 *
 * All methods return the response data directly (not the full
 * axios response) and throw a normalised error on failure so the
 * rest of the app doesn't need to know about axios internals.
 */
import axiosInstance from '@/api/axios'
import log from '@/lib/logger'

function normaliseError(err) {
  // Axios wraps HTTP errors in err.response; network failures have no response.
  const status  = err?.response?.status
  const data    = err?.response?.data ?? {}
  const message = data?.message || err?.message || 'Request failed'

  const out     = new Error(message)
  out.status    = status
  out.data      = data
  out.isUnauthenticated = status === 401
  return out
}

async function request(method, path, body, config = {}) {
  log.debug('API', `→ ${method.toUpperCase()} ${path}`, body ?? '')
  try {
    const res = await axiosInstance.request({
      method,
      url: path,
      data: body,
      ...config,
    })
    log.debug('API', `✓ ${method.toUpperCase()} ${path}`, res.data)
    return res.data
  } catch (err) {
    const normalised = normaliseError(err)
    if (normalised.isUnauthenticated) {
      log.info('API', `→ ${method.toUpperCase()} ${path} — 401 Unauthenticated (no active session)`)
    } else if (!err.response) {
      log.warn('API', `✗ ${method.toUpperCase()} ${path} — network error (backend unreachable)`, err.message)
    } else {
      log.warn('API', `✗ ${method.toUpperCase()} ${path} — HTTP ${normalised.status}`, normalised.data)
    }
    throw normalised
  }
}

const api = {
  /** Fetch the Sanctum CSRF cookie — must be called before any mutating request */
  async getCsrf() {
    log.debug('API', '→ GET /sanctum/csrf-cookie (CSRF cookie)')
    try {
      await axiosInstance.get('/sanctum/csrf-cookie')
      log.debug('API', '✓ CSRF cookie set')
    } catch (err) {
      log.warn('API', '✗ CSRF fetch failed', err.message)
      throw normaliseError(err)
    }
  },

  get:    (path, config)        => request('get',    path, undefined, config),
  post:   (path, body, config)  => request('post',   path, body,      config),
  put:    (path, body, config)  => request('put',    path, body,      config),
  patch:  (path, body, config)  => request('patch',  path, body,      config),
  delete: (path, config)        => request('delete', path, undefined, config),
}

export default api
