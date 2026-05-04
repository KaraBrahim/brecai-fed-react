export const RoleEnum = {
  ADMIN:       'admin',
  ORG_MANAGER: 'org_manager',
  DOCTOR:      'doctor',
  INSTRUCTOR:  'instructor',
}

export const ROLE_HOME_MAP = {
  // API role keys (from backend / Vue)
  admin:       '/app/admin',
  org_manager: '/app/org',
  doctor:      '/app/doctor',
  instructor:  '/app/instructor',
  // Legacy display names (demo quick-access)
  Doctor:      '/app/doctor',
  Instructor:  '/app/instructor',
  'Org Admin': '/app/org',
  Platform:    '/app/admin',
  Support:     '/app/admin',
}
