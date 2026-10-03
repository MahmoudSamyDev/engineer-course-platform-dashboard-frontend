import type { Locale } from "~/domain/types";

/** Public website base (for "View on website", DSH-CRS-06 / DSH-PRO-09). */
export const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL ?? "http://localhost:3000";

export function websiteCourseUrl(slug: string, locale: Locale): string {
  return `${WEBSITE_URL}/${locale}/courses/${slug}`;
}
