/**
 * The app's "now". In development `VITE_MOCK_NOW` can pin the clock (screenshots, demos);
 * the mock API uses the same clock so UI rules (e.g. "meeting has started") agree with it.
 */
export function appNow(): Date {
  const pinned = import.meta.env.DEV ? import.meta.env.VITE_MOCK_NOW : undefined;
  if (pinned) {
    const date = new Date(pinned);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}
