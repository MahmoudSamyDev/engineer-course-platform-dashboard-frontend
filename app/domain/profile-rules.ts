import type { LocalizedText, SocialPlatform } from "./types";

/**
 * Instructor profile rules (SRS DSH-PRO-02…07, DBR-16/17). Character limits are guidance
 * matching the Website layout (hero, about section, cards); they leave room above the
 * current placeholder content.
 */
export const PROFILE_LIMITS = {
  name: 60,
  shortName: 40,
  title: 80,
  specialization: 100,
  photoAlt: 120,
  positioningStatement: 120,
  valueProposition: 240,
  bioShort: 320,
  bioParagraph: 600,
  audienceItem: 80,
  statValue: 10,
  statLabel: 30,
  certificationName: 100,
  certificationIssuer: 80,
  milestoneTitle: 90,
  milestoneOrganization: 80,
  milestoneDescription: 240,
} as const;

/** Oldest year a certification or milestone can have (sanity bound for typing mistakes). */
export const EARLIEST_YEAR = 1950;

export const SOCIAL_PLATFORMS: SocialPlatform[] = ["linkedin", "facebook", "youtube", "instagram"];

const SOCIAL_HOSTS: Record<SocialPlatform, string[]> = {
  linkedin: ["linkedin.com"],
  facebook: ["facebook.com", "fb.com"],
  youtube: ["youtube.com", "youtu.be"],
  instagram: ["instagram.com"],
};

/** DSH-PRO-03 — an https link on the platform's own domain (www. and subdomains allowed). */
export function isValidSocialUrl(platform: SocialPlatform, value: string): boolean {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  return SOCIAL_HOSTS[platform].some((domain) => host === domain || host.endsWith(`.${domain}`));
}

/** An optional public link (credential URL): empty, or an https URL. */
export function isOptionalHttpsUrl(value: string | null | undefined): boolean {
  if (!value?.trim()) return true;
  try {
    return new URL(value.trim()).protocol === "https:";
  } catch {
    return false;
  }
}

export const filledBoth = (text: LocalizedText | undefined) =>
  Boolean(text?.ar.trim() && text?.en.trim());

export type MilestoneEnd = "range" | "present" | "single";

/** The journey's `endYear` encodes three cases: a number, `null` (present) or absent (single year). */
export function milestoneEnd(endYear: number | null | undefined): MilestoneEnd {
  if (endYear === null) return "present";
  if (endYear === undefined) return "single";
  return "range";
}

export type YearProblem = "startYear" | "endYear" | "endBeforeStart" | null;

/** DSH-PRO-07 — years are whole, not in the future, and the end is not before the start. */
export function checkYears(
  startYear: number,
  endYear: number | null | undefined,
  currentYear: number,
): YearProblem {
  const valid = (y: number) => Number.isInteger(y) && y >= EARLIEST_YEAR && y <= currentYear;
  if (!valid(startYear)) return "startYear";
  if (typeof endYear === "number") {
    if (!valid(endYear)) return "endYear";
    if (endYear < startYear) return "endBeforeStart";
  }
  return null;
}
