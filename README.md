# Course Platform — Dashboard

The owner's admin app for the engineer's course platform: courses and sessions, students, payments, assistants and the public profile. One of three apps — see `../SYSTEM.md`.

**Stack:** React 19 · React Router 8 (framework mode, SPA) · Redux Toolkit + RTK Query · Tailwind CSS v4 · Radix UI · use-intl (AR/EN, RTL) · React Hook Form + Zod · MSW (mock API) · Vitest + Testing Library · Playwright.

## Getting started (Windows, macOS or Linux)

Requirements: Node.js 22 LTS or newer and [pnpm](https://pnpm.io) 11 (`corepack enable` picks the version pinned in `package.json`).

```bash
pnpm install
copy .env.example .env      # Windows (macOS/Linux: cp .env.example .env)
pnpm dev                 # http://localhost:5173
```

With `VITE_API_MOCKING=true` (the default in `.env.example`) the app answers every API call from an in-browser mock (MSW), so no backend is needed.

**Mock accounts** (mock only — the real API has its own users):

| Email | Role | Password |
|---|---|---|
| owner@example.com | Owner | `dashboard-demo` |
| admin@example.com | Admin | `dashboard-demo` |

Add `?mockError=500` to any page URL to see how a page handles API errors.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server with the mock API |
| `pnpm build` | Production SPA build in `build/client` (no mock code), plus `_headers` / `_redirects` |
| `pnpm check:build` | After a build: login JS ≤ 200 KB gzip, route splitting, CSP without violations |
| `pnpm typecheck` | Route type generation + TypeScript |
| `pnpm lint` | ESLint (incl. a11y rules and a "no raw hex colors" rule) |
| `pnpm format` | Prettier (+ Tailwind class sorting) |
| `pnpm test` | Vitest unit and component tests (MSW in Node) |
| `pnpm test:e2e` | Playwright, desktop + phone: acceptance flows (DAC-01…10) in English and Arabic, axe (WCAG 2.2 AA), 360 px layout (run `pnpm exec playwright install chromium` once) |
| `pnpm check` | typecheck + lint + tests |

## Project structure

```
app/
  root.tsx            html lang/dir, providers, loading fallback, error boundary
  routes.ts           route config (SRS §3.2)
  routes/             thin route modules (auth guard in app-layout.tsx)
  features/<name>/    RTK Query endpoints, components, schemas per feature
  components/ui/      primitives (Radix behavior + design tokens)
  components/layout/  app shell, navigation, page header
  store/              Redux store, the RTK Query `api` slice, UI slice
  domain/             shared types and rules (copied from the Website)
  i18n/ messages/     use-intl config, ar.json, en.json
  mocks/              MSW handlers + in-memory mock database (dev/tests only)
  styles/app.css      design tokens (Tailwind v4 @theme)
docs/                 SRS, PRD, design system, plan, progress, decisions
```

## Deploying

`pnpm build` and `pnpm check:build`, then serve `build/client` from any static host. The build writes `_headers` (security headers, CSP by hash) and `_redirects` (SPA fallback). Set `VITE_API_BASE_URL` to the Website backend's `/api/v1` and `VITE_API_MOCKING=false`. Details and an nginx example: `docs/deploy.md`.

## Documentation

Start with `AGENTS.md`, then `docs/SRS.md` (behavior and API contract) and `docs/PRD.md` (scope and priorities). Progress: `docs/PROGRESS.md`.

> All personal and course content is placeholder data from the Website's `DUMMY_DATA.md`.
