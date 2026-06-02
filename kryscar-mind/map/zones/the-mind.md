---
type: zone
summary: "The knowledge-base system itself — generator, status hook, navigating skill, and /map-sync command."
tags: [meta]
status: active
created: 2026-06-02
updated: 2026-06-02
related: []
sources: []
owns:
  routes: []
  anchors: ["glob:scripts/mind/generate.mjs", "glob:scripts/mind/status.mjs"]
  globs: ["scripts/mind/**", ".claude/commands/map-sync.md", ".claude/skills/navigating-kryscar/SKILL.md"]
depends: []
invariants:
  - rule: "index.md is generated, never hand-edited"
    enforcedBy: ["[[the-mind]]"]
  - rule: "this zone owns its implementation scripts, not the vault markdown (avoids self-stale)"
    enforcedBy: ["[[the-mind]]"]
verifiedAt: "74d28486554072404071920bafd9c109390994e7"
---
## Purpose
Makes the repo agent-native and human-queryable. The generator verifies the Map against code and gates `npm run check`.
## Anchors
`scripts/mind/generate.mjs`, `scripts/mind/status.mjs`, the navigating skill, /map-sync.
## Invariants
Globs point at implementation (scripts/skill/command), NOT vault markdown.
## Lineage
sources → the Mind spec/plan (migrated into specs/ & plans/).
