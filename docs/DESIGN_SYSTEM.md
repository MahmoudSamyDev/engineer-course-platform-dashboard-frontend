# Design System — "Drawing Sheet · Office"

| Item | Value |
| --- | --- |
| Phase | D3 — Design system |
| Date | 2026-10-03 |
| Inputs | `MARKET_RESEARCH.md` §6 · PRD §10 (DP1–DP8) · Website `docs/DESIGN_SYSTEM.md` ("Drawing Sheet") · `frontend-design`, `ui-ux-pro-max`, `dataviz` skills |
| Implementation | Tokens in `app/styles/app.css` (`@theme`), fonts in `public/fonts/`, primitives in `app/components/ui/` |

---

## 1. Concept

**Subject:** the engineer's office — where a practicing structural engineer runs his teaching business between site visits.
**Audience:** the engineer himself (phone first during the day, laptop in the evening) and one operator.
**The interface's job:** answer one operational question per screen, then let him act.

The Website borrowed the **drawing sheet** — title block, dimension chain, sheet cover. The office edition borrows the drawing sheet's working documents instead:

| Device from his world | Where | Information it carries |
| --- | --- | --- |
| **Title block** | Home KPI strip, session facts, payment summary bar, student facts | The few facts that define the page, each in a labelled cell divided by rules |
| **Schedule** (the ruled tables on structural drawings: column schedule, rebar schedule) | Every data table | Rows of comparable items: ruled rows, a ruled header, numbers on the end edge, tabular figures |
| **Sheet cover** | Course cards | Course code + discipline, the same generated cover as the Website (one brand, two apps) |
| **Seat bar** (a plain dimension-like measure) | Sessions everywhere | Sold vs capacity, always with the number next to it |

**The memorable element:** the Home **title block** — four facts in one ruled frame, the first thing he sees every morning. Everything around it is quiet: white sheets on cool paper, ink text, one yellow action per page.

---

## 2. Design plan review (anti-default check)

| First idea | Problem | Revision |
| --- | --- | --- |
| Dark navy sidebar with white icons | The default admin template; heavy on a phone-sized drawer | Sheet-white navigation rail with a 1.5px frame line, like the border of a drawing; the active item uses a cyan-wash fill **and** a 3px start-edge bar **and** semibold text |
| A row of four rounded KPI cards with icons, big numbers and green/red arrows | The SaaS-card kit; arrows and color alone carry meaning | One **title block**: four cells in one frame, divided by rules; each cell = label, value, comparison in words ("+18% vs September") |
| Glassmorphism, dark "tech" palette, Fira Code (ui-ux-pro-max suggestion) | Generic, blur hurts dense data, off-brand | Rejected. Kept: contrast, focus, reduced motion, SVG icons |
| Charts everywhere (donut of payment methods, area chart of signups) | Vanity charts for a business with small numbers | One revenue chart (bars, 6 months). Everything else is numbers and lists |
| Zebra-striped tables with heavy headers | Spreadsheet look | Schedule style: ruled rows on white, header on a light `paper` band in graphite sentence case, row hover in `paper` |
| Pill-shaped status chips in saturated colors | Template chrome, colour-only meaning | The Website badge: 2px radius, square marker + text label, tinted background |
| Avatar circles with random colors | Decoration, no meaning | Initials on `cyan-wash` for every person; real photos where uploaded |
| Uppercase tracked table headers and section labels | A generated-page tell; meaningless in Arabic | Sentence case everywhere; labels only where they name a field |

---

## 3. Color

Same base palette as the Website (drafting paper, drawing ink, cyanotype blue, concrete, safety yellow), plus two working tones for interface states.

| Token | Hex | Use |
| --- | --- | --- |
| `paper` | `#F3F5F6` | App background, table header band, row hover |
| `sheet` | `#FFFFFF` | Surfaces: nav rail, panels, tables, dialogs, cards |
| `ink` | `#1A2633` | Headings, body, primary icons |
| `graphite` | `#4A5763` | Secondary text, table headers, labels (7.1:1 on paper) |
| `concrete` | `#8996A3` | Decorative lines and disabled icons. **Never text** |
| `line` | `#D3DAE0` | Row rules, dividers, card frames |
| `line-strong` | `#AEB8C2` | Inputs, title-block outer frame, nav rail frame |
| `cyan` (primary) | `#1C4DB8` | Links, focus ring, selection, active nav bar, chart marks (7.6:1 on white) |
| `cyan-deep` | `#102A5C` | Brand block mark, print header |
| `cyan-wash` | `#E8EEFB` | Selected row / active nav item / avatar background |
| `safety` (CTA) | `#F4B400` | **The page's primary action only** (Add course, Save). Ink text on it (9.4:1) |
| `safety-hover` | `#DDA300` | Primary hover / active |
| `overlay` | `rgb(26 38 51 / 0.45)` | Dialog and drawer backdrop |

