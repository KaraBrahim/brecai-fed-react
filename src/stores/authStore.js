import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { ROLE_HOME_MAP } from '@/enums/roles'
import log from '@/lib/logger'

/* ── Demo data (preserved for quick-access UI) ─────────────── */
export const DEMO_ACCOUNTS = [
  {
    id: 'USR-001',
    name: 'Dr. Mounia Benali',
    email: 'mounia.benali@chu-oran.dz',
    password: 'demo',
    role: 'doctor',
    org: 'CHU Oran',
    initials: 'MB',
    specialty: 'Oncology · Breast Cancer',
  },
  {
    id: 'USR-004',
    name: 'Prof. Linda Ferhat',
    email: 'l.ferhat@usthb.dz',
    password: 'demo',
    role: 'instructor',
    org: 'USTHB Research',
    initials: 'LF',
    specialty: 'Federated ML · Model Training',
  },
  {
    id: 'USR-005',
    name: 'Sara Hammadi',
    email: 'sara.h@chu-oran.dz',
    password: 'demo',
    role: 'org_manager',
    org: 'CHU Oran',
    initials: 'SH',
    specialty: 'Site Management · Compliance',
  },
  {
    id: 'USR-006',
    name: 'Omar Belkacem',
    email: 'omar.b@brecai.io',
    password: 'demo',
    role: 'admin',
    org: 'BRECAI HQ',
    initials: 'OB',
    specialty: 'Platform Admin · Infrastructure',
  },
]

export const DEMO_ORGS = [
  { id: 1, name: 'CHU Oran',                  city: 'Oran',        type: 'hospital' },
  { id: 2, name: 'CHU Algiers',               city: 'Algiers',     type: 'hospital' },
  { id: 3, name: 'CHU Constantine',           city: 'Constantine', type: 'hospital' },
  { id: 4, name: 'USTHB Research',            city: 'Algiers',     type: 'laboratory' },
  { id: 5, name: 'CHU Tlemcen',               city: 'Tlemcen',     type: 'hospital' },
  { id: 6, name: 'CHU Annaba',                city: 'Annaba',      type: 'hospital' },
  { id: 7, name: 'CHU Batna',                 city: 'Batna',       type: 'hospital' },
  { id: 8, name: 'Clinique Es-Salam',         city: 'Setif',       type: 'clinic' },
  { id: 9, name: 'Centre de Radiologie Oran', city: 'Oran',        type: 'radiology_center' },
]

/* ── Role helpers (UI display metadata, supports both API keys & display names) ── */
export const ROLE_HOME = ROLE_HOME_MAP

export const ROLE_META = {
  // API role keys
  doctor: {
    accent: '#0572B2', gradFrom: '#0572B2', gradTo: '#0BB592',
    badge: 'Clinician', tagline: 'AI-assisted breast cancer subtyping',
  },
  instructor: {
    accent: '#7C3AED', gradFrom: '#7C3AED', gradTo: '#6D28D9',
    badge: 'Data Scientist', tagline: 'Train, inspect and federate ML models',
  },
  org_manager: {
    accent: '#D97706', gradFrom: '#D97706', gradTo: '#EA580C',
    badge: 'Site Admin', tagline: 'Team roster, compliance and access',
  },
  admin: {
    accent: '#334155', gradFrom: '#1e293b', gradTo: '#334155',
    badge: 'Platform Admin', tagline: 'Full system control and billing',
  },
  // Legacy display name aliases
  Doctor:      { accent: '#0572B2', gradFrom: '#0572B2', gradTo: '#0BB592', badge: 'Clinician',      tagline: 'AI-assisted breast cancer subtyping' },
  Instructor:  { accent: '#7C3AED', gradFrom: '#7C3AED', gradTo: '#6D28D9', badge: 'Data Scientist', tagline: 'Train, inspect and federate ML models' },
  'Org Admin': { accent: '#D97706', gradFrom: '#D97706', gradTo: '#EA580C', badge: 'Site Admin',     tagline: 'Team roster, compliance and access' },
  Platform:    { accent: '#334155', gradFrom: '#1e293b', gradTo: '#334155', badge: 'Platform Admin', tagline: 'Full system control and billing' },
  Support:     { accent: '#334155', gradFrom: '#1e293b', gradTo: '#334155', badge: 'Support',        tagline: 'User support and operations' },
}

