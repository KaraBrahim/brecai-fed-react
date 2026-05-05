import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ROLE_HOME_MAP } from '@/enums/roles'
import log from '@/lib/logger'

/* ── GuestOnly ────────────────────────────────────────────────
   Mirrors Vue's { meta: { guestOnly: true } } guard.
   Authenticated users are redirected to their role home.
──────────────────────────────────────────────────────────────── */
export function GuestOnly({ children }) {
  const { isAuthenticated, getRoleHome, userRole } = useAuthStore()

  if (isAuthenticated) {
    const home = getRoleHome()
    log.info('GUARD', `GuestOnly — authenticated [${userRole()}], redirecting to "${home}"`)
    return <Navigate to={home} replace />
  }

  log.debug('GUARD', 'GuestOnly — guest user, rendering auth page')
  return children
}

/* ── RequireAuth ──────────────────────────────────────────────
   Mirrors Vue's { meta: { requiresAuth: true, role: '...' } }.
   - Unauthenticated users → /auth
   - Wrong role → their correct role home
──────────────────────────────────────────────────────────────── */
export function RequireAuth({ children, role }) {
  const { isAuthenticated, userRole, getRoleHome } = useAuthStore()

  if (!isAuthenticated) {
    log.info('GUARD', `RequireAuth — unauthenticated, redirecting to /auth`)
    return <Navigate to="/auth" replace />
  }

  if (role) {
    const current = userRole()
    if (current && current !== role) {
      const home = getRoleHome()
      log.warn('GUARD', `RequireAuth — role mismatch (required="${role}", current="${current}"), redirecting to "${home}"`)
      return <Navigate to={home} replace />
    }
    log.debug('GUARD', `RequireAuth ✓ — role="${current}" matches requirement, access granted`)
  } else {
    log.debug('GUARD', `RequireAuth ✓ — authenticated [${userRole()}], no role restriction, access granted`)
  }

  return children
}

/* ── RequireOtp ───────────────────────────────────────────────
   Mirrors Vue's { meta: { requiresOtp: true } }.
   - Authenticated users → role home
   - No temp email → /auth
──────────────────────────────────────────────────────────────── */
export function RequireOtp({ children }) {
  const { isAuthenticated, tempPhone, pendingProfile, getRoleHome, userRole } = useAuthStore()

  if (isAuthenticated) {
    const home = getRoleHome()
    log.info('GUARD', `RequireOtp — already authenticated [${userRole()}], redirecting to "${home}"`)
    return <Navigate to={home} replace />
  }

  if (!tempPhone || !pendingProfile) {
    log.warn('GUARD', 'RequireOtp — no pending sign-up OTP session, redirecting to /auth')
    return <Navigate to="/auth" replace />
  }

  log.debug('GUARD', `RequireOtp ✓ — pending sign-up OTP session for "${tempPhone}", rendering OTP page`)
  return children
}

/* ── CatchAll ─────────────────────────────────────────────────
   Mirrors Vue's 404 catch-all:
   - Authenticated → role home
   - Guest → landing
──────────────────────────────────────────────────────────────── */
export function CatchAll() {
  const { isAuthenticated, getRoleHome, userRole } = useAuthStore()

  if (isAuthenticated) {
    const home = getRoleHome()
    log.warn('GUARD', `CatchAll — authenticated [${userRole()}], unknown route → "${home}"`)
    return <Navigate to={home} replace />
  }

  log.warn('GUARD', 'CatchAll — guest, unknown route → "/"')
  return <Navigate to="/" replace />
}
