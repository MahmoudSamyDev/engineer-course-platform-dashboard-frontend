/** Business constants (SRS BR-07, BR-08, BR-12, BR-14). Configurable later through SiteSettings. */

export const BUSINESS_TIMEZONE = "Africa/Cairo";
export const CURRENCY = "EGP";

/** BR-08: a seat is held for this long while the student pays. */
export const HOLD_MINUTES = 15;

/** BR-07: registration closes this many hours before the first meeting. */
export const REGISTRATION_CUTOFF_HOURS = 24;

/** BR-12: a session is "almost full" when remaining seats ≤ max(minimum, ratio × capacity). */
export const ALMOST_FULL_MIN_SEATS = 3;
export const ALMOST_FULL_RATIO = 0.2;

/** BR-14: the exact remaining-seat count is shown only at or below this number. */
export const SHOW_EXACT_SEATS_AT_OR_BELOW = 10;

/** Max number of courses shown in the Home "courses" section (FR-HOME-06). */
export const HOME_FEATURED_COURSES = 3;

/** DSH-AUTH-08: minimum length of a new Dashboard password. */
export const MIN_PASSWORD_LENGTH = 10;
