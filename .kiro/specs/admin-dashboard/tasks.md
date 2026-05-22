# Implementation Plan: Admin Dashboard Enhancement

## Overview

This plan implements the full-stack admin dashboard enhancement in three phases: (1) new Laravel backend controllers providing platform-wide read access, (2) React admin API client extensions, and (3) frontend page rewiring. The approach ensures each task is independently testable and builds incrementally on previous work.

## Tasks

- [x] 1. Implement read-only backend controllers (Patients, Predictions, Examinations)
  - [x] 1.1 Create AdminPatientController with index and show methods
    - Create `app/Http/Controllers/Api/Admin/AdminPatientController.php`
    - Implement `index()` with pagination, `organization_id` filter, `search` filter (patient_identifier), `age_min`/`age_max` filters
    - Implement `show()` with organization eager-loading
    - Follow the existing pattern from `AuditLogController` (OpenAPI attributes, validation, query builder)
    - Register routes in `routes/api.php` inside the `role:admin` prefix group: `GET admin/patients`, `GET admin/patients/{patient}`
    - _Requirements: 10.1, 10.8, 3.1_

  - [x] 1.2 Create AdminPredictionController with index and show methods
    - Create `app/Http/Controllers/Api/Admin/AdminPredictionController.php`
    - Implement `index()` with pagination, `status` filter, `organization_id` filter, `ai_model_id` filter
    - Eager-load patient, examination, aiModel, and organization relationships
    - Implement `show()` with full relationship loading
    - Register routes: `GET admin/predictions`, `GET admin/predictions/{prediction}`
    - _Requirements: 10.2, 10.8, 4.1_

  - [x] 1.3 Create AdminExaminationController with index and show methods
    - Create `app/Http/Controllers/Api/Admin/AdminExaminationController.php`
    - Implement `index()` with pagination, `status` filter, `organization_id` filter
    - Eager-load patient, doctor (user), organization, and prediction relationships
    - Implement `show()` with full relationship loading
    - Register routes: `GET admin/examinations`, `GET admin/examinations/{examination}`
    - _Requirements: 10.3, 10.8, 5.1_

  - [ ]* 1.4 Write unit tests for read-only controllers (Patient, Prediction, Examination)
    - Test index returns paginated JSON with correct structure
    - Test filters are applied correctly
    - Test 403 response for non-admin users
    - Test show returns single resource with relationships
    - _Requirements: 10.8_

- [x] 2. Implement read-only backend controllers (Payments, Subscriptions)
  - [x] 2.1 Create AdminPaymentController with index and show methods
    - Create `app/Http/Controllers/Api/Admin/AdminPaymentController.php`
    - Implement `index()` with pagination, `status` filter, `organization_id` filter
    - Eager-load organization, plan, and subscription relationships
    - Implement `show()` with full relationship loading
    - Register routes: `GET admin/payments`, `GET admin/payments/{payment}`
    - _Requirements: 10.4, 10.8, 6.1_

  - [x] 2.2 Create AdminSubscriptionController with index and show methods
    - Create `app/Http/Controllers/Api/Admin/AdminSubscriptionController.php`
    - Implement `index()` with pagination, `status` filter, `organization_id` filter
    - Eager-load organization and plan relationships
    - Implement `show()` with full relationship loading
    - Register routes: `GET admin/subscriptions`, `GET admin/subscriptions/{subscription}`
    - _Requirements: 10.5, 10.8, 8.1_

  - [ ]* 2.3 Write unit tests for Payment and Subscription controllers
    - Test index returns paginated JSON with correct structure
    - Test filters are applied correctly
    - Test 403 response for non-admin users
    - _Requirements: 10.8_

