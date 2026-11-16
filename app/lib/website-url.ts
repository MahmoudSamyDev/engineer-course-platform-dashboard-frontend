import type { Locale } from "~/domain/types";

/**
 * Public website base (for "View on website", DSH-CRS-06 / DSH-PRO-09): the live site, unless
 * `VITE_WEBSITE_URL` points somewhere else (for example http://localhost:3000 in development).
 */
export const WEBSITE_URL = (
  import.meta.env.VITE_WEBSITE_URL ?? "https://engineer-course-platform-website-fr.vercel.app"
).replace(/\/+$/, "");

export function websiteHomeUrl(locale: Locale): string {
  return `${WEBSITE_URL}/${locale}`;
}

export function websiteCourseUrl(slug: string, locale: Locale): string {
  return `${websiteHomeUrl(locale)}/courses/${slug}`;
}
