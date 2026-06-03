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

  // ===== Article #2 — Wiosenne porządki w ogrodzie =====
  {
    slug: "wiosenne-porzadki-w-ogrodzie",
    title: "Wiosenne porządki w ogrodzie — od czego zacząć",
    excerpt:
      "Wiosenne porządki w ogrodzie krok po kroku: kiedy zacząć, jak obudzić trawnik po zimie, co zrobić z rabatami i czego nie robić za wcześnie.",
    season: "wiosna",
    readMinutes: 6,
    img: IMG.gardenerYard,
    publishedAt: "2026-03-10",
    updatedAt: "2026-06-03",
    relatedServices: ["porzadki", "pielegnacja"],
    intro: [
      "Po zimie ogród budzi się powoli — a to, jak go w tym momencie poprowadzisz, decyduje o całym sezonie. Dobrze wykonane wiosenne porządki to równy trawnik, zdrowe rabaty i mniej pracy przez kolejne miesiące. Zaniedbany start mści się przez całe lato.",
      "W tym poradniku przeprowadzamy Cię przez wiosenne prace krok po kroku — od momentu, w którym warto zacząć, po kolejność czynności na trawniku i w rabatach. A jeśli wolisz mieć to z głowy, u stałych klientów robimy całe wiosenne porządki jednym wejściem.",
    ],
    sections: [
      {
        heading: "Kiedy zacząć wiosenne porządki",
        paragraphs: [
          "Z porządkami nie spiesz się na siłę. Najlepszy moment przychodzi, gdy gleba obeschnie po zimie i miną mocne przymrozki — w naszym, bydgoskim klimacie wypada to zwykle w marcu lub na początku kwietnia. Liczy się pogoda i stan gruntu, a nie sama data w kalendarzu.",
          "Najważniejsza zasada na start: nie wchodź na rozmokły ani zmarznięty trawnik. Każdy krok po nasiąkniętej wodą glebie ją ubija, a wyrywanie zamarzniętych pozostałości uszkadza korzenie trawy. Poczekaj, aż murawa będzie na tyle sucha, że można po niej chodzić bez zostawiania śladów.",
        ],
      },
      {
        heading: "Trawnik: grabienie, wertykulacja, pierwsze koszenie",
        paragraphs: [
          "Zacznij od dokładnego wygrabienia trawnika — usuwasz w ten sposób zalegające liście, resztki traw i warstwę filcu, która po zimie dusi murawę i zatrzymuje wilgoć przy ziemi. Jeśli filcu lub mchu jest dużo, warto przeprowadzić wertykulację, czyli nacięcie darni, które napowietrza glebę i pobudza trawę do gęstszego wzrostu.",
          "Pierwsze koszenie wykonuj wyżej niż zwykle — trawa po zimie jest osłabiona i zbyt krótkie cięcie cofa ją w rozwoju. W miejscach, gdzie murawa się przerzedziła albo wyłysiała, dosiej trawę i lekko ją zagrab; przy wilgotnej wiosennej glebie nowe nasiona przyjmują się najlepiej.",
        ],
      },
      {
        heading: "Rabaty i krzewy",
        paragraphs: [
          "W rabatach usuń zeschłe pędy i pozostawione na zimę liście, a byliny oraz trawy ozdobne przytnij nisko, robiąc miejsce dla nowych przyrostów. Rośliny, które okrywałeś na zimę agrowłókniną czy stroiszem, odkrywaj we właściwym momencie — zbyt długo trzymane pod osłoną przy ciepłych dniach zaparzają się i gniją.",
          "Gdy rabaty są już oczyszczone, rozłóż świeżą warstwę ściółki. Kora czy zrębki ograniczają parowanie wody, utrudniają kiełkowanie chwastów i nadają rabacie zadbany wygląd na cały sezon. To dobry moment również na pierwsze przesadzenia i uzupełnienie nasadzeń.",
        ],
      },
      {
        heading: "Czego nie robić za wcześnie",
        paragraphs: [
          "Najczęstszy wiosenny błąd to pośpiech. Nie odkrywaj wrażliwych roślin, dopóki utrzymuje się ryzyko przymrozków — nocny spadek temperatury potrafi zniszczyć obudzone pąki w jedną noc. Nie koś też trawnika zbyt krótko i nie nawoź zamarzniętej ani rozmokłej gleby, bo nawóz się nie wchłonie, a tylko spłynie.",
          "Warto też pamiętać o pożytecznych owadach, które przezimowały w ściółce i suchych łodygach. Nie sprzątaj rabat „pod grabie” w jeden dzień — daj zapylaczom i biedronkom czas na przebudzenie, a część suchych pędów zostaw w mniej widocznym miejscu jeszcze na kilka tygodni.",
        ],
      },
      {
        heading: "Plan na resztę sezonu",
        paragraphs: [
          "Wiosenne porządki to dopiero start. Ogród, który dobrze obudzisz, potrzebuje potem regularnej pielęgnacji — koszenia w stałym rytmie, nawożenia, odchwaszczania i drobnych cięć. Dzięki temu efekt wiosennej pracy utrzyma się aż do jesieni, a nie zniknie po kilku tygodniach.",
          "Jeśli nie chcesz pilnować tego wszystkiego samodzielnie, chętnie przejmiemy to za Ciebie. U stałych klientów w Bydgoszczy i okolicy łączymy wiosenne porządki ze stałą opieką nad ogrodem — jeden zespół zna Twoją posesję i prowadzi ją przez cały sezon.",
        ],
      },
    ],
    faq: [
      {
        q: "Kiedy zacząć wiosenne porządki w ogrodzie?",
        a: "Gdy gleba obeschnie po zimie i miną silne przymrozki — zwykle w marcu lub na początku kwietnia. Kieruj się pogodą i stanem gruntu, a nie sztywną datą; na rozmokły, zmarznięty trawnik lepiej nie wchodzić.",
      },
      {
        q: "Czy wertykulacja jest konieczna co roku?",
        a: "Nie zawsze. Jeśli na trawniku zebrało się dużo filcu lub mchu, wertykulacja bardzo pomaga. W zdrowej, gęstej murawie wystarczy ją przeprowadzać co 1–2 lata.",
      },
      {
        q: "Co zrobić z liśćmi i ściętymi pędami?",
        a: "Najlepiej skompostować je lub wywieźć. Część suchych łodyg i liści warto jednak zostawić na kilka tygodni jako schronienie dla pożytecznych owadów, które przezimowały w ogrodzie.",
      },
    ],
    metaTitle: "Wiosenne porządki w ogrodzie — od czego zacząć | Ogrody Kryscar",
    metaDescription:
      "Wiosenne porządki w ogrodzie krok po kroku: kiedy zacząć, grabienie i wertykulacja trawnika, cięcie bylin, odkrywanie roślin. Poradnik Ogrody Kryscar, Bydgoszcz.",
  },

  // ===== Article #3 — Co i kiedy sadzić w ogrodzie =====
  {
    slug: "co-i-kiedy-sadzic",
    title: "Co i kiedy sadzić w ogrodzie — kalendarz nasadzeń",
    excerpt:
      "Kalendarz nasadzeń: co sadzić wiosną, a co jesienią — drzewa, krzewy, byliny i cebulowe. Kiedy sadzić, żeby rośliny dobrze się przyjęły.",
    season: "wiosna",
    readMinutes: 7,
    img: IMG.sprout,
    publishedAt: "2026-03-25",
    updatedAt: "2026-06-03",
    relatedServices: ["sadzenie", "rabaty"],
    intro: [
      "O tym, czy roślina się przyjmie, często decyduje nie sama sadzonka, lecz termin jej posadzenia. Ta sama róża czy świerk wsadzone w odpowiednim momencie ruszą bez problemu, a posadzone w nieodpowiedniej porze będą walczyć o przetrwanie albo zwyczajnie zmarnieją.",
      "W ogrodzie mamy dwa główne okna nasadzeń — wiosenne i jesienne — i każde nadaje się do czegoś innego. W tym poradniku podpowiadamy, co i kiedy sadzić, żeby rośliny dobrze się przyjęły. A jeśli chcesz mieć pewność co do doboru i terminu, dobór oraz sadzenie roślin to nasza codzienna usługa.",
    ],
    sections: [
      {
        heading: "Dwa najlepsze okresy: wiosna i jesień",
        paragraphs: [
          "Wiosna to czas na rośliny wrażliwe na mróz oraz na byliny — sadzimy je po ustaniu przymrozków, gdy gleba się ogrzeje i nie grozi już przemarznięcie świeżych korzeni. Rośliny mają wtedy cały sezon na ukorzenienie się przed kolejną zimą.",
          "Jesień, zwłaszcza wrzesień i październik, jest wręcz idealna dla drzew i krzewów liściastych. Gleba jest jeszcze ciepła po lecie, powietrze chłodniejsze, a deszcze częstsze — korzenie zdążają się rozwinąć i przyjąć, zanim roślina wejdzie w spoczynek. Posadzone jesienią drzewa ruszają na wiosnę z dużą przewagą.",
        ],
      },
      {
        heading: "Co sadzić wiosną",
        paragraphs: [
          "Wiosną sadzimy byliny, trawy ozdobne oraz iglaki, które potrzebują pełnego sezonu na ukorzenienie. Rośliny jednoroczne i te najbardziej wrażliwe na chłód wsadzamy dopiero po „zimnych ogrodnikach”, czyli mniej więcej po połowie maja, gdy ryzyko nocnych przymrozków praktycznie znika.",
          "Osobna kategoria to rośliny kupowane w donicach, z uformowaną bryłą korzeniową. Takie sadzonki można sadzić niemal przez cały sezon wegetacyjny, bo przy przesadzaniu prawie nie naruszamy ich korzeni — warunkiem jest tylko regularne podlewanie po posadzeniu.",
        ],
      },
      {
        heading: "Co sadzić jesienią",
        paragraphs: [
          "Jesień to najlepszy moment na drzewa i krzewy liściaste, róże oraz wiele bylin — wszystkie zdążą się ukorzenić przed zimą. To również pora sadzenia żywopłotów z gołym korzeniem, które jesienią są tańsze i dobrze się przyjmują, o ile posadzimy je w wilgotną, jeszcze ciepłą glebę.",
          "Wrzesień, październik i początek listopada to także czas cebulowych roślin wiosennych — tulipanów, narcyzów i krokusów. Sadzimy je przed pierwszymi mrozami, żeby zdążyły wykształcić korzenie i zakwitły, gdy tylko ruszy wiosna.",
        ],
      },
      {
        heading: "Jak sadzić, żeby się przyjęło",
        paragraphs: [
          "Podstawa to dobrze przygotowany dół — wyraźnie szerszy niż bryła korzeniowa, z przekopaną i wzbogaconą ziemią na dnie. Roślinę sadzimy na właściwą głębokość: ani za płytko, ani za głęboko, tak żeby szyjka korzeniowa znalazła się na poziomie gruntu. Po posadzeniu obficie podlewamy — to podlanie startowe domyka glebę wokół korzeni.",
          "Na koniec rozłóż wokół rośliny ściółkę, która utrzyma wilgoć i ograniczy chwasty. Pamiętaj też, by dobierać gatunek do stanowiska: roślina słoneczna nie poradzi sobie w cieniu, a wymagająca przepuszczalnej gleby uschnie na ciężkiej, mokrej ziemi. Dobry dobór do warunków to połowa sukcesu.",
        ],
      },
      {
        heading: "Czego unikać",
        paragraphs: [
          "Nie sadź roślin w mróz ani w pełni upału i suszy — w obu przypadkach świeże korzenie nie mają szans się przyjąć. Unikaj też sadzenia zbyt głębokiego, bo przysypana szyjka korzeniowa gnije, a roślina słabnie. To dwa błędy, które najczęściej kosztują utratę sadzonki.",
          "Najczęstsza pomyłka po posadzeniu to zaniedbanie podlewania w pierwszym sezonie — młoda roślina nie ma jeszcze rozbudowanych korzeni i szybko cierpi na niedobór wody. Jeśli nie masz pewności, co i gdzie posadzić, chętnie dobierzemy rośliny do Twojego ogrodu w Bydgoszczy i okolicy i posadzimy je tak, by się przyjęły.",
        ],
      },
    ],
    faq: [
      {
        q: "Czy lepiej sadzić wiosną czy jesienią?",
        a: "To zależy od rośliny. Drzewa i krzewy liściaste najlepiej sadzić jesienią, gdy gleba jest jeszcze ciepła. Rośliny wrażliwe na mróz i jednoroczne sadzimy wiosną, po ustaniu przymrozków.",
      },
      {
        q: "Kiedy sadzić cebulki tulipanów?",
        a: "Jesienią — od września do listopada, przed pierwszymi mrozami. Cebulki zdążają wtedy wykształcić korzenie i zakwitają, gdy tylko na wiosnę ociepli się gleba.",
      },
      {
        q: "Czy rośliny z donicy można sadzić latem?",
        a: "Tak, rośliny z donic mają uformowaną bryłę korzeniową, więc znoszą sadzenie niemal przez cały sezon. Wymagają jednak regularnego podlewania, a sadzenia lepiej unikać w najbardziej upalne dni.",
      },
    ],
    metaTitle: "Co i kiedy sadzić w ogrodzie — kalendarz nasadzeń | Ogrody Kryscar",
    metaDescription:
      "Kalendarz nasadzeń: co sadzić wiosną, a co jesienią — drzewa, krzewy, byliny, cebulowe. Jak sadzić, żeby się przyjęło. Poradnik Ogrody Kryscar, Bydgoszcz.",
  },

  // ===== Article #4 — Kiedy ciąć żywopłot i krzewy ozdobne =====
  {
    slug: "kiedy-ciac-zywoplot",
    title: "Kiedy ciąć żywopłot i krzewy ozdobne",
    excerpt:
      "Kiedy przycinać żywopłot i krzewy ozdobne, żeby ładnie się zagęszczały i kwitły? Terminy cięcia formującego, prześwietlającego i po kwitnieniu.",
    season: "lato",
    readMinutes: 5,
    img: IMG.hedgeShears,
    publishedAt: "2026-05-20",
    updatedAt: "2026-06-03",
    relatedServices: ["ciecie"],
    intro: [
      "Cięcie to jeden z tych zabiegów, w których termin znaczy więcej niż sama technika. Ten sam krzew przycięty w odpowiednim momencie odwdzięczy się gęstwiną i obfitym kwitnieniem, a cięty w złej porze albo nie zakwitnie, albo niepotrzebnie się osłabi.",
      "Właściwy termin zależy od dwóch rzeczy: gatunku rośliny i celu, w jakim tniesz. W tym poradniku porządkujemy, kiedy ciąć żywopłoty, krzewy kwitnące i kiedy robić cięcie sanitarne. A jeśli wolisz nie wspinać się na drabinę z nożycami, cięcie i formowanie roślin to nasza usługa.",
    ],
    sections: [
      {
        heading: "Żywopłoty formowane",
        paragraphs: [
          "Główne cięcie formujące żywopłotu wykonuje się późną wiosną lub wczesnym latem, gdy roślina wypuści pierwszy przyrost — przycięcie pobudza ją wtedy do gęstego rozkrzewienia się od dołu. Drugie, korygujące cięcie warto wykonać pod koniec lata, żeby żywopłot wszedł w jesień równy i zwarty.",
          "Żywopłoty iglaste tnij delikatniej niż liściaste i nie wchodź głęboko w stare drewno. Pamiętaj też o okresie lęgowym ptaków — w środku wiosny i na początku lata w gęstych żywopłotach często gnieżdżą się ptaki, więc przed mocnym cięciem warto sprawdzić, czy nikt tam nie mieszka.",
        ],
      },
      {
        heading: "Krzewy kwitnące — po kwitnieniu",
        paragraphs: [
          "Część krzewów zawiązuje pąki kwiatowe już rok wcześniej, na pędach zeszłorocznych — należą do nich między innymi forsycja czy lilak, czyli popularny bez. Takie gatunki tnij tuż po przekwitnięciu, gdy kwiaty zwiędną, a nowe pąki nie zdążyły się jeszcze zawiązać.",
          "Jeśli przytniesz je w złym momencie — na przykład wczesną wiosną albo jesienią — zetniesz właśnie te pędy, które miały zakwitnąć w przyszłym roku. Stąd częsty zawód: krzew rośnie zdrowo, a kwiatów jak na lekarstwo. To niemal zawsze efekt cięcia w niewłaściwej porze.",
        ],
      },
      {
        heading: "Krzewy kwitnące na pędach tegorocznych",
        paragraphs: [
          "Zupełnie inaczej traktujemy krzewy, które kwitną na pędach wyrastających w bieżącym sezonie — takie jak budleja, hortensja bukietowa czy wiele odmian róż. Te tniemy wczesną wiosną, jeszcze przed ruszeniem wegetacji, mocno skracając zeszłoroczne pędy.",
          "Takie wiosenne cięcie nie tylko nie szkodzi kwitnieniu, ale wręcz je pobudza — roślina wypuszcza silne, młode pędy zakończone obfitymi kwiatami. Im pewniej przytniesz te gatunki na wiosnę, tym bujniej zakwitną latem.",
        ],
      },
      {
        heading: "Cięcie sanitarne i prześwietlające",
        paragraphs: [
          "Niezależnie od pory kwitnienia, każdej roślinie służy cięcie sanitarne — usuwanie pędów chorych, martwych, połamanych oraz tych, które krzyżują się i ocierają o siebie. Taki zabieg można wykonywać praktycznie przez cały rok, najlepiej poza okresami silnych mrozów.",
          "Cięcie prześwietlające idzie o krok dalej: rozluźnia zagęszczoną koronę, wpuszcza do środka światło i powietrze. Lepiej doświetlona, przewiewna roślina rzadziej choruje i równomierniej kwitnie, a cały krzew czy drzewo zyskuje ładniejszy, naturalny pokrój.",
        ],
      },
      {
        heading: "Zasady i bezpieczeństwo",
        paragraphs: [
          "Niezależnie od terminu, tnij ostrymi i czystymi narzędziami — tępe nożyce miażdżą pędy zamiast je ciąć, a brudne przenoszą choroby z rośliny na roślinę. Nie pracuj w upale ani w mróz: rany cięte w skrajnych temperaturach goją się gorzej i łatwiej zakażają.",
          "Iglaków nie skracaj drastycznie — większość z nich nie odbija ze starego drewna, więc cięcie poza strefę zielonych igieł zostawia trwałe, brązowe łyse plamy. Jeśli masz wysoki żywopłot albo nie chcesz zajmować się wywozem gałęzi, zrobimy to za Ciebie — z odpowiednim sprzętem i bez stania na chwiejnej drabinie.",
        ],
      },
    ],
    faq: [
      {
        q: "Kiedy ciąć żywopłot?",
        a: "Żywopłot formowany tnie się głównie późną wiosną lub wczesnym latem, po pierwszym przyroście, a korygująco pod koniec lata. Unikaj cięcia w upały i w okresie lęgowym ptaków.",
      },
      {
        q: "Dlaczego mój krzew nie kwitnie po cięciu?",
        a: "Najprawdopodobniej był cięty w złym terminie. Gatunki kwitnące na pędach zeszłorocznych, jak forsycja czy lilak, trzeba ciąć zaraz po przekwitnięciu — inaczej usuwasz pędy, które miały zakwitnąć w kolejnym roku.",
      },
      {
        q: "Czy można mocno przyciąć iglaki?",
        a: "Tylko ostrożnie. Większość iglaków nie odbija ze starego drewna, więc nie tnij poza strefę zielonych igieł — w przeciwnym razie zostaną trwałe, brązowe łysiny.",
      },
    ],
    metaTitle: "Kiedy ciąć żywopłot i krzewy ozdobne — poradnik | Ogrody Kryscar",
    metaDescription:
      "Kiedy przycinać żywopłot, krzewy kwitnące i iglaki, żeby ładnie rosły i kwitły? Terminy cięcia formującego i po kwitnieniu. Poradnik Ogrody Kryscar, Bydgoszcz.",
  },

  // ===== Article #5 — Jak przygotować ogród na zimę =====
  {
    slug: "jak-przygotowac-ogrod-na-zime",
    title: "Jak przygotować ogród na zimę",
    excerpt:
      "Jak przygotować ogród na zimę krok po kroku: grabienie liści, zabezpieczanie roślin, ostatnie koszenie i porządki, które ułatwią wiosenny start.",
    season: "jesien",
    readMinutes: 6,
    img: IMG.wrappedPlants,
    publishedAt: "2026-05-28",
    updatedAt: "2026-06-03",
    relatedServices: ["porzadki", "grabienie"],
    relatedWinter: ["zimowe-zabezpieczanie-roslin"],
    intro: [
      "To, jak zamkniesz sezon jesienią, w dużej mierze zdecyduje o tym, w jakim stanie ogród wyjdzie z zimy. Dobrze zabezpieczone rośliny przetrwają mrozy bez strat, a uprzątnięty trawnik i rabaty wiosną ruszą szybciej i zdrowiej. Kilka jesiennych prac oszczędza mnóstwo wiosennego ratowania.",
      "W tym poradniku pokazujemy, co i w jakiej kolejności zrobić w ogrodzie przed zimą — od liści i ostatniego koszenia po okrywanie roślin i odwodnienie instalacji. A jeśli wolisz to zlecić, zabezpieczanie roślin i jesienne porządki bierzemy na siebie jednym wejściem.",
    ],
    sections: [
      {
        heading: "Liście i ostatnie koszenie",
        paragraphs: [
          "Zacznij od liści — gruba warstwa zalegająca na trawniku dusi trawę, odcina ją od światła i sprzyja chorobom grzybowym oraz pleśni śniegowej, która wiosną zostawia po sobie żółte, wyłysiałe placki. Liście wygrabiaj na bieżąco i wywoź albo kompostuj, zamiast czekać, aż przykryje je śnieg.",
          "Ostatnie koszenie sezonu wykonaj nieco krócej niż zwykle — zbyt długa trawa pod śniegiem zbija się i gnije, a zbyt krótka jest osłabiona. Umiarkowanie skrócona murawa najlepiej przechodzi przez zimę i równo rusza na wiosnę.",
        ],
      },
      {
        heading: "Zabezpieczanie wrażliwych roślin",
        paragraphs: [
          "Najwięcej uwagi wymagają rośliny wrażliwe na mróz: róże, hortensje, młode nasadzenia i gatunki zimozielone. Okrywamy je agrowłókniną lub stroiszem, kopczykujemy nasadę i ściółkujemy strefę korzeni, żeby ochronić ją przed przemarznięciem. Iglaki i rośliny o luźnym pokroju warto związać, zanim obciąży je mokry śnieg.",
          "Pamiętaj też o pniach młodych drzew — wrażliwa kora pęka od różnicy temperatur i bywa ogryzana przez zwierzęta, dlatego warto ją osłonić. To zabieg, który łatwo odłożyć „na później”, a w mroźną zimę decyduje o przetrwaniu rośliny. Jeśli nie masz na to czasu, zajmiemy się zimowym zabezpieczaniem roślin w Twoim ogrodzie.",
        ],
      },
      {
        heading: "Rabaty i byliny",
        paragraphs: [
          "W rabatach przytnij przekwitłe byliny, ale nie wszystkie pod korzeń — część suchych kwiatostanów i traw ozdobnych warto zostawić. Stanowią zimowy pokarm i schronienie dla ptaków, a oszronione ładnie ożywiają ogród w szare, bezlistne miesiące.",
          "Oczyść rabaty z chwastów, zanim te zdążą się rozsiać, i rozłóż warstwę ściółki, która ochroni korzenie przed mrozem oraz ograniczy wahania temperatury gleby. Tak przygotowane rabaty wiosną wymagają już tylko lekkiego odświeżenia.",
        ],
      },
      {
        heading: "Woda, narzędzia, system nawadniania",
        paragraphs: [
          "Przed pierwszymi mrozami zadbaj o wszystko, co ma kontakt z wodą. Opróżnij i schowaj węże oraz zraszacze, a system nawadniający odwodnij — woda zamarzająca w przewodach rozsadza je od środka. Pamiętaj też o odcięciu i zabezpieczeniu zewnętrznych kranów.",
          "To również dobry moment, by uporządkować narzędzia: oczyść je z ziemi, osusz i naoliw metalowe części, żeby przez zimę nie pokryły się rdzą. Wiosną sięgniesz po sprawny, gotowy do pracy sprzęt zamiast tracić czas na jego ratowanie.",
        ],
      },
      {
        heading: "Po co to wszystko",
        paragraphs: [
          "Cały ten jesienny wysiłek sprowadza się do dwóch rzeczy: mniej strat zimą i łatwiejszy start wiosną. Zabezpieczone rośliny przetrwają mrozy, uprzątnięty trawnik nie ucierpi pod śniegiem, a odwodniona instalacja dotrwa do kolejnego sezonu w jednym kawałku.",
          "U stałych klientów w Bydgoszczy i okolicy łączymy zimowe zabezpieczanie roślin z jesiennymi porządkami w jednym wejściu — szybciej, taniej i bez Twojego udziału. Więcej o zabezpieczaniu ogrodu na zimę znajdziesz w naszej ofercie zimowej.",
        ],
      },
    ],
    faq: [
      {
        q: "Które rośliny trzeba okrywać na zimę?",
        a: "Przede wszystkim gatunki zimozielone, młode nasadzenia, róże, hortensje oraz wrażliwe iglaki. Wiele bylin i roślin rodzimych radzi sobie z mrozem samodzielnie i nie wymaga okrywania.",
      },
      {
        q: "Czy trzeba wygrabiać liście z trawnika?",
        a: "Tak. Gruba warstwa liści dusi trawę i sprzyja pleśni śniegowej, która wiosną zostawia wyłysiałe placki. Z rabat część liści można za to zostawić jako naturalną ściółkę chroniącą korzenie.",
      },
      {
        q: "Kiedy zabezpieczać rośliny na zimę?",
        a: "Późną jesienią, przy pierwszych przymrozkach, ale jeszcze przed nadejściem mrozów. Zbyt wczesne okrycie, gdy jest ciepło, grozi zaparzeniem i gniciem roślin pod osłoną.",
      },
    ],
    metaTitle: "Jak przygotować ogród na zimę — poradnik krok po kroku | Ogrody Kryscar",
    metaDescription:
      "Jak przygotować ogród na zimę: grabienie liści, zabezpieczanie i okrywanie roślin, ostatnie koszenie, rabaty i nawadnianie. Poradnik Ogrody Kryscar, Bydgoszcz.",
  },

  // ===== Article #6 — Świąteczne oświetlenie ogrodu =====
  {
    slug: "swiateczne-oswietlenie-ogrodu",
    title: "Świąteczne oświetlenie ogrodu — jak zaplanować",
    excerpt:
      "Jak zaplanować świąteczne oświetlenie ogrodu: jakie lampki wybrać, na co zwrócić uwagę przy zasilaniu i bezpieczeństwie, jak rozmieścić iluminację.",
    season: "zima",
    readMinutes: 4,
    img: IMG.gardenLights,
    publishedAt: "2026-05-30",
    updatedAt: "2026-06-03",
    relatedServices: [],
    relatedWinter: ["swiateczne-oswietlenie"],
    intro: [
      "Dobrze zaplanowana świąteczna iluminacja potrafi odmienić ogród — a przede wszystkim jest bezpieczna i nie psuje się w połowie grudnia. Cała sztuka polega na tym, by dobrać właściwy sprzęt, rozsądnie go rozmieścić i poprawnie podłączyć, zamiast oplatać wszystko, co stoi w ogrodzie.",
      "W tym krótkim poradniku zbieramy najważniejsze rzeczy, na które warto zwrócić uwagę przy planowaniu oświetlenia na zewnątrz. A jeśli nie chcesz wspinać się po drabinie z motkiem lampek, montaż i demontaż iluminacji bierzemy na siebie w ramach oferty zimowej.",
    ],
    sections: [
      {
        heading: "Lampki zewnętrzne, nie wewnętrzne",
        paragraphs: [
          "Podstawowa zasada bezpieczeństwa: na zewnątrz montujemy wyłącznie oprawy przeznaczone do użytku zewnętrznego, z odpowiednią klasą szczelności IP. Lampki „pokojowe” nie są odporne na deszcz, śnieg i mróz — ich użycie na dworze grozi zwarciem, a nawet pożarem.",
          "Najlepiej sprawdzają się lampki LED — pobierają wyraźnie mniej prądu, prawie się nie nagrzewają i są przez to bezpieczniejsze oraz tańsze w eksploatacji. Przed sezonem koniecznie sprawdź stan przewodów i wtyczek; popękana izolacja czy nadgryziony kabel dyskwalifikują lampki z użytku.",
        ],
      },
      {
        heading: "Co i jak podświetlić",
        paragraphs: [
          "Mniej znaczy więcej. Zamiast podświetlać wszystko naraz, wybierz dwa, trzy akcenty — efektowne drzewo, wejście do domu, fragment żywopłotu albo elewacji. Tak zaplanowana iluminacja wygląda elegancko, a nie chaotycznie, i jest łatwiejsza w montażu.",
          "Postaw na spójną barwę światła w całym ogrodzie — ciepła biel daje przytulny, klasyczny klimat, zimna biel efekt bardziej nowoczesny, ale ich mieszanie zwykle wygląda przypadkowo. Do dyspozycji masz różne formy: świetlne kurtyny, lampki oplatające gałęzie czy punktowe reflektory podkreślające pojedyncze elementy.",
        ],
      },
      {
        heading: "Zasilanie i bezpieczeństwo",
        paragraphs: [
          "Oświetlenie podłączaj wyłącznie do zewnętrznych gniazd z bolcem i zabezpieczeniem różnicowoprądowym — to ono w razie usterki odetnie prąd, zanim dojdzie do porażenia. Używaj przedłużaczy przeznaczonych do pracy na zewnątrz i mocowań odpornych na wiatr oraz ciężar śniegu.",
          "Nie przeciążaj jednego obwodu zbyt dużą liczbą lampek — to częsta przyczyna przepaleń i zadziałania bezpieczników. Warto wpiąć całość w timer lub czujnik zmierzchowy: iluminacja włączy się sama o zmroku i zgaśnie w nocy, oszczędzając prąd i wydłużając żywotność lampek.",
        ],
      },
      {
        heading: "Montaż i demontaż",
        paragraphs: [
          "Najwięcej ryzyka przy iluminacji wiąże się nie z prądem, lecz z pracą na wysokości. Jeśli wieszasz lampki na drzewie czy elewacji, zadbaj o stabilną drabinę i asekurację — pośpiech i chwiejne podłoże to najczęstsza przyczyna upadków. Montaż zaplanuj z wyprzedzeniem, najlepiej już w listopadzie, zanim przyjdą mrozy i śnieg.",
          "Po sezonie nie zostawiaj lampek na zewnątrz miesiącami — starannie je zdejmij, osusz i spakuj, a posłużą Ci przez wiele kolejnych zim. Jeśli wolisz mieć to z głowy, zrobimy to za Ciebie: montaż i demontaż świątecznego oświetlenia bez stania na drabinie znajdziesz w naszej ofercie zimowej.",
        ],
      },
    ],
    faq: [
      {
        q: "Jakie lampki na zewnątrz wybrać?",
        a: "Wyłącznie oprawy przeznaczone do użytku zewnętrznego, z odpowiednią klasą szczelności IP. Najlepiej sprawdzają się lampki LED — są energooszczędne, słabo się nagrzewają i przez to bezpieczniejsze.",
      },
      {
        q: "Jak bezpiecznie podłączyć oświetlenie w ogrodzie?",
        a: "Przez zewnętrzne gniazdo z zabezpieczeniem różnicowoprądowym, używając przedłużaczy do zastosowań zewnętrznych i nie przeciążając obwodu liczbą lampek. Warto dodać timer lub czujnik zmierzchowy.",
      },
      {
        q: "Kiedy zamówić montaż iluminacji?",
        a: "Najlepiej z wyprzedzeniem, już w listopadzie. Terminy tuż przed świętami schodzą najszybciej, a wcześniejszy montaż pozwala uniknąć pracy w mrozie i śniegu.",
      },
    ],
    metaTitle: "Świąteczne oświetlenie ogrodu — jak zaplanować i zamontować | Ogrody Kryscar",
    metaDescription:
      "Jak zaplanować świąteczne oświetlenie ogrodu: jakie lampki wybrać, bezpieczne zasilanie i rozmieszczenie iluminacji. Poradnik Ogrody Kryscar, Bydgoszcz.",
  },
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
