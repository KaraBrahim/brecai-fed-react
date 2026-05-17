import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ROLE_HOME_MAP } from '@/enums/roles'
import log from '@/lib/logger'

/* ── GuestOnly ────────────────────────────────────────────────
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
   - Unauthenticated → /auth
   - Wrong role → role home
   - Org manager, org pending → /app/org/pending
   - Org manager, no active subscription → /app/org/subscribe
──────────────────────────────────────────────────────────────── */
export function RequireAuth({ children, role }) {
  const { isAuthenticated, userRole, getRoleHome, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    log.info('GUARD', `RequireAuth — unauthenticated, redirecting to /auth`)
    return <Navigate to="/auth" replace />
  }

  const current = userRole()

  if (role && current && current !== role) {
    const home = getRoleHome()
    log.warn('GUARD', `RequireAuth — role mismatch (required="${role}", current="${current}"), redirecting to "${home}"`)
    return <Navigate to={home} replace />
  }

  // ── Org Manager gates ──────────────────────────────────────
  if (current === 'org_manager') {
    const orgStatus = user?.organization?.status
    const subStatus = user?.organization?.subscription_status
    const path      = location.pathname

    // Gate 1: Org pending — only /app/org/pending is allowed
    if ((orgStatus === 'pending' || !orgStatus) && path !== '/app/org/pending') {
      log.info('GUARD', 'RequireAuth — org pending, redirecting to /app/org/pending')
      return <Navigate to="/app/org/pending" replace />
    }

    // Gate 2: Org active but no active subscription — only /app/org/subscribe is allowed
    if (orgStatus === 'active' && subStatus !== 'active' && path !== '/app/org/subscribe') {
      log.info('GUARD', 'RequireAuth — no active subscription, redirecting to /app/org/subscribe')
      return <Navigate to="/app/org/subscribe" replace />
    }
  }

  return children
}

/* ── RequireOtp ───────────────────────────────────────────────
   - Authenticated → role home
   - No temp email → /auth
──────────────────────────────────────────────────────────────── */
export function RequireOtp({ children }) {
  const { isAuthenticated, tempEmail, getRoleHome, userRole } = useAuthStore()

  if (isAuthenticated) {
    const home = getRoleHome()
    log.info('GUARD', `RequireOtp — already authenticated [${userRole()}], redirecting to "${home}"`)
    return <Navigate to={home} replace />
  }

  if (!tempEmail) {
    return <Navigate to="/auth" replace />
  }

  log.debug('GUARD', `RequireOtp ✓ — pending OTP session for "${tempEmail}", rendering OTP page`)
  return children
}

/* ── CatchAll ─────────────────────────────────────────────────
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
