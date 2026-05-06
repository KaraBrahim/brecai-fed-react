import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { AUTH_ENDPOINTS } from '@/config/auth'
import { ROLE_HOME_MAP } from '@/enums/roles'
import log from '@/lib/logger'

/* ── Role helpers (UI display metadata) ─────────────────────── */
export const ROLE_HOME = ROLE_HOME_MAP

export const ROLE_META = {
  doctor:      { accent: '#0572B2', gradFrom: '#0572B2', gradTo: '#0BB592', badge: 'Clinician',      tagline: 'AI-assisted breast cancer subtyping' },
  instructor:  { accent: '#7C3AED', gradFrom: '#7C3AED', gradTo: '#6D28D9', badge: 'Data Scientist', tagline: 'Train, inspect and federate ML models' },
  org_manager: { accent: '#D97706', gradFrom: '#D97706', gradTo: '#EA580C', badge: 'Site Admin',     tagline: 'Team roster, compliance and access' },
  admin:       { accent: '#334155', gradFrom: '#1e293b', gradTo: '#334155', badge: 'Platform Admin', tagline: 'Full system control and billing' },
  // Legacy display-name aliases
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

/** Extract the best human-readable message from an axios-normalised error */
function errorMessage(err, fallback) {
  return (
    err?.data?.message  ||
    (typeof err?.data === 'string' ? err.data : null) ||
    err?.message        ||
    fallback
  )
}

/* ── localStorage helpers ────────────────────────────────────── */
function lsSet(key, val) {
  if (val == null || val === '') localStorage.removeItem(key)
  else localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : String(val))
}
function lsClear(...keys) { keys.forEach(k => localStorage.removeItem(k)) }

