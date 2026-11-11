/**
 * ⚠️ MOCK DATABASE — development and tests only (SRS §7.4).
 * In-memory records shaped like the shared Prisma model (Website DR-01…DR-19 + Dashboard DR-20…23).
 * Seeded from the Website placeholder data (instructor, courses, sessions, locations) plus
 * generated students, bookings, payments, check-ins, assistants and messages (seeded RNG).
 */
import type { AdminUser } from "~/domain/admin";
import type {
  CertificationDto,
  ContactMessage,
  InstructorProfile,
  MeetingDto,
  MilestoneDto,
  PaymentMethod,
  PaymentStatus,
  PaymentTimelineEvent,
} from "~/domain/api";
import { cairoMonthKey, lastMonthKeys } from "~/domain/months";
import { defaultRegistrationClose, nextSessionCode } from "~/domain/session-rules";
import type { BookingStatus, Course, LocalizedText } from "~/domain/types";
import { appNow } from "~/lib/clock";
import { zonedLocalToUtcIso } from "~/lib/time";
import { EMAIL_DOMAINS, FIRST_NAMES, LAST_NAMES, MOBILE_PREFIXES } from "./people";
import { bookingReference, createRandom, type Random } from "./random";
import { courses as seedCourses } from "./seed/courses";
import {
  certifications as seedCerts,
  instructor as seedInstructor,
  journey as seedJourney,
} from "./seed/instructor";
import { departments as seedDepartments, locations as seedLocations } from "./seed/locations";
import { sessions as seedSessions } from "./seed/sessions";

// ── Record types ───────────────────────────────────────────────────────────

type MockAdmin = AdminUser & { password: string };

export type MockCourse = Omit<Course, "comingSoonNote"> & {
  comingSoonNote: LocalizedText;
  coverAlt: LocalizedText;
  seo: { title: LocalizedText; description: LocalizedText };
  archivedAt: string | null;
  createdAt: string;
};

export type MockSession = {
  id: string;
  code: string;
  courseId: string;
  locationId: string;
  label: LocalizedText;
  capacity: number;
  price: number;
  meetings: MeetingDto[];
  registrationClosesAt: string;
  isPublished: boolean;
  isClosedManually: boolean;
  createdAt: string;
};

export type MockStudent = {
  id: string;
  fullName: string;
  email: string;
  phoneE164: string;
  departmentCode: string;
  consentAt: string;
  createdAt: string;
};

export type MockBooking = {
  id: string;
  reference: string;
  sessionId: string;
  studentId: string;
  status: BookingStatus;
  amount: number;
  createdAt: string;
  paidAt: string | null;
  holdExpiresAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  movedFromSessionId: string | null;
};

export type MockPayment = {
  id: string;
  bookingId: string;
  method: PaymentMethod;
  amount: number;
  refundedAmount: number;
  status: PaymentStatus;
  createdAt: string;
  processedAt: string | null;
  providerOrderId: string;
  providerTransactionId: string | null;
  refundTransactionId: string | null;
  refundNote: string | null;
  timeline: PaymentTimelineEvent[];
};

export type MockCheckIn = {
  id: string;
  bookingId: string;
  meetingId: string;
  at: string;
  /** Display name of whoever checked the student in. */
  by: string;
  /** Set when an assistant scanned the ticket; counts survive a rename (DBR-14). */
  assistantId?: string;
  source: "SCANNER" | "DASHBOARD";
};

export type MockAssistant = {
  id: string;
  fullName: string;
  phoneE164: string;
  email: string | null;
  photoUrl: string | null;
  notes: string | null;
  isActive: boolean;
  appAccess: "NONE" | "INVITED" | "ACTIVE";
  createdAt: string;
};

// ── Clock ──────────────────────────────────────────────────────────────────

/** Mock "now" — the same clock as the UI (`VITE_MOCK_NOW` can pin it in development). */
export const mockNow = appNow;

/** DMK-04 — mock-only credentials, documented in MOCK_CREDENTIALS.md. Never used by the real API. */
export const MOCK_PASSWORD = "dashboard-demo";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const iso = (ms: number) => new Date(ms).toISOString();

