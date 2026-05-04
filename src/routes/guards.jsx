import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ROLE_HOME_MAP } from '@/enums/roles'

/* ── GuestOnly ────────────────────────────────────────────────
   Mirrors Vue's { meta: { guestOnly: true } } guard.
   Authenticated users are redirected to their role home.
──────────────────────────────────────────────────────────────── */
export function GuestOnly({ children }) {
  const { isAuthenticated, getRoleHome } = useAuthStore()
  if (isAuthenticated) {
    return <Navigate to={getRoleHome()} replace />
  }
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
    return <Navigate to="/auth" replace />
  }

  if (role) {
    const current = userRole()
    if (current && current !== role) {
      return <Navigate to={getRoleHome()} replace />
    }
  }

  return children
}

/* ── CatchAll ─────────────────────────────────────────────────
   Mirrors Vue's 404 catch-all:
   - Authenticated → role home
   - Guest → landing
──────────────────────────────────────────────────────────────── */
export function CatchAll() {
  const { isAuthenticated, getRoleHome } = useAuthStore()
  return <Navigate to={isAuthenticated ? getRoleHome() : '/'} replace />
}
