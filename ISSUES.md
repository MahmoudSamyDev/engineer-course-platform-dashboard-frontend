# ISSUES.md — Dashboard code scan

Found by reading the code on 2026-11-09. `node_modules` was not installed, so typecheck, lint and tests were **not run**. Each item below comes from reading the code, not from running it.

Severity: **High** = wrong behavior or risk before go-live · **Medium** = spec/convention drift or a gap that will matter · **Low** = polish or test hygiene.

## Summary

| # | Severity | Area | Issue |
|---|---|---|---|
| 1 | High | Auth | A network or server failure on `me` looks like a sign-out |
| 2 | High | Process | Independent review of the money actions (refund/move/cancel) is still outstanding |
| 3 | Medium | Payments | Mock refund sets `REFUNDED` on a partial refund |
| 4 | Medium | Mocks | Mock move/cancel/refund ignore the `Idempotency-Key`; price difference on move isn't recorded |
| 5 | Medium | API contract | ~~`POST /admin/auth/password` not mocked or built~~ — **resolved in D10** (DD-036) |
| 6 | Medium | Conventions | `clientLoader` prefetching is not used consistently — D10 routes prefetch; **`payments.tsx` still doesn't** |
| 7 | Medium | Tests | Thin UI test coverage — improved in D10 (+26 unit/component, +6 e2e); **payments and students still have no e2e** |
| 8 | Low | Tests | `futureDate()` in the e2e tests uses UTC dates |
| 9 | Low | Mocks | `inRange` ignores the Cairo timezone |
| 10 | Low | Tooling | ~~`.npmrc` sets `legacy-peer-deps=true`~~ — **resolved**, switched to pnpm (DD-032) |
| 11 | Low | UI | Known visual bugs from the progress file |
| 12 | Info | Verification | ~~Checks not run in this scan~~ — **done** after the pnpm install |

---

## 1. A network or server failure on `me` looks like a sign-out — High

**Where:** `app/routes/app-layout.tsx` (`requireUser`)

**What:** The middleware throws a redirect to `/login?next=…` whenever `me` returns no data. That covers a 401, but also a backend that is down, a timeout, or an offline browser.

**Impact:** The owner is sent to the sign-in page with no explanation and may think the session or password is wrong. After signing in again, the same outage makes things worse.

**Fix:** Redirect only when the error status is 401. For any other error, throw (or render) an error screen with a retry button, so the root `ErrorBoundary` or a layout error state explains it. Add a test for both branches.

---

## 2. Independent review of the money actions is outstanding — High

**Where:** `app/features/payments/*`, `app/mocks/handlers/payments.ts`

**What:** `CLAUDE.md` requires a separate review subagent for D8 (payments). `docs/PROGRESS.md` says it is still pending. D9 has moved on without it.

**Impact:** Refund, move and cancel change seat counts and booking state. A wrong assumption here costs money or leaves a valid ticket on a refunded booking.

**Fix:** Run a fresh review agent before D13. Give it SRS §4.5, DBR-11/12 and the files above. Ask it to find any path that gives a wrong seat count or leaves a valid ticket on a refunded or cancelled booking.

---

## 3. Mock refund sets `REFUNDED` on a partial refund — Medium

**Where:** `app/mocks/handlers/payments.ts` (`POST /payments/:id/refund`)

**What:** Any accepted refund sets `payment.status = "REFUNDED"` and `booking.status = "REFUNDED"`, even if only part of the amount was refunded. The handler also accepts the call while the booking is `REFUND_REQUIRED`, but after a partial refund `remaining` is still above zero and a second refund is blocked because the payment is no longer `SUCCEEDED`.

**Impact:** The UI is verified against behavior the real backend may not have. The SRS says the booking becomes Refunded, but it is unclear what a partial refund should do to the seat and the ticket.

**Fix:** Confirm the intended rule with the product owner and the Website backend, record it in `docs/DECISIONS.md`, then align the mock, the refund dialog copy and a unit test.

---

## 4. Mocks ignore the idempotency key; price difference is not recorded — Medium

**Where:** `app/mocks/handlers/payments.ts` (refund, move, cancel)

**What:** The client sends an `Idempotency-Key` header on all three actions. The mock never reads it, so a repeated request is handled as a new one. In `move-dialog.tsx` the dialog warns when the target session price differs from the paid amount, but nothing is sent or stored about it.

