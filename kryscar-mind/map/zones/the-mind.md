---
type: zone
summary: "The knowledge-base system itself — generator, status hook, navigating skill, and /map-sync command."
tags: [meta]
status: active
created: 2026-06-02
updated: 2026-06-03
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
verifiedAt: "dd2584a7e8d945b3d2ad784b5cd8e950830ac4d5"
---
## Purpose
Makes the repo agent-native and human-queryable. The generator verifies the Map against code and gates `npm run check`.
## Anchors
`scripts/mind/generate.mjs`, `scripts/mind/status.mjs`, the navigating skill, /map-sync.
## Invariants
Globs point at implementation (scripts/skill/command), NOT vault markdown. This zone owns
ONLY `navigating-kryscar` under `.claude/skills/` — the rest of that dir is external
vendored skills (see [[external-skills-coexist]]); the Mind never owns or clobbers them.
## Lineage
sources → the Mind spec/plan (migrated into specs/ & plans/); `.claude/skills/` coexistence → [[external-skills-coexist]].
