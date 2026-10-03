# Product Requirements Document (PRD)

## Engineer Course Platform — Dashboard V1

| Item | Value |
| --- | --- |
| Product | Dashboard (admin app) — part of a 3-app system: Website · Dashboard · Scanner app (`../SYSTEM.md`) |
| Version | 1.0 — Draft for review |
| Date | 2026-10-03 |
| Owner | Mahmoud Samy (product & engineering) |
| Client | Civil engineer & course instructor (placeholder "Eng. Karim Mostafa") |
| Companion | `docs/SRS.md` (exact behavior — wins on behavior) · `docs/MARKET_RESEARCH.md` · `../Website/docs/PRD.md` |

### How to read this document

The PRD says **why** and **what matters most**; the SRS says **exactly how it behaves**. If they disagree on behavior, the SRS wins; on scope and priority, this PRD wins.

---

## 1. Summary

The Website sells seats and issues QR tickets. Without a dashboard, the engineer can't publish a new course, see who paid, fix a refund case or update his own profile without a developer. The Dashboard gives him (and an operator) one private place to **run the business: publish, sell, check, fix** — on a phone or a laptop, in Arabic first.

## 2. Problem statement

### 2.1 Owner problems

- He can't add a course or a new session himself, so every cohort waits for a developer.
- He doesn't know how many seats are sold until someone counts.
- A student messages "I paid but have no ticket", and there is nowhere to look it up.
- Late payments on full sessions (Website BR-09) need a decision, and nothing tells him.
- His bio, photo, certifications and contact numbers change, and the website goes stale.
- Contact-form messages live only in email.

### 2.2 Operations problems

- On the first day of a session, the person at the door needs a reliable list before the Scanner app exists.
- Attendance has to be known after the course (for certificates handled manually, follow-ups, his own records).
- Assistants come and go; whoever scans tickets must be known and removable.

## 3. Goals & non-goals

### 3.1 Goals (Dashboard V1)

| # | Goal |
| --- | --- |
| G1 | The owner can take a course from idea to **bookable on the website** without a developer (course → session → publish) |
| G2 | Answer "how is the business doing?" in **under 10 seconds** from opening the app (Home) |
| G3 | Find any registration or payment by name, phone, email or reference in **under 15 seconds** |
| G4 | No exception goes unnoticed: every `REFUND_REQUIRED` booking and new message is visible until handled |
| G5 | The public profile stays current, edited by the owner himself |
| G6 | Ready for the Scanner app: assistants managed, attendance model and API in place |

### 3.2 Non-goals (V1)

Analytics suite or custom reports · moving money (refunds via API) · marketing tools (coupons, campaigns, email blasts) · LMS features · multi-instructor administration · student accounts · dark mode.

## 4. Success metrics

### 4.1 North-star

**Sessions published by the owner himself** (no developer involved) per month.

### 4.2 KPIs

| Metric | Target (first 3 months) |
| --- | --- |
| Time from "new cohort decided" to bookable on the website | < 15 minutes of owner time |
| Support lookups resolved from the dashboard (no developer) | ≥ 90 % |
| `REFUND_REQUIRED` cases handled within 48 h | 100 % |
| New contact messages read within 24 h | ≥ 90 % |
| Owner weekly active use | ≥ 3 days/week |

### 4.3 Guardrails (must never fail)

- No action in the dashboard can overbook a session (capacity ≥ sold).
- No personal data visible to anyone without an Owner/Admin session.
- No ticket stays valid after a recorded refund or cancellation.
- No published course is missing bilingual essentials.

## 5. Personas

### 5.1 "Eng. Karim" — the owner (primary)

Practicing structural engineer and instructor, 38. Busy on site and in the office; checks his phone between meetings; uses a laptop in the evening to plan cohorts. Arabic first, comfortable with English technical terms. **Needs:** numbers at a glance, publishing without friction, confidence that the data is right. **Frustration:** tools that look like accounting software or need training.

### 5.2 "Mahmoud" — the operator/admin

The developer who set up the platform and helps the owner. Laptop. **Needs:** fix data quickly, handle refunds and edge cases, export lists.

