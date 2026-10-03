import { http, HttpResponse } from "msw";
import type {
  CourseModuleInput,
  CreateCourseInput,
  FaqInput,
  SessionInput,
  UpdateCourseInput,
} from "~/domain/api";
import { COURSE_CODE_PATTERN, readinessIssues, SLUG_PATTERN } from "~/domain/course-rules";
import { checkMeetings, minimumCapacity, nextSessionCode } from "~/domain/session-rules";
import type { LocalizedText } from "~/domain/types";
import { MOCK_API } from "../config";
import { db, mockNow, type MockCourse, type MockSession } from "../db";
import { apiError, currentAdmin, latency } from "../http";
import { courseCard, courseDetail, courseState, findCourse, findSession, heldSeats, sessionDetail, sessionRow, soldSeats } from "../views";
import { csvResponse, itemResponse, matchesQuery } from "./helpers";

const filled = (t?: LocalizedText) => Boolean(t?.ar?.trim() && t?.en?.trim());
const empty = (): LocalizedText => ({ ar: "", en: "" });

function validateMeetings(input: SessionInput, isNew: boolean) {
  const problem = checkMeetings(input.meetings, mockNow(), isNew);
  if (input.meetings.length === 0) return apiError(422, "VALIDATION_FAILED", "Add at least one meeting.", { meetings: "REQUIRED" });
  if (problem.kind !== "none") {
    return apiError(422, "VALIDATION_FAILED", "Check the meeting times.", { meetings: problem.kind.toUpperCase(), meetingIndex: String("index" in problem ? problem.index : 0) });
  }
  const first = [...input.meetings].sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0]!;
  if (!(Date.parse(input.registrationClosesAt) < Date.parse(first.startsAt))) {
    return apiError(422, "VALIDATION_FAILED", "Registration must close before the first meeting.", { registrationClosesAt: "AFTER_FIRST_MEETING" });
  }
  return null;
}

function buildMeetings(code: string, meetings: SessionInput["meetings"]) {
  return [...meetings]
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((m, i) => ({ id: `${code}-M${i + 1}`, order: i + 1, startsAt: m.startsAt, endsAt: m.endsAt }));
}