**Status colors** — never color alone; always with a text label and the square marker:

| Variant | Text | Background | Statuses mapped to it |
| --- | --- | --- | --- |
| success | `#1F6B45` | `#E6F4EC` | Paid · Succeeded · Available · Attended · Active · Published |
| warning | `#8A4B00` | `#FFF1DC` | Pending payment · Almost full · Refund required · New (message) · Closing soon |
| danger | `#A8231B` | `#FCEBEA` | Failed · Fully booked · Absent · Errors |
| neutral | `#4A5763` | `#EBEFF2` | Expired · Cancelled · Closed · Draft · Inactive · Archived · Read |
| info | `#1C4DB8` | `#E8EEFB` | Coming soon · Upcoming · Refunded · Checked in |

**Rules:** one yellow action per page header (dialogs have their own single primary); no gradients; no shadows on resting surfaces; light mode only in V1 — all components use semantic tokens so a dark theme can be added later without touching components.

**Charts (dataviz method):** revenue is a **single series** → one hue, `cyan`, no legend (the title names it). Bars ≤ 24px wide, 4px rounded top, square at the baseline, 2px gap; gridlines 1px `line`; axis text `graphite`; values as text in ink tokens, never in the bar color. The seat bar uses `cyan` for sold on a `line` track with the number beside it. Status colors are never reused as series colors.

---

## 4. Typography

The Website's pairing, set denser for data work.

| Role | Family |
| --- | --- |
| Page titles, KPI values, course titles on cards | **Alexandria** (variable, Arabic + Latin) |
| Everything else: UI, tables, forms, body | **IBM Plex Sans Arabic** (400/500/600/700, Arabic + Latin) |

Self-hosted woff2 (the same files as the Website, OFL licences included) in `public/fonts/`, declared with `@font-face` and `font-display: swap`; Arabic and Latin files split by `unicode-range`.

**Scale** (desktop; mobile in brackets where different):

| Token | Size / line height | Weight | Family | Use |
| --- | --- | --- | --- | --- |
| `title` | 24/32 [20/28] | 600 | Alexandria | Page `h1` |
| `kpi` | 30/36 [24/30] | 600, tabular | Alexandria | Title-block values |
| `heading` | 18/26 | 600 | Alexandria | Panel and section `h2` |
| `subheading` | 16/24 | 600 | Plex | Card titles, dialog sections `h3` |
| `body` | 14/22 (AR 14/24) | 400 | Plex | Default UI text, table cells |
| `body-touch` | 16/24 | 400 | Plex | Inputs on coarse pointers (prevents iOS zoom) |
| `label` | 13/18 | 500 | Plex | Field labels, table headers, title-block labels |
| `caption` | 13/18 | 400 | Plex | Meta text, helper text, timestamps |

Rules: **minimum 13px** (Arabic legibility); sentence case everywhere; no letter-spacing on Arabic; Latin headings −0.01em; numbers, money, dates, seats and references use `tabular-nums`; references, codes, phones and emails are isolated with `dir="ltr"` / `<bdi>`; Latin digits in both locales.

---

## 5. Space, layout and shape