// ── Generation ─────────────────────────────────────────────────────────────

function createDb(now: Date) {
  const random = createRandom(20261003);
  const nowMs = now.getTime();

  const admins: MockAdmin[] = [
    {
      id: "adm_owner",
      name: "Karim Mostafa",
      email: "owner@example.com",
      role: "OWNER",
      locale: "ar",
      lastLoginAt: null,
      password: MOCK_PASSWORD,
    },
    {
      id: "adm_admin",
      name: "Mahmoud Samy",
      email: "admin@example.com",
      role: "ADMIN",
      locale: "ar",
      lastLoginAt: null,
      password: MOCK_PASSWORD,
    },
  ];

  const courses: MockCourse[] = seedCourses.map((course) => ({
    ...structuredClone(course),
    comingSoonNote: course.comingSoonNote ?? { ar: "", en: "" },
    coverAlt: structuredClone(course.title),
    seo: {
      title: structuredClone(course.title),
      description: structuredClone(course.shortDescription),
    },
    archivedAt: null,
    createdAt: iso(nowMs - 200 * DAY),
  }));

  const sessions: MockSession[] = seedSessions.map((s) => ({
    id: s.id,
    code: s.code,
    courseId: s.courseId,
    locationId: s.locationId,
    label: structuredClone(s.label),
    capacity: s.capacity,
    price: s.price,
    meetings: s.meetings.map((m) => ({ id: `${s.code}-M${m.order}`, ...m })),
    registrationClosesAt: s.registrationClosesAt,
    isPublished: s.isPublished,
    isClosedManually: s.isClosedManually,
    createdAt: iso(nowMs - 40 * DAY),
  }));
  const seedPaid = new Map(seedSessions.map((s) => [s.id, s.paidCount]));
  const seedHolds = new Map(seedSessions.map((s) => [s.id, s.activeHolds]));

  // Past cohorts for the five months before the current one, so revenue and attendance have history.
  const pastMonths = lastMonthKeys(now, 6).slice(0, 5);
  const runningCourses = courses.filter((c) => !c.isComingSoon);
  for (const month of pastMonths) {
    const [y, m] = month.split("-").map(Number) as [number, number];
    runningCourses.forEach((course, index) => {
      if (!random.chance(0.75)) return;
      const evening = random.chance(0.5);
      const [from, to] = evening ? ["18:00", "21:00"] : ["10:00", "14:00"];
      const firstDay = 2 + index * 2 + random.int(0, 2);
      const meetings: MeetingDto[] = Array.from({ length: course.meetingsCount }, (_, i) => {
        const date = new Date(Date.UTC(y, m - 1, firstDay + i * 7)).toISOString().slice(0, 10);
        return {
          id: "",
          order: i + 1,
          startsAt: zonedLocalToUtcIso(`${date}T${from}`),
          endsAt: zonedLocalToUtcIso(`${date}T${to}`),
        };
      });
      if (Date.parse(meetings[0]!.startsAt) >= nowMs) return;
      const code = nextSessionCode(
        course.code,
        meetings[0]!.startsAt,
        sessions.map((s) => s.code),
      );
      meetings.forEach((meeting) => (meeting.id = `${code}-M${meeting.order}`));
      const capacity = random.pick([24, 25, 30]);
      sessions.push({
        id: code,
        code,
        courseId: course.id,
        locationId: random.pick(seedLocations).id,
        label: evening
          ? { en: "Evening cohort", ar: "دفعة مسائية" }
          : { en: "Weekend cohort", ar: "دفعة نهاية الأسبوع" },
        capacity,
        price: course.basePrice,
        meetings,
        registrationClosesAt: defaultRegistrationClose(meetings[0]!.startsAt),
        isPublished: true,
        isClosedManually: false,
        createdAt: iso(Date.parse(meetings[0]!.startsAt) - 45 * DAY),
      });
      seedPaid.set(code, Math.round(capacity * (0.65 + random.next() * 0.35)));
    });
  }

  const students: MockStudent[] = [];
  const bookings: MockBooking[] = [];
  const payments: MockPayment[] = [];
  const checkIns: MockCheckIn[] = [];

  const newStudent = (createdAt: string): MockStudent => {
    const [firstAr, firstEn] = random.pick(FIRST_NAMES);
    const [lastAr, lastEn] = random.pick(LAST_NAMES);
    const [lastAr2, lastEn2] = random.pick(LAST_NAMES);
    const arabic = random.chance(0.65);
    const student: MockStudent = {
      id: `stu_${String(students.length + 1).padStart(4, "0")}`,
      fullName: arabic ? `${firstAr} ${lastAr} ${lastAr2}` : `${firstEn} ${lastEn} ${lastEn2}`,
      email: `${firstEn}.${lastEn}${random.int(1, 99)}@${random.pick(EMAIL_DOMAINS)}`.toLowerCase(),
      phoneE164: `+20${random.pick(MOBILE_PREFIXES)}${String(random.int(10_000_000, 99_999_999))}`,
      departmentCode: random.chance(0.7) ? "CIVIL" : random.pick(seedDepartments).code,
      consentAt: createdAt,
      createdAt,
    };
    students.push(student);
    return student;
  };
  const studentFor = (createdAt: string) =>
    students.length > 20 && random.chance(0.18) ? random.pick(students) : newStudent(createdAt);

  const addBooking = (
    session: MockSession,
    status: BookingStatus,
    createdMs: number,
    paymentStatus: PaymentStatus | null,
  ): MockBooking => {
    const createdAt = iso(createdMs);
    const student = studentFor(createdAt);
    const paid = paymentStatus === "SUCCEEDED";
    const processedMs = createdMs + random.int(2, 9) * 60_000;
    const booking: MockBooking = {
      id: `bkg_${String(bookings.length + 1).padStart(5, "0")}`,
      reference: bookingReference(random, cairoMonthKey(createdAt).replace("-", "").slice(2)),
      sessionId: session.id,
      studentId: student.id,
      status,
      amount: session.price,
      createdAt,
      paidAt: paid ? iso(processedMs) : null,
      holdExpiresAt: status === "PENDING_PAYMENT" ? iso(nowMs + random.int(4, 14) * 60_000) : null,
      cancelledAt: null,
      cancelReason: null,
      movedFromSessionId: null,
    };
    bookings.push(booking);
    if (paymentStatus) {
      const timeline: PaymentTimelineEvent[] = [{ type: "INITIATED", at: createdAt }];
      if (paymentStatus === "SUCCEEDED" || paymentStatus === "FAILED") {
        timeline.push({ type: paymentStatus, at: iso(processedMs) });
      }
      payments.push({
        id: `pay_${String(payments.length + 1).padStart(5, "0")}`,
        bookingId: booking.id,
        method: random.chance(0.4) ? "WALLET" : "CARD",
        amount: booking.amount,
        refundedAmount: 0,
        status: paymentStatus,
        createdAt,
        processedAt: paymentStatus === "INITIATED" ? null : iso(processedMs),
        providerOrderId: String(random.int(180_000_000, 189_999_999)),
        providerTransactionId:
          paymentStatus === "SUCCEEDED" ? String(random.int(250_000_000, 259_999_999)) : null,
        refundTransactionId: null,
        refundNote: null,
        timeline,
      });
    }
    return booking;
  };

  // Paid registrations per session, booked in the weeks before the first meeting.
  const bookingTime = (session: MockSession) => {
    const first = Date.parse(session.meetings[0]!.startsAt);
    const latest = Math.min(first - 2 * HOUR, nowMs - HOUR);
    return latest - random.int(1, 26) * DAY * random.next() - random.int(0, 20) * HOUR;
  };
  for (const session of sessions) {
    const paid = seedPaid.get(session.id) ?? 0;
    for (let i = 0; i < paid; i++) addBooking(session, "PAID", bookingTime(session), "SUCCEEDED");
    for (let i = 0; i < (seedHolds.get(session.id) ?? 0); i++) {
      addBooking(session, "PENDING_PAYMENT", nowMs - random.int(1, 9) * 60_000, "INITIATED");
    }
  }

  const upcoming = sessions.filter((s) => Date.parse(s.meetings[0]!.startsAt) > nowMs);
  const past = sessions.filter((s) => Date.parse(s.meetings[0]!.startsAt) <= nowMs);
  const fullest = [...upcoming].sort(
    (a, b) => (seedPaid.get(b.id) ?? 0) / b.capacity - (seedPaid.get(a.id) ?? 0) / a.capacity,
  )[0];

  // Website BR-09: late payments on a full session → refund required.
  if (fullest) {
    for (let i = 0; i < 2; i++)
      addBooking(fullest, "REFUND_REQUIRED", nowMs - random.int(5, 60) * HOUR, "SUCCEEDED");
  }
  // Abandoned / declined checkouts.
  for (let i = 0; i < 14; i++) {
    const session = random.pick(sessions);
    addBooking(session, "EXPIRED", bookingTime(session), "FAILED");
  }
  // Refunds recorded in the past, and two cancellations.
  const paidPast = bookings.filter(
    (b) => b.status === "PAID" && past.some((s) => s.id === b.sessionId),
  );
  for (let i = 0; i < 3 && paidPast.length; i++) {
    const booking = paidPast.splice(random.int(0, paidPast.length - 1), 1)[0]!;
    const payment = payments.find((p) => p.bookingId === booking.id)!;
    const refundedAt = iso(Date.parse(booking.paidAt!) + random.int(1, 4) * DAY);
    booking.status = "REFUNDED";
    payment.status = "REFUNDED";
    payment.refundedAmount = payment.amount;
    payment.refundTransactionId = String(random.int(260_000_000, 269_999_999));
    payment.refundNote = "Student couldn't attend (work schedule).";
    payment.timeline.push({
      type: "REFUNDED",
      at: refundedAt,
      by: "Mahmoud Samy",
      note: payment.refundNote,
    });
  }
  const paidUpcoming = bookings.filter(
    (b) => b.status === "PAID" && upcoming.some((s) => s.id === b.sessionId),
  );
  for (const pool of [paidPast, paidUpcoming]) {
    if (!pool.length) continue;
    const booking = pool[random.int(0, pool.length - 1)]!;
    booking.status = "CANCELLED";
    booking.cancelledAt = iso(Math.min(nowMs - 2 * DAY, Date.parse(booking.paidAt!) + 2 * DAY));
    booking.cancelReason = "Withdrew before the course; refund pending in Paymob.";
    payments
      .find((p) => p.bookingId === booking.id)!
      .timeline.push({
        type: "CANCELLED",
        at: booking.cancelledAt,
        by: "Karim Mostafa",
        note: booking.cancelReason,
      });
  }

  const assistants: MockAssistant[] = [
    {
      id: "ast_01",
      fullName: "هاني عادل",
      phoneE164: "+201001234567",
      email: "hany.adel@example.com",
      photoUrl: null,
      notes: "Main entrance, Nasr City branch.",
      isActive: true,
      appAccess: "NONE",
      createdAt: iso(nowMs - 150 * DAY),
    },
    {
      id: "ast_02",
      fullName: "Mona Samir",
      phoneE164: "+201112345678",
      email: null,
      photoUrl: null,
      notes: "Weekend sessions.",
      isActive: true,
      appAccess: "NONE",
      createdAt: iso(nowMs - 120 * DAY),
    },
    {
      id: "ast_03",
      fullName: "أشرف كمال",
      phoneE164: "+201223456789",
      email: null,
      photoUrl: null,
      notes: null,
      isActive: false,
      appAccess: "NONE",
      createdAt: iso(nowMs - 190 * DAY),
    },
  ];

  const scannedBy = (assistant: MockAssistant) => ({
    by: assistant.fullName,
    assistantId: assistant.id,
  });

  // Attendance for meetings that already started (85% show-up), recorded by the assistants.
  for (const booking of bookings) {
    if (booking.status !== "PAID" && booking.status !== "CANCELLED") continue;
    const session = sessions.find((s) => s.id === booking.sessionId)!;
    for (const meeting of session.meetings) {
      const start = Date.parse(meeting.startsAt);
      if (start > nowMs || booking.status === "CANCELLED" || !random.chance(0.86)) continue;
      checkIns.push({
        id: `chk_${checkIns.length + 1}`,
        bookingId: booking.id,
        meetingId: meeting.id,
        at: iso(start - random.int(0, 25) * 60_000),
        ...scannedBy(random.pick(assistants.filter((a) => a.isActive || random.chance(0.3)))),
        source: "SCANNER",
      });
    }
  }

  const messages: ContactMessage[] = buildMessages(random, nowMs, courses);

  const instructor: InstructorProfile = {
    name: structuredClone(seedInstructor.name),
    shortName: structuredClone(seedInstructor.shortName),
    title: structuredClone(seedInstructor.title),
    specialization: structuredClone(seedInstructor.specialization),
    photoUrl: `${seedInstructor.photo.src}?w=800&h=1000&fit=crop`,
    photoAlt: structuredClone(seedInstructor.photo.alt),
    positioningStatement: structuredClone(seedInstructor.positioningStatement),
    valueProposition: structuredClone(seedInstructor.valueProposition),
    bioShort: structuredClone(seedInstructor.bioShort),
    bioLong: structuredClone(seedInstructor.bioLong),
    audience: structuredClone(seedInstructor.audience),
    stats: structuredClone(seedInstructor.stats),
    contact: {
      phoneE164: "+201000000000",
      whatsappE164: "+201000000000",
      email: "contact@karim-mostafa.example",
    },
    social: [
      { platform: "linkedin", url: "https://www.linkedin.com/in/example-karim-mostafa" },
      { platform: "facebook", url: "https://www.facebook.com/example.karim.mostafa" },
      { platform: "youtube", url: "https://www.youtube.com/@example-karim-mostafa" },
      { platform: "instagram", url: "https://www.instagram.com/example.karim.mostafa" },
    ],
    certifications: seedCerts.map((c): CertificationDto => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      year: c.year,
      credentialUrl: null,
      imageUrl: c.image ?? null,
    })),
    journey: seedJourney.map((j): MilestoneDto => ({
      id: j.id,
      type: j.type,
      startYear: j.startYear,
      endYear: j.endYear,
      title: j.title,
      organization: j.organization,
      description: j.description,
    })),
  };

  return {
    admins,
    courses,
    sessions,
    students,
    bookings,
    payments,
    checkIns,
    assistants,
    messages,
    instructor: structuredClone(instructor),
    locations: structuredClone(seedLocations),
    departments: structuredClone(seedDepartments),
    random,
  };
}

