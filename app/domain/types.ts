/**
 * Domain types — mirror SRS §6 (DR-01…DR-19).
 * Bilingual fields use LocalizedText; money is in piasters (1 EGP = 100); timestamps are ISO-8601 UTC strings.
 */

export const LOCALES = ["ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export type LocalizedText = Record<Locale, string>;
export type LocalizedList = Record<Locale, string[]>;

/** Integer amount in piasters (1 EGP = 100 piasters). */
export type Piasters = number;
/** ISO-8601 timestamp in UTC, e.g. "2026-10-17T07:00:00.000Z". */
export type IsoDateTime = string;

// ── Instructor (DR-01…DR-04) ───────────────────────────────────────────────

export type InstructorStat = {
  key: "years" | "students" | "cohorts" | "projects";
  value: string;
  label: LocalizedText;
};

export type SocialPlatform = "linkedin" | "facebook" | "youtube" | "instagram";

export type Instructor = {
  slug: string;
  name: LocalizedText;
  shortName: LocalizedText;
  title: LocalizedText;
  specialization: LocalizedText;
  positioningStatement: LocalizedText;
  valueProposition: LocalizedText;
  bioShort: LocalizedText;
  bioLong: LocalizedList;
  audience: LocalizedList;
  photo: Media;
  stats: InstructorStat[];
};

export type Certification = {
  id: string;
  name: LocalizedText;
  issuer: LocalizedText;
  year: number;
  image?: string;
};

export type MilestoneType = "EDUCATION" | "ENGINEERING" | "TEACHING" | "MILESTONE";

export type JourneyMilestone = {
  id: string;
  type: MilestoneType;
  startYear: number;
  /** `null` = ongoing ("present"); `undefined` = a single point in time. */
  endYear?: number | null;
  title: LocalizedText;
  organization: LocalizedText;
  description: LocalizedText;
};

export type DifferentiatorIcon =
  "building" | "clipboard-check" | "book-open" | "users" | "hard-hat" | "message-circle";

export type Differentiator = {
  icon: DifferentiatorIcon;
  title: LocalizedText;
  description: LocalizedText;
};

export type Media = {
  src: string;
  alt: LocalizedText;
  width: number;
  height: number;
  /** Attribution for placeholder or licensed media. */
  credit?: { author: string; source: string; url: string; license: string };
  isPlaceholder: boolean;
};

// ── Courses (DR-05…DR-10) ──────────────────────────────────────────────────

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type CourseModule = {
  order: number;
  title: LocalizedText;
  durationHours?: number;
  topics?: LocalizedList;
};

export type FaqItem = {
  question: LocalizedText;
  answer: LocalizedText;
};

export type Course = {
  id: string;
  slug: string;
  code: string;
  title: LocalizedText;
  shortDescription: LocalizedText;
  about: LocalizedText;
  audience: LocalizedText;
  problemSolved: LocalizedText;
  expectations: LocalizedText;
  outcomes: LocalizedList;
  modules: CourseModule[];
  requirements: LocalizedList;
  whatToBring: LocalizedList;
  faq: FaqItem[];
  certificationIds: string[];
  level: CourseLevel;
  language: LocalizedText;
  totalHours: number;
  meetingsCount: number;
  basePrice: Piasters;
  coverDiscipline: LocalizedText;
  isPublished: boolean;
  isFeatured: boolean;
  isComingSoon: boolean;
  registrationClosed: boolean;
  comingSoonNote?: LocalizedText;
  sortOrder: number;
};

export type Location = {
  id: string;
  name: LocalizedText;
  shortName: LocalizedText;
  address: LocalizedText;
  city: LocalizedText;
  mapUrl: string;
  arrivalInstructions: LocalizedText;
};

export type Meeting = {
  order: number;
  startsAt: IsoDateTime;
  endsAt: IsoDateTime;
};

export type Session = {
  id: string;
  code: string;
  courseId: string;
  locationId: string;
  label: LocalizedText;
  capacity: number;
  /** Price for this session; defaults to the course base price. */
  price: Piasters;
  meetings: Meeting[];
  registrationClosesAt: IsoDateTime;
  isPublished: boolean;
  isClosedManually: boolean;
  /** Paid bookings (placeholder data layer: aggregate count). */
  paidCount: number;
  /** Seat holds currently active (BR-08). */
  activeHolds: number;
};

// ── Status (BR-12, BR-13) ──────────────────────────────────────────────────

export type SessionStatus = "AVAILABLE" | "ALMOST_FULL" | "FULLY_BOOKED" | "CLOSED";
export type CourseStatus = "AVAILABLE" | "ALMOST_FULL" | "FULLY_BOOKED" | "COMING_SOON" | "CLOSED";

export type SessionAvailability = {
  status: SessionStatus;
  remainingSeats: number;
  /** Exact number shown only when low (BR-14); otherwise `null` → "Seats available". */
  displaySeats: number | null;
  isBookable: boolean;
};

// ── Booking & tickets (DR-12…DR-16) — used from Phase 7 onward ─────────────

export type BookingStatus =
  "PENDING_PAYMENT" | "PAID" | "EXPIRED" | "CANCELLED" | "REFUND_REQUIRED" | "REFUNDED";

export type TicketStatus = "VALID" | "CHECKED_IN" | "USED" | "EXPIRED" | "CANCELLED";

export type Department = {
  code: string;
  name: LocalizedText;
  isOther: boolean;
};

// ── Site settings (DR-18) ──────────────────────────────────────────────────

export type SiteSettings = {
  brandName: LocalizedText;
  tagline: LocalizedText;
  footerDescription: LocalizedText;
  domain: string;
  bookingReferencePrefix: string;
  phoneDisplay: string;
  phoneE164: string;
  whatsappUrl: string;
  email: string;
  workingHours: LocalizedText;
  social: { platform: SocialPlatform; url: string }[];
};
