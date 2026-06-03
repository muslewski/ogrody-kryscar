# Realizacje (before/after gallery) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship "Realizacje" — a before/after project gallery (`/realizacje` + `/realizacje/[slug]`) proving the high-ticket aranżacja/rabaty work, with an interactive drag slider, homepage teaser, nav + footer links, and fetched stock placeholders.

**Architecture:** Approach A — a Payload-ready `src/lib/projects.ts` (typed const array + async accessors), mirroring `services.ts`/`guides.ts`. Two static App-Router pages (daily ISR) consume only the accessors. One `"use client"` `BeforeAfterSlider` island (hand-rolled, clip-path reveal), a `ProjectCard`, and a `ProjectJsonLd`. Placeholder before/after images are fetched from Pixabay via the existing `fetch-stock.sh` and blurred via the existing pipeline.

**Tech Stack:** Next.js 16 (App Router, RSC + one client island), TypeScript, Tailwind, `next/image` (+ the `BlurImage` wrapper / `BLUR_DATA` map). No test runner — verification is `npm run check` (`tsc --noEmit` + `eslint` + Mind generator) + `npm run build` + manual checks.

**Branch:** `feat/realizacje-gallery` (already created; spec commit `90b36cf` is on it). Stay on it.

**Spec:** `kryscar-mind/specs/2026-06-03-realizacje-gallery-design.md`.

---

## Content authoring approach (read first)

Project **#1 (`metamorfoza-ogrodu-osielsko`) is authored in full** in Task 1 as the tone template. Projects **#2–#6 are complete briefs** (fixed metadata — slug/title/category/location/year/relatedService/image paths/metaTitle/metaDescription — plus the `scope` bullet points and `body` substance). The implementer writes the `excerpt` (1 sentence), `scope` (4–5 bullets), and `body` (2 short paragraphs) as real publish-ready Polish, matching #1's tone (warm, concrete, Bydgoszcz-area; same voice as `src/lib/services.ts`). No structural decisions are left open.

**Hard rules:** image paths are `/img/projects/<slug>-before.jpg` and `<slug>-after.jpg` (Task 2 fetches exactly these filenames). `category` and `relatedService` ∈ {`aranzacja`, `rabaty`} (real `SERVICES` slugs).

---

## File structure

**Create:** `src/lib/projects.ts`, `src/components/BeforeAfterSlider.tsx`, `src/components/ProjectCard.tsx`, `src/components/ProjectJsonLd.tsx`, `src/app/realizacje/page.tsx`, `src/app/realizacje/[slug]/page.tsx`, `kryscar-mind/map/zones/realizacje.md`, `kryscar-mind/map/decisions/realizacje-gallery.md`.
**Modify:** `scripts/fetch-stock.sh`, `src/lib/blur-data.ts` (generated), `src/app/sitemap.ts`, `src/components/SiteHeader.tsx`, `src/components/SiteFooter.tsx`, `src/app/example-9/page.tsx`, + touched Mind zones in the final task.

**Dependency order:** T1 (data) → T2 (images) → T3 (slider) / T4 (card+jsonld) → T5 (detail) → T6 (index) → T7 (sitemap/nav/footer) → T8 (homepage teaser) → T9 (Mind + verify). Each task compiles and commits independently.

**Commit hygiene:** targeted `git add <paths>` only — NEVER `git add -A` (the repo has untracked `.obsidian/*` and `email-signature*.html` that must not be committed). Every commit ends with the trailer `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

---

### Task 1: Projects data layer (`src/lib/projects.ts`)

**Files:** Create `src/lib/projects.ts`

- [ ] **Step 1: Create the file** — types, `CATEGORY_LABELS`, the 6 `PROJECTS` (project #1 full + #2–#6 from briefs), accessors.

```ts
// src/lib/projects.ts
/**
 * "Realizacje" — before/after project gallery content for /realizacje and
 * /realizacje/[slug].
 *
 * MIGRATION (PayloadCMS): this module is the ONLY place that knows the project
 * content source. `Project` mirrors a future Payload `projects` collection
 * (slug:text-unique, title/excerpt:text, category:select, location/year:text,
 * scope:array<{item}>, pairs:array<{before:upload, after:upload, caption?}>,
 * body:array<{paragraph}> or richText, relatedService:relationship→services,
 * metaTitle/metaDescription in an `seo` group). To migrate: reimplement the
 * accessors below. NOTHING ELSE in the app changes — pages/components consume
 * only these accessors (await) or receive props.
 *
 * Image paths are stored inline (project-specific, not shared brand imagery);
 * every before/after path MUST be present in src/lib/blur-data.ts (BLUR_DATA),
 * which holds after the fetch + `npm run blur` (Task 2). category /
 * relatedService must be real SERVICES slugs.
 */

export interface BeforeAfter {
  before: string; // public path, in BLUR_DATA
  after: string;  // public path, in BLUR_DATA
  caption?: string;
}

