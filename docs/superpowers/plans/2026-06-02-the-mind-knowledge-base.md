# "The Mind" Knowledge Base — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `kryscar-mind/` — an Obsidian-vault knowledge base over this codebase — with a verifying generator wired into `npm run check`, a SessionStart status hook, seeded zones/decisions, and `.claude/` projections (CLAUDE.md rule, navigating skill, /map-sync command).

**Architecture:** A Map (present-tense zone/decision/flow notes) + a Ledger (past-tense specs/plans/ideas/tech-debt). A dependency-light Node ESM generator (`scripts/mind/generate.mjs`, using `gray-matter`) verifies every zone's globs/anchors against the real code, marks stale zones, flags invariant gaps, and writes `map/index.md`; it exits non-zero on hard errors so `npm run check` gates it. `.claude/` only points into the vault — never copies it.

**Tech Stack:** Node ESM (.mjs, no TS build), `gray-matter` for frontmatter, `git` plumbing for tracked-file/freshness checks, Next.js 16 repo (TypeScript, npm, ESLint + tsc gate, no test runner).

> **No test runner exists.** Per-task verification = run the generator / `npm run check` / `node` the script and confirm output, plus a deliberate-break check at the end. If the sandbox blocks `npm`/`node` with `EPERM: uv_cwd`, note it and rely on careful review; the user runs the gate locally.

> **Critical ordering:** the `the-mind` zone's globs point at the generator, status hook, skill, and command files — so those must all exist BEFORE the zone cards are authored (Task 8). The generator is created (Task 4) and runs green against an empty/partial vault (0 zones ⇒ 0 errors) until zones land.

---

## File Structure

- **Create** `kryscar-mind/` vault: `README.md`, `map/{zones,decisions,flows,entities}/`, `specs/ plans/ ideas/ tech-debt/`, `templates/`, `.obsidian/` (Tasks 1, 2, 8, 9, 11).
- **Create** `scripts/mind/generate.mjs` (generator) + `scripts/mind/status.mjs` (hook) (Tasks 4, 5).
- **Modify** `package.json` — add `gray-matter` devDep + `mind`/`check` scripts (Task 3).
- **Create** `.claude/settings.json` (SessionStart hook), `.claude/skills/navigating-kryscar/SKILL.md`, `.claude/commands/map-sync.md` (Tasks 5, 6, 7).
- **Modify** `CLAUDE.md` (Mind-first rule) (Task 10); `.gitignore` (vault rules) (Task 1).
- **Move** the 4 existing `docs/superpowers/` docs + this plan's spec into the vault; remove `docs/superpowers/` (Task 11).

---

## Task 1: Scaffold the vault + gitignore + README

**Files:**
- Create: `kryscar-mind/README.md`, `kryscar-mind/.obsidian/app.json`, and `.gitkeep` files for empty dirs.
- Modify: `.gitignore`

- [ ] **Step 1: Create the directory tree (with .gitkeep so git tracks empty dirs)**

```bash
mkdir -p kryscar-mind/map/{zones,decisions,flows,entities} \
         kryscar-mind/{specs,plans,ideas,tech-debt,templates} \
         kryscar-mind/.obsidian
touch kryscar-mind/map/entities/.gitkeep kryscar-mind/ideas/.gitkeep
echo '{}' > kryscar-mind/.obsidian/app.json
```

- [ ] **Step 2: Append vault rules to `.gitignore`**

Append:
```
# kryscar-mind (the Mind) — commit shared Obsidian config, ignore per-user workspace
kryscar-mind/.obsidian/workspace*.json
```

- [ ] **Step 3: Write `kryscar-mind/README.md`** (the property-schema contract)

````md
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
````

- [ ] **Step 4: Commit**

```bash
git add kryscar-mind .gitignore
git commit -m "Scaffold kryscar-mind vault + schema README

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Note templates (one per type)

**Files:**
- Create: `kryscar-mind/templates/{zone,entity,flow,decision,spec,plan,idea,debt}.md`

- [ ] **Step 1: Write all eight templates**

`templates/zone.md`:
```md
---
type: zone
summary: ""
tags: []
status: active
created: 2026-06-02
updated: 2026-06-02
related: []
sources: []
owns:
  routes: []
  anchors: []
  globs: []
depends: []
invariants: []
verifiedAt: ""
---
## Purpose
## Anchors
## Invariants
## Lineage
```

`templates/entity.md`:
```md
---
type: entity
summary: ""
tags: []
status: active
created: 2026-06-02
updated: 2026-06-02
related: []
sources: []
anchor: ""
intent: ""
---
```

`templates/flow.md`:
```md
---
type: flow
summary: ""
tags: []
status: active
created: 2026-06-02
updated: 2026-06-02
related: []
sources: []
steps: []
verify: ""
e2e: []
---
## Steps
## Verify
```

`templates/decision.md`:
```md
---
type: decision
summary: ""
tags: []
status: active
created: 2026-06-02
updated: 2026-06-02
related: []
sources: []
decided: 2026-06-02
supersededBy: ""
---
## Context
## Decision
## Why
## Consequences
```

`templates/spec.md`:
```md
---
type: spec
summary: ""
tags: []
status: draft
created: 2026-06-02
updated: 2026-06-02
related: []
sources: []
origin: ""
---
```

`templates/plan.md`:
```md
---
type: plan
summary: ""
tags: []
status: draft
created: 2026-06-02
updated: 2026-06-02
related: []
sources: []
implements: ""
produced: []
---
```

`templates/idea.md`:
```md
---
type: idea
summary: ""
tags: []
status: active
created: 2026-06-02
updated: 2026-06-02
related: []
sources: []
maturity: seed
---
```

`templates/debt.md`:
```md
---
type: debt
summary: ""
tags: []
status: open
created: 2026-06-02
updated: 2026-06-02
related: []
sources: []
severity: med
effort: med
---
## Problem
## Fix
```

- [ ] **Step 2: Commit**

```bash
git add kryscar-mind/templates
git commit -m "Add kryscar-mind note templates

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: package.json — gray-matter dep + scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add `gray-matter` to devDependencies**

