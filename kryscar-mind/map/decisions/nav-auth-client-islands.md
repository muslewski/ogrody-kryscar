---
type: decision
summary: "The session-aware auth button + mobile nav are client islands (HeaderAuth, MobileNav), not a dynamic server header — so the marketing pages stay statically generated."
tags: [auth, frontend, ui]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[layout-chrome]]", "[[auth-portal]]"]
sources: ["[[2026-06-03-nav-auth-responsive-design]]"]
decided: 2026-06-03
supersededBy: ""
---
## Context
The marketing pages are statically generated (`○`) for speed/caching. The nav now needs to (a) show "Zaloguj" vs "Panel" based on the session, and (b) have an interactive mobile menu — both of which need the browser (session / `useState`).
## Decision
Keep `SiteHeader`/`SiteFooter` as **server** components and add two small **client islands**: `HeaderAuth` (`useSession` → Zaloguj/Panel) and `MobileNav` (hamburger + dropdown). Do NOT make the header session-aware on the server (which would force every page to render per-request).
## Why
Client islands hydrate inside a statically-rendered page, so `/`, `/realizacje`, etc. stay `○` (verified in the build) while still being session-aware and interactive. A server-side session read in the shared header would have flipped the whole marketing site to `ƒ` (dynamic) — a real perf/caching regression.
## Consequences
`HeaderAuth` links to `/panel` for any logged-in user (the gate routes gardeners to `/zespol`), so it needs no role in the session. Only `/sign-in` + `/sign-up` became `ƒ` (they read the session for the logged-in redirect) — expected.
