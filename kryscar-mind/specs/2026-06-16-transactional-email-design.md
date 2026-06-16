---
type: spec
summary: "Transactional email via Resend + React Email: Better Auth password-reset and soft (non-blocking) email verification, plus order/visit notifications (new request → team; accepted/declined/visit-scheduled → customer). Self-disabling when RESEND_API_KEY is absent; sends never break a DB write."
tags: [app, auth, email, notifications, resend]
status: active
created: 2026-06-16
related: ["[[customer-auth]]", "[[service-requests]]", "[[team-schedule]]", "[[auth-portal]]", "[[payload-backend]]"]
supersedes: []
---

# Transactional email (Resend) — design

## Context

The app cannot send any email today. `src/lib/auth.ts` runs Better Auth with
`emailAndPassword: { enabled: true }` but **no** `sendResetPassword` and **no**
`emailVerification` (both explicitly deferred in slice 1). There is no email
package, no Payload email transport, and no `RESEND_*` env var. Practical fallout:

- **Password reset is dead** — a customer who forgets their password is stuck (the
  demo accounts had to be reset via the seed script).
- **No email verification** — signups are never confirmed.
- **No notifications** — a `service-request` lands in the DB and only `/admin` sees
  it; customers learn nothing when a request is accepted/declined or a visit is set.

Decided with the owner (2026-06-16):
- **Scope:** password reset + email verification + order/visit notifications (all
  three). No marketing/broadcast, no contact-form email, no in-app notification
  centre (YAGNI).
- **Verification is SOFT** — send on signup, mark verified on click, but **never
  block sign-in** (no `requireEmailVerification`), so the already-live prod accounts
  can't be locked out.
- **Sender:** `From: Ogrody Kryscar <no-reply@kryscar.pl>`, `Reply-To: ogrody@kryscar.pl`.
- **New-request notification recipients:** all `role=gardener` users in the tenant
  **and** the fixed inbox `ogrody@kryscar.pl`.
- **DNS:** owner adds the `kryscar.pl` Resend records (guided); until verified, send
  from `onboarding@resend.dev`.

`RESEND_API_KEY` is already saved to Vercel Production + Development and to local
`.env.local` (gitignored).

## Approach

**Resend SDK directly + React Email templates**, in a self-contained `src/lib/email/`
module. Better Auth has no "Resend adapter" — its reset/verify features call a
function you supply, so a direct sender is required regardless. React Email gives
cross-client HTML and Resend supports it first-class.

*Rejected:* `@payloadcms/email-resend` — wires only `payload.sendEmail`; Better Auth
(where reset/verify live) wouldn't use it, leaving two email paths.

## Architecture

### `src/lib/email/` module (the one email seam)
- **`client.ts`** — lazily builds the Resend client from `RESEND_API_KEY`. If the key
  is **absent**, the client is null and `sendEmail` becomes a logged no-op. Mirrors
  the Vercel Blob "self-disables when token absent" pattern, so `next build`,
  `payload generate:types`, and key-less dev never fail. Reads `process.env` directly
  (not `src/lib/env.ts`) for the same reason the Payload config does.
- **`config.ts`** — sender constants: `FROM` (`no-reply@kryscar.pl`, or
  `onboarding@resend.dev` while the domain is unverified — chosen by a single
  `EMAIL_FROM` env override defaulting to the onboarding sender so prod can flip
  without a deploy once DNS verifies), `REPLY_TO = ogrody@kryscar.pl`, `OPS_INBOX =
  ogrody@kryscar.pl`, and `appUrl()` (deep-link base, from the existing base-url helper).
- **`send.ts`** — `sendEmail({ to, subject, react })`: renders the React Email
  component to HTML (`@react-email/render`), calls Resend, wrapped in try/catch that
  **never throws and never returns a rejected promise** — a failed send is logged via
  `console.error` and swallowed. This is the invariant that keeps notifications from
  rolling back a DB write.
- **`notifications.ts`** — typed helpers that assemble recipients + props and call
  `sendEmail`: `notifyNewRequest(...)`, `notifyRequestDecision(...)`,
  `notifyVisitScheduled(...)`. Each is fire-and-forget (`void notify...().catch()`),
  called by the data layer AFTER the write succeeds.
- **`templates/`** — React Email components, Polish, emerald-branded, sharing one
  `Layout` (logo/header + footer with address). Five:
  - `VerifyEmail` — { name, url }
  - `ResetPassword` — { name, url }
  - `NewRequestTeam` — { customerName, lawnName, address, items[], note, estRange, url→/zespol/zlecenia }
  - `RequestDecision` — { customerName, lawnName, decision: "accepted" | "declined", visitDate?, reason?, url→/panel/zamowienia }
  - `VisitScheduled` — { customerName, lawnName, scheduledAt, url→/panel }

