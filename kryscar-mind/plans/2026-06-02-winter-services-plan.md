---
type: plan
summary: "Task-by-task plan for the winter-services arc: /zima pages, winter data layer, seasonal engine, homepage escalation, SEO."
tags: [seo, feature, data, seasonal]
status: draft
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]", "[[seo]]", "[[homepage-and-variants]]"]
sources: ["[[2026-06-02-winter-services-design]]"]
implements: "[[2026-06-02-winter-services-design]]"
produced: ["[[winter-services]]"]
---
# Winter Services Arc — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a winter revenue arc — `/zima` hub + three `/zima/[usluga]` landing pages (odśnieżanie, świąteczne oświetlenie ogrodów, zimowe zabezpieczanie roślin), a Payload-ready winter data layer, a pure seasonal engine that escalates the homepage Nov–Mar, and SEO plumbing.

**Architecture:** Mirror the shipped city-pages pattern exactly — a private data array + async accessors in one module (`src/lib/winter.ts`), a single data-driven dynamic route (`/zima/[usluga]`) with `generateStaticParams`/`generateMetadata`, plus a static hub (`/zima`). A pure `src/lib/season.ts` (`isWinterActive(month, mode)`) drives homepage escalation via daily ISR. Presentational `WinterServiceCard` is shared by the homepage section and the hub.

**Tech Stack:** Next.js 16.2.6 App Router (async `params: Promise<…>`, route segment `revalidate`), React 19, TypeScript strict, `motion` (Reveal/StaggerGrid/StaggerItem), `lucide-react@1.16.0`, Tailwind v4.

> **⚠ No test runner in this repo.** There is no jest/vitest. The verification gate is `npm run check` (= `tsc --noEmit && eslint && node scripts/mind/generate.mjs`) plus `npm run build` for route smoke. Each task verifies with `npx tsc --noEmit` and, where it adds routes, `npm run build`. The seasonal logic is verified by types + a one-off `node -e` parity check + a manual `mode` toggle — NOT by a unit-test framework. Do not scaffold a test runner.

> **Branch:** all work lands on `feat/winter-services` (already created; the design spec is already committed there). Do NOT push to `main` — the user authorizes pushes explicitly.

---

## File Structure

**Create:**
- `src/lib/season.ts` — pure seasonal engine (`isWinterActive`, `isWinterNow`, `WINTER`, `WINTER_MONTHS`).
- `src/lib/winter.ts` — winter-services data layer (private `WINTER_SERVICES` + 3 async accessors + `WinterService` interface). Payload-migration boundary.
- `src/components/WinterServiceCard.tsx` — shared presentational card + `WinterServiceIcon` (lucide icon map).
- `src/components/ServiceJsonLd.tsx` — JSON-LD `Service` + breadcrumb for a winter page.
- `src/app/zima/[usluga]/page.tsx` — dynamic winter-service landing page.
- `src/app/zima/page.tsx` — winter hub page.
- `kryscar-mind/map/zones/winter-services.md` — new zone card.
- `kryscar-mind/map/decisions/winter-data-module.md`, `kryscar-mind/map/decisions/seasonal-toggle.md` — decision records.
- `kryscar-mind/tech-debt/source-winter-imagery.md` — deferral note.

**Modify:**
- `src/app/sitemap.ts` — add `/zima` + `/zima/[usluga]` entries.
- `src/components/SiteHeader.tsx` — add "Zima" nav link.
- `src/app/example-9/page.tsx` — winter section, ribbon, hero-badge swap, nav link, `revalidate`.
- `src/app/page.tsx` — re-export `revalidate` from example-9.
- `kryscar-mind/map/zones/seo.md`, `homepage-and-variants.md`, `layout-chrome.md` — touch + re-stamp `verifiedAt`.

---

## Task 1: Seasonal engine (`src/lib/season.ts`)

**Files:**
- Create: `src/lib/season.ts`

- [ ] **Step 1: Create the pure seasonal module**

```ts
// src/lib/season.ts
/**
 * Seasonal engine for the winter arc.
 *
 * `isWinterActive` is pure (month + mode injected) so it is trivially
 * reasoned about and reusable. `isWinterNow` is the server-component
 * convenience that reads the current month. Pages that branch on the
 * season MUST set `export const revalidate = 86400` so the toggle flips
 * within a day without a redeploy (a statically-prerendered `new Date()`
 * would otherwise freeze at build time).
 *
 * Manual override: set WINTER.mode to "on" (force the winter push, e.g.
 * an early cold snap or promo) or "off" (suppress it). "auto" follows the
 * WINTER_MONTHS window (Nov–Mar).
 */

/** 1-based month numbers that count as "winter" (Nov, Dec, Jan, Feb, Mar). */
export const WINTER_MONTHS = [11, 12, 1, 2, 3] as const;

export type WinterMode = "auto" | "on" | "off";

/** Site-wide winter control. Flip `mode` to force the seasonal push on/off. */
export const WINTER: { mode: WinterMode } = { mode: "auto" };

/**
 * Pure: is winter active for a given 1-based month under the given mode?
 * @param month 1-based (1 = January … 12 = December)
 */
export function isWinterActive(
  month: number,
  mode: WinterMode = WINTER.mode,
): boolean {
  if (mode === "on") return true;
  if (mode === "off") return false;
  return (WINTER_MONTHS as readonly number[]).includes(month);
}

/** Server-component convenience: is winter active right now? */
export function isWinterNow(now: Date = new Date()): boolean {
  return isWinterActive(now.getMonth() + 1);
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors.

- [ ] **Step 3: Parity-check the month logic (no test runner — one-off node assertion)**

Run:
```bash
node -e "const W=[11,12,1,2,3]; const f=(m,mode='auto')=>mode==='on'?true:mode==='off'?false:W.includes(m); const ok=[f(1)===true,f(3)===true,f(11)===true,f(12)===true,f(4)===false,f(7)===false,f(10)===false,f(7,'on')===true,f(1,'off')===false].every(Boolean); console.log(ok?'PARITY OK':'PARITY FAIL'); process.exit(ok?0:1)"
```
Expected: `PARITY OK` (this mirrors the table: Jan/Mar/Nov/Dec = winter; Apr/Jul/Oct = not; override wins).

- [ ] **Step 4: Commit**

```bash
git add src/lib/season.ts
git commit -m "feat(winter): add pure seasonal engine (auto/on/off, Nov–Mar)"
```

---

## Task 2: Winter data layer (`src/lib/winter.ts`)

**Files:**
- Create: `src/lib/winter.ts`

- [ ] **Step 1: Create the data module (interface + 3 entries + accessors)**

```ts
// src/lib/winter.ts
/**
 * Winter-services content for /zima and /zima/[usluga].
 *
 * MIGRATION (PayloadCMS): this module is the ONLY place that knows the data
 * source. `WinterService` mirrors a future Payload `winterServices`
 * collection (slug:text-unique, name/navLabel/tagline:text, icon:select,
 * hero:array<{paragraph}> or richText, includes:array<{item:text}>,
 * pricingNote:textarea, faq:array<{q:text,a:textarea}>, image:upload,
 * order:number, metaTitle:text + metaDescription:textarea in an `seo` group).
 * To migrate: reimplement the three async accessors below to call
 * `payload.find(...)`. NOTHING ELSE in the app changes — pages/components
 * consume only these accessors (await) or receive plain props.
 */