/** SRS §7.2 — courses, sessions, meetings, check-ins, locations (DSH-CRS, DSH-SES, DSH-ATT). */
export const courseHandlers = [
  http.get(`${MOCK_API}/courses`, async ({ request }) => {
    await latency();
    const url = new URL(request.url);
    const state = url.searchParams.get("state");
    const q = url.searchParams.get("q");
    const now = mockNow();
    const cards = db.courses
      .map((c) => courseCard(c, now))
      .filter((c) => matchesQuery(q, c.title.ar, c.title.en, c.code));
    const counts = {
      all: cards.filter((c) => c.state !== "ARCHIVED").length,
      published: cards.filter((c) => c.state === "PUBLISHED").length,
      draft: cards.filter((c) => c.state === "DRAFT").length,
      archived: cards.filter((c) => c.state === "ARCHIVED").length,
    };
    const items = cards
      .filter((c) => (state ? c.state === state.toUpperCase() : c.state !== "ARCHIVED"))
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return HttpResponse.json({ data: items, meta: { page: 1, pageSize: items.length, total: items.length, counts } });
  }),

  http.post(`${MOCK_API}/courses`, async ({ request }) => {
    await latency();
    const body = (await request.json()) as CreateCourseInput;
    const fields: Record<string, string> = {};
    const code = body.code?.trim().toUpperCase();
    if (!COURSE_CODE_PATTERN.test(code ?? "")) fields.code = "INVALID";
    else if (db.courses.some((c) => c.code === code)) fields.code = "TAKEN";
    if (!SLUG_PATTERN.test(body.slug ?? "")) fields.slug = "INVALID";
    else if (db.courses.some((c) => c.slug === body.slug)) fields.slug = "TAKEN";
    if (!filled(body.title)) fields.title = "REQUIRED";
    if (Object.keys(fields).length) return apiError(422, "VALIDATION_FAILED", "Check the course details.", fields);

    const id = `C${Date.now().toString(36)}`;
    const course: MockCourse = {
      id,
      slug: body.slug,
      code: code!,
      title: body.title,
      shortDescription: body.shortDescription ?? empty(),
      about: empty(),
      audience: empty(),
      problemSolved: empty(),
      expectations: empty(),
      outcomes: { ar: [], en: [] },
      modules: [],
      requirements: { ar: [], en: [] },
      whatToBring: { ar: [], en: [] },
      faq: [],
      certificationIds: [],
      level: body.level,
      language: { ar: "العربية", en: "Arabic" },
      totalHours: body.totalHours,
      meetingsCount: body.meetingsCount,
      basePrice: body.basePrice,
      coverDiscipline: { ar: "هندسة إنشائية", en: "Structural engineering" },
      coverAlt: structuredClone(body.title),
      isPublished: false,
      isFeatured: false,
      isComingSoon: false,
      registrationClosed: false,
      comingSoonNote: empty(),
      sortOrder: Math.max(0, ...db.courses.map((c) => c.sortOrder)) + 1,
      seo: { title: structuredClone(body.title), description: structuredClone(body.shortDescription ?? empty()) },
      archivedAt: null,
      createdAt: mockNow().toISOString(),
    };
    db.courses.push(course);
    return itemResponse(courseDetail(course), 201);
  }),

  http.get(`${MOCK_API}/courses/:id`, async ({ params }) => {
    await latency();
    const course = findCourse(String(params.id));
    if (!course) return apiError(404, "NOT_FOUND", "Course not found.");
    return itemResponse(courseDetail(course));
  }),

  http.patch(`${MOCK_API}/courses/:id`, async ({ params, request }) => {
    await latency();
    const course = findCourse(String(params.id));
    if (!course) return apiError(404, "NOT_FOUND", "Course not found.");
    const body = (await request.json()) as UpdateCourseInput;
    const detail = courseDetail(course);
    const fields: Record<string, string> = {};

    if (body.code !== undefined && body.code !== course.code) {
      if (detail.codeLocked) return apiError(409, "CONFLICT", "The course code can't change once sessions exist.", { code: "COURSE_CODE_LOCKED" });
      if (!COURSE_CODE_PATTERN.test(body.code)) fields.code = "INVALID";
      else if (db.courses.some((c) => c.code === body.code)) fields.code = "TAKEN";
    }
    if (body.slug !== undefined && body.slug !== course.slug) {
      if (detail.slugLocked) return apiError(409, "CONFLICT", "The link can't change after publishing.", { slug: "SLUG_LOCKED" });
      if (!SLUG_PATTERN.test(body.slug)) fields.slug = "INVALID";
      else if (db.courses.some((c) => c.slug === body.slug)) fields.slug = "TAKEN";
    }
    if (body.title !== undefined && !filled(body.title)) fields.title = "REQUIRED";
    if (Object.keys(fields).length) return apiError(422, "VALIDATION_FAILED", "Check the course details.", fields);

    const { isPublished, ...rest } = body;
    Object.assign(course, rest);
    if (isPublished === true) {
      const issues = readinessIssues(courseDetail(course));
      if (issues.length) {
        return apiError(409, "CONFLICT", "Complete the course before publishing.", Object.fromEntries(issues.map((i) => [i, "MISSING"])));
      }
      course.isPublished = true;
    } else if (isPublished === false) {
      course.isPublished = false;
    }
    return itemResponse(courseDetail(course));
  }),

  http.put(`${MOCK_API}/courses/:id/modules`, async ({ params, request }) => {
    await latency();
    const course = findCourse(String(params.id));
    if (!course) return apiError(404, "NOT_FOUND", "Course not found.");
    const modules = (await request.json()) as CourseModuleInput[];
    if (modules.some((m) => !filled(m.title))) return apiError(422, "VALIDATION_FAILED", "Every module needs a title in both languages.", { modules: "TITLE_REQUIRED" });
    course.modules = modules.map((m, i) => ({ order: i + 1, title: m.title, durationHours: m.durationHours, topics: m.topics }));
    return itemResponse(courseDetail(course));
  }),

  http.put(`${MOCK_API}/courses/:id/faq`, async ({ params, request }) => {
    await latency();
    const course = findCourse(String(params.id));
    if (!course) return apiError(404, "NOT_FOUND", "Course not found.");
    const faq = (await request.json()) as FaqInput[];
    if (faq.some((f) => !filled(f.question) || !filled(f.answer))) {
      return apiError(422, "VALIDATION_FAILED", "Every question needs a question and an answer in both languages.", { faq: "INCOMPLETE" });
    }
    course.faq = faq;
    return itemResponse(courseDetail(course));
  }),

  http.post(`${MOCK_API}/courses/:id/archive`, async ({ params }) => {
    await latency();
    const course = findCourse(String(params.id));
    if (!course) return apiError(404, "NOT_FOUND", "Course not found.");
    course.archivedAt = mockNow().toISOString();
    course.isPublished = false;
    return itemResponse(courseDetail(course));
  }),

  http.post(`${MOCK_API}/courses/:id/restore`, async ({ params }) => {
    await latency();
    const course = findCourse(String(params.id));
    if (!course) return apiError(404, "NOT_FOUND", "Course not found.");
    course.archivedAt = null;
    return itemResponse(courseDetail(course));
  }),

  http.delete(`${MOCK_API}/courses/:id`, async ({ params }) => {
    await latency();
    const course = findCourse(String(params.id));
    if (!course) return apiError(404, "NOT_FOUND", "Course not found.");
    if (courseState(course) !== "DRAFT" || db.sessions.some((s) => s.courseId === course.id)) {
      return apiError(409, "CONFLICT", "Only drafts without sessions can be deleted. Archive it instead.", { course: "HAS_SESSIONS" });
    }
    db.courses = db.courses.filter((c) => c.id !== course.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${MOCK_API}/courses/:id/sessions`, async ({ params }) => {
    await latency();
    const course = findCourse(String(params.id));
    if (!course) return apiError(404, "NOT_FOUND", "Course not found.");
    const now = mockNow();
    const rows = db.sessions.filter((s) => s.courseId === course.id).map((s) => sessionRow(s, now));
    const isPast = (r: (typeof rows)[number]) => Date.parse(r.meetings[r.meetings.length - 1]!.endsAt) < now.getTime();
    rows.sort((a, b) => {
      if (isPast(a) !== isPast(b)) return isPast(a) ? 1 : -1;
      const order = a.meetings[0]!.startsAt.localeCompare(b.meetings[0]!.startsAt);
      return isPast(a) ? -order : order;
    });
    return itemResponse(rows);
  }),

  http.post(`${MOCK_API}/courses/:id/sessions`, async ({ params, request }) => {
    await latency();
    const course = findCourse(String(params.id));
    if (!course) return apiError(404, "NOT_FOUND", "Course not found.");
    const body = (await request.json()) as SessionInput;
    if (!(body.capacity >= 1 && body.capacity <= 500)) return apiError(422, "VALIDATION_FAILED", "Capacity must be between 1 and 500.", { capacity: "OUT_OF_RANGE" });
    if (!(body.price > 0)) return apiError(422, "VALIDATION_FAILED", "Enter a price.", { price: "REQUIRED" });
    if (!db.locations.some((l) => l.id === body.locationId)) return apiError(422, "VALIDATION_FAILED", "Choose a location.", { locationId: "REQUIRED" });
    const invalid = validateMeetings(body, true);
    if (invalid) return invalid;

    const meetings = [...body.meetings].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const code = nextSessionCode(course.code, meetings[0]!.startsAt, db.sessions.map((s) => s.code));
    const session: MockSession = {
      id: code,
      code,
      courseId: course.id,
      locationId: body.locationId,
      label: body.label,
      capacity: body.capacity,
      price: body.price,
      meetings: buildMeetings(code, meetings),
      registrationClosesAt: body.registrationClosesAt,
      isPublished: body.isPublished,
      isClosedManually: false,
      createdAt: mockNow().toISOString(),
    };
    db.sessions.push(session);
    return itemResponse(sessionRow(session), 201);
  }),

  http.get(`${MOCK_API}/sessions/:id`, async ({ params }) => {
    await latency();
    const session = findSession(String(params.id));
    if (!session) return apiError(404, "NOT_FOUND", "Session not found.");
    return itemResponse(sessionDetail(session));
  }),

  http.patch(`${MOCK_API}/sessions/:id`, async ({ params, request }) => {
    await latency();
    const session = findSession(String(params.id));
    if (!session) return apiError(404, "NOT_FOUND", "Session not found.");
    const body = (await request.json()) as Partial<SessionInput>;
    const sold = soldSeats(session.id);
    const held = heldSeats(session.id);
    if (body.capacity !== undefined && body.capacity < minimumCapacity(sold, held)) {
      return apiError(409, "CONFLICT", `Capacity can't be less than the ${sold + held} seats already sold or held.`, {
        capacity: "CAPACITY_BELOW_SOLD",
        minimum: String(minimumCapacity(sold, held)),
      });
    }
    if (body.meetings) {
      const invalid = validateMeetings(
        { ...(body as SessionInput), registrationClosesAt: body.registrationClosesAt ?? session.registrationClosesAt },
        false,
      );
      if (invalid) return invalid;
      session.meetings = buildMeetings(session.code, body.meetings);
    }
    if (body.locationId !== undefined) session.locationId = body.locationId;
    if (body.label !== undefined) session.label = body.label;
    if (body.capacity !== undefined) session.capacity = body.capacity;
    if (body.price !== undefined) session.price = body.price;
    if (body.registrationClosesAt !== undefined) session.registrationClosesAt = body.registrationClosesAt;
    if (body.isPublished !== undefined) session.isPublished = body.isPublished;
    return itemResponse(sessionRow(session));
  }),

  http.post(`${MOCK_API}/sessions/:id/:action`, async ({ params }) => {
    await latency();
    const session = findSession(String(params.id));
    if (!session) return apiError(404, "NOT_FOUND", "Session not found.");
    if (params.action === "close") session.isClosedManually = true;
    else if (params.action === "reopen") session.isClosedManually = false;
    else return apiError(404, "NOT_FOUND", "Unknown action.");
    return itemResponse(sessionRow(session));
  }),

  http.delete(`${MOCK_API}/sessions/:id`, async ({ params }) => {
    await latency();
    const session = findSession(String(params.id));
    if (!session) return apiError(404, "NOT_FOUND", "Session not found.");
    if (db.bookings.some((b) => b.sessionId === session.id)) {
      return apiError(409, "CONFLICT", "This session has bookings. Unpublish it instead.", { session: "HAS_BOOKINGS" });
    }
    db.sessions = db.sessions.filter((s) => s.id !== session.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${MOCK_API}/sessions/:id/roster.csv`, async ({ params }) => {
    await latency();
    const session = findSession(String(params.id));
    if (!session) return apiError(404, "NOT_FOUND", "Session not found.");
    const detail = sessionDetail(session);
    return csvResponse(
      `roster-${session.code}.csv`,
      ["reference", "name", "phone", "department", "status", ...detail.meetings.map((m) => `meeting_${m.order}`)],
      detail.roster.map((r) => [
        r.reference,
        r.student.fullName,
        r.student.phoneE164,
        r.student.department.en,
        r.status,
        ...r.meetings.map((m) => (m.checkIn ? "yes" : "")),
      ]),
    );
  }),

  http.post(`${MOCK_API}/checkins`, async ({ request }) => {
    await latency();
    const { bookingId, meetingId } = (await request.json()) as { bookingId: string; meetingId: string };
    const booking = db.bookings.find((b) => b.id === bookingId);
    const session = booking ? findSession(booking.sessionId) : undefined;
    const meeting = session?.meetings.find((m) => m.id === meetingId);
    if (!booking || !session || !meeting) return apiError(404, "NOT_FOUND", "Booking or meeting not found.");
    if (booking.status !== "PAID") return apiError(409, "CONFLICT", "Only paid registrations can be checked in.", { checkin: "NOT_PAID" });
    if (Date.parse(meeting.startsAt) - 60 * 60_000 > mockNow().getTime()) {
      return apiError(409, "CONFLICT", "This meeting hasn't started yet.", { checkin: "MEETING_NOT_STARTED" });
    }
    const existing = db.checkIns.find((c) => c.bookingId === bookingId && c.meetingId === meetingId);
    if (existing) return apiError(409, "CONFLICT", "Already checked in for this meeting.", { checkin: "ALREADY_CHECKED_IN", at: existing.at });
    const checkIn = {
      id: `chk_${Date.now().toString(36)}`,
      bookingId,
      meetingId,
      at: mockNow().toISOString(),
      by: currentAdmin()?.name ?? "Admin",
      source: "DASHBOARD" as const,
    };
    db.checkIns.push(checkIn);
    return itemResponse(checkIn, 201);
  }),

  http.delete(`${MOCK_API}/checkins/:id`, async ({ params }) => {
    await latency();
    const index = db.checkIns.findIndex((c) => c.id === params.id);
    if (index < 0) return apiError(404, "NOT_FOUND", "Check-in not found.");
    db.checkIns.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${MOCK_API}/locations`, async () => {
    await latency();
    return itemResponse(db.locations.map((l) => ({ id: l.id, name: l.name, shortName: l.shortName })));
  }),
];
