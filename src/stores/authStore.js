import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ROLE_HOME_MAP } from '@/enums/roles'
import log from '@/lib/logger'
import { firebaseAuth } from '@/lib/firebase'
import {
  RecaptchaVerifier,
  PhoneAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPhoneNumber,
  signOut,
} from 'firebase/auth'

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
  return err?.message || fallback
}

/* ── Store ───────────────────────────────────────────────────── */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      /* ── State ─────────────────────────────────────────── */
      user:            null,
      isAuthenticated: false,
      isInitialized:   false,
      tempPhone:       localStorage.getItem('temp_phone') || null,
      verificationId:  localStorage.getItem('verification_id') || null,
      pendingProfile:  (() => {
        try {
          const raw = localStorage.getItem('pending_profile')
          return raw ? JSON.parse(raw) : null
        } catch {
          return null
        }
      })(),
      _recaptcha:      null,

      /* ── Computed helper (call as a function) ─────────── */
      userRole: () => resolveUserRole(get().user),

      /* ── fetchUser ────────────────────────────────────── */
      fetchUser: async () => {
        if (get().isInitialized) return
        await new Promise((resolve) => {
          const unsub = onAuthStateChanged(
            firebaseAuth,
            async (fbUser) => {
              if (!fbUser) {
                set({ user: null, isAuthenticated: false, isInitialized: true })
                unsub()
                resolve()
                return
              }

              let role = null
              try {
                const tokenResult = await fbUser.getIdTokenResult()
                role = tokenResult?.claims?.role || tokenResult?.claims?.roles?.[0] || null
              } catch {
                role = null
              }

              const persisted = get().user
              const name = persisted?.name || fbUser.displayName || fbUser.phoneNumber || 'User'
              const user = {
                id: fbUser.uid,
                name,
                email: persisted?.email || fbUser.email || null,
                phone_number: fbUser.phoneNumber || get().tempPhone || null,
                role: role || persisted?.role || 'doctor',
                org: persisted?.org || '',
                initials: persisted?.initials || initialsFromName(name),
              }

              set({ user, isAuthenticated: true, isInitialized: true })
              unsub()
              resolve()
            },
            () => {
              set({ user: null, isAuthenticated: false, isInitialized: true })
              unsub()
              resolve()
            }
          )
        })
      },

      /* ── startLoginOtp ─────────────────────────────────── */
      startLoginOtp: async (phone, recaptchaContainerId = 'recaptcha-container') => {
        try {
          const existing = get()._recaptcha
          if (existing) {
            existing.clear()
          }

          const verifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerId, { size: 'invisible' })
          await verifier.render()
          const confirmation = await signInWithPhoneNumber(firebaseAuth, phone, verifier)

          localStorage.setItem('temp_phone', phone)
          localStorage.setItem('verification_id', confirmation.verificationId)
          localStorage.removeItem('pending_profile')

          set({
            tempPhone: phone,
            verificationId: confirmation.verificationId,
            pendingProfile: null,
            _recaptcha: verifier,
          })

          return { ok: true }
        } catch (err) {
          const message = errorMessage(err, 'Failed to send OTP')
          log.warn('AUTH', `startLoginOtp ✗ — ${message}`)
          return { ok: false, error: message }
        }
      },

      /* ── verifyOtp ────────────────────────────────────── */
      verifyOtp: async (otp) => {
        try {
          const verificationId = get().verificationId || localStorage.getItem('verification_id')
          if (!verificationId) return { ok: false, error: 'Session expired. Please request a new code.' }

          const cred = PhoneAuthProvider.credential(verificationId, otp)
          const res = await signInWithCredential(firebaseAuth, cred)
          const fbUser = res.user

          let pending = get().pendingProfile
          if (!pending) {
            try {
              const raw = localStorage.getItem('pending_profile')
              pending = raw ? JSON.parse(raw) : null
            } catch {
              pending = null
            }
          }

          const name = pending?.name || get().user?.name || fbUser.displayName || fbUser.phoneNumber || 'User'
          const user = {
            id: fbUser.uid,
            name,
            email: pending?.email || get().user?.email || fbUser.email || null,
            phone_number: fbUser.phoneNumber || get().tempPhone || null,
            role: pending?.role || get().user?.role || 'doctor',
            org: pending?.org || get().user?.org || '',
            initials: initialsFromName(name),
          }

          localStorage.removeItem('temp_phone')
          localStorage.removeItem('verification_id')
          localStorage.removeItem('pending_profile')

          set({
            user,
            isAuthenticated: true,
            tempPhone: null,
            verificationId: null,
            pendingProfile: null,
            isInitialized: true,
          })

          return { ok: true, user }
        } catch (err) {
          const message = errorMessage(err, 'OTP verification failed')
          log.warn('AUTH', `verifyOtp ✗ — ${message}`)
          return { ok: false, error: message }
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
          await signOut(firebaseAuth)
        } catch {
          null
        }
        localStorage.removeItem('temp_phone')
        localStorage.removeItem('verification_id')
        localStorage.removeItem('pending_profile')
        set({ user: null, isAuthenticated: false, tempPhone: null, verificationId: null, pendingProfile: null })
      },

      /* ── startSignUpOtp ───────────────────────────────── */
      startSignUpOtp: async (profile, recaptchaContainerId = 'recaptcha-container') => {
        const phone = profile?.phone_number || profile?.phone || ''
        if (!phone) return { ok: false, error: 'Phone number is required.' }

        try {
          const existing = get()._recaptcha
          if (existing) {
            existing.clear()
          }

          const verifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerId, { size: 'invisible' })
          await verifier.render()
          const confirmation = await signInWithPhoneNumber(firebaseAuth, phone, verifier)

          localStorage.setItem('temp_phone', phone)
          localStorage.setItem('verification_id', confirmation.verificationId)
          localStorage.setItem('pending_profile', JSON.stringify(profile))

          set({
            tempPhone: phone,
            verificationId: confirmation.verificationId,
            pendingProfile: profile,
            _recaptcha: verifier,
          })

          return { ok: true }
        } catch (err) {
          const message = errorMessage(err, 'Failed to send OTP')
          log.warn('AUTH', `startSignUpOtp ✗ — ${message}`)
          return { ok: false, error: message }
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
