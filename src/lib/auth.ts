/**
 * Better Auth server instance — the CUSTOMER (and gardener) auth surface.
 *
 * Persists through the custom BA -> Payload Local-API adapter, so every BA model
 * (user/session/account/verification) is a Payload-managed collection. BA never
 * touches Postgres directly. NO organization plugin and NO email verification in
 * this slice (deferred); `role`/`tenant` live on the `users` collection.
 *
 * Coexists with Payload: Payload admin is /admin (its own `admins` auth,
 * `payload-token` cookie); this instance is /api/auth/* (`better-auth.session_token`
 * cookie). Distinct namespaces — no collision.
 */
import { betterAuth } from "better-auth";

import { env } from "./env";
import { getServerBaseURL } from "./base-url";
import { payloadBetterAuthAdapter } from "./better-auth-payload-adapter";

const baseURL = getServerBaseURL();

// Origins Better Auth will accept a (same-origin) request from. We trust our own
// known domains explicitly so a stale/placeholder env var can never reject a real
// login; `*.vercel.app` covers preview/prod Vercel deployments; localhost covers
// dev; the resolved baseURL covers anything else.
const trustedOrigins = [
  ...new Set([
    baseURL,
    "http://localhost:1111",
    "https://kryscar.pl",
    "https://www.kryscar.pl",
    "https://*.vercel.app",
  ]),
];

export const auth = betterAuth({
  baseURL,
  trustedOrigins,
  secret: env.BETTER_AUTH_SECRET,
  database: payloadBetterAuthAdapter,
  emailAndPassword: { enabled: true },
  // NO organization plugin (single-tenant MVP). NO email verification (slice 1).
});
