# Progress Tracker — Dashboard

**Current phase:** D11 — Messages & polish (next). D10 finished: assistants and the instructor profile are managed from the Dashboard.
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
| D8 | Payments | ✅ | Summary, filters, details sheet, refund / move / cancel (independent review still pending) |
| D9 | Courses, sessions & attendance | ✅ | Cards, Add course dialog, 6 tabs, sessions + meetings, roster, attendance, print. DAC-02/03/06 pass |
| D10 | Assistants & profile | ✅ | Assistant cards + dialog + (de)activate/delete; profile in 7 tabs; uploads; password. DAC-07, DAC-08 (mock) pass |
| D11 | Messages & polish | ⬜ | |
| D12 | QA & hardening | ⬜ | |
| D13 | Real API switch | ⬜ | Depends on Website Phase 8 + admin API |
| D14 | Final review | ⬜ | |

Legend: ⬜ not started · 🔄 in progress · ✅ done · ⚠️ done with notes · ⛔ blocked

## Handoff — where to continue (2026-11-11)

**State:** package manager is **pnpm** (DD-032). `pnpm typecheck`, `pnpm lint`, Prettier, **56 unit/component tests** and **18 Playwright tests** (desktop + mobile) all pass. Production build contains no mock code. D10 pages checked at 360/768/1280/1440 in Arabic and English: no horizontal scroll, no console errors.

**Done (code map, D10)**
- **Assistants** — `routes/assistants.tsx` (Active/Inactive/All, search, cards grid, confirm dialogs), `features/assistants/assistant-card.tsx`, `assistant-dialog.tsx` (+ test).
- **Profile** — `routes/profile.tsx` (`UrlTabs`), `features/profile/tabs/{personal,contact,bio,stats,certifications,journey,account}-tab.tsx`, `use-profile-save.ts`.
- **Uploads** — `features/uploads/{api,use-image-upload}.ts`, `components/ui/image-picker.tsx`.
- **Rules** — `domain/phone.ts`, `domain/uploads.ts`, `domain/profile-rules.ts` (tests in `tests/unit/people.test.ts`).
- **Shared fixes** — tab-aware unsaved guard (`components/unsaved-changes.tsx`), section saves write the response to the cache (`features/courses/api.ts`, `features/profile/api.ts`), `lib/website-url.ts` (moved from courses).

**D11 — Messages & polish, in order**
1. `routes/messages.tsx` — replace the placeholder: inbox list (New / Read / Archived), reading sheet `?message=<id>`, reply via email/WhatsApp links, mark read (optimistic, DSH-MSG-02). APIs ready in `features/messages/api.ts`; nav badge from `/admin/counts` must drop when a message is read.
2. Polish from the backlog: Payments filter bar wrapping at 1280 px; course card "next session" truncating in Arabic.
3. Quick search (Could), then the e2e for DUS-25, screenshots, phase report, commit.

**Then:** D12 QA (start with `ISSUES.md`) → D13 real API → D14 review (`docs/PHASES.md`).

**Notes for whoever continues**
- Follow the existing patterns: tab components in `features/<x>/tabs/`, one `SectionForm` per tab, `useDraft` for editable copies, `getApiError` to map server field errors.
- A mutation that answers with the whole record should also `upsertQueryData` it (DD-038), or the tab guard fires right after a save.
- Text typed by people goes in `<bdi>`; Arabic copy with spaced numbers needs Unicode isolates (DD-041).
- Keep the Cairo-time rule in mind: date/time inputs are wall-clock and go through `zonedLocalToUtcIso` (DD-029).
- Independent review of the money actions (refund/move/cancel) is still outstanding — CLAUDE.md asks for one in D8.
- Contract items the Website backend must implement: `/admin/counts` (DD-026), certification `imageUrl` (DD-035), password errors (DD-036).

## Page briefs

**Sign in.** Question: "Can I get in safely?" Primary user: the owner, on a phone or laptop. Primary action: *Sign in*. Hierarchy: brand block + language switch → title + one-line purpose → email, password (show/hide) → error → button → forgot-password note. States: field errors on blur, wrong credentials (one generic message), locked (429), network error, session-ended and signed-out notices. Covers DSH-AUTH-01…03, 05–07; DAC-01.

**App shell.** Question: "Where am I and where can I go?" Rail ≥ 1024 px (brand title block, 7 routes, language, user menu); mobile top bar (menu, product, language) + drawer. Active route: wash + start bar + semibold. Covers DSH-NAV-01…03, 05; DSH-GEN-02, 10.

**Assistants.** Question: "Who scans tickets at the door, and can they?" Primary user: the owner, often on a phone. Primary action: *Add assistant*. Secondary: edit, deactivate/activate, delete (only without check-ins). Hierarchy: header → Active/Inactive/All + search → cards (avatar, name, status, phone + WhatsApp, email, notes; facts: check-ins, Scanner app "coming soon"). Data: `GET/POST/PATCH/DELETE /admin/assistants`, `POST /admin/uploads`. URL: `?status=`, `?new=1` (search never in the URL). Responsive: 1/2/3 columns. States: skeleton, first-use empty explaining the Scanner app, no results + clear search, error + retry, long names wrap. Covers DSH-ASS-01…04, DUS-20/21, DAC-07.

**Profile.** Question: "What do students see about me, and is it right?" Primary user: the owner. Primary action: *Save changes* per tab (no header primary; *View on website* is secondary). Hierarchy: header → tabs Personal · Contact · Bio · Stats · Certifications · Journey · Account → one section form per tab with a sticky save bar. Data: `GET/PATCH /admin/instructor`, `PUT …/certifications`, `PUT …/journey`, `POST /admin/uploads`, `PATCH /admin/auth/me`, `POST /admin/auth/password`. URL: `?tab=`. Responsive: AR/EN side by side ≥ 768 px, stacked below. States: skeleton, error + retry (Account still works), missing-language errors per field, unsaved guard on tab change and navigation, truthful-claims notice on Stats. Covers DSH-PRO-01…09, DSH-AUTH-08, DUS-22…24, DAC-08 (mock).

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
