export const COMPANY = {
  name: "Ogrody Kryscar",
  shortName: "Kryscar",
  tagline: "Ogrodnictwo z pasją",
  phone: "+48 668 994 483",
  phoneRaw: "+48668994483",
  email: "ogrody@kryscar.pl",
  established: 2014,
  city: "Polska",
  description:
    "Profesjonalne usługi ogrodnicze — koszenie trawników, pielęgnacja ogrodu, grabienie liści, sadzenie roślin oraz wszystko, co związane z ogrodem.",
};

// Fictional address (Bydgoszcz). Replace with real one before launch.
export const ADDRESS = {
  street: "ul. Mostowa 5",
  postal: "85-110",
  city: "Bydgoszcz",
  fullLine: "ul. Mostowa 5, 85-110 Bydgoszcz",
  nip: "953-281-57-01", // KRYSCAR SP. Z O.O.
  legalName: "KRYSCAR Spółka z ograniczoną odpowiedzialnością",
  hours: "pn–pt 8:00–17:00 · sob 9:00–14:00",
};

// Social media. URLs point at platform homepages for now — swap with real
// profile URLs when accounts exist. The `lucide` field names a Lucide icon
// component (Instagram / Facebook / Youtube) used by the footer renderers.
export type SocialId = "instagram" | "facebook" | "youtube";
export const SOCIALS: { id: SocialId; label: string; url: string }[] = [
  { id: "instagram", label: "Instagram", url: "https://instagram.com/" },
  { id: "facebook", label: "Facebook", url: "https://facebook.com/" },
  { id: "youtube", label: "YouTube", url: "https://youtube.com/" },
];

// Legal / formal links — currently hash anchors since the actual pages
// haven't been built yet. Replace with `/polityka-prywatnosci` etc. once
// those routes exist.
export const LEGAL_LINKS = [
  { label: "Polityka prywatności", href: "#polityka-prywatnosci" },
  { label: "Regulamin", href: "#regulamin" },
  { label: "Cookies", href: "#cookies" },
];

export const SERVICES = [
  {
    slug: "koszenie",
    category: "trawnik",
    title: "Koszenie trawników",
    short: "Równe, zdrowe i gęste trawniki.",
    description:
      "Regularne koszenie z dobraną wysokością cięcia, mulczowanie i odbiór skoszonej trawy. Trawnik bez plam i kęp.",
    icon: "scissors",
  },
  {
    slug: "pielegnacja",
    category: "porzadki",
    title: "Pielęgnacja ogrodu",
    short: "Stała opieka przez cały sezon.",
    description:
      "Nawożenie, odchwaszczanie, aeracja, wertykulacja i drobne prace porządkowe. Ogród zawsze w formie.",
    icon: "leaf",
  },
  {
    slug: "grabienie",
    category: "porzadki",
    title: "Grabienie liści",
    short: "Czystość po jesieni i wiosną.",
    description:
      "Zbieranie i wywóz liści, czyszczenie rabat, podjazdów i tarasów. Przygotowanie ogrodu na zimę i wiosenny start.",
    icon: "rake",
  },
  {
    slug: "sadzenie",
    category: "sadzenie",
    title: "Sadzenie roślin",
    short: "Drzewa, krzewy, kwiaty, byliny.",
    description:
      "Dobór gatunków pod warunki działki, sadzenie z gwarancją przyjęcia, ściółkowanie i podlewanie startowe.",
    icon: "sprout",
  },
  {
    slug: "ciecie",
    category: "ciecie",
    title: "Cięcie i formowanie",
    short: "Krzewy, żywopłoty, drzewa ozdobne.",
    description:
      "Cięcia formujące, prześwietlające i sanitarne. Pielęgnacja iglaków oraz precyzyjne strzyżenie żywopłotów.",
    icon: "hedge",
  },
  {
    slug: "porzadki",
    category: "porzadki",
    title: "Wiosenne i jesienne porządki",
    short: "Kompleksowa zmiana sezonu.",
    description:
      "Otwarcie sezonu wiosną, zamknięcie jesienią. Wertykulacja, zabezpieczenie roślin, czyszczenie i regeneracja.",
    icon: "broom",
  },
  {
    slug: "aranzacja",
    category: "projekt",
    title: "Aranżacja ogrodu",
    short: "Pomysł, dobór roślin, realizacja.",
    description:
      "Pomoc w doborze roślin do stylu działki, kompozycje sezonowe i przesadzenia z istniejącego ogrodu.",
    icon: "compass",
  },
  {
    slug: "rabaty",
    category: "sadzenie",
    title: "Zakładanie rabat",
    short: "Nowe rabaty bylinowe i ozdobne.",
    description:
      "Wytyczenie, przygotowanie podłoża, sadzenie roślin w przemyślanych kompozycjach, ściółkowanie korą lub żwirem.",
    icon: "flowers",
  },
];

