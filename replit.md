# BRECAI-FED · Clinical AI Platform

## Overview

BRECAI-FED is a **Federated AI platform for Medical Analytics**, specifically focused on **Luminal A breast cancer molecular subtyping**. It is a pure frontend React application (no backend) that simulates a clinical workflow where doctors, instructors, and administrators interact with AI-driven cancer prediction tools.

The platform supports three distinct user roles:
- **Doctor**: Views patient data, runs AI predictions, reviews XAI (Explainable AI) visualizations, and generates clinical reports.
- **Instructor**: Monitors and manages federated learning training runs across multiple clinical sites.
- **Admin (Org Admin / Platform Admin)**: Manages users, organizations, examinations, and audit logs system-wide.

All data is currently seeded and static (no real backend). The platform is designed for demo/prototype purposes with rich mock data representing Algerian clinical institutions (CHU Oran, CHU Algiers, CHU Constantine, etc.).

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend Architecture

**Framework**: React 19 with Vite 8 as the build tool. The app uses ESM modules throughout.

**Routing**: React Router DOM v7 with a centralized route configuration at `src/routes/index.jsx`. A root `RootLayout` wrapper handles app initialization (mirrors Vue's `App.vue` onMounted fetchUser). Routes are organized by user role under `/app/*`:
- `/app/doctor/*` → Doctor dashboard suite (requires `doctor` role)
- `/app/instructor/*` → Federated training console (requires `instructor` role)
- `/app/org/*` → Org Manager pages (requires `org_manager` role)
- `/app/admin/*` → System administration (requires `admin` role)
- `*` → CatchAll: authenticated → role home, guest → `/`

**Route Guards** (`src/routes/guards.jsx`) — mirrors Vue Router's `beforeEach`:
- `GuestOnly` — wraps `/auth` routes; authenticated users are redirected to their role home
- `RequireAuth` — wraps `/app` routes; unauthenticated → `/auth`; wrong role → correct role home
- `CatchAll` — 404 handler, redirects based on auth state

**Role Enum** (`src/enums/roles.js`):
- API role keys: `admin`, `org_manager`, `doctor`, `instructor`
- `ROLE_HOME_MAP` maps both API keys and legacy display names to React paths

**Layouts** (`src/layouts/`):
- `RootLayout` — root wrapper; calls `fetchUser()` on mount, shows spinner while `!isInitialized`
- `DashboardLayout` — sidebar navigation with role-based menu items
- `AuthLayout` — login/registration wrapper

**API Client** — two-layer setup:
- `src/api/axios.js` — axios instance with `withCredentials: true`; base URL is `''` (relative) in dev so the Vite proxy forwards requests, and `VITE_API_URL` in production.
- `src/lib/api.js` — thin wrapper over the axios instance that normalises errors (`err.response.data` → `{ message, status, data, isUnauthenticated }`) and exposes `getCsrf()`, `get()`, `post()`, `put()`, `patch()`, `delete()`.
- Vite dev-server proxy (`vite.config.js`) forwards `/api/*` and `/sanctum/*` to the real Laravel backend, eliminating CORS in local dev.

**State Management**: Zustand 5 with `persist` middleware (localStorage). Three main stores:
- `src/stores/authStore.js` — Full auth logic: `isInitialized`, `isAuthenticated`, `tempEmail` (localStorage bridge), `userRole()` getter (reads `user.roles[0].name || user.role`), `fetchUser({ force })`, `login()`, `sendOtp()`, `verifyOtp()` (axios, not raw fetch), `logout()`. Real Laravel Sanctum backend via HttpOnly cookies.
- `src/stores/patientStore.js` — Patient list with clinical biomarker data (ER, PR, HER2, Ki-67, tumor size, etc.)
- `src/stores/reportStore.js` — Clinical reports with sign/draft status

**Page Modules** (under `src/pages/`):
- `doctor/` — Insights dashboard, Patient list, Prediction Engine, Examination, Reports, XAI Deep Dive
- `instructor/` — Federated training console and model architect
- `admin/` — User management, organization management, audit logs

**Seed Data**: `src/lib/adminSeed.js` provides rich static mock data for admin views (users, orgs, examinations, predictions across multiple hospitals).

### Styling System

**Tailwind CSS v4** with the new Vite plugin integration (`@tailwindcss/vite`). No `tailwind.config.js` — configuration is done inline in `src/styles/globals.css` via `@theme` directive.

**Design Language**:
- Glassmorphism aesthetic with clinical gradients
- Custom brand colors: `brand-dark` (#093A7A), `brand-blue` (#0572B2), `brand-teal` (#0BB592), `brand-pink` (#F55486)
- Fonts: Plus Jakarta Sans (UI) + JetBrains Mono (code/data)
- "God Mode" high-density information layout for clinical use cases
- Subtle animated background grid pattern on body

**Animation**: Framer Motion 12 for page transitions and interactive probability visualizations.

### PDF Export

`src/lib/reportPdf.js` uses **jsPDF** to generate branded clinical PDF reports with BRECAI-FED headers, patient data, and prediction results. No external PDF service needed — runs entirely in the browser.

### Utility Layer

`src/lib/utils.js` exports a `cn()` helper that combines `clsx` + `tailwind-merge` for safe conditional Tailwind class merging. This is the standard shadcn/ui utility pattern.

### Path Aliasing

`@` resolves to `./src` (configured in `vite.config.js`). Import as `@/stores/authStore` etc.

### Backend Integration

Auth calls hit a real Laravel Sanctum backend at `https://breast-cancer-detection-backend-main-p7c9cg.laravel.cloud`. Session is cookie-based (HttpOnly) — no tokens stored in localStorage. All other data (patients, reports, admin views) is still seeded mock data in the frontend.

---

## External Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` + `react-dom` | 19 | Core UI framework |
| `react-router-dom` | 7 | Client-side routing |
| `zustand` | 5 | Global state management with localStorage persistence |
| `framer-motion` | 12 | Animations and transitions |
| `recharts` | 3 | Data visualization (radar charts, bar charts for XAI) |
| `jspdf` | 4 | Client-side PDF generation for clinical reports |
| `tailwindcss` | 4 | Utility-first CSS framework |
| `@tailwindcss/vite` | 4 | Tailwind v4 Vite integration (replaces PostCSS config) |
| `lucide-react` | 1 | SVG icon library |
| `clsx` + `tailwind-merge` | latest | Conditional class merging utility |
| `class-variance-authority` | 0.7 | Component variant styling |
| `@radix-ui/react-slot` | 1 | Headless UI slot primitive for composable components |

**Google Fonts** (loaded via CSS `@import`):
- Plus Jakarta Sans (weights 300–800)
- JetBrains Mono (weights 400, 600, 700)

Auth API calls go to the real Laravel backend. All clinical data (patients, reports, admin views) is still seeded mock data. `axios` (v1) added as HTTP client dependency.