/* ── Helpers ─────────────────────────────────────────────────── */
function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function genToken() {
  const c = typeof crypto !== 'undefined' ? crypto : null
  if (c?.randomUUID) return c.randomUUID()
  return `tok_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`
}

function resolveUserRole(user) {
  if (!user) return null
  if (user?.roles?.length > 0) return user.roles[0].name
  return user?.role || null
}

function buildRegisterPayload(formData) {
  const password = formData.password
  const password_confirmation =
    formData.password_confirmation ??
    formData.confirm ??
    password

  return {
    name: formData.name,
    email: formData.email,
    password,
    password_confirmation,
    phone_number: formData.phone_number ?? formData.phone ?? null,
    role: formData.role ?? formData.api_role,
    plan_id: formData.plan_id,
    organization_name: formData.organization_name,
    organization_address: formData.organization_address,
    organization_type: formData.organization_type,
    organization_code: formData.organization_code,
    organization_id: formData.organization_id,
    invite_code: formData.invite_code,
  }
}

/* ── Store ───────────────────────────────────────────────────── */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      /* ── State ─────────────────────────────────────────── */
      user:            null,
      isAuthenticated: false,
      isInitialized:   false,
      tempEmail:       localStorage.getItem('temp_email') || null,
      _pendingOtp:     null, // demo mode only, not persisted
      _pendingOtpToken: null, // demo mode only, not persisted
      _pendingOtpContext: null, // 'login' | 'signup'

      /* ── Computed helper (call as a function) ─────────── */
      userRole: () => resolveUserRole(get().user),

      /* ── fetchUser ────────────────────────────────────── */
      fetchUser: async () => {
        log.info('AUTH', 'fetchUser → attempting GET /api/user ...')
        try {
          const data = await api.get('/api/user')
          log.info('AUTH', `fetchUser ✓ — authenticated as "${data?.name}" [${resolveUserRole(data)}]`)
          set({ user: data, isAuthenticated: true, isInitialized: true })
        } catch (err) {
          log.warn('AUTH', `fetchUser ✗ — API unreachable or 401 (${err.message})`)

          const persisted = get().user
          if (persisted && get().isAuthenticated) {
            log.info('AUTH', `fetchUser — using persisted session: "${persisted.name}" [${resolveUserRole(persisted)}] (demo/offline mode)`)
            set({ isInitialized: true })
          } else {
            log.info('AUTH', 'fetchUser — no persisted session, setting guest state')
            set({ user: null, isAuthenticated: false, isInitialized: true })
          }
        }
      },

      /* ── login ────────────────────────────────────────── */
      login: async (email, password) => {
        log.info('AUTH', `login → "${email}"`)
        try {
          log.debug('AUTH', 'login — fetching CSRF cookie ...')
          await api.getCsrf()
          log.debug('AUTH', 'login — posting credentials to /api/login ...')
          await api.post('/api/login', { email, password })
          localStorage.setItem('temp_email', email)
          set({ tempEmail: email })
          log.info('AUTH', `login ✓ — OTP sent to "${email}" (real API)`)
          return { ok: true, email }
        } catch (err) {
          log.warn('AUTH', `login ✗ — API unavailable (${err.message}), falling back to demo mode`)
          return get()._demoRequestOtp(email, password)
        }
      },

      /* ── verifyOtp ────────────────────────────────────── */
      verifyOtp: async (otp) => {
        const { tempEmail, _pendingOtp } = get()
        log.info('AUTH', `verifyOtp → email="${tempEmail}"`)

        try {
          log.debug('AUTH', 'verifyOtp — posting to /api/verify-otp ...')
          await api.post('/api/verify-otp', { email: tempEmail, otp })
          localStorage.removeItem('temp_email')
          set({ tempEmail: null, _pendingOtp: null, _pendingOtpToken: null, _pendingOtpContext: null, isInitialized: false })
          log.info('AUTH', 'verifyOtp ✓ — fetching user from API ...')
          await get().fetchUser()
          const user = get().user
          log.info('AUTH', `verifyOtp ✓ — session established for "${user?.name}" [${resolveUserRole(user)}]`)
          return { ok: true, user }
        } catch (err) {
          log.warn('AUTH', `verifyOtp ✗ — API unavailable (${err.message}), trying demo verification`)

          if (get()._pendingOtpContext !== 'login' || !tempEmail || !_pendingOtp) {
            log.error('AUTH', 'verifyOtp demo ✗ — no pending OTP in state (session expired?)')
            return { ok: false, error: 'Session expired. Please start again.' }
          }
          if (otp.trim() !== _pendingOtp) {
            log.warn('AUTH', 'verifyOtp demo ✗ — wrong code')
            return { ok: false, error: 'Incorrect code. Try again.' }
          }
          const found = DEMO_ACCOUNTS.find(
            u => u.email.toLowerCase() === tempEmail.toLowerCase()
          )
          if (!found) {
            log.error('AUTH', `verifyOtp demo ✗ — no demo account for "${tempEmail}"`)
            return { ok: false, error: 'User not found.' }
          }
          const { password: _p, ...user } = found
          localStorage.removeItem('temp_email')
          set({ user, isAuthenticated: true, tempEmail: null, _pendingOtp: null, _pendingOtpToken: null, _pendingOtpContext: null })
          log.info('AUTH', `verifyOtp demo ✓ — session established for "${user.name}" [${user.role}]`)
          return { ok: true, user }
        }
      },

      /* ── getRoleHome ──────────────────────────────────── */
      getRoleHome: () => {
        const role = get().userRole()
        const home = ROLE_HOME[role] || '/app/doctor'
        log.debug('AUTH', `getRoleHome → role="${role}" home="${home}"`)
        return home
      },

      /* ── logout ───────────────────────────────────────── */
      logout: async () => {
        log.info('AUTH', 'logout → calling /api/logout ...')
        try {
          await api.post('/api/logout')
          log.info('AUTH', 'logout ✓ — server session cleared')
        } catch (err) {
          log.warn('AUTH', `logout — API unavailable (${err.message}), clearing local state only`)
        }
        localStorage.removeItem('temp_email')
        set({ user: null, isAuthenticated: false, tempEmail: null, _pendingOtp: null, _pendingOtpToken: null, _pendingOtpContext: null })
        log.info('AUTH', 'logout ✓ — local auth state cleared')
      },

      /* ── loginAs ──────────────────────────────────────── */
      loginAs: (role) => {
        log.info('AUTH', `loginAs → role="${role}" (demo quick-access, bypassing OTP)`)
        const found = DEMO_ACCOUNTS.find(u => u.role === role)
        if (!found) {
          log.error('AUTH', `loginAs ✗ — no demo account for role "${role}"`)
          return null
        }
        const { password: _p, ...user } = found
        set({ user, isAuthenticated: true, tempEmail: null, _pendingOtp: null })
        log.info('AUTH', `loginAs ✓ — signed in as "${user.name}" [${user.role}]`)
        return user
      },

      /* ── requestOtp (legacy UI compat) ───────────────── */
      requestOtp: (email, password) => {
        log.debug('AUTH', `requestOtp (legacy) → "${email}"`)
        return get()._demoRequestOtp(email, password)
      },

      /* ── register ─────────────────────────────────────── */
      register: async (formData) => {
        const payload = buildRegisterPayload(formData)
        log.info('AUTH', `register → name="${payload.name}" email="${payload.email}" role="${payload.role}"`)
        try {
          await api.getCsrf()
          const data = await api.post('/api/register', payload)
          const email = data?.email || payload.email
          localStorage.setItem('temp_email', email)
          set({ tempEmail: email, _pendingOtp: null, _pendingOtpToken: null, _pendingOtpContext: null })
          log.info('AUTH', `register ✓ — created account for "${email}" (real API)`)
          return { ok: true, email, phone_number: payload.phone_number, data }
        } catch (err) {
          if (err?.status) {
            const message =
              err?.data?.message ||
              (typeof err?.data === 'string' ? err.data : null) ||
              err.message ||
              'Registration failed'
            log.warn('AUTH', `register ✗ — API rejected (${err.status}): ${message}`)
            return { ok: false, error: message, details: err?.data }
          }
          log.warn('AUTH', `register ✗ — API unavailable (${err.message}), falling back to demo mode`)
          const email = payload.email
          localStorage.setItem('temp_email', email)
          set({ tempEmail: email, _pendingOtp: null, _pendingOtpToken: null, _pendingOtpContext: null })
          return { ok: true, email, phone_number: payload.phone_number, demo: true }
        }
      },

      /* ── signUpOtp: request ───────────────────────────── */
      requestSignUpOtp: async ({ channel, email, phone_number }) => {
        log.info('AUTH', `requestSignUpOtp → channel="${channel}"`)
        try {
          await api.getCsrf()
          const data = await api.post('/api/otp/request', { channel, email, phone_number, context: 'signup' })
          const token = data?.token || data?.verification_token || data?.challenge_token || null
          if (!token) return { ok: false, error: 'OTP request succeeded but no token was returned by the server.' }
          set({ _pendingOtp: null, _pendingOtpToken: null, _pendingOtpContext: null })
          return {
            ok: true,
            token,
            expires_in: data?.expires_in ?? null,
          }
        } catch (err) {
          log.warn('AUTH', `requestSignUpOtp ✗ — API unavailable (${err.message}), falling back to demo mode`)
          const otp = genOtp()
          const token = genToken()
          set({ _pendingOtp: otp, _pendingOtpToken: token, _pendingOtpContext: 'signup' })
          return { ok: true, token, demoOtp: otp, demo: true }
        }
      },

      /* ── signUpOtp: verify ────────────────────────────── */
      verifySignUpOtp: async ({ token, otp }) => {
        log.info('AUTH', 'verifySignUpOtp → verifying')
        try {
          await api.getCsrf()
          await api.post('/api/otp/verify', { token, otp, context: 'signup' })
          set({ isInitialized: false, _pendingOtp: null, _pendingOtpToken: null, _pendingOtpContext: null })
          await get().fetchUser()
          const user = get().user
          if (!user) return { ok: false, error: 'Verification succeeded but no session was established.' }
          return { ok: true, user }
        } catch (err) {
          log.warn('AUTH', `verifySignUpOtp ✗ — API unavailable (${err.message}), trying demo verification`)
          if (get()._pendingOtpContext !== 'signup' || !get()._pendingOtpToken || !get()._pendingOtp) {
            return { ok: false, error: 'Session expired. Please request a new code.' }
          }
          if (token !== get()._pendingOtpToken) return { ok: false, error: 'Session expired. Please request a new code.' }
          if (otp.trim() !== get()._pendingOtp) return { ok: false, error: 'Incorrect code. Try again.' }
          const email = get().tempEmail
          const found = DEMO_ACCOUNTS.find(u => u.email.toLowerCase() === String(email || '').toLowerCase()) || DEMO_ACCOUNTS[0]
          const { password: _p, ...user } = found
          set({ user, isAuthenticated: true, _pendingOtp: null, _pendingOtpToken: null, _pendingOtpContext: null })
          return { ok: true, user }
        }
      },

      /* ── Internal: demo OTP request ───────────────────── */
      _demoRequestOtp: (email, password) => {
        log.debug('AUTH', `_demoRequestOtp → "${email}"`)
        const found = DEMO_ACCOUNTS.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )
        if (!found) {
          log.warn('AUTH', `_demoRequestOtp ✗ — no match for "${email}"`)
          return { ok: false, error: 'Invalid email or password. Demo password is "demo".' }
        }
        const otp = genOtp()
        localStorage.setItem('temp_email', found.email)
        set({ tempEmail: found.email, _pendingOtp: otp, _pendingOtpToken: null, _pendingOtpContext: 'login' })
        log.info('AUTH', `_demoRequestOtp ✓ — OTP generated for "${found.email}"`)
        return { ok: true, email: found.email, otp }
      },
    }),
    {
      name: 'brecai-auth',
      partialize: (s) => ({
        user:            s.user,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)
