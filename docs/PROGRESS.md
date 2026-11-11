# Progress Tracker — Dashboard

**Current phase:** D13 — Real API switch (next; blocked until the Website backend ships the admin API). D12 finished: independent review of the money actions, full acceptance suite in both languages, axe, bundle budget, security headers, print.
**Last updated:** 2026-11-11

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
| D8 | Payments | ✅ | Summary, filters, details sheet, refund / move / cancel (independent review done in D12) |
| D9 | Courses, sessions & attendance | ✅ | Cards, Add course dialog, 6 tabs, sessions + meetings, roster, attendance, print. DAC-02/03/06 pass |
| D10 | Assistants & profile | ✅ | Assistant cards + dialog + (de)activate/delete; profile in 7 tabs; uploads; password. DAC-07, DAC-08 (mock) pass |
| D11 | Messages & polish | ✅ | Inbox + reading sheet, optimistic read/new/archive with live badges, quick search (`/`), Payments/Students export in the header, card date, table scroll at 768 px. DUS-25 passes |
| D12 | QA & hardening | ✅ | Money-action review (7 findings fixed), DAC-01…10 in EN + AR, axe WCAG 2.2 AA, login 199.6/200 KB, `_headers` + CSP by hash, print |
| D13 | Real API switch | ⬜ | Depends on Website Phase 8 + admin API |
| D14 | Final review | ⬜ | |

Legend: ⬜ not started · 🔄 in progress · ✅ done · ⚠️ done with notes · ⛔ blocked

## Handoff — where to continue (2026-11-11, after D12)

**State:** typecheck, lint, Prettier, **86 unit/component tests**, **47 Playwright tests** (desktop + mobile; 5 skipped by design: phone-only or desktop-only checks), `pnpm build` and `pnpm check:build` (login 199.6 KB gzip of 200, no CSP violations) all pass. No mock code in the build.

**D12 added (code map)**
- `domain/money-rules.ts`: which refund / move / cancel a booking allows, and the move-target rule. Used by the payment sheet, the move dialog and the mock.
- `features/payments/use-idempotency-key.ts`: key per action, renewed after a final 4xx. The mock replays per key (`mocks/handlers/helpers.ts` `idempotent`).
- `clientLoader` on Payments and Students (pure `paymentFiltersFromUrl` / `registrationFiltersFromUrl`).
- Lazy English messages (`i18n/config.ts` `loadMessages`, root `useRenderedLocale`); plain sign-in validator (`features/auth/schema.ts` `checkLogin`).
- `scripts/write-headers.mjs` (run by `pnpm build`), `scripts/check-build.mjs` (`pnpm check:build`), `docs/deploy.md`.
- Tests: `a11y.spec.ts` (axe), `language-and-mobile.spec.ts` (DAC-09, DAC-10, phone drawer), `arabic.spec.ts` (DAC-04/05/07 in Arabic), `money-rules.test.ts`, more in `money-dialogs.test.tsx` and `login.test.tsx`.

