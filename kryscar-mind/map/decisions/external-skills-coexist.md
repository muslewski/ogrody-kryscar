---
type: decision
summary: ".claude/skills/ is shared — the repo's Mind entry-ramp skill plus external skills vendored from `npx skills add`; external skills are committed (--copy) with skills-lock.json so a Mind migration can't lose them again."
tags: [meta, skills, tooling]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[the-mind]]"]
sources: []
decided: 2026-06-03
supersededBy: ""
---
## Context
External skills installed via `npx skills add` (payloadcms/skills, better-auth/skills, shadcn/ui) live in `.claude/skills/`. By default the CLI symlinks them from git-ignored `node_modules`, so they were never committed — they left no git trace and vanished when that untracked state was cleared around the Mind migration. Claude lost those skills (and skill-backed commands) with no recovery path: there was no `skills-lock.json` and no policy marking `.claude/skills/` as shared.
## Decision
`.claude/skills/` is a SHARED directory with two kinds of occupants:
- `navigating-kryscar/` — the repo's own Mind entry-ramp skill, owned by [[the-mind]].
- everything else — external skills vendored via `npx skills add <pkg> --copy -y` (real files, committed), tracked by `skills-lock.json` at the repo root.

The Mind never owns or mutates external skills: the-mind zone's glob is scoped to `.claude/skills/navigating-kryscar/SKILL.md` only, the generator has no orphan/coverage check, and the SessionStart hook ignores `.claude/skills/`. So external skills coexist with zero Mind noise (`npm run check` stays green). The CLI's `.agents/` multi-agent fan-out dir is git-ignored — we keep skills only under `.claude/skills/`.
## Why
Committing (vendoring with `--copy`) is the only thing that makes external skills durable against clones, `node_modules` wipes, and future migrations — the root cause was that they were untracked. `skills-lock.json` records their GitHub sources for reproducible updates.
## Consequences
~35 external-skill files live in the repo. Operations:
- Add/update: `npx skills add <pkg> --copy -y` then commit (`.claude/skills/**` + `skills-lock.json`).
- Restore from lock (fresh machine): `npx skills experimental_install`.
- Remove: `npx skills remove <name>` then commit.
The Mind is **additive** — it points into `kryscar-mind/`; it must never replace or clobber `.claude/skills/`.
