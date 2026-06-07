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

## Dashboards
Live, frontmatter-driven views over the structured (`type:`-tagged) corpus
(`bases/`; open in Obsidian — require the **Bases** core plugin). They aggregate
the typed notes and **complement** the code-verifying generator — they never replace
it; `.base` files live outside `map/` and outside every generator glob.

- [[ledger.base]] — tech-debt board · decisions log · spec → plan pipeline
- [[map.base]] — zone atlas (by status)

Authoring these uses the vendored obsidian-skills (`obsidian-markdown`,
`obsidian-bases`, `json-canvas`) under `.claude/skills/`.

## Workflow
Generated index: `map/index.md` (do NOT hand-edit — run `npm run mind`).
Orient before coding; update + re-stamp `verifiedAt` when you finish.
