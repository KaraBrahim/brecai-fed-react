import { createBrowserRouter } from 'react-router-dom'

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Public
import LandingPage from '@/pages/landing/LandingPage'

// Auth
import LoginPage from '@/pages/auth/LoginPage'

// Doctor
import DoctorInsights from '@/pages/doctor/DoctorInsights'
import PatientRegistry from '@/pages/doctor/PatientRegistry'
import PredictionEngine from '@/pages/doctor/PredictionEngine'
import FinalExamination from '@/pages/doctor/FinalExamination'
import ClinicalReports from '@/pages/doctor/ClinicalReports'
import XaiDeepDive from '@/pages/doctor/XaiDeepDive'

// Instructor
import TrainingConsole from '@/pages/instructor/TrainingConsole'
import ModelArchitect from '@/pages/instructor/ModelArchitect'
import AggregationLogs from '@/pages/instructor/AggregationLogs'

// Org Management
import TeamRoster from '@/pages/org/TeamRoster'
import SiteCompliance from '@/pages/org/SiteCompliance'

// Admin
import AdminOverview from '@/pages/admin/AdminOverview'
import UserManagement from '@/pages/admin/UserManagement'
import OrgRegistry from '@/pages/admin/OrgRegistry'
import PatientRecords from '@/pages/admin/PatientRecords'
import ExaminationAudit from '@/pages/admin/ExaminationAudit'
import PredictionAudit from '@/pages/admin/PredictionAudit'
import PlansManager from '@/pages/admin/PlansManager'
import SubscriptionTracker from '@/pages/admin/SubscriptionTracker'
import PaymentHistory from '@/pages/admin/PaymentHistory'
import AIModelRegistry from '@/pages/admin/AIModelRegistry'
import FederatedRegistry from '@/pages/admin/FederatedRegistry'
import AuditLogs from '@/pages/admin/AuditLogs'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <LoginPage /> },
    ],
  },
  {
    path: '/app',
    element: <DashboardLayout />,
    children: [
      // Doctor
      { path: 'doctor',           element: <DoctorInsights /> },
      { path: 'doctor/patients',  element: <PatientRegistry /> },
      { path: 'doctor/predict',   element: <PredictionEngine /> },
      { path: 'doctor/exam',      element: <FinalExamination /> },
      { path: 'doctor/reports',   element: <ClinicalReports /> },
      { path: 'doctor/xai',       element: <XaiDeepDive /> },

      // Instructor
      { path: 'instructor',          element: <TrainingConsole /> },
      { path: 'instructor/architect', element: <ModelArchitect /> },
      { path: 'instructor/logs',     element: <AggregationLogs /> },

      // Org Management
      { path: 'org',            element: <TeamRoster /> },
      { path: 'org/compliance', element: <SiteCompliance /> },

      // Admin
      { path: 'admin',                 element: <AdminOverview /> },
      { path: 'admin/users',           element: <UserManagement /> },
      { path: 'admin/orgs',            element: <OrgRegistry /> },
      { path: 'admin/patients',        element: <PatientRecords /> },
      { path: 'admin/examinations',    element: <ExaminationAudit /> },
      { path: 'admin/predictions',     element: <PredictionAudit /> },
      { path: 'admin/plans',           element: <PlansManager /> },
      { path: 'admin/subscriptions',   element: <SubscriptionTracker /> },
      { path: 'admin/payments',        element: <PaymentHistory /> },
      { path: 'admin/models',          element: <AIModelRegistry /> },
      { path: 'admin/federated',       element: <FederatedRegistry /> },
      { path: 'admin/logs',            element: <AuditLogs /> },
    ],
  },
])