### 5.3 "Hany" — the center assistant (indirect)

Staff at the entrance. Doesn't use the dashboard; uses the Scanner app later. Today: a printed roster. **Needs** (from the dashboard): to exist as a managed profile, and a reliable list.

## 6. Jobs to be done

| When… | I want to… | So that… |
| --- | --- | --- |
| I decide to run a new cohort | create the session (dates, place, seats, price) and publish it | students can book it today |
| I open the app in the morning | see revenue, seats sold and anything that needs me | I know whether to act |
| A student says they paid | find them by phone or reference | I can reassure them or fix it |
| A late payment hits a full session | move the student or record the refund | the student is treated fairly |
| A session starts tomorrow | see and print who's coming | the door runs smoothly |
| A course has ended | see who attended which meeting | I can follow up and keep records |
| My bio or numbers change | edit them myself | the website stays true |

## 7. Key journeys

1. **Publish a cohort:** Courses → Add course (dialog) → course page: content, curriculum → Sessions → Add session → Publishing → Publish → "View on website".
2. **Morning check:** Home → KPI strip → Needs action → (tap) Payments filtered → record refund.
3. **Support lookup:** Students → search phone → student page → ticket status / WhatsApp the student.
4. **Session day:** Home → Upcoming sessions → session page → Print roster / mark attendance.
5. **Profile update:** Profile → Bio tab → edit AR/EN → Save → View on website.

## 8. Scope & prioritization

### 8.1 Features

| Feature | Priority | Notes |
| --- | --- | --- |
| Sign-in, roles (Owner, Admin), session expiry | Must | Assistants have no dashboard access |
| App shell (nav rail / mobile drawer), AR/EN + RTL | Must |  |
| Home: KPIs, needs action, latest payments/registrations, upcoming sessions | Must | Revenue chart: Should |
| Students table + filters + student details | Must | Export: Should |
| Payments table + summary + details drawer | Must |  |
| Record refund / resolve refund-required | Must | Move student: Should · Cancel booking: Should |
| Courses cards + Add course dialog | Must |  |
| Course details tabs (overview, content, curriculum, FAQ, publishing) | Must |  |
| Sessions & meetings (add/edit/close/unpublish) | Must | Gap G1 from research |
| Session roster | Must | Print roster: Should |
| Attendance view | Must | Manual check-in: Should |
| Assistants cards + Add dialog + activate/deactivate | Must | Scanner invite: Later |
| Profile: personal, contact, bio, account language | Must | Stats, certifications, journey, password: Should |
| Messages inbox | Should | Gap G7 |
| CSV exports | Should | Gap G8 |
| Audit log (backend) | Should | Activity page: Later |
| Global quick search | Could |  |
| Settings, locations | Could |  |

### 8.2 Rationale

Must = the owner can publish, sell, check and fix. Should = saves real time weekly but has a workaround (Paymob portal, email, spreadsheet). Could/Later = growth features that don't block running the business.

## 9. User stories

### Epic DE1 — Access & shell

| ID | Story | Acceptance | Priority | SRS |
| --- | --- | --- | --- | --- |
| DUS-01 | As the owner, I want to sign in securely and stay signed in for my working day, so that my students' data is protected without constant logins. | DAC-01; 2 h idle / 12 h absolute; return to the same page after re-login | Must | DSH-AUTH-* |
| DUS-02 | As the owner, I want the dashboard in Arabic by default and English when I choose, so that I work in my language. | DAC-09 | Must | DSH-GEN-02 |

### Epic DE2 — Overview

| ID | Story | Acceptance | Priority | SRS |
| --- | --- | --- | --- | --- |
| DUS-03 | As the owner, I want to see this month's revenue, paid registrations and seat fill compared with last month, so that I know how the business is doing. | KPI strip with values and comparisons in words; correct for the mock dataset | Must | DSH-HOME-01 |
| DUS-04 | As the owner, I want a list of things that need me, so that nothing is forgotten. | Refund-required, new messages, empty sessions within 7 days; each with a direct action; empty state | Must | DSH-HOME-02 |
| DUS-05 | As the owner, I want the latest payments, registrations and upcoming sessions on the first screen, so that I can drill into what changed. | 5 items each with "View all" | Must | DSH-HOME-04…06 |