export interface WinterServiceFaq {
  q: string;
  a: string;
}

export interface WinterService {
  slug: string;
  name: string;
  navLabel: string;
  /** lucide icon key: "snowflake" | "sparkles" | "shield" */
  icon: string;
  tagline: string;
  hero: string[];
  includes: string[];
  pricingNote: string;
  faq: WinterServiceFaq[];
  metaTitle: string;
  metaDescription: string;
  /** optional image path; v1 falls back to a gradient + icon when absent */
  image?: string;
  order: number;
}

const WINTER_SERVICES: WinterService[] = [
  {
    slug: "odsniezanie",
    name: "Odśnieżanie",
    navLabel: "Odśnieżanie",
    icon: "snowflake",
    tagline: "Odśnieżone podjazdy, chodniki i wejścia — zanim zaczniesz dzień.",
    hero: [
      "Zimą ten sam zespół, który dba o Twój trawnik latem, odśnieża podjazd, chodnik i dojście do domu. Znamy już Twoją posesję, więc wiemy, gdzie odgarnąć śnieg i czego nie uszkodzić.",
      "Działamy w Bydgoszczy i okolicznych gminach — od jednorazowego odśnieżania po opadach po stałą gotowość przez cały sezon zimowy. Reagujemy szybko, także wcześnie rano, żeby wyjazd do pracy i dojście klientów było bezpieczne.",
    ],
    includes: [
      "Odgarnianie śniegu z podjazdów, chodników i dojść",
      "Usuwanie oblodzenia i posypywanie (sól drogowa lub piasek)",
      "Wywóz nadmiaru śniegu z posesji (na życzenie)",
      "Stała gotowość — reagujemy po każdym większym opadzie",
      "Tereny wspólnot, firm i obiektów komercyjnych",
    ],
    pricingNote:
      "Wycena zależy od powierzchni i formy współpracy (jednorazowo lub abonament zimowy). Dla stałych klientów ogrodowych — preferencyjne warunki. Wycena bezpłatna.",
    faq: [
      {
        q: "Czy odśnieżacie wcześnie rano?",
        a: "Tak. Przy stałej współpracy ustalamy godziny gotowości, żeby podjazd i dojście były odśnieżone, zanim wyjedziesz do pracy lub przyjdą klienci.",
      },
      {
        q: "Odśnieżacie tereny wspólnot i firm?",
        a: "Tak — obsługujemy zarówno posesje prywatne, jak i parkingi, dojścia i chodniki przy obiektach wspólnot oraz firm. Przy większych terenach ustalamy stały harmonogram.",
      },
      {
        q: "Czym usuwacie oblodzenie?",
        a: "Stosujemy sól drogową lub piasek w zależności od nawierzchni i Twoich preferencji — tak, by nie uszkodzić kostki ani roślin przy podjeździe.",
      },
    ],
    metaTitle:
      "Odśnieżanie Bydgoszcz i okolice — podjazdy, chodniki, posesje | Ogrody Kryscar",
    metaDescription:
      "Odśnieżanie podjazdów, chodników i dojść w Bydgoszczy i okolicy. Usuwanie oblodzenia, stała gotowość zimowa, tereny firm i wspólnot. Bezpłatna wycena: +48 668 994 483.",
    order: 1,
  },
  {
    slug: "swiateczne-oswietlenie",
    name: "Świąteczne oświetlenie ogrodów",
    navLabel: "Oświetlenie świąteczne",
    icon: "sparkles",
    tagline: "Montaż i demontaż iluminacji — bez stania na drabinie.",
    hero: [
      "Świąteczne światła w ogrodzie i na elewacji robią wrażenie, ale ich rozwieszanie to godziny na drabinie i plątanina kabli. Bierzemy to na siebie — projektujemy, montujemy, a po sezonie zdejmujemy i pakujemy.",
      "Pracujemy na Twoich ozdobach lub dobieramy nowe: lampki na drzewa i krzewy, kurtyny świetlne, dekoracje wejścia i tarasu. Wszystko zasilane bezpiecznie, z myślą o pogodzie i poborze prądu.",
    ],
    includes: [
      "Projekt iluminacji pod Twój ogród i elewację",
      "Montaż lampek na drzewach, krzewach i budynku",
      "Bezpieczne, zewnętrzne zasilanie i mocowania",
      "Demontaż i przechowanie ozdób po sezonie",
      "Praca na Twoich dekoracjach lub dobór nowych",
    ],
    pricingNote:
      "Cena zależy od zakresu iluminacji i tego, czy pracujemy na Twoich ozdobach, czy dobieramy nowe. Najlepiej rezerwować z wyprzedzeniem — listopadowe terminy schodzą najszybciej. Wycena bezpłatna.",
    faq: [
      {
        q: "Montujecie na moich lampkach, czy trzeba kupić nowe?",
        a: "Jak wolisz. Możemy pracować na Twoich dekoracjach albo dobrać i zamontować nowe — wtedy doradzamy zestaw pod ogród i elewację.",
      },
      {
        q: "Zdejmujecie ozdoby po świętach?",
        a: "Tak. W ustalonym terminie po sezonie demontujemy iluminację, zwijamy kable i pakujemy ozdoby, żeby przetrwały do następnego roku.",
      },
      {
        q: "Czy to bezpieczne przy zimowej pogodzie?",
        a: "Tak — używamy osprzętu przeznaczonego na zewnątrz, z odpowiednim zasilaniem i mocowaniami, które wytrzymują wiatr, śnieg i mróz.",
      },
    ],
    metaTitle:
      "Świąteczne oświetlenie ogrodów Bydgoszcz — montaż i demontaż | Ogrody Kryscar",
    metaDescription:
      "Montaż świątecznych iluminacji w ogrodzie i na elewacji w Bydgoszczy i okolicy. Projekt, bezpieczne zasilanie, demontaż po sezonie. Rezerwuj termin: +48 668 994 483.",
    order: 2,
  },
  {
    slug: "zimowe-zabezpieczanie-roslin",
    name: "Zimowe zabezpieczanie roślin",
    navLabel: "Zabezpieczanie roślin",
    icon: "shield",
    tagline: "Okrycie, ściółkowanie i ochrona — żeby ogród przetrwał mróz.",
    hero: [
      "Mróz, wiatr i zimowe słońce potrafią zniszczyć rośliny, które przez cały sezon rosły bez problemu. Przygotowujemy ogród na zimę: okrywamy wrażliwe gatunki, ściółkujemy i zabezpieczamy to, co najbardziej narażone.",
      "Wiemy, które rośliny w bydgoskich ogrodach wymagają ochrony i jak je okryć, żeby nie zaparzyć ich pod agrowłókniną. Wiosną wracamy, żeby zdjąć osłony we właściwym momencie.",
    ],
    includes: [
      "Okrywanie roślin wrażliwych (agrowłóknina, stroisz, kopczykowanie)",
      "Ściółkowanie korą i okrycie systemu korzeniowego",
      "Zabezpieczenie iglaków i form przed śniegiem (wiązanie)",
      "Ochrona pni młodych drzew przed mrozem i zwierzyną",
      "Wiosenne zdjęcie osłon w odpowiednim terminie",
    ],
    pricingNote:
      "Wycena zależy od liczby i rodzaju roślin oraz użytych materiałów. Dla stałych klientów ogrodowych łączymy to z jesiennymi porządkami. Wycena bezpłatna.",
    faq: [
      {
        q: "Które rośliny naprawdę trzeba okrywać?",
        a: "Najbardziej narażone są rośliny zimozielone, młode nasadzenia, róże, hortensje i wrażliwe iglaki. Podczas wyceny przejdziemy przez ogród i wskażemy, co wymaga ochrony, a co poradzi sobie samo.",
      },
      {
        q: "Czy zdejmujecie osłony na wiosnę?",
        a: "Tak — to ważne, bo zbyt późne zdjęcie agrowłókniny potrafi zaparzyć roślinę. Wracamy wiosną i odkrywamy nasadzenia we właściwym momencie.",
      },
      {
        q: "Można to połączyć z jesiennymi porządkami?",
        a: "Jak najbardziej. U stałych klientów zabezpieczanie roślin robimy przy okazji jesiennych porządków — jednym wyjazdem zamykamy sezon w ogrodzie.",
      },
    ],
    metaTitle:
      "Zimowe zabezpieczanie roślin Bydgoszcz — okrywanie i ochrona | Ogrody Kryscar",
    metaDescription:
      "Zabezpieczanie roślin na zimę w Bydgoszczy i okolicy: okrywanie agrowłókniną, ściółkowanie, ochrona iglaków i młodych drzew. Wiosenne zdjęcie osłon. Tel.: +48 668 994 483.",
    order: 3,
  },
];

