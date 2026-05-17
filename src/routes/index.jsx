import { createBrowserRouter, Navigate } from 'react-router-dom'

// Root
import RootLayout from '@/layouts/RootLayout'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'

// Guards
import { GuestOnly, RequireAuth, RequireOtp, CatchAll } from '@/routes/guards'

// Public
import LandingPage from '@/pages/landing/LandingPage'

// Auth
import LoginPage  from '@/pages/auth/LoginPage'
import SignUpPage from '@/pages/auth/SignUpPage'
import OtpPage    from '@/pages/auth/OtpPage'

// Doctor
import DoctorInsights    from '@/pages/doctor/DoctorInsights'
import PatientRegistry   from '@/pages/doctor/PatientRegistry'
import PredictionEngine  from '@/pages/doctor/PredictionEngine'
import FinalExamination  from '@/pages/doctor/FinalExamination'
import ClinicalReports   from '@/pages/doctor/ClinicalReports'
import XaiDeepDive       from '@/pages/doctor/XaiDeepDive'

// Instructor
import InstructorDashboard from '@/pages/instructor/InstructorDashboard'
import TrainingConsole     from '@/pages/instructor/TrainingConsole'
import ModelArchitect      from '@/pages/instructor/ModelArchitect'
import AggregationLogs     from '@/pages/instructor/AggregationLogs'
import ContributionsPanel  from '@/pages/instructor/ContributionsPanel'

// Org Management
import OrgDashboard    from '@/pages/org/OrgDashboard'
import OrgMembers      from '@/pages/org/OrgMembers'
import OrgPatients     from '@/pages/org/OrgPatients'
import OrgReports      from '@/pages/org/OrgReports'
import OrgModels       from '@/pages/org/OrgModels'
import OrgInvitations  from '@/pages/org/OrgInvitations'
import OrgSubscription from '@/pages/org/OrgSubscription'
import PendingApproval from '@/pages/org/PendingApproval'
import SubscriptionGate from '@/pages/org/SubscriptionGate'

// Admin
import AdminOverview       from '@/pages/admin/AdminOverview'
import UserManagement      from '@/pages/admin/UserManagement'
import OrgRegistry         from '@/pages/admin/OrgRegistry'
import PatientRecords      from '@/pages/admin/PatientRecords'
import ExaminationAudit    from '@/pages/admin/ExaminationAudit'
import PredictionAudit     from '@/pages/admin/PredictionAudit'
import PlansManager        from '@/pages/admin/PlansManager'
import SubscriptionTracker from '@/pages/admin/SubscriptionTracker'
import PaymentHistory      from '@/pages/admin/PaymentHistory'
import AIModelRegistry     from '@/pages/admin/AIModelRegistry'
import FederatedRegistry   from '@/pages/admin/FederatedRegistry'
import AuditLogs           from '@/pages/admin/AuditLogs'

import { RoleEnum } from '@/enums/roles'

