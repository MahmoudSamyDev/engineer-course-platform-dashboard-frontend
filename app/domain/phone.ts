/**
 * Egyptian phone numbers (SRS DSH-ASS-02, DSH-PRO-03). Forms accept what people type
 * ("010 1234 5678", "+20 10…", "0020…") and the API stores E.164 ("+201012345678").
 */

/** Mobile: +20 1[0,1,2,5] + 8 digits (Vodafone, Etisalat, Orange, WE). */
export const EG_MOBILE_E164 = /^\+201[0125]\d{8}$/;

/** Any Egyptian number the public profile may show: mobile, or a landline (+20 + 8–9 digits). */
export const EG_PHONE_E164 = /^\+20(?:1[0125]\d{8}|[2-9]\d{7,8})$/;

/** Strips spaces, dashes, dots and brackets, then rewrites the national prefix as +20. */
function toE164Candidate(input: string): string {
  const compact = input.trim().replace(/[\s\-().]/g, "");
  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("0020")) return `+${compact.slice(2)}`;
  if (compact.startsWith("20") && compact.length >= 11) return `+${compact}`;
  if (compact.startsWith("0")) return `+20${compact.slice(1)}`;
  return compact;
}

/** "010 1234 5678" → "+201012345678"; null when it isn't an Egyptian mobile number. */
export function normalizeEgyptianMobile(input: string): string | null {
  const candidate = toE164Candidate(input);
  return EG_MOBILE_E164.test(candidate) ? candidate : null;
}

/** Mobile or landline → E.164; null when it isn't a valid Egyptian number. */
export function normalizeEgyptianPhone(input: string): string | null {
  const candidate = toE164Candidate(input);
  return EG_PHONE_E164.test(candidate) ? candidate : null;
}

/** "+201012345678" → "01012345678" — what people expect to see in an input. */
export function e164ToNational(e164: string): string {
  return e164.startsWith("+20") ? `0${e164.slice(3)}` : e164;
}