**Waiting on the product owner:** confirm DD-050 (refund of a cancelled booking) and DD-051 (accept into the booking's own session). Both change how DSH-PAY-05/06 read.

**D13 — Real API switch (blocked on the Website backend)**
1. Shared schema package (types + Zod) with the Website (DD-020); contract tests that run against MSW and the real API.
2. `VITE_API_MOCKING=false`, `VITE_API_BASE_URL` to the backend; CORS with credentials; cookie flags (DNFR-SEC-01/04).
3. Backend must implement SRS §7.2 incl. rev 1.1 (`/admin/counts`), 1.2 (password errors, certification `imageUrl`) and 1.3 (money action rules, error reasons, idempotent replay). CheckIn should reference the assistant id (DD-040).
4. Re-run every DAC against the real API; then D14.

**Notes for whoever continues**
- The login budget has 0.4 KB of margin. Anything new on the sign-in page or in `root`/`store` must be weighed with `pnpm build && pnpm check:build`. Next lever: messages per namespace.
- Money rules live in `domain/money-rules.ts` only. Change them there and both the UI and the mock follow.
- Auth checks on RTK Query results use `isSuccess`, never `data`.

## Page briefs

**Sign in.** Question: "Can I get in safely?" Primary user: the owner, on a phone or laptop. Primary action: *Sign in*. Hierarchy: brand block + language switch → title + one-line purpose → email, password (show/hide) → error → button → forgot-password note. States: field errors on blur, wrong credentials (one generic message), locked (429), network error, session-ended and signed-out notices. Covers DSH-AUTH-01…03, 05–07; DAC-01.

**App shell.** Question: "Where am I and where can I go?" Rail ≥ 1024 px (brand title block, 7 routes, language, user menu); mobile top bar (menu, product, language) + drawer. Active route: wash + start bar + semibold. Covers DSH-NAV-01…03, 05; DSH-GEN-02, 10.

**Assistants.** Question: "Who scans tickets at the door, and can they?" Primary user: the owner, often on a phone. Primary action: *Add assistant*. Secondary: edit, deactivate/activate, delete (only without check-ins). Hierarchy: header → Active/Inactive/All + search → cards (avatar, name, status, phone + WhatsApp, email, notes; facts: check-ins, Scanner app "coming soon"). Data: `GET/POST/PATCH/DELETE /admin/assistants`, `POST /admin/uploads`. URL: `?status=`, `?new=1` (search never in the URL). Responsive: 1/2/3 columns. States: skeleton, first-use empty explaining the Scanner app, no results + clear search, error + retry, long names wrap. Covers DSH-ASS-01…04, DUS-20/21, DAC-07.

**Profile.** Question: "What do students see about me, and is it right?" Primary user: the owner. Primary action: *Save changes* per tab (no header primary; *View on website* is secondary). Hierarchy: header → tabs Personal · Contact · Bio · Stats · Certifications · Journey · Account → one section form per tab with a sticky save bar. Data: `GET/PATCH /admin/instructor`, `PUT …/certifications`, `PUT …/journey`, `POST /admin/uploads`, `PATCH /admin/auth/me`, `POST /admin/auth/password`. URL: `?tab=`. Responsive: AR/EN side by side ≥ 768 px, stacked below. States: skeleton, error + retry (Account still works), missing-language errors per field, unsaved guard on tab change and navigation, truthful-claims notice on Stats. Covers DSH-PRO-01…09, DSH-AUTH-08, DUS-22…24, DAC-08 (mock).

**Messages.** Question: "Who wrote, and have I answered?" Primary user: the owner, on a phone between sessions. Primary action: open a new message and *Reply by email*. Secondary: reply on WhatsApp (when a phone was given), mark as new, archive / move to inbox. Hierarchy: header → Inbox (new count) · Archived → rows (new dot + bold sender, topic · course, first line, received time) → reading sheet (status and course, full message in its own direction, sender email/phone with copy, received, reply actions in the footer). Data: `GET /admin/messages`, `PATCH /admin/messages/:id`, `GET /admin/counts`. URL: `?tab=archived`, `?message=<id>`. Responsive: one column; the sheet is full screen below 640 px. States: skeleton rows, empty inbox / empty archive, error + retry, unknown id → "doesn't exist anymore". Covers DSH-MSG-01…03, DSH-NAV-04, DUS-25.

**Quick search.** Question: "Where is this person's booking?" Trigger: *Find a booking* in the rail (with `/` hint) or the search icon in the phone top bar; `/` anywhere outside a text field. Dialog with a combobox: 3+ characters, up to 8 bookings (name, reference, phone, course · session, status), ↑/↓ and Enter, click. Term never in the URL and cleared on close. States: hint, searching spinner, no match, error, "showing 8 of N". Covers DSH-GEN-12.

## Traceability

| Requirement | Route | Component(s) | Endpoint(s) | States verified | Tests | Status |
|---|---|---|---|---|---|---|
| DSH-GEN-01 | root | `HydrateFallback` | — | pre-rendered `index.html` (lang=ar, dir=rtl, branded loading) | build | ✅ |
| DSH-GEN-02 | all | `LanguageSwitch`, `LocaleBootstrap`, `AppProviders` | `PATCH /admin/auth/me` | AR⇄EN, RTL⇄LTR, remembered, user preference wins | e2e `switches to English` | ✅ |
| DSH-GEN-10 | signed-in | `MockBanner` | — | dev only | visual | ✅ |
| DSH-NAV-01/02/03 | signed-in | `AppShell`, `NavList`, `MobileNav`, `UserMenu` | — | 360/768/1280/1440, AR/EN, drawer, menu | visual | ✅ |
| DSH-NAV-05 | all pages | `PageHeader` | — | one h1, one primary | visual | ✅ |
| DSH-AUTH-01/02/03 | `/login` | `Login`, `Field`, `Input`, `Button` | `POST /admin/auth/login` | empty, invalid, wrong credentials, locked, loading | `login.test.tsx`, e2e | ✅ (mock) |
| DSH-AUTH-04 | layout | `requireUser` middleware | `GET /admin/auth/me` | redirect with `next` on 401 only; outage → error screen with retry (DD-044) | e2e `redirects to sign-in`, `auth-guard.test.ts` | ✅ (mock) |
| DSH-AUTH-05 | layout, `/login` | base query 401 → `sessionEnded`; login loader checks `isSuccess` | any | redirect with `reason=expired`, notice, back to the same page and filters | `session-expiry.test.ts`, e2e `DSH-AUTH-05` | ✅ (mock) |
| DSH-AUTH-06 | user menu | `UserMenu` | `POST /admin/auth/logout` | cache reset, signed-out notice | visual | ✅ (mock) |
| DSH-AUTH-07 | `/login` | note | — | "Contact the administrator" | visual | ✅ |
| DMK-01…05 | — | `app/mocks/*` | auth | dev + tests; no mock code in build | build grep | ✅ (auth only) |
| DSH-ASS-01 | `/assistants` | `AssistantCard` | `GET /admin/assistants` | 360/768/1280/1440 AR/EN, long names, bidi | e2e DAC-07 | ✅ (mock) |
| DSH-ASS-02 | `/assistants?new=1` | `AssistantDialog`, `ImagePicker` | `POST /admin/assistants`, `POST /admin/uploads` | validation, E.164, photo ≤ 2 MB, dirty guard, keyboard | `assistant-dialog.test.tsx`, e2e | ✅ (mock) |
| DSH-ASS-03 | `/assistants` | card menu, `ConfirmDialog` | `PATCH`/`DELETE /admin/assistants/:id` | deactivate keeps history; delete only without check-ins | e2e DAC-07, unit (rename keeps count) | ✅ (mock) |
| DSH-ASS-04 | `/assistants` | filter tabs, `SearchInput` | `?active=`, `?q=` | first-use empty, no results, error | e2e | ✅ (mock) |
| DSH-PRO-01 | `/profile` | `UrlTabs`, `SectionForm` | — | `?tab=`, guard on tab change | e2e DAC-08 | ✅ |
| DSH-PRO-02 | `?tab=personal` | `PersonalTab`, `ImagePicker` (4:5) | `PATCH /admin/instructor`, uploads | both languages required, ≥ 800×1000 | e2e DAC-08 | ✅ (mock) |
| DSH-PRO-03 | `?tab=contact` | `ContactTab` | `PATCH /admin/instructor` | landline/mobile, same-as-phone, link per platform | unit | ✅ (mock) |
| DSH-PRO-04 | `?tab=bio` | `BioTab` | `PATCH /admin/instructor` | paragraphs, character guidance | unit | ✅ (mock) |
| DSH-PRO-05 | `?tab=stats` | `StatsTab` | `PATCH /admin/instructor` | truthful-claims notice (DBR-17) | e2e | ✅ (mock) |
| DSH-PRO-06 | `?tab=certifications` | `CertificationsTab` | `PUT /admin/instructor/certifications` | add/reorder/delete, year, https link, image | unit | ✅ (mock) |
| DSH-PRO-07 | `?tab=journey` | `JourneyTab` | `PUT /admin/instructor/journey` | range/present/single, end ≥ start | e2e, unit | ✅ (mock) |
| DSH-PRO-08 / DSH-AUTH-08 | `?tab=account` | `AccountTab` | `PATCH /admin/auth/me`, `POST /admin/auth/password` | name, language, password errors | — (visual) | ✅ (mock) |
| DSH-PRO-09 | `/profile` | header link | — | opens the Website home in the UI language | visual | ✅ |
| DSH-MSG-01 | `/messages` | `MessageList`, folder tabs | `GET /admin/messages` | Inbox (New + Read) / Archived, newest first, empty, error, AR/EN previews | e2e `messages.spec.ts` | ✅ (mock) |
| DSH-MSG-02 | `?message=<id>` | `MessageSheet` | `PATCH /admin/messages/:id` | marks Read once per opening (optimistic), reply mailto (subject in sender's language) and WhatsApp, mark new, archive/unarchive | e2e, `messages.test.ts` | ✅ (mock) |
| DSH-MSG-03 / DSH-NAV-04 | nav, Inbox tab | `NavList`, tab count | `GET /admin/counts` | count changes at once, server wins after | e2e DUS-25 | ✅ (mock) |
| DSH-GEN-06 | forms | `useDiscardGuard`, `UnsavedChanges` | — | dialogs (course, session, assistant, refund) and tabbed pages | e2e DAC-08, unit | ✅ |
| DSH-GEN-12 | shell | `QuickSearchTrigger`, `QuickSearchDialog` | `GET /admin/registrations?q=` | `/` shortcut, keyboard, phone trigger, term not in URL | e2e `students.spec.ts` | ✅ (mock) |
| DSH-PAY-04…07 | `/payments` | `RefundDialog`, `MoveDialog`, `CancelDialog`, `domain/money-rules.ts` | refund, move, cancel | validation, no seats, seat taken meanwhile, reason required, refund after cancel, accept into own session, key renewal, idempotent replay, stale 409 | `money-dialogs.test.tsx`, `money-rules.test.ts`, e2e DAC-04 (EN + AR) | ✅ (mock; independent review done, DD-050/051 to confirm) |
| DNFR-PERF-01 | `/login` | `checkLogin`, lazy English messages | — | 199.6 KB gzip ≤ 200; no other route chunk | `pnpm check:build` | ✅ |
| DNFR-SEC-05 | all | — | — | search terms never in URLs | e2e DAC-05, quick search | ✅ |
| DNFR-SEC-06/07 | host | `_headers`, `_redirects`, `robots.txt`, meta | — | CSP by hash, HSTS, frame-ancestors, noindex | `pnpm check:build` (no CSP violations) | ✅ (config; host to apply) |
| DNFR-A11Y | all | — | — | WCAG 2.2 A/AA, every page + dialogs, AR + EN, phone | e2e `a11y.spec.ts` | ✅ |
| DAC-09 | all | `LanguageSwitch`, sign-in | `PATCH /admin/auth/me` | LTR at once, page + filters kept, remembered after sign-out/in | e2e, `login.test.tsx` | ✅ (mock) |
| DAC-10 | all | — | — | 360 px every page AR + EN, stacked rows, dialogs fit, actions reachable, drawer | e2e `language-and-mobile.spec.ts` | ✅ |
| DUS-25 | `/messages` | — | — | read, reply links, count drops | e2e | ✅ (mock) |

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

### Phase D10 — Assistants & profile: ✅ complete

**Delivered:** DSH-ASS-01…04, DSH-PRO-01…09, DSH-AUTH-08; DUS-20…24; DAC-07 and DAC-08 (mock part). Assistant cards with Active/Inactive/All and search, add/edit dialog (Egyptian phone → E.164, optional email and photo, notes), deactivate/activate, delete only without check-ins. Profile in 7 independently saved tabs: personal + 4:5 photo, contact + social links, bio, stats with the truthful-claims notice, certifications and journey (reorderable lists), account (name, language, password).

**Verified:** typecheck ✅ · lint ✅ · Prettier ✅ · 56 unit/component tests ✅ (+26: phone, uploads, profile rules, paragraphs, assistant dialog incl. DAC-07) · 18 Playwright tests ✅ (+6: DAC-07, DAC-08 mock, journey years — desktop + mobile) · build ✅ with no mock code. 72 screenshots (9 views × 4 widths × 2 languages): no horizontal scroll, no console errors; `?mockError=500`, keyboard (focus in/out, Escape, dirty guard) and long Arabic names checked.

**Fixed during review:**
- **Tab switch lost unsaved edits** on the course page and profile — the guard only watched the path. It now also watches `?tab=`; saves write their response into the cache so the guard doesn't fire right after saving (DD-038). The course DAC-02 e2e caught that race.
- **Check-in count reset on rename** (mock counted by name) → by assistant id (DD-040).
- **Bidi:** phone examples reversed in Arabic ("5678 1234 010"), English notes with the period on the wrong side, an Arabic name drifting away from its badge in English (DD-041).
- Account name button misaligned with its input.

**API contract (flag for the Website backend):** certification `imageUrl` (DD-035); `POST /admin/auth/password` error semantics (DD-036). SRS rev 1.2.

**Decisions:** DD-033…DD-043.

**Known issues / backlog:** no interactive photo cropper (DD-034); Payments filter bar wrap at 1280 px and course card date truncation in Arabic (from D9); independent review of the money actions still to run; `routes/payments.tsx` has no `clientLoader` prefetch (ISSUES #6).

**Next:** D11 — Messages & polish (tasks above).

**🎓 Claude ecosystem lesson — MCP servers**
- **Concept:** MCP (Model Context Protocol) servers give Claude Code new tools — a browser, a database, an issue tracker. Add one with `claude mcp add <name> -- <command>` (stdio) or `claude mcp add --transport http <name> <url>`; check it with `/mcp`.
- **Scopes:** `local` (default, you, this project, in `~/.claude.json`), `project` (shared with the team through a committed `.mcp.json` at the repo root), `user` (all your projects).
- **Trust:** Claude Code asks for approval before using a project's `.mcp.json` servers in an interactive session; `claude mcp reset-project-choices` resets those choices. Only connect servers you trust — a server that reads web pages can carry prompt injection.
- **How we used it here:** this phase drove Chromium through Playwright scripts (72 screenshots, keyboard and error-state checks). A Playwright MCP server would let Claude do the same interactively — click, read the page, screenshot — without writing a script.
- **Try it yourself:** `claude mcp add --scope project playwright -- npx @playwright/mcp@latest`, restart, run `/mcp`, then ask "open http://localhost:5173/assistants and tell me what's on the page".
- **Docs:** https://code.claude.com/docs/en/mcp

### Phase D11 — Messages & polish: ✅ complete

**Delivered:** DSH-MSG-01…03, DSH-NAV-04 (messages badge live), DSH-GEN-06 (confirmed across forms), DSH-GEN-12 (quick search, Could); DUS-25. Before D11, a test pass covered Payments (DAC-04), Students (DAC-05) and session expiry (DSH-AUTH-05), and fixed ISSUES #1.

**Verified:** typecheck ✅ · lint ✅ · Prettier ✅ · 74 unit/component tests ✅ (+18 since D10) · 34 Playwright tests ✅ (+16, desktop + mobile) · build ✅ with no mock code. Screenshots of messages, a message in each language, archive, quick search, payments, students and courses at 360/768/1280/1440 in AR and EN: no horizontal scroll, no console errors; phone numbers and mixed-direction previews checked zoomed in.

**Fixed during the phase:**
- **Session expiry bounced back** from the sign-in page to a page of errors (stale `data` after a failed refetch); **outage looked like a sign-out** (ISSUES #1); **sign-in from the English page showed Arabic** until reload (DAC-09); the guard only worked after sign-in through a hidden extra redirect. All DD-044.
- **"Mark as new" didn't stick:** the optimistic update re-triggered the auto mark-read. Now once per opening.
- **Tables overflowed the page at 768–1023 px:** `md:scroll-x` didn't exist because `.scroll-x` was a plain class; now `@utility` (DD-048).
- **Payments filter bar wrapped at 1280 px** → Export moved to the page header on Payments and Students (DD-046). **Course card date cut off in Arabic** → day and month only, full date as title (DD-047).
- English previews in the Arabic inbox clipped at the wrong end → `dir="auto"` + `match-parent`. Phone top bar squeezed the product name → hidden below 400 px (kept for screen readers). Inbox tab announced its count twice.
- The seed had no target session for "move", so three move tests passed without checking anything; they now create one.

**API contract:** no changes. Quick search reuses `GET /admin/registrations?q=`.

**Decisions:** DD-044…DD-049.

**Known issues / backlog (→ D12):** independent review of the money actions (ISSUES #2); partial refund rule and mock idempotency (#3, #4); `clientLoader` on Payments and Students (#6); Cairo dates in tests/mocks (#8, #9); e2e in Arabic and axe checks; no interactive photo cropper (DD-034).

**Next:** D12 — QA & hardening.

**🎓 Claude ecosystem lesson — Hooks**
- **Concept:** hooks run your own command at fixed points in Claude Code's loop. `PostToolUse` fires after a tool call succeeds; a matcher like `"Edit|Write"` limits it to file edits. The event's JSON (with `tool_input.file_path`) arrives on stdin.
- **How we used it here:** we didn't. I ran `pnpm exec prettier --write` by hand after almost every edit this phase. That's exactly the job of a hook.
- **Why it matters:** a hook is enforced by the harness, every time, instead of relying on the agent to remember. Put it in `.claude/settings.json` (committed, shared) or `.claude/settings.local.json` (just you).
- **Try it yourself:** add to `.claude/settings.json`:
  `{"hooks":{"PostToolUse":[{"matcher":"Edit|Write","hooks":[{"type":"command","command":"jq -r '.tool_input.file_path' | xargs pnpm exec prettier --write --ignore-unknown"}]}]}}`
  then run `/hooks` to see it (read-only browser), and edit a file. Needs `jq`. Exit code 2 would show stderr to Claude as feedback.
- **Docs:** https://code.claude.com/docs/en/hooks

### Phase D12 — QA & hardening: ✅ complete (two assumptions to confirm)

**Delivered:** independent review of the money actions (CLAUDE.md, ISSUES #2) and fixes for all 7 findings; DAC-01…10 automated in English, plus Arabic runs of DAC-01/04/05/07/09/10; axe WCAG 2.2 A/AA on every page and main dialog (AR + EN, desktop + phone); bundle budget DNFR-PERF-01 met and checked; security headers DNFR-SEC-06/07 generated per build and checked; printed roster checked on A4 in both languages; ISSUES #3, #4, #6, #8, #9 closed.

**Verified:** typecheck ✅ · lint ✅ · Prettier ✅ · 86 unit/component tests ✅ · 47 Playwright tests ✅ (5 skipped by design) · build ✅ (no mock code) · `check:build` ✅ (199.6 KB, no CSP violations) · axe ✅ · roster PDFs (AR, EN) inspected.

**Fixed during the phase:**
- Review findings 1–7 (DD-050…052), see `ISSUES.md`.
- **Sign-out said "Your session has ended"**: the cache reset made the page refetch into a 401 (DD-056).
- **The default sign-in page overwrote the account's language** (DAC-09, DD-056).
- **Account menu label** didn't contain its visible text (WCAG 2.5.3).
- **Printed roster:** references wrapped onto three lines.
- **Generated CSP would have blocked the API:** the header script didn't read `.env` (DD-054).
- **Sign-in page was 243.7 KB** → 199.6 KB (DD-053).

**API contract (flag for the Website backend):** SRS rev 1.3 covers refund on a cancelled booking, move into the own session, the move-target rule, 409/422 reasons in `fields`, and idempotent replay.

**Decisions:** DD-050…DD-056.

**Known issues / deferred:** DD-050/051 need the owner's confirmation; budget margin 0.4 KB; move price difference shown, not recorded; no interactive photo cropper (DD-034).

**Next:** D13 — Real API switch, once the Website backend ships the admin API.

**🎓 Claude ecosystem lesson — Headless mode & CI**
- **Concept:** `claude -p "<prompt>"` runs Claude Code once, non-interactively, and exits with a status code your scripts can branch on. `--output-format json` returns the result plus session ID and cost; `--allowedTools` pre-approves tools; `--bare` skips local hooks, skills, MCP servers and CLAUDE.md so CI gets the same result on every machine.
- **How we used it here:** not yet. But this phase made the checks a CI job needs: `pnpm check`, `pnpm test:e2e`, `pnpm build && pnpm check:build`. A headless review can add judgment on top of them.
- **Why it matters:** the independent review this phase ran as a subagent. In CI, the same review can run on every pull request, without anyone remembering to ask.
- **Try it yourself:** `git diff main | claude -p "Review this diff against docs/agent/quality.md and the money rules in app/domain/money-rules.ts. List problems as file:line." --output-format json | jq -r '.result'`. For GitHub, see the Actions guide below.
- **Docs:** https://code.claude.com/docs/en/headless · https://code.claude.com/docs/en/github-actions
