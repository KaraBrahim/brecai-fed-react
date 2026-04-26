// Centralized seed data for the Admin module.
// Static demo data so all admin pages can render rich content immediately.

export const seedUsers = [
  { id: 'USR-001', name: 'Dr. Mounia Benali',     email: 'mounia.benali@chu-oran.dz',  role: 'Doctor',     org: 'CHU Oran',         status: 'active',  lastLogin: '2026-04-26 09:14', mfa: true,  cases: 142 },
  { id: 'USR-002', name: 'Dr. Yasmine Kebir',     email: 'y.kebir@chu-algiers.dz',     role: 'Doctor',     org: 'CHU Algiers',      status: 'active',  lastLogin: '2026-04-25 18:02', mfa: true,  cases: 98 },
  { id: 'USR-003', name: 'Dr. Karim Saidi',       email: 'k.saidi@chu-constantine.dz', role: 'Doctor',     org: 'CHU Constantine',  status: 'active',  lastLogin: '2026-04-26 08:31', mfa: true,  cases: 87 },
  { id: 'USR-004', name: 'Prof. Linda Ferhat',    email: 'l.ferhat@usthb.dz',          role: 'Instructor', org: 'USTHB Research',   status: 'active',  lastLogin: '2026-04-26 07:50', mfa: true,  cases: 0   },
  { id: 'USR-005', name: 'Sara Hammadi',          email: 'sara.h@chu-oran.dz',         role: 'Org Admin',  org: 'CHU Oran',         status: 'active',  lastLogin: '2026-04-25 16:25', mfa: true,  cases: 0   },
  { id: 'USR-006', name: 'Omar Belkacem',         email: 'omar.b@brecai.io',           role: 'Platform',   org: 'BRECAI HQ',        status: 'active',  lastLogin: '2026-04-26 10:01', mfa: true,  cases: 0   },
  { id: 'USR-007', name: 'Dr. Nour El-Houda',     email: 'nour.h@clinique-essalam.dz', role: 'Doctor',     org: 'Clinique Es-Salam', status: 'pending', lastLogin: '—',                mfa: false, cases: 0   },
  { id: 'USR-008', name: 'Dr. Adel Larbaoui',     email: 'a.larbaoui@chu-tlemcen.dz',  role: 'Doctor',     org: 'CHU Tlemcen',      status: 'suspended', lastLogin: '2026-03-12 14:08', mfa: false, cases: 12 },
  { id: 'USR-009', name: 'Imane Rahmani',         email: 'imane.r@brecai.io',          role: 'Support',    org: 'BRECAI HQ',        status: 'active',  lastLogin: '2026-04-26 09:55', mfa: true,  cases: 0   },
  { id: 'USR-010', name: 'Dr. Hichem Boudiaf',    email: 'h.boudiaf@chu-annaba.dz',    role: 'Doctor',     org: 'CHU Annaba',       status: 'active',  lastLogin: '2026-04-24 11:42', mfa: true,  cases: 64 },
  { id: 'USR-011', name: 'Dr. Selma Khelifi',     email: 's.khelifi@chu-batna.dz',     role: 'Doctor',     org: 'CHU Batna',        status: 'active',  lastLogin: '2026-04-26 06:18', mfa: true,  cases: 41 },
  { id: 'USR-012', name: 'Tarek Madani',          email: 't.madani@brecai.io',         role: 'Platform',   org: 'BRECAI HQ',        status: 'active',  lastLogin: '2026-04-26 09:47', mfa: true,  cases: 0   },
]

