---
type: debt
summary: "The /panel and /zespol gates do a Payload users query per request to read role, instead of carrying role in the Better Auth session."
tags: [auth, perf]
status: open
created: 2026-06-03
updated: 2026-06-03
related: ["[[auth-portal]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
severity: low
effort: low
---
## Problem
Each gated layout calls `auth.api.getSession` then a Payload `users` find to read `role`. getSession's user does not include our custom `role`/`tenant` (BA only returns its declared schema), so the gate makes an extra DB round-trip on every /panel + /zespol request.
## Fix
Declare `role` (and `tenant`) as Better Auth `user.additionalFields` (`input: false`) so they ride in the session and the gate can branch without the Payload query. Verify BA populates input:false fields from the adapter's returned doc before removing the lookup. Low severity (correct today), low effort.
