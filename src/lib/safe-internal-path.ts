/**
 * Sanitize a user-supplied redirect target (the `?next=` param on /sign-in)
 * down to a same-origin path. Anything that could leave the origin falls back:
 * absolute URLs ("https://evil"), protocol-relative ("//evil"), and the
 * backslash variant ("/\evil", which browsers normalize to "//evil").
 * PURE — enforced by scripts/check-safe-next.ts (npm run check).
 */
export function safeInternalPath(
  raw: string | null | undefined,
  fallback: string,
): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return fallback;
  }
  return raw;
}