export const router = createBrowserRouter([
  {
    // Root layout: handles isInitialized check (mirrors Vue App.vue onMounted fetchUser)
    element: <RootLayout />,
    children: [

      // ── Public ──────────────────────────────────────────────
      {
        path: '/',
        element: <LandingPage />,
      },

      // ── Auth (guestOnly) ────────────────────────────────────
      {
        path: '/auth',
        element: <GuestOnly><AuthLayout /></GuestOnly>,
        children: [
          { index: true,        element: <LoginPage /> },
          { path: 'signup',     element: <SignUpPage /> },
        ],
      },

      // ── OTP (requiresOtp) ───────────────────────────────────
      {
        path: '/auth/otp',
        element: <RequireOtp><AuthLayout /></RequireOtp>,
        children: [
          { index: true, element: <OtpPage /> },
        ],
      },

      // ── App (requiresAuth) ───────────────────────────────────
      {
        path: '/app',
        element: <RequireAuth><DashboardLayout /></RequireAuth>,
        children: [

          // Default /app → redirect to doctor (fallback)
          { index: true, element: <Navigate to="/app/doctor" replace /> },

          // Doctor (role: doctor)
          { path: 'doctor',          element: <RequireAuth role={RoleEnum.DOCTOR}><DoctorInsights /></RequireAuth> },
          { path: 'doctor/patients', element: <RequireAuth role={RoleEnum.DOCTOR}><PatientRegistry /></RequireAuth> },
          { path: 'doctor/predict',  element: <RequireAuth role={RoleEnum.DOCTOR}><PredictionEngine /></RequireAuth> },
          { path: 'doctor/exam',     element: <RequireAuth role={RoleEnum.DOCTOR}><FinalExamination /></RequireAuth> },
          { path: 'doctor/reports',  element: <RequireAuth role={RoleEnum.DOCTOR}><ClinicalReports /></RequireAuth> },
          { path: 'doctor/xai',      element: <RequireAuth role={RoleEnum.DOCTOR}><XaiDeepDive /></RequireAuth> },

          // Instructor (role: instructor)
          { path: 'instructor',                element: <RequireAuth role={RoleEnum.INSTRUCTOR}><InstructorDashboard /></RequireAuth> },
          { path: 'instructor/training',       element: <RequireAuth role={RoleEnum.INSTRUCTOR}><TrainingConsole /></RequireAuth> },
          { path: 'instructor/architect',      element: <RequireAuth role={RoleEnum.INSTRUCTOR}><ModelArchitect /></RequireAuth> },
          { path: 'instructor/logs',           element: <RequireAuth role={RoleEnum.INSTRUCTOR}><AggregationLogs /></RequireAuth> },
          { path: 'instructor/contributions',  element: <RequireAuth role={RoleEnum.INSTRUCTOR}><ContributionsPanel /></RequireAuth> },

          // Org Management (role: org_manager)
          // Gate pages — rendered outside DashboardLayout (full-screen)
          { path: 'org/pending',      element: <RequireAuth role={RoleEnum.ORG_MANAGER}><PendingApproval /></RequireAuth> },
          { path: 'org/subscribe',    element: <RequireAuth role={RoleEnum.ORG_MANAGER}><SubscriptionGate /></RequireAuth> },
          // Dashboard pages — only accessible after org approved + subscription active
          { path: 'org',              element: <RequireAuth role={RoleEnum.ORG_MANAGER}><OrgDashboard /></RequireAuth> },
          { path: 'org/members',      element: <RequireAuth role={RoleEnum.ORG_MANAGER}><OrgMembers /></RequireAuth> },
          { path: 'org/patients',     element: <RequireAuth role={RoleEnum.ORG_MANAGER}><OrgPatients /></RequireAuth> },
          { path: 'org/reports',      element: <RequireAuth role={RoleEnum.ORG_MANAGER}><OrgReports /></RequireAuth> },
          { path: 'org/models',       element: <RequireAuth role={RoleEnum.ORG_MANAGER}><OrgModels /></RequireAuth> },
          { path: 'org/invitations',  element: <RequireAuth role={RoleEnum.ORG_MANAGER}><OrgInvitations /></RequireAuth> },
          { path: 'org/subscription', element: <RequireAuth role={RoleEnum.ORG_MANAGER}><OrgSubscription /></RequireAuth> },

          // Admin (role: admin)
          { path: 'admin',                element: <RequireAuth role={RoleEnum.ADMIN}><AdminOverview /></RequireAuth> },
          { path: 'admin/users',          element: <RequireAuth role={RoleEnum.ADMIN}><UserManagement /></RequireAuth> },
          { path: 'admin/orgs',           element: <RequireAuth role={RoleEnum.ADMIN}><OrgRegistry /></RequireAuth> },
          { path: 'admin/patients',       element: <RequireAuth role={RoleEnum.ADMIN}><PatientRecords /></RequireAuth> },
          { path: 'admin/examinations',   element: <RequireAuth role={RoleEnum.ADMIN}><ExaminationAudit /></RequireAuth> },
          { path: 'admin/predictions',    element: <RequireAuth role={RoleEnum.ADMIN}><PredictionAudit /></RequireAuth> },
          { path: 'admin/plans',          element: <RequireAuth role={RoleEnum.ADMIN}><PlansManager /></RequireAuth> },
          { path: 'admin/subscriptions',  element: <RequireAuth role={RoleEnum.ADMIN}><SubscriptionTracker /></RequireAuth> },
          { path: 'admin/payments',       element: <RequireAuth role={RoleEnum.ADMIN}><PaymentHistory /></RequireAuth> },
          { path: 'admin/models',         element: <RequireAuth role={RoleEnum.ADMIN}><AIModelRegistry /></RequireAuth> },
          { path: 'admin/federated',      element: <RequireAuth role={RoleEnum.ADMIN}><FederatedRegistry /></RequireAuth> },
          { path: 'admin/logs',           element: <RequireAuth role={RoleEnum.ADMIN}><AuditLogs /></RequireAuth> },
        ],
      },

      // ── 404 catch-all (mirrors Vue's pathMatch redirect) ────
      {
        path: '*',
        element: <CatchAll />,
      },

    ],
  },
])
