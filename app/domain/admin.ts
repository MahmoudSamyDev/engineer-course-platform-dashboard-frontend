/**
 * Dashboard-only domain types (Dashboard SRS §6.2, DR-20…DR-23).
 * Shared entities (courses, sessions, bookings…) live in ./types.ts, copied from the Website.
 */
import type { IsoDateTime, Locale } from "./types";

export type AdminRole = "OWNER" | "ADMIN";

/** DR-20 — a person who can sign in to the Dashboard. */
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  locale: Locale;
  lastLoginAt: IsoDateTime | null;
};

/** Admin API list envelope (SRS §7.2). */
export type ListResponse<T> = {
  data: T[];
  meta: { page: number; pageSize: number; total: number };
};

/** Admin API single-item envelope (SRS §7.2). */
export type ItemResponse<T> = { data: T };

/** Admin API error shape — the same as the Website's public API. */
export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_FAILED"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INVALID_CREDENTIALS"
  | "SIGN_IN_LOCKED"
  | "INTERNAL";

export type ApiError = {
  error: { code: ApiErrorCode; message: string; fields?: Record<string, string> };
};