export interface Project {
  slug: string;
  title: string;
  category: string;       // SERVICES slug: "aranzacja" | "rabaty"
  excerpt: string;
  location: string;
  year: string;
  scope: string[];
  pairs: BeforeAfter[];   // >=1; pairs[0].after is the card cover
  body: string[];
  relatedService: string; // SERVICES slug
  metaTitle: string;
  metaDescription: string;
}

/** Short badge labels for the project category (NOT the service-category CATEGORIES map). */
export const CATEGORY_LABELS: Record<string, string> = {
  aranzacja: "Aranżacja",
  rabaty: "Rabaty",
};

const PROJECTS: Project[] = [
  // ===== Project #1 — AUTHORED IN FULL (template) =====
  {
    slug: "metamorfoza-ogrodu-osielsko",
    title: "Metamorfoza ogrodu przydomowego w Osielsku",
    category: "aranzacja",
    excerpt:
      "Zarośnięty, zaniedbany ogród zamieniliśmy w uporządkowaną, nowoczesną przestrzeń — z równym trawnikiem, rabatami i ścieżką.",
    location: "Osielsko",
    year: "2025",
    scope: [
      "Uprzątnięcie i karczowanie zaniedbanej zieleni",
      "Wyrównanie terenu i założenie nowego trawnika z rolki",
      "Nasadzenia: byliny, trawy ozdobne i iglaki",
      "Rabaty ściółkowane korą wzdłuż ogrodzenia",
      "Ścieżka i obrzeża z kostki betonowej",
    ],
    pairs: [
      {
        before: "/img/projects/metamorfoza-ogrodu-osielsko-before.jpg",
        after: "/img/projects/metamorfoza-ogrodu-osielsko-after.jpg",
        caption: "Stan zastany i ogród po realizacji",
      },
    ],
    body: [
      "Klient zgłosił się do nas z ogrodem, który po latach zaniedbania bardziej przypominał nieużytek niż przestrzeń do wypoczynku. Zaczęliśmy od gruntownego uprzątnięcia: usunęliśmy samosiewy, przerośnięte krzewy i resztki starego trawnika, a następnie wyrównaliśmy teren pod nowe założenie.",
      "Całość zaprojektowaliśmy tak, by ogród był efektowny, ale prosty w utrzymaniu. Nowy trawnik z rolki dał natychmiastowy efekt, a dobrane do stanowiska byliny i trawy ozdobne sprawiają, że rabaty wyglądają dobrze przez cały sezon. Po realizacji klient zlecił nam także stałą pielęgnację.",
    ],
    relatedService: "aranzacja",
    metaTitle: "Metamorfoza ogrodu w Osielsku — realizacja | Ogrody Kryscar",
    metaDescription:
      "Przed i po: zaniedbany ogród w Osielsku zamieniony w uporządkowaną przestrzeń z nowym trawnikiem i rabatami. Aranżacja ogrodu — Ogrody Kryscar, Bydgoszcz i okolice.",
  },

  // ===== Projects #2–#6 — author excerpt/scope/body from the briefs below =====
];

const sorted = () =>
  [...PROJECTS].sort((a, b) =>
    a.year < b.year ? 1 : a.year > b.year ? -1 : 0,
  );

export async function getAllProjects(): Promise<Project[]> {
  return sorted();
}

export async function getProjectSlugs(): Promise<string[]> {
  return PROJECTS.map((p) => p.slug);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return PROJECTS.find((p) => p.slug === slug) ?? null;
}

