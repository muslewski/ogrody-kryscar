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

@AGENTS.md
