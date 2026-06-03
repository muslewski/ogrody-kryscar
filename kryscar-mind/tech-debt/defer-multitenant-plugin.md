---
type: debt
summary: "The BA organization plugin + @payloadcms/plugin-multi-tenant (members, invitations, partner onboarding, tenant-scoped enforcement) are deferred — only the single-tenant seam exists."
tags: [platform, auth, data]
status: open
created: 2026-06-03
updated: 2026-06-03
related: ["[[tenancy-and-roles]]", "[[tenancy-seam-not-plugin]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
severity: low
effort: high
---
## Problem
Tenancy is a structural seam (one Kryscar tenant); the usable multi-tenant machinery is intentionally absent. Onboarding partner gardeners needs: the BA `organization` plugin (organization/member/invitation), `@payloadcms/plugin-multi-tenant`, a gardening-company panel (their own BA login + role-gated UI), and real tenant-scoped access enforcement across domain collections.
## Fix
When a second company is onboarded: add the org collections + enable the plugins (the custom adapter maps the new BA models with no rewrite), promote the default-tenant hook into a real customer→tenant assignment system, and tighten access control to scope by `tenant`. Low severity (no current need); high effort.
