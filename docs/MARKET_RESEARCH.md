# Market Research & Gap Analysis — Dashboard

| Item | Value |
| --- | --- |
| Phase | D2 — Market research |
| Date | 2026-10-03 |
| Method | Desk research of organizer/admin dashboards (Eventbrite, Luma, Teachable/Thinkific), Egyptian education-center systems on Khamsat/Mostaql, Paymob refund docs, Egypt PDPL executive regulations, SaaS data-table guidance, and the `ui-ux-pro-max` database |
| Output | Gaps added to the Dashboard SRS/PRD, and design implications for `DESIGN_SYSTEM.md` |

> Limits: desk research, not user testing. The owner's real workflow (how he tracks students and attendance today, SRS Website Q-10) is still an open question.

---

## 1. Who uses the dashboard, and when

| User | Device | Moments that matter |
| --- | --- | --- |
| **Engineer (owner)** | Phone most of the day, laptop for setup | "How many seats did I sell this week?" · a student on WhatsApp says "I paid but got no ticket" · publishing next month's sessions · the day before a session: who's coming? |
| **Admin (Mahmoud, the developer/operator)** | Laptop | Adding courses and sessions for the owner, fixing data, refunds, support |
| **Assistant** | Phone, at the center entrance | Scans tickets (future Scanner app). **No dashboard access.** Today: needs a list of who's booked if the scanner isn't ready |

**Implication:** the dashboard is a _small-business operations tool_, not an analytics product. Every screen must answer one operational question quickly, on a phone as well as on a laptop.

---

## 2. Reference products

