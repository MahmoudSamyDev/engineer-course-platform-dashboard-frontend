/**
 * Admin API payloads (Dashboard SRS §7.2). The MSW mock and the real backend return
 * exactly these shapes; RTK Query endpoints are typed with them.
 * Money in piasters, timestamps UTC ISO strings, bilingual text as LocalizedText.
 */
import type {
  BookingStatus,
  CourseLevel,
  CourseStatus,
  IsoDateTime,
  LocalizedList,
  LocalizedText,
  MilestoneType,
  Piasters,
  SessionStatus,
  SocialPlatform,
  TicketStatus,
} from "./types";

// ── Shared fragments ───────────────────────────────────────────────────────

export type PaymentStatus = "INITIATED" | "SUCCEEDED" | "FAILED" | "REFUNDED";
export type PaymentMethod = "CARD" | "WALLET";
export type CoursePublicationState = "DRAFT" | "PUBLISHED" | "ARCHIVED";

/** DSH-ATT-02 — derived per registration. `NONE` = not a paid registration. */
export type AttendanceStatus = "UPCOMING" | "ATTENDED" | "ABSENT" | "COMPLETED" | "NONE";

export type Attendance = { status: AttendanceStatus; attended: number; total: number };

export type StudentRef = {
  id: string;
  fullName: string;
  phoneE164: string;
  email: string;
  department: LocalizedText;
};

export type CourseRef = { id: string; code: string; title: LocalizedText };
export type SessionRef = { id: string; code: string; label: LocalizedText };

export type Page<T> = { items: T[]; total: number; page: number; pageSize: number };

// ── Registrations / students (DSH-STU) ─────────────────────────────────────

export type RegistrationRow = {
  bookingId: string;
  reference: string;
  status: BookingStatus;
  /** Paid time for paid registrations, otherwise creation time. */
  registeredAt: IsoDateTime;
  student: StudentRef;
  course: CourseRef;
  session: SessionRef;
  attendance: Attendance;
  ticketStatus: TicketStatus | null;
};

export type RegistrationFilters = {
  q?: string;
  courseId?: string;
  sessionId?: string;
  bookingStatus?: BookingStatus | "ALL";
  attendance?: Exclude<AttendanceStatus, "NONE">;
  from?: string;
  to?: string;
  sort?: "registeredAt" | "-registeredAt" | "name" | "-name" | "course" | "-course";
  page?: number;
  pageSize?: number;
};

export type MeetingAttendance = {
  meetingId: string;
  order: number;
  startsAt: IsoDateTime;
  endsAt: IsoDateTime;
  checkIn: { id: string; at: IsoDateTime; by: string; source: "SCANNER" | "DASHBOARD" } | null;
};

export type StudentRegistration = RegistrationRow & {
  amount: Piasters;
  location: LocalizedText;
  meetings: MeetingAttendance[];
};

export type StudentDetail = StudentRef & {
  consentAt: IsoDateTime;
  createdAt: IsoDateTime;
  registrations: StudentRegistration[];
  payments: PaymentRow[];
};

// ── Payments (DSH-PAY) ─────────────────────────────────────────────────────

export type PaymentRow = {
  id: string;
  bookingId: string;
  reference: string;
  createdAt: IsoDateTime;
  processedAt: IsoDateTime | null;
  student: Pick<StudentRef, "id" | "fullName" | "phoneE164">;
  course: CourseRef;
  session: SessionRef;
  method: PaymentMethod;
  amount: Piasters;
  refundedAmount: Piasters;
  status: PaymentStatus;
  bookingStatus: BookingStatus;
  providerTransactionId: string | null;
};

export type PaymentFilters = {
  q?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  courseId?: string;
  from?: string;
  to?: string;
  needsAction?: boolean;
  sort?: "createdAt" | "-createdAt" | "amount" | "-amount";
  page?: number;
  pageSize?: number;
};

export type PaymentSummary = { gross: Piasters; refunded: Piasters; net: Piasters; count: number };

export type PaymentTimelineEvent = {
  type: "INITIATED" | "SUCCEEDED" | "FAILED" | "REFUNDED" | "MOVED" | "CANCELLED";
  at: IsoDateTime;
  note?: string;
  by?: string;
};