function buildMessages(random: Random, nowMs: number, courses: MockCourse[]): ContactMessage[] {
  const templates: Array<
    Omit<ContactMessage, "id" | "status" | "createdAt" | "courseTitle"> & { courseIndex?: number }
  > = [
    {
      name: "يوسف عادل",
      email: "youssef.adel@gmail.com",
      phoneE164: "+201012223344",
      subject: "COURSE_INQUIRY",
      courseIndex: 0,
      message:
        "السلام عليكم، هل دورة ETABS مناسبة لطالب في الفرقة الرابعة لم يستخدم البرنامج من قبل؟ وهل يوجد موعد في نوفمبر؟",
    },
    {
      name: "Mariam Fathy",
      email: "mariam.fathy@outlook.com",
      phoneE164: null,
      subject: "BOOKING_HELP",
      message:
        "I paid with Vodafone Cash for the SAFE course but I didn't receive the email with the ticket. My reference starts with KM-2610.",
    },
    {
      name: "Ahmed Elsayed",
      email: "a.elsayed@consult-eg.example",
      phoneE164: "+201223334455",
      subject: "CORPORATE",
      message:
        "We're a small design office with 6 junior engineers. Can you run a private RC design course for our team in December?",
    },
    {
      name: "سلمى منصور",
      email: "salma.mansour@yahoo.com",
      phoneE164: "+201155566677",
      subject: "COURSE_INQUIRY",
      courseIndex: 3,
      message: "هل دورة Revit تحتاج لابتوب بمواصفات معينة؟ وهل يمكن الحضور أونلاين؟",
    },
    {
      name: "Omar Hussein",
      email: "omar.h@gmail.com",
      phoneE164: "+201099988877",
      subject: "OTHER",
      message: "Do you give a certificate at the end of the course? My employer asks for one.",
    },
    {
      name: "نورهان إبراهيم",
      email: "nourhan.ibrahim@gmail.com",
      phoneE164: null,
      subject: "BOOKING_HELP",
      message: "أريد تغيير موعد الدورة من مجموعة السبت إلى مجموعة الخميس، هل هذا ممكن؟",
    },
    {
      name: "Ziad Ramadan",
      email: "ziad.ramadan@eng.cu.edu.eg",
      phoneE164: "+201277788899",
      subject: "COURSE_INQUIRY",
      courseIndex: 6,
      message: "When will the post-tensioned slabs course open? I'd like to be notified.",
    },
    {
      name: "هبة سمير",
      email: "heba.samir@gmail.com",
      phoneE164: "+201033344455",
      subject: "COURSE_INQUIRY",
      courseIndex: 2,
      message: "هل يوجد خصم للمجموعات؟ نحن ثلاث طالبات من نفس الدفعة.",
    },
    {
      name: "Tarek Gamal",
      email: "tarek.gamal@outlook.com",
      phoneE164: null,
      subject: "OTHER",
      message:
        "Thank you for the ETABS course last month, it helped me pass my interview at a design office.",
    },
    {
      name: "دينا عثمان",
      email: "dina.osman@yahoo.com",
      phoneE164: "+201144455566",
      subject: "BOOKING_HELP",
      message: "الدفع بالبطاقة يرفض أكثر من مرة، هل يوجد طريقة أخرى للدفع؟",
    },
  ];
  return templates.map((t, i) => {
    const { courseIndex, ...rest } = t;
    const course = courseIndex === undefined ? undefined : courses[courseIndex];
    return {
      ...rest,
      id: `msg_${String(i + 1).padStart(3, "0")}`,
      courseTitle: course ? structuredClone(course.title) : null,
      status: i < 4 ? "NEW" : i < 8 ? "READ" : "ARCHIVED",
      createdAt: iso(nowMs - (i * 1.7 + random.next()) * DAY),
    };
  });
}