/* ── Store ───────────────────────────────────────────────────── */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      /* ── State ─────────────────────────────────────────── */
      user:            null,
      isAuthenticated: false,
      isInitialized:   false,
      _fetchingUser:   false,

      // OTP-flow transient state — re-hydrated from localStorage on mount
      tempEmail:  localStorage.getItem('temp_email')   || null,
      otpContext: localStorage.getItem('otp_context')  || null,

      /* ── Computed helper ──────────────────────────────── */
      userRole: () => resolveUserRole(get().user),

      /* ── fetchUser ────────────────────────────────────── */
      // force=true: bypass isInitialized guard (used after verifyOtp so the spinner
      // never flashes and OtpPage stays mounted → its navigate() fires correctly).
      fetchUser: async ({ force = false } = {}) => {
        if (!force && (get().isInitialized || get()._fetchingUser)) return
        if (get()._fetchingUser) return
        set({ _fetchingUser: true })

        log.info('AUTH', `fetchUser → GET ${AUTH_ENDPOINTS.user}${force ? ' (forced)' : ''}`)
        try {
          // The axios instance has withCredentials:true — the HttpOnly session
          // cookie is sent automatically, no manual token needed.
          const data = await api.get(AUTH_ENDPOINTS.user)
          const role = resolveUserRole(data)
          log.info('AUTH', `fetchUser ✓ — authenticated as "${data?.name}" [${role}]`)
          set({ user: data, isAuthenticated: true, isInitialized: true, _fetchingUser: false })
        } catch (err) {
          set({ _fetchingUser: false })
          if (err.isUnauthenticated) {
            // 401 = no active session — perfectly normal on first load for guests
            log.info('AUTH', 'fetchUser — no active session (401), guest state')
          } else {
            log.warn('AUTH', `fetchUser ✗ — ${err.message}`)
          }
          if (!force) {
            set({ user: null, isAuthenticated: false, isInitialized: true })
          } else {
            // After OTP, a 401 here means the session cookie wasn't issued properly.
            // Keep isInitialized true so the app doesn't freeze on spinner.
            set({ isInitialized: true })
          }
        }
      },

      /* ── login (step 1) ───────────────────────────────── */
      login: async (email, password, device_name = 'Web') => {
        log.info('AUTH', `login → "${email}"`)
        try {
          await api.getCsrf()
          await api.post(AUTH_ENDPOINTS.login, { email, password, device_name })

          lsSet('temp_email',  email)
          lsSet('otp_context', 'login')

          set({ tempEmail: email, otpContext: 'login' })
          log.info('AUTH', `login ✓ — OTP flow started for "${email}"`)
          return { ok: true, email }
        } catch (err) {
          const msg = errorMessage(err, 'Login failed')
          log.warn('AUTH', `login ✗ — ${msg}`)
          return { ok: false, error: msg, details: err?.data, status: err?.status }
        }
      },

      /* ── register (step 1) ────────────────────────────── */
      register: async (payload) => {
        log.info('AUTH', `register → "${payload?.email}"`)
        try {
          await api.getCsrf()
          const data  = await api.post(AUTH_ENDPOINTS.register, payload)
          const email = data?.email || payload?.email

          lsSet('temp_email',  email)
          lsSet('otp_context', 'register')

          set({ tempEmail: email, otpContext: 'register' })
          log.info('AUTH', `register ✓ — OTP flow started for "${email}"`)
          return { ok: true, email, data }
        } catch (err) {
          const msg = errorMessage(err, 'Registration failed')
          log.warn('AUTH', `register ✗ — ${msg}`)
          return { ok: false, error: msg, details: err?.data, status: err?.status }
        }
      },

      /* ── sendOtp (step 2) — email only ────────────────── */
      sendOtp: async () => {
        const email = get().tempEmail
        if (!email) return { ok: false, error: 'Session expired. Please start again.' }

        log.info('AUTH', `sendOtp → email="${email}"`)
        try {
          await api.getCsrf()
          await api.post(AUTH_ENDPOINTS.sendOtp, { email, method: 'email' })
          log.info('AUTH', 'sendOtp ✓ — code sent via email')
          return { ok: true }
        } catch (err) {
          const msg = errorMessage(err, 'Failed to send OTP')
          log.warn('AUTH', `sendOtp ✗ — ${msg} (HTTP ${err?.status})`)
          return { ok: false, error: msg, details: err?.data, status: err?.status }
        }
      },

      /* ── verifyOtp (step 3) ───────────────────────────── */
      // Uses axios (withCredentials:true) so the session cookie the backend sets
      // in this response is automatically stored and sent on the next GET /api/user.
      verifyOtp: async (otp) => {
        const email   = get().tempEmail
        const context = get().otpContext
        if (!email || !context) return { ok: false, error: 'Session expired. Please start again.' }

        log.info('AUTH', `verifyOtp → email="${email}" context="${context}"`)
        try {
          await api.getCsrf()
          // Pass context as a query param so the backend knows login vs register
          const data = await api.post(
            `${AUTH_ENDPOINTS.verifyOtp}?context=${encodeURIComponent(context)}`,
            { email, otp },
          )

          // Clear localStorage keys immediately (safe — no component reads them synchronously).
          // Do NOT update Zustand state yet: RequireOtp checks both isAuthenticated AND tempEmail.
          // If we set tempEmail=null before isAuthenticated=true, RequireOtp briefly sees
          // "no session + no tempEmail" and fires <Navigate to="/auth"> — the login flash.
          lsClear('temp_email', 'otp_context')

          // 202 = account registered but needs org-manager approval
          if (data?._status === 202 || data?.pending_approval) {
            log.info('AUTH', 'verifyOtp — account pending approval')
            set({ tempEmail: null, otpContext: null })
            return { ok: true, pendingApproval: true, data }
          }

          // Fetch authenticated user using the newly-issued session cookie.
          // force=true keeps isInitialized=true so the global spinner never shows.
          log.info('AUTH', 'verifyOtp ✓ — fetching user with new session ...')
          await get().fetchUser({ force: true })

          // Clear OTP state AFTER isAuthenticated=true is set so RequireOtp
          // never sees the unauthenticated+no-tempEmail state that caused the login flash.
          set({ tempEmail: null, otpContext: null })

          const user = get().user
          log.info('AUTH', `verifyOtp — session established for "${user?.name}" [${resolveUserRole(user)}]`)
          return { ok: true, user, data }
        } catch (err) {
          const msg = errorMessage(err, 'OTP verification failed')
          log.warn('AUTH', `verifyOtp ✗ — ${msg}`)
          return { ok: false, error: msg, details: err?.data, status: err?.status }
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
          await api.getCsrf()
          await api.post(AUTH_ENDPOINTS.logout)
          log.info('AUTH', 'logout ✓ — server session destroyed')
        } catch (err) {
          log.warn('AUTH', `logout ✗ — ${errorMessage(err, 'Logout failed')} (clearing local state anyway)`)
        }
        lsClear('temp_email', 'otp_context')
        set({ user: null, isAuthenticated: false, tempEmail: null, otpContext: null })
        log.info('AUTH', 'logout ✓ — local auth state cleared')
      },

      /* ── fetchOrganizationsPublic ──────────────────────── */
      fetchOrganizationsPublic: async () => {
        try {
          const data = await api.get(AUTH_ENDPOINTS.organizationsPublic)
          return { ok: true, data }
        } catch (err) {
          return { ok: false, error: errorMessage(err, 'Failed to load organizations'), details: err?.data, status: err?.status }
        }
      },
    }),
    {
      name: 'brecai-auth',
      // Only persist the user identity — all session flags are re-derived on load
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
)
