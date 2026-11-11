import { LOCALES, type Locale } from "~/domain/types";
import ar from "~/messages/ar.json";
// Type only: erased from the bundle, so English still loads lazily (loadMessages).
import type en from "~/messages/en.json";

export const DEFAULT_LOCALE: Locale = "ar";
export const TIME_ZONE = "Africa/Cairo";

export type Messages = typeof en;

/**
 * Arabic (the default) ships with the app; English loads as its own chunk the first time
 * it's needed, so the sign-in page doesn't carry both languages (DNFR-PERF-01, DD-053).
 */
const loaded: Partial<Record<Locale, Messages>> = { ar: ar as Messages };

export function loadedMessages(locale: Locale): Messages | undefined {
  return loaded[locale];
}

export async function loadMessages(locale: Locale): Promise<Messages> {
  if (!loaded[locale]) loaded[locale] = (await import("~/messages/en.json")).default as Messages;
  return loaded[locale];
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function directionOf(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Browser-only convenience: the language chosen before signing in (DSH-GEN-02). */
const STORAGE_KEY = "dashboard.locale";

export function readStoredLocale(): Locale | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

export function storeLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Storage can be blocked (private mode); the choice then lasts for this visit only.
  }
}
