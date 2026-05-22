# Requirements Document

## Introduction

This document specifies the requirements for enhancing the BReCAI-FED admin dashboard to be fully functional. The admin dashboard serves as the platform governance center for the federated breast cancer detection system. It provides the admin role with comprehensive read access across all platform data and limited write access for governance actions (organization approval, user activation, AI model management). Several pages currently use incorrect API clients (doctor/orgManager instead of admin-scoped endpoints) or lack proper backend wiring. This enhancement ensures all 12 admin pages are properly connected to admin-scoped backend APIs with appropriate access control enforcement.

## Glossary

- **Admin_Dashboard**: The React-based administrative interface accessible only to users with the admin role, providing platform-wide governance capabilities
- **Admin_API_Client**: The frontend API module (`src/api/api-client/admin.js`) that communicates with admin-scoped Laravel backend endpoints under the `/api/admin` prefix
- **Platform_Admin**: A user with the admin role who has full read access and limited write access for governance actions across the entire platform
- **Org_Manager**: A user with the org_manager role who manages their own organization's members, patients, and subscriptions
- **Doctor**: A user with the doctor role who performs clinical workflows including examinations and predictions
- **Instructor**: A user with the instructor role who participates in federated learning rounds
- **Organization**: A registered healthcare institution (hospital, clinic, laboratory, or radiology center) participating in the federated network
- **Prediction**: An AI inference result classifying breast cancer as Luminal A or Non-Luminal A, produced by the active AI model
- **Examination**: A clinical examination record created by a doctor, which may have an associated prediction
- **FL_Round**: A federated learning training round where participating organizations contribute local model updates
- **AI_Model**: A registered machine learning model used for breast cancer molecular subtyping inference
- **Subscription**: An organization's active plan subscription that determines their platform access tier
- **Payment**: A financial transaction record associated with an organization's subscription
- **Audit_Log**: A timestamped record of platform actions performed by users, used for compliance and security monitoring
- **Design_System**: The existing UI component library (AdminHero, GlassHero, MapHero, MetricTile, SparkTile, DataTable, StatusPill, etc.) implementing the "horizon" visual style with gradient heroes and glass cards
- **Horizon_Style**: The visual design language used across the admin dashboard featuring gradient hero sections, glass-morphism cards, rounded corners, and the BReCAI brand color palette

## Requirements

### Requirement 1: Admin Access Control Enforcement

**User Story:** As a platform admin, I want the dashboard to enforce my governance permissions, so that I can perform allowed actions while being prevented from destructive operations outside my scope.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL restrict write operations to: approving/rejecting organizations, activating/deactivating org_manager accounts, managing AI models (create, update, activate, deactivate, delete), and creating platform users
2. THE Admin_Dashboard SHALL provide full read access to all platform data including users, organizations, patients, predictions, examinations, payments, subscriptions, audit logs, and federated learning rounds
3. THE Admin_Dashboard SHALL NOT expose controls for deleting patient records from the admin interface
4. THE Admin_Dashboard SHALL NOT expose controls for deleting or modifying prediction results from the admin interface
5. THE Admin_Dashboard SHALL NOT expose controls for directly deleting users from the admin interface, as member management is delegated to the Org_Manager role
6. WHEN an admin attempts an unauthorized action, THE Admin_Dashboard SHALL display an informative error message explaining the permission boundary

### Requirement 2: Admin-Scoped API Client Extension

**User Story:** As a platform admin, I want all dashboard pages to use admin-scoped API endpoints, so that data is fetched with proper authorization and platform-wide visibility.

#### Acceptance Criteria

