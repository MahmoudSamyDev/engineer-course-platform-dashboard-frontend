// Security headers for the dashboard host (DNFR-SEC-06/07), written after `react-router build`.
// Output: build/client/_headers and _redirects (Netlify / Cloudflare Pages format). For another
// host, copy the same values (see docs/deploy.md).
//
// The CSP allows the four inline boot scripts React Router writes into index.html by hash,
// so script-src stays 'self' + hashes (no 'unsafe-inline'). Hashes change with every build,
// which is why this runs after it.
//
// Build-time env (not shipped to the browser):
//   VITE_API_BASE_URL   absolute API URL, e.g. https://api.example.com/api/v1 (connect + img)
//   CSP_EXTRA_ORIGINS   space-separated extra origins for images, e.g. a media CDN
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadEnv } from "vite";

const CLIENT = join(import.meta.dirname, "..", "build", "client");
const html = readFileSync(join(CLIENT, "index.html"), "utf8");

const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
  ([, body]) => `'sha256-${createHash("sha256").update(body).digest("base64")}'`,
);

// The same env files and precedence as the build (`.env`, `.env.production`, process env).
const env = loadEnv(process.env.MODE ?? "production", join(import.meta.dirname, ".."), "");
const api = env.VITE_API_BASE_URL;
const apiOrigin = api && /^https?:\/\//.test(api) ? new URL(api).origin : "";
const extra = (env.CSP_EXTRA_ORIGINS ?? "").trim();

const csp = [
  "default-src 'self'",
  `script-src 'self' ${hashes.join(" ")}`,
  // Radix positions menus and popovers with inline styles; the chart sets bar heights.
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${apiOrigin} ${extra}`,
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
]
  .map((d) => d.replace(/\s+/g, " ").trim())
  .join("; ");

const headers = `/*
  Content-Security-Policy: ${csp}
  Referrer-Policy: same-origin
  Strict-Transport-Security: max-age=63072000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  X-Robots-Tag: noindex, nofollow

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: no-cache
`;

writeFileSync(join(CLIENT, "_headers"), headers);
// SPA fallback: every route is answered by index.html (DD-002).
writeFileSync(join(CLIENT, "_redirects"), "/*  /index.html  200\n");
console.log(`Wrote _headers (${hashes.length} inline script hashes) and _redirects.`);
if (!apiOrigin)
  console.warn("VITE_API_BASE_URL is not an absolute URL: connect-src allows this origin only.");
