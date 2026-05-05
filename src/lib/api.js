import log from '@/lib/logger'

const BASE_URL = import.meta.env.VITE_API_URL || ''

log.info('API', `Client initialised — base URL: "${BASE_URL || '(none — demo mode)'}"`)

async function request(method, path, body) {
  const url = `${BASE_URL}${path}`
  log.debug('API', `→ ${method} ${url}`, body !== undefined ? body : '')

  const opts = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)

  let res
  try {
    res = await fetch(url, opts)
  } catch (networkErr) {
    log.warn('API', `✗ ${method} ${url} — network error (backend unreachable)`, networkErr.message)
    throw networkErr
  }

  if (!res.ok) {
    let data
    try { data = await res.json() } catch { data = {} }

    const err = new Error(data?.message || `HTTP ${res.status}`)
    err.status  = res.status
    err.data    = data

    // 401 = not authenticated — not a real error, mark it so callers can handle it quietly
    if (res.status === 401) {
      err.isUnauthenticated = true
      log.info('API', `→ ${method} ${url} — 401 Unauthenticated (no active session)`)
    } else {
      log.warn('API', `✗ ${method} ${url} — HTTP ${res.status}`, data)
    }

    throw err
  }

  const text = await res.text()
  const parsed = text ? JSON.parse(text) : null
  log.debug('API', `✓ ${method} ${url}`, parsed)
  return parsed
}

const api = {
  async getCsrf() {
    const url = `${BASE_URL}/sanctum/csrf-cookie`
    log.debug('API', `→ GET ${url} (CSRF cookie)`)
    try {
      await fetch(url, { credentials: 'include' })
      log.debug('API', '✓ CSRF cookie set')
    } catch (e) {
      log.warn('API', '✗ CSRF fetch failed (backend down?)', e.message)
      throw e
    }
  },
  get:    (path)       => request('GET',    path),
  post:   (path, body) => request('POST',   path, body),
  put:    (path, body) => request('PUT',    path, body),
  delete: (path)       => request('DELETE', path),
}

export default api
