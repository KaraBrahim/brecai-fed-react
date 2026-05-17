import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authApi from '@/api/api-client/auth'
import { setAuthToken } from '@/api/api-client/client'
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

function errorMessage(err, fallback) {
  return (
    err?.response?.data?.message ||
    (typeof err?.response?.data === 'string' ? err.response.data : null) ||
    err?.data?.message ||
    err?.message ||
    fallback
  )
}

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
      // Called on app mount. Hits GET /api/auth/me — the request automatically
      // carries the HttpOnly session cookie (withCredentials:true) OR a Bearer
      // token from localStorage if the backend issued one. A 401 means no active
      // session; any other error is logged and treated as unauthenticated.
      // force=true bypasses the isInitialized / _fetchingUser guards (used after
      // verifyOtp when we already know authentication just succeeded).
      fetchUser: async ({ force = false } = {}) => {
        if (!force && (get().isInitialized || get()._fetchingUser)) return
        if (get()._fetchingUser) return

        set({ _fetchingUser: true })
        log.info('AUTH', `fetchUser → GET /api/auth/me${force ? ' (forced)' : ''}`)

        try {
          const data = await authApi.me()
          const role = resolveUserRole(data)
          log.info('AUTH', `fetchUser ✓ — "${data?.name}" [${role}]`)
          set({ user: data, isAuthenticated: true, isInitialized: true, _fetchingUser: false })
        } catch (err) {
          const status = err?.response?.status ?? err?.status
          set({ _fetchingUser: false })
          if (status === 401) {
            log.info('AUTH', 'fetchUser — no active session (401), guest state')
          } else {
            log.warn('AUTH', `fetchUser ✗ — ${errorMessage(err, 'unknown error')} (HTTP ${status ?? 'network'})`)
          }
          set({ user: null, isAuthenticated: false, isInitialized: true })
        }
      },

      /* ── login (step 1) ───────────────────────────────── */
      // POST /api/auth/login — validates credentials, backend sends OTP.
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
      // POST /api/auth/register — creates account. Backend sends OTP automatically.
      register: async (payload) => {
        log.info('AUTH', `register → "${payload?.email}"`)
        try {
          const data = await authApi.register({
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

      /* ── sendOtp ──────────────────────────────────────── */
      // POST /api/auth/send-otp — dispatches a 6-digit code via email.
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

      /* ── verifyOtp ────────────────────────────────────── */
      // POST /api/auth/verify-otp → { message, user, token? }
      //
      // The response always includes the authenticated `user` object.
      // If the backend also returns a Bearer `token` the api-client stores it
      // automatically (setAuthToken). For cookie-based Sanctum backends the
      // HttpOnly session cookie is already set by this response — no token needed.
      //
      // We set auth state directly from the response user so we never need a
      // second round-trip to /api/auth/me just to read back what we already have.
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

          // Prefer the user object embedded in the response body.
          // If absent (some backends omit it), fall back to a fresh /me call.
          const user = data?.user ?? null

          if (user) {
            const role = resolveUserRole(user)
            log.info('AUTH', `verifyOtp ✓ — session for "${user?.name}" [${role}]`)
            // Set auth state atomically — clears OTP transient state at the same time
            // so RequireOtp never sees the unauthenticated+no-tempEmail flash.
            set({ user, isAuthenticated: true, isInitialized: true, tempEmail: null, otpContext: null })
          } else {
            // Fallback: backend didn't return user in response — fetch via /me.
            // This also works for pure-cookie Sanctum (cookie is now set on this response).
            log.info('AUTH', 'verifyOtp — no user in response, fetching via /api/auth/me …')
            await get().fetchUser({ force: true })
            set({ tempEmail: null, otpContext: null })
          }

          return { ok: true, user: get().user, data }
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
      logout: async () => {
        log.info('AUTH', 'logout →')
        try {
          await authApi.logout()
          log.info('AUTH', 'logout ✓ — server session revoked')
        } catch (err) {
          setAuthToken(null)
          log.warn('AUTH', `logout ✗ — ${errorMessage(err, 'Logout failed')} (local state cleared anyway)`)
        }
        lsClear('temp_email', 'otp_context')
        set({ user: null, isAuthenticated: false, tempEmail: null, otpContext: null })
        log.info('AUTH', 'logout ✓ — local auth state cleared')
      },

      /* ── fetchOrganizationsPublic ──────────────────────── */
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
