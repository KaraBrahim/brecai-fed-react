import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authApi from '@/api/api-client/auth'
import { getAuthToken, setAuthToken } from '@/api/api-client/client'
import { ROLE_HOME_MAP } from '@/enums/roles'
import log from '@/lib/logger'

/* ── Role / UI metadata ──────────────────────────────────────── */
export const ROLE_HOME = ROLE_HOME_MAP

export const ROLE_META = {
  doctor:      { accent: '#0572B2', gradFrom: '#0572B2', gradTo: '#0BB592', badge: 'Clinician',      tagline: 'AI-assisted breast cancer subtyping' },
  instructor:  { accent: '#7C3AED', gradFrom: '#7C3AED', gradTo: '#6D28D9', badge: 'Data Scientist', tagline: 'Train, inspect and federate ML models' },
  org_manager: { accent: '#D97706', gradFrom: '#D97706', gradTo: '#EA580C', badge: 'Site Admin',     tagline: 'Team roster, compliance and access' },
  admin:       { accent: '#334155', gradFrom: '#1e293b', gradTo: '#334155', badge: 'Platform Admin', tagline: 'Full system control and billing' },
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

/** Extract a human-readable message from an axios error */
function errorMessage(err, fallback) {
  return (
    err?.response?.data?.message ||
    (typeof err?.response?.data === 'string' ? err.response.data : null) ||
    err?.message ||
    fallback
  )
}

/* ── localStorage helpers ────────────────────────────────────── */
function lsSet(key, val) {
  if (val == null || val === '') localStorage.removeItem(key)
  else localStorage.setItem(key, String(val))
}
function lsClear(...keys) { keys.forEach(k => localStorage.removeItem(k)) }

/* ── Store ───────────────────────────────────────────────────── */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      /* ── State ────────────────────────────────────────── */
      user:            null,
      isAuthenticated: false,
      isInitialized:   false,
      _fetchingUser:   false,

      tempEmail:  localStorage.getItem('temp_email')  || null,
      otpContext: localStorage.getItem('otp_context') || null,

      /* ── Computed ─────────────────────────────────────── */
      userRole: () => resolveUserRole(get().user),

      /* ── fetchUser ────────────────────────────────────── */
      // Called on app mount (RootLayout). Checks for a stored Bearer token
      // and, if present, calls GET /api/auth/me to validate it and load the user.
      // force=true bypasses the isInitialized guard (used after verifyOtp).
      fetchUser: async ({ force = false } = {}) => {
        if (!force && (get().isInitialized || get()._fetchingUser)) return
        if (get()._fetchingUser) return

        const token = getAuthToken()
        if (!token) {
          log.info('AUTH', 'fetchUser — no token in storage, guest state')
          set({ user: null, isAuthenticated: false, isInitialized: true, _fetchingUser: false })
          return
        }

        set({ _fetchingUser: true })
        log.info('AUTH', `fetchUser → GET /api/auth/me${force ? ' (forced)' : ''}`)

        try {
          const data = await authApi.me()
          const role = resolveUserRole(data)
          log.info('AUTH', `fetchUser ✓ — "${data?.name}" [${role}]`)
          set({ user: data, isAuthenticated: true, isInitialized: true, _fetchingUser: false })
        } catch (err) {
          const status = err?.response?.status
          set({ _fetchingUser: false })
          if (status === 401) {
            log.info('AUTH', 'fetchUser — token invalid/expired (401), clearing')
            setAuthToken(null)
          } else {
            log.warn('AUTH', `fetchUser ✗ — ${errorMessage(err, 'unknown error')}`)
          }
          set({ user: null, isAuthenticated: false, isInitialized: true })
        }
      },

      /* ── login (step 1) ───────────────────────────────── */
      // POST /api/auth/login — validates credentials, triggers OTP flow.
      // Returns { message, email, phone_number } on success (no token yet).
      login: async (email, password) => {
        log.info('AUTH', `login → "${email}"`)
        try {
          await authApi.login({ email, password })

          lsSet('temp_email',  email)
          lsSet('otp_context', 'login')
          set({ tempEmail: email, otpContext: 'login' })

          log.info('AUTH', `login ✓ — OTP flow started for "${email}"`)
          return { ok: true, email }
        } catch (err) {
          const msg = errorMessage(err, 'Login failed')
          log.warn('AUTH', `login ✗ — ${msg}`)
          return { ok: false, error: msg }
        }
      },

      /* ── register ─────────────────────────────────────── */
      // POST /api/auth/register — creates account, server sends OTP automatically.
      // payload shape mirrors auth.js JSDoc (name, email, password,
      // password_confirmation, role, phone_number, organization_id, etc.)
      register: async (payload) => {
        log.info('AUTH', `register → "${payload?.email}"`)
        try {
          const data  = await authApi.register({
            ...payload,
            password_confirmation: payload.password_confirmation ?? payload.confirm ?? payload.password,
          })
          const email = data?.user?.email || data?.email || payload?.email

          lsSet('temp_email',  email)
          lsSet('otp_context', 'register')
          set({ tempEmail: email, otpContext: 'register' })

          log.info('AUTH', `register ✓ — OTP flow started for "${email}"`)
          return { ok: true, email, data }
        } catch (err) {
          const msg = errorMessage(err, 'Registration failed')
          log.warn('AUTH', `register ✗ — ${msg}`)
          return { ok: false, error: msg, details: err?.response?.data }
        }
      },

      /* ── sendOtp (step 2) ─────────────────────────────── */
      // POST /api/auth/send-otp — sends code via email.
      sendOtp: async () => {
        const email = get().tempEmail
        if (!email) return { ok: false, error: 'Session expired. Please start again.' }

        log.info('AUTH', `sendOtp → email="${email}"`)
        try {
          await authApi.sendOtp({ email, method: 'email' })
          log.info('AUTH', 'sendOtp ✓ — code dispatched via email')
          return { ok: true }
        } catch (err) {
          const msg = errorMessage(err, 'Failed to send OTP')
          log.warn('AUTH', `sendOtp ✗ — ${msg}`)
          return { ok: false, error: msg }
        }
      },

      /* ── verifyOtp (step 3) ───────────────────────────── */
      // POST /api/auth/verify-otp — validates the code.
      // auth.js automatically stores the returned Bearer token via setAuthToken().
      // After that we call auth.me() to load the full user object.
      verifyOtp: async (otp) => {
        const email   = get().tempEmail
        const context = get().otpContext
        if (!email || !context) return { ok: false, error: 'Session expired. Please start again.' }

        log.info('AUTH', `verifyOtp → email="${email}" context="${context}"`)
        try {
          const data = await authApi.verifyOtp({ email, otp })

          // Clear OTP localStorage keys immediately
          lsClear('temp_email', 'otp_context')

          // 202 = registered but pending org-manager approval
          if (data?._status === 202 || data?.pending_approval) {
            log.info('AUTH', 'verifyOtp — account pending approval')
            set({ tempEmail: null, otpContext: null })
            return { ok: true, pendingApproval: true, data }
          }

          // Token is already stored by authApi.verifyOtp — now fetch the user
          log.info('AUTH', 'verifyOtp ✓ — token stored, fetching user via /api/auth/me …')
          await get().fetchUser({ force: true })

          // Clear OTP state after isAuthenticated=true to avoid RequireOtp flash
          set({ tempEmail: null, otpContext: null })

          const user = get().user
          log.info('AUTH', `verifyOtp — session established for "${user?.name}" [${resolveUserRole(user)}]`)
          return { ok: true, user, data }
        } catch (err) {
          const msg = errorMessage(err, 'OTP verification failed')
          log.warn('AUTH', `verifyOtp ✗ — ${msg}`)
          return { ok: false, error: msg, details: err?.response?.data }
        }
      },

      /* ── getRoleHome ──────────────────────────────────── */
      getRoleHome: () => {
        const role = get().userRole()
        const home = ROLE_HOME[role] || '/app/doctor'
        log.debug('AUTH', `getRoleHome → role="${role}" → "${home}"`)
        return home
      },

      /* ── logout ───────────────────────────────────────── */
      // POST /api/auth/logout — revokes the token server-side.
      // authApi.logout() also calls setAuthToken(null) to clear localStorage.
      logout: async () => {
        log.info('AUTH', 'logout →')
        try {
          await authApi.logout()
          log.info('AUTH', 'logout ✓ — server token revoked')
        } catch (err) {
          // Best-effort — clear local state regardless
          setAuthToken(null)
          log.warn('AUTH', `logout ✗ — ${errorMessage(err, 'Logout failed')} (local state cleared anyway)`)
        }
        lsClear('temp_email', 'otp_context')
        set({ user: null, isAuthenticated: false, tempEmail: null, otpContext: null })
        log.info('AUTH', 'logout ✓ — local auth state cleared')
      },

      /* ── fetchOrganizationsPublic ──────────────────────── */
      // GET /api/auth/organizations — no auth required.
      fetchOrganizationsPublic: async () => {
        try {
          const data = await authApi.getOrganizations()
          return { ok: true, data }
        } catch (err) {
          return { ok: false, error: errorMessage(err, 'Failed to load organizations'), details: err?.response?.data }
        }
      },
    }),
    {
      name: 'brecai-auth',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
)
