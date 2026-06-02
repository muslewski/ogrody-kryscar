---
type: spec
summary: "The Mind: an Obsidian-vault repository knowledge base with a verifying generator and .claude projections."
tags: [meta, tooling]
status: planned
created: 2026-06-02
updated: 2026-06-02
related: ["[[the-mind]]"]
sources: []
origin: "User: set up 'the Mind' — a queryable repository knowledge system so agents don't reinvent the wheel."
---
# "The Mind" — repository knowledge base — Design

**Date:** 2026-06-02
**Vault:** `kryscar-mind/` (Obsidian vault at repo root)
**Scope:** Stand up an agent-native, human-queryable knowledge base over the existing codebase, wired into the dev workflow. No application code is rewritten.

> Note: this bootstrapping spec is authored under `docs/superpowers/specs/` (the pre-Mind convention). The implementation **migrates it** — along with the other existing specs/plans — into `kryscar-mind/`, after which all future intent docs originate in the vault.

## Goal

Make understanding the system cheap and reliable for AI agents and humans: a single source of truth that agents query to orient before working (so they stop reinventing) and update when they finish (so the Map never drifts). Built on the proven "Mind" recipe, adapted to this repo.

## Philosophy (the contract)

`kryscar-mind/` is the SINGLE SOURCE OF TRUTH for understanding the system. Everything in `.claude/` (CLAUDE.md, the skill, the command, the hook) is a **projection** (derived) or a **pointer** (into the vault) — never a copy.

Two kinds of knowledge, never conflated:

