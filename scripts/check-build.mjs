// Production build checks, against build/client served locally in Chromium:
// - Bundle budget (DNFR-PERF-01): JS loaded for /login ≤ 200 KB gzip, and no other page's
//   route chunk loads with it (route splitting).
// - Security headers (DNFR-SEC-06): the generated `_headers` are applied; the sign-in page must
//   render with no CSP violation.
// Usage: `pnpm build && pnpm check:build`.
import { chromium } from "@playwright/test";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = join(import.meta.dirname, "..", "build", "client");
const BUDGET_KB = 200;
const PAGE_CHUNKS =
  /\/(home|students|student|payments|courses|course|session|assistants|messages|profile)-[\w-]+\.js$/;
const TYPES = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".json": "application/json",
};

if (!existsSync(join(ROOT, "index.html"))) {
  console.error("No build found. Run `pnpm build` first.");
  process.exit(1);
}

// The "/*" block of build/client/_headers (scripts/write-headers.mjs), applied to every response.
const headerFile = join(ROOT, "_headers");
const securityHeaders = {};
if (existsSync(headerFile)) {
  const block = readFileSync(headerFile, "utf8").split(/\n\s*\n/)[0];
  for (const line of block.split("\n").slice(1)) {
    const at = line.indexOf(":");
    if (at > 0) securityHeaders[line.slice(0, at).trim()] = line.slice(at + 1).trim();
  }
} else {
  console.error("No build/client/_headers. Run `pnpm build` (it writes them).");
  process.exit(1);
}

// Static server with the SPA fallback a host would use.
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(
    /^(\.\.[/\\])+/,
    "",
  );
  let file = join(ROOT, path);
  if (!file.startsWith(ROOT) || !existsSync(file) || statSync(file).isDirectory()) {
    if (path.startsWith("/api/")) return res.writeHead(503).end();
    file = join(ROOT, "index.html");
  }
  res.writeHead(200, {
    ...securityHeaders,
    "Content-Type": TYPES[extname(file)] ?? "application/octet-stream",
  });
  createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, resolve));
const origin = `http://localhost:${server.address().port}`;

const browser = await chromium.launch(
  process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
);
const page = await browser.newPage();
const scripts = new Set();
page.on("request", (r) => {
  const url = new URL(r.url());
  if (url.origin === origin && url.pathname.endsWith(".js")) scripts.add(url.pathname);
});
const cspViolations = [];
page.on(
  "console",
  (m) => /Content Security Policy/i.test(m.text()) && cspViolations.push(m.text()),
);
await page.goto(`${origin}/login`);
await page.waitForLoadState("networkidle");
const rendered = await page.locator("h1").count();
await browser.close();
server.close();

let total = 0;
const rows = [...scripts].map((path) => {
  const gz = gzipSync(readFileSync(join(ROOT, path)), { level: 9 }).length;
  total += gz;
  return { path, kb: gz / 1024 };
});
rows.sort((a, b) => b.kb - a.kb);
for (const { path, kb } of rows.slice(0, process.env.ALL ? 99 : 8))
  console.log(`${kb.toFixed(1).padStart(7)} KB  ${path}`);
const totalKb = total / 1024;
console.log(
  `${totalKb.toFixed(1).padStart(7)} KB  total gzip for /login (${rows.length} files, budget ${BUDGET_KB} KB)`,
);

const leaked = rows.filter((r) => PAGE_CHUNKS.test(r.path)).map((r) => r.path);
if (leaked.length) console.error(`Other pages' chunks loaded on /login: ${leaked.join(", ")}`);
if (cspViolations.length) console.error(`CSP violations:\n${cspViolations.join("\n")}`);
if (!rendered) console.error("The sign-in page did not render (no h1) with the security headers.");
if (totalKb > BUDGET_KB || leaked.length || cspViolations.length || !rendered) process.exit(1);
console.log("Bundle budget OK. Security headers OK (no CSP violations, page rendered).");