| Token | Value |
| --- | --- |
| Spacing | 4px base: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 |
| Shell | Nav rail 248px (≥ 1024px); top bar 56px; content padding 16px mobile, 24px tablet, 32px desktop; content max width 1440px |
| Page header | `h1` + optional description on the start side; page actions on the end side; 24px below |
| Grid | 4 / 8 / 12 columns, 16 → 24px gutters |
| Breakpoints | `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1440 (verify 360 / 768 / 1280 / 1440) |
| Alignment | Start-aligned everywhere (right in Arabic). Numbers in tables end-aligned. Center only for empty states |
| Radius | `xs` 2px (badges, checkboxes) · `sm` 4px (buttons, inputs, cards, table frames) · `md` 8px (dialogs, drawers, menus, toasts) |
| Borders | 1px `line` for structure · 1.5px `line-strong` for inputs, title-block frames and the nav rail edge |
| Elevation | Floating layers only (menus, popovers, dialogs, drawers, toasts): `0 8px 24px rgb(26 38 51 / 0.12)` |
| Control height | 40px on fine pointers (compact 32px for table row actions); **44px** on coarse pointers (`@media (pointer: coarse)`) |
| Table row | 48px (comfortable) / 40px (compact, optional) |
| Focus | 2px `cyan` ring + 2px offset on every interactive element (`:focus-visible`) |
| Motion | 150ms colors; 200ms dialog/drawer fade + 8px slide; 250ms drawer slide; `prefers-reduced-motion` removes movement and keeps fades ≤ 100ms |

---

## 6. Components

Behavior from **Radix Primitives** (`radix-ui`), look from tokens. Each component lives in `app/components/ui/`.

| Component | Radix | Variants / states | Notes |
| --- | --- | --- | --- |
| **Button** | `Slot` (asChild) | `primary` (safety), `secondary` (sheet + ink border), `ghost` (cyan text), `danger` (danger text, danger border); sizes `md` 40 / `sm` 32 / `lg` 44; loading (spinner, label kept), disabled | One primary per region. Labels name the result: "Add course", "Save changes", "Record refund" |
| **IconButton** | `Tooltip` | ghost / secondary | Always an accessible name + tooltip |
| **Badge** | — | success, warning, danger, neutral, info | Square 6px marker + label |
| **Field** | `Label` | label, hint, error, required mark | Error below the control, `aria-describedby`, `aria-invalid` |
| **Input / Textarea** | — | default, focus, invalid, disabled, with prefix/suffix (EGP, +20) | 1.5px `line-strong` border |
| **BilingualField** | — | AR + EN side by side (≥ 768px), stacked below | Each with its own `dir` and `lang`; counters when a limit exists |
| **Select** | `Select` | default, invalid, disabled | Native-feeling, searchable variant later |
| **Checkbox / Switch / RadioGroup** | `Checkbox` `Switch` `RadioGroup` | checked, indeterminate (checkbox), disabled | 44px hit area on touch |
| **Dialog** | `Dialog` | sizes `sm` 440 / `md` 560 / `lg` 720; full-screen sheet below 640px | Title, optional description, body (scrolls), footer actions (primary at the end) |
| **Sheet (drawer)** | `Dialog` | side (inline-end) 480px; bottom on mobile | Details panels (payment, message), mobile nav (inline-start) |
| **AlertDialog** | `AlertDialog` | neutral / destructive | Names the object and the consequence; destructive action uses `danger` |
| **DropdownMenu** | `DropdownMenu` | items, separators, destructive item | Row and card "More actions" |
| **Tabs** | `Tabs` | underline tabs bound to `?tab=` | Course details, Profile |
| **Tooltip** | `Tooltip` | — | Only for icon buttons and truncated text |
| **Toast** | `Toast` | success, error, info | Bottom-end (desktop), bottom (mobile); polite live region; 5s, pausable |
| **Avatar** | `Avatar` | photo, initials fallback | Initials on `cyan-wash`, ink text |
| **Popover** | `Popover` | — | Date range picker, filter menus |
| **ScrollArea** | `ScrollArea` | — | Nav rail, wide tables on tablet |
| **Skeleton** | — | line, block, table rows | Same size as the content (no layout shift) |
| **DataTable** | — (semantic `<table>`) | sortable headers (`aria-sort`), selectable rows, row link, sticky header, loading rows, empty, error | Stacked rows below 768px |
| **FilterBar** | `Popover`, `Select` | search, filter controls, active chips, Clear all | Filter state in the URL; search term not in the URL |
| **Pagination** | — | "Showing 26–50 of 312", previous/next, page size | Directional icons mirror in RTL |
| **EmptyState** | — | first-use / no-results / error | Says what will appear and offers one action |
| **TitleBlock** | — | 2–4 cells (KPI), n cells (facts) | Signature component |
| **SeatBar** | — | default, full, closed | Bar + "18 of 24" text |
| **PageHeader** | — | title, description, actions, back link | Exactly one `h1` |

Icons: `lucide-react`, 1.5px stroke, 20px in navigation, 16px inline; `aria-hidden` when decorative; directional icons mirror in RTL (`rtl:-scale-x-100`).

---

## 7. Signature compositions

### 7.1 App shell

```
desktop ≥ 1024 (RTL shown; LTR mirrors)
┌────────────────────────────────────────────────────┬───────────────┐
│ (mock-data banner, development only)               │ ▣ MS │ Mahmoud│ ← brand block
├────────────────────────────────────────────────────┤      │ office │   (title-block style)
│ h1 Courses                       [+ Add course]    ├───────────────┤
│ description                                        │▌ Home         │ ← active: wash + bar + semibold
│                                                    │  Students     │
│  page content on paper                             │  Payments   2 │ ← count badge (D6+)
│  (max 1440, padding 32)                            │  Courses      │
│                                                    │  Assistants   │
│                                                    │  Messages   5 │
│                                                    │  Profile      │
│                                                    ├───────────────┤
│                                                    │ [AR | EN]     │ ← language switch
│                                                    │ (MS) Mahmoud⇕ │ ← user menu: profile, sign out
└────────────────────────────────────────────────────┴───────────────┘
No top bar on desktop: the page header (h1 + one primary action) opens the content.

