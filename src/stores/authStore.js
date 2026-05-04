import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { ROLE_HOME_MAP } from '@/enums/roles'

/* ── Demo data (preserved for quick-access UI) ─────────────── */
export const DEMO_ACCOUNTS = [
  {
    id: 'USR-001',
    name: 'Dr. Mounia Benali',
    email: 'mounia.benali@chu-oran.dz',
    password: 'demo',
    role: 'doctor',
    org: 'CHU Oran',
    initials: 'MB',
    specialty: 'Oncology · Breast Cancer',
  },
  {
    id: 'USR-004',
    name: 'Prof. Linda Ferhat',
    email: 'l.ferhat@usthb.dz',
    password: 'demo',
    role: 'instructor',
    org: 'USTHB Research',
    initials: 'LF',
    specialty: 'Federated ML · Model Training',
  },
  {
    id: 'USR-005',
    name: 'Sara Hammadi',
    email: 'sara.h@chu-oran.dz',
    password: 'demo',
    role: 'org_manager',
    org: 'CHU Oran',
    initials: 'SH',
    specialty: 'Site Management · Compliance',
  },
  {
    id: 'USR-006',
    name: 'Omar Belkacem',
    email: 'omar.b@brecai.io',
    password: 'demo',
    role: 'admin',
    org: 'BRECAI HQ',
    initials: 'OB',
    specialty: 'Platform Admin · Infrastructure',
  },
]

export const DEMO_ORGS = [
  { id: 1, name: 'CHU Oran',                  city: 'Oran',        type: 'hospital' },
  { id: 2, name: 'CHU Algiers',               city: 'Algiers',     type: 'hospital' },
  { id: 3, name: 'CHU Constantine',           city: 'Constantine', type: 'hospital' },
  { id: 4, name: 'USTHB Research',            city: 'Algiers',     type: 'laboratory' },
  { id: 5, name: 'CHU Tlemcen',               city: 'Tlemcen',     type: 'hospital' },
  { id: 6, name: 'CHU Annaba',                city: 'Annaba',      type: 'hospital' },
  { id: 7, name: 'CHU Batna',                 city: 'Batna',       type: 'hospital' },
  { id: 8, name: 'Clinique Es-Salam',         city: 'Setif',       type: 'clinic' },
  { id: 9, name: 'Centre de Radiologie Oran', city: 'Oran',        type: 'radiology_center' },
]

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
function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function makeInitials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

