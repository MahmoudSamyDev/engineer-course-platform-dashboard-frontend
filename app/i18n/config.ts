import { LOCALES, type Locale } from "~/domain/types";
import ar from "~/messages/ar.json";
import en from "~/messages/en.json";

export const DEFAULT_LOCALE: Locale = "ar";
export const TIME_ZONE = "Africa/Cairo";

export const messages = { ar, en } as const;
export type Messages = typeof en;

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