export const seedOrgs = [
  { id: 'ORG-001', name: 'CHU Oran',          city: 'Oran',         country: 'Algeria', plan: 'Enterprise', sites: 3, users: 42, status: 'active',  joined: '2024-09-12', mrr: 4800 },
  { id: 'ORG-002', name: 'CHU Algiers',       city: 'Algiers',      country: 'Algeria', plan: 'Enterprise', sites: 4, users: 58, status: 'active',  joined: '2024-09-12', mrr: 5400 },
  { id: 'ORG-003', name: 'CHU Constantine',   city: 'Constantine',  country: 'Algeria', plan: 'Pro',        sites: 2, users: 24, status: 'active',  joined: '2024-11-04', mrr: 1900 },
  { id: 'ORG-004', name: 'USTHB Research',    city: 'Algiers',      country: 'Algeria', plan: 'Research',   sites: 1, users: 8,  status: 'active',  joined: '2025-01-22', mrr: 0    },
  { id: 'ORG-005', name: 'CHU Tlemcen',       city: 'Tlemcen',      country: 'Algeria', plan: 'Pro',        sites: 1, users: 11, status: 'active',  joined: '2025-02-10', mrr: 1700 },
  { id: 'ORG-006', name: 'CHU Annaba',        city: 'Annaba',       country: 'Algeria', plan: 'Pro',        sites: 1, users: 14, status: 'active',  joined: '2025-03-08', mrr: 1700 },
  { id: 'ORG-007', name: 'CHU Batna',         city: 'Batna',        country: 'Algeria', plan: 'Starter',    sites: 1, users: 6,  status: 'active',  joined: '2025-06-19', mrr: 700  },
  { id: 'ORG-008', name: 'Clinique Es-Salam', city: 'Setif',        country: 'Algeria', plan: 'Starter',    sites: 1, users: 4,  status: 'trial',   joined: '2026-04-02', mrr: 0    },
  { id: 'ORG-009', name: 'BRECAI HQ',         city: 'Algiers',      country: 'Algeria', plan: 'Internal',   sites: 1, users: 12, status: 'active',  joined: '2024-06-01', mrr: 0    },
]

export const seedExaminations = [
  { id: 'EX-2241', patient: 'Fatima A.',  patientId: 'PT-0041', org: 'CHU Oran',       doctor: 'Dr. Benali M.',   date: '2026-04-22', type: 'IHC Panel',           status: 'completed', flagged: false },
  { id: 'EX-2240', patient: 'Nassima B.', patientId: 'PT-0039', org: 'CHU Oran',       doctor: 'Dr. Benali M.',   date: '2026-04-22', type: 'IHC Panel',           status: 'completed', flagged: true  },
  { id: 'EX-2239', patient: 'Souad H.',   patientId: 'PT-0038', org: 'CHU Algiers',    doctor: 'Dr. Kebir Y.',    date: '2026-04-21', type: 'Mammography',         status: 'pending',   flagged: false },
  { id: 'EX-2238', patient: 'Leila D.',   patientId: 'PT-0037', org: 'CHU Constantine',doctor: 'Dr. Saidi K.',    date: '2026-04-21', type: 'Histopathology',      status: 'completed', flagged: false },
  { id: 'EX-2237', patient: 'Amina R.',   patientId: 'PT-0036', org: 'CHU Algiers',    doctor: 'Dr. Kebir Y.',    date: '2026-04-20', type: 'IHC Panel',           status: 'completed', flagged: false },
  { id: 'EX-2236', patient: 'Djamila O.', patientId: 'PT-0035', org: 'CHU Tlemcen',    doctor: 'Dr. Larbaoui A.', date: '2026-04-20', type: 'Genomic Assay',       status: 'review',    flagged: true  },
  { id: 'EX-2235', patient: 'Karima M.',  patientId: 'PT-0040', org: 'CHU Oran',       doctor: 'Dr. Benali M.',   date: '2026-04-19', type: 'IHC Panel',           status: 'completed', flagged: false },
  { id: 'EX-2234', patient: 'Hayat S.',   patientId: 'PT-0034', org: 'CHU Annaba',     doctor: 'Dr. Boudiaf H.',  date: '2026-04-19', type: 'Mammography',         status: 'completed', flagged: false },
]