- [x] 3. Implement CRUD backend controllers (Plans, Federated Rounds)
  - [x] 3.1 Create AdminPlanController with full CRUD plus activate/deactivate
    - Create `app/Http/Controllers/Api/Admin/AdminPlanController.php`
    - Implement `index()` listing all plans
    - Implement `store()` with validation (name, slug, price, max_doctors, max_predictions_per_month, etc.)
    - Implement `update()` for modifying plan details
    - Implement `destroy()` with protection against deleting plans with active subscriptions (return 422)
    - Implement `activate()` and `deactivate()` methods
    - Register routes: `apiResource('plans', AdminPlanController::class)`, `POST admin/plans/{plan}/activate`, `POST admin/plans/{plan}/deactivate`
    - _Requirements: 10.6, 10.8, 7.1, 7.3, 7.4, 7.5_

  - [x] 3.2 Create AdminFederatedRoundController with list, create, show, complete
    - Create `app/Http/Controllers/Api/Admin/AdminFederatedRoundController.php`
    - Implement `index()` with pagination, eager-load aiModel and contributions count
    - Implement `store()` to create new FL round (validate no active round exists for the model, return 422 if one does)
    - Implement `show()` with contributions and organization details
    - Implement `complete()` to mark round as completed with global_accuracy (validate round is not already completed, return 422)
    - Register routes: `GET/POST admin/federated-rounds`, `GET admin/federated-rounds/{flRound}`, `POST admin/federated-rounds/{flRound}/complete`
    - _Requirements: 10.7, 10.8, 9.1, 9.3_

  - [ ]* 3.3 Write unit tests for Plan and FederatedRound controllers
    - Test plan CRUD operations with valid/invalid payloads
    - Test plan deletion protection when active subscriptions exist
    - Test FL round creation and completion with edge cases
    - Test 403 response for non-admin users
    - _Requirements: 10.6, 10.7, 10.8_

- [x] 4. Checkpoint - Backend controllers complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Extend the React admin API client with new resource namespaces
  - [x] 5.1 Add patients, predictions, and examinations namespaces to admin API client
    - Edit `src/api/api-client/admin.js`
    - Add `patients` namespace with `list(params)` and `get(id)` methods
    - Add `predictions` namespace with `list(params)` and `get(id)` methods
    - Add `examinations` namespace with `list(params)` and `get(id)` methods
    - Follow the existing pattern (client.get with params, `.then(r => r.data)`)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 5.2 Add payments, subscriptions, plans, and federatedRounds namespaces to admin API client
    - Edit `src/api/api-client/admin.js`
    - Add `payments` namespace with `list(params)` and `get(id)` methods
    - Add `subscriptions` namespace with `list(params)` and `get(id)` methods
    - Add `plans` namespace with `list(params)`, `get(id)`, `create(data)`, `update(id, data)`, `delete(id)`, `activate(id)`, `deactivate(id)` methods
    - Add `federatedRounds` namespace with `list(params)`, `get(id)`, `create(data)`, `complete(id, data)` methods
    - _Requirements: 2.4, 2.5, 2.6, 2.7_

  - [ ]* 5.3 Write unit tests for admin API client extensions
    - Test each new namespace method constructs correct URL and params
    - Test that filter parameters are passed as query string key-value pairs
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 6. Rewire read-only admin pages (PatientRecords, PredictionAudit, ExaminationAudit)
  - [x] 6.1 Rewire PatientRecords page to use admin API client
    - Edit `src/pages/admin/PatientRecords.jsx`
    - Replace doctor API client import with admin API client
    - Change data fetching to `admin.patients.list(params)`
    - Remove create, edit, and delete controls/buttons
    - Ensure columns display: patient_identifier, age, stage, ER/PR/HER2 status, organization name, created_at
    - Add organization filter dropdown
    - Retain PDF export and CSV bulk export capabilities
    - Preserve ClinicalHero component and Horizon_Style design
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 1.3, 12.1_

  - [x] 6.2 Rewire PredictionAudit page to use admin API client
    - Edit `src/pages/admin/PredictionAudit.jsx`
    - Replace doctor API client import with admin API client
    - Change data fetching to `admin.predictions.list(params)`
    - Ensure columns display: prediction ID, examination ID, AI model name/version, verdict, confidence, status, organization, timestamp
    - Add filters for status, organization, and AI model
    - Add aggregate statistics section: total predictions, average confidence, completion rate, failure rate
    - Ensure no modify/delete controls are present
    - Retain CSV export and NeuralHero component
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 1.4, 12.1_

  - [x] 6.3 Rewire ExaminationAudit page to use admin API client
    - Edit `src/pages/admin/ExaminationAudit.jsx`
    - Replace doctor API client import with admin API client
    - Change data fetching to `admin.examinations.list(params)`
    - Ensure columns display: examination ID, patient identifier, chief complaint, status, prediction status, doctor name, organization, timestamps
    - Add filters for status and organization
    - Add aggregate statistics section: total examinations, completed, pending, submitted-awaiting-AI
    - Ensure no modify/delete controls are present
    - Retain LabHero component
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 1.4, 12.1_

  - [ ]* 6.4 Write unit tests for rewired read-only pages
    - Test PatientRecords renders without create/edit/delete buttons
    - Test PredictionAudit displays aggregate statistics correctly
    - Test ExaminationAudit displays aggregate statistics correctly
    - Test filter dropdowns trigger correct API parameters
    - _Requirements: 3.4, 4.4, 5.4_

