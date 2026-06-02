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
