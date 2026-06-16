---
type: debt
summary: "Transactional email is fire-and-forget with no retry/dead-letter: a failed send (Resend down, transient network, render error) is logged and dropped. Tolerable for notifications, but a dropped PASSWORD-RESET or VERIFICATION email strands the user until they retry."
tags: [email, auth, reliability]
status: open
created: 2026-06-16
updated: 2026-06-16
related: ["[[transactional-email]]", "[[transactional-email-resend]]", "[[customer-auth]]"]
sources: ["[[2026-06-16-transactional-email-design]]"]
severity: low
effort: med
---
## Problem
`sendEmail` (`src/lib/email/send.ts`) deliberately swallows all errors so a send can
never break a flow ([[transactional-email]]). The trade-off: there is **no retry and no
dead-letter** — a transient Resend/network failure or a render error just logs to
`console.error` and the email is gone. For the order/visit notifications this is fine
(low stakes, the data is still in the app). For **password reset** and **email
verification** it's worse: the user sees the neutral "if it exists, we sent a link"
response but no email ever arrives, and they have to notice and retry themselves.

This was an explicit MVP scope decision (see [[transactional-email-resend]] — "no retry
queue") to keep the first cut simple. It is not a bug; it's a deferred reliability gap.

## When it bites
- Resend outage or rate-limit at the moment of a reset request.
- A bad `EMAIL_FROM` / unverified-domain regression (sends would bounce/fail silently).
- A template render throw (shouldn't happen — templates are pure and checked — but
  `sendEmail` would swallow it).

## Options (when volume / support load justifies it)
1. **Surface failures, don't retry** (cheap): have `sendEmail` return a boolean and let
   the auth callbacks log a structured error (or a Sentry event) so a failed reset is at
   least visible to ops. Lowest effort, biggest safety win for the auth path.
2. **Vercel Queues / a small retry wrapper** for the auth emails only — at-least-once
   delivery for reset/verify, leave notifications fire-and-forget.
3. **Resend webhooks** (`email.bounced` / `email.delivery_delayed`) → record per-send
   status so support can see "the reset email bounced". Pairs well with making the demo
   accounts use real, deliverable addresses.

## Not doing now
A full durable queue/dead-letter is overkill at current volume (single tenant, low
traffic). Revisit when there's a real support signal of "didn't get the email".
