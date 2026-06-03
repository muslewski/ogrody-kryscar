---
type: debt
summary: "No email verification, password reset, or transactional email — signups land emailVerified:false and Payload logs email to console (no Resend adapter)."
tags: [auth]
status: open
created: 2026-06-03
updated: 2026-06-03
related: ["[[customer-auth]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
severity: med
effort: med
---
## Problem
The MVP foundation ships email+password WITHOUT a verification flow (slice-1 parity with delieta): users are created `emailVerified: false`, there is no verify or reset endpoint, and Payload warns "No email adapter provided" (email → console).
## Fix
Wire an email adapter (Resend) + Better Auth `emailVerification.sendVerificationEmail` / `sendResetPassword` when phase 2 needs the "work done" emails. Decide whether to gate sign-in on verified email. Medium severity (fine for a trusted early cohort), medium effort.
