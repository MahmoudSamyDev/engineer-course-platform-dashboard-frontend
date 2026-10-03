import { http, HttpResponse } from "msw";
import type { Locale } from "~/domain/types";
import { MOCK_API } from "../config";
import { db, failedAttempts, mockSession, toPublicAdmin } from "../db";
import { apiError, currentAdmin, latency } from "../http";

const LOCK_WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 5;

/** SRS §7.2 — /admin/auth/*. */
export const authHandlers = [
  http.post(`${MOCK_API}/auth/login`, async ({ request }) => {
    await latency();
    const body = (await request.json()) as { email?: string; password?: string };
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const now = Date.now();
    const recent = (failedAttempts.get(email) ?? []).filter((t) => now - t < LOCK_WINDOW_MS);
    if (recent.length >= MAX_ATTEMPTS) {
      return apiError(429, "SIGN_IN_LOCKED", "Too many attempts. Try again in 15 minutes.");
    }

    const admin = db.admins.find((a) => a.email === email && a.password === body.password);
    if (!admin) {
      failedAttempts.set(email, [...recent, now]);
      return apiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    }

    failedAttempts.delete(email);
    admin.lastLoginAt = new Date().toISOString();
    mockSession.set(admin.id);
    return HttpResponse.json({ data: toPublicAdmin(admin) });
  }),

  http.post(`${MOCK_API}/auth/logout`, async () => {
    await latency();
    mockSession.clear();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${MOCK_API}/auth/me`, async () => {
    await latency();
    const admin = currentAdmin();
    if (!admin) return apiError(401, "UNAUTHENTICATED", "Sign in to continue.");
    return HttpResponse.json({ data: toPublicAdmin(admin) });
  }),

  http.patch(`${MOCK_API}/auth/me`, async ({ request }) => {
    await latency();
    const admin = currentAdmin();
    if (!admin) return apiError(401, "UNAUTHENTICATED", "Sign in to continue.");
    const body = (await request.json()) as { locale?: Locale; name?: string };
    if (body.locale === "ar" || body.locale === "en") admin.locale = body.locale;
    if (typeof body.name === "string" && body.name.trim()) admin.name = body.name.trim();
    return HttpResponse.json({ data: toPublicAdmin(admin) });
  }),
];
