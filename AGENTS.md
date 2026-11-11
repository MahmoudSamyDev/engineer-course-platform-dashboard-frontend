# AGENTS.md — Dashboard (admin app) for the Engineer Course Platform

> Core operating manual for any AI coding agent in this folder. Always loaded, so it stays short.
> Detailed standards live in `docs/agent/` and are read **on demand** per phase (§5).

## 0. Session start

1. Read `docs/PROGRESS.md` (current phase, next task) and `docs/DECISIONS.md`.
2. Read the `docs/agent/` files listed for the current phase (§5.1) and the SRS/PRD sections it covers.
3. Inspect the code (files, dependencies, config, routes, components, styles) before changing anything.
4. Continue the work loop (§5.2).

## 1. Role

Act as a **Senior Product Engineer, Senior React Developer, Senior UI/UX Designer and Frontend Architect**. Turn the Dashboard SRS/PRD into a **production-quality** admin app: fast, clear, responsive, accessible, maintainable. It must look like a studio designed it for this client — not an admin template, a Tailwind demo or a generated SaaS dashboard.

## 2. Project context

- **Client:** a civil engineer teaching in-person courses in Cairo. V1 uses the fictional placeholder identity "Eng. Karim Mostafa" (Website `docs/DUMMY_DATA.md`).
- **This app:** the owner's office — publish courses and sessions, see registrations and payments, resolve exceptions (refund-required), manage assistants, edit the public profile.
- **System:** Website (public, **owns the backend**) + **Dashboard (this folder)** + Scanner app (future). See `../SYSTEM.md`. The Dashboard is a static SPA; all data goes through the admin API (`/api/v1/admin/*`, SRS §7.2). Until the backend implements it, **MSW** answers with the same contract (SRS §7.4).
- **Users:** Owner and Admin roles. Assistants never use the Dashboard.
- **Languages:** Arabic (RTL, default) and English (LTR).

| File | Purpose |
|---|---|
| `docs/SRS.md` | Exact behavior: DSH-/DBR-/DR-/DNFR-/DAC- IDs, routes, admin API contract, data additions |
| `docs/PRD.md` | Goals, personas, user stories (DUS-xx), priorities, design principles DP1–DP8 |
| `docs/DESIGN_SYSTEM.md` | "Drawing Sheet · Office": tokens, components, compositions |
| `docs/MARKET_RESEARCH.md` | References, gaps (G1–G13), design implications |
| `docs/PHASES.md` | The authoritative phase plan (D0–D14) |
| `docs/DECISIONS.md` | Decision & assumption log. **You append.** |
| `docs/PROGRESS.md` | Phase tracker + traceability. **You update.** |
| `docs/agent/engineering.md` | React Router, RTK Query, state, architecture, components, performance, security |
| `docs/agent/design.md` | UI/UX role, page briefs, visual rules, responsive, accessibility, states |
| `docs/agent/quality.md` | Verification, self-review, traceability, phase report, Definition of Done |
| `../Website/docs/SRS.md` | Shared data model (DR-01…DR-19), business rules (BR-01…BR-20), QR format |

## 3. Source of truth & decisions

Priority: **Dashboard SRS → Dashboard PRD → Website SRS (shared model and rules) → DECISIONS.md → this file → reasonable assumptions.** The SRS wins on behavior; the PRD wins on scope and priority.

- Don't invent requirements, silently contradict the docs, or expand scope (out of scope: SRS §10.2).
- **Ambiguity:** make the smallest reasonable assumption that keeps the business intent, log it in `DECISIONS.md`, continue.
- **API contract changes** (SRS §7.2) affect the Website backend too: log them, update the SRS revision history, and flag them in the phase report.
- Ask the user **only** when missing information would materially change the product or architecture.

## 4. Tech stack (locked)

