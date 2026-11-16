# Deploying the Dashboard

The Dashboard is static files (SPA mode, DD-002) served from its own origin, e.g. `dashboard.{domain}`.

## Build

```bash
VITE_API_BASE_URL=https://api.example.com/api/v1 VITE_API_MOCKING=false pnpm build
pnpm check:build   # bundle budget + security headers, against the built files
```

`pnpm build` runs `react-router build`, then `scripts/write-headers.mjs`, which writes:

- `build/client/_headers`: security headers (DNFR-SEC-06/07) and caching, in the format Netlify and Cloudflare Pages read.
- `build/client/_redirects`: the SPA fallback (`/* /index.html 200`).

The CSP allows React Router's inline boot scripts **by hash**. The hashes change with every build, so always deploy the `_headers` from the same build. Extra image origins (a media CDN) go in `CSP_EXTRA_ORIGINS` (space-separated, build time only).

## Headers (any host)

If the host doesn't read `_headers` (nginx, S3 + CloudFront, Caddy), copy the values from the generated file:

| Header | Value |
|---|---|
| `Content-Security-Policy` | from `_headers` (`script-src 'self'` + hashes, `connect-src 'self'` + API origin, `frame-ancestors 'none'`) |
| `Referrer-Policy` | `same-origin` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` |
| `X-Robots-Tag` | `noindex, nofollow` (also `robots.txt` and the meta tag) |
| `Cache-Control` | `/assets/*`: `public, max-age=31536000, immutable`; `index.html`: `no-cache` |

nginx example:

```nginx
location / {
  try_files $uri /index.html;
  add_header Content-Security-Policy "<value from _headers>" always;
  add_header Referrer-Policy same-origin always;
  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
  add_header X-Content-Type-Options nosniff always;
  add_header X-Frame-Options DENY always;
  add_header X-Robots-Tag "noindex, nofollow" always;
}
location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
```

## Demo deployment (no backend)

For a public preview with sample data, build with the demo switch. In Vercel (or any host), set these **build-time** variables and redeploy:

| Variable | Value |
|---|---|
| `VITE_API_MOCKING` | `true` |
| `VITE_DEMO` | `true` |
| `VITE_API_BASE_URL` | leave unset (or `/api/v1`) |

The build then includes the in-browser mock API (data resets on reload) and shows the demo banner and the demo accounts on the sign-in page. Use it only to show the work, never with real data, and never for the real deployment (omit `VITE_DEMO`). Vercel ignores `_headers`, so the security headers are not applied there.

## Backend side

The Website backend must allow this origin with credentials (CORS), set the session cookie `httpOnly; Secure; SameSite=Strict` (DNFR-SEC-01/04), and implement the contract in `docs/SRS.md` §7.2, including revisions 1.1–1.3.