export async function getProjectsForService(serviceSlug: string): Promise<Project[]> {
  return sorted().filter((p) => p.relatedService === serviceSlug);
}
```

**Briefs for #2–#6** (each a `Project` in the array; metadata fixed, author `excerpt`/`scope`/`body`). All `pairs` = one entry `{ before: "/img/projects/<slug>-before.jpg", after: "/img/projects/<slug>-after.jpg", caption: "Stan zastany i efekt po realizacji" }`.

**#2** `rabata-bylinowa-niemcz` · "Rabata bylinowa zamiast trawnika — Niemcz" · `category: "rabaty"` · `location: "Niemcz"` · `year: "2025"` · `relatedService: "rabaty"`
- scope points: wytyczenie kształtu rabaty; wymiana/przygotowanie podłoża; dobór bylin i traw ozdobnych pod nasłonecznienie; sadzenie w przemyślanej kompozycji; ściółkowanie korą + obrzeże.
- body: kawałek nudnego trawnika zamieniony w kwitnącą rabatę; dobór roślin tak, by coś kwitło przez większość sezonu i utrzymanie było proste.
- metaTitle: "Rabata bylinowa zamiast trawnika (Niemcz) — realizacja | Ogrody Kryscar"
- metaDescription: "Przed i po: fragment trawnika w Niemczu zamieniony w kwitnącą rabatę bylinową. Zakładanie rabat — Ogrody Kryscar, Bydgoszcz i okolice."

**#3** `front-domu-fordon` · "Front domu: od betonu do zieleni — Bydgoszcz-Fordon" · `category: "aranzacja"` · `location: "Bydgoszcz"` · `year: "2024"` · `relatedService: "aranzacja"`
- scope: demontaż/ograniczenie betonowej nawierzchni; przygotowanie gruntu; nasadzenia frontowe (iglaki, krzewy ozdobne); pas zieleni i ściółkowanie; reprezentacyjne wejście.
- body: front zdominowany przez beton; wprowadzenie zieleni, by dom zyskał reprezentacyjny, „zielony" charakter bez utraty funkcjonalności; dobór roślin niskich w utrzymaniu.
- metaTitle: "Front domu od betonu do zieleni (Fordon) — realizacja | Ogrody Kryscar"
- metaDescription: "Przed i po: betonowy front domu w bydgoskim Fordonie zamieniony w reprezentacyjną zieleń. Aranżacja ogrodu — Ogrody Kryscar."

**#4** `uporzadkowany-ogrod-zoledowo` · "Zaniedbany ogród → uporządkowana przestrzeń — Żołędowo" · `category: "aranzacja"` · `location: "Żołędowo"` · `year: "2025"` · `relatedService: "aranzacja"`
- scope: uprzątnięcie i wywóz zalegającej zieleni; cięcie i odmłodzenie zachowanych krzewów; nowy trawnik; wytyczenie stref (wypoczynek/zieleń); ściółkowane rabaty.
- body: ogród po dłuższej nieobecności właścicieli; uporządkowanie tego, co dało się uratować, i uzupełnienie nowymi nasadzeniami; czytelny podział przestrzeni.
- metaTitle: "Uporządkowanie zaniedbanego ogrodu (Żołędowo) — realizacja | Ogrody Kryscar"
- metaDescription: "Przed i po: zaniedbany ogród w Żołędowie uporządkowany i odmłodzony. Aranżacja i pielęgnacja — Ogrody Kryscar, Bydgoszcz i okolice."

**#5** `rabata-przy-tarasie-osielsko` · "Rabata ozdobna przy tarasie — Osielsko" · `category: "rabaty"` · `location: "Osielsko"` · `year: "2024"` · `relatedService: "rabaty"`
- scope: wytyczenie rabaty wzdłuż tarasu; przygotowanie podłoża; dobór roślin znoszących sąsiedztwo nawierzchni; sadzenie + ściółka żwirowa/korowa; obrzeże.
- body: pusty pas przy tarasie zamieniony w ozdobną rabatę, która „domyka" strefę wypoczynku; rośliny dobrane tak, by nie zarastały tarasu i ładnie się komponowały.
- metaTitle: "Rabata ozdobna przy tarasie (Osielsko) — realizacja | Ogrody Kryscar"
- metaDescription: "Przed i po: pas przy tarasie w Osielsku zamieniony w ozdobną rabatę. Zakładanie rabat — Ogrody Kryscar."

**#6** `aranzacja-z-trawnikiem-biale-blota` · "Aranżacja ogrodu z nowym trawnikiem — Białe Błota" · `category: "aranzacja"` · `location: "Białe Błota"` · `year: "2025"` · `relatedService: "aranzacja"`
- scope: przygotowanie terenu na nowej działce; założenie trawnika; nasadzenia i rabaty; wytyczenie ścieżek; ściółkowanie i wykończenie.
- body: ogród zakładany praktycznie od zera na nowym osiedlu w Białych Błotach; kompleksowa aranżacja — od gruntu po gotowy, urządzony ogród z trawnikiem i rabatami.
- metaTitle: "Aranżacja ogrodu z nowym trawnikiem (Białe Błota) — realizacja | Ogrody Kryscar"
- metaDescription: "Przed i po: ogród urządzony od zera w Białych Błotach — nowy trawnik, nasadzenia i rabaty. Aranżacja ogrodu — Ogrody Kryscar."

- [ ] **Step 2: Typecheck** — Run: `npx tsc --noEmit` → no errors. (Images don't exist yet; paths are just strings, so tsc is fine.)
- [ ] **Step 3: Commit**

```bash
git add src/lib/projects.ts
git commit -m "feat(realizacje): projects data layer with 6 seed projects

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Fetch placeholder before/after images

**Files:** Modify `scripts/fetch-stock.sh`; generate `public/img/projects/*.jpg` + `src/lib/blur-data.ts`

- [ ] **Step 1: Add a Realizacje section to `scripts/fetch-stock.sh`**

After the `OUT_WINTER=...` line, add the projects output dir to the existing `mkdir -p` line (or add a new mkdir). Locate:

```bash
OUT_WINTER="$ROOT/public/img/winter"
mkdir -p "$OUT_GARDEN" "$OUT_TEAM" "$OUT_WINTER"
```

Change to:

```bash
OUT_WINTER="$ROOT/public/img/winter"
OUT_PROJECTS="$ROOT/public/img/projects"
mkdir -p "$OUT_GARDEN" "$OUT_TEAM" "$OUT_WINTER" "$OUT_PROJECTS"
```

Then, before the final `echo "Done."`, add:

