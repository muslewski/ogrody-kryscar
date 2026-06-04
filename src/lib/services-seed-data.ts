// src/lib/services-seed-data.ts
/**
 * Seed-only data maps for the service catalog.
 *
 * These consts are the canonical source for the seed script that populates
 * PayloadCMS. They live here (not in catalog.ts / services.ts) so that
 * once the accessor layer migrates to read Payload, these maps can remain
 * used by the seed without creating unused-import lint errors.
 *
 * Pure data — no functions, no Payload imports.
 */
import { IMG } from "@/lib/data";
import type { ServicePricing } from "./pricing";

/** Pricing metadata seeded onto each service (generalizes calculator.ts). */
export const SERVICE_PRICING: Record<string, ServicePricing> = {
  koszenie: { kind: "area", basePrice: 180, pricePerM2: 0.35, recurring: true },
  pielegnacja: { kind: "area", basePrice: 280, pricePerM2: 0.45, recurring: true },
  grabienie: { kind: "area", basePrice: 220, pricePerM2: 0.35, recurring: false },
  sadzenie: { kind: "perUnit", basePrice: 350, pricePerUnit: 130, unitLabel: "roślina", recurring: false },
  ciecie: { kind: "perUnit", basePrice: 250, pricePerUnit: 18, unitLabel: "mb żywopłotu", recurring: false },
  porzadki: { kind: "area", basePrice: 400, pricePerM2: 0.5, recurring: false },
  aranzacja: { kind: "custom", recurring: false },
  rabaty: { kind: "custom", recurring: false },
};

export const SERVICE_IMAGES: Record<string, string> = {
  koszenie: IMG.lawnTexture,
  pielegnacja: IMG.gardenerYard,
  grabienie: IMG.autumn1,
  sadzenie: IMG.sprout,
  ciecie: IMG.hedgeShears,
  porzadki: IMG.autumn3,
  aranzacja: IMG.daffodils,
  rabaty: IMG.echinacea,
};

export const PRICES: Record<string, { from: string; duration: string }> = {
  koszenie: { from: "od 199 zł", duration: "~ 1 wizyta" },
  pielegnacja: { from: "od 349 zł", duration: "pakiet sezonowy" },
  grabienie: { from: "od 249 zł", duration: "~ 1 wizyta" },
  sadzenie: { from: "od 399 zł", duration: "wycena indywidualna" },
  ciecie: { from: "od 299 zł", duration: "~ 1 wizyta" },
  porzadki: { from: "od 449 zł", duration: "pakiet 2 wizyty" },
  aranzacja: { from: "wycena", duration: "projekt + realizacja" },
  rabaty: { from: "od 599 zł", duration: "projekt + sadzenie" },
};

export interface ServiceFaq {
  q: string;
  a: string;
}

/** Net-new landing-page content, keyed by the same slug as SERVICES. */
export interface ServicePageContent {
  slug: string;
  hero: string[];
  includes: string[];
  pricingNote: string;
  faq: ServiceFaq[];
  metaTitle: string;
  metaDescription: string;
}

export const SERVICE_CONTENT: ServicePageContent[] = [
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