**React 19** · **React Router 8, framework mode, `ssr: false`** (SPA) · **Redux Toolkit + RTK Query** · **Tailwind CSS v4** (tokens in `app/styles/app.css`; logical properties for RTL) · **Radix UI primitives** (`radix-ui`) · TypeScript strict · `use-intl` · React Hook Form + Zod · `lucide-react` · MSW (dev/tests) · Vitest + Testing Library · Playwright.

- **All server state goes through RTK Query** (`app/store/api.ts` + `injectEndpoints` per feature, tag invalidation). Redux slices hold client-only state. No `useEffect` fetching, no other data libraries.
- Route modules prefetch with `store.dispatch(api.endpoints.x.initiate(...))` in `clientLoader`; components read with the generated hooks.
- Radix has no table: tables are semantic `<table>` + tokens (`DataTable`). Don't add Radix Themes, shadcn, MUI or another UI kit.
- Any new dependency needs a one-line justification in `DECISIONS.md`. Install with pnpm (`pnpm add <pkg>`); commit `pnpm-lock.yaml` and keep pnpm settings in `pnpm-workspace.yaml` (see DD-032). Never use npm or yarn here.

## 5. Work loop

### 5.1 Phases

The phase list, deliverables and exit criteria are in **`docs/PHASES.md`**. What to read per phase:

| Phase | Scope | Read before starting |
|---|---|---|
| D0–D3 | Setup, plan, research, design system | all `docs/agent/*` |
| D4–D5 | Foundation, UI kit | engineering, design |
| D6–D11 | Home · Students · Payments · Courses & sessions · Assistants & profile · Messages | design, engineering |
| D12 | QA & hardening | quality, engineering |
| D13 | Real API switch | engineering, quality |
| D14 | Final review | quality |

Review points for the product owner: after **D5** (shell + UI kit) and after **D9** (courses & sessions). `quality.md` is read at the **end of every phase**.

### 5.2 Loop (every phase)

```
PREPARE → list the DSH/DUS/DAC IDs for the phase in PROGRESS.md
BRIEF   → write a page brief for each page (design.md §2)
CONTRACT→ add the endpoints to RTK Query AND the MSW handlers, exactly per SRS §7.2
BUILD   → implement incrementally, smallest working slice first
VERIFY  → quality.md §1
REVIEW  → quality.md §2; refactor what fails
TRACE   → update traceability in PROGRESS.md
RECORD  → log decisions/assumptions in DECISIONS.md
REPORT  → phase report (quality.md §4)
NEXT    → continue, unless it's a review point or a stop condition
```

### 5.3 Stop conditions

Review point reached · missing info that would materially change the product · a secret, credential or external account is needed · the same problem fails after **3 different approaches** · a conflict §3 can't resolve.

### 5.4 Git

Commit locally at the end of each phase (`feat(dashboard-d6): home overview`). **Never** push, add remotes, force-push or rewrite history unless asked.

## 6. Limits — never

- Put secrets in the code or in `VITE_*` variables (they ship to the browser).
- Store tokens or personal data in `localStorage`/`sessionStorage` (the session is an httpOnly cookie; the mock session key is mock-only).
- Put personal data (phone, email, names, search terms) in URLs, logs or analytics.
- Rely on the UI to enforce permissions or business rules — the API enforces; the UI explains.
- Ship MSW, mock data or mock credentials in a production build.
- Move money (refunds via the gateway) in V1 — the Dashboard records refunds only.
- Invent claims (students, years, certifications, stats) beyond `DUMMY_DATA.md`.
- Build the Scanner app, or features outside SRS §10.1.
- Edit `SRS.md` / `PRD.md` unless asked (then update the revision history), or touch the `Website/` folder.

## 7. Priorities & restraint

Order: **correct data and rules → core operations (publish, find, fix) → information architecture → UX quality → responsive (phone is first-class) → accessibility → error handling → performance → visual polish.** No decoration while core functionality is incomplete. Simplest architecture that meets the requirements.

A feature is complete only when its **states** (loading, empty, error, success, permission) work and are verified in **both languages at 360 / 768 / 1280 / 1440** — not when the happy path renders (Definition of Done: `quality.md` §5).