In `package.json` `devDependencies`, add (alphabetical placement is fine):
```json
    "gray-matter": "^4.0.3",
```

- [ ] **Step 2: Add the `mind` and `check` scripts**

Change the `scripts` block to:
```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "mind": "node scripts/mind/generate.mjs",
    "check": "tsc --noEmit && eslint && node scripts/mind/generate.mjs"
  },
```

- [ ] **Step 3: Install**

Run: `npm install`
Expected: `gray-matter` added; `package-lock.json` updated. (If sandbox EPERM blocks npm, note it — the user installs locally; later generator steps can't run until then.)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add gray-matter dep + mind/check npm scripts

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: The generator

**Files:**
- Create: `scripts/mind/generate.mjs`

- [ ] **Step 1: Write the generator**

Create `scripts/mind/generate.mjs` with exactly:

```js
#!/usr/bin/env node
// Mind generator: verifies the Map against the code, writes map/index.md.
// DO NOT add app logic here — this is the-mind zone's implementation.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const VAULT = "kryscar-mind";
const ZONES_DIR = join(ROOT, VAULT, "map", "zones");
const FLOWS_DIR = join(ROOT, VAULT, "map", "flows");
const INDEX_PATH = join(ROOT, VAULT, "map", "index.md");

const sh = (cmd) => execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim();

// --- tracked files ---
const tracked = sh("git ls-files").split("\n").filter(Boolean);
const trackedSet = new Set(tracked);

// --- minimal glob: ** => any (incl /), * => any but / ---
function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") { re += ".*"; i++; }
      else re += "[^/]*";
    } else if ("\\^$.|?+()[]{}".includes(c)) {
      re += "\\" + c;
    } else re += c;
  }
  return new RegExp("^" + re + "$");
}
const globMatches = (glob) =>
  trackedSet.has(glob) ? [glob] : tracked.filter((f) => globToRegExp(glob).test(f));

// --- exported symbol index ---
const SRC_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const exported = new Set();
const declRe =
  /export\s+(?:default\s+)?(?:async\s+)?(?:function|const|let|var|class|type|interface|enum)\s+([A-Za-z0-9_$]+)/g;
const listRe = /export\s*\{([^}]*)\}/g;
for (const f of tracked) {
  if (!SRC_EXT.test(f)) continue;
  let src;
  try { src = readFileSync(join(ROOT, f), "utf8"); } catch { continue; }
  let m;
  while ((m = declRe.exec(src))) exported.add(m[1]);
  while ((m = listRe.exec(src)))
    for (const part of m[1].split(","))
      exported.add(part.trim().split(/\s+as\s+/)[0].trim());
}

// --- route resolution ---
function routeResolves(route) {
  if (route === "/sitemap.xml") return trackedSet.has("src/app/sitemap.ts");
  if (route === "/robots.txt") return trackedSet.has("src/app/robots.ts");
  const p = route.replace(/^\//, "");
  const base = p === "" ? "src/app" : `src/app/${p}`;
  return trackedSet.has(`${base}/page.tsx`) || trackedSet.has(`${base}/page.ts`);
}

// --- anchor resolution ---
function anchorResolves(anchor) {
  const idx = anchor.indexOf(":");
  const kind = anchor.slice(0, idx);
  const val = anchor.slice(idx + 1);
  if (kind === "symbol") return exported.has(val);
  if (kind === "route") return routeResolves(val);
  if (kind === "glob") return globMatches(val).length > 0;
  return false;
}

// --- freshness ---
function isStale(zone) {
  const sha = (zone.verifiedAt || "").toString().trim();
  if (!sha) return true;
  let changed;
  try { changed = sh(`git diff --name-only ${sha} HEAD`).split("\n").filter(Boolean); }
  catch { return true; }
  const res = ((zone.owns && zone.owns.globs) || []).map(globToRegExp);
  return changed.some((f) => res.some((r) => r.test(f)));
}

// --- read notes ---
function readNotes(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { data } = matter(readFileSync(join(dir, f), "utf8"));
      return { slug: f.replace(/\.md$/, ""), ...data };
    });
}
const zones = readNotes(ZONES_DIR);
const flows = readNotes(FLOWS_DIR);

// --- verify ---
const hardErrors = [];
const gaps = [];
const rows = [];
const attic = [];

for (const z of zones) {
  if (z.status === "unmounted") { attic.push(z); continue; }
  const owns = z.owns || {};
  for (const g of owns.globs || [])
    if (globMatches(g).length === 0)
      hardErrors.push(`zone ${z.slug}: glob "${g}" matches no tracked file`);
  for (const a of owns.anchors || [])
    if (!anchorResolves(a))
      hardErrors.push(`zone ${z.slug}: anchor "${a}" does not resolve`);
  for (const r of owns.routes || [])
    if (!routeResolves(r))
      hardErrors.push(`zone ${z.slug}: route "${r}" does not resolve`);
  for (const inv of z.invariants || [])
    if (!inv.enforcedBy || inv.enforcedBy.length === 0)
      gaps.push(`zone ${z.slug}: invariant "${inv.rule}" has no enforcedBy`);
  rows.push({
    slug: z.slug,
    status: z.status || "active",
    fresh: isStale(z) ? "⚠ stale" : "✓ fresh",
    summary: (z.summary || "").replace(/\|/g, "\\|"),
  });
}

for (const fl of flows) {
  if (fl.status === "unmounted") continue;
  for (const step of fl.steps || [])
    if (!anchorResolves(step))
      hardErrors.push(`flow ${fl.slug}: step "${step}" does not resolve`);
}

// --- write index ---
rows.sort((a, b) => a.slug.localeCompare(b.slug));
let out = "";
out += "<!-- GENERATED by scripts/mind/generate.mjs — DO NOT HAND-EDIT. Run `npm run mind`. -->\n\n";
out += "# 🧠 kryscar-mind — Map index\n\n";
out += `_${rows.length} zones · ${gaps.length} verification gaps._\n\n`;
out += "| Zone | Status | Freshness | Summary |\n|---|---|---|---|\n";
for (const r of rows) out += `| [[${r.slug}]] | ${r.status} | ${r.fresh} | ${r.summary} |\n`;
out += "\n## ⚠ Verification gaps\n\n";
out += gaps.length ? gaps.map((g) => `- ${g}`).join("\n") + "\n" : "_None._\n";
out += "\n## Attic (unmounted)\n\n";
out += attic.length
  ? attic.map((z) => `- [[${z.slug}]] — ${z.summary || ""}`).join("\n") + "\n"
  : "_Empty._\n";
writeFileSync(INDEX_PATH, out);

// --- report ---
if (hardErrors.length) {
  console.error("✗ Mind: hard errors:\n" + hardErrors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ Mind: ${rows.length} zones, ${gaps.length} gaps. Wrote ${relative(ROOT, INDEX_PATH)}.`);
