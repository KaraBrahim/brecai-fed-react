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

export const ROLE_HOME = {
  Doctor: '/app/doctor',
  Instructor: '/app/instructor',
  'Org Admin': '/app/org',
  Platform: '/app/admin',
  Support: '/app/admin',
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

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      login: (email, password) => {
        const found = DEMO_ACCOUNTS.find(
          u =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === password
        )
        if (!found)
          return { ok: false, error: 'Invalid credentials. All demo passwords are "demo".' }
        const { password: _p, ...user } = found
        set({ user })
        return { ok: true, user }
      },
      loginAs: (role) => {
        const found = DEMO_ACCOUNTS.find(u => u.role === role)
        if (!found) return null
        const { password: _p, ...user } = found
        set({ user })
        return user
      },
      logout: () => set({ user: null }),
    }),
    { name: 'brecai-auth' }
  )
)
