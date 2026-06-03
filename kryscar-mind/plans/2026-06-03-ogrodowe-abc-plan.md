# Ogrodowe ABC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship "Ogrodowe ABC" — a seasonal gardening-guide content section at `/ogrodowe-abc` (index) + `/ogrodowe-abc/[slug]` (6 articles) that targets long-tail SEO, links two-way with the `/uslugi` & `/zima` offers, and surfaces in the header nav + a homepage teaser.

**Architecture:** Approach A — a Payload-migration-ready `src/lib/guides.ts` data layer (typed const array + async accessors), mirroring `services.ts`/`locations.ts`. Two static App-Router pages consume only the accessors. One `ArticleJsonLd` component (Article + FAQPage + BreadcrumbList) and one reusable `GuideCard`. SEO via sitemap entries; discovery via header nav, reverse "Warto wiedzieć" blocks on offer pages, and a homepage teaser. Hero images reuse files already committed and present in `BLUR_DATA` — no Pixabay fetch.

**Tech Stack:** Next.js 16 (App Router, RSC, static), TypeScript, Tailwind, `next/image` via the existing `BlurImage` wrapper. No test runner — verification is `npm run check` (`tsc --noEmit` + `eslint` + the Mind generator) plus `npm run build` and manual route checks.

**Branch:** `feat/ogrodowe-abc` (already created; the spec commit `50ea41b` is on it). Stay on this branch.

**Spec:** `kryscar-mind/specs/2026-06-03-ogrodowe-abc-design.md`.

---

## Content authoring approach (read first)

The 6 articles are real, publish-ready Polish content. To keep this plan reviewable while still removing guesswork:

- **Article #1 (`kiedy-kosic-trawnik`) is authored in full** in Task 1 — it is the canonical template for tone, length, and structure.
- **Articles #2–#6 are specified as complete content briefs** in Task 1: every article's `slug`, `title`, `excerpt`, `season`, `readMinutes`, `img`, dates, `relatedServices`/`relatedWinter`, **complete `metaTitle`/`metaDescription`**, exact section **headings**, the concrete **points each section must cover**, and exact **FAQ questions with answer substance**. The implementer writes 2–4 sentences of prose per point following article #1's tone — no structural decisions are left open.

**Tone reference:** match `src/lib/services.ts` and `src/lib/locations.ts` — warm, concrete, local (Bydgoszcz i okolice), plain Polish, no marketing fluff, "krok po kroku". Use the formal-friendly second person ("Twój trawnik"). Each article ends by tying into the related offer naturally (not a hard sell).

**Hard rule:** every `img` must be a path already present in `src/lib/blur-data.ts`. Use only the `IMG` keys listed per article (all verified present). `relatedServices` slugs ∈ {koszenie, pielegnacja, grabienie, sadzenie, ciecie, porzadki, aranzacja, rabaty}. `relatedWinter` slugs ∈ {odsniezanie, swiateczne-oswietlenie, zimowe-zabezpieczanie-roslin}.

---

## File structure

**Create:**
- `src/lib/guides.ts` — guide data layer: `Guide`/`GuideSection`/`GuideFaq`/`Season` types, `SEASON_ORDER`, `SEASON_LABELS`, the 6 `GUIDES`, and async accessors. The sole content source (Payload boundary).
- `src/components/ArticleJsonLd.tsx` — emits Article + FAQPage + BreadcrumbList JSON-LD.
- `src/components/GuideCard.tsx` — presentational guide card (hero + season badge + title + excerpt + read-time), links to the article.
- `src/app/ogrodowe-abc/page.tsx` — index/listing, grouped by season.
- `src/app/ogrodowe-abc/[slug]/page.tsx` — article page.
- `kryscar-mind/map/zones/ogrodowe-abc.md` — new Mind zone card (Task 11).
- `kryscar-mind/map/decisions/ogrodowe-abc-content-section.md` — decision record (Task 11).

**Modify:**
- `src/app/sitemap.ts` — add `/ogrodowe-abc` + per-article entries.
- `src/components/SiteHeader.tsx` — add the nav link.
- `src/app/uslugi/[usluga]/page.tsx` — reverse "Warto wiedzieć" block.
- `src/app/zima/[usluga]/page.tsx` — reverse "Warto wiedzieć" block.
- `src/app/example-9/page.tsx` — homepage "Z naszego poradnika" teaser.
- Touched Mind zones re-stamped in Task 11.

**Dependency order:** Task 1 (data) → Tasks 2–3 (components) → Task 4 (article page) → Task 5 (index) → Tasks 6–10 (integrations) → Task 11 (Mind). Each task compiles and commits independently.

---

### Task 1: Guides data layer (`src/lib/guides.ts`)

**Files:**
- Create: `src/lib/guides.ts`