mobile < 1024
┌───────────────────────────────┐
│ ☰  ▣ Course office   [AR|EN] │  ← top bar: menu, product, language
├───────────────────────────────┤
│ h1 Courses                    │  ← the page title stays in the content (no duplicate in the bar)
│ [primary action]              │
│ page content                  │
└───────────────────────────────┘
☰ opens the nav as a drawer from the inline-start edge (brand, nav, language, user)
```

### 7.2 Home

```
┌──────────────────────────────────────────────────────────────────┐
│ Revenue this month │ Paid registrations │ Seats filled │ Upcoming │ ← title block (one frame)
│ 48,600 EGP         │ 17                 │ 112 of 160   │ 6        │
│ +18% vs September  │ 3 more than Sept.  │ 70% of seats │ next 30d │
└──────────────────────────────────────────────────────────────────┘
┌────────────────────────────┐ ┌───────────────────────────────────┐
│ Needs action (2)           │ │ Revenue, last 6 months            │
│ ▪ Refund required KM-…  →  │ │  ▁ ▃ ▂ ▅ ▆ █   (bars, values on    │
│ ▪ 5 new messages        →  │ │   hover + table for SR)           │
└────────────────────────────┘ └───────────────────────────────────┘
┌────────────────────────────┐ ┌───────────────────────────────────┐
│ Latest payments    View all│ │ Upcoming sessions        View all │
│ schedule-style list (5)    │ │ date · course · ▬▬▬▬▬░░ 18 of 24  │
└────────────────────────────┘ └───────────────────────────────────┘
│ Latest registrations (5)                                View all │
mobile: title block 2×2, panels stacked in the order above
```

### 7.3 Table (schedule)

```
┌ FilterBar: [🔍 Name, phone, email or reference] [Course ▾] [Status ▾] [Date ▾]   [Export CSV] ┐
│ chips: Status: Paid ✕   Course: ETABS ✕   Clear all                                         │
├────────────────────┬───────────────┬──────────────────────┬────────────┬─────────┬──────────┤
│ Student            │ Phone         │ Course               │ Registered │ Status  │ Attend.  │ ← paper band, graphite 13/500
├────────────────────┼───────────────┼──────────────────────┼────────────┼─────────┼──────────┤
│ Youssef Adel       │ +20 10 1234…  │ ETABS · ETB-2610-A   │ 2 Oct 14:20│ ▪ Paid  │ Upcoming │ ← 48px rows, 1px line
│ Civil              │               │                      │            │         │          │
└────────────────────┴───────────────┴──────────────────────┴────────────┴─────────┴──────────┘
  Showing 1–25 of 312                                        [10|25|50]   ‹ Previous  Next ›
mobile: each row → a stacked item: name (subheading) / course / status + date
```

### 7.4 Course card

```
┌──────────────────────────────────────┐
│ SHEET COVER (code ETB, discipline)    │ 16:9, generated — same as the Website
├──────────────────────────────────────┤
│ ▪ Published   ▪ Almost full       ⋯  │ badges + more-actions menu
│ ETABS for analysis & design of RC…   │ subheading, 2 lines max
├──────────────┬──────────────┬────────┤
│ Next session │ Seats        │ Price  │ title-block cells
│ Sat 17 Oct   │ 18 of 24     │ 3,200  │
└──────────────┴──────────────┴────────┘
```

### 7.5 Dialog (Add course)

Header: title "Add course" + one-line description. Body: fields in a 2-column grid on ≥ 640px (bilingual pairs side by side), single column on mobile where the dialog becomes a full-height sheet. Footer: "Cancel" (secondary) and "Create draft" (primary) at the end; focus starts on the first field; Escape and the close button ask to discard when the form is dirty.

### 7.6 Assistant card

Avatar (photo or initials) · name (subheading) · phone (LTR, WhatsApp link) · status badge · app access line · more-actions menu (Edit, Deactivate, Delete). Cards sit in a 1 / 2 / 3-column grid; inactive cards show the status badge, not a faded card (fading hurts contrast).

---

## 8. Motion

Only as feedback: dialogs and drawers fade + 8px slide (200–250ms, ease-out); toasts slide in from their edge; hover/active color 150ms. No entrance animations on pages or lists. `prefers-reduced-motion: reduce` → no movement.

---

## 9. Voice

Plain, specific, active, sentence case, Arabic first. Buttons say what happens and the toast repeats the verb: **"Publish course" → "Course published"**, **"Record refund" → "Refund recorded"**. Errors say what happened and what to do: "Capacity can't be less than the 18 seats already sold." Empty states invite the next step: "Add your first session so students can book this course." No apologies, no exclamation marks, no "Oops".

---

## 10. Print

Roster and payment lists have a print stylesheet: A4, ink on white, no navigation, header with course, session and print date, `cyan-deep` 1px title-block frame, page numbers.