export type PaymentDetail = PaymentRow & {
  studentEmail: string;
  providerOrderId: string;
  refundTransactionId: string | null;
  refundNote: string | null;
  timeline: PaymentTimelineEvent[];
};

export type RecordRefundInput = {
  paymentId: string;
  amount: Piasters;
  refundTransactionId: string;
  note?: string;
};

// ── Courses & sessions (DSH-CRS, DSH-SES) ──────────────────────────────────

export type NextSessionSummary = {
  id: string;
  code: string;
  startsAt: IsoDateTime;
  sold: number;
  capacity: number;
};

export type CourseCard = {
  id: string;
  slug: string;
  code: string;
  title: LocalizedText;
  coverDiscipline: LocalizedText;
  state: CoursePublicationState;
  status: CourseStatus;
  basePrice: Piasters;
  nextSession: NextSessionSummary | null;
  upcomingSessionsCount: number;
  sortOrder: number;
};

export type CourseCounts = Record<"all" | "published" | "draft" | "archived", number>;

/** DBR-04 — what blocks publishing. */
export type ReadinessIssue =
  | "title"
  | "shortDescription"
  | "about"
  | "outcomes"
  | "modules"
  | "totalHours"
  | "meetingsCount"
  | "basePrice"
  | "coverAlt";

export type CourseModuleInput = {
  title: LocalizedText;
  durationHours?: number;
  topics: LocalizedList;
};

export type FaqInput = { question: LocalizedText; answer: LocalizedText };

export type CourseDetail = {
  id: string;
  slug: string;
  code: string;
  codeLocked: boolean;
  slugLocked: boolean;
  title: LocalizedText;
  shortDescription: LocalizedText;
  about: LocalizedText;
  audience: LocalizedText;
  problemSolved: LocalizedText;
  expectations: LocalizedText;
  outcomes: LocalizedList;
  requirements: LocalizedList;
  whatToBring: LocalizedList;
  modules: CourseModuleInput[];
  faq: FaqInput[];
  level: CourseLevel;
  totalHours: number;
  meetingsCount: number;
  basePrice: Piasters;
  coverDiscipline: LocalizedText;
  coverAlt: LocalizedText;
  state: CoursePublicationState;
  status: CourseStatus;
  isFeatured: boolean;
  isComingSoon: boolean;
  comingSoonNote: LocalizedText;
  registrationClosed: boolean;
  seo: { title: LocalizedText; description: LocalizedText };
  readiness: ReadinessIssue[];
  hasSessions: boolean;
  hasBookings: boolean;
};

export type CreateCourseInput = {
  title: LocalizedText;
  code: string;
  slug: string;
  level: CourseLevel;
  basePrice: Piasters;
  totalHours: number;
  meetingsCount: number;
  shortDescription: LocalizedText;
};

export type UpdateCourseInput = Partial<
  Pick<
    CourseDetail,
    | "title"
    | "slug"
    | "code"
    | "shortDescription"
    | "about"
    | "audience"
    | "problemSolved"
    | "expectations"
    | "outcomes"
    | "requirements"
    | "whatToBring"
    | "level"
    | "totalHours"
    | "meetingsCount"
    | "basePrice"
    | "coverDiscipline"
    | "coverAlt"
    | "isFeatured"
    | "isComingSoon"
    | "comingSoonNote"
    | "registrationClosed"
    | "seo"
  > & { isPublished: boolean }
>;

export type LocationOption = { id: string; name: LocalizedText; shortName: LocalizedText };

export type MeetingDto = { id: string; order: number; startsAt: IsoDateTime; endsAt: IsoDateTime };

export type SessionRow = {
  id: string;
  code: string;
  courseId: string;
  label: LocalizedText;
  location: LocationOption;
  capacity: number;
  sold: number;
  held: number;
  price: Piasters;
  meetings: MeetingDto[];
  registrationClosesAt: IsoDateTime;
  status: SessionStatus;
  isPublished: boolean;
  isClosedManually: boolean;
  hasBookings: boolean;
};

