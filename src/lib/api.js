const BASE_URL = import.meta.env.VITE_API_URL || ''

async function request(method, path, body) {
  const opts = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, opts)

  if (!res.ok) {
    let data
    try { data = await res.json() } catch { data = {} }
    const err = new Error(data?.message || `HTTP ${res.status}`)
    err.status = res.status
    err.data = data
    throw err
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}

const api = {
  async getCsrf() {
    await fetch(`${BASE_URL}/sanctum/csrf-cookie`, { credentials: 'include' })
  },
  get:    (path)       => request('GET',    path),
  post:   (path, body) => request('POST',   path, body),
  put:    (path, body) => request('PUT',    path, body),
  delete: (path)       => request('DELETE', path),
}

export default api
