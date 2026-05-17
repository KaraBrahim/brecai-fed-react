# BRECAI-FED · Clinical AI Platform

A Federated AI platform for medical analytics focused on Luminal A breast cancer molecular subtyping. Role-based dashboard for doctors, instructors, org managers, and platform admins.

## Run & Operate

- **Dev**: `npm run dev` (port 5000)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Required env vars**: `VITE_API_URL` (optional in dev — Vite proxy handles it; required in production, defaults to the Laravel Cloud backend)

## Stack

- React 19, Vite 8, React Router 7
- Tailwind CSS 4 (via `@tailwindcss/vite` plugin, no `tailwind.config.js`)
- Zustand 5 (with `persist` middleware), Framer Motion 12, Recharts 3
- Axios 1 (with `withCredentials: true` for cookie-based auth)
- jsPDF 4 (client-side PDF generation)

## Where things live

- `src/routes/index.jsx` — all route definitions + guards
- `src/routes/guards.jsx` — `GuestOnly`, `RequireAuth`, `RequireOtp`, `CatchAll`
- `src/stores/authStore.js` — auth state (login, OTP, logout, fetchUser)
- `src/api/axios.js` + `src/lib/api.js` — axios instance + normalised error wrapper
- `src/config/auth.js` — all API endpoint constants
- `src/enums/roles.js` — role keys + `ROLE_HOME_MAP`
- `src/styles/globals.css` — Tailwind v4 `@theme` config + Google Fonts
- `src/lib/adminSeed.js` — mock data for admin views
- `vite.config.js` — proxy config, path alias (`@` → `src/`)

## Architecture decisions

- **Cookie-based auth via Laravel Sanctum** — HttpOnly session cookie, `withCredentials: true` on every request; no tokens in localStorage
- **Vite dev proxy** — `/api/*` and `/sanctum/*` forwarded to `https://breast-cancer-detection-backend-main-p7c9cg.laravel.cloud` to avoid CORS in dev
- **Tailwind v4 Vite plugin** — replaces PostCSS config; `@theme` directive in CSS instead of `tailwind.config.js`
- **Mock data in frontend** — patient records, reports, and admin views are seeded static data; only auth hits the real backend
- **Role-based routing** — `RequireAuth` checks both auth state and role, redirecting mismatched roles to their correct home

## Product

- Doctor: patient registry, AI prediction engine, XAI deep dives, clinical PDF reports
- Instructor: federated training console, model architecture viewer, aggregation logs
- Org Manager: team roster, site compliance
- Admin: user/org management, subscription tracking, audit logs, AI model registry

## User Preferences

Preferred communication style: Simple, everyday language.

## Gotchas

- Tailwind v4 uses `@tailwindcss/vite` — do NOT add `postcss.config.js` or a separate `tailwind.config.js`
- The `@` path alias resolves to `./src` — always use it for imports
- Auth store uses `force: true` in `fetchUser` after OTP to prevent spinner flash
- `VITE_API_URL` must be set in production deployment (Replit Secrets)

## Pointers

- Laravel backend: `https://breast-cancer-detection-backend-main-p7c9cg.laravel.cloud`
- Skills: `workflows`, `environment-secrets`, `package-management`
