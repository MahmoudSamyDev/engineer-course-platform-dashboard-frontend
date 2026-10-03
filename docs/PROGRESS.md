# Progress Tracker — Dashboard

**Current phase:** D9 — Courses, sessions & attendance (🔄 in progress — see “Handoff” below)
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
| D5 | UI kit & states | ✅ | Kit built and reviewed through the real pages (no separate /dev/ui route, DD-027) |
| D6 | Home | ✅ | KPI title block, needs action, revenue chart, latest lists, upcoming sessions |
| D7 | Students | ✅ | Table, filters, search, paging, CSV, student page |
| D8 | Payments | ✅ | Summary, filters, details sheet, refund / move / cancel (independent review still pending) |
| D9 | Courses, sessions & attendance | 🔄 | Cards, Add course dialog, 4 of 6 course tabs done; sessions, publishing, session page left |
| D10 | Assistants & profile | ⬜ | |
| D11 | Messages & polish | ⬜ | |
| D12 | QA & hardening | ⬜ | |
| D13 | Real API switch | ⬜ | Depends on Website Phase 8 + admin API |
| D14 | Final review | ⬜ | |

Legend: ⬜ not started · 🔄 in progress · ✅ done · ⚠️ done with notes · ⛔ blocked

## Handoff — where to continue (2026-10-03)

**State:** `npm run typecheck`, `npm run lint` (1 known warning, below) and `npm test` (5 files, 30 tests) pass. Pages verified with screenshots at 360/1280 px (AR/EN): Home, Students, Student, Payments, Courses.

**Done in D5–D8 (code map)**
- UI kit — `app/components/ui/`: dialog, sheet, confirm-dialog, menu, tabs (`UrlTabs`), select, switch, textarea, toast, skeleton, title-block, seat-bar, data-table (stacked rows on phones), filter-bar (filters move into a dialog on phones), pagination, error-state, icon-button, bilingual-field, panel. Shared: `components/format.tsx` (Money, DateTime, Phone, Ltr), `components/status.tsx` (all status badges), `section-form.tsx`, `ordered-list-editor.tsx`, `unsaved-changes.tsx`, `use-discard-guard.tsx`, `export-button.tsx`, `copy-button.tsx`.
- Data: `app/domain/api.ts` (all API payload types), pure rules with tests (`attendance.ts`, `months.ts`, `course-rules.ts`, `session-rules.ts`, `status-tone.ts`, `money.ts`).
- Mock API — `app/mocks/`: seeded database (`db.ts`: ~28 sessions incl. 5 months of history, ~550 bookings, payments with refund-required/refunded/failed/cancelled, check-ins, assistants, messages), payload builders (`views.ts`), handlers for **every** SRS §7.2 endpoint (`handlers/*.ts`).
- RTK Query endpoints for every feature: `app/features/*/api.ts` (overview, students, payments, courses, assistants, profile, messages).
- Pages: `routes/home.tsx`, `students.tsx`, `student.tsx`, `payments.tsx`, `courses.tsx`.

**D9 — remaining tasks, in order**
1. `features/courses/tabs/sessions-tab.tsx` — list sessions (`useGetCourseSessionsQuery`), row → `/courses/:courseId/sessions/:id`, row menu: edit, close/reopen (`useSetSessionClosedMutation`), unpublish, delete (only without bookings).
2. `features/courses/session-dialog.tsx` — add/edit session (SRS DSH-SES-02…04): location (`useGetLocationsQuery`), label AR/EN, capacity (min = sold + held, `minimumCapacity`), price (default course price), meetings rows (date + start + end, Cairo time via `zonedLocalToUtcIso`), "repeat weekly × N" (add 7 days to the *local date string*, not to UTC), registration closes (default `defaultRegistrationClose`), published switch; validate with `checkMeetings`; map API errors `CAPACITY_BELOW_SOLD`, meetings codes.
3. `features/courses/tabs/publishing-tab.tsx` — readiness checklist from `course.readiness` with links to the tab that fixes each item; switches: published (blocked while not ready), featured, coming soon + note, registration closed; SEO title/description AR/EN (60/160 counters). `useUpdateCourseMutation`.
4. `routes/course.tsx` — replace the placeholder: `PageHeader` (title, back to `/courses`, "View on website" when published), `UrlTabs` with overview · content · curriculum · sessions · faq · publishing (tab components exist for 4 of them in `features/courses/tabs/`), loading/404/error states, `clientLoader` prefetch.
5. `routes/session.tsx` — facts `TitleBlock`, roster table with a column per meeting: ✓ (click → confirm undo, `useUndoCheckInMutation`), "Mark" button when the meeting has started (from 60 min before) and the booking is PAID (`useCheckInMutation`), — otherwise; Edit (session dialog), Close/Reopen, Export CSV (`/sessions/:id/roster.csv`), Print (add `print:hidden` to the shell's rail/top bar/banner and a print stylesheet).
6. Messages (EN + AR) for the new screens, screenshots at 360/768/1280/1440 in both languages, phase report, local commit `feat(dashboard-d9): courses and sessions`.

**Then:** D10 assistants & profile (APIs and mocks exist: `features/assistants/api.ts`, `features/profile/api.ts`) → D11 messages (`features/messages/api.ts`) → D12 QA → D13 real API → D14 review (`docs/PHASES.md`).

**Known issues / polish backlog**
- Payments filter bar wraps to a second line at 1280 px (6 controls) — consider moving method + date into a "More filters" popover.
- Course card "next session" date truncates in Arabic — use a shorter date format there (no weekday).
- ESLint warning `react-hooks/incompatible-library` on `form.watch` in `add-course-dialog.tsx` (React Compiler can't memoize RHF's `watch`; harmless) — switch to `useWatch` to silence.
- Independent review of refund/move/cancel (CLAUDE.md asks for one in D8) not run yet.
- `/admin/counts` was added to the API contract (DD-026) — the Website backend must implement it.

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

### Phases D5–D8 — UI kit, Home, Students, Payments: ✅ complete (D8 review pending)

**Delivered:** DSH-NAV-04 (badges), DSH-GEN-04/05/08/09/11, DSH-HOME-01…08, DSH-STU-01…08, DSH-PAY-01…09, DSH-EXP-01 (CSV via API); mock API for all of SRS §7.2.
**Verified:** typecheck ✅ · lint ✅ (1 warning) · 30 unit/component tests ✅ · screenshots Home/Students/Student/Payments at 360 + 1280 in AR/EN, no console errors. Fixed during review: phone overflow on Home (grid min-content), students table too wide at 1280 (phone moved under the name, department/reference only ≥ 1440), filters behind a dialog on phones, sign-in language choice being overridden by the saved preference (DD-025), browser `confirm()` replaced by our dialog.
**API contract:** added `GET /admin/counts` (DD-026).
**Decisions:** DD-025…DD-028.
**Next:** D9 tasks 1–6 above.