### Epic DE3 — Students

| ID | Story | Acceptance | Priority | SRS |
| --- | --- | --- | --- | --- |
| DUS-06 | As the owner, I want a table of registered students with course, date, status and attendance, so that I know who's enrolled where. | Columns per DSH-STU-01; pagination; default Paid | Must | DSH-STU-01/04 |
| DUS-07 | As the operator, I want to search and filter registrations, so that I find a student in seconds. | DAC-05; filters as chips; URL keeps filters, not search terms | Must | DSH-STU-02/03 |
| DUS-08 | As the owner, I want to open a student and see all their bookings, tickets and attendance, and export lists, so that I can support them and keep records. | Student page per DSH-STU-05; CSV opens correctly in Excel with Arabic | Must / Should (export) | DSH-STU-05/06 |

### Epic DE4 — Payments

| ID | Story | Acceptance | Priority | SRS |
| --- | --- | --- | --- | --- |
| DUS-09 | As the owner, I want a list of payments with totals for any period, so that I can reconcile with Paymob. | Summary bar matches the filtered rows | Must | DSH-PAY-01…03 |
| DUS-10 | As the operator, I want to record a refund I made in Paymob, so that the booking and ticket are updated. | DAC-04 | Must | DSH-PAY-05 |
| DUS-11 | As the operator, I want to move a refund-required student to another session or cancel a booking, so that each case is resolved fairly. | Atomic seat check; reason required for cancel | Should | DSH-PAY-06/07 |

### Epic DE5 — Courses, sessions, attendance

| ID | Story | Acceptance | Priority | SRS |
| --- | --- | --- | --- | --- |
| DUS-12 | As the owner, I want to see my courses as cards with their status and next session, so that I see my catalog at a glance. | Cards per DSH-CRS-01; tabs with counts | Must | DSH-CRS-01/02 |
| DUS-13 | As the owner, I want to add a course quickly from a dialog, so that I can start with essentials and complete it later. | DAC-02 (draft created) | Must | DSH-CRS-03 |
| DUS-14 | As the owner, I want to edit content, curriculum and FAQ in clear tabs, so that the course page on the website is complete. | Each tab saves independently; unsaved-changes guard | Must | DSH-CRS-04 |
| DUS-15 | As the owner, I want to publish only when the course is complete and see what's missing, so that the website never shows a half-made course. | DBR-04 checklist with links | Must | DSH-CRS-05 |
| DUS-16 | As the owner, I want to add a session with dates, place, seats and price, so that students can book it. | DAC-02 (bookable); Cairo time; weekly repeat helper | Must | DSH-SES-02/03 |
| DUS-17 | As the owner, I want to edit, close or unpublish a session safely, so that I never break existing bookings. | DAC-03; notices on price/meeting changes | Must | DSH-SES-04…06 |
| DUS-18 | As the owner, I want a roster per session that I can print, so that the door runs smoothly before the Scanner app. | Roster + A4 print | Must / Should (print) | DSH-SES-07/08 |
| DUS-19 | As the owner, I want to see and correct attendance per meeting, so that I know who attended. | DAC-06 | Must (view) / Should (mark) | DSH-ATT-* |

### Epic DE6 — Team & profile

| ID | Story | Acceptance | Priority | SRS |
| --- | --- | --- | --- | --- |
| DUS-20 | As the owner, I want to add my assistants with their photo and phone, so that they can use the scanner app later. | Add dialog; phone unique (DAC-07) | Must | DSH-ASS-01/02 |
| DUS-21 | As the owner, I want to deactivate an assistant who left, so that they can't scan tickets anymore. | History kept; delete only without check-ins | Must | DSH-ASS-03 |
| DUS-22 | As the owner, I want to update my name, title, photo and contact numbers, so that the website shows the current me. | DAC-08 | Must | DSH-PRO-02/03 |
| DUS-23 | As the owner, I want to edit my bio and positioning in Arabic and English side by side, so that both versions stay aligned. | AR/EN side by side; character guidance | Must | DSH-PRO-04 |
| DUS-24 | As the owner, I want to manage my certifications, journey and stats, so that my credentials stay accurate. | CRUD + reorder; truthful-claims notice | Should | DSH-PRO-05…07 |