// Catalog filter categories. `id` is matched against each service's
// `category` field; `all` is the reset pill that shows everything.
export const CATEGORIES = [
  { id: "all", label: "Wszystkie" },
  { id: "trawnik", label: "Trawnik" },
  { id: "ciecie", label: "Cięcie" },
  { id: "sadzenie", label: "Sadzenie" },
  { id: "porzadki", label: "Porządki" },
  { id: "projekt", label: "Projekt" },
] as const;

// Optional promo badge per service slug, rendered on the catalog card.
// tone: "primary" = emerald, "accent" = amber.
export const SERVICE_BADGES: Record<
  string,
  { label: string; tone: "primary" | "accent" }
> = {
  pielegnacja: { label: "Najpopularniejsze", tone: "primary" },
  aranzacja: { label: "Projekt + realizacja", tone: "accent" },
};

export const PROCESS = [
  {
    no: "01",
    title: "Kontakt i wycena",
    desc: "Dzwonisz lub piszesz. Umawiamy się na bezpłatne oglądanie ogrodu i ustalamy zakres prac.",
  },
  {
    no: "02",
    title: "Plan działań",
    desc: "Dobieramy usługi pod sezon, stan ogrodu i Twoje oczekiwania. Otrzymujesz konkretny zakres i termin.",
  },
  {
    no: "03",
    title: "Realizacja",
    desc: "Pracujemy sprzętem profesjonalnym, dbając o porządek po pracy. Czyste, równe, gotowe.",
  },
  {
    no: "04",
    title: "Opieka sezonowa",
    desc: "Możesz zostać z nami na stałe — koszenie, pielęgnacja i porządki w stałym, dogodnym rytmie.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Anna Kowalska",
    role: "Klientka, dom jednorodzinny",
    quote:
      "Trawnik nigdy wcześniej tak nie wyglądał. Punktualnie, dokładnie, bez śladu po pracy.",
  },
  {
    name: "Marek Zieliński",
    role: "Klient indywidualny",
    quote:
      "Przejęli ogród w fatalnym stanie i przywrócili mu życie. Polecam każdemu, kto nie ma czasu na ogród.",
  },
  {
    name: "Wspólnota Mieszkaniowa Słoneczna",
    role: "Klient korporacyjny",
    quote:
      "Stała współpraca od trzech sezonów. Zawsze w terminie i bez problemów.",
  },
  {
    name: "Joanna Wiśniewska",
    role: "Ogród przy domku letniskowym",
    quote:
      "Otwarcie i zamknięcie sezonu z głowy. Wracamy do gotowego ogrodu — bezcenne.",
  },
  {
    name: "Tomasz Nowak",
    role: "Nowo posadzony ogród",
    quote:
      "Doradzili dobór roślin, posadzili, podpowiedzieli pielęgnację. Po dwóch latach wszystko rośnie idealnie.",
  },
];

// ⚠️ ASPIRATIONAL — kept for future use once we can back these numbers up
// with real data (review counts, project totals, retention %). Do NOT show
// on the live site until verified. Swap these back into STATS / the hero
// grid when the claims become true.
export const STATS_ASPIRATIONAL = [
  { value: "10+", label: "lat doświadczenia" },
  { value: "500+", label: "zadbanych ogrodów" },
  { value: "98%", label: "klientów wraca" },
  { value: "0", label: "porzuconych projektów" },
];

