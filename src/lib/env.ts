/**
 * Typed, validated environment access (zod v4), parsed once at import time.
 *
 * Throws a single, clear, aggregated error if anything required is missing or
 * malformed — so the build (or first server import) fails loudly instead of a
 * confusing runtime crash deep in Payload / Better Auth.
 *
 * SCOPE: import this only from RUNTIME server modules (auth, base-url, future
 * API routes/webhooks). It is intentionally NOT imported by `payload.config.ts`
 * (loaded by `payload generate:types`, where the DB env may be absent) nor by
 * the dev scripts (`scripts/*`). Never import this into a Client Component.
 */
import { z } from "zod";

const EnvSchema = z.object({
  // Postgres (Neon). Plain non-empty strings — `postgres://…` is not an http(s)
  // URL and providers append query params a strict URL check would reject.
  DATABASE_URI: z.string().min(1, "DATABASE_URI is required"),
  DATABASE_URI_DIRECT: z.string().min(1).optional(),

  // Separate auth surfaces: Payload admin vs Better Auth customers.
  PAYLOAD_SECRET: z.string().min(16, "PAYLOAD_SECRET must be at least 16 chars"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(16, "BETTER_AUTH_SECRET must be at least 16 chars"),

  // Transactional email (Resend). Optional: when RESEND_API_KEY is absent the
  // email module self-disables (logged no-op), so dev/build never require it.
  RESEND_API_KEY: z.string().min(1).optional(),
  // Verified sender. Defaults (in email/config.ts) to Resend's onboarding sender
  // until the kryscar.pl domain is verified; then set to the kryscar.pl address.
  EMAIL_FROM: z.string().min(1).optional(),

  // Public app origin override. Optional: the client is same-origin and the
  // server derives it from VERCEL_* when unset (see base-url.ts).
  NEXT_PUBLIC_APP_URL: z.url().optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().min(1).optional(),
  VERCEL_URL: z.string().min(1).optional(),
  VERCEL_BRANCH_URL: z.string().min(1).optional(),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
  throw new Error(
    `Invalid environment variables:\n${issues}\n` +
      `Check your .env (local) or the project's env vars (Vercel/CI).`,
  );
}

export const env = parsed.data;
