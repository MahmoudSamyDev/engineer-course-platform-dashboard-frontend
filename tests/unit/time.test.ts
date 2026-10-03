import { describe, expect, it } from "vitest";
import { utcIsoToZonedLocal, zonedLocalToUtcIso } from "~/lib/time";

// Egypt observes DST: UTC+3 until the last Thursday of October 2026, then UTC+2 (SRS DC-07).
describe("Cairo time conversion", () => {
  it("converts a summer wall-clock time with +3", () => {
    expect(zonedLocalToUtcIso("2026-10-17T10:00")).toBe("2026-10-17T07:00:00.000Z");
  });

  it("converts a winter wall-clock time with +2", () => {
    expect(zonedLocalToUtcIso("2026-11-14T10:00")).toBe("2026-11-14T08:00:00.000Z");
  });

  it("round-trips UTC back to Cairo wall-clock time for inputs", () => {
    expect(utcIsoToZonedLocal("2026-11-14T08:00:00.000Z")).toBe("2026-11-14T10:00");
    expect(utcIsoToZonedLocal("2026-10-17T07:00:00.000Z")).toBe("2026-10-17T10:00");
  });
});