export type RosterEntry = {
  bookingId: string;
  reference: string;
  status: BookingStatus;
  ticketStatus: TicketStatus | null;
  student: StudentRef;
  attendance: Attendance;
  meetings: MeetingAttendance[];
};

export type SessionDetail = SessionRow & {
  course: CourseRef & { basePrice: Piasters };
  roster: RosterEntry[];
};

export type SessionInput = {
  locationId: string;
  label: LocalizedText;
  capacity: number;
  price: Piasters;
  meetings: Array<{ startsAt: IsoDateTime; endsAt: IsoDateTime }>;
  registrationClosesAt: IsoDateTime;
  isPublished: boolean;
};

// ── Overview (DSH-HOME) ────────────────────────────────────────────────────

export type UpcomingSessionSummary = {
  id: string;
  courseId: string;
  code: string;
  course: CourseRef;
  location: LocalizedText;
  startsAt: IsoDateTime;
  sold: number;
  capacity: number;
  status: SessionStatus;
};

export type Overview = {
  kpis: {
    revenueThisMonth: Piasters;
    revenueLastMonth: Piasters;
    paidThisMonth: number;
    paidLastMonth: number;
    seatsSold: number;
    seatsCapacity: number;
    upcomingSessions: number;
  };
  needsAction: {
    refundRequired: number;
    newMessages: number;
    emptySessionsSoon: UpcomingSessionSummary[];
    closingSoon: Array<UpcomingSessionSummary & { closesAt: IsoDateTime }>;
  };
  /** Last 6 Cairo months, oldest first. `month` = "YYYY-MM". */
  revenueByMonth: Array<{ month: string; amount: Piasters }>;
  upcomingSessions: UpcomingSessionSummary[];
  latestPayments: PaymentRow[];
  latestRegistrations: RegistrationRow[];
  hasCourses: boolean;
};

// ── Assistants (DSH-ASS) ───────────────────────────────────────────────────

export type Assistant = {
  id: string;
  fullName: string;
  phoneE164: string;
  email: string | null;
  photoUrl: string | null;
  notes: string | null;
  isActive: boolean;
  appAccess: "NONE" | "INVITED" | "ACTIVE";
  checkInsCount: number;
  createdAt: IsoDateTime;
};

export type AssistantInput = {
  fullName: string;
  phoneE164: string;
  email?: string | null;
  photoUrl?: string | null;
  notes?: string | null;
};

// ── Instructor profile (DSH-PRO) ───────────────────────────────────────────

export type InstructorStatDto = { key: "years" | "students" | "cohorts" | "projects"; value: string; label: LocalizedText };

export type CertificationDto = {
  id: string;
  name: LocalizedText;
  issuer: LocalizedText;
  year: number;
  credentialUrl: string | null;
};

export type MilestoneDto = {
  id: string;
  type: MilestoneType;
  startYear: number;
  endYear: number | null | undefined;
  title: LocalizedText;
  organization: LocalizedText;
  description: LocalizedText;
};

export type InstructorProfile = {
  name: LocalizedText;
  shortName: LocalizedText;
  title: LocalizedText;
  specialization: LocalizedText;
  photoUrl: string;
  photoAlt: LocalizedText;
  positioningStatement: LocalizedText;
  valueProposition: LocalizedText;
  bioShort: LocalizedText;
  bioLong: LocalizedList;
  audience: LocalizedList;
  stats: InstructorStatDto[];
  contact: { phoneE164: string; whatsappE164: string; email: string };
  social: Array<{ platform: SocialPlatform; url: string }>;
  certifications: CertificationDto[];
  journey: MilestoneDto[];
};

export type UpdateInstructorInput = Partial<
  Omit<InstructorProfile, "certifications" | "journey">
>;

// ── Messages (DSH-MSG) ─────────────────────────────────────────────────────

export type MessageStatus = "NEW" | "READ" | "ARCHIVED";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phoneE164: string | null;
  subject: "COURSE_INQUIRY" | "BOOKING_HELP" | "CORPORATE" | "OTHER";
  message: string;
  courseTitle: LocalizedText | null;
  status: MessageStatus;
  createdAt: IsoDateTime;
};

export type NavCounts = { refundRequired: number; newMessages: number };