export const seedPredictions = [
  { id: 'PRD-9821', patient: 'Fatima A.',  org: 'CHU Oran',       model: 'brecai-v3.2', subtype: 'Luminal A',     confidence: 89.1, latencyMs: 412, federated: true,  reviewed: true,  date: '2026-04-22 09:14' },
  { id: 'PRD-9820', patient: 'Nassima B.', org: 'CHU Oran',       model: 'brecai-v3.2', subtype: 'Non-Luminal A', confidence: 31.4, latencyMs: 388, federated: true,  reviewed: true,  date: '2026-04-22 08:51' },
  { id: 'PRD-9819', patient: 'Souad H.',   org: 'CHU Algiers',    model: 'brecai-v3.2', subtype: 'Luminal A',     confidence: 78.9, latencyMs: 401, federated: true,  reviewed: false, date: '2026-04-21 17:22' },
  { id: 'PRD-9818', patient: 'Leila D.',   org: 'CHU Constantine',model: 'brecai-v3.2', subtype: 'Non-Luminal A', confidence: 22.1, latencyMs: 425, federated: true,  reviewed: true,  date: '2026-04-21 14:08' },
  { id: 'PRD-9817', patient: 'Amina R.',   org: 'CHU Algiers',    model: 'brecai-v3.2', subtype: 'Luminal A',     confidence: 95.7, latencyMs: 378, federated: true,  reviewed: true,  date: '2026-04-20 12:46' },
  { id: 'PRD-9816', patient: 'Djamila O.', org: 'CHU Tlemcen',    model: 'brecai-v3.1', subtype: 'Luminal A',     confidence: 84.3, latencyMs: 462, federated: false, reviewed: true,  date: '2026-04-20 10:11' },
  { id: 'PRD-9815', patient: 'Karima M.',  org: 'CHU Oran',       model: 'brecai-v3.2', subtype: 'Luminal A',     confidence: 93.2, latencyMs: 398, federated: true,  reviewed: true,  date: '2026-04-19 15:32' },
  { id: 'PRD-9814', patient: 'Hayat S.',   org: 'CHU Annaba',     model: 'brecai-v3.2', subtype: 'Luminal A',     confidence: 81.7, latencyMs: 411, federated: true,  reviewed: false, date: '2026-04-19 11:09' },
]

export const seedPlans = [
  { id: 'PL-STR', name: 'Starter',   tier: 'Entry',     priceMonthly: 199,  priceYearly: 1990,  seats: 5,   sites: 1,  predictionsMonth: 200,   support: '8x5',     activeOrgs: 6,  trial: 14, color: 'slate' },
  { id: 'PL-PRO', name: 'Pro',       tier: 'Growth',    priceMonthly: 599,  priceYearly: 5990,  seats: 25,  sites: 3,  predictionsMonth: 2000,  support: '12x6',    activeOrgs: 4,  trial: 14, color: 'blue', featured: true },
  { id: 'PL-ENT', name: 'Enterprise',tier: 'Hospital',  priceMonthly: 2400, priceYearly: 24000, seats: 999, sites: 12, predictionsMonth: 50000, support: '24x7',    activeOrgs: 2,  trial: 0,  color: 'teal' },
  { id: 'PL-RES', name: 'Research',  tier: 'Academic',  priceMonthly: 0,    priceYearly: 0,     seats: 50,  sites: 4,  predictionsMonth: 5000,  support: 'Community', activeOrgs: 2, trial: 0, color: 'pink' },
]

