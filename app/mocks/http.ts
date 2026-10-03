import { delay, HttpResponse } from "msw";
import type { ApiErrorCode } from "~/domain/admin";
import { db, mockSession } from "./db";

/** Realistic latency so loading states are visible (SRS DMK-03). Off in tests. */
export async function latency(): Promise<void> {
  if (import.meta.env.MODE === "test") return;
  await delay(150 + Math.round(Math.random() * 250));
}

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  fields?: Record<string, string>,
) {
  return HttpResponse.json({ error: { code, message, ...(fields ? { fields } : {}) } }, { status });
}

/** The signed-in mock admin, or null. */
export function currentAdmin() {
  const id = mockSession.get();
  return id ? (db.admins.find((admin) => admin.id === id && admin) ?? null) : null;
}

/** `?mockError=500` on the page URL forces API errors, to review error states (DMK-03). */
export function forcedError() {
  if (typeof window === "undefined") return null;
  const status = Number(new URLSearchParams(window.location.search).get("mockError"));
  return status >= 400 ? apiError(status, "INTERNAL", "Forced mock error") : null;
}