```

- [ ] **Step 2: Verify it runs against the empty vault**

Run: `npm run mind`
Expected: exit 0, prints `✓ Mind: 0 zones, 0 gaps. Wrote kryscar-mind/map/index.md.`, and `kryscar-mind/map/index.md` now exists with the generated banner + empty table.

- [ ] **Step 3: Commit**

```bash
git add scripts/mind/generate.mjs kryscar-mind/map/index.md
git commit -m "Add Mind generator (verifies Map vs code, writes index)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Status hook + settings.json

**Files:**
- Create: `scripts/mind/status.mjs`, `.claude/settings.json`

- [ ] **Step 1: Write the status hook (pure file I/O, no exec)**

Create `scripts/mind/status.mjs`:

```js
#!/usr/bin/env node
// SessionStart status line. Pure file reads — never spawns the generator.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const INDEX = join(ROOT, "kryscar-mind", "map", "index.md");
const DEBT = join(ROOT, "kryscar-mind", "tech-debt");

let zones = 0;
if (existsSync(INDEX)) {
  const m = readFileSync(INDEX, "utf8").match(/_(\d+) zones/);
  if (m) zones = Number(m[1]);
}
let openDebt = 0;
if (existsSync(DEBT)) {
  for (const f of readdirSync(DEBT)) {
    if (!f.endsWith(".md")) continue;
    if (/^status:\s*open\b/m.test(readFileSync(join(DEBT, f), "utf8"))) openDebt++;
  }
}
console.log(
  `🧠 Mind: ${zones} zones · ${openDebt} open tech-debt — orient via kryscar-mind/map/index.md before coding.`
);
```

- [ ] **Step 2: Register the SessionStart hook**

Create `.claude/settings.json`:
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "node scripts/mind/status.mjs" }
        ]
      }
    ]
  }
}
```

- [ ] **Step 3: Verify the hook prints**

Run: `node scripts/mind/status.mjs`
Expected: `🧠 Mind: 0 zones · 0 open tech-debt — orient via kryscar-mind/map/index.md before coding.` (counts are 0 until zones/debt land — that's fine.)

- [ ] **Step 4: Commit**

```bash
git add scripts/mind/status.mjs .claude/settings.json
git commit -m "Add Mind SessionStart status hook

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: navigating-kryscar skill

**Files:**
- Create: `.claude/skills/navigating-kryscar/SKILL.md`

- [ ] **Step 1: Write the entry-ramp skill (pointers only — no Map duplication)**

