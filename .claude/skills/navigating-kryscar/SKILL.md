---
name: navigating-kryscar
description: Use FIRST when starting work in the ogrody-kryscar repo — orient via the Mind (kryscar-mind/) before reading code, so you don't reinvent existing zones. Points to the Map index, zone cards, and conventions.
---

# Navigating ogrody-kryscar

This repo has a knowledge base ("the Mind") at `kryscar-mind/`. **Orient there before coding.**

## How to orient (cheapest first)
1. Read `kryscar-mind/map/index.md` — the generated zone list (status + freshness + 1-line essence).
2. Open the relevant `kryscar-mind/map/zones/<slug>.md` — purpose, the code anchors it owns, invariants, and `sources` lineage.
3. Trace `sources:` wikilinks into `kryscar-mind/specs|plans|decisions/` for the "why".
4. Only then read the code the zone points to.

## Conventions
- Framework rules live in `AGENTS.md` (this is a modified Next.js 16 — read `node_modules/next/dist/docs/` before writing Next code).
- Intent docs: brainstorming → `kryscar-mind/specs/`; plans → `kryscar-mind/plans/`.

## Authoring the vault
For file-format syntax — Obsidian Flavored Markdown, `.base` dashboards (`kryscar-mind/bases/`), `.canvas` maps — use the `obsidian-markdown` / `obsidian-bases` / `json-canvas` skills (third-party craft; they describe syntax, never a zone).

## On finish
Update touched zone cards, re-stamp `verifiedAt` to HEAD, add decision records for non-obvious "why", file tech-debt for deferrals, then `npm run mind` and commit `index.md`. (Full rule in CLAUDE.md.)

Do NOT restate zone contents here — this skill only points into the Mind.
