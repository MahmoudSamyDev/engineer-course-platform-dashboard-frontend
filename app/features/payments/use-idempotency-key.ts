import { useCallback, useState } from "react";

/**
 * One `Idempotency-Key` per money action (SRS §7.2). The same key is kept for retries of
 * the same request (network error, 5xx), so the server can't apply it twice. After a final
 * answer (any 4xx) the next attempt is a different request — another session, a corrected
 * amount — and gets a new key; reusing the old one would replay the stored refusal.
 */
export function useIdempotencyKey() {
  const [key, setKey] = useState(() => crypto.randomUUID());
  const renewAfter = useCallback((error: unknown) => {
    const status = (error as { status?: unknown } | null)?.status;
    if (typeof status === "number" && status >= 400 && status < 500) setKey(crypto.randomUUID());
  }, []);
  return [key, renewAfter] as const;
}

/** The API's "the booking changed meanwhile" answer (409 with `INVALID_STATE`, SRS rev 1.3). */
export function isStaleState(fields: Record<string, string> | undefined): boolean {
  return fields?.payment === "INVALID_STATE" || fields?.booking === "INVALID_STATE";
}