```md
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

## On finish
Update touched zone cards, re-stamp `verifiedAt` to HEAD, add decision records for non-obvious "why", file tech-debt for deferrals, then `npm run mind` and commit `index.md`. (Full rule in CLAUDE.md.)

Do NOT restate zone contents here — this skill only points into the Mind.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/navigating-kryscar/SKILL.md
git commit -m "Add navigating-kryscar entry-ramp skill

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: /map-sync command

**Files:**
- Create: `.claude/commands/map-sync.md`

- [ ] **Step 1: Write the command**

```md
---
description: Rebuild + validate the Mind index; report stale zones and verification gaps.
---

Run the Mind generator and report results.

1. Run `npm run mind` (or `node scripts/mind/generate.mjs`).
2. If it exits non-zero, surface each hard error (unresolved glob/anchor/flow step) and stop — these block `npm run check`.
3. If green, read `kryscar-mind/map/index.md` and report: the zone count, any rows marked `⚠ stale` (their `verifiedAt` is behind code changes — re-verify and re-stamp), and the "Verification gaps" section (invariants with no `enforcedBy` — consider filing tech-debt).
4. If `index.md` changed, remind to commit it.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/map-sync.md
git commit -m "Add /map-sync command

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Author the 11 zone cards

**Files:**
- Create: `kryscar-mind/map/zones/{the-mind,homepage-and-variants,service-catalog,city-landing-pages,coverage-map,pricing-calculator,layout-chrome,seo,motion-and-3d,ui-primitives,brand-data}.md`

> All eleven scripts/skill/command files they reference now exist (Tasks 4–7), so anchors resolve. Each card's `verifiedAt` is stamped to the CURRENT HEAD in Step 2.

- [ ] **Step 1: Write each zone card**

Write the files below verbatim (frontmatter is load-bearing — the generator validates it). Leave `verifiedAt: "__HEAD__"`; Step 2 replaces the token.

`the-mind.md`:
```md
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
verifiedAt: "__HEAD__"
---
## Purpose
Makes the repo agent-native and human-queryable. The generator verifies the Map against code and gates `npm run check`.
## Anchors
`scripts/mind/generate.mjs`, `scripts/mind/status.mjs`, the navigating skill, /map-sync.
## Invariants
Globs point at implementation (scripts/skill/command), NOT vault markdown.
## Lineage
sources → the Mind spec/plan (migrated into specs/ & plans/).
```