export const seedSubscriptions = [
  { id: 'SUB-001', org: 'CHU Oran',          plan: 'Enterprise', status: 'active',   start: '2024-09-12', renewal: '2026-09-12', mrr: 4800, billing: 'annual',   seatsUsed: 42 },
  { id: 'SUB-002', org: 'CHU Algiers',       plan: 'Enterprise', status: 'active',   start: '2024-09-12', renewal: '2026-09-12', mrr: 5400, billing: 'annual',   seatsUsed: 58 },
  { id: 'SUB-003', org: 'CHU Constantine',   plan: 'Pro',        status: 'active',   start: '2024-11-04', renewal: '2026-11-04', mrr: 1900, billing: 'annual',   seatsUsed: 24 },
  { id: 'SUB-004', org: 'USTHB Research',    plan: 'Research',   status: 'active',   start: '2025-01-22', renewal: '2027-01-22', mrr: 0,    billing: 'annual',   seatsUsed: 8  },
  { id: 'SUB-005', org: 'CHU Tlemcen',       plan: 'Pro',        status: 'active',   start: '2025-02-10', renewal: '2026-08-10', mrr: 1700, billing: 'monthly',  seatsUsed: 11 },
  { id: 'SUB-006', org: 'CHU Annaba',        plan: 'Pro',        status: 'active',   start: '2025-03-08', renewal: '2026-09-08', mrr: 1700, billing: 'monthly',  seatsUsed: 14 },
  { id: 'SUB-007', org: 'CHU Batna',         plan: 'Starter',    status: 'active',   start: '2025-06-19', renewal: '2026-06-19', mrr: 700,  billing: 'monthly',  seatsUsed: 6  },
  { id: 'SUB-008', org: 'Clinique Es-Salam', plan: 'Starter',    status: 'trial',    start: '2026-04-02', renewal: '2026-04-30', mrr: 0,    billing: 'monthly',  seatsUsed: 4  },
  { id: 'SUB-009', org: 'BRECAI HQ',         plan: 'Internal',   status: 'active',   start: '2024-06-01', renewal: '2099-12-31', mrr: 0,    billing: 'internal', seatsUsed: 12 },
]

export const seedPayments = [
  { id: 'PAY-7821', org: 'CHU Algiers',     plan: 'Enterprise', amount: 5400,  method: 'Wire',          status: 'paid',     date: '2026-04-12', invoice: 'INV-2026-0412-AL' },
  { id: 'PAY-7820', org: 'CHU Oran',        plan: 'Enterprise', amount: 4800,  method: 'Wire',          status: 'paid',     date: '2026-04-12', invoice: 'INV-2026-0412-OR' },
  { id: 'PAY-7819', org: 'CHU Constantine', plan: 'Pro',        amount: 1900,  method: 'Card',          status: 'paid',     date: '2026-04-04', invoice: 'INV-2026-0404-CO' },
  { id: 'PAY-7818', org: 'CHU Tlemcen',     plan: 'Pro',        amount: 1700,  method: 'Card',          status: 'paid',     date: '2026-04-03', invoice: 'INV-2026-0403-TL' },
  { id: 'PAY-7817', org: 'CHU Annaba',      plan: 'Pro',        amount: 1700,  method: 'Card',          status: 'paid',     date: '2026-04-02', invoice: 'INV-2026-0402-AN' },
  { id: 'PAY-7816', org: 'CHU Batna',       plan: 'Starter',    amount: 700,   method: 'Card',          status: 'failed',   date: '2026-04-01', invoice: 'INV-2026-0401-BT' },
  { id: 'PAY-7815', org: 'CHU Tlemcen',     plan: 'Pro',        amount: 1700,  method: 'Card',          status: 'paid',     date: '2026-03-03', invoice: 'INV-2026-0303-TL' },
  { id: 'PAY-7814', org: 'CHU Algiers',     plan: 'Enterprise', amount: 5400,  method: 'Wire',          status: 'paid',     date: '2026-03-12', invoice: 'INV-2026-0312-AL' },
  { id: 'PAY-7813', org: 'Clinique Es-Salam', plan: 'Starter',  amount: 0,     method: 'Trial',         status: 'pending',  date: '2026-04-02', invoice: '—' },
  { id: 'PAY-7812', org: 'CHU Constantine', plan: 'Pro',        amount: 1900,  method: 'Card',          status: 'refunded', date: '2026-02-04', invoice: 'INV-2026-0204-CO' },
]

