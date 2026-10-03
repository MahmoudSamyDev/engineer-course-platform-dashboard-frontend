# Engineering Standards — Dashboard

> Read on demand (AGENTS.md §5.1). React Router 8 SPA, RTK Query, state, architecture, components, performance, security.

## 1. React Router 8 (framework mode, SPA)

- `ssr: false`. The root route is pre-rendered into `build/client/index.html` at build time, so **every module must be SSR-safe at import and first render**: no `window`, `localStorage` or `document` at module level or during render — use effects or client loaders.
- Route config lives in `app/routes.ts`. Route modules are **thin**: `clientLoader` (prefetch via RTK Query), the page component composed from `features/*`, optional `ErrorBoundary`.
- **Auth:** `routes/app-layout.tsx` exports `clientMiddleware` (`requireUser`) + a `clientLoader` (so middleware also runs on first load). Don't re-check auth in child routes; read the user with `useMeQuery()`.
- Prefetch pattern:
  ```ts
  export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    // Starts the request with navigation; the component reads it from the cache.
    store.dispatch(coursesApi.endpoints.getCourse.initiate(params.courseId, { subscribe: false }));
    return null;
  }
  ```
  Await it only when the page can't render a skeleton without it (rare). Never return server data from loaders as a second cache — RTK Query is the cache.
- URL state: filters, sort, page and tabs in `useSearchParams` (**not** free-text search, DSH-GEN-04). Detail drawers use `?payment=<id>` so they're linkable.
- Unsaved changes: `useBlocker` (DSH-GEN-06).
- Use `<Link prefetch="intent">` for main navigation. Use the generated `Route` types (`./+types/<route>`), and run `npm run typecheck` (typegen + tsc).
- Read `node_modules/react-router/docs/` for anything not covered here.

## 2. Data: RTK Query

- One API slice: `app/store/api.ts` (`createApi`, base query with `credentials: "include"` and `X-Requested-With: dashboard`, 401 → `sessionEnded`).
- Each feature injects its endpoints in `app/features/<feature>/api.ts` and exports hooks. Endpoint names are verbs/nouns that match SRS §7.2 (`getRegistrations`, `recordRefund`).
- `transformResponse` unwraps `{ data }`; list endpoints return `{ items, meta }`.
- **Tags:** every query `providesTags` (list tag `{ type, id: "LIST" }` + item tags); every mutation `invalidatesTags` precisely (e.g. a refund invalidates `Payment`, `Registration`, `Overview`, the session). No manual refetch calls.
- Optimistic updates only for low-risk toggles (message read state, locale). Money/seat mutations wait for the server and send an `Idempotency-Key` (`crypto.randomUUID()` per user action).
- Errors: `getApiError(error)` → map `code`/`fields` to field errors (`setError`) or an inline alert. `VALIDATION_FAILED.fields` keys match form field names.
- Polling: `pollingInterval` only where the SRS says (Home/Payments 60 s, roster during meetings).

## 3. State

- Server data → RTK Query. Form state → React Hook Form. URL state → search params. Ephemeral UI (dialog open, hover) → `useState`.
- Redux slices (`app/store/ui-slice.ts`) only for cross-page client state: locale, session-ended flag. Add a slice only with a written reason.
- Nothing personal in browser storage. `localStorage` holds only the pre-sign-in language.

## 4. Mock API (MSW)

- Handlers live in `app/mocks/handlers/<feature>.ts` and are registered in `handlers/index.ts` **after** the `guard`. The guard answers 401 without a mock session (and applies `?mockError=`); when it passes it returns nothing, so the request falls through to the feature handler. Feature handlers return the exact SRS error codes for rule violations.
- The mock DB (`app/mocks/db.ts`) mirrors the shared Prisma model; generated data uses a **seeded** random generator (stable screenshots/tests). Keep business rules (DBR-*) in pure functions under `app/domain/` and call them from handlers — the backend team can port the same rules.
- `?mockError=500` forces errors; latency is on in dev, off in tests.
- Never import `~/mocks` from app code outside `entry.client.tsx` (dev guard) and tests.

## 5. Architecture

```
app/routes/            thin route modules
app/features/<name>/   api.ts · components/ · schema.ts · utils.ts (+ tests next to them)
app/components/ui/     generic primitives (no business words)
app/components/layout/ shell, navigation, page header
app/domain/            types (Website DR-*), dashboard types, pure rules (status, seats, attendance)
app/lib/               format, time (Africa/Cairo), cn
app/store/             store, api, slices, hooks
app/mocks/             MSW (dev/tests only)
```

Generic primitives never import from `features/`. Features may import primitives and domain, never another feature's internals (share through `domain/` or a small public `index.ts`).

## 6. Code quality

Readability, type safety, small focused components, clear names, no duplication, no dead code, no `any` without a comment, no magic numbers (named constants in `domain/constants.ts`). Business rules in pure, unit-tested functions — never inside components. Prefer composition over configuration-heavy components.

## 7. Components (Radix + tokens)

- Behavior from Radix primitives; look from tokens only (no raw hex — ESLint enforces). Variants as explicit maps (see `Button`).
- Every interactive element has an accessible name; icon-only buttons get `aria-label` + `Tooltip`.
- Dialogs: title + description, focus starts on the first field, Escape/close asks to discard when dirty, primary action at the end of the footer.
- Forms: RHF + `zodResolver`, schema codes mapped to messages that say what to change; server errors mapped back onto fields.

## 8. Performance

Route-level splitting is automatic — keep heavy libraries out of shared modules. Login route ≤ 200 KB gzip JS (DNFR-PERF-01). Memoize only measured hot spots. Skeletons keep layout stable. No chart library unless the D6 chart needs more than a small SVG (log the decision).

## 9. Security & privacy

httpOnly cookie session; never tokens in JS. `X-Requested-With` on every request. No PII in URLs, logs, analytics or error messages. `safeNextPath()` for redirects (no open redirects). Uploads validated client-side for UX, server-side for security. `noindex` on every page.

## 10. i18n

All copy in `app/messages/{ar,en}.json` (typed keys via `app/i18n/use-intl.d.ts`). ICU plurals (`{count, plural, …}` — Arabic has six forms). Bilingual content fields are edited side by side (`BilingualField`). Isolate Latin codes, phones, emails, references with `dir="ltr"`. Dates/money via `app/lib/format.ts` (Cairo, Latin digits). Mirror directional icons with `rtl:-scale-x-100`.