- [x] 7. Rewire financial admin pages (PaymentHistory, SubscriptionTracker, PlansManager)
  - [x] 7.1 Rewire PaymentHistory page to use admin API client
    - Edit `src/pages/admin/PaymentHistory.jsx`
    - Replace orgManager API client import with admin API client
    - Change data fetching to `admin.payments.list(params)`
    - Ensure columns display: payment ID, organization name, plan name, amount (DZD), status, transaction date
    - Add filters for payment status and organization
    - Add aggregate financial metrics: total cleared revenue, failed payment amount, refund count, average invoice value
    - Remove the org-scoped informational banner
    - Ensure no modify/delete controls are present
    - Retain ReceiptHero component
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 1.4, 12.1_

  - [x] 7.2 Rewire SubscriptionTracker page to use admin API client
    - Edit `src/pages/admin/SubscriptionTracker.jsx`
    - Replace orgManager API client import with admin API client
    - Change data fetching to `admin.subscriptions.list(params)`
    - Ensure columns display: organization name, subscription status, plan name, start/end dates, days remaining, seat usage
    - Add filters for subscription status and organization type
    - Add aggregate metrics: total active subscriptions, expiring-soon count, monthly recurring revenue, churn rate
    - Remove any modify/cancel subscription controls
    - Retain CalendarHero component
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 1.4, 12.1_

  - [x] 7.3 Rewire PlansManager page to use admin API client
    - Edit `src/pages/admin/PlansManager.jsx`
    - Replace orgManager API client import with admin API client
    - Change data fetching to `admin.plans.list(params)`
    - Wire create form to `admin.plans.create(data)`
    - Wire update form to `admin.plans.update(id, data)`
    - Wire activate/deactivate buttons to `admin.plans.activate(id)` / `admin.plans.deactivate(id)`
    - Ensure columns display: name, slug, pricing (monthly/yearly), seat limits, patient limits, duration, active status
    - Retain PremiumHero component and plan card grid layout
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 12.1_

  - [ ]* 7.4 Write unit tests for financial pages
    - Test PaymentHistory displays aggregate financial metrics correctly
    - Test SubscriptionTracker displays aggregate metrics correctly
    - Test PlansManager create/update forms submit correct data
    - Test no unauthorized controls are visible on read-only pages
    - _Requirements: 6.4, 8.4, 7.3_

- [x] 8. Rewire FederatedRegistry page and verify AIModelRegistry
  - [x] 8.1 Rewire FederatedRegistry page to use admin API client
    - Edit `src/pages/admin/FederatedRegistry.jsx`
    - Replace instructor API client import with admin API client
    - Change data fetching to `admin.federatedRounds.list(params)`
    - Wire create round to `admin.federatedRounds.create(data)`
    - Wire complete round to `admin.federatedRounds.complete(id, data)`
    - Ensure columns display: round number, AI model name, global accuracy, status, start/end dates, contribution count
    - Add per-round contributions detail showing organization name, local sample size, accuracy before/after, submission date
    - Add accuracy-over-rounds chart
    - Retain AdminHero component
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 12.1_

  - [x] 8.2 Verify and enhance AIModelRegistry page
    - Confirm `src/pages/admin/AIModelRegistry.jsx` already uses `admin.aiModels` API client (no rewiring needed)
    - Ensure columns display: name, version, slug, inference type, accuracy metrics (accuracy, AUC, F1, sensitivity, specificity), activation status, registration date
    - Ensure create, update, activate, deactivate controls are present
    - Ensure deletion is protected: display error toast when attempting to delete a model with completed predictions
    - Retain CircuitHero component
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 12.1_

  - [ ]* 8.3 Write unit tests for FederatedRegistry and AIModelRegistry
    - Test FederatedRegistry renders round list and contributions
    - Test create/complete round interactions
    - Test AIModelRegistry deletion protection error display
    - _Requirements: 9.3, 13.5_

