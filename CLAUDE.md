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

**File-format craft:** the Mind *is* an Obsidian vault, so the five kepano obsidian-skills
(`obsidian-markdown`, `obsidian-bases`, `json-canvas`, `obsidian-cli`, `defuddle`) live
under `.claude/skills/` as third-party practice for the vault's *own* file formats — reach
for them when authoring any Mind note or a `.base`/`.canvas` dashboard. They are vendored
verbatim (provenance in `.claude/skills/obsidian-skills.NOTICE.md`), not via
`npx skills add`, so they are **not** in `skills-lock.json`. Guardrail: the generator
verifies code; Bases aggregate frontmatter — **Bases never replace the generator, and
`.base`/`.canvas` files live in `kryscar-mind/bases/`, outside `map/` and outside every
generator glob** (the same Ouroboros rule that keeps vault markdown out of the-mind's globs).

@AGENTS.md

## Code/Mind navigation

Use the **`nav-retrieval`** skill — `ctx_search` first (snippet for Mind, rank-then-read whole files for code), `lsp` for exact symbols, `rtk read`/`rtk git`/`rtk ls` for token-compressed file/git/listing ops, grep/Read as fallback. Indexes refresh automatically at SessionStart.

## Autopilot (core go/attack brainstorming flow)

`/brainstorming` in this repo runs **hands-off by default** — **two human gates, everything between automatic.** Say **"careful"** / **"stop after spec"** at kickoff to restore the fully-gated flow.

**Two gates:** (1) front — clarifying Q/A + one design-approval (**"attack plan — go?"**); (2) end — the pre-merge stop. Between them, with **no** intermediate stop: write spec (→ `kryscar-mind/specs/`, commit to local main) → write plan (→ `kryscar-mind/plans/`, commit to local main) → subagent-driven implementation (**app code → feature branch**) → final whole-branch review → recollection (update zones, commit Mind docs to local main).

**Where artifacts land — docs to main, code to the branch.** Mind docs (spec, plan, decisions) are **main-targeted**: commit them to local `main` the moment they're produced. Only **app code** rides the feature branch to the end gate; never merge *code* early. Docs and code touch disjoint paths.

**Override skill gates** (CLAUDE.md outranks skills): brainstorming's spec-review gate → skip (commit spec, proceed); writing-plans' execution-choice → default to subagent-driven (inline only when tasks are trivial or share state); finishing-a-development-branch's menu → that IS the end gate, reached once.

**Auto-commit** (autopilot runs ONLY): Mind docs → local `main` (spec, plan, decisions, recollection); app code → feature branch (each task). **Never push.**

**Halt mid-flow and surface** (not a gate — trouble): blocking ambiguity the Q/A didn't resolve; a subagent BLOCKED the controller can't resolve; high-risk change (auth/billing/migrations/data-loss) → stop if unresolved. Hands-off means no routine gates, not ignore trouble.

**End gate — conditional merge recommendation:** only **app code** is still on the branch (docs already landed on main) → recommend push + open PR. A Mind/docs-only run has nothing left to merge — it already shipped to main locally. **The human executes; autopilot never pushes or merges itself.**

> Note: this is the **core** flow — no visual-skinning and no dual-worktree (those stay syndcast-only). Single working tree; commit Mind docs and code to their respective targets in place.

## Response style

Default to terse, high-signal responses: drop filler/preamble, prefer fragments + tables over prose, keep code, paths, errors, and commands verbatim and exact. Expand only when the user asks or when nuance is load-bearing (auth, billing, migrations, data-loss). This is the free ~80% of `caveman`; the Skill (`/caveman full`) is optional polish.
