# Progress Tracker — Dashboard

**Current phase:** D10 — Assistants & profile (next). D9 finished; **review point** — the owner can now publish a course end to end.
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
| D9 | Courses, sessions & attendance | ✅ | Cards, Add course dialog, 6 tabs, sessions + meetings, roster, attendance, print. DAC-02/03/06 pass |
| D10 | Assistants & profile | ⬜ | |
| D11 | Messages & polish | ⬜ | |
| D12 | QA & hardening | ⬜ | |
| D13 | Real API switch | ⬜ | Depends on Website Phase 8 + admin API |
| D14 | Final review | ⬜ | |

Legend: ⬜ not started · 🔄 in progress · ✅ done · ⚠️ done with notes · ⛔ blocked

## Handoff — where to continue (2026-10-03)

**State:** typecheck, lint, Prettier, 30 unit/component tests and 12 Playwright tests (desktop + mobile) all pass. Production build contains no mock code. Every page verified at 360 px in Arabic and English with no horizontal page scroll.

**Done (code map)**
- **D5 UI kit** — `app/components/ui/`: dialog, sheet, confirm-dialog, menu, tabs (`UrlTabs`), select, switch, textarea, toast, skeleton, title-block, seat-bar, data-table, filter-bar, pagination, error-state, icon-button, bilingual-field, panel, amount-input. Shared: `components/format.tsx`, `components/status.tsx`, `section-form.tsx`, `ordered-list-editor.tsx`, `unsaved-changes.tsx`, `use-discard-guard.tsx`, `export-button.tsx`, `copy-button.tsx`.
- **Data** — `app/domain/api.ts` (all payload types) + pure rules with tests: `attendance.ts`, `months.ts`, `course-rules.ts`, `session-rules.ts`, `status-tone.ts`, `money.ts`.
- **Mock API** — `app/mocks/`: seeded database, payload builders (`views.ts`), handlers for every SRS §7.2 endpoint.
- **Pages** — Home, Students, Student, Payments (with refund / move / cancel), Courses, Course (6 tabs), Session (roster, attendance, print).

**D10 — Assistants & profile, in order**
1. `routes/assistants.tsx` — replace the placeholder: cards in a 1/2/3-column grid (avatar, name, phone + WhatsApp link, active badge, "Scanner app — coming soon", notes), filter Active/Inactive/All + search, row menu: edit, activate/deactivate, delete (only with no check-ins). APIs ready in `features/assistants/api.ts`.
2. `features/assistants/assistant-dialog.tsx` — add/edit (full name, Egyptian phone → E.164, optional email, photo via `useUploadImageMutation`, notes). Map the API's `phoneE164: "TAKEN"` to a field error (DAC-07).
3. `routes/profile.tsx` — `UrlTabs`: personal · contact · bio · stats · certifications · journey · account. Reuse `SectionForm` + `useDraft` (see `features/courses/tabs/overview-tab.tsx`) and `OrderedListEditor` for certifications and journey. APIs ready in `features/profile/api.ts`.
4. Messages (EN + AR), screenshots at 360/1280 in both languages, an e2e for DAC-07, phase report, commit.

**Then:** D11 messages (`features/messages/api.ts` ready) → D12 QA → D13 real API → D14 review (`docs/PHASES.md`).

**Notes for whoever continues**
- Follow the existing patterns: tab components in `features/<x>/tabs/`, one `SectionForm` per tab, `useDraft` for editable copies, `getApiError` to map server field errors.
- Keep the Cairo-time rule in mind: date/time inputs are wall-clock and go through `zonedLocalToUtcIso`; weekly repeats step the local date (DD-029).
- A wide table goes in a `.scroll-x` container (DD-030), and timestamps in narrow cells use `<DateTime wrap />`.
- Independent review of the money actions (refund/move/cancel) is still outstanding — CLAUDE.md asks for one in D8.
- `/admin/counts` is an addition to the API contract (DD-026) the Website backend must implement.

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

### Phase D9 — Courses, sessions & attendance: ✅ complete

**Delivered:** DSH-CRS-01…09 (cards, state tabs, search, Add course dialog, 6 independently saved tabs, publishing checklist, archive/restore/delete), DSH-SES-01…08 (sessions list, add/edit with meetings in Cairo time, weekly repeat, close/reopen, publish/unpublish, delete guard, roster, CSV, A4 print), DSH-ATT-01…03 (attendance grid, manual check-in from 60 min before a meeting, undo with confirmation). DUS-12…19.

**Verified:** typecheck ✅ · lint ✅ · Prettier ✅ · 30 unit/component tests ✅ · 12 Playwright tests ✅ (desktop + mobile), including **DAC-02** (publish only when complete, then bookable), **DAC-03** (capacity can't drop below sold) and **DAC-06** (mark and undo attendance). Build ✅ with no mock code. Screenshots at 360/1280 in AR and EN.

**Fixed during review:**
- Editing a session silently reset a custom registration-close time to the 24 h default.
- In Arabic, the EGP suffix sat opposite the input's padding so the number overlapped it — fixed centrally in a new `AmountInput` (DD-031).
- A wide roster table grew the document's scroll width, so the whole page scrolled sideways on phones even though the table had its own scroller — fixed with a `.scroll-x` utility using `contain: paint` (DD-030).
- Long timestamps overflowed narrow cells on the student page — added `<DateTime wrap />`.
- Meeting time inputs clipped the AM/PM in English.
- Remaining lint warning from D8 (`form.watch`) removed by switching to `useWatch` and state.

**Decisions:** DD-029…DD-031.

**Known issues / backlog:** Payments filter bar wraps to a second line at 1280 px; course card "next session" date truncates in Arabic; independent review of the money actions still to run.

**Next:** D10 — Assistants & profile (tasks above).

**🎓 Claude ecosystem lesson — Subagents for an independent review**
- **Concept:** `Agent` runs a task in a *separate context*. It reads only what you give it, so it can't be biased by the reasoning that produced the code — and its context doesn't fill up yours.
- **How we used it here:** not yet — D8's money actions (refund, move, cancel) still need one. The intended prompt: "Read `docs/SRS.md` §4.5 and DBR-11/12, then review `app/features/payments/*` and `app/mocks/handlers/payments.ts`. List every way a refund or move could produce a wrong seat count or leave a valid ticket on a refunded booking." A fresh agent checks the code against the spec rather than against what the author meant.
- **Why it matters:** the author's context is the worst place to catch an assumption the author made. For money and seats, that bias is expensive.
- **Try it yourself:** in Claude Code, run `/agents` to see the built-in agents, then ask for "an Explore agent to find every place the dashboard changes a booking's status" — note that its findings come back without the file dumps.
- **Docs:** https://code.claude.com/docs/en/sub-agents