`homepage-and-variants.md`:
```md
---
type: zone
summary: "The root homepage (re-exports example-9) plus the ten design-variant pages."
tags: [ui]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[service-catalog]]", "[[layout-chrome]]"]
sources: []
owns:
  routes: ["/", "/example-9"]
  anchors: []
  globs: ["src/app/page.tsx", "src/app/example-*/**"]
depends: ["[[service-catalog]]", "[[layout-chrome]]", "[[motion-and-3d]]"]
invariants: []
verifiedAt: "__HEAD__"
---
## Purpose
The marketing homepage and its design explorations. `/` re-exports `example-9`.
## Anchors
`route:/`, `route:/example-9`, `src/app/example-*/**`.
## Lineage
The example-N variants predate the Mind.
```

`service-catalog.md`:
```md
---
type: zone
summary: "Service definitions, categories, catalog enrichment, and the single-select filter + motion reorder island."
tags: [feature, data]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[brand-data]]", "[[city-landing-pages]]"]
sources: []
owns:
  routes: []
  anchors: ["symbol:ServiceCatalog", "symbol:getCatalogServices", "symbol:SERVICES", "symbol:CATEGORIES"]
  globs: ["src/components/service-catalog.tsx", "src/lib/catalog.ts", "src/lib/data.ts"]
depends: ["[[brand-data]]"]
invariants:
  - rule: "SERVICES drives both the homepage catalog and the city pages"
    enforcedBy: []
verifiedAt: "__HEAD__"
---
## Purpose
Catalog data + the client island that filters/reorders cards.
## Anchors
`ServiceCatalog`, `getCatalogServices`, `SERVICES`, `CATEGORIES`.
## Lineage
sources → [[catalog-category-filter-animation-design]].
```

`city-landing-pages.md`:
```md
---
type: zone
summary: "Local-SEO /ogrodnik/[miasto] pages and the Payload-migration-ready location data layer."
tags: [feature, seo, data]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[seo]]", "[[service-catalog]]", "[[coverage-map]]"]
sources: []
owns:
  routes: ["/ogrodnik/[miasto]"]
  anchors: ["symbol:getAllLocations", "symbol:getLocationBySlug", "symbol:getLocationSlugs", "symbol:Location", "symbol:LocationJsonLd"]
  globs: ["src/app/ogrodnik/**", "src/lib/locations.ts", "src/components/LocationJsonLd.tsx"]
depends: ["[[service-catalog]]", "[[coverage-map]]", "[[layout-chrome]]"]
invariants:
  - rule: "Components consume locations only via async accessors — no component imports the LOCATIONS array (Payload-migration boundary)"
    enforcedBy: []
verifiedAt: "__HEAD__"
---
## Purpose
Per-city landing pages; data flows through async accessors so a PayloadCMS swap touches only `locations.ts`.
## Anchors
`getAllLocations`, `getLocationBySlug`, `Location`, `LocationJsonLd`, `route:/ogrodnik/[miasto]`.
## Lineage
sources → [[local-seo-city-pages-design]].
```

`coverage-map.md`:
```md
---
type: zone
summary: "Service-area geography and the static coverage map (Mapbox/OSM)."
tags: [feature, data]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]"]
sources: []
owns:
  routes: []
  anchors: ["symbol:CoverageMap", "symbol:COVERAGE_CITIES", "symbol:HEADQUARTERS"]
  globs: ["src/components/CoverageMap.tsx", "src/components/PolandMap.tsx", "src/lib/coverage.ts"]
depends: []
invariants: []
verifiedAt: "__HEAD__"
---
## Purpose
Renders the coverage area; supports an optional `focus`/`center` pin for city pages.
## Anchors
`CoverageMap`, `COVERAGE_CITIES`.
```

`pricing-calculator.md`:
```md
---
type: zone
summary: "Pricing algorithm and the interactive area/frequency calculator form."
tags: [feature]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[service-catalog]]"]
sources: []
owns:
  routes: []
  anchors: ["symbol:calculatePrice", "symbol:formatPrice", "symbol:CalculatorForm"]
  globs: ["src/lib/calculator.ts", "src/components/CalculatorForm.tsx"]
depends: ["[[service-catalog]]"]
invariants: []
verifiedAt: "__HEAD__"
---
## Purpose
Estimates prices from service type + area (+ frequency).
## Anchors
`calculatePrice`, `formatPrice`, `CalculatorForm`.
```

`layout-chrome.md`:
```md
---
type: zone
summary: "Root layout, header, footer, preloader, and social links — the shared page shell."
tags: [ui]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[seo]]", "[[brand-data]]"]
sources: []
owns:
  routes: []
  anchors: ["symbol:SiteHeader", "symbol:SiteFooter", "symbol:Socials"]
  globs: ["src/app/layout.tsx", "src/components/SiteHeader.tsx", "src/components/SiteFooter.tsx", "src/components/SitePreloader.tsx", "src/components/Socials.tsx"]
depends: ["[[brand-data]]"]
invariants:
  - rule: "SiteFooter anchors are root-relative (/#...) so it works on every page"
    enforcedBy: []
verifiedAt: "__HEAD__"
---
## Purpose
Shared chrome reused by the homepage and city pages.
## Anchors
`SiteHeader`, `SiteFooter`, `Socials`, `src/app/layout.tsx`.
```

`seo.md`:
```md
---
type: zone
summary: "sitemap.xml, robots.txt, and canonical/metadataBase wiring."
tags: [seo]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]", "[[brand-data]]"]
sources: []
owns:
  routes: ["/sitemap.xml", "/robots.txt"]
  anchors: ["symbol:SITE_URL"]
  globs: ["src/app/sitemap.ts", "src/app/robots.ts"]
depends: ["[[brand-data]]", "[[city-landing-pages]]"]
invariants:
  - rule: "every public route has a sitemap entry"
    enforcedBy: []
verifiedAt: "__HEAD__"
---
## Purpose
Search-engine surface: sitemap enumerates the homepage + all /ogrodnik pages.
## Anchors
`route:/sitemap.xml`, `route:/robots.txt`, `SITE_URL`.
## Lineage
sources → [[local-seo-city-pages-design]].
```

`motion-and-3d.md`:
```md
---
type: zone
summary: "Motion primitives (HoverCard), warped-hover image, the 3D section, counters, and the scroll hook."
tags: [ui, animation]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[homepage-and-variants]]"]
sources: []
owns:
  routes: []
  anchors: ["symbol:HoverCard", "symbol:WarpedHoverImage", "symbol:AntigravitySection"]
  globs: ["src/components/motion.tsx", "src/components/WarpedHoverImage.tsx", "src/components/AntigravitySection.tsx", "src/components/Antigravity.jsx", "src/components/Stat.tsx", "src/components/CountUp.tsx", "src/components/AnimatedNumber.tsx", "src/components/use-is-scrolled.ts", "src/components/react-bits/**"]
depends: []
invariants: []
verifiedAt: "__HEAD__"
---
## Purpose
Reusable animation/3D building blocks.
## Anchors
`HoverCard`, `WarpedHoverImage`, `AntigravitySection`.
```

`ui-primitives.md`:
```md
---
type: zone
summary: "shadcn/radix UI primitives (new-york): checkbox, label, radio-group, scroll-area, separator, slider."
tags: [ui]
status: active
created: 2026-06-02
updated: 2026-06-02
related: []
sources: []
owns:
  routes: []
  anchors: ["glob:src/components/ui/scroll-area.tsx"]
  globs: ["src/components/ui/**"]
depends: []
invariants: []
verifiedAt: "__HEAD__"
---
## Purpose
Low-level styled primitives consumed across features.
## Anchors
`src/components/ui/**`.
```

`brand-data.md`:
```md
---
type: zone
summary: "Company identity, address/NIP, socials, legal links, image map, and the canonical SITE_URL."
tags: [data]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[service-catalog]]", "[[seo]]", "[[layout-chrome]]"]
sources: []
owns:
  routes: []
  anchors: ["symbol:COMPANY", "symbol:ADDRESS", "symbol:SOCIALS", "symbol:IMG", "symbol:SITE_URL"]
  globs: ["src/lib/data.ts"]
depends: []
invariants: []
verifiedAt: "__HEAD__"
---
## Purpose
Single home for brand constants used site-wide.
## Anchors
`COMPANY`, `ADDRESS`, `SOCIALS`, `IMG`, `SITE_URL`.
```

- [ ] **Step 2: Stamp `verifiedAt` to current HEAD**

Run (replaces the token in every zone card with the current commit SHA):
```bash
SHA=$(git rev-parse HEAD)
node -e "const fs=require('fs');const d='kryscar-mind/map/zones';for(const f of fs.readdirSync(d)){const p=d+'/'+f;fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace(/__HEAD__/g,process.env.SHA));}" 
```
(Or manually replace each `"__HEAD__"` with the `git rev-parse HEAD` value.)

- [ ] **Step 3: Run the generator — expect all green**

Run: `npm run mind`
Expected: exit 0, `✓ Mind: 11 zones, N gaps.` where N = invariants without enforcedBy (the SERVICES, locations-boundary, footer-anchor, sitemap, currently 5). `index.md` lists all 11 zones, all `✓ fresh`, no hard errors. If any glob/anchor reports an error, fix the offending card's value to match the real code (e.g. a symbol typo) and re-run.

- [ ] **Step 4: Commit**

```bash
git add kryscar-mind/map/zones kryscar-mind/map/index.md
git commit -m "Seed the 11 zone cards; generator green

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Decision records, one flow, one tech-debt

**Files:**
- Create: `kryscar-mind/map/decisions/{payload-ready-location-layer,single-source-site-url,single-select-catalog-filter,city-pages-avoid-thin-content}.md`
- Create: `kryscar-mind/map/flows/catalog-filter.md`
- Create: `kryscar-mind/tech-debt/enforce-locations-import-boundary.md`

- [ ] **Step 1: Write the four decision records**

`decisions/payload-ready-location-layer.md`:
```md
---
type: decision
summary: "Location content flows through async accessors over a serializable Location interface, so a future PayloadCMS swap touches only locations.ts."
tags: [data, architecture]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]"]
sources: ["[[local-seo-city-pages-design]]"]
decided: 2026-06-02
supersededBy: ""
---
## Context
City pages need content now; PayloadCMS is planned later.
## Decision
Expose `getAllLocations`/`getLocationBySlug`/`getLocationSlugs` (async) over a flat, serializable `Location`. Only `locations.ts` knows the source.
## Why
Migration = reimplement 3 functions; pages/components unchanged.
## Consequences
Components must never import `LOCATIONS` directly (see tech-debt: enforce-locations-import-boundary).
```

`decisions/single-source-site-url.md`:
```md
---
type: decision
summary: "The canonical origin lives once as SITE_URL in lib/data.ts; layout, sitemap, robots, and JSON-LD all import it."
tags: [seo]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[seo]]", "[[brand-data]]"]
sources: ["[[local-seo-city-pages-design]]"]
decided: 2026-06-02
supersededBy: ""
---
## Context
The domain literal was duplicated across several files.
## Decision
Define `SITE_URL` once in `lib/data.ts`; consume everywhere.
## Why
A domain change is a one-line edit; no stray literals.
## Consequences
New SEO code imports `SITE_URL`, never a string literal.
```

`decisions/single-select-catalog-filter.md`:
```md
---
type: decision
summary: "The homepage catalog uses single-select category tabs with a Framer Motion popLayout reorder, not multi-select."
tags: [ui, feature]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[service-catalog]]"]
sources: ["[[catalog-category-filter-animation-design]]"]
decided: 2026-06-02
supersededBy: ""
---
## Context
Eight services; existing pill UI implied one active filter.
## Decision
Single-select tabs; each service in exactly one category; animate reorder with `AnimatePresence mode="popLayout"` + `layout`.
## Why
Simplest UX matching the existing pills; clean reorder.
## Consequences
Badges/numbers bind to slug (stable), not array index.
```

`decisions/city-pages-avoid-thin-content.md`:
```md
---
type: decision
summary: "Each city page carries unique, locally-grounded copy and verified coordinates to avoid Google's thin/doorway-content penalty."
tags: [seo, content]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]"]
sources: ["[[local-seo-city-pages-design]]"]
decided: 2026-06-02
supersededBy: ""
---
## Context
Near-duplicate per-city pages risk being ignored or penalized.
## Decision
Unique intro/FAQ/local context per city; real neighbour lists; per-city meta; verified lat/lng (Nominatim/Wikipedia).
## Why
Genuine local relevance ranks; doorway pages don't.
## Consequences
Adding a city = writing real copy + verifying coordinates, not cloning.
```

- [ ] **Step 2: Write one flow (exercises flow validation)**

`flows/catalog-filter.md`:
```md
---
type: flow
summary: "User filters the homepage service catalog and the cards reorder with animation."
tags: [ui]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[service-catalog]]"]
sources: ["[[catalog-category-filter-animation-design]]"]
steps: ["route:/", "symbol:getCatalogServices", "symbol:ServiceCatalog"]
verify: "Clicking a category pill shows only that category's cards; others animate out and remaining cards spring into place."
e2e: []
---
## Steps
Homepage builds services via `getCatalogServices`, passes them to the `ServiceCatalog` client island which owns the single-select filter state.
## Verify
Pick "Porządki" → 3 cards; "Trawnik" → 1 card; smooth reorder.
```

- [ ] **Step 3: Write the tech-debt note**

`tech-debt/enforce-locations-import-boundary.md`:
```md
---
type: debt
summary: "The 'no component imports LOCATIONS directly' rule (Payload-migration boundary) is a convention, not enforced. Add an ESLint no-restricted-imports rule."
tags: [lint, architecture]
status: open
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]", "[[payload-ready-location-layer]]"]
sources: ["[[payload-ready-location-layer]]"]
severity: med
effort: low
---
## Problem
Nothing prevents a component from importing the raw `LOCATIONS` array, which would break the clean PayloadCMS swap boundary.
## Fix
Add an ESLint `no-restricted-imports` (or `no-restricted-syntax`) rule forbidding non-`locations.ts` files from importing `LOCATIONS`, and wire it as the `enforcedBy` of the city-landing-pages invariant.
```

- [ ] **Step 4: Run the generator — flow steps must resolve**

Run: `npm run mind`
Expected: exit 0, still `✓ Mind: 11 zones`. The flow's steps (`route:/`, `symbol:getCatalogServices`, `symbol:ServiceCatalog`) all resolve. Open tech-debt now countable by the status hook.

- [ ] **Step 5: Commit**

```bash
git add kryscar-mind/map/decisions kryscar-mind/map/flows kryscar-mind/tech-debt kryscar-mind/map/index.md
git commit -m "Seed decision records, catalog-filter flow, locations-boundary tech-debt

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: CLAUDE.md — Mind-first dev rule + pipeline override

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Prepend the rule (keep the existing `@AGENTS.md` import last)**

Replace the entire `CLAUDE.md` (currently just `@AGENTS.md`) with:

```md
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
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "CLAUDE.md: Mind-first dev rule + pipeline override

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Migrate the Ledger into the vault

**Files:**
- Move: 3 specs + 2 plans from `docs/superpowers/` into `kryscar-mind/{specs,plans}/`; then remove `docs/superpowers/`.

- [ ] **Step 1: Move the files with git (preserve history)**

```bash
git mv docs/superpowers/specs/2026-06-02-catalog-category-filter-animation-design.md kryscar-mind/specs/
git mv docs/superpowers/specs/2026-06-02-local-seo-city-pages-design.md kryscar-mind/specs/
git mv docs/superpowers/specs/2026-06-02-the-mind-knowledge-base-design.md kryscar-mind/specs/
git mv docs/superpowers/plans/2026-06-02-catalog-category-filter-animation.md kryscar-mind/plans/
git mv docs/superpowers/plans/2026-06-02-local-seo-city-pages.md kryscar-mind/plans/
git mv docs/superpowers/plans/2026-06-02-the-mind-knowledge-base.md kryscar-mind/plans/
rmdir docs/superpowers/specs docs/superpowers/plans docs/superpowers 2>/dev/null || true
```

- [ ] **Step 2: Prepend Ledger frontmatter to each moved file**

Each moved doc is currently plain markdown (starts with `# Title`). Prepend the matching frontmatter block at the very top (above the existing `#` heading). Use these exact blocks; do not alter the existing body.

For `kryscar-mind/specs/2026-06-02-catalog-category-filter-animation-design.md`:
```md
---
type: spec
summary: "Single-select category filter + Framer Motion reorder for the homepage service catalog."
tags: [ui, feature]
status: planned
created: 2026-06-02
updated: 2026-06-02
related: ["[[service-catalog]]"]
sources: []
origin: "User: make catalog categories actually filter, with the pol-med /edukacja reorder animation."
---
```

For `kryscar-mind/specs/2026-06-02-local-seo-city-pages-design.md`:
```md
---
type: spec
summary: "Local-SEO /ogrodnik/[miasto] landing pages with a Payload-migration-ready location layer."
tags: [seo, feature, data]
status: planned
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]", "[[seo]]"]
sources: []
origin: "User: add ~10-12 per-city subpages to boost local SEO; promote the homepage map locations into links."
---
```

For `kryscar-mind/specs/2026-06-02-the-mind-knowledge-base-design.md`:
```md
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
```

For `kryscar-mind/plans/2026-06-02-catalog-category-filter-animation.md`:
```md
---
type: plan
summary: "Task-by-task plan for the single-select catalog filter + reorder animation."
tags: [ui, feature]
status: done
created: 2026-06-02
updated: 2026-06-02
related: ["[[service-catalog]]"]
sources: ["[[2026-06-02-catalog-category-filter-animation-design]]"]
implements: "[[2026-06-02-catalog-category-filter-animation-design]]"
produced: ["[[service-catalog]]", "[[single-select-catalog-filter]]"]
---
```

For `kryscar-mind/plans/2026-06-02-local-seo-city-pages.md`:
```md
---
type: plan
summary: "Task-by-task plan for the /ogrodnik/[miasto] city pages and migration-ready location layer."
tags: [seo, feature, data]
status: done
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]", "[[seo]]"]
sources: ["[[2026-06-02-local-seo-city-pages-design]]"]
implements: "[[2026-06-02-local-seo-city-pages-design]]"
produced: ["[[city-landing-pages]]", "[[seo]]", "[[payload-ready-location-layer]]", "[[single-source-site-url]]", "[[city-pages-avoid-thin-content]]"]
---
```

For `kryscar-mind/plans/2026-06-02-the-mind-knowledge-base.md` (this plan):
```md
---
type: plan
summary: "Task-by-task plan for building the Mind: vault, generator, hook, zones, projections, migration."
tags: [meta, tooling]
status: done
created: 2026-06-02
updated: 2026-06-02
related: ["[[the-mind]]"]
sources: ["[[2026-06-02-the-mind-knowledge-base-design]]"]
implements: "[[2026-06-02-the-mind-knowledge-base-design]]"
produced: ["[[the-mind]]"]
---
```

- [ ] **Step 3: Verify nothing else references the old paths**

Run: `grep -rn "docs/superpowers" . --include=*.md --include=*.mjs --include=*.json | grep -v node_modules || echo "clean"`
Expected: `clean` (no lingering references). The generator does not read these paths, so `npm run mind` is unaffected — run it once to confirm still green: `npm run mind`.

- [ ] **Step 4: Commit**

```bash
git add -A kryscar-mind docs
git commit -m "Migrate specs/plans into the Mind vault; retire docs/superpowers

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Wire the gate + verify hard-fail

**Files:** none (verification + final wiring check).

- [ ] **Step 1: Run the full check gate — expect green**

Run: `npm run check`
Expected: `tsc --noEmit` passes, `eslint` passes (pre-existing unrelated warnings are fine; no NEW errors from Mind files — note `.mjs` scripts may be outside the eslint config's scope, which is acceptable), and the generator prints `✓ Mind: 11 zones, ...` and exits 0.

- [ ] **Step 2: Verify the gate FAILS on a broken anchor (then restore)**

```bash
# temporarily break an anchor
node -e "const f='kryscar-mind/map/zones/brand-data.md';const s=require('fs').readFileSync(f,'utf8').replace('symbol:COMPANY','symbol:DOES_NOT_EXIST');require('fs').writeFileSync(f,s)"
npm run mind; echo "exit: $?"   # expect a hard error listing brand-data anchor + exit 1
git checkout kryscar-mind/map/zones/brand-data.md   # restore
npm run mind                     # green again
```
Expected: the broken run prints `✗ Mind: hard errors: - zone brand-data: anchor "symbol:DOES_NOT_EXIST" does not resolve` and `exit: 1`; after restore it's green.

- [ ] **Step 3: Verify the SessionStart hook reflects real counts**

Run: `node scripts/mind/status.mjs`
Expected: `🧠 Mind: 11 zones · 1 open tech-debt — orient via kryscar-mind/map/index.md before coding.`

- [ ] **Step 4: Final commit (if index.md regenerated)**

```bash
git add kryscar-mind/map/index.md
git commit -m "Regenerate Mind index after gate verification

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>" || echo "nothing to commit"
```

---

## Self-Review Notes (author check)

- **Spec coverage:** vault structure + README schema (T1) ✓; templates per type (T2) ✓; generator contract incl. hard-error/stale/gaps/flows/index (T4) ✓; npm run check hard gate + gray-matter (T3) ✓; SessionStart status hook (T5) ✓; navigating skill (T6) ✓; /map-sync (T7) ✓; 11 zones with exact globs/anchors incl. self-describing the-mind owning its scripts not markdown (T8) ✓; 4 seed decisions + tech-debt gap (T9) ✓; CLAUDE.md Mind-first rule + pipeline override (T10) ✓; migrate Ledger + retire docs/superpowers (T11) ✓; gate-green + deliberate hard-fail + hook counts (T12) ✓.
- **Self-referential trap:** `the-mind` globs = `scripts/mind/**` + skill + command (implementation), never vault markdown — won't perpetually stale. ✓
- **Ordering:** generator (T4) before zones (T8); skill (T6) + command (T7) before zones (T8) so `the-mind` globs resolve; zones stamped at HEAD after all owned files exist. ✓
- **Anchor accuracy (verified against the inventory):** symbols `ServiceCatalog, getCatalogServices, SERVICES, CATEGORIES, getAllLocations, getLocationBySlug, getLocationSlugs, Location, LocationJsonLd, CoverageMap, COVERAGE_CITIES, HEADQUARTERS, calculatePrice, formatPrice, CalculatorForm, SiteHeader, SiteFooter, Socials, SITE_URL, COMPANY, ADDRESS, SOCIALS, IMG, HoverCard, WarpedHoverImage, AntigravitySection` are all real exports; routes `/`, `/example-9`, `/ogrodnik/[miasto]`, `/sitemap.xml`, `/robots.txt` all resolve; globs all match tracked files.
- **No placeholders:** generator + hook + templates + all 11 zone cards + 4 decisions + flow + tech-debt are full content; `__HEAD__` is a token with an explicit stamping step, not a TBD.
- **Type/name consistency:** `npm run mind` and `npm run check` names match across T3/T7/T10/T12; frontmatter keys (`owns.globs/anchors/routes`, `invariants[].enforcedBy`, `verifiedAt`, `steps`, `status`) match exactly what the generator reads.