export const seedModels = [
  { id: 'MOD-032', name: 'brecai-v3.2',     family: 'Federated',  task: 'Subtyping',   accuracy: 94.2, f1: 0.93, params: '12.4M', round: 8,  status: 'production', deployed: '2026-04-10', sites: 8 },
  { id: 'MOD-031', name: 'brecai-v3.1',     family: 'Federated',  task: 'Subtyping',   accuracy: 92.8, f1: 0.91, params: '12.4M', round: 7,  status: 'archived',   deployed: '2026-02-22', sites: 6 },
  { id: 'MOD-030', name: 'brecai-xai-v1.4', family: 'Explainer',  task: 'Attribution', accuracy: 88.0, f1: 0.86, params: '4.1M',  round: 4,  status: 'production', deployed: '2026-03-30', sites: 8 },
  { id: 'MOD-029', name: 'brecai-her2-v0.9',family: 'Specialist', task: 'HER2 Status', accuracy: 90.4, f1: 0.89, params: '6.7M',  round: 5,  status: 'staging',    deployed: '2026-04-18', sites: 3 },
  { id: 'MOD-028', name: 'brecai-v2.6',     family: 'Centralized',task: 'Subtyping',   accuracy: 89.1, f1: 0.87, params: '8.2M',  round: 0,  status: 'archived',   deployed: '2025-11-12', sites: 1 },
]

export const seedFederatedSites = [
  { id: 'SITE-A', name: 'Site Alpha-01', org: 'CHU Oran',         host: 'fed-alpha.brecai.io',  region: 'EU-West', cases: 412, lastSync: '2026-04-26 09:12', status: 'online',   round: 8, drift: 0.012 },
  { id: 'SITE-B', name: 'Site Beta-02',  org: 'CHU Algiers',      host: 'fed-beta.brecai.io',   region: 'EU-West', cases: 521, lastSync: '2026-04-26 09:11', status: 'online',   round: 8, drift: 0.009 },
  { id: 'SITE-C', name: 'Site Gamma-03', org: 'CHU Constantine',  host: 'fed-gamma.brecai.io',  region: 'EU-West', cases: 287, lastSync: '2026-04-26 09:10', status: 'online',   round: 8, drift: 0.018 },
  { id: 'SITE-D', name: 'Site Delta-04', org: 'CHU Tlemcen',      host: 'fed-delta.brecai.io',  region: 'EU-West', cases: 124, lastSync: '2026-04-26 08:55', status: 'syncing',  round: 8, drift: 0.021 },
  { id: 'SITE-E', name: 'Site Eps-05',   org: 'CHU Annaba',       host: 'fed-eps.brecai.io',    region: 'EU-West', cases: 168, lastSync: '2026-04-26 09:00', status: 'online',   round: 8, drift: 0.014 },
  { id: 'SITE-F', name: 'Site Zeta-06',  org: 'CHU Batna',        host: 'fed-zeta.brecai.io',   region: 'EU-West', cases: 64,  lastSync: '2026-04-25 22:14', status: 'offline',  round: 7, drift: 0.034 },
  { id: 'SITE-G', name: 'Site Eta-07',   org: 'USTHB Research',   host: 'fed-eta.brecai.io',    region: 'EU-West', cases: 92,  lastSync: '2026-04-26 09:08', status: 'online',   round: 8, drift: 0.011 },
  { id: 'SITE-H', name: 'Site Theta-08', org: 'Clinique Es-Salam',host: 'fed-theta.brecai.io',  region: 'EU-West', cases: 28,  lastSync: '2026-04-26 08:42', status: 'online',   round: 8, drift: 0.027 },
]

