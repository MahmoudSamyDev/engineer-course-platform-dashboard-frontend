import type { ContactMessage } from "./api";
import type { Locale, LocalizedText } from "./types";

/** Contact form topics (Website DR-17), as written in a reply's subject line. */
const SUBJECT_LINE: Record<ContactMessage["subject"], LocalizedText> = {
  COURSE_INQUIRY: { ar: "استفسار عن دورة", en: "Course inquiry" },
  BOOKING_HELP: { ar: "مساعدة في الحجز", en: "Booking help" },
  CORPORATE: { ar: "تدريب للشركات", en: "Corporate training" },
  OTHER: { ar: "رسالتك", en: "Your message" },
};

const ARABIC_LETTER = /[؀-ۿ]/;

/**
 * The language the sender wrote in: Arabic if the text has any Arabic letter. Replies go out
 * in the sender's language, whatever language the dashboard is in.
 */
export function messageLanguage(text: string): Locale {
  return ARABIC_LETTER.test(text) ? "ar" : "en";
}

/** "Re: Course inquiry — ETABS for beginners", in the sender's language. */
export function replySubject(message: Pick<ContactMessage, "subject" | "message" | "courseTitle">) {
  const locale = messageLanguage(message.message);
  const topic = SUBJECT_LINE[message.subject][locale];
  const course = message.courseTitle?.[locale];
  const prefix = locale === "ar" ? "رد: " : "Re: ";
  return `${prefix}${topic}${course ? ` — ${course}` : ""}`;
}

/** `mailto:` link that opens a reply with the subject filled in (DSH-MSG-02). */
export function mailtoReply(
  message: Pick<ContactMessage, "email" | "subject" | "message" | "courseTitle">,
): string {
  return `mailto:${message.email}?subject=${encodeURIComponent(replySubject(message))}`;
}

/** The first line of a message, for the inbox preview. */
export function firstLine(text: string): string {
  return text.trim().split(/\r?\n/, 1)[0] ?? "";
}
