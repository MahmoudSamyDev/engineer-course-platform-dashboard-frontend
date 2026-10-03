/** Only same-app relative paths are accepted as a post-sign-in destination (no open redirects). */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/login")) {
    return "/";
  }
  return next;
}

export function loginPathFor(url: URL, reason?: "expired"): string {
  const params = new URLSearchParams({ next: `${url.pathname}${url.search}` });
  if (reason) params.set("reason", reason);
  return `/login?${params.toString()}`;
}