// Aspirational hero stat grid + rating row (used on /example-9 hero).
// Same rule: reinstate only when we have real reviews to support it.
export const HERO_STATS_ASPIRATIONAL = {
  grid: [
    { v: "10+", l: "lat" },
    { v: "500+", l: "ogrodów" },
    { v: "4.9", l: "ocena" },
  ],
  rating: { score: "4.9 / 5", reviews: "187 opinii klientów", area: "Polska, cały kraj" },
};

// Current, safe-to-publish stats. "10+ lat" is true (firma od 2014).
// The rest are factual / policy-based, not invented metrics.
export const STATS = [
  { value: "10+", label: "lat doświadczenia" },
  { value: "8", label: "rodzajów usług" },
  { value: "100%", label: "bezpłatna wycena" },
  { value: "Cały rok", label: "dostępni sezonowo" },
];

export const FAQ = [
  {
    q: "Czy obsługujecie tylko domy prywatne?",
    a: "Nie. Pracujemy zarówno przy ogrodach przydomowych, jak i terenach wspólnot, biur czy obiektów komercyjnych.",
  },
  {
    q: "Czy zajmujecie się systemami nawadniania?",
    a: "Systemy podlewania to specjalistyczna instalacja — nie wchodzą w zakres naszych usług. Możemy natomiast doradzić, kogo polecić.",
  },
  {
    q: "Jak wygląda wycena?",
    a: "Wycena jest bezpłatna. Najpierw rozmowa telefoniczna, potem wizyta na działce i konkretna oferta na piśmie.",
  },
  {
    q: "Czy podpisujecie umowy sezonowe?",
    a: "Tak — większość klientów wybiera obsługę cykliczną (np. koszenie raz na 1–2 tygodnie). Pracujemy też jednorazowo.",
  },
  {
    q: "Jak szybko możecie przyjechać?",
    a: "W sezonie zwykle w ciągu 3–7 dni. Stali klienci mają zarezerwowane terminy w grafiku.",
  },
];

// Team — fictional but realistic for the showcase. Portraits are
// self-hosted Pixabay stock under public/img/team/. Swap with real
// portraits when wiring this up for production.
export const TEAM = [
  {
    name: "Krzysztof Kryscar",
    role: "Założyciel · ogrodnik z 10-letnim stażem",
    bio: "Prowadzi firmę od 2014 r. Najmocniej czuje się przy nasadzeniach bylinowych i projektach od zera.",
    funFact: "Najdłuższe ścięcie żywopłotu: 320 m w jeden dzień.",
    photo: "/img/team/krzysztof.jpg",
  },
  {
    name: "Adam",
    role: "Koszenie i cięcia · operator sprzętu",
    bio: "Odpowiada za codzienne wizyty u stałych klientów. Lubi trawniki, których nie trzeba przekonywać do wzrostu.",
    funFact: "Pamięta godziny koszenia 84 ogrodów na pamięć.",
    photo: "/img/team/adam.jpg",
  },
  {
    name: "Marta",
    role: "Rabaty, nasadzenia i doradztwo",
    bio: "Zajmuje się projektowaniem rabat i wiosennymi nasadzeniami. Wie, która bylina sprawdzi się na każdej działce.",
    funFact: "Zna 120+ polskich nazw bylin rodzimych.",
    photo: "/img/team/marta.jpg",
  },
  {
    name: "Bartek",
    role: "Porządki sezonowe · transport",
    bio: "Jesień i wiosna to jego sezony. Wywóz liści, kompostowanie, przygotowanie ogrodu do snu i otwarcia sezonu.",
    funFact: "Zgrabił w jednym sezonie 12 ton liści.",
    photo: "/img/team/bartek.jpg",
  },
];

/**
 * Local stock imagery. Files live under `public/img/garden/<key>.jpg`.
 *
 * History: we used to hotlink Pixabay's `pixabay.com/get/<hash>_1280.jpg`
 * URLs but those are time-signed and expire after a day or two — every
 * image broke once a week. Self-hosting fixes that for good and is what
 * Pixabay's license actually requires anyway. Re-roll any single slot by
 * running `PIXABAY_KEY=... bash scripts/fetch-stock.sh` (the script skips
 * files that already exist, so delete one to refresh just that one).
 *
 * Some keys (greenHeart, lawnTractor, lawnCare, lawnRobot, hedgeHouse,
 * hedgeWorker, potting, iris, asters, sunflower, yellowFlower, tulips,
 * dahlia, pinkDaisies, coneflowers, aubrieta, bougainvillea, autumn4,
 * tool1–4, backyard4–8, meadow1–3, japaneseBridge) aren't referenced by
 * any current example page — they alias one of the downloaded files so
 * future code can still pull them without 404s.
 */
