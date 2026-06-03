# DEV RULE (highest priority): Orient Mind-first. Maintain on finish.

This repo has a knowledge base — **the Mind** — at `kryscar-mind/`. It is the single
source of truth for understanding the system. Don't work blind; don't leave ghosts.

**Before working:** load `kryscar-mind/map/index.md` → open the relevant
`kryscar-mind/map/zones/<slug>.md` → trace its `sources:` into specs/plans/decisions.
(The `navigating-kryscar` skill is the entry ramp.)

**On finish (same change as the code, not a follow-up):** update touched zone cards;
re-stamp their `verifiedAt` to HEAD; add `kryscar-mind/map/decisions/` records for any
non-obvious "why"; file `kryscar-mind/tech-debt/` notes for deferrals; run `npm run mind`
(or `/map-sync`) and commit the regenerated `kryscar-mind/map/index.md`.

**Pipeline override:** brainstorming output → `kryscar-mind/specs/YYYY-MM-DD-<name>-design.md`;
writing-plans output → `kryscar-mind/plans/YYYY-MM-DD-<name>-plan.md`.

**Map vs Ledger:** Map (`map/`) is present-tense and mutable; Ledger
(`specs/plans/ideas/tech-debt`) is past-tense and read-only once consumed — supersede,
don't edit; tombstone (`status: unmounted`), don't delete.

`npm run check` runs the Mind generator and fails on broken anchors — keep zones true.

**External skills (don't break these):** `.claude/skills/` is SHARED. It holds the Mind
entry-ramp skill (`navigating-kryscar`) **and** external skills vendored via
`npx skills add --copy` (payload, cms-migration, better-auth, shadcn, …), tracked by
`skills-lock.json`. They're first-class — use them as before. The Mind is *additive*: it
never owns, replaces, or clobbers `.claude/skills/`. Add/update with
`npx skills add <pkg> --copy -y`; restore from the lock with `npx skills experimental_install`.
Rationale: `kryscar-mind/map/decisions/external-skills-coexist.md`.

@AGENTS.md