export async function getWinterServices(): Promise<WinterService[]> {
  return [...WINTER_SERVICES].sort((a, b) => a.order - b.order);
}

export async function getWinterServiceSlugs(): Promise<string[]> {
  return WINTER_SERVICES.map((s) => s.slug);
}

export async function getWinterServiceBySlug(
  slug: string,
): Promise<WinterService | null> {
  return WINTER_SERVICES.find((s) => s.slug === slug) ?? null;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/winter.ts
git commit -m "feat(winter): add Payload-ready winter-services data layer"
```

---

## Task 3: Shared winter card + icon (`src/components/WinterServiceCard.tsx`)

**Files:**
- Create: `src/components/WinterServiceCard.tsx`

- [ ] **Step 1: Create the component (icon map + card)**

```tsx
// src/components/WinterServiceCard.tsx
import Link from "next/link";
import { Snowflake, Sparkles, ShieldCheck, type LucideIcon } from "lucide-react";
import type { WinterService } from "@/lib/winter";

const ICONS: Record<string, LucideIcon> = {
  snowflake: Snowflake,
  sparkles: Sparkles,
  shield: ShieldCheck,
};

export function WinterServiceIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = ICONS[icon] ?? Snowflake;
  return <Icon className={className} aria-hidden />;
}

export function WinterServiceCard({
  service,
  tone = "light",
}: {
  service: WinterService;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <Link
      href={`/zima/${service.slug}`}
      className={`group flex h-full flex-col rounded-3xl border p-6 transition-colors sm:p-7 ${
        dark
          ? "border-emerald-700/40 bg-emerald-800/40 hover:bg-emerald-800/70"
          : "border-neutral-200 bg-white hover:border-emerald-700"
      }`}
    >
      <span
        className={`grid h-12 w-12 place-items-center rounded-2xl ${
          dark ? "bg-emerald-50/10 text-emerald-200" : "bg-emerald-50 text-emerald-700"
        }`}
      >
        <WinterServiceIcon icon={service.icon} className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{service.name}</h3>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          dark ? "text-emerald-100/80" : "text-neutral-600"
        }`}
      >
        {service.tagline}
      </p>
      <span
        className={`mt-auto pt-5 text-sm font-medium ${
          dark ? "text-emerald-200" : "text-emerald-700"
        }`}
      >
        Dowiedz się więcej →
      </span>
    </Link>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0. (Confirms `Snowflake`, `Sparkles`, `ShieldCheck`, `LucideIcon` resolve in lucide-react@1.16.0.)

- [ ] **Step 3: Commit**

```bash
git add src/components/WinterServiceCard.tsx
git commit -m "feat(winter): shared WinterServiceCard + lucide icon map"
```

---

## Task 4: JSON-LD component (`src/components/ServiceJsonLd.tsx`)

**Files:**
- Create: `src/components/ServiceJsonLd.tsx`

- [ ] **Step 1: Create the component (mirrors LocationJsonLd)**

```tsx
// src/components/ServiceJsonLd.tsx
import { COMPANY, ADDRESS, SITE_URL } from "@/lib/data";
import type { WinterService } from "@/lib/winter";

export function ServiceJsonLd({ service }: { service: WinterService }) {
  const url = `${SITE_URL}/zima/${service.slug}`;
  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.name,
        serviceType: service.name,
        description: service.metaDescription,
        url,
        provider: {
          "@type": "LocalBusiness",
          name: COMPANY.name,
          telephone: COMPANY.phone,
          email: COMPANY.email,
          areaServed: { "@type": "City", name: ADDRESS.city },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Strona główna", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Zima", item: `${SITE_URL}/zima` },
          { "@type": "ListItem", position: 3, name: service.name, item: url },
        ],
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

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0. (`ADDRESS.city` = "Bydgoszcz" and `SITE_URL` both exist in `src/lib/data.ts`.)

- [ ] **Step 3: Commit**

```bash
git add src/components/ServiceJsonLd.tsx
git commit -m "feat(winter): ServiceJsonLd (Service + breadcrumb) for /zima pages"
```

---

## Task 5: Winter-service landing page (`src/app/zima/[usluga]/page.tsx`)

**Files:**
- Create: `src/app/zima/[usluga]/page.tsx`

- [ ] **Step 1: Create the dynamic route (mirrors ogrodnik/[miasto]/page.tsx)**

```tsx
// src/app/zima/[usluga]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPANY, PROCESS } from "@/lib/data";
import {
  getWinterServices,
  getWinterServiceBySlug,
  getWinterServiceSlugs,
} from "@/lib/winter";
import { getAllLocations } from "@/lib/locations";
import { CoverageMap } from "@/components/CoverageMap";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ServiceJsonLd } from "@/components/ServiceJsonLd";
import { WinterServiceIcon } from "@/components/WinterServiceCard";
import { Reveal } from "@/components/motion";

export async function generateStaticParams() {
  const slugs = await getWinterServiceSlugs();
  return slugs.map((usluga) => ({ usluga }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ usluga: string }>;
}): Promise<Metadata> {
  const { usluga } = await params;
  const svc = await getWinterServiceBySlug(usluga);
  if (!svc) return { title: "Nie znaleziono" };
  return {
    title: svc.metaTitle,
    description: svc.metaDescription,
    alternates: { canonical: `/zima/${svc.slug}` },
    openGraph: {
      title: svc.metaTitle,
      description: svc.metaDescription,
      url: `/zima/${svc.slug}`,
      type: "website",
    },
  };
}

export default async function ZimaUslugaPage({
  params,
}: {
  params: Promise<{ usluga: string }>;
}) {
  const { usluga } = await params;
  const svc = await getWinterServiceBySlug(usluga);
  if (!svc) notFound();

  const others = (await getWinterServices()).filter((s) => s.slug !== svc.slug);
  const cities = (await getAllLocations())
    .slice()
    .sort((a, b) => a.km - b.km)
    .slice(0, 8);

  return (
    <main className="bg-white text-neutral-900">
      <ServiceJsonLd service={svc} />
      <SiteHeader />

      {/* Breadcrumb */}
      <nav
        aria-label="Okruszki"
        className="mx-auto max-w-7xl px-4 pt-6 text-xs text-neutral-500 sm:px-6"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-emerald-700">Strona główna</Link></li>
          <li aria-hidden>›</li>
          <li><Link href="/zima" className="hover:text-emerald-700">Zima</Link></li>
          <li aria-hidden>›</li>
          <li className="text-neutral-900">{svc.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <WinterServiceIcon icon={svc.icon} className="h-3.5 w-3.5" />
            Usługi zimowe
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {svc.name}
          </h1>
          {svc.hero.map((p, i) => (
            <p key={i} className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
              {p}
            </p>
          ))}
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Zadzwoń: {COMPANY.phone}
            </a>
            <a
              href="#kontakt"
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium transition-colors hover:border-emerald-700 hover:text-emerald-700"
            >
              Bezpłatna wycena
            </a>
          </div>
        </Reveal>
      </section>

      {/* Co obejmuje */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Co obejmuje</h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {svc.includes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-sm leading-relaxed text-neutral-700"
                >
                  <span aria-hidden className="mt-0.5 text-emerald-700">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-2xl text-sm italic text-neutral-500">{svc.pricingNote}</p>
          </Reveal>
        </div>
      </section>

      {/* Jak to działa (reused PROCESS) */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Jak to działa</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {PROCESS.map((p) => (
            <li key={p.no} className="rounded-3xl border border-neutral-200 bg-white p-6">
              <p className="text-xs font-semibold text-emerald-700">{p.no}</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{p.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Coverage */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Gdzie działamy</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
          {svc.name} realizujemy w Bydgoszczy i okolicznych gminach — tam, gdzie na co dzień dbamy o ogrody.
        </p>
        <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200 bg-white p-2">
          <CoverageMap
            variant="streets"
            aspect="16/9"
            pinColor="047857"
            hqColor="171717"
            rounded="rounded-[20px]"
            alt={`Obszar obsługi — ${svc.name} w Bydgoszczy i okolicy`}
          />
        </div>
        <ul className="mt-6 flex flex-wrap gap-2">
          {cities.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/ogrodnik/${c.slug}`}
                className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700 transition-colors hover:border-emerald-700 hover:text-emerald-700"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Najczęstsze pytania</h2>
        <div className="mt-8 divide-y divide-neutral-200 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          {svc.faq.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer items-start gap-4 px-6 py-5 transition hover:bg-neutral-50">
                <span className="flex-1 text-base font-semibold tracking-tight">{f.q}</span>
                <span aria-hidden className="text-neutral-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-prose px-6 pb-5 text-sm leading-relaxed text-neutral-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Other winter services */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Zobacz też</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                href={`/zima/${o.slug}`}
                className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700 transition-colors hover:border-emerald-700 hover:text-emerald-700"
              >
                {o.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section id="kontakt" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-12">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Zacznijmy <span className="text-emerald-700">od rozmowy.</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm text-neutral-600 sm:text-base">
            Zostaw kontakt lub zadzwoń — w ciągu jednego dnia roboczego potwierdzimy termin i zakres prac.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`tel:${COMPANY.phoneRaw}`} className="rounded-2xl bg-neutral-900 px-6 py-4 text-white transition hover:bg-emerald-700">
              {COMPANY.phone}
            </a>
            <a href={`mailto:${COMPANY.email}`} className="rounded-2xl border border-neutral-200 px-6 py-4 transition hover:border-emerald-700">
              {COMPANY.email}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
