# Mock login credentials — Dashboard

> **Development only.** These accounts exist only in the in-browser mock API (MSW).
> They work when `.env` has `VITE_API_MOCKING=true` (the default) and are removed from production builds.
> The real backend will have its own users.

| Email | Password | Role |
|---|---|---|
| `owner@example.com` | `dashboard-demo` | Owner (the engineer) |
| `admin@example.com` | `dashboard-demo` | Admin (operator) |

## Run the dashboard

```bash
npm install
npm run dev
```

Open http://localhost:5173 and sign in with one of the accounts above.

## Notes

- 5 wrong passwords within 15 minutes lock that email for 15 minutes (mock behavior matches SRS DSH-AUTH-02).
- Your mock session survives page reloads in the same tab; closing the tab signs you out.
- Add `?mockError=500` to any page URL to preview error states.
