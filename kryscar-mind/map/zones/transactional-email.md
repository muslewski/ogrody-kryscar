---
type: zone
summary: "Transactional email via Resend + React Email: Better Auth password reset + soft (non-blocking) email verification, plus order/visit notifications (new request → team + ops inbox; accepted/declined/visit-scheduled → customer). Self-disables without RESEND_API_KEY; sends are fire-and-forget and never roll back a DB write."
tags: [feature, auth, email, notifications]
status: active
created: 2026-06-16
updated: 2026-06-16
related: ["[[customer-auth]]", "[[service-requests]]", "[[team-schedule]]", "[[auth-portal]]", "[[payload-backend]]"]
sources: ["[[2026-06-16-transactional-email-design]]"]
owns:
  routes: ["/forgot-password", "/reset-password"]
  anchors: ["symbol:sendEmail", "symbol:notifyNewRequest", "symbol:notifyRequestDecision", "symbol:notifyVisitScheduled", "symbol:buildTeamRecipients"]
  globs: ["src/lib/email/**", "src/components/auth/**", "src/app/(public)/(auth)/forgot-password/**", "src/app/(public)/(auth)/reset-password/**", "scripts/check-email.tsx"]
depends: ["[[customer-auth]]", "[[service-requests]]", "[[team-schedule]]", "[[ui-primitives]]"]
invariants:
  - rule: "sendEmail NEVER throws or rejects — render + Resend errors are caught and logged. Notifications are fire-and-forget at the call site (void notify…().catch) AFTER the DB write, so an email failure can never roll back a transition or break a flow."
    enforcedBy: []
  - rule: "Email self-disables when RESEND_API_KEY is absent — getResend() returns null (one warn) and sendEmail no-ops, so dev, `next build`, `payload generate:types`, and preview deploys never require the key (same self-disable pattern as Vercel Blob storage)."
    enforcedBy: []
  - rule: "Email verification is SOFT — emailVerification.sendOnSignUp is on but there is NO requireEmailVerification, so login is never blocked (existing prod accounts can't be locked out). See [[transactional-email-resend]]."
    enforcedBy: []
  - rule: "Recipient emails are resolved server-side from the request row / authenticated userId (gardeners by role+tenant, customer by id) — never from client input. The new-request recipient list is gardeners + the ops inbox, deduped case-insensitively by buildTeamRecipients."
    enforcedBy: ["scripts/check-email.tsx (npm run check)"]
  - rule: "Templates are pure function components (no hooks/state) so they can be invoked as plain functions from .ts modules (auth.ts, notifications.ts) — every template renders to non-empty HTML carrying its key fields."
    enforcedBy: ["scripts/check-email.tsx (npm run check)"]
verifiedAt: "5050826c95fe7a590270965e69d6e333da807665"
---
## Purpose
The app's outbound email. One seam, `src/lib/email/`, on the Resend SDK + React Email:
- **`client.ts`** — lazy `getResend()`; returns `null` (logged once) when
  `RESEND_API_KEY` is absent, so email simply disables instead of failing the build.
- **`config.ts`** — sender identity (`EMAIL_FROM`, default `onboarding@resend.dev`,
  overridden by the `EMAIL_FROM` env to `Ogrody Kryscar <no-reply@kryscar.pl>` once the
  domain is verified — a no-code flip), `EMAIL_REPLY_TO`/`OPS_INBOX = ogrody@kryscar.pl`,
  `emailLink()`, `formatPlDateTime()`.
- **`send.ts`** — `sendEmail({ to, subject, react })`: renders to HTML and sends; wrapped
  so it NEVER throws.
- **`recipients.ts`** — pure `buildTeamRecipients(gardenerEmails, opsInbox)` (dedupe).
- **`notifications.ts`** — `notifyNewRequest` / `notifyRequestDecision` /
  `notifyVisitScheduled`: resolve recipients + props from Payload, then send.
- **`templates/`** — `Layout` + 5 Polish/branded templates (`VerifyEmail`,
  `ResetPassword`, `NewRequestTeam`, `RequestDecision`, `VisitScheduled`).

## Auth flows
Better Auth ([[customer-auth]]) `emailAndPassword.sendResetPassword` → `ResetPassword`
email; `emailVerification.sendOnSignUp + sendVerificationEmail` → `VerifyEmail` email.
**Soft** verification — no `requireEmailVerification`. UI: `/forgot-password`
(`ForgotPasswordForm` → `authClient.requestPasswordReset`, neutral "if it exists…"
response, no enumeration) and `/reset-password` (`ResetPasswordForm` reads `?token` →
`authClient.resetPassword`); the sign-in page links to forgot-password.

## Notification hook points
Fire-and-forget AFTER the DB write, in the data layer (never awaited into the action):
- `requests.ts createRequest` → `notifyNewRequest` (all tenant gardeners + ops inbox)
  ([[service-requests]]).
- `team.ts acceptRequest` → `notifyRequestDecision(accepted, +first visit date)`;
  `declineRequest` → `notifyRequestDecision(declined, +reason)`; `scheduleNextVisit` →
  `notifyVisitScheduled` ([[team-schedule]]). Accept sends ONE email (the decision,
  carrying the visit date) — not also a visit-scheduled email.

## Ops
`RESEND_API_KEY` + `EMAIL_FROM` live in Vercel (Prod + Dev) and local `.env.local`
(gitignored). The `kryscar.pl` domain is verified in Resend (region `eu-west-1`,
sending enabled), so `EMAIL_FROM` is the kryscar.pl sender. A failed/disabled send is
logged, never retried (no queue — out of scope).

## Anchors
`sendEmail` (the send primitive), `notifyNewRequest` / `notifyRequestDecision` /
`notifyVisitScheduled` (the notify helpers), `buildTeamRecipients` (pure recipient dedupe).

## Lineage
sources → [[2026-06-16-transactional-email-design]]; rationale (direct SDK over the
Payload adapter, soft verification, graceful no-op, single EMAIL_FROM flip) →
[[transactional-email-resend]].