```

- [ ] **Step 2: Build (route smoke — prerenders all three)**

Run: `npm run build`
Expected: build succeeds; output lists `/zima/[usluga]` prerendered for `odsniezanie`, `swiateczne-oswietlenie`, `zimowe-zabezpieczanie-roslin`.

- [ ] **Step 3: Commit**

```bash
git add src/app/zima/[usluga]/page.tsx
git commit -m "feat(winter): /zima/[usluga] landing page template"
```

---

## Task 6: Winter hub page (`src/app/zima/page.tsx`)

**Files:**
- Create: `src/app/zima/page.tsx`

- [ ] **Step 1: Create the hub page**

```tsx
// src/app/zima/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/lib/data";
import { getWinterServices } from "@/lib/winter";
import { isWinterNow } from "@/lib/season";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CoverageMap } from "@/components/CoverageMap";
import { WinterServiceCard } from "@/components/WinterServiceCard";
import { Reveal } from "@/components/motion";

// Daily ISR so the seasonal eyebrow flips without a redeploy.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Usługi zimowe — odśnieżanie, oświetlenie, zabezpieczanie roślin | Ogrody Kryscar",
  description:
    "Zimowe usługi Ogrody Kryscar w Bydgoszczy i okolicy: odśnieżanie podjazdów i chodników, montaż świątecznego oświetlenia ogrodów i zabezpieczanie roślin na zimę. Bezpłatna wycena.",
  alternates: { canonical: "/zima" },
};