### Auth wiring — `src/lib/auth.ts`
- `emailAndPassword.sendResetPassword({ user, url })` → `ResetPassword` email.
- `emailVerification: { sendOnSignUp: true, sendVerificationEmail({ user, url }) }` →
  `VerifyEmail` email. **No `requireEmailVerification`** (soft).
- Both callbacks just call the email module; no other auth behaviour changes.

### New auth UI — under `src/app/(public)/(auth)/`
- **`/forgot-password`** — email field → `authClient.forgetPassword({ email,
  redirectTo: "/reset-password" })`; always shows a neutral "if the address exists,
  we sent a link" result (no account enumeration).
- **`/reset-password`** — reads `token` from the URL query → new-password form →
  `authClient.resetPassword({ newPassword, token })`; on success redirect to
  `/sign-in`. (Exact client method names confirmed against the Better Auth version
  during implementation — the email-and-password best-practices skill covers this.)
- **Sign-in page** — add a "Nie pamiętasz hasła?" link to `/forgot-password`.
- **Verification click** → Better Auth's own `/api/auth/verify-email` verifies the
  token and redirects to its `callbackURL` (`/panel`); no new heavy page. (Loop-safe
  with the existing layout role gate: a gardener landing on `/panel` bounces to
  `/zespol`.)

### Notification hook points (after the DB write, fire-and-forget)
| Trigger | File / function | Recipients | Helper |
|---|---|---|---|
| Customer submits a request | `src/lib/requests.ts` (create) | all tenant gardeners **+** ops inbox | `notifyNewRequest` |
| Gardener accepts (+1st visit) | `src/lib/team.ts` `acceptRequest` | customer | `notifyRequestDecision` (accepted, visitDate) |
| Gardener declines | `src/lib/team.ts` `declineRequest` | customer | `notifyRequestDecision` (declined, reason) |
| Next visit scheduled | `src/lib/team.ts` `scheduleNextVisit` | customer | `notifyVisitScheduled` |

Recipient + content data is already in or adjacent to these functions: the customer
email comes from the `users` collection (look up by the request's `customer`/owner id,
`depth:0`); gardener emails come from a `role=gardener` + tenant query (a small new
accessor, e.g. `getTenantGardenerEmails(tenantId)`); lawn name, service titles, est
range, decline reason and visit date are already passed/derivable there. Deep-links
use the base-url helper. The accept path notifies once (the decision email carries the
first visit date) — it does NOT also fire `notifyVisitScheduled`, to avoid two emails
for one action.

## Error handling & resilience
- **No send can break a flow.** `sendEmail` swallows all errors; data-layer callers
  use `void helper().catch(...)` so the action returns success regardless of email.
- **Key absent → silent no-op** (logged once at warn). Covers dev, build,
  `generate:types`, and preview deploys.
- **Domain unverified → send fails inside Resend**; swallowed + logged. Mitigated by
  defaulting `EMAIL_FROM` to `onboarding@resend.dev` until DNS verifies.
- **No account enumeration** on `/forgot-password` (uniform response).

## Testing
- **`scripts/check-email.ts`** (added to `npm run check:logic`): pure assertions with
  node:assert — every template renders to non-empty HTML containing its key fields
  (e.g. the reset URL, the decline reason, the visit date), and the recipient-list
  builder dedupes the ops inbox when a gardener IS `ogrody@kryscar.pl`. No network.
- **Manual**: trigger a real reset + a real request against the deployed site once
  DNS verifies; confirm delivery and Reply-To.
- `npm run check` (tsc + eslint + generate:types + mind + check:logic) stays green.

## Env & ops
- `.env.example` gains `RESEND_API_KEY=` and `EMAIL_FROM=` (documented, placeholder).
- `RESEND_API_KEY` already in Vercel Prod + Dev; `EMAIL_FROM` set to
  `no-reply@kryscar.pl` in prod only once the domain verifies (until then the default
  onboarding sender is used).
- **DNS (guided):** create/confirm the `kryscar.pl` domain in Resend (can be done via
  the Resend API with the saved key), then the owner pastes the shown SPF/DKIM/(DMARC)
  records into the registrar; verify before flipping `EMAIL_FROM`.

## Mind maintenance (on finish)
- New zone card `transactional-email` (owns `src/lib/email/**`, the two auth routes,
  `scripts/check-email.ts`; anchors `sendEmail`, the notify helpers, the templates).
- Update `customer-auth` (reset + soft verification now wired; the slice-1 "no email
  verification" note is superseded), `service-requests` and `team-schedule` (notify
  hook points), `payload-backend`/env docs.
- Decision record `transactional-email-resend` — why direct SDK over the Payload
  adapter, soft verification, graceful no-op, single `EMAIL_FROM` flip.
- `npm run mind`; commit the regenerated index with the code.

## Out of scope (YAGNI)
Marketing/broadcast email, contact-form email, in-app notification centre, SMS,
per-user notification preferences, digesting/batching, retry queue (a failed send is
logged, not retried).
