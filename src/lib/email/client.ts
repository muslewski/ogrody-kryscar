/**
 * Lazy Resend client. Returns null when RESEND_API_KEY is absent so the app
 * (and `next build`, and key-less dev) runs with email simply disabled — the
 * same self-disabling pattern as the Vercel Blob storage plugin.
 */
import { Resend } from "resend";

let cached: Resend | null | undefined;

export function getResend(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY?.trim();
  cached = key ? new Resend(key) : null;
  if (!cached) {
    console.warn("[email] RESEND_API_KEY not set — email is disabled (no-op).");
  }
  return cached;
}
