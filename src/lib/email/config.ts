/**
 * Email sender identity + small formatting helpers. Reads process.env directly
 * for EMAIL_FROM so the default (onboarding sender) can flip to the verified
 * kryscar.pl sender via env alone — no code change once DNS verifies.
 */
import { getServerBaseURL } from "@/lib/base-url";

/** Verified sender. Defaults to Resend's shared onboarding sender so email works
 *  before the kryscar.pl domain is verified; override with EMAIL_FROM in prod. */
export const EMAIL_FROM =
  process.env.EMAIL_FROM?.trim() || "Ogrody Kryscar <onboarding@resend.dev>";

/** Customer replies should reach the real company inbox. */
export const EMAIL_REPLY_TO = "ogrody@kryscar.pl";

/** Where team/ops notifications also go, regardless of gardener accounts. */
export const OPS_INBOX = "ogrody@kryscar.pl";

/** Absolute deep-link for email buttons (no trailing slash). */
export function emailLink(path: string): string {
  const base = getServerBaseURL();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Human Polish date+time for email bodies, e.g. "poniedziałek, 16 czerwca 2026, 09:00". */
export function formatPlDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(iso));
}