**Impact:** Duplicate-submit behavior (double click, retry after a timeout) is untested. The price-difference decision is invisible in the payment timeline.

**Fix:** Make the mock replay the stored response for a repeated key. Decide how a price difference on move should be handled and record it in `DECISIONS.md`.

---

## 5. `POST /admin/auth/password` is missing — Medium — RESOLVED (D10)

Mutation `changePassword` in `features/auth/api.ts`, MSW handler in `mocks/handlers/auth.ts`, form on Profile → Account. A wrong current password is a 422 field error, not a 401 (DD-036, SRS rev 1.2).

---

## 6. `clientLoader` prefetching is not used consistently — Medium

**Where:** `AGENTS.md` §4 vs. routes such as `app/routes/payments.tsx`

**What:** AGENTS.md says route modules prefetch with `store.dispatch(api.endpoints.x.initiate(...))` in `clientLoader`. Some routes do (`home`, `courses`, `course`, `student`, `session`), but `payments.tsx` reads data only through hooks, and the D10/D11 placeholders will need a decision too.

**Impact:** Pages without a loader show their skeleton after navigation instead of before it, and the project rules and the code disagree.

**Fix:** Either add loaders to the remaining data routes, or amend AGENTS.md to say which routes prefetch and why.

---

## 7. Thin UI test coverage — Medium

**Where:** `tests/`, `app/routes/login.test.tsx`

**What:** 5 unit files, 1 component test and 2 e2e specs (auth, courses). Payments, students, attendance and the refund/move/cancel dialogs have no automated tests. The money rules in the mock handlers are not unit-tested.

**Fix:** Add e2e or component tests for: refund validation, move with no free seats, cancel without a reason, attendance mark/undo (DAC-06), and the student search/filter flow. Add a test for DSH-AUTH-05 (listed as in progress in the traceability table).

---

## 8. `futureDate()` in the e2e tests uses UTC — Low

**Where:** `tests/e2e/courses.spec.ts`

**What:** It builds a date with `toISOString().slice(0, 10)`, which is a UTC date. The app works in Cairo time, so around midnight the generated day can differ from the app's.

**Fix:** Format the date in `Africa/Cairo` (for example with `Intl.DateTimeFormat` and `en-CA`).

---

## 9. `inRange` ignores the Cairo timezone — Low

**Where:** `app/mocks/handlers/helpers.ts`

**What:** The comment says "Cairo-agnostic". It compares the UTC day string, so a payment made at 01:00 Cairo time counts toward the previous day.

**Impact:** Mock date filters can disagree with what the real backend and the UI show. Fine for the demo, wrong if used to judge the real API.

**Fix:** Convert to the Cairo day before comparing, or note the limit in `DECISIONS.md`.

---

## 10. `legacy-peer-deps=true` in `.npmrc` — Low — RESOLVED

The project now uses pnpm 11 (DD-032). `.npmrc` and `package-lock.json` are gone, and the flag with them. Dropping it exposed two real unmet peers, now declared in `pnpm-workspace.yaml` under `peerDependencyRules`: `eslint-plugin-jsx-a11y` (ESLint 10) and `@vitest/mocker` (MSW 3). Remove those entries when the packages widen their ranges.

---

## 11. Known visual bugs — Low

**Where:** `docs/PROGRESS.md` (D9 known issues)

- The Payments filter bar wraps to a second line at 1280 px.
- The course card "next session" date truncates in Arabic.

**Fix:** Fix both and re-check with screenshots at 360 / 768 / 1280 / 1440 in Arabic and English, as the Definition of Done requires.

---

## 12. Checks were not run — Info — DONE

After installing with pnpm: typecheck ✅, lint ✅, 30 unit/component tests ✅, production build ✅ with no `msw` or `mockServiceWorker` in `build/client`. Not run: Prettier on the whole tree after the final edits, and Playwright e2e (needs a browser install).

---

## Found and fixed during D10

- **Tab switch dropped unsaved edits** (course page and profile): the guard ignored `?tab=` changes. Fixed, plus a cache write on save so the guard doesn't fire right after saving (DD-038).
- **Mock counted an assistant's check-ins by display name**, so a rename allowed deleting someone with history (DBR-14). Now by assistant id (DD-040).
- **Bidi in Arabic:** spaced phone examples rendered reversed; user-typed Latin text misplaced its punctuation (DD-041).

