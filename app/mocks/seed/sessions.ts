/**
 * ⚠️ PLACEHOLDER DATA — sessions & meetings from docs/DUMMY_DATA.md §10.
 * Times are written in Cairo wall-clock time and converted to UTC with the IANA zone
 * (Egypt's DST ends in late October 2026, during these sessions).
 */
import { REGISTRATION_CUTOFF_HOURS } from "~/domain/constants";
import type { LocalizedText, Meeting, Session } from "~/domain/types";
import { zonedLocalToUtcIso } from "~/lib/time";

const EGP = 100;

type SessionSeed = {
  code: string;
  courseId: string;
  locationId: string;
  label: LocalizedText;
  /** Meeting dates (YYYY-MM-DD, Cairo) sharing the same daily time range. */
  dates: string[];
  from: string; // "HH:mm"
  to: string; // "HH:mm"
  capacity: number;
  price: number; // EGP
  paidCount: number;
  activeHolds?: number;
};

function buildMeetings(dates: string[], from: string, to: string): Meeting[] {
  return dates.map((date, index) => ({
    order: index + 1,
    startsAt: zonedLocalToUtcIso(`${date}T${from}`),
    endsAt: zonedLocalToUtcIso(`${date}T${to}`),
  }));
}

function buildSession(seed: SessionSeed): Session {
  const meetings = buildMeetings(seed.dates, seed.from, seed.to);
  const firstStart = new Date(meetings[0].startsAt).getTime();
  return {
    id: seed.code,
    code: seed.code,
    courseId: seed.courseId,
    locationId: seed.locationId,
    label: seed.label,
    capacity: seed.capacity,
    price: seed.price * EGP,
    meetings,
    registrationClosesAt: new Date(
      firstStart - REGISTRATION_CUTOFF_HOURS * 3_600_000,
    ).toISOString(),
    isPublished: true,
    isClosedManually: false,
    paidCount: seed.paidCount,
    activeHolds: seed.activeHolds ?? 0,
  };
}

const session = (n: string): LocalizedText => ({ en: `Session ${n}`, ar: `الدورة ${n}` });
const workshop = (n: string): LocalizedText => ({ en: `Workshop ${n}`, ar: `الورشة ${n}` });

export const sessions: Session[] = [
  {
    code: "ETB-2610-A",
    courseId: "C1",
    locationId: "LOC-NC",
    label: session("01"),
    dates: ["2026-10-17", "2026-10-24", "2026-10-31", "2026-11-07"],
    from: "10:00",
    to: "14:00",
    capacity: 25,
    price: 3200,
    paidCount: 13,
  },
  {
    code: "ETB-2610-B",
    courseId: "C1",
    locationId: "LOC-DK",
    label: session("02"),
    dates: ["2026-10-22", "2026-10-29", "2026-11-05", "2026-11-12"],
    from: "18:00",
    to: "22:00",
    capacity: 25,
    price: 3200,
    paidCount: 21,
  },
  {
    code: "SAF-2610-A",
    courseId: "C2",
    locationId: "LOC-NC",
    label: session("01"),
    dates: ["2026-10-23", "2026-10-30", "2026-11-06"],
    from: "10:00",
    to: "14:00",
    capacity: 20,
    price: 2400,
    paidCount: 20,
  },
  {
    code: "SAF-2611-B",
    courseId: "C2",
    locationId: "LOC-NC",
    label: session("02"),
    dates: ["2026-11-20", "2026-11-27", "2026-12-04"],
    from: "10:00",
    to: "14:00",
    capacity: 20,
    price: 2400,
    paidCount: 6,
  },
  {
    code: "RCD-2610-A",
    courseId: "C3",
    locationId: "LOC-DK",
    label: session("01"),
    dates: ["2026-10-13", "2026-10-20", "2026-10-27", "2026-11-03", "2026-11-10"],
    from: "18:00",
    to: "21:00",
    capacity: 30,
    price: 2800,
    paidCount: 27,
  },
  {
    code: "RVT-2610-A",
    courseId: "C4",
    locationId: "LOC-DK",
    label: session("01"),
    dates: ["2026-10-10", "2026-10-17", "2026-10-24", "2026-10-31"],
    from: "16:00",
    to: "20:00",
    capacity: 20,
    price: 3500,
    paidCount: 20,
  },
  {
    code: "RVT-2611-B",
    courseId: "C4",
    locationId: "LOC-DK",
    label: session("02"),
    dates: ["2026-11-21", "2026-11-28", "2026-12-05", "2026-12-12"],
    from: "16:00",
    to: "20:00",
    capacity: 20,
    price: 3500,
    paidCount: 20,
  },
  {
    code: "STL-2611-A",
    courseId: "C5",
    locationId: "LOC-NC",
    label: workshop("01"),
    dates: ["2026-11-14"],
    from: "10:00",
    to: "16:00",
    capacity: 35,
    price: 950,
    paidCount: 9,
  },
  {
    code: "STL-2612-B",
    courseId: "C5",
    locationId: "LOC-NC",
    label: workshop("02"),
    dates: ["2026-12-11"],
    from: "10:00",
    to: "16:00",
    capacity: 35,
    price: 950,
    paidCount: 0,
  },
  {
    code: "SHD-2609-A",
    courseId: "C6",
    locationId: "LOC-NC",
    label: session("01"),
    dates: ["2026-09-05", "2026-09-12", "2026-09-19", "2026-09-26"],
    from: "10:00",
    to: "14:00",
    capacity: 25,
    price: 2600,
    paidCount: 25,
  },
].map(buildSession);
