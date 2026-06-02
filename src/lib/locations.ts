/**
 * Location content for the per-city SEO landing pages (/ogrodnik/[slug]).
 *
 * MIGRATION (PayloadCMS): this module is the ONLY place that knows the data
 * source. The `Location` interface mirrors a future Payload `locations`
 * collection (slug:text-unique, name/gmina/powiat:text, km/lat/lng:number,
 * zip/travel:text, nearbyAreas:array<{value:text}>, intro:array<{paragraph}>
 * or richText, localNote:textarea, faq:array<{q:text,a:textarea}>,
 * metaTitle:text + metaDescription:textarea in an `seo` group).
 * To migrate: reimplement the three async accessors below to call
 * `payload.find(...)` / lookup by slug. NOTHING ELSE in the app changes —
 * pages/components consume only these accessors (await) or receive props.
 */

export interface LocationFaq {
  q: string;
  a: string;
}

export interface Location {
  slug: string;
  name: string;
  gmina: string;
  powiat: string;
  km: number;
  travel: string;
  lat: number;
  lng: number;
  zip: string;
  nearbyAreas: string[];
  intro: string[];
  localNote: string;
  faq: LocationFaq[];
  metaTitle: string;
  metaDescription: string;
}

const LOCATIONS: Location[] = [
  {
    slug: "bydgoszcz",
    name: "Bydgoszcz",
    gmina: "Bydgoszcz",
    powiat: "Bydgoszcz (miasto na prawach powiatu)",
    km: 0,
    travel: "nasza baza — dojeżdżamy tego samego dnia",
    lat: 53.1235,
    lng: 18.0084,
    zip: "85-001",
    nearbyAreas: ["Fordon", "Osowa Góra", "Szwederowo", "Bartodzieje", "Miedzyń"],
    intro: [
      "Ogrody Kryscar to ekipa ogrodnicza z bazą w Bydgoszczy. Koszenie trawników, pielęgnację zieleni i zakładanie ogrodów realizujemy w całym mieście — od Fordonu po Osową Górę.",
      "Działamy tu od 2014 roku, więc znamy lokalne warunki: gleby, nasłonecznienie osiedli domów jednorodzinnych i tempo, w jakim trawniki rosną w bydgoskim sezonie.",
    ],
    localNote:
      "W Bydgoszczy obsługujemy zarówno ogrody przydomowe, jak i tereny wspólnot oraz obiektów komercyjnych. Stała opieka sezonowa dostępna z gwarantowanym terminem w grafiku.",
    faq: [
      {
        q: "Jak szybko przyjedziecie na koszenie w Bydgoszczy?",
        a: "W granicach miasta zwykle tego samego lub następnego dnia roboczego — Bydgoszcz to nasza baza, więc nie doliczamy kosztów dojazdu.",
      },
    ],
    metaTitle: "Ogrodnik Bydgoszcz — koszenie, pielęgnacja, zakładanie ogrodów | Ogrody Kryscar",
    metaDescription:
      "Usługi ogrodnicze w Bydgoszczy: koszenie trawników, pielęgnacja ogrodu, cięcie krzewów, sadzenie i porządki. Bezpłatna wycena. Zadzwoń: +48 668 994 483.",
  },
  {
    slug: "niemcz",
    name: "Niemcz",
    gmina: "Osielsko",
    powiat: "bydgoski",
    km: 8,
    travel: "ok. 15 minut od naszej bazy w Bydgoszczy",
    lat: 53.1736,
    lng: 18.0950,
    zip: "86-032",
    nearbyAreas: ["Osielsko", "Żołędowo", "Maksymilianowo", "Jarużyn", "Myślęcinek"],
    intro: [
      "Niemcz w gminie Osielsko to jedna z miejscowości, do których dojeżdżamy najczęściej — dzieli nas od niej zaledwie kilkanaście minut drogi z Bydgoszczy.",
      "To okolica zadbanych ogrodów przydomowych, gdzie regularne koszenie i pielęgnacja żywopłotów ma realne znaczenie dla wyglądu całej posesji.",
    ],
    localNote:
      "W Niemczu i okolicy obsługujemy głównie domy jednorodzinne — od jednorazowego koszenia po stałą opiekę nad ogrodem przez cały sezon.",
    faq: [
      {
        q: "Czy dojeżdżacie do Niemcza?",
        a: "Tak, regularnie. Niemcz leży ok. 8 km od naszej bazy w Bydgoszczy — dojeżdżamy w około 15 minut, także do sąsiednich Osielska i Żołędowa.",
      },
    ],
    metaTitle: "Ogrodnik Niemcz (gm. Osielsko) — usługi ogrodnicze | Ogrody Kryscar",
    metaDescription:
      "Usługi ogrodnicze w Niemczu i gminie Osielsko: koszenie trawników, pielęgnacja, cięcie żywopłotów, sadzenie. Dojazd ok. 15 min. Zadzwoń: +48 668 994 483.",
  },
  {
    slug: "solec-kujawski",
    name: "Solec Kujawski",
    gmina: "Solec Kujawski",
    powiat: "bydgoski",
    km: 18,
    travel: "trasą wzdłuż Wisły zajmuje nam około 25 minut",
    lat: 53.0857,
    lng: 18.2336,
    zip: "86-050",
    nearbyAreas: ["Otorowo", "Przyłubie", "Wypaleniska", "Makowiska", "Chrośna"],
    intro: [
      "Solec Kujawski leży na prawym brzegu Wisły, w powiecie bydgoskim, i jest jednym ze stałych kierunków naszych wyjazdów. Otaczające miasto lasy sprawiają, że posesje bywają mocno zacienione, a trawniki wymagają innego rytmu pielęgnacji niż w otwartym terenie.",
      "Obsługujemy tu zarówno ogrody na nowych osiedlach domów jednorodzinnych, jak i starsze działki w pobliżu centrum. Doradzamy, jak prowadzić trawnik i rabaty w sąsiedztwie sosnowego boru.",
    ],
    localNote:
      "W Solcu Kujawskim często pracujemy na działkach graniczących z lasem — pomagamy uporać się z igliwiem, samosiewami i zacienieniem, które utrudnia utrzymanie gęstej murawy.",
    faq: [
      {
        q: "Czy obsługujecie posesje w Solcu Kujawskim przy lesie?",
        a: "Tak. Działki sąsiadujące z borem to w Solcu codzienność — przyjeżdżamy z odpowiednim sprzętem na grabienie igliwia i koszenie zacienionych trawników. Dojazd zajmuje nam około 25 minut.",
      },
    ],
    metaTitle: "Ogrodnik Solec Kujawski — koszenie i pielęgnacja zieleni | Ogrody Kryscar",
    metaDescription:
      "Usługi ogrodnicze w Solcu Kujawskim: koszenie trawników, grabienie, cięcie krzewów i sadzenie. Działki przy lesie nasza specjalność. Tel.: +48 668 994 483.",
  },
  {
    slug: "osielsko",
    name: "Osielsko",
    gmina: "Osielsko",
    powiat: "bydgoski",
    km: 9,
    travel: "raptem kwadrans jazdy na północ od Bydgoszczy",
    lat: 53.1869,
    lng: 18.0686,
    zip: "86-031",
    nearbyAreas: ["Niemcz", "Żołędowo", "Maksymilianowo", "Jarużyn", "Bydgoszcz-Fordon"],
    intro: [
      "Osielsko to siedziba gminy, w której obsługujemy wyjątkowo dużo ogrodów — okoliczne osiedla domów jednorodzinnych rosną z roku na rok, a wraz z nimi potrzeby pielęgnacyjne.",
      "Tutejsze posesje to często duże, reprezentacyjne działki, na których liczy się równy trawnik, zadbany żywopłot i przemyślane rabaty. Dojeżdżamy regularnie, więc łatwo wpasować się w stały grafik koszenia.",
    ],
    localNote:
      "W Osielsku prowadzimy wiele ogrodów w trybie stałej opieki sezonowej — od pierwszego koszenia wiosną po jesienne porządki. Chętnie układamy harmonogram pod konkretną posesję.",
    faq: [
      {
        q: "Czy w Osielsku można zamówić stałą opiekę nad ogrodem?",
        a: "Jak najbardziej. Osielsko leży ok. 9 km od bazy, dojeżdżamy w kwadrans, dlatego bez problemu utrzymujemy regularny cykl koszenia i pielęgnacji przez cały sezon.",
      },
    ],
    metaTitle: "Ogrodnik Osielsko — koszenie, żywopłoty, stała opieka | Ogrody Kryscar",
    metaDescription:
      "Usługi ogrodnicze w Osielsku: koszenie trawników, cięcie żywopłotów, rabaty i stała opieka sezonowa nad ogrodem. Dojazd 15 min. Zadzwoń: +48 668 994 483.",
  },
  {
    slug: "biale-blota",
    name: "Białe Błota",
    gmina: "Białe Błota",
    powiat: "bydgoski",
    km: 12,
    travel: "około 20 minut drogą w stronę zachodnich rogatek Bydgoszczy",
    lat: 53.0936,
    lng: 17.9290,
    zip: "86-005",
    nearbyAreas: ["Łochowo", "Murowaniec", "Lisi Ogon", "Zielonka", "Prądki"],
    intro: [
      "Białe Błota to dynamicznie rozwijająca się gmina na zachód od Bydgoszczy, gdzie powstaje mnóstwo nowych domów z ogrodami od podstaw. Pomagamy je zakładać — od przygotowania gruntu po pierwszy trawnik.",
      "Z czasem te same ogrody przechodzą pod naszą stałą opiekę: koszenie, cięcie krzewów i sezonowe porządki. Znamy specyfikę tutejszych lekkich, piaszczystych gleb i dobieramy do nich rozwiązania.",
    ],
    localNote:
      "W Białych Błotach często zaczynamy od zera — z nowych działek robimy gotowe ogrody, a potem utrzymujemy je w formie. Doradzamy dobór trawy pod lokalne, przepuszczalne podłoże.",
    faq: [
      {
        q: "Zakładacie ogrody na nowych działkach w Białych Błotach?",
        a: "Tak, to jeden z naszych głównych kierunków w tej gminie. Przygotowujemy teren, zakładamy trawnik i rabaty, a później możemy przejąć regularną pielęgnację. Dojeżdżamy w około 20 minut.",
      },
    ],
    metaTitle: "Ogrodnik Białe Błota — zakładanie ogrodów i koszenie | Ogrody Kryscar",
    metaDescription:
      "Usługi ogrodnicze w Białych Błotach: zakładanie trawników, koszenie, sadzenie i pielęgnacja ogrodu na nowych działkach. Wycena gratis. Tel.: +48 668 994 483.",
  },
  {
    slug: "koronowo",
    name: "Koronowo",
    gmina: "Koronowo",
    powiat: "bydgoski",
    km: 27,
    travel: "nieco ponad pół godziny jazdy na północny zachód od bazy",
    lat: 53.3128,
    lng: 17.9381,
    zip: "86-010",
    nearbyAreas: ["Tryszczyn", "Wtelno", "Mąkowarsko", "Buszkowo", "Nowy Jasiniec"],
    intro: [
      "Koronowo to miasteczko nad Brdą i Zalewem Koronowskim, otoczone lasami i terenami rekreacyjnymi. Dojeżdżamy tu nieco dalej niż do podbydgoskich wsi, ale obsługujemy okolicę regularnie.",
      "Pracujemy zarówno przy posesjach całorocznych, jak i przy domkach letniskowych nad zalewem, gdzie po sezonie trzeba ogarnąć zarośnięty trawnik i rozrośnięte krzewy.",
    ],
    localNote:
      "W Koronowie i nad Zalewem Koronowskim często porządkujemy działki rekreacyjne po dłuższej nieobecności właścicieli — wykaszanie wysokiej trawy i cięcie zaniedbanych krzewów to częste zlecenia.",
    faq: [
      {
        q: "Dojedziecie do Koronowa i nad Zalew Koronowski?",
        a: "Tak. Koronowo dzieli od bazy ok. 27 km, jesteśmy na miejscu w nieco ponad pół godziny — obsługujemy zarówno posesje w mieście, jak i domki letniskowe nad zalewem.",
      },
    ],
    metaTitle: "Ogrodnik Koronowo — koszenie, porządki, cięcie krzewów | Ogrody Kryscar",
    metaDescription:
      "Usługi ogrodnicze w Koronowie i nad Zalewem Koronowskim: koszenie, wykaszanie działek, cięcie krzewów i porządki. Bezpłatna wycena. Tel.: +48 668 994 483.",
  },
  {
    slug: "naklo-nad-notecia",
    name: "Nakło nad Notecią",
    gmina: "Nakło nad Notecią",
    powiat: "nakielski",
    km: 30,
    travel: "około 35 minut trasą na zachód, w stronę powiatu nakielskiego",
    lat: 53.1416,
    lng: 17.5961,
    zip: "89-100",
    nearbyAreas: ["Paterek", "Ślesin", "Występ", "Gorzeń", "Trzeciewnica"],
    intro: [
      "Nakło nad Notecią to siedziba powiatu nakielskiego, położona nad rzeką i Kanałem Bydgoskim. To najdalej wysunięty na zachód kierunek, do którego regularnie dojeżdżamy z Bydgoszczy.",
      "Obsługujemy tu ogrody przydomowe i większe posesje — od koszenia i pielęgnacji żywopłotów po jesienne grabienie liści. Mimo większej odległości terminy ustalamy z wyprzedzeniem, by dojazd był opłacalny.",
    ],
    localNote:
      "Do Nakła i okolicznych miejscowości najczęściej planujemy wyjazdy z kilkudniowym wyprzedzeniem, żeby połączyć kilka zleceń w jednej trasie i utrzymać rozsądny koszt dojazdu.",
    faq: [
      {
        q: "Czy warto Was zapraszać do Nakła nad Notecią mimo odległości?",
        a: "Tak — obsługujemy powiat nakielski regularnie. Nakło dzieli od bazy ok. 30 km (ok. 35 minut). Najlepiej umówić termin z wyprzedzeniem, wtedy dojazd nie obciąża wyceny.",
      },
    ],
    metaTitle: "Ogrodnik Nakło nad Notecią — usługi ogrodnicze | Ogrody Kryscar",
    metaDescription:
      "Usługi ogrodnicze w Nakle nad Notecią i powiecie nakielskim: koszenie trawników, cięcie żywopłotów, grabienie i pielęgnacja. Tel.: +48 668 994 483.",
  },
  {
    slug: "sicienko",
    name: "Sicienko",
    gmina: "Sicienko",
    powiat: "bydgoski",
    km: 16,
    travel: "jakieś 20–25 minut drogą na północny zachód od Bydgoszczy",
    lat: 53.1714,
    lng: 17.8636,
    zip: "86-014",
    nearbyAreas: ["Wojnowo", "Kruszyn", "Osówiec", "Samsieczno", "Zielonczyn"],
    intro: [
      "Sicienko to wiejska gmina w powiecie bydgoskim, z dużymi działkami i przestronnymi ogrodami. Tutejsze posesje bywają rozległe, więc koszenie i utrzymanie zieleni to zadania, w których sprawdza się nasz sprzęt mechaniczny.",
      "Dojeżdżamy do Sicienka i okolicznych wsi regularnie. Oprócz koszenia zajmujemy się cięciem krzewów, formowaniem żywopłotów i sezonowymi porządkami wokół domu.",
    ],
    localNote:
      "W gminie Sicienko obsługujemy często duże, wiejskie posesje — na takich terenach koszenie ciągnikowe lub kosami spalinowymi pozwala szybko utrzymać porządek na większym areale.",
    faq: [
      {
        q: "Poradzicie sobie z dużą posesją w gminie Sicienko?",
        a: "Tak, rozległe działki to w Sicienku standard. Mamy sprzęt do koszenia większych powierzchni i dojeżdżamy w 20–25 minut, także do sąsiednich Wojnowa czy Kruszyna.",
      },
    ],
    metaTitle: "Ogrodnik Sicienko — koszenie dużych posesji i zieleni | Ogrody Kryscar",
    metaDescription:
      "Usługi ogrodnicze w gminie Sicienko: koszenie dużych trawników, cięcie krzewów, formowanie żywopłotów i porządki. Bezpłatna wycena. Tel.: +48 668 994 483.",
  },
  {
    slug: "dobrcz",
    name: "Dobrcz",
    gmina: "Dobrcz",
    powiat: "bydgoski",
    km: 18,
    travel: "około 25 minut jazdy na północny wschód od bazy",
    lat: 53.2386,
    lng: 18.1928,
    zip: "86-022",
    nearbyAreas: ["Kotomierz", "Włóki", "Strzelce Górne", "Borówno", "Wudzyn"],
    intro: [
      "Dobrcz leży na północny wschód od Bydgoszczy, wśród łagodnych wzniesień i terenów rolniczych powiatu bydgoskiego. To okolica spokojnych, wiejskich posesji, do których dojeżdżamy regularnie.",
      "Zajmujemy się tu pełnym zakresem prac: koszeniem trawników, cięciem i formowaniem krzewów, sadzeniem roślin oraz wiosennymi i jesiennymi porządkami w ogrodzie.",
    ],
    localNote:
      "W gminie Dobrcz pracujemy głównie przy domach jednorodzinnych i siedliskach — dopasowujemy zakres prac do wielkości ogrodu, od jednorazowego koszenia po pełną pielęgnację.",
    faq: [
      {
        q: "Czy dojeżdżacie do Dobrcza i okolicznych wsi?",
        a: "Tak. Dobrcz to ok. 18 km od bazy, jesteśmy na miejscu w jakieś 25 minut — obsługujemy też pobliskie Kotomierz, Borówno i Strzelce Górne.",
      },
    ],
    metaTitle: "Ogrodnik Dobrcz — koszenie, cięcie krzewów, sadzenie | Ogrody Kryscar",
    metaDescription:
      "Usługi ogrodnicze w gminie Dobrcz: koszenie trawników, cięcie i formowanie krzewów, sadzenie roślin oraz porządki. Wycena gratis. Tel.: +48 668 994 483.",
  },
  {
    slug: "zoledowo",
    name: "Żołędowo",
    gmina: "Osielsko",
    powiat: "bydgoski",
    km: 10,
    travel: "około 15 minut od Bydgoszczy, tuż za Niemczem",
    lat: 53.1772,
    lng: 18.0858,
    zip: "86-031",
    nearbyAreas: ["Niemcz", "Osielsko", "Maksymilianowo", "Jarużyn", "Bożenkowo"],
    intro: [
      "Żołędowo w gminie Osielsko to kolejna miejscowość na naszej stałej trasie — leży tuż za Niemczem, kilkanaście minut od Bydgoszczy. Sąsiedztwo Doliny Zielonki nadaje tutejszym ogrodom zielony, kameralny charakter.",
      "Obsługujemy tu przede wszystkim ogrody przydomowe: równe trawniki, zadbane żywopłoty i rabaty to wizytówka okolicznych posesji, a my pomagamy je utrzymać przez cały sezon.",
    ],
    localNote:
      "W Żołędowie najczęściej prowadzimy regularne koszenie i pielęgnację żywopłotów przy domach jednorodzinnych. Łatwo łączymy te zlecenia z wizytami w sąsiednim Niemczu i Osielsku.",
    faq: [
      {
        q: "Czy obsługujecie Żołędowo razem z Niemczem?",
        a: "Tak, leżą tuż obok siebie — Żołędowo to ok. 10 km od bazy, dojeżdżamy w około 15 minut i często obsługujemy obie miejscowości tego samego dnia.",
      },
    ],
    metaTitle: "Ogrodnik Żołędowo (gm. Osielsko) — koszenie i pielęgnacja | Ogrody Kryscar",
    metaDescription:
      "Usługi ogrodnicze w Żołędowie i gminie Osielsko: koszenie trawników, cięcie żywopłotów, rabaty i sezonowa pielęgnacja. Dojazd 15 min. Tel.: +48 668 994 483.",
  },
  {
    slug: "maksymilianowo",
    name: "Maksymilianowo",
    gmina: "Osielsko",
    powiat: "bydgoski",
    km: 14,
    travel: "niespełna 20 minut jazdy w kierunku północno-wschodnim",
    lat: 53.2025,
    lng: 18.1772,
    zip: "86-022",
    nearbyAreas: ["Żołędowo", "Osielsko", "Wilcze", "Jarużyn", "Kotomierz"],
    intro: [
      "Maksymilianowo to miejscowość w gminie Osielsko, znana z węzła kolejowego, położona na północny wschód od Bydgoszczy. Dojeżdżamy tu w niespełna 20 minut, obsługując ogrody przy domach jednorodzinnych i siedliskach.",
      "Zakres prac dobieramy do konkretnej posesji: od koszenia trawnika i cięcia krzewów po sadzenie roślin i jesienne grabienie liści. Stała opieka sezonowa jest tu równie dostępna jak pojedyncze wizyty.",
    ],
    localNote:
      "W Maksymilianowie obsługujemy zarówno mniejsze ogrody przydomowe, jak i większe działki przy siedliskach. Plan prac ustalamy indywidualnie, łącząc wyjazdy z sąsiednim Żołędowem i Osielskiem.",
    faq: [
      {
        q: "Jak daleko macie do Maksymilianowa?",
        a: "Maksymilianowo dzieli od naszej bazy ok. 14 km, jesteśmy na miejscu w niespełna 20 minut. Obsługujemy je razem z okolicznymi miejscowościami gminy Osielsko.",
      },
    ],
    metaTitle: "Ogrodnik Maksymilianowo — usługi ogrodnicze | Ogrody Kryscar",
    metaDescription:
      "Usługi ogrodnicze w Maksymilianowie (gm. Osielsko): koszenie trawników, cięcie krzewów, sadzenie i grabienie liści. Dojazd 20 min. Tel.: +48 668 994 483.",
  },
];

export async function getAllLocations(): Promise<Location[]> {
  return LOCATIONS;
}

export async function getLocationSlugs(): Promise<string[]> {
  return LOCATIONS.map((l) => l.slug);
}

export async function getLocationBySlug(slug: string): Promise<Location | null> {
  return LOCATIONS.find((l) => l.slug === slug) ?? null;
}
