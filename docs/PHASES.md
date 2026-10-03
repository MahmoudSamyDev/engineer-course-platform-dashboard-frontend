# Implementation Plan & Phases — Dashboard V1

| Item | Value |
|---|---|
| Version | 1.0 |
| Date | 2026-10-03 |
| Sources | `docs/SRS.md` · `docs/PRD.md` · `docs/DESIGN_SYSTEM.md` · `docs/MARKET_RESEARCH.md` · `../SYSTEM.md` |
| Status | D0–D4 done; next: **D5 — UI kit** |

This file is the **authoritative phase list**. `AGENTS.md` §5 points here; `PROGRESS.md` tracks status.

---

## 1. Current state (2026-10-03)

| Area | State |
|---|---|
| Framework | React Router **8.4** framework mode, `ssr: false`; React **19.3**; Vite 8 |
| State & data | Redux Toolkit 2.13 + RTK Query: one `api` slice, `ui` slice (locale, session-ended), typed hooks |
| Styling | Tailwind CSS 4.3 with `@theme` tokens ("Drawing Sheet · Office"), self-hosted fonts |
| UI | Radix (`radix-ui` 1.6): Dialog (mobile nav), DropdownMenu (user menu), ToggleGroup (language), Avatar, Label, Slot, DirectionProvider, Tooltip.Provider |
| i18n | `use-intl` 4.14, `ar.json` (default) + `en.json`, RTL/LTR switch, typed keys |
| Mock API | MSW 3: auth endpoints, guard, `?mockError=`, in-memory DB seeded from the Website placeholder data |
| Routes | All SRS §3.2 routes exist; signed-in routes guarded; pages are placeholders until their phase |
| Quality | ESLint (a11y, hooks, no raw hex), Prettier, Vitest (15 tests), Playwright (6 specs, desktop + mobile) — all green; production build has no mock code |

### React Router 8 / MSW 3 facts that shape the plan

- SPA mode still pre-renders the root route at build time → modules must be SSR-safe at import and first render.
- `clientMiddleware` is stable and runs on every client navigation; add a `clientLoader` where it must also run on first load.
- Only the root route may have a (build-time) `loader` in SPA mode; everything else uses `clientLoader`/`clientAction`.
- MSW 3: `onUnhandledFrame` (was `onUnhandledRequest`), `msw/vite` plugin serves the worker in dev.

---

## 2. Route & screen map

| Route | Screen | Key components | Phase |
|---|---|---|---|
| `/login` | Sign in | StatusScreen, Field, Button | D4 ✅ |
| `/` | Home | TitleBlock (KPIs), NeedsAction, RevenueChart, LatestPayments, LatestRegistrations, UpcomingSessions | D6 |
| `/students` | Students | FilterBar, DataTable, Pagination, StackedRows (mobile) | D7 |
| `/students/:studentId` | Student details | TitleBlock, RegistrationList, AttendanceGrid (read) | D7 |
| `/payments` | Payments | SummaryBar, FilterBar, DataTable, PaymentSheet, RecordRefundDialog | D8 |
| `/courses` | Courses | CourseCard grid, StateTabs, AddCourseDialog | D9 |
| `/courses/:courseId` | Course details | Tabs: Overview, Content, Curriculum, Sessions, FAQ, Publishing; SessionDialog | D9 |
| `/courses/:courseId/sessions/:sessionId` | Session & roster | TitleBlock, RosterTable, AttendanceGrid, print stylesheet | D9 |
| `/assistants` | Assistants | AssistantCard grid, AssistantDialog | D10 |
| `/profile` | Profile | Tabs, BilingualField, PhotoUpload, sortable lists | D10 |
| `/messages` | Messages | MessageList, MessageSheet | D11 |

---

## 3. Phases

Status: ⬜ not started · 🔄 in progress · ✅ done · ⚠️ done with notes