```bash
echo "Realizacje (before/after placeholders):"
fetch metamorfoza-ogrodu-osielsko-before    "overgrown neglected garden weeds"   "$OUT_PROJECTS" horizontal
fetch metamorfoza-ogrodu-osielsko-after     "manicured landscaped garden lawn"   "$OUT_PROJECTS" horizontal
fetch rabata-bylinowa-niemcz-before         "plain grass lawn backyard"          "$OUT_PROJECTS" horizontal
fetch rabata-bylinowa-niemcz-after          "perennial flower bed border garden" "$OUT_PROJECTS" horizontal
fetch front-domu-fordon-before              "concrete house front yard"          "$OUT_PROJECTS" horizontal
fetch front-domu-fordon-after               "front yard landscaping shrubs"      "$OUT_PROJECTS" horizontal
fetch uporzadkowany-ogrod-zoledowo-before   "messy overgrown backyard garden"    "$OUT_PROJECTS" horizontal
fetch uporzadkowany-ogrod-zoledowo-after    "tidy landscaped backyard garden"    "$OUT_PROJECTS" horizontal
fetch rabata-przy-tarasie-osielsko-before   "empty patio garden border"          "$OUT_PROJECTS" horizontal
fetch rabata-przy-tarasie-osielsko-after    "ornamental garden bed patio"        "$OUT_PROJECTS" horizontal
fetch aranzacja-z-trawnikiem-biale-blota-before "bare soil new build garden plot" "$OUT_PROJECTS" horizontal
fetch aranzacja-z-trawnikiem-biale-blota-after  "new lawn landscaped garden home"  "$OUT_PROJECTS" horizontal
```

- [ ] **Step 2: Run the fetch** (the API key is in `.env.local`)

Run: `set -a; . ./.env.local; set +a; bash scripts/fetch-stock.sh`
Expected: prints `ok <slug> → …` for the 12 new project slots (existing garden/team/winter slots print `skip … (exists)`).

- [ ] **Step 3: Fallback for any miss** — if any of the 12 files is absent (a query returned no hit), copy an existing committed garden image so the path exists and the gallery isn't broken:

Run (only for missing files):
```bash
cd "$(git rev-parse --show-toplevel)"
# before-misses → a plainer garden; after-misses → a nicer garden
for f in metamorfoza-ogrodu-osielsko rabata-bylinowa-niemcz front-domu-fordon uporzadkowany-ogrod-zoledowo rabata-przy-tarasie-osielsko aranzacja-z-trawnikiem-biale-blota; do
  [ -f "public/img/projects/$f-before.jpg" ] || cp public/img/garden/backyard1.jpg "public/img/projects/$f-before.jpg"
  [ -f "public/img/projects/$f-after.jpg" ]  || cp public/img/garden/parkGarden.jpg "public/img/projects/$f-after.jpg"
done
ls public/img/projects
```
Expected: all 12 `*-before.jpg` / `*-after.jpg` present.

- [ ] **Step 4: Regenerate the blur map**

Run: `npm run blur`
Expected: `src/lib/blur-data.ts` now contains the 12 `"/img/projects/…"` keys. Verify: `grep -c '/img/projects/' src/lib/blur-data.ts` → `12`.

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-stock.sh public/img/projects src/lib/blur-data.ts
git commit -m "feat(realizacje): fetch before/after stock placeholders + blur map

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: `BeforeAfterSlider` client island

**Files:** Create `src/components/BeforeAfterSlider.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

export interface SliderImage {
  src: string;
  blurDataURL?: string;
  alt: string;
}

/**
 * Hand-rolled before/after comparison. The "after" image is the base layer;
 * the "before" image is layered on top and revealed from the left up to the
 * handle position via clip-path (so it never squishes). Drag (mouse/touch via
 * pointer events) or keyboard (←/→). Blur strings are passed in as props so the
 * client bundle doesn't import the whole BLUR_DATA map.
 */
export function BeforeAfterSlider({
  before,
  after,
}: {
  before: SliderImage;
  after: SliderImage;
}) {
  const [pos, setPos] = useState(50); // % revealed of "before" (from left)
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  return (
    <div
      ref={ref}
      className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) setFromClientX(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      {/* AFTER (base) */}
      <Image
        src={after.src}
        alt={after.alt}
        fill
        sizes="(min-width: 768px) 768px, 100vw"
        className="object-cover"
        placeholder={after.blurDataURL ? "blur" : "empty"}
        blurDataURL={after.blurDataURL}
      />
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
        PO
      </span>

      {/* BEFORE (revealed from the left up to pos%) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image
          src={before.src}
          alt={before.alt}
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
          placeholder={before.blurDataURL ? "blur" : "empty"}
          blurDataURL={before.blurDataURL}
        />
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
          PRZED
        </span>
      </div>

      {/* Handle */}
      <div
        role="slider"
        aria-label="Porównanie przed i po — przesuń, aby odsłonić"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            setPos((p) => Math.max(0, p - 4));
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            setPos((p) => Math.min(100, p + 4));
          }
        }}
        className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 cursor-ew-resize bg-white/90 outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        style={{ left: `${pos}%` }}
      >
        <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-neutral-800 shadow-md ring-1 ring-neutral-300">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 7l-4 5 4 5M16 7l4 5-4 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint** — Run: `npx tsc --noEmit && npx eslint src/components/BeforeAfterSlider.tsx` → no errors.
- [ ] **Step 3: Commit**

```bash
git add src/components/BeforeAfterSlider.tsx
git commit -m "feat(realizacje): hand-rolled before/after drag slider

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: `ProjectCard` + `ProjectJsonLd`

