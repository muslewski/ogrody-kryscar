---
type: decision
summary: "Transactional email goes through the Resend SDK + React Email directly (a self-contained src/lib/email/ module), NOT the Payload email adapter — because Better Auth's reset/verify call a function we supply regardless. Email verification is SOFT (no login block); the module self-disables without a key; the sender flips from the onboarding address to no-reply@kryscar.pl via one EMAIL_FROM env var."
tags: [email, auth, notifications, resend]
status: active
created: 2026-06-16
updated: 2026-06-16
related: ["[[transactional-email]]", "[[customer-auth]]", "[[service-requests]]", "[[team-schedule]]"]
sources: ["[[2026-06-16-transactional-email-design]]"]
decided: 2026-06-16
supersededBy: ""
---
## Context
The app could send no email: Better Auth ran `emailAndPassword: { enabled: true }` with
no `sendResetPassword` and no `emailVerification`, there was no email package, and no
Payload email transport. So password reset was dead (the demo accounts had to be reset
via the seed script), there was no verification, and a `service-request` landed in the DB
with nobody notified.

## Decision
- **Direct Resend SDK + React Email** in `src/lib/email/`, NOT
  `@payloadcms/email-resend`. Better Auth has no "Resend adapter" — `sendResetPassword`
  / `sendVerificationEmail` are callbacks we implement, so a direct sender is needed no
  matter what. The Payload adapter only wires `payload.sendEmail`, which Better Auth
  wouldn't use — adopting it would mean two parallel email paths. One seam is simpler.
- **Soft email verification** — `emailVerification.sendOnSignUp` is on, but
  `requireEmailVerification` is deliberately OMITTED. Prod was already live with real +
  demo accounts; a hard block would lock every existing user out until they verified,
  and a delayed/broken email would strand a paying customer. Soft sends the link and
  flips `emailVerified` on click without gating login. Can tighten later.
- **Self-disabling, never-throwing** — `getResend()` returns null when
  `RESEND_API_KEY` is absent (logged no-op), and `sendEmail` swallows all errors. So the
  build, `payload generate:types`, key-less dev, and preview deploys never require the
  key, and a failed send can't roll back a DB write. Notifications are fire-and-forget
  (`void notify().catch()`) AFTER the write — same trust posture as the rest of the data
  layer ([[team-schedule]]). Mirrors the Vercel Blob "self-disables without a token"
  pattern already in [[payload-backend]].
- **One `EMAIL_FROM` flip** — `config.ts` defaults the sender to Resend's
  `onboarding@resend.dev` so email works before DNS, and reads `EMAIL_FROM` to switch to
  `Ogrody Kryscar <no-reply@kryscar.pl>` with no code change once `kryscar.pl` verifies.
  Reply-To is `ogrody@kryscar.pl` so customer replies reach the real inbox.

## Recipients
New request notifies **all tenant gardeners + the ops inbox** (`ogrody@kryscar.pl`),
deduped case-insensitively (`buildTeamRecipients`). Decision/visit emails go to the
customer. All addresses are resolved server-side from the request row / authenticated
userId — never client input.

## Consequences
- A pure-render + recipient-dedupe check (`scripts/check-email.tsx`, in `npm run check`)
  guards the templates and recipient logic; the never-throws / soft-verification
  invariants are not auto-enforced (no mock harness) and live as zone invariants.
- No marketing/broadcast, contact-form email, in-app notifications, SMS, per-user
  preferences, or retry queue — explicitly out of scope.
- The `kryscar.pl` domain is verified in Resend (region `eu-west-1`); a live send to the
  ops inbox confirmed delivery from `no-reply@kryscar.pl` before ship.
