import { describe, expect, it } from "vitest";
import { attendanceOf } from "~/domain/attendance";
import { readinessIssues, slugify } from "~/domain/course-rules";
import { egpToPiasters } from "~/domain/money";
import { cairoMonthKey, lastMonthKeys } from "~/domain/months";
import { checkMeetings, defaultRegistrationClose, minimumCapacity, nextSessionCode } from "~/domain/session-rules";

const m = (start: string, end: string, checked = false) => ({
  startsAt: start,
  endsAt: end,
  checkIn: checked ? { id: "c", at: start, by: "x", source: "SCANNER" as const } : null,
});
const meetings = [
  m("2026-10-10T07:00:00Z", "2026-10-10T11:00:00Z", true),
  m("2026-10-17T07:00:00Z", "2026-10-17T11:00:00Z"),
];

describe("attendance (DSH-ATT-02)", () => {
  it("is upcoming before the first meeting", () => {
    expect(attendanceOf("PAID", meetings, new Date("2026-10-01")).status).toBe("UPCOMING");
  });
  it("is attended when a started meeting was checked in", () => {
    expect(attendanceOf("PAID", meetings, new Date("2026-10-12"))).toEqual({ status: "ATTENDED", attended: 1, total: 2 });
  });
  it("is absent when meetings started without check-ins", () => {
    const none = meetings.map((x) => ({ ...x, checkIn: null }));
    expect(attendanceOf("PAID", none, new Date("2026-10-12")).status).toBe("ABSENT");
  });
  it("is completed after the last meeting", () => {
    expect(attendanceOf("PAID", meetings, new Date("2026-10-18")).status).toBe("COMPLETED");
  });
  it("is none for unpaid registrations", () => {
    expect(attendanceOf("REFUNDED", meetings, new Date("2026-10-12")).status).toBe("NONE");
  });
});

describe("Cairo months", () => {
  it("groups by Cairo time, not UTC", () => {
    // 22:30 UTC on 31 Oct = 00:30 on 1 Nov in Cairo (UTC+2 after DST ends).
    expect(cairoMonthKey("2026-10-31T22:30:00Z")).toBe("2026-11");
  });
  it("lists the last months across a year boundary", () => {
    expect(lastMonthKeys(new Date("2027-02-10T10:00:00Z"), 4)).toEqual(["2026-11", "2026-12", "2027-01", "2027-02"]);
  });
});

describe("course rules (DBR-02…04)", () => {
  const t = { ar: "س", en: "x" };
  const base = {
    title: t,
    shortDescription: t,
    about: t,
    outcomes: { ar: ["1", "2", "3"], en: ["1", "2", "3"] },
    modules: [{ title: t, topics: { ar: [], en: [] } }],
    totalHours: 16,
    meetingsCount: 4,
    basePrice: 320_000,
    coverAlt: t,
  };
  it("is ready when complete in both languages", () => {
    expect(readinessIssues(base)).toEqual([]);
  });
  it("lists what is missing", () => {
    expect(
      readinessIssues({ ...base, about: { ar: "", en: "x" }, outcomes: { ar: ["1"], en: ["1", "2", "3"] }, modules: [] }),
    ).toEqual(["about", "outcomes", "modules"]);
  });
  it("suggests slugs from English titles", () => {
    expect(slugify("ETABS for Analysis & Design of RC Buildings")).toBe("etabs-for-analysis-and-design-of-rc-buildings");
  });
});

describe("session rules (DBR-05/07/08/10)", () => {
  const now = new Date("2026-10-03T10:00:00Z");
  it("rejects end before start, overlaps and past first meetings", () => {
    expect(checkMeetings([{ startsAt: "2026-11-01T10:00:00Z", endsAt: "2026-11-01T09:00:00Z" }], now, true).kind).toBe("endBeforeStart");
    expect(
      checkMeetings(
        [
          { startsAt: "2026-11-01T08:00:00Z", endsAt: "2026-11-01T12:00:00Z" },
          { startsAt: "2026-11-01T11:00:00Z", endsAt: "2026-11-01T13:00:00Z" },
        ],
        now,
        true,
      ).kind,
    ).toBe("overlap");
    expect(checkMeetings([{ startsAt: "2026-10-01T08:00:00Z", endsAt: "2026-10-01T12:00:00Z" }], now, true).kind).toBe("firstInPast");
  });
  it("closes registration 24 h before the first meeting", () => {
    expect(defaultRegistrationClose("2026-11-01T08:00:00.000Z")).toBe("2026-10-31T08:00:00.000Z");
  });
  it("generates the next free session code for the Cairo month", () => {
    expect(nextSessionCode("ETB", "2026-10-17T07:00:00Z", ["ETB-2610-A", "ETB-2610-B", "SAF-2610-A"])).toBe("ETB-2610-C");
    expect(nextSessionCode("ETB", "2026-11-07T08:00:00Z", ["ETB-2610-A"])).toBe("ETB-2611-A");
  });
  it("never lets capacity go below sold + held", () => {
    expect(minimumCapacity(18, 2)).toBe(20);
  });
  it("converts EGP to piasters", () => {
    expect(egpToPiasters(3200)).toBe(320_000);
    expect(egpToPiasters(99.5)).toBe(9950);
  });
});