- [ ] **Step 1: Create the file with types, ordering, the GUIDES array (article #1 full + #2–#6 from the briefs), and accessors**

Start from this exact scaffold. Fill `GUIDES` with all 6 entries: article #1 is given complete; author #2–#6 from the briefs below it.

```ts
// src/lib/guides.ts
/**
 * "Ogrodowe ABC" — seasonal gardening-guide content for /ogrodowe-abc and
 * /ogrodowe-abc/[slug].
 *
 * MIGRATION (PayloadCMS): this module is the ONLY place that knows the guide
 * content source. `Guide` mirrors a future Payload `guides` collection
 * (slug:text-unique, title/excerpt:text, season:select, readMinutes:number,
 * image:upload, publishedAt/updatedAt:date, relatedServices/relatedWinter:
 * relationship, intro:array<{paragraph}> or richText, sections:array<{heading,
 * paragraphs}> or richText/blocks, faq:array<{q,a}>, metaTitle:text +
 * metaDescription:textarea in an `seo` group). To migrate: reimplement the
 * async accessors below to read Payload. NOTHING ELSE in the app changes —
 * pages/components consume only these accessors (await) or receive props.
 *
 * Each `img` MUST be a path present in src/lib/blur-data.ts (BLUR_DATA), so the
 * BlurImage hero always blurs up. relatedServices/relatedWinter slugs must
 * match real SERVICES / WINTER_SERVICES slugs.
 */
import { IMG } from "@/lib/data";

export type Season = "wiosna" | "lato" | "jesien" | "zima" | "caloroczne";

export interface GuideSection {
  heading: string;
  paragraphs: string[];
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  season: Season;
  readMinutes: number;
  img: string; // must be in BLUR_DATA
  publishedAt: string; // ISO YYYY-MM-DD
  updatedAt: string; // ISO YYYY-MM-DD
  relatedServices: string[];
  relatedWinter?: string[];
  intro: string[];
  sections: GuideSection[];
  faq: GuideFaq[];
  metaTitle: string;
  metaDescription: string;
}

/** Display order + labels for the season grouping/badges. */
export const SEASON_ORDER: Record<Season, number> = {
  wiosna: 0,
  lato: 1,
  jesien: 2,
  zima: 3,
  caloroczne: 4,
};

export const SEASON_LABELS: Record<Season, string> = {
  wiosna: "Wiosna",
  lato: "Lato",
  jesien: "Jesień",
  zima: "Zima",
  caloroczne: "Cały rok",
};

const GUIDES: Guide[] = [
  // ===== Article #1 — AUTHORED IN FULL (canonical template) =====
  {
    slug: "kiedy-kosic-trawnik",
    title: "Kiedy i jak często kosić trawnik",
    excerpt:
      "Jak często kosić trawnik, na jaką wysokość i kiedy zacząć wiosną? Praktyczny poradnik krok po kroku — z zasadą 1/3 i rytmem koszenia na cały sezon.",
    season: "lato",
    readMinutes: 5,
    img: IMG.manMowing,
    publishedAt: "2026-04-15",
    updatedAt: "2026-06-03",
    relatedServices: ["koszenie"],
    intro: [
      "Równy, gęsty trawnik to przede wszystkim kwestia regularności. Zbyt rzadkie koszenie osłabia trawę i otwiera pole dla chwastów, a koszenie „na krótko” w upał potrafi ją wręcz spalić. W tym poradniku tłumaczymy, jak często i na jaką wysokość kosić trawnik w naszym, bydgoskim klimacie — krok po kroku.",
      "Zasady są proste i sprawdzają się w większości przydomowych ogrodów. A jeśli wolisz mieć koszenie z głowy, na końcu piszemy, jak przejmujemy je u stałych klientów w stałym rytmie.",
    ],
    sections: [
      {
        heading: "Kiedy zacząć kosić wiosną",
        paragraphs: [
          "Pierwsze koszenie wykonujemy, gdy trawa osiągnie około 8–10 cm wysokości — w naszym regionie wypada to zwykle na przełomie marca i kwietnia, gdy gleba obeschnie po zimie. Nie ma sensu kosić „z kalendarza”: liczy się stan trawnika, nie data.",
          "Pierwszego koszenia nie skracaj drastycznie — zdejmij tylko górną część źdźbeł. Trawa po zimie jest osłabiona, a zbyt krótkie cięcie na starcie sezonu cofa ją w rozwoju i odsłania glebę pod chwasty i mech.",
        ],
      },
      {
        heading: "Jak często kosić w sezonie",
        paragraphs: [
          "W okresie intensywnego wzrostu — późną wiosną i wczesną jesienią — trawnik kosi się najczęściej co 7–10 dni. Latem, zwłaszcza w suszę, wzrost zwalnia i wystarcza koszenie co 10–14 dni, a w upały lepiej odpuścić i podnieść wysokość cięcia.",
          "Najważniejsza zasada: kieruj się wzrostem trawy, nie sztywnym terminem. Regularny, częstszy rytm daje gęstszą murawę niż rzadkie, drastyczne koszenie raz na trzy tygodnie.",
        ],
      },
      {
        heading: "Na jaką wysokość — zasada 1/3",
        paragraphs: [
          "Złota zasada brzmi: za jednym razem nie skracaj więcej niż 1/3 wysokości źdźbła. Jeśli trawa urosła do 9 cm, kosisz do około 6 cm — nie niżej. Cięcie „do gołej ziemi” to najczęstsza przyczyna pożółkłego, przerzedzonego trawnika.",
          "Optymalna wysokość koszenia to 4–6 cm, a latem i w miejscach zacienionych warto trzymać 6–7 cm. Wyższa trawa lepiej znosi suszę, ocienia glebę i skuteczniej wypiera chwasty.",
        ],
      },
      {
        heading: "Najczęstsze błędy",
        paragraphs: [
          "Tępe noże to błąd numer jeden — szarpią zamiast ciąć, źdźbła strzępią się i brązowieją na końcach, a poranione rośliny łatwiej chorują. Noże warto ostrzyć przynajmniej raz w sezonie.",
          "Pozostałe częste pomyłki to koszenie w upalne południe (trawa paruje i więdnie), koszenie mokrej murawy (szarpie się i ubija glebę), jazda wciąż tym samym torem oraz pozostawianie grubej warstwy pokosu, która dusi trawnik.",
        ],
      },
      {
        heading: "Mulczować czy zbierać trawę?",
        paragraphs: [
          "Przy regularnym koszeniu sprawdza się mulczowanie — drobno pocięta trawa zostaje na trawniku i zwraca mu azot oraz wilgoć, ograniczając potrzebę nawożenia. Warunek to częste cięcie, żeby pokos był drobny.",
          "Trawę zbieramy, gdy jest wysoka, mokra albo gdy na trawniku pojawiły się choroby grzybowe — wtedy pozostawiony pokos bardziej szkodzi, niż pomaga. U stałych klientów dobieramy wariant do stanu murawy.",
        ],
      },
    ],
    faq: [
      {
        q: "Jak często kosić trawnik latem?",
        a: "Najczęściej co 10–14 dni, a w czasie suszy rzadziej i na większej wysokości. Zamiast trzymać się sztywnego terminu, kieruj się tempem wzrostu trawy i pogodą.",
      },
      {
        q: "Czy można kosić mokrą trawę?",
        a: "Lepiej nie. Mokra trawa szarpie się i zatyka kosiarkę, cięcie jest nierówne, a koła ubijają wilgotną glebę. Poczekaj, aż murawa obeschnie po deszczu lub porannej rosie.",
      },
      {
        q: "Na jaką wysokość kosić trawnik?",
        a: "Zwykle 4–6 cm, a latem i w cieniu 6–7 cm. Trzymaj się zasady 1/3 — za jednym koszeniem nie skracaj więcej niż o jedną trzecią wysokości źdźbła.",
      },
    ],
    metaTitle: "Kiedy i jak często kosić trawnik — poradnik | Ogrody Kryscar",
    metaDescription:
      "Jak często kosić trawnik, na jaką wysokość i kiedy zacząć wiosną? Zasada 1/3, rytm koszenia na cały sezon i najczęstsze błędy. Poradnik Ogrody Kryscar, Bydgoszcz.",
  },

  // ===== Articles #2–#6 — author prose from the briefs in Step 1 notes =====
  // (objects in the same shape; metadata below is fixed, write intro/sections/faq prose)
];

const sorted = () =>
  [...GUIDES].sort(
    (a, b) =>
      SEASON_ORDER[a.season] - SEASON_ORDER[b.season] ||
      (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0),
  );

export async function getAllGuides(): Promise<Guide[]> {
  return sorted();
}

export async function getGuideSlugs(): Promise<string[]> {
  return GUIDES.map((g) => g.slug);
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}

export async function getGuidesForService(serviceSlug: string): Promise<Guide[]> {
  return sorted().filter((g) => g.relatedServices.includes(serviceSlug));
}

export async function getGuidesForWinter(winterSlug: string): Promise<Guide[]> {
  return sorted().filter((g) => g.relatedWinter?.includes(winterSlug));
}
```

**Content briefs for articles #2–#6** — each is a `Guide` object in the array above. Metadata is fixed; author `intro` (2 paras), `sections` (the listed headings, 2 paras each covering the points), and `faq` (the listed questions, answer covering the points), in article #1's tone.

**#2 — Wiosenne porządki w ogrodzie**
- `slug: "wiosenne-porzadki-w-ogrodzie"`, `season: "wiosna"`, `readMinutes: 6`, `img: IMG.gardenerYard`, `publishedAt: "2026-03-10"`, `updatedAt: "2026-06-03"`, `relatedServices: ["porzadki", "pielegnacja"]`.
- `title: "Wiosenne porządki w ogrodzie — od czego zacząć"`
- `excerpt: "Wiosenne porządki w ogrodzie krok po kroku: kiedy zacząć, jak obudzić trawnik po zimie, co zrobić z rabatami i czego nie robić za wcześnie."`
- intro: ogród budzi się po zimie; dobry start = równy sezon; przewodnik po kolejności prac; tie-in: u stałych klientów robimy to jednym wejściem.
- sections:
  1. "Kiedy zacząć wiosenne porządki" — gdy gleba obeschnie i miną mocne przymrozki (marzec/kwiecień u nas); nie wchodzić na rozmokły, zmarznięty trawnik (ubijanie, wyrywanie).
  2. "Trawnik: grabienie, wertykulacja, pierwsze koszenie" — wygrabienie pozostałości i filcu; wertykulacja gdy dużo mchu/filcu; pierwsze koszenie wyżej; ewentualne dosianie łysych miejsc.
  3. "Rabaty i krzewy" — usunięcie zeschłych pędów i liści, odkrycie roślin okrywanych na zimę (we właściwym momencie, by nie zaparzyć), cięcie bylin i traw ozdobnych, ściółkowanie.
  4. "Czego nie robić za wcześnie" — nie odkrywać wrażliwych roślin przy ryzyku przymrozków; nie kosić zbyt krótko; nie nawozić zamarzniętej gleby; cierpliwość z owadami zimującymi w ściółce.
  5. "Plan na resztę sezonu" — porządki to start; potem regularna pielęgnacja; krótkie nawiązanie do oferty (porządki + stała opieka).
- faq:
  - "Kiedy zacząć wiosenne porządki w ogrodzie?" → gdy gleba obeschnie i miną silne przymrozki, zwykle marzec–kwiecień; liczy się pogoda, nie data.
  - "Czy wertykulacja jest konieczna co roku?" → nie zawsze; gdy dużo filcu/mchu — tak; w zdrowym trawniku co 1–2 lata.
  - "Co zrobić z liśćmi i ściętymi pędami?" → kompostować lub wywieźć; część można zostawić jako schronienie dla pożytecznych owadów.
- `metaTitle: "Wiosenne porządki w ogrodzie — od czego zacząć | Ogrody Kryscar"`
- `metaDescription: "Wiosenne porządki w ogrodzie krok po kroku: kiedy zacząć, grabienie i wertykulacja trawnika, cięcie bylin, odkrywanie roślin. Poradnik Ogrody Kryscar, Bydgoszcz."`

**#3 — Co i kiedy sadzić w ogrodzie**
- `slug: "co-i-kiedy-sadzic"`, `season: "wiosna"`, `readMinutes: 7`, `img: IMG.sprout`, `publishedAt: "2026-03-25"`, `updatedAt: "2026-06-03"`, `relatedServices: ["sadzenie", "rabaty"]`.
- `title: "Co i kiedy sadzić w ogrodzie — kalendarz nasadzeń"`
- `excerpt: "Kalendarz nasadzeń: co sadzić wiosną, a co jesienią — drzewa, krzewy, byliny i cebulowe. Kiedy sadzić, żeby rośliny dobrze się przyjęły."`
- intro: termin sadzenia decyduje o przyjęciu roślin; dwa główne okna (wiosna, jesień); przewodnik; tie-in: dobór i sadzenie to nasza usługa.
- sections:
  1. "Dwa najlepsze okresy: wiosna i jesień" — wiosna (po przymrozkach) dla wrażliwych i bylin; jesień (wrzesień–październik) świetna dla drzew i krzewów liściastych — gleba ciepła, korzenie się przyjmują przed zimą.
  2. "Co sadzić wiosną" — byliny, rośliny jednoroczne po „zimnych ogrodnikach” (połowa maja), iglaki, trawy ozdobne; rośliny z donic (z bryłą korzeniową) niemal cały sezon.
  3. "Co sadzić jesienią" — drzewa i krzewy liściaste, róże, byliny, cebulowe wiosenne (tulipany, narcyzy, krokusy — wrzesień–listopad), żywopłoty z gołym korzeniem.
  4. "Jak sadzić, żeby się przyjęło" — odpowiedni dół, dobra ziemia, sadzenie na właściwą głębokość, podlanie startowe, ściółkowanie; dobór gatunku do stanowiska (słońce/gleba).
  5. "Czego unikać" — sadzenie w mróz lub upał/suszę, sadzenie zbyt głęboko, zaniedbanie podlewania w pierwszym sezonie; krótki tie-in do doboru roślin przez nas.
- faq:
  - "Czy lepiej sadzić wiosną czy jesienią?" → zależy od rośliny; drzewa i krzewy liściaste lubią jesień, wrażliwe i jednoroczne — wiosnę po przymrozkach.
  - "Kiedy sadzić cebulki tulipanów?" → jesienią, wrzesień–listopad, przed pierwszymi mrozami.
  - "Czy rośliny z donicy można sadzić latem?" → tak, mają bryłę korzeniową, ale wymagają regularnego podlewania; unikać upalnych dni.
- `metaTitle: "Co i kiedy sadzić w ogrodzie — kalendarz nasadzeń | Ogrody Kryscar"`
- `metaDescription: "Kalendarz nasadzeń: co sadzić wiosną, a co jesienią — drzewa, krzewy, byliny, cebulowe. Jak sadzić, żeby się przyjęło. Poradnik Ogrody Kryscar, Bydgoszcz."`

**#4 — Kiedy ciąć żywopłot i krzewy ozdobne**
- `slug: "kiedy-ciac-zywoplot"`, `season: "lato"`, `readMinutes: 5`, `img: IMG.hedgeShears`, `publishedAt: "2026-05-20"`, `updatedAt: "2026-06-03"`, `relatedServices: ["ciecie"]`.
- `title: "Kiedy ciąć żywopłot i krzewy ozdobne"`
- `excerpt: "Kiedy przycinać żywopłot i krzewy ozdobne, żeby ładnie się zagęszczały i kwitły? Terminy cięcia formującego, prześwietlającego i po kwitnieniu."`
- intro: cięcie w złym terminie = brak kwiatów lub osłabienie; termin zależy od gatunku i celu cięcia; przewodnik; tie-in: cięcie i formowanie to nasza usługa.
- sections:
  1. "Żywopłoty formowane" — główne cięcie późną wiosną/wczesnym latem (po pierwszym przyroście) i korygujące pod koniec lata; iglaste delikatnie; uwaga na okres lęgowy ptaków.
  2. "Krzewy kwitnące — po kwitnieniu" — gatunki kwitnące na pędach zeszłorocznych (np. forsycja, lilak/bez) tnij tuż po przekwitnięciu, bo inaczej zetniesz przyszłoroczne kwiaty.
  3. "Krzewy kwitnące na pędach tegorocznych" — np. budleja, hortensja bukietowa, róże — cięcie wczesną wiosną pobudza obfite kwitnienie.
  4. "Cięcie sanitarne i prześwietlające" — usuwanie chorych/martwych/krzyżujących się pędów — można niemal cały rok, najlepiej poza mrozami; rozluźnia koronę, wpuszcza światło.
  5. "Zasady i bezpieczeństwo" — ostre, czyste narzędzia; nie ciąć w upał i mróz; nie skracać drastycznie iglaków (nie odbijają ze starego drewna); tie-in do oferty (wysokie żywopłoty, wywóz gałęzi).
- faq:
  - "Kiedy ciąć żywopłot?" → formowany: późna wiosna/wczesne lato + korekta późnym latem; unikać okresu lęgowego ptaków i upałów.
  - "Dlaczego mój krzew nie kwitnie po cięciu?" → prawdopodobnie cięty w złym terminie — gatunki kwitnące na zeszłorocznych pędach trzeba ciąć zaraz po kwitnieniu.
  - "Czy można mocno przyciąć iglaki?" → ostrożnie — większość nie odbija ze starego drewna, więc nie tnij poza strefę zielonych igieł.
- `metaTitle: "Kiedy ciąć żywopłot i krzewy ozdobne — poradnik | Ogrody Kryscar"`
- `metaDescription: "Kiedy przycinać żywopłot, krzewy kwitnące i iglaki, żeby ładnie rosły i kwitły? Terminy cięcia formującego i po kwitnieniu. Poradnik Ogrody Kryscar, Bydgoszcz."`

**#5 — Jak przygotować ogród na zimę**
- `slug: "jak-przygotowac-ogrod-na-zime"`, `season: "jesien"`, `readMinutes: 6`, `img: IMG.wrappedPlants`, `publishedAt: "2026-05-28"`, `updatedAt: "2026-06-03"`, `relatedServices: ["porzadki", "grabienie"]`, `relatedWinter: ["zimowe-zabezpieczanie-roslin"]`.
- `title: "Jak przygotować ogród na zimę"`
- `excerpt: "Jak przygotować ogród na zimę krok po kroku: grabienie liści, zabezpieczanie roślin, ostatnie koszenie i porządki, które ułatwią wiosenny start."`
- intro: dobre zamknięcie sezonu chroni rośliny i ułatwia wiosnę; co i w jakiej kolejności jesienią; tie-in: zabezpieczanie roślin (oferta zimowa) + jesienne porządki.
- sections:
  1. "Liście i ostatnie koszenie" — wygrabienie liści z trawnika (leżące duszą trawę, sprzyjają chorobom i pleśni śniegowej); ostatnie koszenie nieco krócej przed zimą; wywóz lub kompost.
  2. "Zabezpieczanie wrażliwych roślin" — okrywanie agrowłókniną/stroiszem (róże, hortensje, młode i zimozielone), kopczykowanie, ściółkowanie korzeni; iglaki/formy wiązać przed śniegiem; ochrona pni młodych drzew. Link do oferty zabezpieczania.
  3. "Rabaty i byliny" — cięcie przekwitłych bylin (część zostawić dla ptaków i estetyki zimowej), oczyszczenie z chwastów, ściółka chroniąca korzenie.
  4. "Woda, narzędzia, system nawadniania" — opróżnić i schować węże/zraszacze, odciąć wodę zewnętrzną przed mrozem, oczyścić i naoliwić narzędzia.
  5. "Po co to wszystko" — mniej strat zimą, łatwiejszy wiosenny start; tie-in: u stałych klientów łączymy zabezpieczanie z jesiennymi porządkami jednym wejściem; odsyłacz do /zima.
- faq:
  - "Które rośliny trzeba okrywać na zimę?" → najbardziej zimozielone, młode nasadzenia, róże, hortensje i wrażliwe iglaki; wiele bylin radzi sobie samo.
  - "Czy trzeba wygrabiać liście z trawnika?" → tak — gruba warstwa liści dusi trawę i sprzyja pleśni śniegowej; z rabat część można zostawić jako ściółkę.
  - "Kiedy zabezpieczać rośliny na zimę?" → późną jesienią, przy pierwszych przymrozkach, ale przed mrozami; za wczesne okrycie grozi zaparzeniem.
- `metaTitle: "Jak przygotować ogród na zimę — poradnik krok po kroku | Ogrody Kryscar"`
- `metaDescription: "Jak przygotować ogród na zimę: grabienie liści, zabezpieczanie i okrywanie roślin, ostatnie koszenie, rabaty i nawadnianie. Poradnik Ogrody Kryscar, Bydgoszcz."`

**#6 — Świąteczne oświetlenie ogrodu**
- `slug: "swiateczne-oswietlenie-ogrodu"`, `season: "zima"`, `readMinutes: 4`, `img: IMG.gardenLights`, `publishedAt: "2026-05-30"`, `updatedAt: "2026-06-03"`, `relatedServices: []`, `relatedWinter: ["swiateczne-oswietlenie"]`.
- `title: "Świąteczne oświetlenie ogrodu — jak zaplanować"`
- `excerpt: "Jak zaplanować świąteczne oświetlenie ogrodu: jakie lampki wybrać, na co zwrócić uwagę przy zasilaniu i bezpieczeństwie, jak rozmieścić iluminację."`
- intro: dobrze zaplanowana iluminacja robi wrażenie i jest bezpieczna; krótki, praktyczny przewodnik; tie-in: montaż i demontaż bierzemy na siebie (oferta zimowa).
- sections:
  1. "Lampki zewnętrzne, nie wewnętrzne" — tylko oprawy z odpowiednią klasą szczelności (IP) do użytku na zewnątrz; LED — mniej prądu, mniej ciepła, bezpieczniejsze; sprawdzić stan przewodów.
  2. "Co i jak podświetlić" — wybrać 2–3 akcenty (drzewo, wejście, żywopłot/elewacja) zamiast „wszystkiego”; spójna barwa światła (ciepła vs zimna biel); kurtyny, lampki oplatające, reflektory punktowe.
  3. "Zasilanie i bezpieczeństwo" — gniazda zewnętrzne z bolcem i zabezpieczeniem różnicowoprądowym, przedłużacze do zewnątrz, mocowania odporne na wiatr i śnieg; nie przeciążać obwodu; timer/zmierzchowy czujnik.
  4. "Montaż i demontaż" — bezpieczna praca na wysokości (drabina/asekuracja), planowanie z wyprzedzeniem (listopad), staranne zdjęcie i spakowanie po sezonie; tie-in: robimy to bez stania na drabinie, odsyłacz do /zima.
- faq:
  - "Jakie lampki na zewnątrz wybrać?" → wyłącznie przeznaczone do użytku zewnętrznego (odpowiednia klasa IP), najlepiej LED — energooszczędne i bezpieczniejsze.
  - "Jak bezpiecznie podłączyć oświetlenie w ogrodzie?" → przez zewnętrzne gniazdo z zabezpieczeniem różnicowoprądowym, przedłużacze do zewnątrz, bez przeciążania obwodu; warto użyć timera.
  - "Kiedy zamówić montaż iluminacji?" → najlepiej z wyprzedzeniem, w listopadzie — terminy przed świętami schodzą najszybciej.
- `metaTitle: "Świąteczne oświetlenie ogrodu — jak zaplanować i zamontować | Ogrody Kryscar"`
- `metaDescription: "Jak zaplanować świąteczne oświetlenie ogrodu: jakie lampki wybrać, bezpieczne zasilanie i rozmieszczenie iluminacji. Poradnik Ogrody Kryscar, Bydgoszcz."`

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (If `IMG.<key>` is unknown, fix the key — all six used keys exist: `manMowing`, `gardenerYard`, `sprout`, `hedgeShears`, `wrappedPlants`, `gardenLights`.)

- [ ] **Step 3: Sanity-check the 6 image keys exist and their paths are in BLUR_DATA**

Run: `grep -E 'manMowing|gardenerYard|sprout|hedgeShears|wrappedPlants|gardenLights' src/lib/data.ts && grep -E 'manMowing|gardenerYard|sprout|hedgeShears|wrappedPlants|gardenLights' src/lib/blur-data.ts`
Expected: each key prints from `data.ts` (mapping to an `/img/...` path) AND that same path prints from `blur-data.ts`. If a path is missing from `blur-data.ts`, the hero won't blur up — pick a different already-present image.

- [ ] **Step 4: Commit**

```bash
git add src/lib/guides.ts
git commit -m "feat(abc): guides data layer with 6 cornerstone articles

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: `ArticleJsonLd` component

**Files:**
- Create: `src/components/ArticleJsonLd.tsx`

- [ ] **Step 1: Write the component** (modeled on `ServiceJsonLd.tsx`)

```tsx
// src/components/ArticleJsonLd.tsx
import { COMPANY, ADDRESS, SITE_URL } from "@/lib/data";

export interface JsonLdCrumb {
  name: string;
  item: string; // absolute URL
}

interface ArticleFaq {
  q: string;
  a: string;
}

/**
 * Emits JSON-LD `Article` (+ `FAQPage` when faq present + `BreadcrumbList`)
 * for an Ogrodowe ABC guide. Author/publisher = the Ogrody Kryscar business.
 */
export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  faq,
  breadcrumbs,
}: {
  title: string;
  description: string;
  url: string;
  image: string; // absolute URL
  datePublished: string;
  dateModified: string;
  faq: ArticleFaq[];
  breadcrumbs: JsonLdCrumb[];
}) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      headline: title,
      description,
      image,
      datePublished,
      dateModified,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: {
        "@type": "Organization",
        name: COMPANY.name,
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: COMPANY.name,
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
  ];

  if (faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  const json = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (Confirm `SITE_URL` and `ADDRESS` are exported from `src/lib/data.ts` — `ServiceJsonLd` already imports `COMPANY, ADDRESS` and pages import `SITE_URL`.)

- [ ] **Step 3: Commit**

```bash
git add src/components/ArticleJsonLd.tsx
git commit -m "feat(abc): ArticleJsonLd (Article + FAQPage + BreadcrumbList)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: `GuideCard` component

**Files:**
- Create: `src/components/GuideCard.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/GuideCard.tsx
import Link from "next/link";
import { BlurImage } from "@/components/BlurImage";
import { SEASON_LABELS, type Guide } from "@/lib/guides";

/** Presentational card for a guide. Links to the article. */
export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/ogrodowe-abc/${guide.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-colors hover:border-emerald-700"
    >
      <div className="relative aspect-[16/9] w-full bg-neutral-100">
        <BlurImage
          src={guide.img}
          alt={guide.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-800 backdrop-blur">
          {SEASON_LABELS[guide.season]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold tracking-tight group-hover:text-emerald-700">
          {guide.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">
          {guide.excerpt}
        </p>
        <span className="mt-4 text-xs uppercase tracking-wider text-neutral-500">
          {guide.readMinutes} min czytania
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/GuideCard.tsx
git commit -m "feat(abc): GuideCard listing component

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Article page `/ogrodowe-abc/[slug]/page.tsx`

**Files:**
- Create: `src/app/ogrodowe-abc/[slug]/page.tsx`

- [ ] **Step 1: Write the page** (mirrors `/uslugi/[usluga]/page.tsx` structure)

```tsx
// src/app/ogrodowe-abc/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPANY, SITE_URL } from "@/lib/data";
import {
  getAllGuides,
  getGuideBySlug,
  getGuideSlugs,
  SEASON_LABELS,
} from "@/lib/guides";
import { getCatalogServices } from "@/lib/catalog";
import { getWinterServices } from "@/lib/winter";
import type { CatalogItem } from "@/components/service-catalog";
import type { WinterService } from "@/lib/winter";
import { BlurImage } from "@/components/BlurImage";
import { GuideCard } from "@/components/GuideCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ArticleJsonLd } from "@/components/ArticleJsonLd";
import { Reveal } from "@/components/motion";

export async function generateStaticParams() {
  const slugs = await getGuideSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "Nie znaleziono" };
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: `/ogrodowe-abc/${guide.slug}` },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: `/ogrodowe-abc/${guide.slug}`,
      type: "article",
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const catalog = getCatalogServices();
  const winter = await getWinterServices();
  const relatedServices = guide.relatedServices
    .map((s) => catalog.find((c) => c.slug === s))
    .filter((c): c is CatalogItem => Boolean(c));
  const relatedWinter = (guide.relatedWinter ?? [])
    .map((s) => winter.find((w) => w.slug === s))
    .filter((w): w is WinterService => Boolean(w));
  const others = (await getAllGuides())
    .filter((g) => g.slug !== guide.slug)
    .slice(0, 3);

  const published = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(guide.publishedAt));

  return (
    <main className="bg-white text-neutral-900">
      <ArticleJsonLd
        title={guide.title}
        description={guide.metaDescription}
        url={`${SITE_URL}/ogrodowe-abc/${guide.slug}`}
        image={`${SITE_URL}${guide.img}`}
        datePublished={guide.publishedAt}
        dateModified={guide.updatedAt}
        faq={guide.faq}
        breadcrumbs={[
          { name: "Strona główna", item: SITE_URL },
          { name: "Ogrodowe ABC", item: `${SITE_URL}/ogrodowe-abc` },
          { name: guide.title, item: `${SITE_URL}/ogrodowe-abc/${guide.slug}` },
        ]}
      />
      <SiteHeader />

      {/* Breadcrumb */}
      <nav
        aria-label="Okruszki"
        className="mx-auto max-w-3xl px-4 pt-6 text-xs text-neutral-500 sm:px-6"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-emerald-700">Strona główna</Link></li>
          <li aria-hidden>›</li>
          <li><Link href="/ogrodowe-abc" className="hover:text-emerald-700">Ogrodowe ABC</Link></li>
          <li aria-hidden>›</li>
          <li className="text-neutral-900">{guide.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider text-neutral-500">
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-800">
              {SEASON_LABELS[guide.season]}
            </span>
            <span>{published}</span>
            <span aria-hidden>·</span>
            <span>{guide.readMinutes} min czytania</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {guide.title}
          </h1>
          {guide.intro.map((p, i) => (
            <p key={i} className="mt-5 text-base leading-relaxed text-neutral-700">
              {p}
            </p>
          ))}
        </Reveal>

        {/* Hero image */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200">
          <div className="relative aspect-[16/9] w-full bg-neutral-100">
            <BlurImage
              src={guide.img}
              alt={guide.title}
              fill
              preload
              className="object-cover"
              sizes="(min-width: 768px) 768px, 100vw"
            />
          </div>
        </div>

        {/* Sections */}
        <div className="mt-10 space-y-10">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
              {section.paragraphs.map((p, i) => (
                <p key={i} className="mt-4 text-base leading-relaxed text-neutral-700">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* FAQ */}
        {guide.faq.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold tracking-tight">Najczęstsze pytania</h2>
            <div className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
              {guide.faq.map((f) => (
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
        )}
      </article>

      {/* Related offers */}
      {(relatedServices.length > 0 || relatedWinter.length > 0) && (
        <section className="bg-neutral-50">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">Pomożemy z tym w Twoim ogrodzie</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {relatedServices.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/uslugi/${s.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm font-medium transition-colors hover:border-emerald-700 hover:text-emerald-700"
                  >
                    <span>{s.title}</span>
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
              {relatedWinter.map((w) => (
                <li key={w.slug}>
                  <Link
                    href={`/zima/${w.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm font-medium transition-colors hover:border-emerald-700 hover:text-emerald-700"
                  >
                    <span>{w.name}</span>
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                Zadzwoń: {COMPANY.phone}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Other guides */}
      {others.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Zobacz też</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (`CatalogItem` is exported from `src/components/service-catalog.tsx`; `WinterService` from `src/lib/winter.ts`; `COMPANY.phoneRaw`/`phone` exist — used in the service page.)

- [ ] **Step 3: Commit**

```bash
git add src/app/ogrodowe-abc/\[slug\]/page.tsx
git commit -m "feat(abc): article page /ogrodowe-abc/[slug]

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Index page `/ogrodowe-abc/page.tsx`

**Files:**
- Create: `src/app/ogrodowe-abc/page.tsx`

- [ ] **Step 1: Write the index page**

```tsx
// src/app/ogrodowe-abc/page.tsx
import type { Metadata } from "next";
import { COMPANY, SITE_URL } from "@/lib/data";
import {
  getAllGuides,
  SEASON_LABELS,
  SEASON_ORDER,
  type Guide,
  type Season,
} from "@/lib/guides";
import { GuideCard } from "@/components/GuideCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Ogrodowe ABC — poradnik ogrodniczy | Ogrody Kryscar",
  description:
    "Ogrodowe ABC: praktyczne porady ogrodnicze krok po kroku — kiedy kosić trawnik, jak przygotować ogród na zimę, co i kiedy sadzić. Wiedza od ekipy Ogrody Kryscar z Bydgoszczy.",
  alternates: { canonical: "/ogrodowe-abc" },
};

export default async function OgrodoweAbcPage() {
  const guides = await getAllGuides();

  // Group by season, preserving SEASON_ORDER.
  const seasons = (Object.keys(SEASON_ORDER) as Season[])
    .map((season) => ({
      season,
      items: guides.filter((g) => g.season === season),
    }))
    .filter((group) => group.items.length > 0);

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
              { "@type": "ListItem", position: 2, name: "Ogrodowe ABC", item: `${SITE_URL}/ogrodowe-abc` },
            ],
          }),
        }}
      />
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Ogrodowe ABC</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Poradnik ogrodniczy krok po kroku
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-700">
            Praktyczna wiedza od ekipy, która na co dzień dba o ogrody w Bydgoszczy i okolicy.
            Kiedy kosić trawnik, jak przygotować ogród na zimę, co i kiedy sadzić — bez teorii,
            za to z konkretami, które sprawdzają się w naszym klimacie.
          </p>
        </Reveal>
      </section>

      {/* Guides grouped by season */}
      {seasons.map(({ season, items }) => (
        <section key={season} className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {SEASON_LABELS[season]}
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((g: Guide) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 sm:p-12">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            Wolisz zlecić to nam?
          </h2>
          <p className="mt-4 max-w-xl text-sm text-neutral-600 sm:text-base">
            Zadzwoń — doradzimy i przyjedziemy. Koszenie, pielęgnacja, sadzenie i porządki w Bydgoszczy i okolicy.
          </p>
          <div className="mt-6">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
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

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint src/app/ogrodowe-abc src/components/GuideCard.tsx src/components/ArticleJsonLd.tsx src/lib/guides.ts`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/ogrodowe-abc/page.tsx
git commit -m "feat(abc): index page /ogrodowe-abc grouped by season

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Sitemap entries

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Add the guides import**

Add to the imports block (after the `getServiceSlugs` import on line 5):

```ts
import { getAllGuides } from "@/lib/guides";
```

- [ ] **Step 2: Fetch guides in the Promise.all and add entries**

Change the destructuring + `Promise.all` to include guides:

```ts
  const [citySlugs, winterSlugs, serviceSlugs, guides] = await Promise.all([
    getLocationSlugs(),
    getWinterServiceSlugs(),
    getServiceSlugs(),
    getAllGuides(),
  ]);
```

Then add these entries to the returned array (after the `/zima` block, before the `winterSlugs.map(...)` spread — placement doesn't matter for correctness):

```ts
    {
      url: `${SITE_URL}/ogrodowe-abc`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...guides.map((g) => ({
      url: `${SITE_URL}/ogrodowe-abc/${g.slug}`,
      lastModified: new Date(g.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(abc): add Ogrodowe ABC routes to sitemap

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Header nav link

**Files:**
- Modify: `src/components/SiteHeader.tsx`

- [ ] **Step 1: Add the link after the "Zima" link**

Insert this block immediately after the closing `</Link>` of the "Zima" link (after line 33 in the current file), before the `tel:` anchor:

```tsx
          <Link
            href="/ogrodowe-abc"
            className="hidden text-sm font-medium text-neutral-700 transition-colors hover:text-emerald-700 sm:block"
          >
            Ogrodowe ABC
          </Link>
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint src/components/SiteHeader.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/SiteHeader.tsx
git commit -m "feat(abc): add Ogrodowe ABC link to header nav

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Reverse "Warto wiedzieć" block on service pages

**Files:**
- Modify: `src/app/uslugi/[usluga]/page.tsx`

- [ ] **Step 1: Add imports**

Add after the existing `getAllServices` import block (the `@/lib/services` import, ~line 11):

```ts
import { getGuidesForService } from "@/lib/guides";
import { GuideCard } from "@/components/GuideCard";
```

- [ ] **Step 2: Fetch the related guides**

After the existing `const cities = ...` block (~line 62), add:

```ts
  const guides = await getGuidesForService(svc.slug);
```

- [ ] **Step 3: Render the block before the "Other services" section**

Insert this section immediately before the `{/* Other services */}` comment (~line 223):

```tsx
      {/* Warto wiedzieć (related guides) */}
      {guides.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Warto wiedzieć</h2>
          <p className="mt-3 max-w-2xl text-sm text-neutral-600">
            Z naszego poradnika Ogrodowe ABC — praktyczna wiedza powiązana z tą usługą.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </section>
      )}
```

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint "src/app/uslugi/[usluga]/page.tsx"`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/uslugi/\[usluga\]/page.tsx
git commit -m "feat(abc): related guides block on service pages

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Reverse "Warto wiedzieć" block on winter pages

**Files:**
- Modify: `src/app/zima/[usluga]/page.tsx`

- [ ] **Step 1: Add imports**

Add after the `@/lib/winter` import block (~line 10):

```ts
import { getGuidesForWinter } from "@/lib/guides";
import { GuideCard } from "@/components/GuideCard";
```

- [ ] **Step 2: Fetch the related guides**

After the existing `const cities = ...` block (~line 59), add:

```ts
  const guides = await getGuidesForWinter(svc.slug);
```

- [ ] **Step 3: Render the block before the "Other winter services" section**

Insert immediately before the `{/* Other winter services */}` comment (~line 216):

```tsx
      {/* Warto wiedzieć (related guides) */}
      {guides.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Warto wiedzieć</h2>
          <p className="mt-3 max-w-2xl text-sm text-neutral-600">
            Z naszego poradnika Ogrodowe ABC — praktyczna wiedza powiązana z tą usługą.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </section>
      )}
```

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint "src/app/zima/[usluga]/page.tsx"`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/zima/\[usluga\]/page.tsx
git commit -m "feat(abc): related guides block on winter pages

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Homepage teaser (example-9)

**Files:**
- Modify: `src/app/example-9/page.tsx`

- [ ] **Step 1: Add imports**

Add after the `getWinterServices` import (line 18) and the `WinterServiceCard` import (line 20):

```ts
import { getAllGuides } from "@/lib/guides";
import { GuideCard } from "@/components/GuideCard";
```

- [ ] **Step 2: Fetch the 3 latest guides**

After `const winterServices = await getWinterServices();` (line 33), add:

```ts
  const latestGuides = (await getAllGuides()).slice(0, 3);
```

- [ ] **Step 3: Insert the teaser between the FAQ section and the CTA section**

Insert this block immediately after the FAQ section's closing `</section>` (line 524) and before the `{/* CTA */}` comment (line 526):

```tsx
      {/* Ogrodowe ABC teaser */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Ogrodowe ABC</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Z naszego poradnika
            </h2>
          </div>
          <Link
            href="/ogrodowe-abc"
            className="text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-900"
          >
            Zobacz wszystkie →
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latestGuides.map((g) => (
            <GuideCard key={g.slug} guide={g} />
          ))}
        </div>
      </section>
```

(`Link` is already imported in this file — line 3.)

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint src/app/example-9/page.tsx`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/example-9/page.tsx
git commit -m "feat(abc): homepage teaser linking to Ogrodowe ABC

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Mind upkeep + full verification

**Files:**
- Create: `kryscar-mind/map/zones/ogrodowe-abc.md`
- Create: `kryscar-mind/map/decisions/ogrodowe-abc-content-section.md`
- Modify: `kryscar-mind/map/zones/seo.md`, `layout-chrome.md`, `service-pages.md`, `winter-services.md`, `homepage-and-variants.md` (re-stamp `verifiedAt`)

- [ ] **Step 1: Full verification gate**

Run: `npm run check`
Expected: 0 errors. Only the 3 pre-existing benign `<img>` warnings (example-10 / CoverageMap) remain. If `npm run check` reports new issues, fix before continuing.

- [ ] **Step 2: Build + manual route check**

Run: `npm run build`
Expected: build succeeds; `/ogrodowe-abc` and 6 `/ogrodowe-abc/[slug]` routes are statically generated. Then `npm run start` (or `dev`) and verify:
- `/ogrodowe-abc` lists guides grouped by season; cards link through; heroes blur up.
- An article renders H1 + meta line + hero + sections + FAQ + related-offer links (resolve to real `/uslugi`/`/zima`) + "zobacz też".
- View source: `application/ld+json` includes `Article`, `FAQPage`, `BreadcrumbList`.
- `/sitemap.xml` includes `/ogrodowe-abc` + all 6 article URLs.
- Header "Ogrodowe ABC" link works; `/uslugi/koszenie` and `/zima/zimowe-zabezpieczanie-roslin` show a "Warto wiedzieć" block; homepage shows the teaser.

- [ ] **Step 3: Capture HEAD for verifiedAt stamping**

Run: `git rev-parse HEAD`
Use the printed hash as `<HEAD>` in the zone cards below.

- [ ] **Step 4: Create the zone card** `kryscar-mind/map/zones/ogrodowe-abc.md`

```markdown
---
type: zone
summary: "Ogrodowe ABC — seasonal gardening-guide content section (/ogrodowe-abc + /ogrodowe-abc/[slug]) and its Payload-ready guides data layer; two-way internal links with /uslugi & /zima."
tags: [feature, content, seo, data]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[service-pages]]", "[[winter-services]]", "[[seo]]", "[[image-loading]]", "[[layout-chrome]]", "[[homepage-and-variants]]"]
sources: ["[[2026-06-03-ogrodowe-abc-design]]"]
owns:
  routes: ["/ogrodowe-abc", "/ogrodowe-abc/[slug]"]
  anchors: ["symbol:getAllGuides", "symbol:getGuideBySlug", "symbol:getGuideSlugs", "symbol:getGuidesForService", "symbol:getGuidesForWinter", "symbol:Guide", "symbol:ArticleJsonLd"]
  globs: ["src/app/ogrodowe-abc/**", "src/lib/guides.ts", "src/components/ArticleJsonLd.tsx", "src/components/GuideCard.tsx"]
depends: ["[[service-pages]]", "[[winter-services]]", "[[image-loading]]", "[[layout-chrome]]"]
invariants:
  - rule: "Components consume guides only via async accessors — no component imports the GUIDES array (Payload-migration boundary)"
    enforcedBy: []
  - rule: "every guide img is a path present in BLUR_DATA so the hero always blurs up"
    enforcedBy: []
verifiedAt: "<HEAD>"
---
## Purpose
Seasonal long-tail SEO + reader content. Data flows through async accessors so a PayloadCMS swap touches only `guides.ts`. Two-way links feed the /uslugi & /zima offers.
## Anchors
`getAllGuides`, `getGuideBySlug`, `getGuidesForService`, `getGuidesForWinter`, `Guide`, `ArticleJsonLd`, `route:/ogrodowe-abc`, `route:/ogrodowe-abc/[slug]`.
## Lineage
sources → [[2026-06-03-ogrodowe-abc-design]]; content-section decision → [[ogrodowe-abc-content-section]].
```

- [ ] **Step 5: Create the decision record** `kryscar-mind/map/decisions/ogrodowe-abc-content-section.md`

```markdown
---
type: decision
summary: "The blog-style content section is named 'Ogrodowe ABC' (/ogrodowe-abc), built as a TS data layer behind async accessors (Approach A, like services/locations), with hero images reused from already-committed BLUR_DATA files (no Pixabay fetch)."
tags: [content, seo, data, decision]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[ogrodowe-abc]]", "[[service-pages]]", "[[image-loading]]"]
sources: ["[[2026-06-03-ogrodowe-abc-design]]"]
decided: 2026-06-03
supersededBy: ""
---
## Context
The site needed a reader/SEO content section targeting informational long-tail queries that feed the seasonal offers. Options: TS data layer (house pattern), MDX files, or a Payload collection now.
## Decision
Name = "Ogrodowe ABC", route `/ogrodowe-abc`. Approach A: a `src/lib/guides.ts` const array behind async accessors mirroring `services.ts`/`locations.ts` — fully static, Payload-migration-ready, no new deps. Launch with 6 cornerstone articles. Hero images reuse files already in `BLUR_DATA` (no Pixabay fetch). Surfaced via header nav, reverse "Warto wiedzieć" blocks on /uslugi & /zima, and a homepage teaser.
## Why
MDX breaks the repo's "data behind async accessors" convention and the clean Payload-migration story; standing up Payload now is premature (the whole repo is migration-ready, not migrated). Reusing committed imagery avoids a live API dependency and guarantees blur-up.
## Consequences
Long-form prose lives as typed strings in TS (verbose but consistent). When Payload lands, reimplement the `guides.ts` accessors only. New guides must use an image already in `BLUR_DATA` (or add one via `fetch-stock.sh` + `npm run blur`).
```

- [ ] **Step 6: Re-stamp `verifiedAt` on the 5 touched zones**

In each of these files set `verifiedAt: "<HEAD>"` (the hash from Step 3). Also add `[[ogrodowe-abc]]` to their `related:` list where natural:
- `kryscar-mind/map/zones/seo.md` (sitemap now enumerates guides — update the Purpose line to mention `/ogrodowe-abc`).
- `kryscar-mind/map/zones/layout-chrome.md` (header gained the nav link).
- `kryscar-mind/map/zones/service-pages.md` (reverse guides block).
- `kryscar-mind/map/zones/winter-services.md` (reverse guides block).
- `kryscar-mind/map/zones/homepage-and-variants.md` (homepage teaser).

- [ ] **Step 7: Regenerate the Mind index**

Run: `npm run mind`
Expected: regenerates `kryscar-mind/map/index.md` with the new `ogrodowe-abc` zone; no broken anchors. (If anchors break, the named symbols/routes/globs in the zone card must exactly match the code.)

- [ ] **Step 8: Commit the Mind changes**

```bash
git add kryscar-mind/
git commit -m "docs(mind): add ogrodowe-abc zone + decision; re-stamp touched zones

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-review (completed during planning)

**Spec coverage:** routes (T4/T5), data layer + 6 articles (T1), ArticleJsonLd Article+FAQPage+Breadcrumb (T2/T4), GuideCard (T3), sitemap (T6), header nav (T7), reverse links on /uslugi (T8) & /zima (T9), homepage teaser (T10), reused imagery (T1 img keys), error handling via `notFound()` (T4) and empty-list guards (T4/T8/T9/T10), Mind upkeep (T11). All spec sections map to a task.

**Placeholder scan:** No "TBD"/"add error handling" placeholders. The only deferred prose is the 5 article bodies, fully specified by fixed metadata + headings + per-section point lists + FAQ Q&A substance (see "Content authoring approach") — structure and SEO fields are locked, only sentence-level wording is authored at implementation, consistent with how `services.ts`/`locations.ts` content was produced.

**Type consistency:** `Guide`/`Season`/`SEASON_ORDER`/`SEASON_LABELS` defined in T1 and used identically in T3/T4/T5; accessor names (`getAllGuides`, `getGuideBySlug`, `getGuideSlugs`, `getGuidesForService`, `getGuidesForWinter`) consistent across T1/T4/T5/T6/T8/T9/T10; `CatalogItem` imported from `service-catalog`, `WinterService` from `winter.ts`; `ArticleJsonLd` prop names match T2↔T4; image `IMG` keys all verified present in `data.ts`.

## Out of scope (YAGNI)
MDX/Payload, categories/tags beyond `season`, pagination/search/RSS, author bios, an `aranzacja` guide, dedicated stock photography, touching `/ogrodnik` or other `/example-N` variants.
