import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Next.js 16 "Proxy" (the renamed Middleware) — an OPTIMISTIC gate over the
 * authenticated areas (/panel, /zespol). It only checks for the PRESENCE of the
 * Better Auth session cookie (no DB round-trip), so it is NOT the security
 * boundary — a stale/expired cookie passes here and is caught by each segment's
 * layout via the authoritative `getSession`. Next 16 endorses Proxy for exactly
 * this (optimistic checks), "not as a full session management solution".
 */
export function proxy(request: NextRequest) {
  const hasSession = getSessionCookie(request);
  if (!hasSession) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set(
      "next",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(url);
  }
  // Forward the path so the layout can rebuild ?next on the authoritative check.
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/panel/:path*", "/zespol/:path*"] };