1. THE Admin_API_Client SHALL provide endpoints for listing all patients platform-wide with pagination, filtering by organization, and search by patient identifier
2. THE Admin_API_Client SHALL provide endpoints for listing all predictions platform-wide with pagination, filtering by status, organization, and AI model
3. THE Admin_API_Client SHALL provide endpoints for listing all examinations platform-wide with pagination, filtering by status and organization
4. THE Admin_API_Client SHALL provide endpoints for listing all payments platform-wide with pagination, filtering by status and organization
5. THE Admin_API_Client SHALL provide endpoints for listing all subscriptions platform-wide with pagination, filtering by status and organization
6. THE Admin_API_Client SHALL provide endpoints for managing subscription plans (list, create, update, activate, deactivate)
7. THE Admin_API_Client SHALL provide endpoints for listing federated learning rounds platform-wide with pagination, including contributions per round

### Requirement 3: Patient Records Page Enhancement

**User Story:** As a platform admin, I want to view all patient records across the federation in read-only mode, so that I can audit clinical data without modifying it.

#### Acceptance Criteria

1. THE PatientRecords page SHALL fetch patient data from the Admin_API_Client instead of the doctor API client
2. THE PatientRecords page SHALL display patient identifier, age, tumor stage, ER status, PR status, HER2 status, organization name, and creation date
3. THE PatientRecords page SHALL support filtering by organization and searching by patient identifier
4. THE PatientRecords page SHALL NOT display create, edit, or delete controls for patient records
5. THE PatientRecords page SHALL retain the PDF export capability for individual patient data sheets
6. THE PatientRecords page SHALL retain the CSV bulk export capability
7. THE PatientRecords page SHALL preserve the existing ClinicalHero component and Horizon_Style design

### Requirement 4: Prediction Audit Page Enhancement

**User Story:** As a platform admin, I want to view all AI predictions across the platform with model lineage, so that I can audit inference quality and track outcomes.

#### Acceptance Criteria

1. THE PredictionAudit page SHALL fetch prediction data from the Admin_API_Client instead of the doctor API client
2. THE PredictionAudit page SHALL display prediction ID, examination ID, AI model name and version, verdict (Luminal A / Non-Luminal A), confidence score, status, organization name, and timestamp
3. THE PredictionAudit page SHALL support filtering by status, organization, and AI model
4. THE PredictionAudit page SHALL NOT display controls for modifying or deleting predictions
5. THE PredictionAudit page SHALL display aggregate statistics: total predictions, average confidence, completion rate, and failure rate
6. THE PredictionAudit page SHALL retain the CSV export capability and the NeuralHero component with Horizon_Style design

### Requirement 5: Examination Audit Page Enhancement

**User Story:** As a platform admin, I want to view all clinical examinations across the platform, so that I can audit the clinical workflow pipeline.

#### Acceptance Criteria

1. THE ExaminationAudit page SHALL fetch examination data from the Admin_API_Client instead of the doctor API client
2. THE ExaminationAudit page SHALL display examination ID, patient identifier, chief complaint, status, associated prediction status, examining doctor name, organization name, and timestamps
3. THE ExaminationAudit page SHALL support filtering by status and organization
4. THE ExaminationAudit page SHALL NOT display controls for modifying or deleting examinations
5. THE ExaminationAudit page SHALL display aggregate statistics: total examinations, completed count, pending count, and submitted-awaiting-AI count
6. THE ExaminationAudit page SHALL retain the LabHero component and Horizon_Style design

### Requirement 6: Payment History Page Enhancement

**User Story:** As a platform admin, I want to view all payment transactions across all organizations, so that I can monitor platform revenue and identify payment issues.

#### Acceptance Criteria

1. THE PaymentHistory page SHALL fetch payment data from the Admin_API_Client instead of the orgManager API client
2. THE PaymentHistory page SHALL display payment ID, organization name, plan name, amount in DZD, status (paid/failed/refunded/pending), and transaction date
3. THE PaymentHistory page SHALL support filtering by payment status and organization
4. THE PaymentHistory page SHALL display aggregate financial metrics: total cleared revenue, failed payment amount, refund count, and average invoice value
5. THE PaymentHistory page SHALL NOT display controls for modifying or deleting payment records
6. THE PaymentHistory page SHALL retain the ReceiptHero component and Horizon_Style design
7. THE PaymentHistory page SHALL remove the informational banner stating payments are organization-scoped, since the admin view is platform-wide

