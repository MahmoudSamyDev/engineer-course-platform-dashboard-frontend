# Design & UX Standards — Dashboard

> Read on demand (AGENTS.md §5.1). UI/UX role, page briefs, visual rules, responsive, accessibility, states.

## 1. UI/UX role

You are the senior product designer for an operations tool used by one busy engineer, often on his phone. Follow PRD principles **DP1–DP8** and `docs/DESIGN_SYSTEM.md`. Skill output (`ui-ux-pro-max`, `frontend-design`, `design-system`, `ui-styling`) is **input to filter**, not a decision.

Every page answers, in this order: **(1) where am I, (2) what's the one thing I need to know here, (3) what can I do next.**

## 2. Page brief (write before implementing each page; keep it in PROGRESS.md)

```
Page:
Question it answers (one):
Primary user & device:
Primary action (one, yellow):
Secondary actions:
Information hierarchy (top → bottom):
Data needed (endpoints):
URL state (filters, tabs, drawer):
Responsive (360 / 768 / 1280+):
States (loading / empty first-use / no results / error / permission / long text):
Requirements covered (DSH / DUS / DAC IDs):
```

## 3. Visual rules

- **Must not look like:** an admin template (dark sidebar + card grid), a SaaS analytics dashboard, a spreadsheet, a generic CRUD app, glassmorphism.
- Hierarchy through type, spacing, alignment and rules — not extra cards, shadows, gradients or icons.
- **One yellow action per page header**; dialogs have their own single primary.
- Title blocks for facts (KPIs, session facts, payment summary); schedule-style tables for lists; badges with a square marker + text for status.
- Shadows only on floating layers. Radius 2/4/8 by role (DESIGN_SYSTEM §5).
- Numbers: tabular, end-aligned in tables, always with a label; comparisons in words.
- Copy: sentence case, plain verbs, the button names the result and the toast repeats the verb.

## 4. Responsive

Phone is first-class (DP6). Verify **360 / 768 / 1280 / 1440** in **Arabic and English**.
- < 768: tables become stacked rows; filters move into a sheet; dialogs become full-height sheets; page actions full width under the title.
- 768–1023: tables may scroll inside their own container; nav in the drawer.
- ≥ 1024: rail + content; detail drawers from the inline-end edge.
No horizontal page scroll ≥ 320 px. Touch targets ≥ 44 px on coarse pointers; inputs 16 px text on touch.

## 5. Accessibility (WCAG 2.2 AA)

Semantic HTML and landmarks; one `h1` per page; real labels; errors linked and announced; `aria-sort` on sortable headers; table captions (visually hidden when the page header already names it); focus visible everywhere; Radix dialogs trap and restore focus; status never by color alone; reduced motion respected; `lang`/`dir` on `<html>`; Latin fragments in Arabic isolated.

## 6. Page guidance

- **Home** — "How are we doing and what needs me?" KPI title block → Needs action → revenue (6 months) → latest payments / upcoming sessions → latest registrations. No chart wall.
- **Students** — "Who is registered?" Search first, filter chips, paid by default; row → student page. Attendance shown in words.
- **Payments** — "Do the numbers reconcile, and what needs action?" Summary bar for the filter; Needs-action quick filter; details drawer; refund recording with consequences spelled out.
- **Courses** — "What am I offering and is it bookable?" Cards with sheet cover, publication + availability badges, next session and seats. Add course = dialog with essentials only, then the details page.
- **Course details** — tabs that save independently; Publishing tab lists exactly what's missing with links.
- **Session** — facts title block, roster with attendance grid, print roster.
- **Assistants** — cards; add/edit in a dialog; deactivate instead of delete when history exists.
- **Profile** — AR/EN side by side; photo crop preview matches the Website hero; truthful-claims notice on stats.
- **Messages** — inbox list + reading pane/drawer; reply via email/WhatsApp links.

## 7. Forms

Labels always visible; validation on blur then on change; server errors mapped to fields; loading button keeps its label; no data lost on error; dirty-state guard on navigation and dialog close; bilingual pairs side by side ≥ 768 px.

## 8. States

Every data view has: **loading** (skeleton of the real layout), **first-use empty** (what will appear + one action), **no results** (+ Clear filters), **error** (what happened + Retry), **permission** (403 message), **long content** (long Arabic course titles, long names, 6-digit amounts). Never a bare "Something went wrong".

## 9. Motion

Feedback only: dialog/drawer fade + slide (200–250 ms), toasts, 150 ms color transitions. No entrance animations on pages or lists.
