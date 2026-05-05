import log from '@/lib/logger'

const BASE_URL = import.meta.env.VITE_API_URL || ''

log.info('API', `Client initialised — base URL: "${BASE_URL || '(none — demo mode)'}"`)

function redactValue(v) {
  if (!v || typeof v !== 'object') return v
  if (Array.isArray(v)) return v.map(redactValue)
  const out = {}
  for (const [k, val] of Object.entries(v)) {
    const key = String(k).toLowerCase()
    if (
      key.includes('password') ||
      key === 'otp' ||
      key === 'code' ||
      key.includes('token') ||
      key.includes('secret') ||
      key.includes('key')
    ) {
      out[k] = '[REDACTED]'
    } else {
      out[k] = redactValue(val)
    }
  }
  return out
}

async function request(method, path, body) {
  const url = `${BASE_URL}${path}`
  const safeBody = body !== undefined ? redactValue(body) : ''
  log.debug('API', `→ ${method} ${url}`, safeBody)

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
    log.warn('API', `✗ ${method} ${url} — HTTP ${res.status}`, data)
    const err = new Error(data?.message || `HTTP ${res.status}`)
    err.status = res.status
    err.data = data
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