**Files:** Create `src/components/ProjectCard.tsx`, `src/components/ProjectJsonLd.tsx`

- [ ] **Step 1: `ProjectCard`**

```tsx
// src/components/ProjectCard.tsx
import Link from "next/link";
import { BlurImage } from "@/components/BlurImage";
import { CATEGORY_LABELS, type Project } from "@/lib/projects";

export function ProjectCard({ project }: { project: Project }) {
  const cover = project.pairs[0]?.after;
  return (
    <Link
      href={`/realizacje/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-colors hover:border-emerald-700"
    >
      <div className="relative aspect-[4/3] w-full bg-neutral-100">
        {cover && (
          <BlurImage
            src={cover}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-800 backdrop-blur">
          {CATEGORY_LABELS[project.category] ?? "Realizacja"}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-neutral-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
          Przed / Po
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold tracking-tight group-hover:text-emerald-700">
          {project.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">{project.excerpt}</p>
        <span className="mt-4 text-xs uppercase tracking-wider text-neutral-500">
          {project.location} · {project.year}
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: `ProjectJsonLd`**

```tsx
// src/components/ProjectJsonLd.tsx
import { COMPANY } from "@/lib/data";

export interface JsonLdCrumb {
  name: string;
  item: string; // absolute URL
}

/** Emits ImageObject (the "after" photo) + BreadcrumbList for a project page. */
export function ProjectJsonLd({
  title,
  image,
  breadcrumbs,
}: {
  title: string;
  image: string; // absolute URL
  breadcrumbs: JsonLdCrumb[];
}) {
  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ImageObject",
        contentUrl: image,
        name: title,
        creditText: COMPANY.name,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: b.item,
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
```

- [ ] **Step 3: Typecheck + lint** — Run: `npx tsc --noEmit && npx eslint src/components/ProjectCard.tsx src/components/ProjectJsonLd.tsx` → no errors.
- [ ] **Step 4: Commit**

```bash
git add src/components/ProjectCard.tsx src/components/ProjectJsonLd.tsx
git commit -m "feat(realizacje): ProjectCard + ProjectJsonLd

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Detail page `/realizacje/[slug]/page.tsx`

**Files:** Create `src/app/realizacje/[slug]/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
// src/app/realizacje/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPANY, SITE_URL } from "@/lib/data";
import { BLUR_DATA } from "@/lib/blur-data";
import {
  getAllProjects,
  getProjectBySlug,
  getProjectSlugs,
  CATEGORY_LABELS,
} from "@/lib/projects";
import { getCatalogServices } from "@/lib/catalog";
import type { CatalogItem } from "@/components/service-catalog";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectJsonLd } from "@/components/ProjectJsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/motion";

// Daily ISR so the seasonal winter banner (SiteHeader) flips without a redeploy.
export const revalidate = 86400;

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Nie znaleziono" };
  return {
    title: project.metaTitle,
    description: project.metaDescription,
    alternates: { canonical: `/realizacje/${project.slug}` },
    openGraph: {
      title: project.metaTitle,
      description: project.metaDescription,
      url: `/realizacje/${project.slug}`,
      type: "article",
      images: [`${SITE_URL}${project.pairs[0]?.after ?? ""}`],
    },
  };
}

export default async function RealizacjaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const service = getCatalogServices().find(
    (c): c is CatalogItem => c.slug === project.relatedService,
  );
  const others = (await getAllProjects()).filter((p) => p.slug !== project.slug).slice(0, 3);
  const cover = project.pairs[0]?.after ?? "";

  return (
    <main className="bg-white text-neutral-900">
      <ProjectJsonLd
        title={project.title}
        image={`${SITE_URL}${cover}`}
        breadcrumbs={[
          { name: "Strona główna", item: SITE_URL },
          { name: "Realizacje", item: `${SITE_URL}/realizacje` },
          { name: project.title, item: `${SITE_URL}/realizacje/${project.slug}` },
        ]}
      />
      <SiteHeader />

      {/* Breadcrumb */}
      <nav aria-label="Okruszki" className="mx-auto max-w-5xl px-4 pt-6 text-xs text-neutral-500 sm:px-6">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-emerald-700">Strona główna</Link></li>
          <li aria-hidden>›</li>
          <li><Link href="/realizacje" className="hover:text-emerald-700">Realizacje</Link></li>
          <li aria-hidden>›</li>
          <li className="text-neutral-900">{project.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider text-neutral-500">
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-800">
              {CATEGORY_LABELS[project.category] ?? "Realizacja"}
            </span>
            <span>{project.location}</span>
            <span aria-hidden>·</span>
            <span>{project.year}</span>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-700">{project.excerpt}</p>
        </Reveal>
      </section>

      {/* Before/after slider(s) */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="space-y-4">
          {project.pairs.map((pair, i) => (
            <figure key={i}>
              <BeforeAfterSlider
                before={{ src: pair.before, blurDataURL: BLUR_DATA[pair.before], alt: `${project.title} — przed` }}
                after={{ src: pair.after, blurDataURL: BLUR_DATA[pair.after], alt: `${project.title} — po` }}
              />
              {pair.caption && (
                <figcaption className="mt-2 text-center text-xs text-neutral-500">{pair.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </section>

      {/* Zakres prac + opis */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Zakres prac</h2>
            <ul className="mt-6 space-y-3">
              {project.scope.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-neutral-700">
                  <span aria-hidden className="mt-0.5 text-emerald-700">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">O realizacji</h2>
            {project.body.map((p, i) => (
              <p key={i} className="mt-4 text-sm leading-relaxed text-neutral-700 sm:text-base">{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Related offer */}
      {service && (
        <section className="bg-neutral-50">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">Chcesz podobny efekt u siebie?</h2>
            <p className="mt-3 max-w-2xl text-sm text-neutral-600">
              Tę realizację wykonaliśmy w ramach usługi „{service.title}". Zacznijmy od bezpłatnej wyceny.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/uslugi/${service.slug}`} className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium transition-colors hover:border-emerald-700 hover:text-emerald-700">
                {service.title} →
              </Link>
              <a href={`tel:${COMPANY.phoneRaw}`} className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
                Zadzwoń: {COMPANY.phone}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Inne realizacje */}
      {others.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Inne realizacje</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
```

- [ ] **Step 2: Typecheck + lint** — Run: `npx tsc --noEmit && npx eslint "src/app/realizacje/[slug]/page.tsx"` → no errors. (`CatalogItem` is exported from `service-catalog.tsx`; `getCatalogServices` is sync.)
- [ ] **Step 3: Commit**

```bash
git add "src/app/realizacje/[slug]/page.tsx"
git commit -m "feat(realizacje): per-project detail page

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Gallery index `/realizacje/page.tsx`

**Files:** Create `src/app/realizacje/page.tsx`

- [ ] **Step 1: Write the index**

```tsx
// src/app/realizacje/page.tsx
import type { Metadata } from "next";
import { COMPANY, SITE_URL } from "@/lib/data";
import { getAllProjects } from "@/lib/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Realizacje — metamorfozy ogrodów przed i po | Ogrody Kryscar",
  description:
    "Realizacje Ogrody Kryscar: zdjęcia przed i po aranżacji ogrodów i zakładania rabat w Bydgoszczy i okolicy. Zobacz metamorfozy, które wykonaliśmy.",
  alternates: { canonical: "/realizacje" },
};

// Daily ISR so the seasonal winter banner (SiteHeader) flips without a redeploy.
export const revalidate = 86400;

export default async function RealizacjePage() {
  const projects = await getAllProjects();

  return (
    <main className="bg-white text-neutral-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Strona główna", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Realizacje", item: `${SITE_URL}/realizacje` },
            ],
          }),
        }}
      />
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Realizacje</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Metamorfozy ogrodów — przed i po
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-700">
            Wybrane ogrody, które zaprojektowaliśmy i urządziliśmy w Bydgoszczy i okolicy.
            Przesuń suwak na zdjęciach, żeby zobaczyć, jak zmieniła się przestrzeń.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 sm:p-12">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            Twój ogród może być następny.
          </h2>
          <p className="mt-4 max-w-xl text-sm text-neutral-600 sm:text-base">
            Aranżacja, rabaty, kompleksowe urządzenie ogrodu — zacznijmy od bezpłatnej wyceny.
          </p>
          <div className="mt-6">
            <a href={`tel:${COMPANY.phoneRaw}`} className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
              Zadzwoń: {COMPANY.phone}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
```

- [ ] **Step 2: Typecheck + lint** — Run: `npx tsc --noEmit && npx eslint src/app/realizacje/page.tsx` → no errors.
- [ ] **Step 3: Commit**

```bash
git add src/app/realizacje/page.tsx
git commit -m "feat(realizacje): gallery index page

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Sitemap + header nav + footer links

**Files:** Modify `src/app/sitemap.ts`, `src/components/SiteHeader.tsx`, `src/components/SiteFooter.tsx`

- [ ] **Step 1: Sitemap** — add the import (after the `getServiceSlugs` import):

```ts
import { getProjectSlugs } from "@/lib/projects";
```

Add `getProjectSlugs()` to the `Promise.all` destructuring:

```ts
  const [citySlugs, winterSlugs, serviceSlugs, guides, projectSlugs] = await Promise.all([
    getLocationSlugs(),
    getWinterServiceSlugs(),
    getServiceSlugs(),
    getAllGuides(),
    getProjectSlugs(),
  ]);
```

(If `getAllGuides` isn't already destructured exactly like this, keep the existing entries and just append `getProjectSlugs()` / `projectSlugs`.) Then add these entries to the returned array (next to the other blocks):

```ts
    {
      url: `${SITE_URL}/realizacje`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...projectSlugs.map((slug) => ({
      url: `${SITE_URL}/realizacje/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
```

- [ ] **Step 2: Header nav** — in `src/components/SiteHeader.tsx`, add a "Realizacje" link immediately after the "Katalog" link:

```tsx
            <Link href="/realizacje" className="hover:text-emerald-700">Realizacje</Link>
```

(Insert it right after `<Link href="/#katalog" className="hover:text-emerald-700">Katalog</Link>`.)

- [ ] **Step 3: Footer** — in `src/components/SiteFooter.tsx`, add a "Realizacje" item at the top of the "Firma" column's `<ul>` (before the "Zespół" `<li>`):

```tsx
              <li><Link href="/realizacje" className="underline-offset-4 hover:text-emerald-700 hover:underline">Realizacje</Link></li>
```

- [ ] **Step 4: Typecheck + lint** — Run: `npx tsc --noEmit && npx eslint src/app/sitemap.ts src/components/SiteHeader.tsx src/components/SiteFooter.tsx` → no errors.
- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.ts src/components/SiteHeader.tsx src/components/SiteFooter.tsx
git commit -m "feat(realizacje): sitemap entries + nav + footer links

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Homepage teaser (example-9)

**Files:** Modify `src/app/example-9/page.tsx`

- [ ] **Step 1: Add imports** (after the existing `getAllGuides`/`GuideCard` imports near the top):

```ts
import { getAllProjects } from "@/lib/projects";
import { ProjectCard } from "@/components/ProjectCard";
```

- [ ] **Step 2: Fetch 3 projects** — after the existing `const latestGuides = ...` line in `Example9`, add:

```ts
  const latestProjects = (await getAllProjects()).slice(0, 3);
```

- [ ] **Step 3: Insert the teaser** between `<ServiceCatalog services={services} />` and the `{/* DETAIL / PROCESS */}` comment:

```tsx
      {/* Realizacje teaser */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Realizacje</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Metamorfozy ogrodów — przed i po
              </h2>
            </div>
            <Link href="/realizacje" className="text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-900">
              Zobacz wszystkie →
            </Link>
          </div>
        </Reveal>
        <StaggerGrid className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latestProjects.map((p) => (
            <StaggerItem key={p.slug}>
              <ProjectCard project={p} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>
```

(`Reveal`, `StaggerGrid`, `StaggerItem`, and `Link` are already imported in this file.)

- [ ] **Step 4: Typecheck + lint** — Run: `npx tsc --noEmit && npx eslint src/app/example-9/page.tsx` → no errors.
- [ ] **Step 5: Commit**

```bash
git add src/app/example-9/page.tsx
git commit -m "feat(realizacje): homepage teaser after the service catalog

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Mind upkeep + full verification

**Files:** Create `kryscar-mind/map/zones/realizacje.md`, `kryscar-mind/map/decisions/realizacje-gallery.md`; modify `kryscar-mind/map/zones/{layout-chrome,homepage-and-variants,seo,image-loading}.md`

- [ ] **Step 1: Full gate** — Run: `npm run check` → 0 errors (only the 3 pre-existing `<img>` warnings; they may appear doubled due to a stray `.claude/worktrees/...` copy — that's fine). If NEW issues, fix before continuing.
- [ ] **Step 2: Build** — Run: `npm run build` → succeeds; `/realizacje` (○/●) and the 6 `/realizacje/[slug]` routes generate with `Revalidate 1d`. Report the route-table lines.
- [ ] **Step 3: Capture HEAD** — Run: `git rev-parse HEAD` → use as `<HEAD>`.
- [ ] **Step 4: Zone card** `kryscar-mind/map/zones/realizacje.md`:

```markdown
---
type: zone
summary: "Realizacje — before/after project gallery (/realizacje + /realizacje/[slug]) for aranżacja/rabaty, its Payload-ready projects data layer, and the BeforeAfterSlider client island."
tags: [feature, ui, seo, data, gallery]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[service-pages]]", "[[service-catalog]]", "[[layout-chrome]]", "[[homepage-and-variants]]", "[[seo]]", "[[image-loading]]"]
sources: ["[[2026-06-03-realizacje-gallery-design]]"]
owns:
  routes: ["/realizacje", "/realizacje/[slug]"]
  anchors: ["symbol:getAllProjects", "symbol:getProjectBySlug", "symbol:getProjectSlugs", "symbol:getProjectsForService", "symbol:Project", "symbol:BeforeAfterSlider", "symbol:ProjectCard", "symbol:ProjectJsonLd"]
  globs: ["src/app/realizacje/**", "src/lib/projects.ts", "src/components/BeforeAfterSlider.tsx", "src/components/ProjectCard.tsx", "src/components/ProjectJsonLd.tsx"]
depends: ["[[service-pages]]", "[[service-catalog]]", "[[image-loading]]", "[[layout-chrome]]"]
invariants:
  - rule: "Components consume projects only via async accessors — no component imports the PROJECTS array (Payload-migration boundary)"
    enforcedBy: []
  - rule: "every before/after image path is present in BLUR_DATA so the slider always blurs up"
    enforcedBy: []
  - rule: "pages render SiteHeader, so they set revalidate=86400 (site-wide winter banner)"
    enforcedBy: []
verifiedAt: "<HEAD>"
---
## Purpose
Visual before/after proof for the high-ticket aranżacja/rabaty work. Data flows through async accessors (Payload-ready). The drag slider is a `"use client"` island; everything else is static + daily ISR.
## Anchors
`getAllProjects`, `getProjectBySlug`, `getProjectsForService`, `Project`, `BeforeAfterSlider`, `ProjectCard`, `ProjectJsonLd`, `route:/realizacje`, `route:/realizacje/[slug]`.
## Lineage
sources → [[2026-06-03-realizacje-gallery-design]]; decision → [[realizacje-gallery]].
```

- [ ] **Step 5: Decision record** `kryscar-mind/map/decisions/realizacje-gallery.md`:

```markdown
---
type: decision
summary: "Before/after gallery is named 'Realizacje' (/realizacje + /realizacje/[slug]); the comparison is a hand-rolled clip-path drag slider client island (no dep); placeholder before/after pairs are fetched stock; project image paths live inline on Project (not IMG keys)."
tags: [ui, gallery, seo, data, decision]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[realizacje]]", "[[service-pages]]", "[[image-loading]]"]
sources: ["[[2026-06-03-realizacje-gallery-design]]"]
decided: 2026-06-03
supersededBy: ""
---
## Context
High-ticket aranżacja/rabaty jobs close on visual proof. We needed a before/after gallery as a subpage + homepage section + nav/footer item, with stock placeholders until real paired photos exist.
## Decision
Name "Realizacje", route `/realizacje` (index) + `/realizacje/[slug]` (detail). Approach A: `projects.ts` const array behind async accessors. The before/after comparison is a hand-rolled `"use client"` `BeforeAfterSlider` (clip-path reveal, pointer + keyboard) — no comparison-slider dependency. Placeholder pairs are fetched from Pixabay via `fetch-stock.sh` into `public/img/projects/`. Project image paths are stored inline on `Project` (project-specific, not shared brand imagery — unlike `IMG`-keyed photos).
## Why
Hand-rolling the slider avoids a dependency for ~70 lines of code and keeps full control. Inline image paths avoid a dozen `IMG` keys for 1:1 project images. Fetched stock lets the client feel the feature before supplying real photos.
## Consequences
Real paired photos replace the stock later (same filenames, or update the paths). Pages render SiteHeader so they carry daily ISR. The `pairs` array supports multiple comparisons per project in future without a schema change.
```

- [ ] **Step 6: Re-stamp touched zones** — set `verifiedAt: "<HEAD>"` and add `[[realizacje]]` to `related:` where natural, in: `layout-chrome.md` (nav + footer gained a Realizacje link — mention in Purpose), `homepage-and-variants.md` (example-9 gained the Realizacje teaser), `seo.md` (sitemap now enumerates /realizacje — mention in Purpose), `image-loading.md` (blur map gained 12 /img/projects entries). Read each first; surgical edits only.
- [ ] **Step 7: Regenerate** — Run: `npm run mind` → succeeds, no broken anchors (the `realizacje` zone appears; ~16 zones). If anchors break, make the zone card's symbols/globs match the code.
- [ ] **Step 8: Commit**

```bash
git add kryscar-mind/map/
git commit -m "docs(mind): add realizacje zone + decision; re-stamp touched zones

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

(Verify `git status` shows only intended `kryscar-mind/map/` files staged — NOT `.obsidian/*`.)

---

## Self-review (completed during planning)

**Spec coverage:** data layer + 6 projects (T1), fetched stock images + blur (T2), drag slider (T3), ProjectCard + ProjectJsonLd (T4), detail page with slider/scope/related-offer/JSON-LD (T5), gallery index (T6), sitemap + nav + footer (T7), homepage teaser after catalog (T8), Mind + verification (T9). Error handling: `notFound()` (T5), empty-list guards (T5/T8), missing-blur → `placeholder="empty"` (T3), category integrity (real SERVICES slugs). All spec sections map to a task.

**Placeholder scan:** no "TBD"/"add error handling". The only deferred prose is projects #2–#6's excerpt/scope/body, fully specified by fixed metadata + point lists (see "Content authoring approach"), consistent with how `services.ts`/`guides.ts` content was produced. The fetch task has a deterministic fallback (copy existing images) so it can't leave broken paths.

**Type consistency:** `Project`/`BeforeAfter`/`CATEGORY_LABELS` defined in T1, used identically in T4/T5/T6/T8; accessor names (`getAllProjects`, `getProjectBySlug`, `getProjectSlugs`, `getProjectsForService`) consistent across T1/T5/T6/T7/T8; `SliderImage` prop shape matches T3↔T5; `ProjectJsonLd` props match T4↔T5; image paths `/img/projects/<slug>-{before,after}.jpg` match between T1 (data), T2 (fetch filenames), and BLUR_DATA lookups (T5).

## Out of scope (YAGNI)
Lightbox/multi-photo carousels, category filtering, a slider npm dep, IMG-key indirection for project images, real photography/testimonials, touching `/ogrodnik` or other `/example-N` variants.