| # | Phase | Key deliverables | Requirements | Exit criteria | Status |
|---|---|---|---|---|---|
| D0 | **Setup & agent memory** | Skills copied, `AGENTS.md`, `CLAUDE.md`, `docs/agent/*` | — | Agents can start from `AGENTS.md` | ✅ |
| D1 | **Plan** | This file | — | Linked from AGENTS.md | ✅ |
| D2 | **Market research** | `MARKET_RESEARCH.md`: references, gaps G1–G13 | PRD §2 | Gaps decided in SRS/PRD | ✅ |
| D3 | **Requirements & design system** | `SRS.md`, `PRD.md`, `../SYSTEM.md`, `DESIGN_SYSTEM.md`, tokens | all | Approved by the product owner (review) | ✅ (pending review) |
| D4 | **Foundation (boilerplate)** | Project, tooling, tokens, fonts, store + RTK Query base, i18n, MSW, routes, app shell, sign-in, tests, e2e | DSH-GEN-01/02/10, DSH-NAV-01…03, DSH-AUTH-01…06 | Shell + sign-in in AR/EN at 4 widths; checks green | ✅ |
| D5 | **UI kit & states** | Primitives (§4), `/dev/ui` preview route (dev only), Toast system, route ErrorBoundary, Skeletons, EmptyState variants, DataTable + FilterBar + Pagination, TitleBlock, SeatBar, Badge mappings for every status | DESIGN_SYSTEM §6, DSH-GEN-05/07/08 | Every primitive in AR/EN, keyboard-checked; **review point** | ⬜ |
| D6 | **Home** | Overview endpoint + mock (generated bookings/payments with seeded RNG), KPI title block, needs action, revenue SVG chart, latest lists, upcoming sessions, empty start guide | DSH-HOME-*, DUS-03…05 | Numbers match the mock dataset (unit-tested aggregations) | ⬜ |
| D7 | **Students** | Registrations endpoint + mock, table/filters/search/pagination, mobile rows, student page, CSV export | DSH-STU-*, DUS-06…08, DAC-05 | DAC-05 passes | ⬜ |
| D8 | **Payments** | Payments endpoint + summary, details sheet, record refund, move, cancel, export | DSH-PAY-*, DUS-09…11, DAC-04 | DAC-04 passes; independent review of money actions | ⬜ |
| D9 | **Courses, sessions & attendance** | Course cards + Add course dialog, details tabs, publishing checklist (DBR-04), sessions + meetings (Cairo time, weekly helper), roster, print, attendance grid + manual check-in | DSH-CRS-*, DSH-SES-*, DSH-ATT-*, DUS-12…19, DAC-02/03/06 | DAC-02/03/06 pass; **review point** | ⬜ |
| D10 | **Assistants & profile** | Assistant cards + dialog + (de)activate; profile tabs, photo upload/crop, certifications & journey lists, account language/password | DSH-ASS-*, DSH-PRO-*, DUS-20…24, DAC-07/08 | DAC-07, DAC-08 (mock) pass | ⬜ |
| D11 | **Messages & polish** | Inbox + sheet, nav badges, unsaved-changes guards everywhere, quick search (Could) | DSH-MSG-*, DSH-NAV-04, DSH-GEN-06/12 | DUS-25 passes | ⬜ |
| D12 | **QA & hardening** | Full Playwright suite (DAC-01…10, both locales), axe checks, bundle budget, security headers config for the host, print checks | DNFR-* | All guardrails green | ⬜ |
| D13 | **Real API switch** | Shared schema package (types + Zod) with the Website; contract tests run against MSW and the real API; `VITE_API_MOCKING=false`; CORS/cookie setup; deploy | SRS §7.2/7.3, DD-020 | All DAC pass against the real backend | ⬜ (needs Website Phase 8 + admin API) |
| D14 | **Final review** | Independent senior review, fixes, final report, client walkthrough | quality.md §5 | DoD complete | ⬜ |

**Review points:** after **D5** (the owner sees the shell and the component kit in the browser) and after **D9** (the owner can publish a course end to end on the mock). Work continues unless he asks for changes.

---

## 4. Step-by-step: how each page is designed and built

Every page phase (D6–D11) follows the same steps — this is the work loop in AGENTS.md §5.2 made concrete:

1. **Brief.** Write the page brief (design.md §2) in PROGRESS.md: the one question, primary action, hierarchy, states, IDs.
2. **Wireframe.** ASCII wireframe for mobile and desktop next to the brief; check it against DESIGN_SYSTEM §7 and the anti-default table (§2). Revise anything that reads like a template.
3. **Contract.** Add the endpoints exactly as SRS §7.2: types in `app/domain/`, RTK Query endpoints in `features/<x>/api.ts` (tags!), MSW handlers + seeded data in `app/mocks/`, pure rules in `app/domain/` with unit tests.
4. **Skeleton first.** Build the loading state at the real layout size; then empty and error states; then the populated view.
5. **Interactions.** Filters/tabs in the URL, dialogs/sheets, forms (RHF + Zod), server error mapping, toasts, confirmation dialogs.
6. **Responsive.** Stacked rows/sheets below 768 px; check 360/768/1280/1440 in AR and EN with screenshots — look at them.
7. **Accessibility.** Keyboard pass, focus order, labels, `aria-sort`, announcements, contrast.
8. **Tests.** Component tests for the page's states and main interaction (Testing Library + MSW); a Playwright spec for its DAC.
9. **Review & trace.** Self-review (quality.md §2), traceability rows, decisions, phase report, local commit.

### D5 component build order

1. Tokens check + `/dev/ui` preview route (dev only)
2. Button, IconButton (+Tooltip), Badge (status map for every enum), Spinner, Skeleton
3. Field, Input, Textarea, Select, Checkbox, Switch, RadioGroup, BilingualField
4. Dialog, Sheet, AlertDialog, DropdownMenu, Popover, Tabs (URL-bound)
5. Toast system (provider + `useToast`), route `ErrorBoundary` component, EmptyState variants
6. TitleBlock, StatCell, SeatBar
7. DataTable (sortable headers, row link, loading rows, empty, stacked mobile rows), FilterBar (search, selects, date range presets, chips), Pagination
8. PageHeader actions + back link (done), print utilities

---

## 5. Data & mock plan

- **Seed:** Website placeholder data (instructor, 7 courses, 2 locations, sessions Oct–Dec 2026) + generated students, bookings, payments and check-ins (seeded RNG, ~300 registrations across past and upcoming sessions, a few `REFUND_REQUIRED`, failed and refunded payments, contact messages).
- **Time:** the mock uses the real clock; a `VITE_MOCK_NOW` override can pin "now" for screenshots and tests (added in D6).
- **Rules:** seat math and statuses reuse `app/domain/availability.ts` (Website BR-08/12/13); dashboard rules (DBR-*) go in `app/domain/` with tests, so the backend can port them.

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| Backend admin API arrives late | Contract-first + MSW; D13 is the only phase that depends on it |
| Mock ≠ backend | Shared types/Zod package and contract tests in D13 |
| Copied domain code drifts from the Website | "Shared with the Website" comments; extract a package in D13 (DD-020) |
| Phone usability of dense data | Stacked rows and sheets designed in D5, verified at 360 px every phase |