### Requirement 7: Plans Manager Page Enhancement

**User Story:** As a platform admin, I want to manage subscription plans offered to organizations, so that I can configure pricing tiers and features.

#### Acceptance Criteria

1. THE PlansManager page SHALL fetch plan data from the Admin_API_Client instead of the orgManager API client
2. THE PlansManager page SHALL display all configured plans with name, slug, pricing (monthly and yearly), seat limits, patient limits, duration, and active status
3. THE PlansManager page SHALL provide controls for creating new plans with name, slug, pricing, limits, and description
4. THE PlansManager page SHALL provide controls for updating existing plan details
5. THE PlansManager page SHALL provide controls for activating and deactivating plans
6. THE PlansManager page SHALL retain the PremiumHero component, plan card grid layout, and Horizon_Style design

### Requirement 8: Subscription Tracker Page Enhancement

**User Story:** As a platform admin, I want to view all organization subscriptions platform-wide, so that I can monitor subscription health and identify organizations needing attention.

#### Acceptance Criteria

1. THE SubscriptionTracker page SHALL fetch subscription data from the Admin_API_Client instead of the orgManager API client
2. THE SubscriptionTracker page SHALL display each organization's subscription status, plan name, start date, end date, days remaining, and seat usage
3. THE SubscriptionTracker page SHALL support filtering by subscription status (active, trialing, expired, cancelled) and organization type
4. THE SubscriptionTracker page SHALL display aggregate metrics: total active subscriptions, expiring-soon count (within 30 days), monthly recurring revenue, and churn rate
5. THE SubscriptionTracker page SHALL NOT display controls for modifying subscriptions, as this is managed by each Org_Manager
6. THE SubscriptionTracker page SHALL retain the CalendarHero component and Horizon_Style design

### Requirement 9: Federated Registry Page Enhancement

**User Story:** As a platform admin, I want to manage federated learning rounds and view contributions from all organizations, so that I can govern the collaborative training process.

#### Acceptance Criteria

1. THE FederatedRegistry page SHALL fetch FL round data from the Admin_API_Client instead of the instructor API client
2. THE FederatedRegistry page SHALL display round number, AI model name, global accuracy, status, start/end dates, and contribution count per round
3. THE FederatedRegistry page SHALL provide controls for creating new FL rounds and completing open rounds with global accuracy
4. THE FederatedRegistry page SHALL display per-round contributions showing organization name, local sample size, accuracy before/after, and submission date
5. THE FederatedRegistry page SHALL display an accuracy-over-rounds chart showing model performance progression
6. THE FederatedRegistry page SHALL retain the AdminHero component and Horizon_Style design

### Requirement 10: Backend Admin API Endpoints for Missing Resources

**User Story:** As a platform admin, I want dedicated admin-scoped API endpoints for all platform resources, so that the dashboard can fetch data with proper authorization and platform-wide scope.

#### Acceptance Criteria

1. THE Laravel backend SHALL provide a `GET /api/admin/patients` endpoint returning paginated patients platform-wide with filters for organization_id, search, and age range
2. THE Laravel backend SHALL provide a `GET /api/admin/predictions` endpoint returning paginated predictions platform-wide with filters for status, organization_id, and ai_model_id
3. THE Laravel backend SHALL provide a `GET /api/admin/examinations` endpoint returning paginated examinations platform-wide with filters for status and organization_id
4. THE Laravel backend SHALL provide a `GET /api/admin/payments` endpoint returning paginated payments platform-wide with filters for status and organization_id
5. THE Laravel backend SHALL provide a `GET /api/admin/subscriptions` endpoint returning paginated subscriptions platform-wide with filters for status and organization_id
6. THE Laravel backend SHALL provide CRUD endpoints for subscription plans at `GET/POST/PUT/DELETE /api/admin/plans`
7. THE Laravel backend SHALL provide a `GET /api/admin/federated-rounds` endpoint returning paginated FL rounds with contributions, plus `POST` for creating rounds and `POST /{id}/complete` for completing rounds
8. WHILE a request lacks the admin role, THE Laravel backend SHALL return a 403 Forbidden response for all admin-scoped endpoints

