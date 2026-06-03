/**
 * Server-side resolver for the app's public origin (no trailing slash).
 *
 * Auth must hit the SAME origin the app is served from. Hardcoding that via a
 * single `NEXT_PUBLIC_APP_URL` is fragile on Vercel: every preview deployment
 * has a different URL, and a stale value silently breaks login (the browser
 * POSTs cross-origin → CORS preflight 404). So we resolve in priority order and
 * let Vercel fill it in automatically:
 *
 *   1. NEXT_PUBLIC_APP_URL           — explicit override (local dev, custom domain)
 *   2. VERCEL_PROJECT_PRODUCTION_URL — stable production alias on Vercel
 *   3. VERCEL_URL                    — per-deployment URL (preview builds)
 *   4. http://localhost:1111         — dev fallback
 *
 * The browser client (`auth-client.ts`) passes NO `baseURL`, so it always calls
 * the current origin and never needs this. This resolver exists only for
 * server-side absolute URLs (Better Auth's `baseURL` / `trustedOrigins`).
 */
import { env } from "./env";

export function getServerBaseURL(): string {
  const explicit = env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const prod = env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) return `https://${prod}`;

  const deployment = env.VERCEL_URL;
  if (deployment) return `https://${deployment}`;

  return "http://localhost:1111";
}
