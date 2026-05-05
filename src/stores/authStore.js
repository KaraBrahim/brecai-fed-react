import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { AUTH_ENDPOINTS } from '@/config/auth'
import { ROLE_HOME_MAP } from '@/enums/roles'
import log from '@/lib/logger'

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

function initialsFromName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  const a = parts[0]?.[0] || ''
  const b = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (a + b).toUpperCase() || 'U'
}

function errorMessage(err, fallback) {
  return (
    err?.data?.message ||
    (typeof err?.data === 'string' ? err.data : null) ||
    err?.message ||
    fallback
  )
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
      tempPhone:       localStorage.getItem('temp_phone') || null,
      otpContext:      localStorage.getItem('otp_context') || null,
      otpMethods:      (() => {
        try {
          const raw = localStorage.getItem('otp_methods')
          return raw ? JSON.parse(raw) : null
        } catch {
          return null
        }
      })(),
      otpMethod:       localStorage.getItem('otp_method') || null,

      /* ── Computed helper (call as a function) ─────────── */
      userRole: () => resolveUserRole(get().user),

      /* ── fetchUser ────────────────────────────────────── */
      fetchUser: async () => {
        if (get().isInitialized) return
        try {
          const data = await api.get(AUTH_ENDPOINTS.user)
          set({ user: data, isAuthenticated: true, isInitialized: true })
        } catch {
          set({ user: null, isAuthenticated: false, isInitialized: true })
        }
      },

      /* ── login (step 1) ───────────────────────────────── */
      login: async (email, password, device_name = 'Web') => {
        try {
          await api.getCsrf()
          const data = await api.post(AUTH_ENDPOINTS.login, { email, password, device_name })
          const phone = data?.phone_number ?? null
          const methods = phone ? ['email', 'whatsapp'] : ['email']

          localStorage.setItem('temp_email', email)
          localStorage.setItem('temp_phone', phone || '')
          localStorage.setItem('otp_context', 'login')
          localStorage.setItem('otp_methods', JSON.stringify(methods))

          set({
            tempEmail: email,
            tempPhone: phone,
            otpContext: 'login',
            otpMethods: methods,
            otpMethod: null,
          })

          return { ok: true, email, phone_number: phone, methods }
        } catch (err) {
          const message = errorMessage(err, 'Login failed')
          log.warn('AUTH', `login ✗ — ${message}`)
          return { ok: false, error: message, details: err?.data, status: err?.status }
        }
      },

      /* ── register (step 1) ────────────────────────────── */
      register: async (payload) => {
        try {
          await api.getCsrf()
          const data = await api.post(AUTH_ENDPOINTS.register, payload)
          const email = data?.email || payload?.email
          const phone = data?.phone_number ?? payload?.phone_number ?? null
          const methods = phone ? ['email', 'whatsapp'] : ['email']

          localStorage.setItem('temp_email', email)
          localStorage.setItem('temp_phone', phone || '')
          localStorage.setItem('otp_context', 'register')
          localStorage.setItem('otp_methods', JSON.stringify(methods))

          set({
            tempEmail: email,
            tempPhone: phone,
            otpContext: 'register',
            otpMethods: methods,
            otpMethod: null,
          })

          return { ok: true, email, phone_number: phone, methods, data }
        } catch (err) {
          const message = errorMessage(err, 'Registration failed')
          log.warn('AUTH', `register ✗ — ${message}`)
          return { ok: false, error: message, details: err?.data, status: err?.status }
        }
      },

      /* ── sendOtp (step 2) ─────────────────────────────── */
      sendOtp: async (method) => {
        const email = get().tempEmail
        if (!email) return { ok: false, error: 'Session expired. Please start again.' }
        try {
          await api.getCsrf()
          await api.post(AUTH_ENDPOINTS.sendOtp, { email, method })
          localStorage.setItem('otp_method', method)
          set({ otpMethod: method })
          return { ok: true }
        } catch (err) {
          const message = errorMessage(err, 'Failed to send OTP')
          log.warn('AUTH', `sendOtp ✗ — ${message}`)
          return { ok: false, error: message, details: err?.data, status: err?.status }
        }
      },

      /* ── verifyOtp (step 3) ───────────────────────────── */
      verifyOtp: async (otp) => {
        const email = get().tempEmail
        const context = get().otpContext
        if (!email || !context) return { ok: false, error: 'Session expired. Please start again.' }
        try {
          await api.getCsrf()
          const url = `${(import.meta.env.VITE_API_URL || '')}${AUTH_ENDPOINTS.verifyOtp}?context=${encodeURIComponent(context)}`
          const res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email, otp }),
          })

          const text = await res.text()
          const data = text ? JSON.parse(text) : null
          if (!res.ok) {
            const err = new Error(data?.message || `HTTP ${res.status}`)
            err.status = res.status
            err.data = data
            throw err
          }

          localStorage.removeItem('temp_email')
          localStorage.removeItem('temp_phone')
          localStorage.removeItem('otp_context')
          localStorage.removeItem('otp_methods')
          localStorage.removeItem('otp_method')
          set({ tempEmail: null, tempPhone: null, otpContext: null, otpMethods: null, otpMethod: null })

          if (res.status === 202) {
            return { ok: true, pendingApproval: true, data }
          }

          set({ isInitialized: false })
          await get().fetchUser()
          return { ok: true, user: get().user, data }
        } catch (err) {
          const message = errorMessage(err, 'OTP verification failed')
          log.warn('AUTH', `verifyOtp ✗ — ${message}`)
          return { ok: false, error: message, details: err?.data, status: err?.status }
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
        try {
          await api.getCsrf()
          await api.post(AUTH_ENDPOINTS.logout)
        } catch (err) {
          log.warn('AUTH', `logout ✗ — ${errorMessage(err, 'Logout failed')}`)
        }
        localStorage.removeItem('temp_email')
        localStorage.removeItem('temp_phone')
        localStorage.removeItem('otp_context')
        localStorage.removeItem('otp_methods')
        localStorage.removeItem('otp_method')
        set({
          user: null,
          isAuthenticated: false,
          tempEmail: null,
          tempPhone: null,
          otpContext: null,
          otpMethods: null,
          otpMethod: null,
        })
      },

      fetchOrganizationsPublic: async () => {
        try {
          const data = await api.get(AUTH_ENDPOINTS.organizationsPublic)
          return { ok: true, data }
        } catch (err) {
          const message = errorMessage(err, 'Failed to load organizations')
          return { ok: false, error: message, details: err?.data, status: err?.status }
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