- [x] 9. Checkpoint - All page rewiring complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement access control UI enforcement and error handling
  - [x] 10.1 Add 403 permission boundary error handling across all admin pages
    - Ensure the existing Axios interceptor or per-page error handling displays a toast with the API message on 403 responses (amber tone)
    - Verify 401 redirects to login, 422 shows validation message (pink tone), 404 shows "Resource not found" (slate tone)
    - Add error boundary for unexpected 500 errors with generic message (pink tone)
    - _Requirements: 1.6, 12.4_

  - [x] 10.2 Audit all admin pages for unauthorized write controls
    - Verify PatientRecords, PredictionAudit, ExaminationAudit, PaymentHistory, SubscriptionTracker have NO create/edit/delete buttons
    - Verify PlansManager retains full CRUD controls
    - Verify FederatedRegistry retains create/complete controls
    - Verify AIModelRegistry retains full CRUD + activate/deactivate controls
    - Verify no page exposes patient deletion, prediction modification, or direct user deletion
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 10.3 Write integration tests for access control enforcement
    - Test that read-only pages do not render write action buttons
    - Test that 403 error toast displays correctly with API message
    - Test that permission boundary is enforced consistently
    - _Requirements: 1.1, 1.6_

- [x] 11. Enhance AdminOverview dashboard with comprehensive KPIs
  - [x] 11.1 Verify and enhance AdminOverview page data completeness
    - Confirm `src/pages/admin/AdminOverview.jsx` displays KPI tiles for: total users, total organizations, total predictions, completed FL rounds, active AI models, total revenue
    - Verify user growth chart (monthly registration trends, last 12 months)
    - Verify predictions-over-time chart (monthly volume with completed vs failed)
    - Verify subtype distribution pie chart (Luminal A vs Non-Luminal A)
    - Verify top organizations ranking by prediction count
    - Verify recent audit activity feed (latest 6 actions)
    - Verify quick-action navigation cards linking to all admin sub-pages
    - Add any missing KPI tiles or charts using existing `admin.insights` API methods
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 12.1, 12.2, 12.3_

  - [ ]* 11.2 Write unit tests for AdminOverview
    - Test all KPI tiles render with correct data
    - Test charts render without errors
    - Test quick-action cards link to correct routes
    - _Requirements: 11.1, 11.7_

- [x] 12. Verify AuditLogs page filtering and design system compliance
  - [x] 12.1 Verify and enhance AuditLogs page comprehensive filtering
    - Confirm `src/pages/admin/AuditLogs.jsx` uses `admin.auditLogs` API client
    - Ensure filters for: user, organization, action type, auditable entity type, date range
    - Ensure columns display: timestamp, user name, organization, action, entity type, entity ID, IP address
    - Add detail view showing old_values and new_values for modification events
    - Add aggregate statistics: total log entries, entries today, unique users active, most common action types
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [x] 12.2 Final design system compliance check
    - Verify all pages use appropriate hero components per the design system mapping
    - Verify MetricTile, SparkTile, CoinTile usage for KPI display
    - Verify DataTable component with search, sort, and filter on all tabular pages
    - Verify StatusPill color tones: teal (positive), pink/red (negative), amber (warning), blue (informational), slate (neutral)
    - Verify Framer Motion stagger animations on page entry
    - Verify Modal and ConfirmDialog patterns for create/edit/confirm workflows
    - Verify brand color palette usage: #093A7A, #0572B2, #0BB592, #F55486, slate scale
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [ ]* 12.3 Write unit tests for AuditLogs and design system compliance
    - Test AuditLogs filter interactions
    - Test detail view renders old/new values
    - Test aggregate statistics display
    - _Requirements: 14.2, 14.4, 14.5_

- [x] 13. Final checkpoint - All implementation complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Backend controllers (tasks 1-3) must be completed before frontend rewiring (tasks 6-8) to have working endpoints
- The API client extension (task 5) bridges backend and frontend and should be done after backend is ready
- AIModelRegistry (task 8.2) and AuditLogs (task 12.1) already use the correct admin API client — these tasks verify completeness and add missing features
- Property tests validate universal correctness properties (aggregate calculations, permission boundaries)
- Unit tests validate specific examples and edge cases
- The design uses PHP (Laravel) for backend and JavaScript (React) for frontend — no language selection needed

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "2.1", "2.2", "3.1", "3.2"] },
    { "id": 1, "tasks": ["1.4", "2.3", "3.3", "5.1", "5.2"] },
    { "id": 2, "tasks": ["5.3", "6.1", "6.2", "6.3"] },
    { "id": 3, "tasks": ["6.4", "7.1", "7.2", "7.3"] },
    { "id": 4, "tasks": ["7.4", "8.1", "8.2"] },
    { "id": 5, "tasks": ["8.3", "10.1", "10.2", "11.1", "12.1"] },
    { "id": 6, "tasks": ["10.3", "11.2", "12.2"] },
    { "id": 7, "tasks": ["12.3"] }
  ]
}
```
