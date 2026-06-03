# Service Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every one of the 8 catalog services its own statically-rendered landing page at `/uslugi/[usluga]`, and make the catalog cards link to them — analogous to the existing `/zima/[usluga]` winter arc.

**Architecture:** A new Payload-ready `src/lib/services.ts` holds only the net-new landing-page content (hero, includes, pricing note, FAQ, SEO meta) keyed by slug, and **composes** it with the existing thin `SERVICES` + catalog price (via `getCatalogServices()`) into a `ServicePage`. A single data-driven page template renders all eight; the catalog island wraps each card in a `<Link>`; the winter-specific `ServiceJsonLd` is generalized and shared. `SERVICES` and `catalog.ts` are not modified.

**Tech Stack:** Next.js 16 (App Router, this repo's modified build — see `AGENTS.md`), React Server Components, TypeScript (strict), Tailwind, `motion`, `next/image`, `lucide-react`.

**Verification note (read first):** This repo has **no test runner**. The verification gate is `npm run check` (`tsc --noEmit && eslint && node scripts/mind/generate.mjs`) plus `npx next build` for route smoke. Wherever a generic plan would say "write a failing test," this plan substitutes type-checking, lint, build, and targeted `grep` assertions. Do **not** introduce a test framework.

**Setup (before Task 1):** We are on the default branch `main`, so branch first.

```bash
cd /Users/muslewski/Documents/Repozytoria/ogrody-kryscar
git switch -c feat/service-landing-pages
```

**Source spec:** `kryscar-mind/specs/2026-06-03-service-landing-pages-design.md`. Orient via `kryscar-mind/map/zones/{service-catalog,winter-services,seo,layout-chrome}.md` before starting.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/components/ServiceJsonLd.tsx` | Modify | Generalize from winter-specific to a `{name, description, url, breadcrumbs}` Service+BreadcrumbList emitter. |
| `src/app/zima/[usluga]/page.tsx` | Modify | Update the one `ServiceJsonLd` call site to the new generic props. |
| `src/lib/services.ts` | Create | Payload-ready service-page data layer; net-new content + composition + async accessors. |
| `src/app/uslugi/[usluga]/page.tsx` | Create | Data-driven service landing page template (static). |
| `src/components/service-catalog.tsx` | Modify | Wrap each card in `<Link href="/uslugi/[slug]">`; demote "Zamów →" to a `<span>`. |
| `src/app/sitemap.ts` | Modify | Add `/uslugi/[slug]` entries for all 8. |
| `src/components/SiteHeader.tsx` | Modify | Add an "Usługi" nav link → `/#katalog`. |
| `kryscar-mind/map/zones/service-pages.md` | Create | New zone card. |
| `kryscar-mind/map/decisions/service-page-data-module.md` | Create | Decision record for the data-layer choice. |
| `kryscar-mind/map/zones/{service-catalog,seo,winter-services,layout-chrome}.md` | Modify | Re-stamp `verifiedAt` + `updated`; note the touch. |
| `kryscar-mind/map/index.md` | Regenerate | Via `npm run mind`. |

---

## Task 1: Generalize `ServiceJsonLd`

Do this first — it's a prerequisite for the new page and is the only edit to the winter zone's code.

**Files:**
- Modify: `src/components/ServiceJsonLd.tsx`
- Modify: `src/app/zima/[usluga]/page.tsx`

- [ ] **Step 1: Replace `ServiceJsonLd.tsx` with the generic version**

Overwrite `src/components/ServiceJsonLd.tsx` entirely with:

```tsx
// src/components/ServiceJsonLd.tsx
import { COMPANY, ADDRESS } from "@/lib/data";

export interface JsonLdCrumb {
  name: string;
  item: string; // absolute URL
}

/**
 * Emits JSON-LD `Service` (+ `BreadcrumbList`) for any service landing page.
 * Generic over name/description/url/breadcrumbs so both /zima/[usluga] and
 * /uslugi/[usluga] share it. `provider` is the Ogrody Kryscar LocalBusiness.
 */
export function ServiceJsonLd({
  name,
  description,
  url,
  breadcrumbs,
}: {
  name: string;
  description: string;
  url: string;
  breadcrumbs: JsonLdCrumb[];
}) {
  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name,
        serviceType: name,
        description,
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

- [ ] **Step 2: Update the winter call site**

In `src/app/zima/[usluga]/page.tsx`:

First add `SITE_URL` to the `@/lib/data` import. Change:

```tsx
import { COMPANY, PROCESS } from "@/lib/data";
```

to:

```tsx
import { COMPANY, PROCESS, SITE_URL } from "@/lib/data";
```

Then replace the JSON-LD usage. Change:

```tsx
      <ServiceJsonLd service={svc} />
```

to:

```tsx
      <ServiceJsonLd
        name={svc.name}
        description={svc.metaDescription}
        url={`${SITE_URL}/zima/${svc.slug}`}
        breadcrumbs={[
          { name: "Strona główna", item: SITE_URL },
          { name: "Zima", item: `${SITE_URL}/zima` },
          { name: svc.name, item: `${SITE_URL}/zima/${svc.slug}` },
        ]}
      />
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors. (Confirms the winter page now matches the new prop shape and no other call site references the old `service` prop.)

- [ ] **Step 4: Confirm no stale call sites remain**

Run: `grep -rn "ServiceJsonLd" src`
Expected: the component definition + exactly one usage in `src/app/zima/[usluga]/page.tsx` (the new prop form). No `service={` usage remains.

- [ ] **Step 5: Commit**

```bash
git add src/components/ServiceJsonLd.tsx src/app/zima/[usluga]/page.tsx
git commit -m "$(cat <<'EOF'
refactor(seo): generalize ServiceJsonLd to {name,description,url,breadcrumbs}

Was winter-specific (hardcoded /zima URL + "Zima" crumb). Now a shared
Service+BreadcrumbList emitter so /uslugi/[usluga] can reuse it. Updates
the single /zima/[usluga] call site to the new props.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Service-page data layer (`src/lib/services.ts`)

Holds the net-new landing-page content for all 8 services and composes it with the catalog projection. This is the bulk of the content work — copy is final Polish, ready for the user to review/tweak.

**Files:**
- Create: `src/lib/services.ts`

- [ ] **Step 1: Create `src/lib/services.ts` with full content + accessors**

Create `src/lib/services.ts`:

```ts
// src/lib/services.ts
/**
 * Landing-page content for /uslugi/[usluga].
 *
 * MIGRATION (PayloadCMS): this module is the ONLY place that knows the
 * service-landing-page content source. `ServicePageContent` mirrors a future
 * Payload `services` collection / SEO field-group (slug:text-unique →
 * matches a SERVICES slug, hero:array<{paragraph}> or richText,
 * includes:array<{item:text}>, pricingNote:textarea, faq:array<{q,a}>,
 * metaTitle:text + metaDescription:textarea in an `seo` group). To migrate:
 * reimplement `compose()` below to read Payload + the catalog projection.
 * NOTHING ELSE in the app changes — pages consume only the async accessors.
 *
 * Composition: the thin catalog fields (title/short/icon/category) and the
 * display price (from/duration/img) come from `getCatalogServices()` so the
 * slug list and the price are NOT duplicated here. This module adds only the
 * landing-page depth. SERVICES (data.ts) stays thin and drives the catalog
 * filter; this mirrors the winter-data-module decision.
 */
import { getCatalogServices } from "@/lib/catalog";

export interface ServiceFaq {
  q: string;
  a: string;
}

/** Net-new landing-page content, keyed by the same slug as SERVICES. */
interface ServicePageContent {
  slug: string;
  hero: string[];
  includes: string[];
  pricingNote: string;
  faq: ServiceFaq[];
  metaTitle: string;
  metaDescription: string;
}

/** Composed view a page consumes: thin catalog fields + price + content. */
export interface ServicePage {
  slug: string;
  category: string;
  title: string;
  short: string;
  icon: string;
  img: string;
  from: string;
  duration: string;
  hero: string[];
  includes: string[];
  pricingNote: string;
  faq: ServiceFaq[];
  metaTitle: string;
  metaDescription: string;
}

const SERVICE_CONTENT: ServicePageContent[] = [
  {
    slug: "koszenie",
    hero: [
      "Regularne, równe koszenie to podstawa zdrowego trawnika. Dobieramy wysokość cięcia do pory roku i kondycji trawy, kosimy ostrymi nożami i nie zostawiamy po sobie pokosów ani plam — trawnik rośnie gęsto i równo przez cały sezon.",
      "Pracujemy w Bydgoszczy i okolicznych gminach, jednorazowo lub w stałym rytmie (najczęściej co 1–2 tygodnie). Skoszoną trawę zbieramy i wywozimy albo mulczujemy na miejscu — tak jak wolisz i jak najlepiej służy Twojej murawie.",
    ],
    includes: [
      "Koszenie kosiarką lub traktorkiem z dobraną wysokością cięcia",
      "Wykaszanie kosą spalinową przy obrzeżach, drzewach i ogrodzeniu",
      "Mulczowanie lub zbiórka i wywóz skoszonej trawy",
      "Regularny harmonogram dla stałych klientów (co 1–2 tygodnie)",
      "Trawniki przydomowe, tereny wspólnot i obiektów firmowych",
    ],
    pricingNote:
      "Koszenie zaczyna się od 199 zł za wizytę — ostateczna cena zależy od powierzchni i ukształtowania trawnika oraz od tego, czy zbieramy trawę. Dla stałych klientów ustalamy preferencyjny abonament sezonowy. Wycena bezpłatna.",
    faq: [
      {
        q: "Jak często kosicie trawnik?",
        a: "W sezonie najczęściej co 1–2 tygodnie — to optymalny rytm dla gęstej, zdrowej murawy. Dla stałych klientów rezerwujemy stały termin w grafiku, więc nie trzeba za każdym razem dzwonić.",
      },
      {
        q: "Czy zabieracie skoszoną trawę?",
        a: "Tak, zbieramy i wywozimy pokos albo mulczujemy go na miejscu — w zależności od stanu trawnika i Twoich preferencji. Mulczowanie zwraca trawnikowi część składników odżywczych.",
      },
      {
        q: "Od czego zależy cena koszenia?",
        a: "Przede wszystkim od powierzchni i ukształtowania działki oraz od tego, czy zbieramy trawę. Bydgoszcz to nasza baza, więc w mieście nie doliczamy kosztów dojazdu.",
      },
    ],
    metaTitle: "Koszenie trawników Bydgoszcz — równo i regularnie | Ogrody Kryscar",
    metaDescription:
      "Koszenie trawników w Bydgoszczy i okolicy: dobrana wysokość cięcia, wykaszanie obrzeży, zbiórka lub mulczowanie trawy. Stały harmonogram. Od 199 zł. Tel.: +48 668 994 483.",
  },
  {
    slug: "pielegnacja",
    hero: [
      "Pielęgnacja ogrodu to coś więcej niż koszenie — to stała opieka, dzięki której trawnik, rabaty i krzewy przez cały sezon wyglądają jak należy. Bierzemy na siebie nawożenie, odchwaszczanie i zabiegi regeneracyjne, żebyś Ty nie musiał o tym pamiętać.",
      "Dopasowujemy zakres i częstotliwość wizyt do Twojego ogrodu w Bydgoszczy i okolicy. Najczęściej działamy w pakiecie sezonowym: jeden zespół zna Twoją posesję i prowadzi ją od wiosny do jesieni w stałym, przewidywalnym rytmie.",
    ],
    includes: [
      "Nawożenie trawnika i roślin dobrane do sezonu",
      "Odchwaszczanie rabat, podlewanie i pielenie",
      "Aeracja i wertykulacja trawnika",
      "Drobne cięcia korygujące i prace porządkowe",
      "Stały, sezonowy harmonogram opieki nad ogrodem",
    ],
    pricingNote:
      "Pakiet pielęgnacyjny zaczyna się od 349 zł — cena zależy od wielkości ogrodu, zakresu prac i liczby wizyt w sezonie. To nasza najczęściej wybierana forma współpracy. Wycena bezpłatna.",
    faq: [
      {
        q: "Co obejmuje stała pielęgnacja ogrodu?",
        a: "Najczęściej koszenie, nawożenie, odchwaszczanie rabat, aerację i wertykulację oraz drobne cięcia i porządki. Zakres ustalamy indywidualnie i prowadzimy ogród przez cały sezon.",
      },
      {
        q: "Czy to droższe niż pojedyncze zlecenia?",
        a: "Zwykle wręcz przeciwnie — pakiet sezonowy jest tańszy w przeliczeniu na wizytę niż zamawianie usług osobno, a ogród utrzymuje równą formę bez przestojów.",
      },
      {
        q: "Jak często przyjeżdżacie przy pakiecie sezonowym?",
        a: "To zależy od ogrodu — od kilku wizyt w sezonie po regularne wejścia co 1–2 tygodnie. Harmonogram układamy pod Twoją posesję i trzymamy się go.",
      },
    ],
    metaTitle: "Pielęgnacja ogrodu Bydgoszcz — stała opieka sezonowa | Ogrody Kryscar",
    metaDescription:
      "Kompleksowa pielęgnacja ogrodu w Bydgoszczy i okolicy: nawożenie, odchwaszczanie, aeracja, wertykulacja i porządki w pakiecie sezonowym. Od 349 zł. Tel.: +48 668 994 483.",
  },
  {
    slug: "grabienie",
    hero: [
      "Jesienią liście potrafią w kilka dni przykryć cały trawnik, a leżąc zbyt długo — dusić trawę i sprzyjać chorobom. Zbieramy je dokładnie z trawnika, rabat, podjazdów i tarasów, i wywozimy z posesji.",
      "Działamy w Bydgoszczy i okolicy jesienią, gdy liści jest najwięcej, oraz wiosną — gdy trzeba uprzątnąć to, co zostało po zimie. Po naszej wizycie ogród jest gotowy na sen albo na start nowego sezonu.",
    ],
    includes: [
      "Wygrabianie liści z trawnika, rabat i spod krzewów",
      "Sprzątanie liści z podjazdów, chodników i tarasów",
      "Zbiórka i wywóz liści z posesji",
      "Oczyszczenie rabat przed zimą lub przed wiosennym startem",
      "Możliwość połączenia z koszeniem i porządkami sezonowymi",
    ],
    pricingNote:
      "Grabienie liści zaczyna się od 249 zł za wizytę — cena zależy od powierzchni, liczby drzew i ilości liści do wywozu. Najczęściej łączymy je z jesiennymi porządkami. Wycena bezpłatna.",
    faq: [
      {
        q: "Czy wywozicie zgrabione liście?",
        a: "Tak. Zbieramy liście i wywozimy je z posesji — nie zostawiamy worków ani pryzm. Na życzenie możemy część przeznaczyć na kompost w Twoim ogrodzie.",
      },
      {
        q: "Kiedy najlepiej zamówić grabienie?",
        a: "Jesienią, gdy większość liści już opadła, oraz wczesną wiosną przy otwarciu sezonu. Przy dużej liczbie drzew czasem potrzebne są dwie wizyty jesienią.",
      },
      {
        q: "Grabicie też liście spod krzewów i z rabat?",
        a: "Tak — uprzątamy liście nie tylko z trawnika, ale też z rabat, spod krzewów i z nawierzchni utwardzonych, żeby ogród był naprawdę czysty.",
      },
    ],
    metaTitle: "Grabienie liści Bydgoszcz — sprzątanie i wywóz | Ogrody Kryscar",
    metaDescription:
      "Grabienie i wywóz liści w Bydgoszczy i okolicy: trawnik, rabaty, podjazdy i tarasy. Przygotowanie ogrodu na zimę i wiosenny start. Od 249 zł. Tel.: +48 668 994 483.",
  },
  {
    slug: "sadzenie",
    hero: [
      "Dobrze dobrane i prawidłowo posadzone rośliny to ogród, który cieszy przez lata. Dobieramy gatunki pod warunki Twojej działki — nasłonecznienie, glebę i wilgotność — i sadzimy je tak, żeby się przyjęły i zdrowo rosły.",
      "Sadzimy drzewa, krzewy, byliny i kwiaty w ogrodach w Bydgoszczy i okolicy. Każde nasadzenie kończymy ściółkowaniem i podlewaniem startowym, a Ty dostajesz konkretne wskazówki, jak o nie zadbać przez pierwszy sezon.",
    ],
    includes: [
      "Dobór gatunków pod warunki działki (gleba, słońce, wilgotność)",
      "Sadzenie drzew, krzewów, bylin i roślin sezonowych",
      "Przygotowanie podłoża i dołów pod nasadzenia",
      "Ściółkowanie i podlewanie startowe",
      "Wskazówki pielęgnacyjne na pierwszy sezon po posadzeniu",
    ],
    pricingNote:
      "Sadzenie wyceniamy indywidualnie — koszt zależy od rodzaju i liczby roślin, wielkości sadzonek oraz przygotowania podłoża. Orientacyjnie prace zaczynają się od 399 zł, a materiał roślinny rozliczamy osobno. Wycena bezpłatna.",
    faq: [
      {
        q: "Czy pomagacie dobrać rośliny?",
        a: "Tak, to część naszej pracy. Podczas wyceny przechodzimy przez działkę i proponujemy gatunki dopasowane do nasłonecznienia, gleby i Twoich oczekiwań — tak, by ogród dobrze się komponował i był łatwy w utrzymaniu.",
      },
      {
        q: "Czy dajecie gwarancję, że rośliny się przyjmą?",
        a: "Sadzimy zgodnie ze sztuką ogrodniczą i dbamy o podlanie startowe oraz ściółkowanie. Przy zachowaniu naszych zaleceń pielęgnacyjnych przyjęcie roślin jest bardzo wysokie; szczegóły gwarancji ustalamy przy wycenie.",
      },
      {
        q: "Kupujecie rośliny, czy mam je zapewnić sam?",
        a: "Możemy zająć się zakupem i transportem sprawdzonego materiału z dobrych szkółek albo posadzić rośliny, które już masz. Materiał roślinny rozliczamy wtedy osobno od robocizny.",
      },
    ],
    metaTitle: "Sadzenie roślin Bydgoszcz — drzewa, krzewy, byliny | Ogrody Kryscar",
    metaDescription:
      "Sadzenie drzew, krzewów, bylin i kwiatów w Bydgoszczy i okolicy: dobór gatunków, przygotowanie podłoża, ściółkowanie i podlewanie startowe. Od 399 zł. Tel.: +48 668 994 483.",
  },
  {
    slug: "ciecie",
    hero: [
      "Regularne, fachowe cięcie utrzymuje krzewy, żywopłoty i drzewa ozdobne w zdrowiu i dobrej formie. Tniemy formująco, prześwietlająco i sanitarnie — zależnie od gatunku i pory roku — żeby rośliny ładnie się zagęszczały i kwitły.",
      "W Bydgoszczy i okolicy zajmujemy się zarówno strzyżeniem żywopłotów na równą linię, jak i pielęgnacją iglaków oraz cięciem ozdobnych krzewów i drzewek. Po pracy uprzątamy i wywozimy gałęzie — zostaje czysto.",
    ],
    includes: [
      "Formowanie i strzyżenie żywopłotów na równą linię",
      "Cięcie prześwietlające i sanitarne krzewów ozdobnych",
      "Pielęgnacja i formowanie iglaków",
      "Cięcie drzew ozdobnych i krzewów owocowych w odpowiednim terminie",
      "Uprzątnięcie i wywóz ściętych gałęzi",
    ],
    pricingNote:
      "Cięcie i formowanie zaczyna się od 299 zł za wizytę — cena zależy od liczby i wielkości roślin, długości żywopłotu oraz ilości gałęzi do wywozu. Wycena bezpłatna.",
    faq: [
      {
        q: "Kiedy najlepiej ciąć żywopłot i krzewy?",
        a: "Termin zależy od gatunku — większość żywopłotów formujemy w sezonie wegetacyjnym, a wiele krzewów ozdobnych tnie się tuż po kwitnieniu. Podczas wyceny podpowiemy najlepszy moment dla Twoich roślin.",
      },
      {
        q: "Czy sprzątacie gałęzie po cięciu?",
        a: "Tak — ścięte gałęzie zbieramy i wywozimy, a teren po pracy zostaje uprzątnięty. Na życzenie możemy je rozdrobnić na zrębkę.",
      },
      {
        q: "Formujecie wysokie żywopłoty?",
        a: "Tak, mamy sprzęt do strzyżenia wysokich i długich żywopłotów. Przy okazałych formach ustalamy zakres i sposób cięcia podczas bezpłatnej wyceny.",
      },
    ],
    metaTitle: "Cięcie i formowanie krzewów i żywopłotów Bydgoszcz | Ogrody Kryscar",
    metaDescription:
      "Cięcie i formowanie żywopłotów, krzewów ozdobnych i iglaków w Bydgoszczy i okolicy: cięcia formujące, prześwietlające i sanitarne, wywóz gałęzi. Od 299 zł. Tel.: +48 668 994 483.",
  },
  {
    slug: "porzadki",
    hero: [
      "Zmiana sezonu to najwięcej pracy w ogrodzie. Wiosną trzeba go obudzić, jesienią — przygotować do zimy. Bierzemy na siebie cały ten zakres, żeby ogród wchodził w nowy sezon zadbany, a w zimę — bezpieczny.",
      "W Bydgoszczy i okolicy realizujemy porządki najczęściej w pakiecie dwóch wizyt: wiosennej i jesiennej. Wertykulacja, zabezpieczenie roślin, czyszczenie rabat i wywóz odpadów zielonych — wszystko jednym, dobrze zaplanowanym wejściem.",
    ],
    includes: [
      "Wiosenne otwarcie sezonu: wertykulacja, czyszczenie i pierwsze koszenie",
      "Jesienne zamknięcie: grabienie liści i porządkowanie rabat",
      "Zabezpieczenie wrażliwych roślin przed zimą",
      "Cięcie bylin i przygotowanie ogrodu na nowy sezon",
      "Zbiórka i wywóz odpadów zielonych z posesji",
    ],
    pricingNote:
      "Pakiet porządków zaczyna się od 449 zł za dwie wizyty (wiosenną i jesienną) — cena zależy od wielkości ogrodu i zakresu prac. Można zamówić też pojedynczą wizytę sezonową. Wycena bezpłatna.",
    faq: [
      {
        q: "Czym różnią się porządki wiosenne od jesiennych?",
        a: "Wiosną budzimy ogród do życia — wertykulujemy trawnik, czyścimy rabaty i odsłaniamy rośliny. Jesienią przygotowujemy go do zimy: grabimy liście, tniemy byliny i zabezpieczamy wrażliwe gatunki.",
      },
      {
        q: "Czy muszę zamawiać oba terminy?",
        a: "Nie. Pakiet dwóch wizyt jest najwygodniejszy i najkorzystniejszy cenowo, ale możesz zamówić same porządki wiosenne albo jesienne — jak potrzebujesz.",
      },
      {
        q: "Wywozicie odpady zielone?",
        a: "Tak, liście, ścinki i resztki roślinne zbieramy i wywozimy z posesji. Po porządkach ogród jest naprawdę uprzątnięty, gotowy na sezon lub na zimę.",
      },
    ],
    metaTitle: "Wiosenne i jesienne porządki w ogrodzie Bydgoszcz | Ogrody Kryscar",
    metaDescription:
      "Wiosenne i jesienne porządki w ogrodzie w Bydgoszczy i okolicy: wertykulacja, grabienie, cięcie bylin, zabezpieczenie roślin i wywóz odpadów. Od 449 zł. Tel.: +48 668 994 483.",
  },
  {
    slug: "aranzacja",
    hero: [
      "Aranżacja ogrodu to zamiana pomysłu w gotową, spójną przestrzeń. Pomagamy ułożyć całość — dobór roślin, kompozycje rabat, rozmieszczenie nasadzeń — tak, by ogród dobrze wyglądał przez cały rok i pasował do stylu Twojej posesji.",
      "Pracujemy w Bydgoszczy i okolicy od pomysłu po realizację: doradzamy, dobieramy rośliny, a następnie sadzimy i urządzamy ogród. Możemy też przekomponować i przesadzić to, co już rośnie, nadając zaniedbanej przestrzeni nowy charakter.",
    ],
    includes: [
      "Koncepcja nasadzeń i dobór roślin pod styl ogrodu",
      "Kompozycje sezonowe i rabaty kwitnące przez cały rok",
      "Realizacja: sadzenie, ściółkowanie, wykończenie",
      "Przesadzenia i przekomponowanie istniejących nasadzeń",
      "Doradztwo w pielęgnacji nowego układu ogrodu",
    ],
    pricingNote:
      "Aranżację wyceniamy indywidualnie — koszt zależy od wielkości ogrodu, zakresu projektu i realizacji oraz materiału roślinnego. Zaczynamy od rozmowy i wizyty na działce. Wycena bezpłatna.",
    faq: [
      {
        q: "Czym aranżacja różni się od samego sadzenia?",
        a: "Sadzenie to wykonanie konkretnego nasadzenia. Aranżacja obejmuje też pomysł i dobór całości — układamy kompozycje rabat i rozmieszczenie roślin, a potem to realizujemy, żeby ogród tworzył spójną całość.",
      },
      {
        q: "Robicie pełne projekty ogrodów?",
        a: "Skupiamy się na aranżacji roślinnej — doborze i kompozycji nasadzeń oraz ich realizacji. Przy bardziej rozbudowanych projektach (mała architektura, nawierzchnie) doradzimy zakres i podpowiemy sprawdzonych wykonawców.",
      },
      {
        q: "Czy mogę wykorzystać rośliny, które już mam?",
        a: "Tak. Często przekomponowujemy istniejące nasadzenia — przesadzamy, uzupełniamy i porządkujemy to, co już rośnie, zamiast zaczynać od zera.",
      },
    ],
    metaTitle: "Aranżacja ogrodu Bydgoszcz — projekt i realizacja nasadzeń | Ogrody Kryscar",
    metaDescription:
      "Aranżacja ogrodu w Bydgoszczy i okolicy: dobór roślin, kompozycje rabat, sadzenie i przekomponowanie istniejących nasadzeń — od pomysłu po realizację. Wycena bezpłatna: +48 668 994 483.",
  },
  {
    slug: "rabaty",
    hero: [
      "Dobrze założona rabata to przemyślana kompozycja, która ładnie wygląda od wiosny do jesieni i nie wymaga ciągłego poprawiania. Wytyczamy kształt, przygotowujemy podłoże i sadzimy rośliny w układzie, który dobrze rośnie i kwitnie.",
      "Zakładamy nowe rabaty bylinowe i ozdobne w ogrodach w Bydgoszczy i okolicy. Dobieramy byliny, krzewy i trawy ozdobne tak, by kolory i pory kwitnienia się uzupełniały, a całość kończymy ściółkowaniem korą lub żwirem.",
    ],
    includes: [
      "Wytyczenie kształtu i przygotowanie podłoża rabaty",
      "Dobór bylin, krzewów i traw ozdobnych pod stanowisko",
      "Sadzenie w przemyślanej, kwitnącej kompozycji",
      "Ściółkowanie korą lub żwirem ograniczające chwasty",
      "Obrzeża i wykończenie rabaty",
    ],
    pricingNote:
      "Zakładanie rabaty zaczyna się od 599 zł — cena zależy od powierzchni, przygotowania podłoża i doboru roślin. Materiał roślinny i ściółkę rozliczamy osobno. Wycena bezpłatna.",
    faq: [
      {
        q: "Co rośnie na rabacie, którą zakładacie?",
        a: "Najczęściej byliny, ozdobne trawy i niskie krzewy dobrane do stanowiska i Twoich preferencji kolorystycznych. Komponujemy je tak, żeby coś kwitło przez większą część sezonu.",
      },
      {
        q: "Czy rabata będzie wymagała dużo pracy?",
        a: "Dobieramy rośliny pod warunki działki i ściółkujemy rabatę, co mocno ogranicza chwasty i parowanie wody. Dzięki temu utrzymanie jest proste — a jeśli chcesz, możemy przejąć jej pielęgnację.",
      },
      {
        q: "Czym ściółkujecie rabaty?",
        a: "W zależności od stylu ogrodu i rodzaju roślin używamy kory lub żwiru ozdobnego. Ściółka ogranicza chwasty, utrzymuje wilgoć i nadaje rabacie estetyczny, wykończony wygląd.",
      },
    ],
    metaTitle: "Zakładanie rabat Bydgoszcz — rabaty bylinowe i ozdobne | Ogrody Kryscar",
    metaDescription:
      "Zakładanie rabat bylinowych i ozdobnych w Bydgoszczy i okolicy: wytyczenie, przygotowanie podłoża, dobór roślin, sadzenie i ściółkowanie. Od 599 zł. Tel.: +48 668 994 483.",
  },
];

/** Compose the catalog projection (thin + price + img) with landing content.
 *  A slug without authored content is dropped (so the page 404s, not renders
 *  half-empty). Returns items in catalog (SERVICES) order. */
function compose(): ServicePage[] {
  const result: ServicePage[] = [];
  for (const c of getCatalogServices()) {
    const content = SERVICE_CONTENT.find((x) => x.slug === c.slug);
    if (!content) continue;
    result.push({
      slug: c.slug,
      category: c.category,
      title: c.title,
      short: c.short,
      icon: c.icon,
      img: c.img,
      from: c.from,
      duration: c.duration,
      hero: content.hero,
      includes: content.includes,
      pricingNote: content.pricingNote,
      faq: content.faq,
      metaTitle: content.metaTitle,
      metaDescription: content.metaDescription,
    });
  }
  return result;
}

export async function getAllServices(): Promise<ServicePage[]> {
  return compose();
}

export async function getServiceSlugs(): Promise<string[]> {
  return compose().map((s) => s.slug);
}

export async function getServiceBySlug(slug: string): Promise<ServicePage | null> {
  return compose().find((s) => s.slug === slug) ?? null;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0. (Confirms the composition reads valid `CatalogItem` fields and the accessors are typed correctly.)

- [ ] **Step 3: Assert all 8 slugs have content (parity with SERVICES)**

Run:
```bash
node --input-type=module -e "
import('./src/lib/data.ts').then(async (d) => {
  const { getServiceSlugs } = await import('./src/lib/services.ts');
  const have = await getServiceSlugs();
  const want = d.SERVICES.map(s => s.slug);
  const missing = want.filter(s => !have.includes(s));
  console.log('SERVICES:', want.length, 'with content:', have.length, 'missing:', missing);
  if (missing.length) process.exit(1);
}).catch(e => { console.error(e); process.exit(1); });
"
```
Expected: `SERVICES: 8 with content: 8 missing: []`.
(If your Node cannot import `.ts` directly, skip this step — the `npx next build` in Task 8 will prerender exactly the slugs returned by `getServiceSlugs()`; confirm 8 `/uslugi/*` pages appear there instead.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/services.ts
git commit -m "$(cat <<'EOF'
feat(uslugi): add service-page data layer (src/lib/services.ts)

Payload-ready module: net-new landing-page content (hero, includes,
pricing note, FAQ, SEO meta) for all 8 services, composed with the thin
SERVICES list + catalog price via getCatalogServices(). Accessor-only
boundary, mirroring locations.ts / winter.ts.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `/uslugi/[usluga]` page template

**Files:**
- Create: `src/app/uslugi/[usluga]/page.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/uslugi/[usluga]/page.tsx`:

```tsx
// src/app/uslugi/[usluga]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPANY, PROCESS, SITE_URL, CATEGORIES } from "@/lib/data";
import {
  getAllServices,
  getServiceBySlug,
  getServiceSlugs,
} from "@/lib/services";
import { getAllLocations } from "@/lib/locations";
import { CoverageMap } from "@/components/CoverageMap";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ServiceJsonLd } from "@/components/ServiceJsonLd";
import { Reveal } from "@/components/motion";

export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return slugs.map((usluga) => ({ usluga }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ usluga: string }>;
}): Promise<Metadata> {
  const { usluga } = await params;
  const svc = await getServiceBySlug(usluga);
  if (!svc) return { title: "Nie znaleziono" };
  return {
    title: svc.metaTitle,
    description: svc.metaDescription,
    alternates: { canonical: `/uslugi/${svc.slug}` },
    openGraph: {
      title: svc.metaTitle,
      description: svc.metaDescription,
      url: `/uslugi/${svc.slug}`,
      type: "website",
    },
  };
}

function categoryLabel(category: string): string {
  return CATEGORIES.find((c) => c.id === category)?.label ?? "Usługa ogrodnicza";
}

export default async function UslugaPage({
  params,
}: {
  params: Promise<{ usluga: string }>;
}) {
  const { usluga } = await params;
  const svc = await getServiceBySlug(usluga);
  if (!svc) notFound();

  const others = (await getAllServices()).filter((s) => s.slug !== svc.slug);
  const cities = (await getAllLocations())
    .slice()
    .sort((a, b) => a.km - b.km)
    .slice(0, 8);

  return (
    <main className="bg-white text-neutral-900">
      <ServiceJsonLd
        name={svc.title}
        description={svc.metaDescription}
        url={`${SITE_URL}/uslugi/${svc.slug}`}
        breadcrumbs={[
          { name: "Strona główna", item: SITE_URL },
          { name: "Usługi", item: `${SITE_URL}/#katalog` },
          { name: svc.title, item: `${SITE_URL}/uslugi/${svc.slug}` },
        ]}
      />
      <SiteHeader />

      {/* Breadcrumb */}
      <nav
        aria-label="Okruszki"
        className="mx-auto max-w-7xl px-4 pt-6 text-xs text-neutral-500 sm:px-6"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-emerald-700">Strona główna</Link></li>
          <li aria-hidden>›</li>
          <li><Link href="/#katalog" className="hover:text-emerald-700">Usługi</Link></li>
          <li aria-hidden>›</li>
          <li className="text-neutral-900">{svc.title}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
            {categoryLabel(svc.category)}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {svc.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium text-neutral-700">
            {svc.short}
          </p>
          {svc.hero.map((p, i) => (
            <p key={i} className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
              {p}
            </p>
          ))}
          <div className="mt-6 inline-flex items-baseline gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-2">
            <span className="text-xs uppercase tracking-wider text-neutral-500">{svc.duration}</span>
            <span className="text-lg font-semibold tracking-tight">{svc.from}</span>
          </div>
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
        <div className="mt-10 overflow-hidden rounded-3xl border border-neutral-200">
          <div className="relative aspect-[16/9] w-full bg-neutral-100">
            <Image
              src={svc.img}
              alt={svc.title}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1280px) 1280px, 100vw"
            />
          </div>
        </div>
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
          {svc.title} realizujemy w Bydgoszczy i okolicznych gminach — tam, gdzie na co dzień dbamy o ogrody.
        </p>
        <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200 bg-white p-2">
          <CoverageMap
            variant="streets"
            aspect="16/9"
            pinColor="047857"
            hqColor="171717"
            rounded="rounded-[20px]"
            alt={`Obszar obsługi — ${svc.title} w Bydgoszczy i okolicy`}
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

      {/* Other services */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Zobacz też</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                href={`/uslugi/${o.slug}`}
                className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700 transition-colors hover:border-emerald-700 hover:text-emerald-700"
              >
                {o.title}
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

- [ ] **Step 2: Type-check + lint**

Run: `npx tsc --noEmit && npx eslint src/app/uslugi/[usluga]/page.tsx`
Expected: exit 0, no errors. (Note `notFound()` returns `never`, so `svc` is non-null below the guard — same pattern as the zima/city pages.)

- [ ] **Step 3: Commit**

```bash
git add src/app/uslugi/[usluga]/page.tsx
git commit -m "$(cat <<'EOF'
feat(uslugi): /uslugi/[usluga] service landing page template

Static, data-driven page mirroring /zima/[usluga]: hero (category eyebrow,
short, intro paragraphs, price chip, image), Co obejmuje, Jak to działa,
coverage + nearest-city cross-links, FAQ, other-services links, CTA.
Generalized ServiceJsonLd with Strona główna › Usługi › {title} breadcrumb.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Catalog cards link to subpages

Make the whole card a link to `/uslugi/[slug]`; demote "Zamów →" to a `<span>` (no nested anchors — `HoverCard` renders a plain `<div>`). This is a global change: cards on `/` (example-9) and `/ogrodnik/[miasto]` both gain the link.

**Files:**
- Modify: `src/components/service-catalog.tsx`

- [ ] **Step 1: Add the `Link` import**

In `src/components/service-catalog.tsx`, add at the top (after the `"use client";` line and the existing imports). Change:

```tsx
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
```

to:

```tsx
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
```

- [ ] **Step 2: Wrap the card body in a `Link` and demote "Zamów →"**

Replace the `HoverCard` block (the JSX from `<HoverCard ...>` through its closing `</HoverCard>`) with the version below. The only structural change: a `<Link>` wraps the image + content divs, and the former `<a href="#kontakt">Zamów →</a>` becomes a `<span>` with identical classes.

```tsx
                  <HoverCard className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                    <Link href={`/uslugi/${s.slug}`} className="flex h-full flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                        <WarpedHoverImage
                          src={s.img}
                          alt=""
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                        {badge && (
                          <span
                            className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-medium ${
                              badge.tone === "primary"
                                ? "bg-emerald-700 text-white"
                                : "bg-amber-400 text-neutral-900"
                            }`}
                          >
                            {badge.label}
                          </span>
                        )}
                        <span className="absolute right-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-neutral-700">
                          0{num}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="text-lg font-semibold leading-tight tracking-tight">
                          {s.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                          {s.short}
                        </p>
                        <div className="mt-5 flex items-end justify-between border-t border-neutral-100 pt-4">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-neutral-500">
                              {s.duration}
                            </p>
                            <p className="text-lg font-semibold tracking-tight">
                              {s.from}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-2 text-xs font-medium text-white transition-colors group-hover:bg-emerald-700">
                            Zamów →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </HoverCard>
```

- [ ] **Step 3: Type-check + lint**

Run: `npx tsc --noEmit && npx eslint src/components/service-catalog.tsx`
Expected: exit 0. (No nested `<a>`: `HoverCard` → `<div>`; the single child is the `<Link>`.)

- [ ] **Step 4: Confirm the card now links out and no stray `#kontakt` anchor remains in the card**

Run: `grep -n "uslugi/\${s.slug}\|href=\"#kontakt\"\|Zamów" src/components/service-catalog.tsx`
Expected: the `Link href={\`/uslugi/${s.slug}\`}` appears; "Zamów →" appears inside a `<span>`; no `href="#kontakt"` remains in this file.

- [ ] **Step 5: Commit**

```bash
git add src/components/service-catalog.tsx
git commit -m "$(cat <<'EOF'
feat(uslugi): link catalog cards to /uslugi/[slug]

Whole card is now a next/link to its service subpage (matches the winter
cards); 'Zamów →' demoted to a span inside the card link. Applies on the
homepage and every city page that renders ServiceCatalog.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Sitemap entries

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Add the service slugs to the sitemap**

Overwrite `src/app/sitemap.ts` with:

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/data";
import { getLocationSlugs } from "@/lib/locations";
import { getWinterServiceSlugs } from "@/lib/winter";
import { getServiceSlugs } from "@/lib/services";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [citySlugs, winterSlugs, serviceSlugs] = await Promise.all([
    getLocationSlugs(),
    getWinterServiceSlugs(),
    getServiceSlugs(),
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
    ...serviceSlugs.map((slug) => ({
      url: `${SITE_URL}/uslugi/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
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

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "$(cat <<'EOF'
feat(seo): add /uslugi/[slug] to sitemap

All 8 service landing pages via getServiceSlugs(), priority 0.8.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Header "Usługi" nav link

**Files:**
- Modify: `src/components/SiteHeader.tsx`

- [ ] **Step 1: Add the nav link before "Zima"**

In `src/components/SiteHeader.tsx`, inside the `<div className="flex items-center gap-4">`, add an "Usługi" link immediately before the existing "Zima" `<Link>`. Change:

```tsx
        <div className="flex items-center gap-4">
          <Link
            href="/zima"
            className="hidden text-sm font-medium text-neutral-700 transition-colors hover:text-emerald-700 sm:block"
          >
            Zima
          </Link>
```

to:

```tsx
        <div className="flex items-center gap-4">
          <Link
            href="/#katalog"
            className="hidden text-sm font-medium text-neutral-700 transition-colors hover:text-emerald-700 sm:block"
          >
            Usługi
          </Link>
          <Link
            href="/zima"
            className="hidden text-sm font-medium text-neutral-700 transition-colors hover:text-emerald-700 sm:block"
          >
            Zima
          </Link>
```

- [ ] **Step 2: Type-check + lint**

Run: `npx tsc --noEmit && npx eslint src/components/SiteHeader.tsx`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/SiteHeader.tsx
git commit -m "$(cat <<'EOF'
feat(uslugi): add "Usługi" nav link to SiteHeader

Points at /#katalog (the homepage catalog is the services index — no hub).
Sits beside the existing "Zima" link.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Full verification (check + build + route smoke)

Do this before the Mind update so the zone card's `verifiedAt` points at a fully-green tree.

**Files:** none (verification only)

- [ ] **Step 1: Run the repo gate**

Run: `npm run check`
Expected: `tsc --noEmit` clean, `eslint` clean (no errors; `no-img-element` is not triggered — we used `next/image`), mind generator succeeds with no broken anchors.

- [ ] **Step 2: Build and confirm the 8 pages prerender**

Run: `npx next build`
Expected: build succeeds; the route output lists `/uslugi/[usluga]` as a prerendered/SSG route with **8** generated paths (koszenie, pielegnacja, grabienie, sadzenie, ciecie, porzadki, aranzacja, rabaty). No errors about `next/image` domains (local `/img` needs no `remotePatterns`).

- [ ] **Step 3: Smoke-check the rendered output + sitemap (dev server)**

In one terminal: `npm run dev`. Then:
```bash
# A subpage renders with its H1 and breadcrumb
curl -s localhost:3000/uslugi/koszenie | grep -o "Koszenie trawników" | head -1
# An unknown slug 404s
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/uslugi/nie-istnieje   # expect 404
# Sitemap contains the service URLs
curl -s localhost:3000/sitemap.xml | grep -c "/uslugi/"   # expect 8
```
Expected: the H1 text prints; the unknown slug returns `404`; the sitemap grep prints `8`. Stop the dev server when done.

- [ ] **Step 4 (optional but recommended): Verify the client bundle did not grow**

Confirm `service-catalog.tsx` (the only `"use client"` consumer near this work) still imports only `SERVICES`/`CATEGORIES`/`SERVICE_BADGES` from `@/lib/data` (plus `next/link`) — it must NOT import `@/lib/services` or `@/lib/catalog`. Run:
```bash
grep -n "@/lib/services\|@/lib/catalog" src/components/service-catalog.tsx
```
Expected: no matches (the rich content never enters the client graph).

No commit (verification only). If anything fails, fix in the relevant task's file and re-run.

---

## Task 8: Mind maintenance (the `docs(mind)` commit)

Per the DEV RULE this lands as part of the same change. The code is complete and green, so anchors resolve.

**Files:**
- Create: `kryscar-mind/map/zones/service-pages.md`
- Create: `kryscar-mind/map/decisions/service-page-data-module.md`
- Modify: `kryscar-mind/map/zones/service-catalog.md`, `seo.md`, `winter-services.md`, `layout-chrome.md`
- Modify (regenerated): `kryscar-mind/map/index.md`
- Modify: `kryscar-mind/specs/2026-06-03-service-landing-pages-design.md` (flip `status: draft` → `done`)

- [ ] **Step 1: Capture the last code commit SHA (for `verifiedAt`)**

Run: `git rev-parse HEAD`
Use this value as `<SHA>` in the zone cards below. (This mirrors the winter arc: zone `verifiedAt` points at the code commit; the Mind regen lands as a following commit.)

- [ ] **Step 2: Create the decision record**

Create `kryscar-mind/map/decisions/service-page-data-module.md`:

```markdown
---
type: decision
summary: "Service landing pages get their content from a separate src/lib/services.ts that composes SERVICES + catalog price + net-new content, not by enriching SERVICES."
tags: [data, seo]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[service-pages]]", "[[service-catalog]]", "[[winter-services]]"]
sources: ["[[2026-06-03-service-landing-pages-design]]"]
decided: 2026-06-03
supersededBy: ""
---
## Context
Each catalog service needed a landing page with depth (hero, includes, pricing note, FAQ, SEO meta). The thin `SERVICES` array is imported by the *client* catalog island, so enriching it would ship page copy to the browser and widen the catalog type.
## Decision
A dedicated `src/lib/services.ts` holds only the net-new `ServicePageContent` keyed by slug and **composes** the existing thin `SERVICES` + the catalog `from`/`duration`/`img` (via `getCatalogServices()`) into a `ServicePage`. `SERVICES` and `catalog.ts` are unchanged.
## Why
Mirrors the [[winter-data-module]] decision: keep the catalog-driving data thin, give landing pages a separate Payload-ready module. Composition (not duplication) keeps one source for the slug list and one for the display price. Zero churn to the client island and the homepage.
## Consequences
A service's data spans three single-purpose modules (data.ts canonical list, catalog.ts presentation, services.ts page content); accepted — each has one clear role and they compose. The accessor-only boundary for `SERVICE_CONTENT` is an unenforced invariant (same gap as locations/winter — see [[enforce-locations-import-boundary]]).
```

- [ ] **Step 3: Create the zone card**

Create `kryscar-mind/map/zones/service-pages.md` (replace `<SHA>` with the value from Step 1):

```markdown
---
type: zone
summary: "Per-service landing pages: /uslugi/[usluga] for all 8 catalog services + the Payload-ready service-page data layer that composes SERVICES + catalog price + landing content."
tags: [feature, seo, data]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[service-catalog]]", "[[winter-services]]", "[[city-landing-pages]]", "[[seo]]", "[[homepage-and-variants]]"]
sources: ["[[2026-06-03-service-landing-pages-design]]"]
owns:
  routes: ["/uslugi/[usluga]"]
  anchors: ["symbol:getAllServices", "symbol:getServiceBySlug", "symbol:getServiceSlugs", "symbol:ServicePage", "symbol:ServiceFaq"]
  globs: ["src/app/uslugi/**", "src/lib/services.ts"]
depends: ["[[service-catalog]]", "[[coverage-map]]", "[[layout-chrome]]", "[[city-landing-pages]]", "[[winter-services]]"]
invariants:
  - rule: "Components consume service pages only via async accessors — no component imports SERVICE_CONTENT (Payload-migration boundary)"
    enforcedBy: []
verifiedAt: "<SHA>"
---
## Purpose
A statically-rendered landing page per catalog service, mirroring the city/winter arcs. The data layer composes the thin SERVICES list + catalog pricing + net-new page content; the catalog cards link here.
## Anchors
`getAllServices`, `getServiceBySlug`, `getServiceSlugs`, `ServicePage`, `route:/uslugi/[usluga]`.
## Invariants
Accessor-only data boundary (mirrors city/winter); pages are static (no seasonal revalidate). Shares the generalized `ServiceJsonLd` owned by [[winter-services]].
## Lineage
sources → [[2026-06-03-service-landing-pages-design]]; data-layer rationale → [[service-page-data-module]].
```

- [ ] **Step 4: Re-stamp the four touched zone cards**

For each file below, read it, then set `verifiedAt:` to `<SHA>` (from Step 1) and `updated:` to `2026-06-03`. Make the small noted content change too.

- `kryscar-mind/map/zones/service-catalog.md` — add `"[[service-pages]]"` to the `related:` list; in the `## Purpose`/`## Anchors` prose, note that catalog cards now link to `/uslugi/[slug]`.
- `kryscar-mind/map/zones/seo.md` — note `/uslugi/[slug]` is now in the sitemap (alongside `/zima` + city slugs).
- `kryscar-mind/map/zones/winter-services.md` — note `ServiceJsonLd` was generalized to `{name,description,url,breadcrumbs}` and is now shared with [[service-pages]]; the `symbol:ServiceJsonLd` anchor and the `/zima/[usluga]` call site are unchanged in behavior.
- `kryscar-mind/map/zones/layout-chrome.md` — note the new "Usługi" → `/#katalog` nav link in `SiteHeader`.

- [ ] **Step 5: Flip the spec status to done**

In `kryscar-mind/specs/2026-06-03-service-landing-pages-design.md` frontmatter, change `status: draft` to `status: done`.

- [ ] **Step 6: Regenerate + validate the Mind**

Run: `npm run mind`
Expected: succeeds; no broken-anchor errors. `kryscar-mind/map/index.md` is regenerated to list the new `service-pages` zone (13 zones) and the new invariant appears under "Verification gaps".

- [ ] **Step 7: Final gate**

Run: `npm run check`
Expected: exit 0 (tsc + eslint + mind all clean).

- [ ] **Step 8: Commit the Mind update**

```bash
git add kryscar-mind/
git commit -m "$(cat <<'EOF'
docs(mind): service-pages zone, data-module decision; regen index

New zone service-pages (/uslugi/[usluga] + src/lib/services.ts); decision
record for the separate composing data module; re-stamp service-catalog,
seo, winter-services, layout-chrome; spec → done; regenerate map/index.md.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review (completed during planning)

**Spec coverage** — every spec section maps to a task:
- Route `/uslugi/[usluga]`, no hub → Task 3 (breadcrumb "Usługi" → `/#katalog`).
- Data layer Approach A (`services.ts` composing) → Task 2.
- Static (no revalidate) → Task 3 (no `export const revalidate`).
- Whole-card link → Task 4.
- `ServiceJsonLd` generalized → Task 1.
- Full-depth content for all 8 → Task 2 (complete Polish copy).
- Sitemap → Task 5. Nav link → Task 6.
- Error handling (notFound/null/image fallback) → Task 3 (guard) + Task 2 (`compose` drops contentless slugs).
- Verification via `npm run check` + `next build` → Tasks 7–8.
- Mind maintenance (zone, decision, re-stamps, regen) → Task 8.

**Placeholder scan** — no `TBD`/`TODO`/"add error handling"/"similar to Task N"; all code blocks are complete; all Polish copy is final.

**Type consistency** — `ServicePage` fields used by the page (`slug, category, title, short, img, from, duration, hero[], includes[], pricingNote, faq[{q,a}], metaTitle, metaDescription`) match the interface in Task 2. `getServiceSlugs`/`getServiceBySlug`/`getAllServices` names are consistent across Tasks 2/3/5. `ServiceJsonLd` props (`name, description, url, breadcrumbs`) match between Task 1 (definition), Task 1 Step 2 (zima call site), and Task 3 (uslugi call site). `categoryLabel` resolves against `CATEGORIES` from `data.ts` (all 5 service categories — trawnik/porzadki/sadzenie/ciecie/projekt — are present there).

**Out of scope (unchanged):** no `/uslugi` hub, no service×city matrix, no booking, no new photography, no catalog-island prop refactor.
