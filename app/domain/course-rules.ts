import type { CourseDetail, ReadinessIssue } from "./api";
import type { LocalizedList, LocalizedText } from "./types";

const filled = (text: LocalizedText | undefined) => Boolean(text?.ar.trim() && text?.en.trim());
const listFilled = (list: LocalizedList, min: number) =>
  list.ar.filter((s) => s.trim()).length >= min && list.en.filter((s) => s.trim()).length >= min;

export const MIN_OUTCOMES = 3;

/** DBR-04 — what still blocks publishing, in the order the Publishing tab lists it. */
export function readinessIssues(
  course: Pick<
    CourseDetail,
    | "title"
    | "shortDescription"
    | "about"
    | "outcomes"
    | "modules"
    | "totalHours"
    | "meetingsCount"
    | "basePrice"
    | "coverAlt"
  >,
): ReadinessIssue[] {
  const issues: ReadinessIssue[] = [];
  if (!filled(course.title)) issues.push("title");
  if (!filled(course.shortDescription)) issues.push("shortDescription");
  if (!filled(course.about)) issues.push("about");
  if (!listFilled(course.outcomes, MIN_OUTCOMES)) issues.push("outcomes");
  if (course.modules.length === 0 || !course.modules.every((m) => filled(m.title))) issues.push("modules");
  if (!(course.totalHours > 0)) issues.push("totalHours");
  if (!(course.meetingsCount > 0)) issues.push("meetingsCount");
  if (!(course.basePrice > 0)) issues.push("basePrice");
  if (!filled(course.coverAlt)) issues.push("coverAlt");
  return issues;
}

/** DBR-02 — 3 uppercase Latin letters. */
export const COURSE_CODE_PATTERN = /^[A-Z]{3}$/;

/** DBR-03 — lowercase a-z, 0-9 and single hyphens. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Slug suggestion from the English title (DSH-CRS-03). */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}
