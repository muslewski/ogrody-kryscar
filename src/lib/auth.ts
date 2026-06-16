/**
 * Better Auth server instance — the CUSTOMER (and gardener) auth surface.
 *
 * Persists through the custom BA -> Payload Local-API adapter, so every BA model
 * (user/session/account/verification) is a Payload-managed collection. BA never
 * touches Postgres directly. NO organization plugin (single-tenant MVP). Email verification is SOFT (sent on
 * signup, never blocks login); password reset + verification email go through
 * src/lib/email. `role`/`tenant` live on the `users` collection.
 *
 * Coexists with Payload: Payload admin is /admin (its own `admins` auth,
 * `payload-token` cookie); this instance is /api/auth/* (`better-auth.session_token`
 * cookie). Distinct namespaces — no collision.
 */
import { betterAuth } from "better-auth";

import { env } from "./env";
import { getServerBaseURL } from "./base-url";
import { payloadBetterAuthAdapter } from "./better-auth-payload-adapter";
import { sendEmail } from "./email/send";
import { ResetPassword } from "./email/templates/ResetPassword";
import { VerifyEmail } from "./email/templates/VerifyEmail";

const baseURL = getServerBaseURL();

// Origins Better Auth will accept a (same-origin) request from. We trust our own
// known domains explicitly so a stale/placeholder env var can never reject a real
// login; localhost covers dev; the resolved baseURL covers anything else. Preview
// deployments are covered by THIS deployment's own Vercel URLs (deployment +
// branch alias) — deliberately NOT a `https://*.vercel.app` wildcard, which would
// trust every Vercel deployment on the platform as a CSRF origin.
const trustedOrigins = [
  ...new Set(
    [
      baseURL,
      "http://localhost:1111",
      "https://kryscar.pl",
      "https://www.kryscar.pl",
      env.VERCEL_URL ? `https://${env.VERCEL_URL}` : null,
      env.VERCEL_BRANCH_URL ? `https://${env.VERCEL_BRANCH_URL}` : null,
    ].filter((o): o is string => Boolean(o)),
  ),
];

export const auth = betterAuth({
  baseURL,
  trustedOrigins,
  secret: env.BETTER_AUTH_SECRET,
  database: payloadBetterAuthAdapter,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset hasła — Ogrody Kryscar",
        react: ResetPassword({ name: user.name ?? "", url }),
      });
    },
  },
  // Soft email verification: send on signup, mark verified on click, but do NOT
  // block sign-in (no requireEmailVerification) — existing prod accounts keep
  // working. See spec 2026-06-16-transactional-email-design.
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Potwierdź adres e-mail — Ogrody Kryscar",
        react: VerifyEmail({ name: user.name ?? "", url }),
      });
    },
  },
  // NO organization plugin (single-tenant MVP).
});
