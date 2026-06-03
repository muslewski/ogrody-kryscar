---
type: debt
summary: "Once signup is linked from the nav it's publicly discoverable — confirm Better Auth rate-limiting is configured and add bot protection before relying on it in production."
tags: [auth, security]
status: open
created: 2026-06-03
updated: 2026-06-03
related: ["[[customer-auth]]", "[[auth-portal]]"]
sources: []
severity: med
effort: med
---
## Problem
The nav-auth feature surfaces `/sign-up` to the public. Today `lib/auth.ts` does not configure `rateLimit` explicitly (Better Auth applies defaults in production, in-memory only) and there is no bot/abuse protection — so a public, discoverable signup is open to spam/bot account creation and credential-stuffing on `/sign-in`.
## Fix
Per the `better-auth-security-best-practices` skill: set an explicit `rateLimit` (window/max, and `storage: "database"` or secondary-storage so limits hold across instances on Vercel), and add bot protection on the auth endpoints (e.g. Vercel BotID or a CAPTCHA). Revisit before a real public launch; medium severity (low-traffic MVP is tolerable), medium effort.