### Requirement 11: Admin Overview Dashboard Data Completeness

**User Story:** As a platform admin, I want the overview dashboard to display comprehensive real-time KPIs, so that I can quickly assess platform health at a glance.

#### Acceptance Criteria

1. THE AdminOverview page SHALL display KPI tiles for: total users, total organizations, total predictions, completed FL rounds, active AI models, and total revenue
2. THE AdminOverview page SHALL display a user growth chart showing monthly registration trends over the last 12 months
3. THE AdminOverview page SHALL display a predictions-over-time chart showing monthly inference volume with completed vs failed breakdown
4. THE AdminOverview page SHALL display a subtype distribution pie chart showing Luminal A vs Non-Luminal A classification results
5. THE AdminOverview page SHALL display a top organizations ranking by prediction count
6. THE AdminOverview page SHALL display a recent audit activity feed showing the latest 6 platform actions
7. THE AdminOverview page SHALL display quick-action navigation cards linking to all admin sub-pages

### Requirement 12: Design System Preservation

**User Story:** As a platform admin, I want the dashboard to maintain visual consistency with the existing horizon design system, so that the user experience remains cohesive across all pages.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL use the existing hero components (AdminHero, GlassHero, MapHero, ClinicalHero, NeuralHero, LabHero, CircuitHero, PremiumHero, ReceiptHero, CalendarHero) appropriate to each page's domain
2. THE Admin_Dashboard SHALL use MetricTile, SparkTile, and CoinTile components for KPI display
3. THE Admin_Dashboard SHALL use the DataTable component with search, sort, and filter capabilities for all tabular data
4. THE Admin_Dashboard SHALL use StatusPill components with the established color tone system (teal for positive, pink/red for negative, amber for warning, blue for informational, slate for neutral)
5. THE Admin_Dashboard SHALL use Framer Motion stagger animations for page entry transitions
6. THE Admin_Dashboard SHALL use the established modal pattern (Modal, ConfirmDialog) for all create/edit/confirm workflows
7. THE Admin_Dashboard SHALL maintain the existing color palette: brand blue (#093A7A), primary blue (#0572B2), teal (#0BB592), pink (#F55486), and slate scale

### Requirement 13: AI Model Registry Governance

**User Story:** As a platform admin, I want full control over the AI model registry, so that I can govern which models are available for clinical inference.

#### Acceptance Criteria

1. THE AIModelRegistry page SHALL display all registered models with name, version, slug, inference type, accuracy metrics (accuracy, AUC, F1, sensitivity, specificity), activation status, and registration date
2. THE AIModelRegistry page SHALL provide controls for registering new models with name, slug, version, inference type, and performance metrics
3. THE AIModelRegistry page SHALL provide controls for activating a model (which deactivates all others) and deactivating models
4. THE AIModelRegistry page SHALL provide controls for updating model metadata
5. THE AIModelRegistry page SHALL prevent deletion of models that have completed predictions, displaying an informative error message
6. THE AIModelRegistry page SHALL use the Admin_API_Client for all operations and retain the CircuitHero component with Horizon_Style design

### Requirement 14: Audit Logs Comprehensive Filtering

**User Story:** As a platform admin, I want to filter and search audit logs by multiple criteria, so that I can investigate specific platform activities for compliance and security purposes.

#### Acceptance Criteria

1. THE AuditLogs page SHALL fetch audit log data from the Admin_API_Client with pagination
2. THE AuditLogs page SHALL support filtering by user, organization, action type, auditable entity type, and date range
3. THE AuditLogs page SHALL display timestamp, user name, organization, action performed, entity type, entity ID, and IP address for each log entry
4. THE AuditLogs page SHALL provide a detail view showing old values and new values for modification events
5. THE AuditLogs page SHALL display aggregate statistics: total log entries, entries today, unique users active, and most common action types
