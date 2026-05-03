import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const DEMO_ACCOUNTS = [
  {
    id: 'USR-001',
    name: 'Dr. Mounia Benali',
    email: 'mounia.benali@chu-oran.dz',
    password: 'demo',
    role: 'Doctor',
    org: 'CHU Oran',
    initials: 'MB',
    specialty: 'Oncology · Breast Cancer',
  },
  {
    id: 'USR-004',
    name: 'Prof. Linda Ferhat',
    email: 'l.ferhat@usthb.dz',
    password: 'demo',
    role: 'Instructor',
    org: 'USTHB Research',
    initials: 'LF',
    specialty: 'Federated ML · Model Training',
  },
  {
    id: 'USR-005',
    name: 'Sara Hammadi',
    email: 'sara.h@chu-oran.dz',
    password: 'demo',
    role: 'Org Admin',
    org: 'CHU Oran',
    initials: 'SH',
    specialty: 'Site Management · Compliance',
  },
  {
    id: 'USR-006',
    name: 'Omar Belkacem',
    email: 'omar.b@brecai.io',
    password: 'demo',
    role: 'Platform',
    org: 'BRECAI HQ',
    initials: 'OB',
    specialty: 'Platform Admin · Infrastructure',
  },
]

export const DEMO_ORGS = [
  { id: 1, name: 'CHU Oran',           city: 'Oran',          type: 'hospital' },
  { id: 2, name: 'CHU Algiers',        city: 'Algiers',       type: 'hospital' },
  { id: 3, name: 'CHU Constantine',    city: 'Constantine',   type: 'hospital' },
  { id: 4, name: 'USTHB Research',     city: 'Algiers',       type: 'laboratory' },
  { id: 5, name: 'CHU Tlemcen',        city: 'Tlemcen',       type: 'hospital' },
  { id: 6, name: 'CHU Annaba',         city: 'Annaba',        type: 'hospital' },
  { id: 7, name: 'CHU Batna',          city: 'Batna',         type: 'hospital' },
  { id: 8, name: 'Clinique Es-Salam',  city: 'Setif',         type: 'clinic' },
  { id: 9, name: 'Centre de Radiologie Oran', city: 'Oran',   type: 'radiology_center' },
]

export const ROLE_HOME = {
  Doctor:     '/app/doctor',
  Instructor: '/app/instructor',
  'Org Admin':'/app/org',
  Platform:   '/app/admin',
  Support:    '/app/admin',
}

export const ROLE_META = {
  Doctor: {
    accent: '#0572B2',
    gradFrom: '#0572B2',
    gradTo: '#0BB592',
    badge: 'Clinician',
    tagline: 'AI-assisted breast cancer subtyping',
  },
  Instructor: {
    accent: '#7C3AED',
    gradFrom: '#7C3AED',
    gradTo: '#6D28D9',
    badge: 'Data Scientist',
    tagline: 'Train, inspect and federate ML models',
  },
  'Org Admin': {
    accent: '#D97706',
    gradFrom: '#D97706',
    gradTo: '#EA580C',
    badge: 'Site Admin',
    tagline: 'Team roster, compliance and access',
  },
  Platform: {
    accent: '#334155',
    gradFrom: '#1e293b',
    gradTo: '#334155',
    badge: 'Platform Admin',
    tagline: 'Full system control and billing',
  },
  Support: {
    accent: '#334155',
    gradFrom: '#1e293b',
    gradTo: '#334155',
    badge: 'Support',
    tagline: 'User support and operations',
  },
}

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function makeInitials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      pendingUser: null,
      pendingOtp: null,

      // Step 1 of sign-in: validate creds, set pending + OTP
      requestOtp: (email, password) => {
        const found = DEMO_ACCOUNTS.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )
        if (!found)
          return { ok: false, error: 'Invalid email or password. Demo password is "demo".' }
        const otp = genOtp()
        const { password: _p, ...pending } = found
        set({ pendingUser: pending, pendingOtp: otp })
        return { ok: true, email: found.email, otp }
      },

      // Step 2 of sign-in / sign-up: verify OTP
      verifyOtp: (code) => {
        const { pendingUser, pendingOtp } = get()
        if (!pendingUser || !pendingOtp)
          return { ok: false, error: 'Session expired. Please start again.' }
        if (code.trim() !== pendingOtp)
          return { ok: false, error: 'Incorrect code. Try again.' }
        set({ user: pendingUser, pendingUser: null, pendingOtp: null })
        return { ok: true, user: pendingUser }
      },

      // Begin sign-up: store pending user + OTP
      register: (formData) => {
        const otp = genOtp()
        const roleKey = formData.api_role === 'org_manager' ? 'Org Admin' : 'Doctor'
        const orgLabel =
          formData.organization_name ||
          DEMO_ORGS.find(o => String(o.id) === String(formData.organization_id))?.name ||
          'My Organization'
        const user = {
          id: 'REG-' + Date.now(),
          name: formData.name,
          email: formData.email,
          role: roleKey,
          org: orgLabel,
          initials: makeInitials(formData.name),
          specialty:
            roleKey === 'Org Admin'
              ? 'Site Management · Compliance'
              : 'Oncology · Breast Cancer',
        }
        set({ pendingUser: user, pendingOtp: otp })
        return { ok: true, email: formData.email, otp }
      },

      // One-click demo login (bypasses OTP for test mode)
      loginAs: (role) => {
        const found = DEMO_ACCOUNTS.find(u => u.role === role)
        if (!found) return null
        const { password: _p, ...user } = found
        set({ user, pendingUser: null, pendingOtp: null })
        return user
      },

      logout: () => set({ user: null, pendingUser: null, pendingOtp: null }),
    }),
    { name: 'brecai-auth' }
  )
)