export default async function ZimaHubPage() {
  const services = await getWinterServices();
  const winter = isWinterNow();

  return (
    <main className="bg-white text-neutral-900">
      <SiteHeader />

      {/* Breadcrumb */}
      <nav
        aria-label="Okruszki"
        className="mx-auto max-w-7xl px-4 pt-6 text-xs text-neutral-500 sm:px-6"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-emerald-700">Strona główna</Link></li>
          <li aria-hidden>›</li>
          <li className="text-neutral-900">Zima</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
            {winter ? "Sezon zimowy — teraz" : "Usługi całoroczne"}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Działamy też zimą.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            Gdy ogród śpi, my dalej pracujemy. Odśnieżanie, świąteczne oświetlenie ogrodów i zimowe zabezpieczanie roślin — ten sam zaufany zespół, który dba o Twój ogród przez resztę roku.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:gap-5 md:grid-cols-3">
          {services.map((s) => (
            <WinterServiceCard key={s.slug} service={s} tone="light" />
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white p-2">
          <CoverageMap
            variant="streets"
            aspect="16/9"
            pinColor="047857"
            hqColor="171717"
            rounded="rounded-[20px]"
            alt="Obszar obsługi usług zimowych — Bydgoszcz i okolice"
          />
        </div>
      </section>

      {/* CTA */}
      <section id="kontakt" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-12">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Zima nie musi być <span className="text-emerald-700">problemem.</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm text-neutral-600 sm:text-base">
            Zadzwoń lub napisz — ustalimy zakres i terminy zimowej obsługi Twojej posesji.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`tel:${COMPANY.phoneRaw}`} className="rounded-2xl bg-neutral-900 px-6 py-4 text-white transition hover:bg-emerald-700">
              {COMPANY.phone}
            </a>
            <a href={`mailto:${COMPANY.email}`} className="rounded-2xl border border-neutral-200 px-6 py-4 transition hover:border-emerald-700">
              {COMPANY.email}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds; `/zima` appears in the route list (with ISR `revalidate`).

- [ ] **Step 3: Commit**

```bash
git add src/app/zima/page.tsx
git commit -m "feat(winter): /zima hub page with seasonal eyebrow"
```

---

## Task 7: Sitemap entries (`src/app/sitemap.ts`)

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Add winter routes to the sitemap**

Replace the entire file with:

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/data";
import { getLocationSlugs } from "@/lib/locations";
import { getWinterServiceSlugs } from "@/lib/winter";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [citySlugs, winterSlugs] = await Promise.all([
    getLocationSlugs(),
    getWinterServiceSlugs(),
  ]);
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/zima`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...winterSlugs.map((slug) => ({
      url: `${SITE_URL}/zima/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...citySlugs.map((slug) => ({
      url: `${SITE_URL}/ogrodnik/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
```

- [ ] **Step 2: Build + verify sitemap contains the winter routes**

Run: `npm run build && grep -o "/zima[^<\"]*" .next/server/app/sitemap.xml.body 2>/dev/null || echo "check route output manually"`
Expected: build succeeds. (The sitemap body path may differ across Next versions; if the grep finds nothing, confirm `/zima` + 3 subpaths render by visiting `/sitemap.xml` in `npm run dev`.)

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(winter): add /zima + winter subpages to sitemap"
```

---

## Task 8: "Zima" nav link in SiteHeader (`src/components/SiteHeader.tsx`)

**Files:**
- Modify: `src/components/SiteHeader.tsx`

- [ ] **Step 1: Add the nav link before the phone button**

Replace the closing portion (from the `<a href={\`tel:...}>` button) so the right-hand side has both a "Zima" link and the phone button:

```tsx
        <div className="flex items-center gap-4">
          <Link
            href="/zima"
            className="hidden text-sm font-medium text-neutral-700 transition-colors hover:text-emerald-700 sm:block"
          >
            Zima
          </Link>
          <a
            href={`tel:${COMPANY.phoneRaw}`}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            {COMPANY.phone}
          </a>
        </div>
```

The full file becomes:

```tsx
import Image from "next/image";
import Link from "next/link";
import { COMPANY } from "@/lib/data";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt={`${COMPANY.name} logo`}
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg"
          />
          <span className="text-base font-semibold tracking-tight">
            {COMPANY.name}
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/zima"
            className="hidden text-sm font-medium text-neutral-700 transition-colors hover:text-emerald-700 sm:block"
          >
            Zima
          </Link>
          <a
            href={`tel:${COMPANY.phoneRaw}`}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            {COMPANY.phone}
          </a>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/SiteHeader.tsx
git commit -m "feat(winter): add Zima nav link to SiteHeader"
```

---

## Task 9: Homepage integration (`src/app/example-9/page.tsx` + `src/app/page.tsx`)

**Files:**
- Modify: `src/app/example-9/page.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add imports + `revalidate`**

In `src/app/example-9/page.tsx`, add to the import block (after the existing `getAllLocations`/`ScrollArea` imports):

```tsx
import { getWinterServices } from "@/lib/winter";
import { isWinterNow } from "@/lib/season";
import { WinterServiceCard } from "@/components/WinterServiceCard";
```

Immediately after the `export const metadata: Metadata = { … };` block, add:

```tsx
// Daily ISR so the seasonal winter escalation flips without a redeploy.
export const revalidate = 86400;
```

- [ ] **Step 2: Load winter data + season flag in the component**

In `export default async function Example9()`, just below the existing `const locations = await getAllLocations();`, add:

```tsx
  const winterServices = await getWinterServices();
  const winter = isWinterNow();
```

- [ ] **Step 3: Add the seasonal ribbon as the first child of `<main>`**

The `<main …>` opening tag is immediately followed by the `{/* NAV */}` `<header>`. Insert the ribbon between `<main …>` and `<header …>`:

```tsx
      {winter && (
        <Link
          href="/zima"
          className="block bg-emerald-900 px-4 py-2 text-center text-sm text-emerald-50 transition-colors hover:bg-emerald-800"
        >
          ❄ Sezon zimowy — odśnieżanie, świąteczne oświetlenie i zabezpieczanie roślin{" "}
          <span className="font-semibold underline underline-offset-2">Zobacz →</span>
        </Link>
      )}
```

(`Link` is already imported at the top of the file.)

- [ ] **Step 4: Add a "Zima" link to the inline desktop nav**

Find the inline nav:

```tsx
          <nav className="hidden gap-7 text-sm text-neutral-700 md:flex">
            <a href="#katalog" className="hover:text-emerald-700">Katalog</a>
            <a href="#proces" className="hover:text-emerald-700">Jak to działa</a>
            <a href="#opinie" className="hover:text-emerald-700">Opinie</a>
            <a href="#kontakt" className="hover:text-emerald-700">Kontakt</a>
          </nav>
```

Add a "Zima" link (route, not anchor) after "Katalog":

```tsx
          <nav className="hidden gap-7 text-sm text-neutral-700 md:flex">
            <a href="#katalog" className="hover:text-emerald-700">Katalog</a>
            <Link href="/zima" className="hover:text-emerald-700">Zima</Link>
            <a href="#proces" className="hover:text-emerald-700">Jak to działa</a>
            <a href="#opinie" className="hover:text-emerald-700">Opinie</a>
            <a href="#kontakt" className="hover:text-emerald-700">Kontakt</a>
          </nav>
```

- [ ] **Step 5: Swap the hero badge copy in winter**

Find the hero badge:

```tsx
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Sezon {new Date().getFullYear()} — przyjmujemy zlecenia
              </span>
```

Replace the text line so it reads:

```tsx
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                {winter
                  ? "Sezon zimowy — odśnieżanie i zabezpieczanie ogrodu"
                  : `Sezon ${new Date().getFullYear()} — przyjmujemy zlecenia`}
              </span>
```

- [ ] **Step 6: Insert the "Usługi zimowe" section after the MAP section**

The MAP section is `<section id="mapa" …>…</section>`, immediately followed by the `{/* ANTIGRAVITY … */}` comment and `<AntigravitySection …>`. Insert this new section between the closing `</section>` of the map and the ANTIGRAVITY comment:

```tsx
      {/* WINTER SERVICES — always present; escalates in winter */}
      <section
        id="zima"
        className={winter ? "bg-emerald-900 text-emerald-50" : "border-t border-neutral-200 bg-white"}
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-5 sm:mb-12 sm:gap-6">
            <div>
              <p className={`text-xs uppercase tracking-[0.3em] ${winter ? "text-emerald-300" : "text-emerald-700"}`}>
                {winter ? "Sezon zimowy — teraz" : "Cały rok"}
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                {winter ? "Zima? Działamy dalej." : "Działamy też zimą."}
              </h2>
              <p className={`mt-5 max-w-2xl text-sm sm:text-base ${winter ? "text-emerald-100/80" : "text-neutral-600"}`}>
                Odśnieżanie, świąteczne oświetlenie ogrodów i zimowe zabezpieczanie roślin — ten sam zespół, który dba o Twój ogród latem.
              </p>
            </div>
            <Link
              href="/zima"
              className={`rounded-full px-5 py-3 text-sm font-medium transition-colors ${
                winter ? "bg-emerald-50 text-emerald-900 hover:bg-white" : "bg-neutral-900 text-white hover:bg-emerald-700"
              }`}
            >
              Wszystkie usługi zimowe →
            </Link>
          </Reveal>
          <StaggerGrid className="grid gap-4 sm:gap-5 md:grid-cols-3">
            {winterServices.map((s) => (
              <StaggerItem key={s.slug} className="h-full">
                <WinterServiceCard service={s} tone={winter ? "dark" : "light"} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>
```

(`Reveal`, `StaggerGrid`, `StaggerItem` are already imported at the top of the file.)

- [ ] **Step 7: Re-export `revalidate` from the root page**

In `src/app/page.tsx`, change:

```tsx
export { default, metadata } from "./example-9/page";
```

to:

```tsx
export { default, metadata, revalidate } from "./example-9/page";
```

(Route segment config must be exported from the route's own module; `/` is served by `src/app/page.tsx`, so `revalidate` must be re-exported there for the homepage to get daily ISR.)

- [ ] **Step 8: Build**

Run: `npm run build`
Expected: build succeeds; `/` and `/example-9` show ISR `revalidate`; no type/lint errors.

- [ ] **Step 9: Manual seasonal toggle check**

Temporarily set `WINTER.mode = "on"` in `src/lib/season.ts`, run `npm run build`, and confirm (e.g. `npm run dev`, open `/`) the ribbon appears, the hero badge reads the winter copy, and the winter section is the dark emerald band. Then set `WINTER.mode = "off"` and confirm the ribbon disappears and the section is the calm white variant. **Revert to `WINTER.mode = "auto"` before committing.**

- [ ] **Step 10: Commit**

```bash
git add src/app/example-9/page.tsx src/app/page.tsx
git commit -m "feat(winter): homepage winter section, ribbon, hero swap, ISR"
```

---

## Task 10: Mind maintenance + final gate

**Files:**
- Create: `kryscar-mind/map/zones/winter-services.md`
- Create: `kryscar-mind/map/decisions/winter-data-module.md`
- Create: `kryscar-mind/map/decisions/seasonal-toggle.md`
- Create: `kryscar-mind/tech-debt/source-winter-imagery.md`
- Modify: `kryscar-mind/map/zones/seo.md`, `homepage-and-variants.md`, `layout-chrome.md` (re-stamp `verifiedAt`)
- Modify: `kryscar-mind/specs/2026-06-02-winter-services-design.md` (status → done), `kryscar-mind/plans/2026-06-02-winter-services-plan.md` (status → done)

- [ ] **Step 1: Get the current HEAD sha for `verifiedAt`**

Run: `git rev-parse HEAD`
Expected: a 40-char sha. Use it as `<HEAD>` below.

- [ ] **Step 2: Create the `winter-services` zone card**

```markdown
---
type: zone
summary: "Winter-services arc: /zima hub + /zima/[usluga] pages, the Payload-ready winter data layer, and the seasonal engine."
tags: [feature, seo, data, seasonal]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]", "[[seo]]", "[[homepage-and-variants]]", "[[coverage-map]]"]
sources: ["[[2026-06-02-winter-services-design]]"]
owns:
  routes: ["/zima", "/zima/[usluga]"]
  anchors: ["symbol:getWinterServices", "symbol:getWinterServiceBySlug", "symbol:getWinterServiceSlugs", "symbol:WinterService", "symbol:isWinterActive", "symbol:isWinterNow", "symbol:ServiceJsonLd", "symbol:WinterServiceCard"]
  globs: ["src/app/zima/**", "src/lib/winter.ts", "src/lib/season.ts", "src/components/ServiceJsonLd.tsx", "src/components/WinterServiceCard.tsx"]
depends: ["[[service-catalog]]", "[[coverage-map]]", "[[layout-chrome]]", "[[city-landing-pages]]"]
invariants:
  - rule: "Components consume winter services only via async accessors — no component imports the WINTER_SERVICES array (Payload-migration boundary)"
    enforcedBy: []
  - rule: "Pages that branch on the season set revalidate=86400 so the winter toggle flips without a redeploy"
    enforcedBy: []
verifiedAt: "<HEAD>"
---
## Purpose
The winter revenue arc — three landing pages + a hub, a Payload-ready data layer, and a pure seasonal engine that escalates the homepage Nov–Mar.
## Anchors
`getWinterServices`, `getWinterServiceBySlug`, `WinterService`, `isWinterActive`, `ServiceJsonLd`, `WinterServiceCard`, `route:/zima`, `route:/zima/[usluga]`.
## Invariants
Accessor-only data boundary (mirrors city pages); seasonal pages use daily ISR.
## Lineage
sources → [[2026-06-02-winter-services-design]].
```

Replace `<HEAD>` with the sha from Step 1.

- [ ] **Step 3: Create the two decision records**

`kryscar-mind/map/decisions/winter-data-module.md`:

```markdown
---
type: decision
summary: "Winter services live in a separate src/lib/winter.ts, not folded into SERVICES."
tags: [data, seasonal]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[winter-services]]", "[[service-catalog]]"]
sources: ["[[2026-06-02-winter-services-design]]"]
decided: 2026-06-02
supersededBy: ""
---
## Context
Winter services needed a home. Option A: fold into the existing `SERVICES` array. Option B: a dedicated module.
## Decision
A dedicated `src/lib/winter.ts` with a private array + async accessors, mirroring `locations.ts`.
## Why
`SERVICES` is thin and drives the summer catalog filter (trawnik/cięcie/…). Winter services need landing-page depth (hero, includes, FAQ, SEO) and must not pollute the catalog or its categories. A separate module keeps both clean and is Payload-migration-ready by construction.
## Consequences
Two data modules to maintain; the homepage imports both. Accepted — same pattern as the city pages.
```

`kryscar-mind/map/decisions/seasonal-toggle.md`:

```markdown
---
type: decision
summary: "Winter escalation = pure season engine + auto/on/off override + daily ISR."
tags: [seasonal, ui]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[winter-services]]", "[[homepage-and-variants]]"]
sources: ["[[2026-06-02-winter-services-design]]"]
decided: 2026-06-02
supersededBy: ""
---
## Context
The homepage must mention winter year-round and escalate (ribbon + dark section + hero swap) once winter hits. A statically-prerendered `new Date()` would freeze at build time.
## Decision
A pure `isWinterActive(month, mode)` in `src/lib/season.ts`; a `WINTER.mode` of `auto|on|off`; seasonal pages export `revalidate = 86400`.
## Why
Purity makes the logic trivially reasoned-about (no test runner in this repo). The override gives the owner a marketing lever (force on for a cold snap/promo, or off). Daily ISR flips the toggle within a day with no redeploy.
## Consequences
`/`, `/example-9` and `/zima` recompute daily. The root `page.tsx` must re-export `revalidate` from example-9 (route segment config lives on the served module).
```

- [ ] **Step 4: Create the tech-debt note**

`kryscar-mind/tech-debt/source-winter-imagery.md`:

```markdown
---
type: debt
summary: "No self-hosted winter photography; winter cards use a gradient + icon fallback."
tags: [content, images, seasonal]
status: open
created: 2026-06-02
updated: 2026-06-02
related: ["[[winter-services]]", "[[brand-data]]"]
---
## What
`IMG` (src/lib/data.ts) has no snow/lights/wrapped-plant photos, so v1 winter cards and pages render a gradient + lucide icon instead of imagery.
## Why deferred
Sourcing/self-hosting stock would block the feature on a Pixabay key + `fetch-stock.sh` run; the `WinterService.image` slot is already wired so photos drop in later.
## Fix
Add winter keys (e.g. `snowDrive`, `gardenLights`, `wrappedPlants`) to `fetch-stock.sh` + the `IMG` map, then populate `WinterService.image` and render it in `WinterServiceCard`/the subpage hero.
```

- [ ] **Step 5: Re-stamp touched zone cards**

Set `verifiedAt: "<HEAD>"` (sha from Step 1) and `updated: 2026-06-02` in:
- `kryscar-mind/map/zones/seo.md` (sitemap now emits `/zima` routes)
- `kryscar-mind/map/zones/homepage-and-variants.md` (homepage winter section + ribbon + ISR)
- `kryscar-mind/map/zones/layout-chrome.md` (SiteHeader "Zima" link)

Add `[[winter-services]]` to each card's `related:` list. Do NOT change their `owns:` globs (the new files belong to the `winter-services` zone).

- [ ] **Step 6: Flip spec + plan status to done**

In `kryscar-mind/specs/2026-06-02-winter-services-design.md` set `status: done`; in `kryscar-mind/plans/2026-06-02-winter-services-plan.md` set `status: done`.

- [ ] **Step 7: Run the full gate**

Run: `npm run check`
Expected: exits 0 — `✓ Mind: 12 zones, N gaps. Wrote kryscar-mind/map/index.md.` (the new `winter-services` zone resolves all its globs/anchors/routes; tsc + eslint clean). If the generator reports a hard error (unresolved anchor/glob/route), fix the zone card to match the real code and re-run.

- [ ] **Step 8: Commit (code + Mind together — same change, per DEV RULE)**

```bash
git add kryscar-mind/ src/
git commit -m "docs(mind): winter-services zone, decisions, tech-debt; regen index"
```

---

## Self-Review (completed against the spec)

**Spec coverage:**
- `/zima/[usluga]` + `/zima` hub → Tasks 5, 6. ✓
- Payload-ready `winter.ts` data layer + accessor boundary → Task 2 (+ invariant in zone, Task 10). ✓
- Pure seasonal engine, auto/on/off, Nov–Mar, daily ISR → Tasks 1, 6, 9. ✓
- Homepage section + ribbon + hero swap + nav link → Task 9. ✓
- SiteHeader "Zima" link → Task 8. ✓
- SEO: sitemap + ServiceJsonLd + per-page metadata + depth → Tasks 4, 5, 6, 7. ✓
- Images: gradient + icon fallback, slot pre-wired → Tasks 2 (`image?`), 3; tech-debt Task 10. ✓
- Mind maintenance (zone, 2 decisions, tech-debt, re-stamps, regen) → Task 10. ✓
- Out of scope (winter×city, booking, choinki, real photos) → not implemented. ✓

**Placeholder scan:** none — every code step is complete.

**Type consistency:** `WinterService`/`WinterServiceFaq` fields used in Tasks 4–6, 9 match Task 2; accessor names (`getWinterServices`, `getWinterServiceBySlug`, `getWinterServiceSlugs`) consistent across Tasks 2, 5, 6, 7, 9; `WinterServiceCard`/`WinterServiceIcon` props consistent across Tasks 3, 5, 6, 9; `isWinterActive`/`isWinterNow`/`WINTER` consistent across Tasks 1, 6, 9, 10; `ServiceJsonLd` prop (`service`) consistent Tasks 4, 5.
