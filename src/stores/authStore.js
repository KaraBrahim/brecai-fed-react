import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { ROLE_HOME_MAP } from '@/enums/roles'
import log from '@/lib/logger'
import { AUTH_ENDPOINTS } from '@/config/auth'

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
function resolveUserRole(user) {
  if (!user) return null
  if (user?.roles?.length > 0) return user.roles[0].name
  return user?.role || null
}

function errorMessage(err, fallback = 'Request failed') {
  return (
    err?.data?.message ||
    (typeof err?.data === 'string' ? err.data : null) ||
    err?.message ||
    fallback
  )
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

      /* ── Computed helper (call as a function) ─────────── */
      userRole: () => resolveUserRole(get().user),

      /* ── fetchUser ────────────────────────────────────── */
      fetchUser: async () => {
        log.info('AUTH', 'fetchUser → attempting GET /api/user ...')
        try {
          const data = await api.get(AUTH_ENDPOINTS.user)
          log.info('AUTH', `fetchUser ✓ — authenticated as "${data?.name}" [${resolveUserRole(data)}]`)
          set({ user: data, isAuthenticated: true, isInitialized: true })
        } catch (err) {
          log.warn('AUTH', `fetchUser ✗ — API unreachable or 401 (${err.message})`)
          set({ user: null, isAuthenticated: false, isInitialized: true })
        }
      },

      /* ── login ────────────────────────────────────────── */
      login: async (email, password) => {
        log.info('AUTH', `login → "${email}"`)
        try {
          log.debug('AUTH', 'login — fetching CSRF cookie ...')
          await api.getCsrf()
          log.debug('AUTH', 'login — posting credentials to /api/login ...')
          await api.post(AUTH_ENDPOINTS.login, { email, password })
          localStorage.setItem('temp_email', email)
          set({ tempEmail: email })
          log.info('AUTH', `login ✓ — OTP sent to "${email}" (real API)`)
          return { ok: true, email }
        } catch (err) {
          const message = errorMessage(err, 'Login failed')
          log.warn('AUTH', `login ✗ — ${message}`)
          return { ok: false, error: message, details: err?.data }
        }
      },

      /* ── verifyOtp ────────────────────────────────────── */
      verifyOtp: async (otp) => {
        const { tempEmail } = get()
        log.info('AUTH', `verifyOtp → email="${tempEmail}"`)

        try {
          log.debug('AUTH', 'verifyOtp — posting to /api/verify-otp ...')
          await api.post(AUTH_ENDPOINTS.verifyOtp, { email: tempEmail, otp })
          localStorage.removeItem('temp_email')
          set({ tempEmail: null, isInitialized: false })
          log.info('AUTH', 'verifyOtp ✓ — fetching user from API ...')
          await get().fetchUser()
          const user = get().user
          log.info('AUTH', `verifyOtp ✓ — session established for "${user?.name}" [${resolveUserRole(user)}]`)
          return { ok: true, user }
        } catch (err) {
          const message = errorMessage(err, 'OTP verification failed')
          log.warn('AUTH', `verifyOtp ✗ — ${message}`)
          return { ok: false, error: message, details: err?.data }
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
          await api.post(AUTH_ENDPOINTS.logout)
          log.info('AUTH', 'logout ✓ — server session cleared')
        } catch (err) {
          log.warn('AUTH', `logout — ${errorMessage(err, 'Logout failed')}`)
        }
        localStorage.removeItem('temp_email')
        set({ user: null, isAuthenticated: false, tempEmail: null })
        log.info('AUTH', 'logout ✓ — local auth state cleared')
      },

      /* ── register ─────────────────────────────────────── */
      register: async (formData) => {
        const payload = buildRegisterPayload(formData)
        log.info('AUTH', `register → name="${payload.name}" email="${payload.email}" role="${payload.role}"`)
        try {
          await api.getCsrf()
          const data = await api.post(AUTH_ENDPOINTS.register, payload)
          const email = data?.email || payload.email
          localStorage.setItem('temp_email', email)
          set({ tempEmail: email })
          log.info('AUTH', `register ✓ — created account for "${email}" (real API)`)
          return { ok: true, email, phone_number: payload.phone_number, data }
        } catch (err) {
          const message = errorMessage(err, 'Registration failed')
          log.warn('AUTH', `register ✗ — ${message}`)
          return { ok: false, error: message, details: err?.data }
        }
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
