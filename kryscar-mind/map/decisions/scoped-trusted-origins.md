---
type: decision
summary: "Better Auth trustedOrigins lists our explicit domains plus THIS deployment's own VERCEL_URL/VERCEL_BRANCH_URL — never the platform-wide https://*.vercel.app wildcard, which would trust every Vercel deployment on the internet as a CSRF origin."
tags: [auth, security, vercel]
status: active
created: 2026-06-10
updated: 2026-06-10
related: ["[[customer-auth]]", "[[auth-portal]]"]
sources: []
decided: 2026-06-10
supersededBy: ""
---
## Context
`trustedOrigins` originally included `https://*.vercel.app` so preview deployments
could always log in (the resolved `baseURL` prefers `VERCEL_PROJECT_PRODUCTION_URL`,
which points at production even on previews — so the preview's own origin was not in
the list and the wildcard papered over that). But the wildcard matches **anyone's**
Vercel deployment: an attacker can deploy a page on `evil.vercel.app` and Better Auth
would accept it as a trusted origin for state-changing requests and redirect targets.
## Decision
Trust explicitly: `baseURL`, localhost dev, `kryscar.pl` + `www`, and — when running
on Vercel — this deployment's own `https://${VERCEL_URL}` and
`https://${VERCEL_BRANCH_URL}` (both injected per deployment; `VERCEL_BRANCH_URL`
added to the env schema as optional). Previews keep working because every preview
trusts exactly its own URLs.
## Why
Origin trust is a CSRF boundary; a platform-wide wildcard makes it meaningless. The
per-deployment env vars give the same "previews just work" ergonomics with the trust
scoped to us. Residual gap: a custom preview alias outside those two URLs would be
rejected — add it to the explicit list if one is ever configured.