const G = "/img/garden";
export const IMG = {
  // Hero / wide landscape gardens
  parkGarden: `${G}/parkGarden.jpg`,
  parkPath: `${G}/parkPath.jpg`,
  japaneseBridge: `${G}/parkPath.jpg`, // alias
  greenHeart: `${G}/echinacea.jpg`, // alias

  // Lawn / mowing
  lawnTexture: `${G}/lawnTexture.jpg`,
  lawnSuburb: `${G}/lawnSuburb.jpg`,
  lawnMower1: `${G}/lawnMower1.jpg`,
  manMowing: `${G}/manMowing.jpg`,
  gardenerYard: `${G}/gardenerYard.jpg`,
  lawnTractor: `${G}/lawnMower1.jpg`, // alias
  lawnCare: `${G}/lawnTexture.jpg`, // alias
  lawnRobot: `${G}/lawnMower1.jpg`, // alias

  // Hedges
  hedge1: `${G}/hedge1.jpg`,
  hedgeShears: `${G}/hedgeShears.jpg`,
  hedgePark: `${G}/hedgePark.jpg`,
  hedgeMaze: `${G}/hedgeMaze.jpg`,
  hedgeHouse: `${G}/hedge1.jpg`, // alias
  hedgeWorker: `${G}/hedgeShears.jpg`, // alias

  // Planting / flowers
  sprout: `${G}/sprout.jpg`,
  daffodils: `${G}/daffodils.jpg`,
  snowdrop: `${G}/snowdrop.jpg`,
  echinacea: `${G}/echinacea.jpg`,
  cherry: `${G}/cherry.jpg`,
  tulipField: `${G}/tulipField.jpg`,
  potting: `${G}/sprout.jpg`, // alias
  iris: `${G}/echinacea.jpg`, // alias
  asters: `${G}/echinacea.jpg`, // alias
  sunflower: `${G}/echinacea.jpg`, // alias
  yellowFlower: `${G}/daffodils.jpg`, // alias
  tulips: `${G}/tulipField.jpg`, // alias
  dahlia: `${G}/echinacea.jpg`, // alias
  pinkDaisies: `${G}/echinacea.jpg`, // alias
  coneflowers: `${G}/echinacea.jpg`, // alias
  aubrieta: `${G}/echinacea.jpg`, // alias
  bougainvillea: `${G}/cherry.jpg`, // alias

  // Autumn
  autumn1: `${G}/autumn1.jpg`,
  autumn2: `${G}/autumn2.jpg`,
  autumn3: `${G}/autumn3.jpg`,
  autumn4: `${G}/autumn1.jpg`, // alias

  // Tools (alias to mowing imagery — no specific tool photo downloaded)
  tool1: `${G}/lawnMower1.jpg`,
  tool2: `${G}/hedgeShears.jpg`,
  tool3: `${G}/hedgeShears.jpg`,
  tool4: `${G}/lawnMower1.jpg`,

  // Backyard / landscape
  backyard1: `${G}/backyard1.jpg`,
  backyard2: `${G}/backyard2.jpg`,
  backyard3: `${G}/backyard3.jpg`,
  backyard9: `${G}/backyard9.jpg`,
  backyard4: `${G}/backyard1.jpg`, // alias
  backyard5: `${G}/backyard2.jpg`, // alias
  backyard6: `${G}/backyard3.jpg`, // alias
  backyard7: `${G}/backyard9.jpg`, // alias
  backyard8: `${G}/backyard1.jpg`, // alias

  // Meadow textures (alias to lawn — no specific meadow photo)
  meadow1: `${G}/lawnTexture.jpg`,
  meadow2: `${G}/lawnTexture.jpg`,
  meadow3: `${G}/lawnTexture.jpg`,
};
