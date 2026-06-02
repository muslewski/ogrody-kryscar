# kryscar-mind — the Mind

The single source of truth for understanding this repository. `.claude/` (CLAUDE.md,
the navigating skill, /map-sync, the hook) only **points into** this vault — it never
copies it.

## Map vs Ledger
- **Map** (`map/`) — PRESENT tense, what IS, mutable, tracks the code.
- **Ledger** (`specs/ plans/ ideas/ tech-debt/`) — PAST tense, why/how we decided & built.
  Read-only once consumed: **supersede, don't edit**.

Lineage: prompt → idea → spec → plan → [implementation] → zone card / decision record.

## Resolution ladder
`map/index.md` (TOC) → `map/zones/<slug>.md` (the hinge) → the code → `map/decisions/`.

## Frontmatter schema
Universal: `type, summary, tags, status, created, updated, related[], sources[]`.
Per type:
- `zone`: `owns:{routes,anchors,globs}`, `depends[]`, `invariants:[{rule,enforcedBy[]}]`, `verifiedAt`
- `entity`: `anchor`, `intent`
- `flow`: `steps[]` (e.g. `symbol:Foo`, `route:/x`, `glob:src/..`), `verify`, `e2e[]`
- `decision`: `decided`, `supersededBy`
- `spec`: `origin`
- `plan`: `implements`, `produced[]`
- `idea`: `maturity`
- `debt`: `severity`, `effort`

Anchors (this repo has no data-testid): `glob:<path>` (≥1 tracked file), `symbol:<exportName>`,
`route:<app-path>`. The generator verifies all of these.

## Lifecycles
spec: draft→planned→superseded · plan: draft→executing→done→abandoned ·
debt: open→done→wontfix · idea: active→promoted→archived ·
zone|flow|entity|decision: active→unmounted (TOMBSTONE — never delete).

## Workflow
Generated index: `map/index.md` (do NOT hand-edit — run `npm run mind`).
Orient before coding; update + re-stamp `verifiedAt` when you finish.
