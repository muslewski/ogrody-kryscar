import type { Metadata } from "next";
import { COMPANY, STATS, FAQ, TEAM, ADDRESS, LEGAL_LINKS, IMG } from "@/lib/data";
import { COVERAGE_HEADLINE, COVERAGE_INTRO } from "@/lib/coverage";
import { Reveal, HeroReveal, StaggerGrid, StaggerItem } from "@/components/motion";
import { Stat } from "@/components/Stat";
import { SitePreloader } from "@/components/SitePreloader";
import { CoverageMap } from "@/components/CoverageMap";
import { AntigravitySection } from "@/components/AntigravitySection";
import { Socials } from "@/components/Socials";
import { CalculatorForm } from "@/components/CalculatorForm";
import { WarpedHoverImage } from "@/components/WarpedHoverImage";

const ANNUAL_PLAN = [
  { count: "24", label: "Koszenia trawnika", note: "co 1–2 tygodnie · od marca do października" },
  { count: "4", label: "Cięcia żywopłotów", note: "kwiecień / czerwiec / sierpień / październik" },
  { count: "2", label: "Grabienia jesienne", note: "październik i listopad" },
  { count: "1", label: "Wertykulacja", note: "marzec lub kwiecień" },
  { count: "2", label: "Nasadzenia sezonowe", note: "wiosna i jesień" },
  { count: "0", label: "Systemów nawadniania", note: "tym zajmują się specjaliści — polecimy kogoś sprawdzonego" },
];

export const metadata: Metadata = { title: `${COMPANY.name} — Storytelling` };

const seasons = [
  {
    no: "01",
    name: "Wiosna",
    title: "Otwarcie",
    color: "#a3c585",
    bg: "#eaf3dd",
    ink: "#1f2d12",
    img: IMG.daffodils,
    lead:
      "Pierwsze tygodnie marca. Trawa budzi się powoli, a ziemia jeszcze trzyma chłód. Wjeżdżamy na działkę z wertykulatorem i grabiami — sezon zaczyna się od oddechu dla trawnika.",
    bullets: [
      "Wertykulacja i aeracja trawnika",
      "Wiosenne nawożenie i dosiew",
      "Cięcie sanitarne krzewów",
      "Sadzenie cebulowych i bylin",
    ],
    quote: "Wiosną nie trzeba dużo — trzeba w porę.",
  },
  {
    no: "02",
    name: "Lato",
    title: "Pełnia",
    color: "#3f9c5c",
    bg: "#d6efdb",
    ink: "#0f2614",
    img: IMG.hedgeMaze,
    lead:
      "Czerwiec, lipiec, sierpień. Trawa rośnie szybciej, niż ktokolwiek chciałby ją kosić. Pojawiamy się regularnie, jak dobra pora dnia — codziennie taka sama, ale w innym ogrodzie.",
    bullets: [
      "Koszenie raz na tydzień lub dwa",
      "Formowanie żywopłotów co miesiąc",
      "Pielęgnacja rabat i bylin",
      "Korekta nasadzeń, podlewanie startowe",
    ],
    quote: "Latem ogród się pokazuje. My pilnujemy, żeby nie zniknął.",
  },
  {
    no: "03",
    name: "Jesień",
    title: "Zamknięcie",
    color: "#c97a2b",
    bg: "#f6e7cf",
    ink: "#3a2210",
    img: IMG.autumn1,
    lead:
      "Wrzesień, październik, listopad. Liście spadają w tempie zaskakującym tylko tych, którzy się ogrodem nie zajmują. Grabimy, wywozimy, przygotowujemy ogród do snu.",
    bullets: [
      "Grabienie i wywóz liści",
      "Ostatnie koszenie sezonu",
      "Zabezpieczanie roślin wrażliwych",
      "Cięcie pielęgnacyjne drzew",
    ],
    quote: "Jesień to nie koniec. To porządek przed kolejnym początkiem.",
  },
  {
    no: "04",
    name: "Zima",
    title: "Cisza",
    color: "#2f4a52",
    bg: "#dfe9ec",
    ink: "#10242a",
    img: IMG.snowdrop,
    lead:
      "Grudzień, styczeń, luty. Ogród śpi. My — planujemy. Z naszymi stałymi klientami spotykamy się, by zaprojektować zmiany w nasadzeniach, zaplanować inwestycje i ustalić sezonowy harmonogram.",
    bullets: [
      "Planowanie wiosennych nasadzeń",
      "Projektowanie zmian w ogrodzie",
      "Konsultacje stylu i kompozycji",
      "Rezerwacja terminów na wiosnę",
    ],
    quote: "Najlepszy ogród następnego roku planuje się w lutym.",
  },
];