function resolveUserRole(user) {
  if (!user) return null
  if (user?.roles?.length > 0) return user.roles[0].name
  return user?.role || null
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
      _pendingOtp:     null, // demo mode only, not persisted

      /* ── Computed helper (call as a function) ─────────── */
      userRole: () => resolveUserRole(get().user),

      /* ── fetchUser ────────────────────────────────────── */
      // Mirrors Vue: tries real API first, falls back gracefully.
      fetchUser: async () => {
        try {
          const data = await api.get('/api/user')
          set({ user: data, isAuthenticated: true, isInitialized: true })
        } catch {
          // No backend or not authenticated — check for a persisted demo user
          const persisted = get().user
          if (persisted && get().isAuthenticated) {
            set({ isInitialized: true })
          } else {
            set({ user: null, isAuthenticated: false, isInitialized: true })
          }
        }
      },

      /* ── login ────────────────────────────────────────── */
      // Mirrors Vue auth store: POST /api/login → stores tempEmail → ready for OTP.
      // Falls back to demo requestOtp logic if no backend is reachable.
      login: async (email, password) => {
        try {
          await api.getCsrf()
          await api.post('/api/login', { email, password })
          localStorage.setItem('temp_email', email)
          set({ tempEmail: email })
          return { ok: true, email }
        } catch {
          // Demo fallback
          return get()._demoRequestOtp(email, password)
        }
      },

      /* ── verifyOtp ────────────────────────────────────── */
      // Mirrors Vue: POST /api/verify-otp → fetchUser → redirectBasedOnRole.
      // Falls back to demo verification.
      verifyOtp: async (otp) => {
        const { tempEmail, _pendingOtp } = get()

        try {
          await api.post('/api/verify-otp', { email: tempEmail, otp })
          localStorage.removeItem('temp_email')
          set({ tempEmail: null, _pendingOtp: null, isInitialized: false })
          await get().fetchUser()
          const user = get().user
          return { ok: true, user }
        } catch {
          // Demo fallback: verify locally
          if (!tempEmail || !_pendingOtp) {
            return { ok: false, error: 'Session expired. Please start again.' }
          }
          if (otp.trim() !== _pendingOtp) {
            return { ok: false, error: 'Incorrect code. Try again.' }
          }
          // Find demo user and authenticate
          const found = DEMO_ACCOUNTS.find(
            u => u.email.toLowerCase() === tempEmail.toLowerCase()
          )
          if (!found) return { ok: false, error: 'User not found.' }
          const { password: _p, ...user } = found
          localStorage.removeItem('temp_email')
          set({ user, isAuthenticated: true, tempEmail: null, _pendingOtp: null })
          return { ok: true, user }
        }
      },

      /* ── redirectBasedOnRole ──────────────────────────── */
      // Returns the correct path for the current user's role.
      // Navigation itself is handled by the caller (components).
      getRoleHome: () => {
        const role = get().userRole()
        return ROLE_HOME[role] || '/app/doctor'
      },

      /* ── logout ───────────────────────────────────────── */
      logout: async () => {
        try {
          await api.post('/api/logout')
        } catch { /* ignore — always clear local state */ }
        localStorage.removeItem('temp_email')
        set({
          user:            null,
          isAuthenticated: false,
          tempEmail:       null,
          _pendingOtp:     null,
        })
      },

      /* ── loginAs ──────────────────────────────────────── */
      // Demo quick-access: bypasses OTP.
      loginAs: (role) => {
        const found = DEMO_ACCOUNTS.find(u => u.role === role)
        if (!found) return null
        const { password: _p, ...user } = found
        set({ user, isAuthenticated: true, tempEmail: null, _pendingOtp: null })
        return user
      },

      /* ── requestOtp (legacy UI compat) ───────────────── */
      // Called directly by SignInForm before switching to the OTP view.
      // In demo mode this is the primary login path.
      requestOtp: (email, password) => {
        return get()._demoRequestOtp(email, password)
      },

      /* ── register ─────────────────────────────────────── */
      register: (formData) => {
        const otp = genOtp()
        const roleKey = formData.api_role === 'org_manager' ? 'org_manager' : 'doctor'
        const orgLabel =
          formData.organization_name ||
          DEMO_ORGS.find(o => String(o.id) === String(formData.organization_id))?.name ||
          'My Organization'
        const user = {
          id:       'REG-' + Date.now(),
          name:     formData.name,
          email:    formData.email,
          role:     roleKey,
          org:      orgLabel,
          initials: makeInitials(formData.name),
          specialty:
            roleKey === 'org_manager'
              ? 'Site Management · Compliance'
              : 'Oncology · Breast Cancer',
        }
        localStorage.setItem('temp_email', formData.email)
        set({ tempEmail: formData.email, _pendingOtp: otp })
        return { ok: true, email: formData.email, otp }
      },

      /* ── Internal: demo OTP request ───────────────────── */
      _demoRequestOtp: (email, password) => {
        const found = DEMO_ACCOUNTS.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )
        if (!found) {
          return { ok: false, error: 'Invalid email or password. Demo password is "demo".' }
        }
        const otp = genOtp()
        localStorage.setItem('temp_email', found.email)
        set({ tempEmail: found.email, _pendingOtp: otp })
        return { ok: true, email: found.email, otp }
      },
    }),
    {
      name: 'brecai-auth',
      // Only persist user identity; session flags are re-initialized on load
      partialize: (s) => ({
        user:            s.user,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)
