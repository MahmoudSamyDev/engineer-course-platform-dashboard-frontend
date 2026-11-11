import { BUSINESS_TIMEZONE } from "~/domain/constants";
import type { Locale, Piasters } from "~/domain/types";

/**
 * Formatting in Cairo time with Latin digits in both languages (SRS DSH-GEN-09, Website Q-12).
 * English dates use day-month order ("Sat 17 Oct 2026") to avoid ambiguity.
 * Mirrors the Website's src/lib/format.ts so both apps show the same values the same way.
 */
const DATE_LOCALE: Record<Locale, string> = { ar: "ar-EG-u-nu-latn", en: "en-GB" };
const TIME_LOCALE: Record<Locale, string> = { ar: "ar-EG-u-nu-latn", en: "en-US" };

export function formatDate(iso: string, locale: Locale, withYear = false): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    timeZone: BUSINESS_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(new Date(iso));
}

/** "20 Nov" / "20 نوفمبر": day and month only, for tight cells (course card stats). */
export function formatDayMonth(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    timeZone: BUSINESS_TIMEZONE,
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string, locale: Locale): string {
  return `${formatDate(iso, locale, true)}, ${formatTime(iso, locale)}`;
}

export function formatTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(TIME_LOCALE[locale], {
    timeZone: BUSINESS_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Amount without currency, e.g. "3,200" (piasters → EGP). */
export function formatAmount(amount: Piasters): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount / 100);
}

/** e.g. "3,200 EGP" / "3,200 ج.م" — the currency label comes from the messages. */
export function formatPrice(amount: Piasters, currencyLabel: string): string {
  return `${formatAmount(amount)} ${currencyLabel}`;
}

/** Initials for avatars: "Karim Mostafa" → "KM", "كريم مصطفى" → "كم". */
export function initials(name: string): string {
  const words = name
    .replace(/^(Eng\.|م\.)\s*/u, "")
    .trim()
    .split(/\s+/u)
    .filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase();
}

/** Compact table timestamp: "2 Oct, 11:41 PM" — the year only when it isn't the current one. */
export function formatShortDateTime(iso: string, locale: Locale, now: Date = new Date()): string {
  const date = new Date(iso);
  const sameYear =
    new Intl.DateTimeFormat("en", { timeZone: BUSINESS_TIMEZONE, year: "numeric" }).format(date) ===
    new Intl.DateTimeFormat("en", { timeZone: BUSINESS_TIMEZONE, year: "numeric" }).format(now);
  const day = new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    timeZone: BUSINESS_TIMEZONE,
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(date);
  return `${day}${locale === "ar" ? "، " : ", "}${formatTime(iso, locale)}`;
}