export default function Example10() {
  return (
    <>
    <SitePreloader
      storageKey="ogrody:ex10"
      variant="curtain"
      duration={1600}
      bgColor="#1c1917"
      iconColor="#a7f3d0"
      iconSize={52}
      brandClassName="text-4xl md:text-6xl font-[family-name:var(--font-newsreader)] tracking-tight text-stone-50"
      taglineClassName="text-[10px] uppercase tracking-[0.4em] font-medium text-emerald-300/80"
      tagline="Cztery pory roku · jeden ogród"
    />
    <main className="min-h-screen overflow-x-clip bg-stone-50 font-[family-name:var(--font-newsreader)] text-stone-900">
      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 text-white sm:px-6 sm:py-5">
          <a href="#" className="font-[family-name:var(--font-bricolage)] text-base font-medium sm:text-lg">
            {COMPANY.name}
          </a>
          <nav className="hidden gap-8 text-sm md:flex">
            <a href="#wiosna">Wiosna</a>
            <a href="#lato">Lato</a>
            <a href="#jesien">Jesień</a>
            <a href="#zima">Zima</a>
          </nav>
          <a
            href={`tel:${COMPANY.phoneRaw}`}
            className="shrink-0 rounded-full border border-white/40 px-3 py-1.5 text-[11px] sm:px-4 sm:text-xs"
          >
            <span className="md:hidden">Zadzwoń</span>
            <span className="hidden md:inline">{COMPANY.phone}</span>
          </a>
        </div>
      </header>

      {/* HERO — magazine-cover layout: photo top, content below on cream */}
      <section className="bg-stone-50">
        {/* Wide photo + animated overlay scene */}
        <div className="relative h-[40vh] min-h-[280px] w-full overflow-hidden sm:h-[48vh] sm:min-h-[360px]">
          {/* Ken Burns photo */}
          <div className="absolute inset-0 animate-ken-burns">
            <WarpedHoverImage
              src={IMG.parkGarden}
              alt="Ogród o poranku"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Dark gradient under nav + masthead */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/65 via-black/30 to-transparent" />

          {/* Masthead band */}
          <div
            className="absolute inset-x-0 top-0 z-10 px-4 pt-20 pb-3 sm:px-6 sm:pt-24"
            style={{ textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between text-[10px] font-medium uppercase tracking-[0.25em] text-white sm:text-xs sm:tracking-[0.3em]">
              <span>Wydanie {new Date().getFullYear()} / 4 pory roku</span>
              <span className="hidden md:inline">Pracownia ogrodnicza</span>
            </div>
          </div>

          {/* Bottom fade into cream content area */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-12 bg-gradient-to-b from-transparent to-stone-50 sm:h-16" />
        </div>

        {/* Content area */}
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:pt-10">
          <div className="grid gap-8 sm:gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-14">
            {/* LEFT — kicker, headline, byline pinned bottom */}
            <div className="flex flex-col lg:col-span-7">
              <HeroReveal delay={0.05}>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-emerald-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Cztery pory · jeden ogród
                </span>
              </HeroReveal>
              <HeroReveal delay={0.15}>
                <h1 className="mt-5 font-[family-name:var(--font-newsreader)] text-4xl leading-[1] tracking-tight text-stone-900 sm:mt-7 sm:text-5xl md:text-7xl xl:text-[88px]">
                  Twój ogród nie ma
                  <br />
                  <em className="text-emerald-700">martwego</em> sezonu.
                </h1>
              </HeroReveal>
              {/* Magazine byline — fills the bottom of the left column on lg */}
              <HeroReveal delay={0.4} className="lg:mt-auto">
              <div className="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2 text-sm text-stone-500 sm:mt-10 lg:pt-12">
                <p className="font-[family-name:var(--font-newsreader)] italic">
                  Opieka nad ogrodami: Pracownia Kryscar
                </p>
                <span className="hidden text-stone-300 sm:inline">·</span>
                <p className="text-xs uppercase tracking-[0.25em]">
                  Wydanie {new Date().getFullYear()}
                </p>
              </div>
              </HeroReveal>
            </div>

            {/* RIGHT — copy, CTAs, "currently in season", trust strip */}
            <HeroReveal delay={0.25} className="lg:col-span-5">
            <aside className="flex flex-col gap-5 sm:gap-6 lg:border-l lg:border-stone-200 lg:pl-10">
              <p className="text-base leading-relaxed text-stone-700 sm:text-lg">
                Marzec, lipiec, październik, luty — pracujemy przez cały rok.
                Każda pora ma swój rytm, swoje zadania i swój ogród.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#wiosna"
                  className="rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-stone-50 transition hover:bg-emerald-800"
                >
                  Przejrzyj cały rok ↓
                </a>
                <a
                  href={`tel:${COMPANY.phoneRaw}`}
                  className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-800 hover:border-stone-900"
                >
                  {COMPANY.phone}
                </a>
              </div>

              {/* Currently in season — magazine sidebar */}
              {(() => {
                const m = new Date().getMonth();
                const idx =
                  m >= 2 && m <= 4
                    ? 0
                    : m >= 5 && m <= 7
                      ? 1
                      : m >= 8 && m <= 10
                        ? 2
                        : 3;
                const now = seasons[idx];
                return (
                  <a
                    href={`#${now.name.toLowerCase()}`}
                    className="mt-2 flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <img
                        src={now.img}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.25em]"
                        style={{ color: now.color }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: now.color }}
                        />
                        Teraz w ogrodach
                      </p>
                      <p className="mt-1 truncate font-[family-name:var(--font-newsreader)] text-lg text-stone-900">
                        {now.name} ·{" "}
                        <span className="text-stone-500">
                          {now.bullets[0]}
                        </span>
                      </p>
                    </div>
                    <span className="text-stone-400">→</span>
                  </a>
                );
              })()}

              {/* Trust micro-strip */}
              <StaggerGrid className="grid grid-cols-3 gap-4 border-t border-stone-200 pt-5">
                <StaggerItem>
                  <p className="font-[family-name:var(--font-newsreader)] text-2xl text-stone-900">
                    <span className="text-amber-500">★</span> 4,9
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">187 opinii</p>
                </StaggerItem>
                <StaggerItem>
                  <p className="font-[family-name:var(--font-newsreader)] text-2xl text-stone-900">
                    500+
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">ogrodów</p>
                </StaggerItem>
                <StaggerItem>
                  <p className="font-[family-name:var(--font-newsreader)] text-2xl text-stone-900">
                    10+
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">lat</p>
                </StaggerItem>
              </StaggerGrid>
            </aside>
            </HeroReveal>
          </div>

          {/* 4-season preview — contents table */}
          <Reveal className="mt-12 border-t border-stone-200 pt-6 sm:mt-14 sm:pt-8">
            <div className="mb-4 flex items-end justify-between sm:mb-5">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                Spis treści — cztery rozdziały
              </p>
              <span className="hidden text-xs uppercase tracking-[0.3em] text-stone-400 md:inline">
                Przewiń ↓
              </span>
            </div>
            <StaggerGrid className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
              {seasons.map((s) => (
                <StaggerItem key={s.no}>
                <a
                  href={`#${s.name.toLowerCase()}`}
                  className="group block overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <WarpedHoverImage
                      src={s.img}
                      alt=""
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-widest"
                        style={{ color: s.color }}
                      >
                        Pora {s.no}
                      </p>
                      <p className="font-[family-name:var(--font-newsreader)] text-xl text-stone-900">
                        {s.name}
                      </p>
                    </div>
                    <span className="text-stone-400 transition group-hover:translate-x-1 group-hover:text-stone-900">
                      →
                    </span>
                  </div>
                </a>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </Reveal>
        </div>
      </section>

      {/* SEASONAL CHAPTERS */}
      {seasons.map((s, i) => (
        <section
          key={s.no}
          id={s.name.toLowerCase()}
          style={{ background: s.bg, color: s.ink }}
          className="relative"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
            <div className="grid gap-10 sm:gap-12 lg:grid-cols-12 lg:items-center">
              {/* `min-w-0` on grid children is the canonical fix for
                  the "long word expands the column" overflow — CSS grid
                  tracks default to min-content, so we have to opt them
                  back into shrinking. */}
              <Reveal
                className={`min-w-0 lg:col-span-6 ${i % 2 === 1 ? "lg:order-2" : ""}`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <span
                    className="font-[family-name:var(--font-bricolage)] text-[88px] leading-none sm:text-[120px] lg:text-[140px]"
                    style={{ color: s.color }}
                  >
                    {s.no}
                  </span>
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-[0.25em] sm:text-xs sm:tracking-[0.3em]"
                      style={{ color: s.color }}
                    >
                      Pora {s.no} / 04
                    </p>
                    <p className="font-[family-name:var(--font-bricolage)] text-2xl sm:text-3xl">
                      {s.name}
                    </p>
                  </div>
                </div>
                {/* `break-words` + a tamer scale up to lg keep long
                    Polish words (Zamknięcie, Wertykulacja…) from
                    blowing out the grid column at large breakpoints
                    and causing horizontal scroll. */}
                <h2 className="mt-6 break-words font-[family-name:var(--font-newsreader)] text-4xl leading-[1.02] sm:mt-8 sm:text-5xl md:text-6xl lg:text-7xl">
                  {s.title}{" "}
                  <em style={{ color: s.color }}>
                    {s.name.toLowerCase()}.
                  </em>
                </h2>
                <p className="mt-6 max-w-xl text-base leading-relaxed sm:mt-8 sm:text-lg">
                  {s.lead}
                </p>
                <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2">
                  {s.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3 border-t pt-3 text-sm"
                      style={{ borderColor: s.color + "55" }}
                    >
                      <span style={{ color: s.color }}>✦</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <blockquote
                  className="mt-10 max-w-md font-[family-name:var(--font-newsreader)] text-xl italic sm:mt-12 sm:text-2xl md:text-3xl"
                  style={{ color: s.color }}
                >
                  „{s.quote}”
                </blockquote>
              </Reveal>

              <Reveal delay={0.1}
                className={`relative min-w-0 lg:col-span-6 ${
                  i % 2 === 1 ? "lg:order-1" : ""
                }`}
              ><figure className="contents">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] sm:rounded-[36px]">
                  <WarpedHoverImage
                    src={s.img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div
                  className="absolute -bottom-8 left-1/2 hidden -translate-x-1/2 rounded-full px-6 py-3 font-[family-name:var(--font-bricolage)] text-sm tracking-wider shadow-xl md:block"
                  style={{ background: s.ink, color: s.bg }}
                >
                  {s.name.toUpperCase()} · {new Date().getFullYear()}
                </div>
              </figure></Reveal>
            </div>
          </div>

          {/* divider arrow to next */}
          {i < seasons.length - 1 && (
            <div className="mx-auto flex max-w-7xl items-center justify-center px-4 pb-8 text-xs uppercase tracking-[0.3em] sm:px-6 sm:pb-10" style={{ color: s.color }}>
              <span>↓ następna pora ↓</span>
            </div>
          )}
        </section>
      ))}

      {/* TEAM — editorial bylines */}
      <section id="zespol" className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
              Zespół · redakcja
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-newsreader)] text-4xl leading-[1.05] tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
              Cztery osoby,
              <br />
              jeden{" "}
              <em className="text-emerald-700">rocznik</em>.
            </h2>
          </Reveal>
          <StaggerGrid className="mt-12 grid gap-8 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4" amount={0.05}>
            {TEAM.map((m) => (
              <StaggerItem key={m.name}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-200">
                  <WarpedHoverImage
                    src={m.photo}
                    alt={`Portret ${m.name}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-5 font-[family-name:var(--font-newsreader)] text-2xl italic text-stone-900">
                  {m.name}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-emerald-700">
                  {m.role}
                </p>
                <p className="mt-3 font-[family-name:var(--font-newsreader)] text-base leading-relaxed text-stone-600">
                  {m.bio}
                </p>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ANNUAL PLAN — bespoke for ex10 */}
      <section className="bg-stone-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 border-t border-stone-300 pt-8 sm:pt-10">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                  Roczny plan opieki
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-newsreader)] text-4xl leading-[1.05] tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
                  Rok w ogrodzie,
                  <br />
                  <em className="text-emerald-700">w liczbach</em>.
                </h2>
              </div>
              <p className="max-w-xs font-[family-name:var(--font-newsreader)] text-base italic text-stone-500 sm:text-lg">
                Tyle wizyt średnio przypada na jeden ogród w pakiecie sezonowym.
              </p>
            </div>
          </Reveal>
          <StaggerGrid className="mt-12 grid gap-0 border-t border-stone-300 sm:mt-14" amount={0.05}>
            {ANNUAL_PLAN.map((row) => (
              <StaggerItem
                key={row.label}
                className="grid grid-cols-12 items-baseline gap-4 border-b border-stone-300 py-6 sm:gap-8 sm:py-8"
              >
                <div className="col-span-3 font-[family-name:var(--font-bricolage)] text-5xl leading-none text-emerald-700 sm:col-span-2 sm:text-6xl md:text-7xl">
                  {row.count}
                </div>
                <div className="col-span-9 sm:col-span-10 sm:grid sm:grid-cols-12 sm:items-baseline sm:gap-8">
                  <p className="font-[family-name:var(--font-newsreader)] text-xl italic text-stone-900 sm:col-span-4 sm:text-2xl">
                    {row.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600 sm:col-span-8 sm:mt-0 sm:text-base">
                    {row.note}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="kalkulator" className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                Kalkulator
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-newsreader)] text-4xl leading-[1.05] tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
                Wycena{" "}
                <em className="text-emerald-700">teoretyczna</em>.
              </h2>
              <p className="mt-5 max-w-sm font-[family-name:var(--font-newsreader)] text-base leading-relaxed text-stone-600 sm:mt-6 sm:text-lg">
                Zaznaczcie zakres prac i wielkość ogrodu. Dokładną wycenę
                przedstawimy po wizycie.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10">
                <CalculatorForm
                  theme={{
                    activeBg: "#065f46",
                    activeFg: "#ecfdf5",
                    inactiveBorder: "border-stone-300",
                    inactiveFg: "text-stone-700 hover:bg-stone-100",
                    priceColor: "#065f46",
                    priceFontClass: "font-[family-name:var(--font-newsreader)] italic",
                    chipRadiusClass: "rounded-full",
                  }}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* MAP — editorial */}
      <section id="mapa" className="bg-stone-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 border-t border-stone-300 pt-8 sm:pt-10">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                  Kartograf · gdzie pracujemy
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-newsreader)] text-4xl leading-[1.05] tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
                  {COVERAGE_HEADLINE}
                </h2>
              </div>
              <p className="max-w-md font-[family-name:var(--font-newsreader)] text-base italic text-stone-500 sm:text-lg">
                {COVERAGE_INTRO}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 sm:mt-14">
            <div className="overflow-hidden rounded-3xl border border-stone-300 bg-white p-3">
              <CoverageMap
                variant="light"
                aspect="16/9"
                pinColor="065f46"
                hqColor="1c1917"
                rounded="rounded-[20px]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ANTIGRAVITY — editorial intermezzo */}
      <AntigravitySection
        color="#34d399"
        bg="#0c0a09"
        textColor="#fafaf9"
        paddingClass="py-28 sm:py-36"
        count={1700}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
            Pomiędzy rozdziałami
          </p>
          <h2 className="mt-5 font-[family-name:var(--font-newsreader)] text-5xl leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
            Ogród nie zna
            <br />
            <em className="text-emerald-300">martwego</em> sezonu.
          </h2>
          <p className="mt-8 max-w-md mx-auto font-[family-name:var(--font-newsreader)] text-lg italic leading-relaxed text-stone-300 sm:text-xl">
            Dlatego jesteśmy z Wami przez wszystkie dwanaście miesięcy. Tylko intensywność się zmienia.
          </p>
        </div>
      </AntigravitySection>

      {/* FAQ — editorial sidebar */}
      <section id="faq" className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 border-t border-stone-200 pt-8 sm:pt-10">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                  Marginalia · pytania czytelników
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-newsreader)] text-4xl leading-[1.05] tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
                  Pytania, które
                  <br />
                  najczęściej{" "}
                  <em className="text-emerald-700">wracają</em>.
                </h2>
              </div>
              <p className="max-w-xs font-[family-name:var(--font-newsreader)] text-base italic text-stone-500 sm:text-lg">
                Pięć krótkich odpowiedzi — by oszczędzić Wam jednej rozmowy.
              </p>
            </div>
          </Reveal>
          <StaggerGrid className="mt-10 grid gap-0 border-t border-stone-200 sm:mt-12" amount={0.05}>
            {FAQ.map((f, i) => (
              <StaggerItem
                key={f.q}
                className="border-b border-stone-200"
              >
                <details className="group">
                  <summary className="flex cursor-pointer items-start gap-6 py-6 transition sm:gap-10 sm:py-8">
                    <span className="font-[family-name:var(--font-bricolage)] text-4xl leading-none text-stone-300 transition group-open:text-emerald-700 sm:text-5xl md:text-6xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-[family-name:var(--font-newsreader)] text-xl leading-snug text-stone-900 sm:text-2xl md:text-3xl">
                      <em>{f.q}</em>
                    </span>
                    <span
                      aria-hidden
                      className="mt-3 hidden text-xs uppercase tracking-[0.3em] text-stone-400 transition group-open:rotate-180 group-open:text-emerald-700 sm:inline"
                    >
                      ▼
                    </span>
                  </summary>
                  <div className="grid gap-6 pb-6 sm:grid-cols-12 sm:gap-10 sm:pb-8">
                    <div className="hidden sm:col-span-2 sm:block" />
                    <p className="max-w-prose font-[family-name:var(--font-newsreader)] text-base leading-relaxed text-stone-600 sm:col-span-10 sm:text-lg">
                      {f.a}
                    </p>
                  </div>
                </details>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* WHY US — STATS */}
      <section className="bg-stone-900 py-16 text-stone-50 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              W liczbach
            </p>
            <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-newsreader)] text-4xl sm:text-5xl md:text-6xl">
              Cztery pory. Dwanaście miesięcy.
              <br />
              <em className="text-emerald-300">Jeden zespół.</em>
            </h2>
          </Reveal>
          <StaggerGrid className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-stone-700 bg-stone-700 sm:mt-14 md:grid-cols-4">
            {STATS.map((s) => (
              <StaggerItem key={s.label} className="bg-stone-900 p-6 sm:p-8">
                <p className="font-[family-name:var(--font-newsreader)] text-4xl sm:text-5xl lg:text-6xl">
                  <Stat value={s.value} />
                </p>
                <p className="mt-2 text-xs text-stone-400 sm:mt-3 sm:text-sm">{s.label}</p>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* FINAL CTA — split: typography on cream, contact card on emerald */}
      <section className="bg-stone-50">
        <div className="mx-auto grid max-w-7xl gap-0 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:py-28">
          <Reveal className="lg:col-span-7 lg:pr-8">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
              Zacznijmy
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-newsreader)] text-4xl leading-[1.02] tracking-tight text-stone-900 sm:mt-4 sm:text-5xl md:text-7xl lg:text-8xl">
              Twój rok
              <br />w ogrodzie{" "}
              <em className="text-emerald-700">zaczyna</em>
              <br />
              się dziś.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-stone-600 sm:mt-8 sm:text-lg">
              Bez zobowiązań — najpierw rozmowa, potem wizyta, potem konkretna
              oferta. Wolne terminy w obecnym tygodniu.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                ✓ Bezpłatna wycena
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                ✓ Bez umowy na start
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                ✓ Odpowiedź w 24h
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mt-8 lg:col-span-5 lg:mt-0"><aside className="contents">
            <div className="relative overflow-hidden rounded-3xl bg-emerald-900 p-2">
              <div className="rounded-[20px] bg-emerald-950 p-5 sm:p-7">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                  Kontakt
                </p>
                <div className="mt-5 space-y-3">
                  <a
                    href={`tel:${COMPANY.phoneRaw}`}
                    className="flex items-center justify-between rounded-2xl bg-emerald-50 px-5 py-4 text-stone-900 transition hover:bg-white"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wider text-emerald-700">
                        Telefon
                      </p>
                      <p className="mt-1 font-[family-name:var(--font-newsreader)] text-2xl">
                        {COMPANY.phone}
                      </p>
                    </div>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-700 text-emerald-50">
                      →
                    </span>
                  </a>
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="flex items-center justify-between rounded-2xl border border-emerald-300/30 px-5 py-4 text-emerald-50 transition hover:bg-emerald-900/40"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wider text-emerald-300">
                        E-mail
                      </p>
                      <p className="mt-1 text-lg">{COMPANY.email}</p>
                    </div>
                    <span className="text-emerald-300">→</span>
                  </a>
                </div>

                {/* Small supporting photo strip — feels like a stamp/seal */}
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {seasons.map((s) => (
                    <div
                      key={s.no}
                      className="aspect-square overflow-hidden rounded-lg"
                    >
                      <img
                        src={s.img}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-center text-[11px] uppercase tracking-[0.3em] text-emerald-300">
                  Wiosna · Lato · Jesień · Zima
                </p>
              </div>
            </div>
          </aside>
          </Reveal>
        </div>
      </section>

      {/* FOOTER — magazine masthead */}
      <footer className="bg-stone-950 text-stone-300">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          {/* Masthead row */}
          <div className="border-y border-stone-800 py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <p className="font-[family-name:var(--font-newsreader)] text-4xl italic text-stone-50 sm:text-5xl">
                {COMPANY.name}
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300">
                Wydanie {new Date().getFullYear()} · 4 pory roku
              </p>
            </div>
          </div>

          <div className="grid gap-12 pt-10 lg:grid-cols-12 lg:gap-16">
            {/* Tagline + social */}
            <div className="lg:col-span-5">
              <p className="font-[family-name:var(--font-newsreader)] text-2xl italic leading-snug text-stone-100 sm:text-3xl">
                Cztery pory roku, jeden zespół, ogrody które nie znają martwego sezonu.
              </p>
              <Socials className="mt-7 text-emerald-300" variant="outline" />
            </div>

            {/* Rozdziały */}
            <div className="lg:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
                Rozdziały
              </p>
              <ul className="mt-5 space-y-2.5 font-[family-name:var(--font-newsreader)] text-base text-stone-300">
                <li><a href="#wiosna" className="italic underline-offset-4 hover:text-emerald-300 hover:underline">Wiosna</a></li>
                <li><a href="#lato" className="italic underline-offset-4 hover:text-emerald-300 hover:underline">Lato</a></li>
                <li><a href="#jesien" className="italic underline-offset-4 hover:text-emerald-300 hover:underline">Jesień</a></li>
                <li><a href="#zima" className="italic underline-offset-4 hover:text-emerald-300 hover:underline">Zima</a></li>
                <li><a href="#faq" className="italic underline-offset-4 hover:text-emerald-300 hover:underline">Marginalia</a></li>
              </ul>
            </div>

            {/* Kontakt */}
            <div className="lg:col-span-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
                Redakcja
              </p>
              <address className="mt-5 space-y-3 text-sm not-italic">
                <p>
                  <a
                    href={`tel:${COMPANY.phoneRaw}`}
                    className="font-[family-name:var(--font-newsreader)] text-3xl italic text-stone-50 hover:text-emerald-300"
                  >
                    {COMPANY.phone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${COMPANY.email}`} className="text-stone-200 underline-offset-4 hover:underline">
                    {COMPANY.email}
                  </a>
                </p>
                <p className="font-[family-name:var(--font-newsreader)] italic text-stone-400">
                  {ADDRESS.fullLine}
                </p>
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                  {ADDRESS.hours}
                </p>
              </address>
            </div>
          </div>

          {/* Colophon */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-stone-800 pt-6 text-[11px] uppercase tracking-[0.25em] text-stone-500">
            <p>© {new Date().getFullYear()} · {COMPANY.name} · NIP {ADDRESS.nip}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-stone-200">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}
