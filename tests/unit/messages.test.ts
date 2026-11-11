import { describe, expect, it } from "vitest";
import { firstLine, mailtoReply, messageLanguage, replySubject } from "~/domain/messages";

describe("contact message replies (DSH-MSG-02)", () => {
  it("detects the language the sender wrote in", () => {
    expect(messageLanguage("هل يوجد موعد في نوفمبر؟")).toBe("ar");
    expect(messageLanguage("Is there an ETABS course in November?")).toBe("en");
    expect(messageLanguage("ETABS دورة")).toBe("ar");
  });

  it("writes the reply subject in the sender's language, with the course", () => {
    const course = { ar: "تصميم المنشآت بالإيتابس", en: "ETABS building design" };
    expect(
      replySubject({
        subject: "COURSE_INQUIRY",
        message: "هل الدورة مناسبة؟",
        courseTitle: course,
      }),
    ).toBe("رد: استفسار عن دورة — تصميم المنشآت بالإيتابس");
    expect(
      replySubject({ subject: "BOOKING_HELP", message: "I paid but…", courseTitle: null }),
    ).toBe("Re: Booking help");
  });

  it("builds a mailto link with an encoded subject", () => {
    expect(
      mailtoReply({
        email: "mariam@example.com",
        subject: "CORPORATE",
        message: "Can you train our team?",
        courseTitle: null,
      }),
    ).toBe("mailto:mariam@example.com?subject=Re%3A%20Corporate%20training");
  });

  it("previews the first line only", () => {
    expect(firstLine("  Hello\nsecond line")).toBe("Hello");
    expect(firstLine("")).toBe("");
  });
});
