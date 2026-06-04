---
type: decision
summary: "The authenticated app UI is built with shadcn (new-york) on the radix-ui umbrella, with an a11y-first structure (real landmarks + accessible names) as the AI-navigability contract — the clean accessibility tree is what browser agents (Claude-in-Chrome) read. No bespoke agent tooling."
tags: [ui, convention, app-shell, a11y]
status: active
created: 2026-06-04
updated: 2026-06-04
related: ["[[app-shell]]", "[[ui-primitives]]", "[[auth-portal]]"]
sources: ["[[2026-06-04-app-shell-and-auth-placement-design]]"]
decided: 2026-06-04
supersededBy: ""
---
## Context
The customer/gardener portal is being built out. We want one UI system and a
structure that humans, screen readers, AND browser-driving AI agents can navigate.
## Decision
App UI = shadcn (new-york) components on the `radix-ui` umbrella. Every view uses
real landmarks (`main`, `nav` with an accessible name, headings) and accessible
names on interactive elements. The resulting accessibility tree IS the contract a
browser agent reads — no separate machine API. The Mind carries an app-map
([[app-shell]]) so an agent orients via the knowledge base before touching the browser.
## Why
shadcn/Radix already emit strong semantic + aria markup, so a11y-first costs little
and pays triple (humans, AT, agents). We verified Playwright/Claude-in-Chrome
accessibility snapshots of these pages are clean and readable.
## Consequences
New app surfaces follow this convention. Vendored shadcn primitives may keep the
CLI's import style; that is a tolerated exception, not the rule for app code.
