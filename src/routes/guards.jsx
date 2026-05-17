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
   - Org manager with pending org → /app/org/pending
   - Org manager with no active subscription → /app/org/subscribe
──────────────────────────────────────────────────────────────── */
export function RequireAuth({ children, role }) {
  const { isAuthenticated, userRole, getRoleHome, user } = useAuthStore()

  if (!isAuthenticated) {
    log.info('GUARD', `RequireAuth — unauthenticated, redirecting to /auth`)
    return <Navigate to="/auth" replace />
  }

  const current = userRole()

  if (role) {
    if (current && current !== role) {
      const home = getRoleHome()
      log.warn('GUARD', `RequireAuth — role mismatch (required="${role}", current="${current}"), redirecting to "${home}"`)
      return <Navigate to={home} replace />
    }
    log.debug('GUARD', `RequireAuth ✓ — role="${current}" matches requirement, access granted`)
  } else {
    log.debug('GUARD', `RequireAuth ✓ — authenticated [${current}], no role restriction, access granted`)
  }

  // ── Org Manager gates ──────────────────────────────────────
  if (current === 'org_manager') {
    const orgStatus = user?.organization?.status
    const subStatus = user?.organization?.subscription_status

    // Gate 1: Org pending approval — only allow /app/org/pending
    if (orgStatus === 'pending' || !orgStatus) {
      const isPendingRoute = typeof children?.props?.children === 'object'
        ? false
        : false
      // Allow the pending page itself to render (checked by path below)
      const currentPath = window.location.pathname
      if (currentPath !== '/app/org/pending') {
        log.info('GUARD', 'RequireAuth — org pending, redirecting to /app/org/pending')
        return <Navigate to="/app/org/pending" replace />
      }
    }

    // Gate 2: Org active but no active subscription — only allow /app/org/subscribe
    if (orgStatus === 'active' && subStatus !== 'active') {
      const currentPath = window.location.pathname
      if (currentPath !== '/app/org/subscribe') {
        log.info('GUARD', 'RequireAuth — no active subscription, redirecting to /app/org/subscribe')
        return <Navigate to="/app/org/subscribe" replace />
      }
    }
  }

  return children
}

/* ── RequireOtp ───────────────────────────────────────────────
   Mirrors Vue's { meta: { requiresOtp: true } }.
   - Authenticated users → role home
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