| Product | What they do well | What we borrow | What we skip |
| --- | --- | --- | --- |
| **Eventbrite organizer** | Granular team permissions (check-in only, view attendees, manage orders/refunds, view financials); check-ins report with CSV/Excel export; attendance filters | **Role-based permissions** with a check-in-only role for assistants; **CSV export** of students and payments; attendance per meeting | Marketing campaigns, discount codes, seat maps, webhooks UI |
| **Luma (host dashboard)** | Clear split: _Manager_ (full control) vs _Check-in staff_ (scan, check in, view guest list; can't download data, edit events or message guests) | Assistants are **check-in staff**: scan + see today's list only; no exports, no edits, no financial data | Calendars, invites, public host listing |
| **Teachable / Thinkific** | Revenue and students front and centre; per-course sales; student list with enrollment date and course | Home shows **revenue, paid bookings, seats filled**; students table shows course + date | Video LMS, progress tracking, quizzes, certificates (out of the business model) |
| **Egyptian center systems** (Khamsat / Mostaql listings: "education-center management with barcode attendance", "QR attendance linked to WhatsApp") | Attendance by barcode/QR at the door, per-session rosters, assistants who mark attendance, payment tracking | Confirms the 3-app model (dashboard + assistant scanner). **Printable session roster** as a fallback at the door | Parent accounts, monthly subscriptions, grades (school-tutoring features, not our audience) |
| **Paymob** | Refund API (`/api/acceptance/void_refund/refund`, partial refunds from 1 EGP up to the original amount; callbacks set `is_refunded`) | Dashboard **records** refunds in V1 (refund done in the Paymob portal); a "Refund through Paymob" action is a later phase | Initiating refunds from the dashboard in V1 (money movement needs strong auth and audit first) |

---

## 3. Data-UI patterns (what good admin tables do)

From SaaS data-table guidance and the `ui-ux-pro-max` UX rules:

- **Identifying column first** (student name / reference), text start-aligned, **numbers end-aligned with tabular figures**.
- **Search + filters are the primary interaction**, kept in a persistent bar, with filter state in the URL (shareable, survives refresh, back button works).
- **Pagination** (not infinite scroll) for reference and audit work like payments and students.
- **Row actions without menu hunting**: the likely next action is visible; destructive actions confirmed.
- **Sticky header** and visible active filters while scrolling.
- **Skeleton rows** while loading (no spinner-only states, no layout shift).
- **Empty states as onboarding**: say what will appear here and give one action ("Add your first session").
- **Real `<table>` semantics**, keyboard reachable, visible focus.
- **Mobile**: wide tables become stacked rows (name + status + amount), not a sideways-scrolling spreadsheet.
- The test: _can the user find a row, decide about it and act on it without leaving the screen?_

**Charts:** a trend needs ≥ 4 points, otherwise show a stat. Line or bars for revenue over time, a visible number next to every chart, and a table/text fallback. Never colour alone.

---

## 4. Legal context (Egypt PDPL)

The PDPL (Law 151/2020) executive regulations took effect on **1 Nov 2025**; the compliance grace period ends **31 Oct 2026** (Clyde & Co, Jan 2026). For a dashboard that stores student names, emails and phones:

| Obligation | Dashboard implication |
| --- | --- |
| Security measures for personal data | Authenticated access only; roles limit who sees personal data; sessions expire; no personal data in URLs or logs |
| Records of processing / accountability | **Audit log** of admin actions (who changed a booking, refunded, exported) — prepare the data model now, UI later |
| Breach notification (72 h to the PDPC, 3 working days to individuals) | Know who accessed what: audit log + export events recorded |
| Retention schedules, no indefinite storage | Retention follows Website SRS §6.5; deletion/anonymization is an admin action (later) |
| Licensing / DPO | Business/legal task for the client, not a software feature. Flag it to the client |

> Not legal advice. The client should confirm with a lawyer whether licensing applies to his database size.

---

## 5. Gap analysis — the brief vs. what the business needs

The brief lists six routes: Home, Students, Payments, Courses, Assistants, Profile. Research and the Website SRS show these gaps:

| # | Gap | Why it matters | Decision |
| --- | --- | --- | --- |
| G1 | **Sessions & meetings management** | A course alone can't be booked: students book a _session_ (dates, location, capacity, price). Without sessions, a new course never appears as bookable on the website | **Must.** Managed inside the course detail page |
| G2 | **Login, roles and access control** | Personal and financial data; PDPL | **Must.** Roles: Owner, Admin. Assistants have no dashboard access |
| G3 | **Refund-required queue** | Website BR-09: a late payment on a full session becomes `REFUND_REQUIRED`. Someone must act | **Must.** "Needs action" on Home + filter on Payments; record refund / move student |
| G4 | **Look up a booking by reference, phone or email** | The most common support request ("I paid, where is my ticket?") | **Must.** Search on Students and Payments; global search later |
| G5 | **Session roster (printable)** | The Scanner app isn't built yet; the assistant at the door needs a list. Also the backup when phones fail | **Should.** Roster per session with reference, name, phone, attendance |
| G6 | **Attendance per meeting** | "Attendance status" in the brief; check-ins come from the Scanner later | **Should.** Read check-ins; manual mark/unmark by Owner/Admin |
| G7 | **Contact messages inbox** | The website's contact form sends messages; Website FR-INT-04 lists them for the dashboard; otherwise they only live in email | **Should.** Simple inbox: New / Read / Archived |
| G8 | **CSV export** (students, payments, roster) | Accounting and the center's own records (Eventbrite pattern) | **Should** |
| G9 | **Certifications & journey editing** | "His own info already presented in the website" includes credentials and career timeline | **Should.** Profile tabs |
| G10 | **Assistant access for the Scanner app** | Assistants need credentials for the future mobile app; deactivation when they leave | **Should.** Profile cards now; app access (invite/PIN) in the Scanner phase |
| G11 | **Audit log** | PDPL accountability | **Could** (data model now, UI later) |
| G12 | **Site settings** (hold minutes, registration cut-off, reference prefix, contact channels) | Website DR-18 values otherwise need a developer | **Could** |
| G13 | Coupons, waiting lists, SMS/WhatsApp automation, multi-instructor | Out of the Website V1 scope | **Won't (D-V1)** |

---

## 6. Design implications

| Finding | Implication for the design system |
| --- | --- |
| The owner checks numbers on his phone | Mobile layout is designed, not shrunk: bottom-anchored navigation drawer, tables become stacked rows, KPI strip becomes 2×2 |
| Small business, few numbers | No chart wall. One revenue trend + a handful of KPIs + "needs action" + latest lists |
| Same brand as the website | Reuse the **Drawing Sheet** identity (paper, ink, cyanotype blue, safety yellow, Alexandria + IBM Plex Sans Arabic). The KPI strip is a **title block** (cells divided by rules), not floating cards |
| Arabic-first owner and assistants | RTL by default, English available; numbers and references isolated (`dir="ltr"`), Latin digits (Website Q-12) |
| Dense data | Smaller control heights (40px) on pointer devices, 44px on touch; 14px table text, 16px inputs on touch |
| `ui-ux-pro-max` suggested glassmorphism, a dark "tech" palette and Fira Code | **Rejected**: generic SaaS look, poor fit with the brand, blur hurts legibility of dense data. Kept from it: 4.5:1 contrast, visible focus, reduced motion, SVG icons only, 150–300ms transitions |

---

## Sources

- [Eventbrite — permissions definitions](https://www.eventbrite.co.uk/help/en-gb/articles/362073/permissions-definitions/)
- [Eventbrite — download your check-ins report](https://support.eventbrite.com/hc/en-us/articles/34865445475602-Download-your-Check-ins-report)
- [Luma — adding hosts and managers](https://help.luma.com/p/adding-hosts-and-managers-to-your-event)
- [Khamsat — education-center management system with barcode attendance](https://khamsat.com/programming/custom-website-development/4369968)
- [Mostaql — QR attendance system linked to WhatsApp](https://mostaql.com/go/1270091)
- [Paymob — refund transaction](https://docs.paymob.com/docs/refund-transaction) · [void transaction](https://docs.paymob.com/docs/void-transaction)
- [Clyde & Co — Egypt regulatory update on data privacy (Jan 2026)](https://www.clydeco.com/en/insights/2026/01/egypt-regulatory-update-on-data-privacy)
- [Al Tamimi — Egypt issues PDPL executive regulations](https://www.tamimi.com/news/from-policy-to-practice-egypt-issues-executive-regulations-of-the-personal-data-protection-law)
- [SaaS UI — data table patterns](https://www.saasui.design/blog/saas-data-table-ui-patterns)
- [UX Planet — best practices for data tables](https://uxplanet.org/best-practices-for-usable-and-efficient-data-table-in-applications-4a1d1fb29550)
- [Teachable vs Thinkific](https://teachable.com/compare/teachable-vs-thinkific)
