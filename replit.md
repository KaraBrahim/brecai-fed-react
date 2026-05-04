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

**Routing**: React Router DOM v7 with a centralized route configuration at `src/routes/index.jsx`. Routes are organized by user role:
- `/doctor/*` → Doctor dashboard suite
- `/instructor/*` → Federated training console
- `/admin/*` → System administration

**Layouts**: Two layout wrappers in `src/layouts/`:
- `DashboardLayout` — sidebar navigation with role-based menu items and breadcrumbs
- `AuthLayout` — login/registration wrapper

**State Management**: Zustand 5 with `persist` middleware (localStorage). Three main stores:
- `src/stores/authStore.js` — Demo accounts, login state, role switching. Contains hardcoded DEMO_ACCOUNTS with passwords.
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

### No Backend / No Database

This is a fully client-side application. There is no API server, no database, and no authentication server. All "data" is either:
1. Hardcoded seed arrays in store files and `adminSeed.js`
2. Persisted to `localStorage` via Zustand's `persist` middleware

The attached assets reference a Laravel backend API with registration/invitation flows — this is a planned integration, not yet implemented.

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

**No external APIs are currently called at runtime.** The platform is entirely self-contained with mock data. Future integration with a Laravel backend API is planned (see attached assets for registration/invitation endpoint schemas).