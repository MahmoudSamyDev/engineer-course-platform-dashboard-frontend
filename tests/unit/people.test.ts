import { describe, expect, it } from "vitest";
import { e164ToNational, normalizeEgyptianMobile, normalizeEgyptianPhone } from "~/domain/phone";
import {
  checkYears,
  isOptionalHttpsUrl,
  isValidSocialUrl,
  milestoneEnd,
} from "~/domain/profile-rules";
import { checkImage } from "~/domain/uploads";
import { paragraphsToText, textToParagraphs } from "~/lib/localized";

describe("Egyptian phone numbers (DSH-ASS-02, DSH-PRO-03)", () => {
  it.each([
    ["01012345678", "+201012345678"],
    ["010 1234 5678", "+201012345678"],
    ["+20 115-123-4567", "+201151234567"],
    ["00201223456789", "+201223456789"],
    ["201551234567", "+201551234567"],
  ])("normalizes the mobile %s", (input, e164) => {
    expect(normalizeEgyptianMobile(input)).toBe(e164);
  });

  it.each(["0101234567", "01312345678", "+441012345678", "0223456789", "", "abc"])(
    "rejects %s as a mobile",
    (input) => expect(normalizeEgyptianMobile(input)).toBeNull(),
  );

  it("accepts Cairo landlines for the public contact number", () => {
    expect(normalizeEgyptianPhone("02 2345 6789")).toBe("+20223456789");
    expect(normalizeEgyptianPhone("01012345678")).toBe("+201012345678");
    expect(normalizeEgyptianPhone("012")).toBeNull();
  });

  it("shows E.164 in the national format inputs use", () => {
    expect(e164ToNational("+201012345678")).toBe("01012345678");
  });
});

describe("image uploads", () => {
  const jpg = (size: number) => ({ type: "image/jpeg", size });
  it("limits assistant photos to 2 MB", () => {
    expect(checkImage("assistant-photo", jpg(2 * 1024 * 1024))).toBeNull();
    expect(checkImage("assistant-photo", jpg(2 * 1024 * 1024 + 1))).toBe("size");
  });
  it("accepts JPG, PNG and WebP only", () => {
    expect(checkImage("certification", { type: "image/gif", size: 10 })).toBe("type");
    expect(checkImage("certification", { type: "image/webp", size: 10 })).toBeNull();
  });
  it("needs at least 800×1000 for the instructor photo", () => {
    expect(checkImage("instructor-photo", jpg(10), { width: 799, height: 1200 })).toBe(
      "dimensions",
    );
    expect(checkImage("instructor-photo", jpg(10), { width: 800, height: 1000 })).toBeNull();
  });
});

describe("profile rules (DSH-PRO-03/06/07)", () => {
  it("validates social links per platform", () => {
    expect(isValidSocialUrl("linkedin", "https://www.linkedin.com/in/someone")).toBe(true);
    expect(isValidSocialUrl("youtube", "https://youtu.be/abc")).toBe(true);
    expect(isValidSocialUrl("facebook", "http://facebook.com/x")).toBe(false);
    expect(isValidSocialUrl("instagram", "https://instagram.com.evil.example/x")).toBe(false);
    expect(isValidSocialUrl("linkedin", "linkedin.com/in/x")).toBe(false);
  });

  it("allows an empty credential link but not a non-https one", () => {
    expect(isOptionalHttpsUrl("")).toBe(true);
    expect(isOptionalHttpsUrl(null)).toBe(true);
    expect(isOptionalHttpsUrl("https://credly.com/badge")).toBe(true);
    expect(isOptionalHttpsUrl("ftp://x.example")).toBe(false);
  });

  it("reads the three journey end cases", () => {
    expect(milestoneEnd(2020)).toBe("range");
    expect(milestoneEnd(null)).toBe("present");
    expect(milestoneEnd(undefined)).toBe("single");
  });

  it("checks milestone years", () => {
    expect(checkYears(2015, 2020, 2026)).toBeNull();
    expect(checkYears(2015, null, 2026)).toBeNull();
    expect(checkYears(2020, 2015, 2026)).toBe("endBeforeStart");
    expect(checkYears(2030, undefined, 2026)).toBe("startYear");
    expect(checkYears(1800, undefined, 2026)).toBe("startYear");
    expect(checkYears(2015, 2031, 2026)).toBe("endYear");
  });
});

describe("long bio paragraphs", () => {
  it("round-trips paragraphs through blank-line text", () => {
    const list = { ar: ["أ", "ب"], en: ["One.", "Two."] };
    expect(textToParagraphs(paragraphsToText(list))).toEqual(list);
  });
  it("joins soft line breaks inside a paragraph", () => {
    expect(textToParagraphs({ ar: "", en: "First line\nsame paragraph\n\n\nSecond" })).toEqual({
      ar: [],
      en: ["First line same paragraph", "Second"],
    });
  });
});