export let db = createDb(mockNow());
export type MockDb = typeof db;

/** Tests call this between cases so every test starts from the same data. */
export function resetDb(): void {
  db = createDb(mockNow());
  mockSession.clear();
  failedAttempts.clear();
  idempotencyReplays.clear();
}

export function toPublicAdmin({ password: _password, ...admin }: MockAdmin): AdminUser {
  return admin;
}

/**
 * Mock stand-in for the API's httpOnly session cookie. Kept in sessionStorage so a
 * page reload during development doesn't sign you out (the real API uses a cookie).
 */
const SESSION_KEY = "dashboard.mock-session";
let memorySession: string | null = null;

export const mockSession = {
  get(): string | null {
    if (typeof window === "undefined") return memorySession;
    try {
      return window.sessionStorage.getItem(SESSION_KEY) ?? memorySession;
    } catch {
      return memorySession;
    }
  },
  set(userId: string): void {
    memorySession = userId;
    try {
      window.sessionStorage.setItem(SESSION_KEY, userId);
    } catch {
      // jsdom / blocked storage: memory only.
    }
  },
  clear(): void {
    memorySession = null;
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  },
};

/** Lockout bookkeeping for DSH-AUTH-02 (5 failures in 15 minutes). */
export const failedAttempts = new Map<string, number[]>();

/** Responses already given per `Idempotency-Key` (money actions, SRS §7.2): replayed on repeat. */
export const idempotencyReplays = new Map<string, { status: number; body: unknown }>();
