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

  // ===== Projects #2–#6 — authored from briefs (excerpt/scope/body) =====
  {
    slug: "rabata-bylinowa-niemcz",
    title: "Rabata bylinowa zamiast trawnika — Niemcz",
    category: "rabaty",
    excerpt:
      "Nudny fragment trawnika zamieniliśmy w kwitnącą rabatę bylinową, która cieszy oko przez większość sezonu.",
    location: "Niemcz",
    year: "2025",
    scope: [
      "Wytyczenie kształtu rabaty i wycięcie darni",
      "Wymiana i przygotowanie podłoża pod nasadzenia",
      "Dobór bylin i traw ozdobnych pod nasłonecznienie stanowiska",
      "Sadzenie w przemyślanej, wielopiętrowej kompozycji",
      "Ściółkowanie korą i wykończenie obrzeżem",
    ],
    pairs: [
      {
        before: "/img/projects/rabata-bylinowa-niemcz-before.jpg",
        after: "/img/projects/rabata-bylinowa-niemcz-after.jpg",
        caption: "Stan zastany i efekt po realizacji",
      },
    ],
    body: [
      "Klient miał kawałek trawnika, który niczego nie wnosił do ogrodu — trzeba go było kosić, a poza tym nic się tam nie działo. Zaproponowaliśmy, żeby zamienić go w rabatę bylinową: wytyczyliśmy jej kształt, wymieniliśmy podłoże i dobraliśmy rośliny pasujące do nasłonecznienia tego miejsca.",
      "Byliny i trawy ozdobne dobraliśmy tak, by coś kwitło przez większość sezonu, a sama rabata pozostała prosta w utrzymaniu. Ściółka z kory ogranicza chwasty i zatrzymuje wilgoć, dzięki czemu pielęgnacja sprowadza się do kilku zabiegów w roku.",
    ],
    relatedService: "rabaty",
    metaTitle: "Rabata bylinowa zamiast trawnika (Niemcz) — realizacja | Ogrody Kryscar",
    metaDescription:
      "Przed i po: fragment trawnika w Niemczu zamieniony w kwitnącą rabatę bylinową. Zakładanie rabat — Ogrody Kryscar, Bydgoszcz i okolice.",
  },

  {
    slug: "front-domu-fordon",
    title: "Front domu: od betonu do zieleni — Bydgoszcz-Fordon",
    category: "aranzacja",
    excerpt:
      "Betonowy, surowy front domu zamieniliśmy w reprezentacyjną zieleń, która od progu robi dobre wrażenie.",
    location: "Bydgoszcz",
    year: "2024",
    scope: [
      "Demontaż i ograniczenie betonowej nawierzchni",
      "Przygotowanie i wzbogacenie gruntu pod nasadzenia",
      "Nasadzenia frontowe: iglaki i krzewy ozdobne",
      "Pas zieleni wzdłuż elewacji ze ściółkowaniem",
      "Uporządkowane, reprezentacyjne wejście do domu",
    ],
    pairs: [
      {
        before: "/img/projects/front-domu-fordon-before.jpg",
        after: "/img/projects/front-domu-fordon-after.jpg",
        caption: "Stan zastany i efekt po realizacji",
      },
    ],
    body: [
      "Front tego domu w bydgoskim Fordonie był zdominowany przez beton — funkcjonalny, ale zupełnie pozbawiony charakteru. Klient chciał, żeby wejście witało gości zielenią, a nie szarą płytą. Zaczęliśmy od ograniczenia nawierzchni i przygotowania gruntu tam, gdzie miały pojawić się rośliny.",
      "Dobraliśmy iglaki i krzewy ozdobne, które są niskie w utrzymaniu i dobrze wyglądają o każdej porze roku — tak, by dom zyskał reprezentacyjny, „zielony” charakter bez utraty funkcjonalności. Pas zieleni wzdłuż elewacji domyka całość i sprawia, że wejście wygląda na zadbane.",
    ],
    relatedService: "aranzacja",
    metaTitle: "Front domu od betonu do zieleni (Fordon) — realizacja | Ogrody Kryscar",
    metaDescription:
      "Przed i po: betonowy front domu w bydgoskim Fordonie zamieniony w reprezentacyjną zieleń. Aranżacja ogrodu — Ogrody Kryscar.",
  },

  {
    slug: "uporzadkowany-ogrod-zoledowo",
    title: "Zaniedbany ogród → uporządkowana przestrzeń — Żołędowo",
    category: "aranzacja",
    excerpt:
      "Zaniedbany przez lata ogród uporządkowaliśmy i odmłodziliśmy, dzieląc go na czytelne strefy wypoczynku i zieleni.",
    location: "Żołędowo",
    year: "2025",
    scope: [
      "Uprzątnięcie i wywóz zalegającej, zarośniętej zieleni",
      "Cięcie i odmłodzenie krzewów, które warto było zachować",
      "Założenie nowego trawnika",
      "Wytyczenie stref wypoczynku i zieleni",
      "Ściółkowane rabaty wzdłuż granic działki",
    ],
    pairs: [
      {
        before: "/img/projects/uporzadkowany-ogrod-zoledowo-before.jpg",
        after: "/img/projects/uporzadkowany-ogrod-zoledowo-after.jpg",
        caption: "Stan zastany i efekt po realizacji",
      },
    ],
    body: [
      "Do tego ogrodu w Żołędowie wróciliśmy po dłuższej nieobecności właścicieli — przez ten czas zieleń rozrosła się bez kontroli, a przestrzeń straciła czytelność. Naszym zadaniem było uporządkować to, co dało się uratować, i uzupełnić ogród nowymi nasadzeniami.",
      "Część krzewów udało się odmłodzić cięciem, resztę zarośli uprzątnęliśmy i wywieźliśmy. Założyliśmy nowy trawnik i wprowadziliśmy czytelny podział na strefę wypoczynku i pas zieleni, dzięki czemu ogród znów stał się miejscem, w którym chce się przebywać.",
    ],
    relatedService: "aranzacja",
    metaTitle: "Uporządkowanie zaniedbanego ogrodu (Żołędowo) — realizacja | Ogrody Kryscar",
    metaDescription:
      "Przed i po: zaniedbany ogród w Żołędowie uporządkowany i odmłodzony. Aranżacja i pielęgnacja — Ogrody Kryscar, Bydgoszcz i okolice.",
  },

  {
    slug: "rabata-przy-tarasie-osielsko",
    title: "Rabata ozdobna przy tarasie — Osielsko",
    category: "rabaty",
    excerpt:
      "Pusty pas przy tarasie zamieniliśmy w ozdobną rabatę, która domyka i wykańcza strefę wypoczynku.",
    location: "Osielsko",
    year: "2024",
    scope: [
      "Wytyczenie rabaty wzdłuż krawędzi tarasu",
      "Przygotowanie i wzbogacenie podłoża",
      "Dobór roślin znoszących sąsiedztwo nawierzchni",
      "Sadzenie i ściółkowanie żwirem oraz korą",
      "Wykończenie estetycznym obrzeżem",
    ],
    pairs: [
      {
        before: "/img/projects/rabata-przy-tarasie-osielsko-before.jpg",
        after: "/img/projects/rabata-przy-tarasie-osielsko-after.jpg",
        caption: "Stan zastany i efekt po realizacji",
      },
    ],
    body: [
      "Przy tarasie ciągnął się pusty pas ziemi, który psuł wrażenie całej strefy wypoczynku. Klient chciał, żeby to miejsce zyskało wykończenie, ale bez roślin, które z czasem zarosłyby taras i utrudniały przejście.",
      "Dobraliśmy rośliny znoszące sąsiedztwo nagrzewającej się nawierzchni i takie, które ładnie się komponują, a przy tym nie rozrastają się nadmiernie. Ściółka żwirowo-korowa i równe obrzeże sprawiają, że rabata wygląda schludnie i naturalnie „domyka” strefę przy tarasie.",
    ],
    relatedService: "rabaty",
    metaTitle: "Rabata ozdobna przy tarasie (Osielsko) — realizacja | Ogrody Kryscar",
    metaDescription:
      "Przed i po: pas przy tarasie w Osielsku zamieniony w ozdobną rabatę. Zakładanie rabat — Ogrody Kryscar.",
  },

  {
    slug: "aranzacja-z-trawnikiem-biale-blota",
    title: "Aranżacja ogrodu z nowym trawnikiem — Białe Błota",
    category: "aranzacja",
    excerpt:
      "Na nowej działce w Białych Błotach urządziliśmy ogród od zera — z nowym trawnikiem, nasadzeniami i ścieżkami.",
    location: "Białe Błota",
    year: "2025",
    scope: [
      "Przygotowanie terenu na nowej działce",
      "Założenie trawnika i wyrównanie terenu",
      "Nasadzenia i założenie rabat",
      "Wytyczenie i wykonanie ścieżek",
      "Ściółkowanie i końcowe wykończenie ogrodu",
    ],
    pairs: [
      {
        before: "/img/projects/aranzacja-z-trawnikiem-biale-blota-before.jpg",
        after: "/img/projects/aranzacja-z-trawnikiem-biale-blota-after.jpg",
        caption: "Stan zastany i efekt po realizacji",
      },
    ],
    body: [
      "Ogród przy nowym domu na osiedlu w Białych Błotach zakładaliśmy praktycznie od zera — wokół był surowy grunt po budowie, bez trawnika, ścieżek i jakiejkolwiek zieleni. Zaczęliśmy od uporządkowania i przygotowania terenu pod całe założenie.",
      "Wykonaliśmy kompleksową aranżację: od gruntu, przez nowy trawnik i wytyczone ścieżki, po nasadzenia i ściółkowane rabaty. Efektem jest gotowy, urządzony ogród, który od pierwszego sezonu wygląda jak zadbana, przemyślana przestrzeń.",
    ],
    relatedService: "aranzacja",
    metaTitle: "Aranżacja ogrodu z nowym trawnikiem (Białe Błota) — realizacja | Ogrody Kryscar",
    metaDescription:
      "Przed i po: ogród urządzony od zera w Białych Błotach — nowy trawnik, nasadzenia i rabaty. Aranżacja ogrodu — Ogrody Kryscar.",
  },
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