### Epic DE7 — Messages

| ID | Story | Acceptance | Priority | SRS |
| --- | --- | --- | --- | --- |
| DUS-25 | As the owner, I want to read contact messages and reply by email or WhatsApp, so that no inquiry is lost. | Inbox/Archived; marks read; reply links | Should | DSH-MSG-* |

## 10. UX & design principles

| # | Principle | In practice |
| --- | --- | --- |
| DP1 | **One question per screen** | Each page answers one operational question first (Home: "how are we doing / what needs me?"; Students: "who is enrolled?") |
| DP2 | **Same brand, office edition** | The Website's Drawing Sheet identity — paper, ink, cyanotype blue, safety yellow, Alexandria + Plex — in a denser, calmer form. Not a generic admin template |
| DP3 | **Tables you can act on** | Find a row, decide, act — without leaving the screen (search, chips, drawer details, inline actions) |
| DP4 | **Honest numbers** | Every number labelled, compared in words, and traceable to the rows behind it. No vanity charts |
| DP5 | **Safe by design** | Rules explained before they're hit; destructive actions confirmed with consequences named; no data loss on errors |
| DP6 | **Phone-ready** | The owner's phone is a first-class device: stacked rows, thumb-reachable actions, dialogs that fit |
| DP7 | **Arabic-first craft** | RTL first, mixed-script isolation, Latin digits, Arabic typographic rhythm |
| DP8 | **Accessible by default** | WCAG 2.2 AA; status never by color alone; keyboard everything |

## 11. Release plan

| Milestone | Content | Exit |
| --- | --- | --- |
| **DM1 — Foundation** (D0–D5) | Docs, design system, boilerplate, shell, auth against mock, UI kit | Shell + login work in AR/EN at 4 widths |
| **DM2 — Operate** (D6–D8) | Home, Students, Payments | DAC-01, 04, 05 pass on the mock |
| **DM3 — Publish** (D9) | Courses, sessions, roster, attendance | DAC-02, 03, 06 pass on the mock |
| **DM4 — Team & brand** (D10–D11) | Assistants, Profile, Messages, exports | DAC-07, 08 (mock) pass |
| **DM5 — Live** (D12–D14) | QA, real API switch (after Website Phase 8 + admin API), final review | All DAC pass against the real backend |

**Release strategy:** the dashboard can be demonstrated to the client on the mock from DM2. It goes live only with the real API (DM5), behind real authentication.

## 12. Dependencies

Website Phase 8 (database + booking backend) → admin API (SRS §7.2) → revalidation hooks (SRS §7.3). Hosting for `dashboard.{domain}`.

## 13. Risks & mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Admin API not ready when the UI is | Dashboard blocked | Contract-first: MSW implements SRS §7.2 exactly; switching is configuration only |
| Contract drift between mock and backend | Bugs at integration | Shared Zod schemas/types for API payloads; contract tests run against both MSW and the real API in D13 |
| Owner finds it complex | Low adoption | One question per screen, short forms, start guide on empty Home, Arabic-first copy, review with the owner after DM2 |
| Data protection (PDPL) | Fines, trust | Roles, server sessions, audit log, no PII in URLs/logs, retention per Website §6.5 |
| Phone usage with dense tables | Unusable on mobile | Stacked-row layout below 768 px designed from the start |

## 14. Future roadmap

Scanner app integration (assistant invites, live check-ins) · refunds via Paymob API · activity page · settings & locations · admin users & permissions · coupons and waiting lists · WhatsApp notifications · reports (per course profitability, attendance rates) · dark mode.

## 15. Open questions

See SRS §11.3 (DQ-01…DQ-06).

## 16. Approval

| Role | Name | Date | Status |
| --- | --- | --- | --- |
| Product owner | Mahmoud Samy |  | Pending |
| Client | Eng. (placeholder) |  | Pending |