| THE MAP (`map/`) | THE LEDGER (`specs/ plans/ ideas/ tech-debt/`) |
|---|---|
| PRESENT — what IS | PAST — how/why we decided & built it |
| mutable, tracks code | read-only once consumed (supersede, don't edit) |
| answers what / where / how-now | answers why / what we intended |

Lineage joins them ("git blame for intent"): prompt → idea → spec → plan → [implementation] → zone card / decision record.

Resolution ladder (read the cheapest note that answers the question):
- `map/index.md` — generated TOC (zones + status + essence)
- `map/zones/<slug>.md` — the hinge: purpose, anchors, invariants, lineage
- the code itself (+ optional `type:entity` intent notes on load-bearing parts)
- `map/decisions/` — ADR-shaped: context, decision, why, supersedes

## Approved decisions

- **Vault:** `kryscar-mind/` at repo root.
- **Ledger:** migrate the 4 existing `docs/superpowers/` docs into the vault; retire `docs/superpowers/`; future specs/plans originate in the vault.
- **Gate:** hard. `npm run check` = `tsc --noEmit && eslint && node scripts/mind/generate.mjs`. Generator exits non-zero on hard errors; stale zones are non-fatal warnings.
- **Generator:** plain Node ESM (`scripts/mind/*.mjs`, no TS build step), using **`gray-matter`** (new devDependency) for frontmatter parsing.
- **Zones:** the 11 listed below.

## Vault structure

```
kryscar-mind/
  README.md                                 # property schema + how-to
  map/
    zones/        <slug>.md                  # type: zone
    decisions/    <slug>.md                  # type: decision (ADR)
    flows/        <slug>.md                  # type: flow
    entities/     <slug>.md                  # type: entity (opt-in, load-bearing only)
    index.md                                 # GENERATED — do not hand-edit
  specs/   plans/   ideas/   tech-debt/       # the Ledger
  templates/                                  # one template per note type
  .obsidian/                                  # shared config committed
```

`.gitignore`: commit `kryscar-mind/.obsidian/` core config but ignore `kryscar-mind/.obsidian/workspace*.json`.

## Property schema (frontmatter)

UNIVERSAL (all types): `type`, `summary` (1–3 sentence human glance), `tags: []`, `status`, `created`, `updated`, `related: []` (lateral wikilinks), `sources: []` (lineage wikilinks).

PER-TYPE EXTRAS:
- `zone` → `owns: { routes: [], anchors: [], globs: [] }`, `depends: [[..]]`, `invariants: [{ rule, enforcedBy: ["[[lint:..]]","[[test:..]]"] }]`, `verifiedAt: <commit-SHA | "">`
- `entity` → `anchor: <id|route|symbol>`, `intent: "one-line"`
- `flow` → `steps: ["symbol:<name>", "route:<path>", "glob:<path>"]`, `verify: "observable success"`, `e2e: [[file]]`
- `decision` → `decided: YYYY-MM-DD`, `supersededBy: [[id]]`
- `spec` → `origin: "<seeding prompt>"`
- `plan` → `implements: [[spec]]`, `produced: ["[[zone]]","[[decision]]"]`
- `idea` → `maturity: seed | budding | evergreen`
- `debt` → `severity: low|med|high|critical`, `effort: low|med|high`

LIFECYCLE (status):
- `spec`: draft → planned (read-only) → superseded
- `plan`: draft → executing → done (read-only) → abandoned
- `debt`: open → done (read-only) → wontfix
- `idea`: active → promoted → archived
- `zone|flow|entity|decision`: active → unmounted (TOMBSTONE, never deleted)

## Anchors (this repo)

No `data-testid` exists in the codebase, so anchors are:
- **`glob:<path>`** — must match ≥1 tracked file (validated via `git ls-files`).
- **`symbol:<name>`** — an exported identifier; verified by grep for an `export` of that name in tracked source.
- **`route:<path>`** — an App Router path; verified by resolving to a `page.tsx`/`route.ts` under `src/app`.

## Generator contract (`scripts/mind/generate.mjs`)

1. Parse every `map/zones/*.md` (`type: zone`) and `map/flows/*.md` with `gray-matter`.
2. For each zone verify anchors resolve:
   - every `owns.globs` entry matches ≥1 tracked file — else **HARD ERROR**
   - every `owns.anchors` symbol/route resolves in code — else **HARD ERROR**
3. FRESHNESS: if any file matching a zone's globs changed in git since `verifiedAt` SHA → mark "⚠ stale" (non-fatal). `verifiedAt: ""` ⇒ stale.
4. INVARIANTS: any `invariant` with empty `enforcedBy` → list under "Verification gaps" (non-fatal) + suggest filing tech-debt.
5. FLOWS: every flow step anchor must resolve — else **HARD ERROR**.
6. WRITE `map/index.md`: generated/do-not-edit banner; table (Zone | Status | Freshness | Summary) sorted; "## ⚠ Verification gaps"; "## Attic" (unmounted/tombstoned zones).
7. EXIT NON-ZERO on any hard error.

`npm run mind` → runs the generator. `npm run check` → `tsc --noEmit && eslint && node scripts/mind/generate.mjs`.

## SessionStart status hook (`scripts/mind/status.mjs`)

Pure file I/O (reads `map/index.md`, counts zones + open tech-debt), no exec, non-blocking. Prints:
`🧠 Mind: N zones · M open tech-debt — orient via kryscar-mind/map/index.md before coding.`
Registered in `.claude/settings.json` under `hooks.SessionStart` (coexists with plugin hooks).

## Zones (initial Map — exact globs/anchors)

| slug | summary | owns.globs | owns.anchors (symbol/route) |
|---|---|---|---|
| **the-mind** | The knowledge-base system itself: generator, status hook, skill, command. | `scripts/mind/**`, `.claude/commands/map-sync.md`, `.claude/skills/navigating-kryscar/SKILL.md` | `glob:scripts/mind/generate.mjs`, `glob:scripts/mind/status.mjs` |
| **homepage-and-variants** | The root homepage (re-exports example-9) and the 10 design-variant pages. | `src/app/page.tsx`, `src/app/example-*/**` | `route:/`, `route:/example-9` |
| **service-catalog** | Services data, categories, catalog enrichment, the filter+reorder client island. | `src/components/service-catalog.tsx`, `src/lib/catalog.ts`, `src/lib/data.ts` | `symbol:ServiceCatalog`, `symbol:getCatalogServices`, `symbol:SERVICES`, `symbol:CATEGORIES` |
| **city-landing-pages** | Local-SEO `/ogrodnik/[miasto]` pages + the Payload-ready location data layer. | `src/app/ogrodnik/**`, `src/lib/locations.ts`, `src/components/LocationJsonLd.tsx` | `route:/ogrodnik/[miasto]`, `symbol:getAllLocations`, `symbol:getLocationBySlug`, `symbol:Location` |
| **coverage-map** | Service-area geography + the static coverage map. | `src/components/CoverageMap.tsx`, `src/components/PolandMap.tsx`, `src/lib/coverage.ts` | `symbol:CoverageMap`, `symbol:COVERAGE_CITIES` |
| **pricing-calculator** | Pricing algorithm + the interactive calculator form. | `src/lib/calculator.ts`, `src/components/CalculatorForm.tsx` | `symbol:calculatePrice`, `symbol:CalculatorForm` |
| **layout-chrome** | Root layout, header, footer, preloader, socials. | `src/app/layout.tsx`, `src/components/SiteHeader.tsx`, `src/components/SiteFooter.tsx`, `src/components/SitePreloader.tsx`, `src/components/Socials.tsx` | `symbol:SiteHeader`, `symbol:SiteFooter` |
| **seo** | sitemap, robots, canonical/metadataBase. | `src/app/sitemap.ts`, `src/app/robots.ts` | `symbol:SITE_URL`, `route:/sitemap.xml`, `route:/robots.txt` |
| **motion-and-3d** | Motion primitives, warped image, 3D section, counters, scroll hook. | `src/components/motion.tsx`, `src/components/WarpedHoverImage.tsx`, `src/components/AntigravitySection.tsx`, `src/components/Antigravity.jsx`, `src/components/Stat.tsx`, `src/components/CountUp.tsx`, `src/components/AnimatedNumber.tsx`, `src/components/use-is-scrolled.ts`, `src/components/react-bits/**` | `symbol:HoverCard`, `symbol:WarpedHoverImage` |
| **ui-primitives** | shadcn/radix primitives. | `src/components/ui/**` | `glob:src/components/ui/scroll-area.tsx` |
| **brand-data** | Company identity, address, socials, legal links, image map, site URL. | `src/lib/data.ts` | `symbol:COMPANY`, `symbol:ADDRESS`, `symbol:SOCIALS`, `symbol:IMG`, `symbol:SITE_URL` |

Notes: `data.ts` is intentionally shared by `service-catalog` + `brand-data` (different symbol anchors). Each zone card gets `verifiedAt: <HEAD SHA>` at authoring. `the-mind` owns its **implementation** (scripts/skill/command), never the vault markdown — this avoids the self-referential perpetual-stale trap.

## Seed decision records (real "why" from history)

- **payload-ready-location-layer** — async `getAllLocations/getLocationBySlug` over a serializable `Location`; only `locations.ts` knows the source. `sources: [[city-pages spec]]`.
- **single-source-site-url** — `SITE_URL` in `data.ts` consumed by layout/sitemap/robots/JSON-LD.
- **single-select-catalog-filter** — single-select tabs + motion `popLayout` reorder.
- **city-pages-avoid-thin-content** — per-city unique copy + verified coordinates; doorway-page avoidance.

Each links `sources` to the migrated spec/plan it came from. One verification gap is filed as tech-debt up front: **enforce the locations-import boundary** (no component may import `LOCATIONS`) via an ESLint `no-restricted-imports` rule — currently a convention, not enforced.

## `.claude/` projections

- **CLAUDE.md** (currently just `@AGENTS.md`) → add the **Mind-first DEV RULE** (highest priority): orient via `kryscar-mind/map/index.md` → zone card → trace `sources` before working; on finish (same change as the code) update touched zone cards, re-stamp `verifiedAt` to HEAD, add decision records for non-obvious "why", file tech-debt for deferrals, run the generator, commit `index.md`. **Pipeline override:** brainstorming → `kryscar-mind/specs/`, writing-plans → `kryscar-mind/plans/`. Keep `@AGENTS.md`.
- **`.claude/skills/navigating-kryscar/SKILL.md`** — thin entry ramp pointing to `index.md` + zone cards + `AGENTS.md`. Must NOT duplicate the Map.
- **`.claude/commands/map-sync.md`** — rebuild + validate the index; report stale zones and gaps.
- **`.claude/settings.json`** — register the SessionStart status hook.

## Living convention (three-phase loop)

1. **Intent** — brainstorming → `kryscar-mind/specs/`; writing-plans → `kryscar-mind/plans/`; capture seeding prompt in spec `origin`.
2. **Implementation** — execute (subagent-driven-development); write/update zone cards & decision records as code lands.
3. **Recollection** — flip plan to `done` + fill `produced`; update zone cards; re-stamp `verifiedAt`; add decisions; file tech-debt; run generator; commit `index.md`.

## Migration

Move into the vault, adding the required frontmatter (status `planned` for specs, `done` for the two completed plans):
- `docs/superpowers/specs/2026-06-02-catalog-category-filter-animation-design.md` → `kryscar-mind/specs/`
- `docs/superpowers/specs/2026-06-02-local-seo-city-pages-design.md` → `kryscar-mind/specs/`
- `docs/superpowers/specs/2026-06-02-the-mind-knowledge-base-design.md` (this file) → `kryscar-mind/specs/`
- `docs/superpowers/plans/2026-06-02-catalog-category-filter-animation.md` → `kryscar-mind/plans/`
- `docs/superpowers/plans/2026-06-02-local-seo-city-pages.md` → `kryscar-mind/plans/`
Then remove the empty `docs/superpowers/` tree.

## Self-check (done criteria)

- [ ] `npm run mind` runs green; `npm run check` gates on hard errors.
- [ ] `index.md` lists all 11 zones; every zone's anchors resolve in code.
- [ ] `the-mind` zone is NOT perpetually stale (owns its scripts, not markdown).
- [ ] CLAUDE.md carries the Mind-first dev rule + pipeline override.
- [ ] SessionStart status hook prints on a fresh session.
- [ ] No copies: skill/CLAUDE.md point INTO the Mind.
- [ ] Map (present) and Ledger (past) never conflated; tombstone over delete.

## Out of scope

No application-code changes; no new test runner; no CI-provider config (only the local `check` script + the gate it runs). No Obsidian plugins beyond core config.
