# Progress Tracker — Dashboard

**Current phase:** D5 — UI kit & states (next)
**Last updated:** 2026-10-03

Agents update this file in every loop iteration (AGENTS.md §5.2). Phase definitions: `docs/PHASES.md`.

## Phases

| Phase | Name | Status | Notes |
|---|---|---|---|
| D0 | Setup & agent memory | ✅ | Skills copied; AGENTS.md, CLAUDE.md, docs/agent/* |
| D1 | Plan | ✅ | `docs/PHASES.md` |
| D2 | Market research | ✅ | `docs/MARKET_RESEARCH.md` (gaps G1–G13) |
| D3 | Requirements & design system | ✅ | SRS, PRD, `../SYSTEM.md`, DESIGN_SYSTEM — **awaiting product-owner review** |
| D4 | Foundation (boilerplate) | ✅ | Shell, sign-in, store, RTK Query, i18n, MSW, tests |
| D5 | UI kit & states | ⬜ | Review point at the end |
| D6 | Home | ⬜ | |
| D7 | Students | ⬜ | |
| D8 | Payments | ⬜ | |
| D9 | Courses, sessions & attendance | ⬜ | Review point at the end |
| D10 | Assistants & profile | ⬜ | |
| D11 | Messages & polish | ⬜ | |
| D12 | QA & hardening | ⬜ | |
| D13 | Real API switch | ⬜ | Depends on Website Phase 8 + admin API |
| D14 | Final review | ⬜ | |

Legend: ⬜ not started · 🔄 in progress · ✅ done · ⚠️ done with notes · ⛔ blocked

## Page briefs

**Sign in.** Question: "Can I get in safely?" Primary user: the owner, on a phone or laptop. Primary action: *Sign in*. Hierarchy: brand block + language switch → title + one-line purpose → email, password (show/hide) → error → button → forgot-password note. States: field errors on blur, wrong credentials (one generic message), locked (429), network error, session-ended and signed-out notices. Covers DSH-AUTH-01…03, 05–07; DAC-01.

**App shell.** Question: "Where am I and where can I go?" Rail ≥ 1024 px (brand title block, 7 routes, language, user menu); mobile top bar (menu, product, language) + drawer. Active route: wash + start bar + semibold. Covers DSH-NAV-01…03, 05; DSH-GEN-02, 10.

## Traceability

| Requirement | Route | Component(s) | Endpoint(s) | States verified | Tests | Status |
|---|---|---|---|---|---|---|
| DSH-GEN-01 | root | `HydrateFallback` | — | pre-rendered `index.html` (lang=ar, dir=rtl, branded loading) | build | ✅ |
| DSH-GEN-02 | all | `LanguageSwitch`, `LocaleBootstrap`, `AppProviders` | `PATCH /admin/auth/me` | AR⇄EN, RTL⇄LTR, remembered, user preference wins | e2e `switches to English` | ✅ |
| DSH-GEN-10 | signed-in | `MockBanner` | — | dev only | visual | ✅ |
| DSH-NAV-01/02/03 | signed-in | `AppShell`, `NavList`, `MobileNav`, `UserMenu` | — | 360/768/1280/1440, AR/EN, drawer, menu | visual | ✅ |
| DSH-NAV-05 | all pages | `PageHeader` | — | one h1, one primary | visual | ✅ |
| DSH-AUTH-01/02/03 | `/login` | `Login`, `Field`, `Input`, `Button` | `POST /admin/auth/login` | empty, invalid, wrong credentials, locked, loading | `login.test.tsx`, e2e | ✅ (mock) |
| DSH-AUTH-04 | layout | `requireUser` middleware | `GET /admin/auth/me` | redirect with `next`, return after sign-in | e2e `redirects to sign-in` | ✅ (mock) |
| DSH-AUTH-05 | layout | base query 401 → `sessionEnded` | any | redirect with `reason=expired` | — (D5 test) | 🔄 |
| DSH-AUTH-06 | user menu | `UserMenu` | `POST /admin/auth/logout` | cache reset, signed-out notice | visual | ✅ (mock) |
| DSH-AUTH-07 | `/login` | note | — | "Contact the administrator" | visual | ✅ |
| DMK-01…05 | — | `app/mocks/*` | auth | dev + tests; no mock code in build | build grep | ✅ (auth only) |

## Phase reports

### Phases D0–D4 — Setup, plan, research, requirements, design system, boilerplate: ✅ complete (D3 awaiting review)

**Delivered**
- **D0:** skills copied into `.claude/skills/` (`frontend-design`, `ui-ux-pro-max`, `design-system`, `ui-styling`, `brand`) + the official `react-router` skill; `AGENTS.md`, `CLAUDE.md`, `docs/agent/{engineering,design,quality,claude-lessons}.md` adapted for a React Router SPA.
- **D2:** `MARKET_RESEARCH.md` — Eventbrite, Luma, Teachable/Thinkific, Egyptian center systems, Paymob refunds, PDPL; 13 gaps decided (sessions management, roles, refund-required queue, lookup, roster, attendance, messages, exports…).
- **D3:** `SRS.md` (routes, 100+ requirements, **admin API contract**, data additions DR-20…23, NFRs, DAC-01…10), `PRD.md` (goals, personas, DUS-01…25, DP1–DP8, release plan), `../SYSTEM.md` (3-app architecture), `DESIGN_SYSTEM.md` ("Drawing Sheet · Office").
- **D4:** React Router 8 SPA boilerplate with Redux Toolkit/RTK Query, Tailwind v4 tokens, self-hosted fonts, Radix, use-intl (AR/EN), MSW auth mock, all routes (placeholders), app shell, sign-in, Vitest + Playwright.

**Verified**
- `npm run typecheck` ✅ · `npm run lint` ✅ · `npm test` ✅ (4 files, 15 tests) · `npm run test:e2e` ✅ (6 specs: desktop + mobile) · `npm run build` ✅ (no mock code in `build/client`).
- Screenshots at 360/768/1280/1440 in AR and EN (sign-in, errors, shell, drawer, user menu, 404) inspected. Fixed: duplicate title in the mobile top bar (DD-017); awkward field-name interpolation in errors.
- A component test caught an unhandled rejection in the login cache update; fixed.

**API contract:** `POST /admin/auth/login`, `POST /admin/auth/logout`, `GET/PATCH /admin/auth/me` mocked per SRS §7.2.

**Decisions:** DD-001…DD-024.

**Known issues / deferred**
- Expected 401 from `/auth/me` before sign-in appears in the browser console as a failed request (it's the contract; not an app error).
- Placeholder pages until D6–D11; "Add course" / "Add assistant" buttons disabled until D9/D10.
- DSH-AUTH-05 needs a test (D5).

**Next:** D5 — UI kit: start with the `/dev/ui` preview route, then Button/IconButton/Badge/Skeleton.

**🎓 Claude ecosystem lesson — Reusing project memory and skills in a second app**
- **Concept:** Claude Code reads `CLAUDE.md` at session start (here it imports `AGENTS.md` with `@AGENTS.md`), and loads project skills from `.claude/skills/<name>/SKILL.md`. Only a skill's *description* sits in context; its body loads when used, so skills are cheap until needed.
- **How we used it here:** the Website's rules were adapted, not copied blindly — new stack, new phases, new limits. Five design skills were copied; four that don't fit a dashboard were left out. `create-react-router` ships an official React Router skill in `.agents/skills/`; we moved it to `.claude/skills/react-router`, the folder Claude Code loads.
- **Why it matters:** one well-structured memory file per app keeps every session consistent, and selective skills keep context small.
- **Try it yourself:** open the Dashboard folder in Claude Code and type `/` — you'll see `react-router`, `ui-ux-pro-max` and the others. Run `/react-router` and ask "how does SPA mode pre-render the root route?"
- **Docs:** https://code.claude.com/docs/en/skills · https://code.claude.com/docs/en/memory
