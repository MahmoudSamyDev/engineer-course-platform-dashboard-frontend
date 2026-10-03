# Quality Standards — Dashboard

> Read at the end of every phase (VERIFY → REPORT).

## 1. Verification checklist (every phase)

**Automated**
- [ ] `npm run typecheck` and `npm run lint` pass
- [ ] `npm test` passes (unit + component tests against MSW)
- [ ] `npm run build` succeeds; `build/client` contains no mock code (`grep -r "setupWorker\|dashboard-demo" build/client` finds nothing)
- [ ] Relevant Playwright specs pass in both projects (desktop, mobile)

**Visual & behavioral** (dev server with mocks; screenshots at 360 / 768 / 1280 / 1440 in Arabic and English — **look at them**)
- [ ] Layout at every width; no horizontal page scroll; no clipped or overlapping text
- [ ] Long Arabic titles, long names and large amounts handled
- [ ] Keyboard: tab order, visible focus, dialogs trap/restore focus, Escape closes
- [ ] Forms: validation, server errors on fields, loading, success toast, dirty guard
- [ ] States: loading skeleton, first-use empty, no results, error (`?mockError=500`), 401 → sign-in and back
- [ ] RTL: mirrored layout and directional icons; Latin fragments isolated
- [ ] No console errors or warnings (expected 401s from `/auth/me` before sign-in excepted)

## 2. Self code review

- Is it simpler than it could be? Any component doing two jobs? Any duplication?
- Is server data only in RTK Query? Are tags correct (does every mutation refresh exactly what changed)?
- Do MSW handlers match SRS §7.2 exactly (paths, payloads, error codes)?
- Are business rules in `app/domain/` with tests, not in components?
- Accessible, responsive, performant? Matches SRS/PRD? Cite the IDs.

## 3. Traceability (`docs/PROGRESS.md`)

| Requirement (DSH/DUS/DAC) | Route | Component(s) | Endpoint(s) | States verified | Tests | Status |
|---|---|---|---|---|---|---|

Mark ✅ only after §1 passes.

## 4. Phase report (append to `docs/PROGRESS.md`)

```
Phase Dx — <name>: ✅ complete / ⚠️ complete with notes / ⛔ blocked
Delivered: <by requirement ID>
Verified: <checks + result; screenshot location>
API contract: <endpoints added/changed — flag changes for the Website backend>
Decisions/assumptions: <DD-IDs>
Known issues / deferred: <items + reason>
Next: <next phase and first task>
🎓 Claude ecosystem lesson: <block per CLAUDE.md>
```

## 5. Definition of Done (Dashboard V1)

- [ ] All routes in SRS §3.2 work with the auth guard and roles
- [ ] DAC-01…DAC-10 pass against the mock, then against the real API (D13)
- [ ] Every data view has loading, empty, no-results, error and permission states
- [ ] Responsive at 360/768/1280/1440 in AR and EN
- [ ] WCAG 2.2 AA basics verified (keyboard, focus, labels, contrast, status not by color)
- [ ] No PII in URLs, logs or storage; no mock code in production builds
- [ ] Traceability complete; independent review done and issues fixed
