import { http } from "msw";
import type { AttendanceStatus, RegistrationRow } from "~/domain/api";
import type { BookingStatus } from "~/domain/types";
import { MOCK_API } from "../config";
import { db, mockNow } from "../db";
import { apiError, latency } from "../http";
import { registrationRow, studentDetail } from "../views";
import { csvResponse, inRange, itemResponse, listResponse, matchesQuery, sortBy } from "./helpers";

/** A registration = a booking that reached a payment outcome (SRS §4.4). */
const REGISTERED: BookingStatus[] = ["PAID", "REFUND_REQUIRED", "CANCELLED", "REFUNDED"];

function filteredRegistrations(url: URL): RegistrationRow[] {
  const p = url.searchParams;
  const status = p.get("bookingStatus") ?? "PAID";
  const now = mockNow();
  const rows = db.bookings
    .filter((b) => REGISTERED.includes(b.status))
    .filter((b) => status === "ALL" || b.status === status)
    .map((b) => registrationRow(b, now))
    .filter((r) => !p.get("courseId") || r.course.id === p.get("courseId"))
    .filter((r) => !p.get("sessionId") || r.session.id === p.get("sessionId"))
    .filter((r) => !p.get("attendance") || r.attendance.status === (p.get("attendance") as AttendanceStatus))
    .filter((r) => inRange(r.registeredAt, p.get("from"), p.get("to")))
    .filter((r) => matchesQuery(p.get("q"), r.student.fullName, r.student.phoneE164, r.student.email, r.reference));
  return sortBy(
    rows,
    p.get("sort"),
    { registeredAt: (r) => r.registeredAt, name: (r) => r.student.fullName, course: (r) => r.course.code + r.session.code },
    "-registeredAt",
  );
}

/** SRS §7.2 — registrations, student details, CSV. */
export const registrationHandlers = [
  http.get(`${MOCK_API}/registrations`, async ({ request }) => {
    await latency();
    const url = new URL(request.url);
    return listResponse(filteredRegistrations(url), url);
  }),

  http.get(`${MOCK_API}/registrations/export.csv`, async ({ request }) => {
    await latency();
    const rows = filteredRegistrations(new URL(request.url)).slice(0, 10_000);
    return csvResponse(
      "registrations.csv",
      ["reference", "name", "phone", "email", "department", "course", "session", "registered_at_utc", "status", "attendance"],
      rows.map((r) => [
        r.reference,
        r.student.fullName,
        r.student.phoneE164,
        r.student.email,
        r.student.department.en,
        r.course.title.en,
        r.session.code,
        r.registeredAt,
        r.status,
        `${r.attendance.status} ${r.attendance.attended}/${r.attendance.total}`,
      ]),
    );
  }),

  http.get(`${MOCK_API}/students/:id`, async ({ params }) => {
    await latency();
    const id = String(params.id);
    if (!db.students.some((s) => s.id === id)) return apiError(404, "NOT_FOUND", "Student not found.");
    return itemResponse(studentDetail(id));
  }),

  http.get(`${MOCK_API}/departments`, async () => {
    await latency();
    return itemResponse(db.departments);
  }),
];