export const seedAuditLogs = [
  { id: 'LOG-99214', ts: '2026-04-26 10:01:34', actor: 'omar.b@brecai.io',           action: 'ROLE_CHANGE',     target: 'USR-007',  severity: 'info',    ip: '102.165.44.12', detail: 'Role updated from Pending → Doctor' },
  { id: 'LOG-99213', ts: '2026-04-26 09:55:11', actor: 'imane.r@brecai.io',          action: 'PASSWORD_RESET',  target: 'USR-008',  severity: 'warning', ip: '102.165.44.12', detail: 'Reset link issued by support' },
  { id: 'LOG-99212', ts: '2026-04-26 09:14:02', actor: 'mounia.benali@chu-oran.dz',  action: 'PREDICTION_RUN',  target: 'PT-0041',  severity: 'info',    ip: '41.108.22.89',  detail: 'Subtyping prediction PRD-9821' },
  { id: 'LOG-99211', ts: '2026-04-26 09:12:21', actor: 'system',                     action: 'FED_AGGREGATE',   target: 'MOD-032',  severity: 'info',    ip: '—',             detail: 'Federated round 8 aggregated (8 sites)' },
  { id: 'LOG-99210', ts: '2026-04-26 08:51:48', actor: 'mounia.benali@chu-oran.dz',  action: 'PREDICTION_RUN',  target: 'PT-0039',  severity: 'info',    ip: '41.108.22.89',  detail: 'Subtyping prediction PRD-9820' },
  { id: 'LOG-99209', ts: '2026-04-26 08:42:11', actor: 'system',                     action: 'SITE_HEARTBEAT',  target: 'SITE-H',   severity: 'info',    ip: '—',             detail: 'Site Theta-08 sync OK' },
  { id: 'LOG-99208', ts: '2026-04-26 08:31:09', actor: 'k.saidi@chu-constantine.dz', action: 'LOGIN_SUCCESS',   target: 'USR-003',  severity: 'info',    ip: '154.72.13.4',   detail: 'MFA OK · Web' },
  { id: 'LOG-99207', ts: '2026-04-26 06:18:55', actor: 's.khelifi@chu-batna.dz',     action: 'EXPORT_PHI',      target: 'PT-0034',  severity: 'critical', ip: '41.96.221.7',  detail: 'PDF export of clinical report' },
  { id: 'LOG-99206', ts: '2026-04-25 23:47:02', actor: 'system',                     action: 'BACKUP',          target: 'DB-PRIMARY', severity: 'info',  ip: '—',             detail: 'Nightly snapshot completed (842 MB)' },
  { id: 'LOG-99205', ts: '2026-04-25 22:14:33', actor: 'system',                     action: 'SITE_OFFLINE',    target: 'SITE-F',   severity: 'warning', ip: '—',             detail: 'Site Zeta-06 lost heartbeat' },
  { id: 'LOG-99204', ts: '2026-04-25 18:02:14', actor: 'y.kebir@chu-algiers.dz',    action: 'LOGIN_SUCCESS',   target: 'USR-002',  severity: 'info',    ip: '105.108.4.21',  detail: 'MFA OK · Web' },
  { id: 'LOG-99203', ts: '2026-04-25 17:22:41', actor: 'y.kebir@chu-algiers.dz',    action: 'REPORT_SIGNED',   target: 'RPT-039',  severity: 'info',    ip: '105.108.4.21',  detail: 'Clinical report signed' },
  { id: 'LOG-99202', ts: '2026-04-25 14:08:00', actor: 'k.saidi@chu-constantine.dz', action: 'PATIENT_UPDATE',  target: 'PT-0037',  severity: 'info',    ip: '154.72.13.4',   detail: 'Updated biomarker values' },
  { id: 'LOG-99201', ts: '2026-04-25 11:14:00', actor: 'a.larbaoui@chu-tlemcen.dz', action: 'LOGIN_FAILED',    target: 'USR-008',  severity: 'critical', ip: '197.0.4.18',   detail: '5 failed attempts · account suspended' },
]
