import type { Metadata } from "next";
import { COMPANY, SERVICES, PROCESS, TESTIMONIALS, STATS, FAQ, TEAM, ADDRESS, LEGAL_LINKS, IMG } from "@/lib/data";
import { COVERAGE_CITIES, COVERAGE_HEADLINE, COVERAGE_INTRO, COVERAGE_NOTE } from "@/lib/coverage";
import { Reveal, HeroReveal, StaggerGrid, StaggerItem } from "@/components/motion";
import { Stat } from "@/components/Stat";
import { SitePreloader } from "@/components/SitePreloader";
import { CoverageMap } from "@/components/CoverageMap";
import { AntigravitySection } from "@/components/AntigravitySection";
import { Socials } from "@/components/Socials";
import { CalculatorForm } from "@/components/CalculatorForm";
import { WarpedHoverImage } from "@/components/WarpedHoverImage";

export const metadata: Metadata = { title: `${COMPANY.name} — Catalog` };

type Service = (typeof SERVICES)[number];
type Catalog = Service & { img: string; from: string; duration: string };

const SERVICE_IMAGES: Record<string, string> = {
  koszenie: IMG.lawnTexture,
  pielegnacja: IMG.gardenerYard,
  grabienie: IMG.autumn1,
  sadzenie: IMG.sprout,
  ciecie: IMG.hedgeShears,
  porzadki: IMG.autumn3,
  aranzacja: IMG.daffodils,
  rabaty: IMG.echinacea,
};

const PRICES: Record<string, { from: string; duration: string }> = {
  koszenie: { from: "od 199 zł", duration: "~ 1 wizyta" },
  pielegnacja: { from: "od 349 zł", duration: "pakiet sezonowy" },
  grabienie: { from: "od 249 zł", duration: "~ 1 wizyta" },
  sadzenie: { from: "od 399 zł", duration: "wycena indywidualna" },
  ciecie: { from: "od 299 zł", duration: "~ 1 wizyta" },
  porzadki: { from: "od 449 zł", duration: "pakiet 2 wizyty" },
  aranzacja: { from: "wycena", duration: "projekt + realizacja" },
  rabaty: { from: "od 599 zł", duration: "projekt + sadzenie" },
};

const services: Catalog[] = SERVICES.map((s) => ({
  ...s,
  img: SERVICE_IMAGES[s.slug] ?? IMG.parkGarden,
  from: PRICES[s.slug]?.from ?? "wycena",
  duration: PRICES[s.slug]?.duration ?? "indywidualnie",
}));

const filters = [
  { label: "Wszystkie", active: true },
  { label: "Trawnik" },
  { label: "Cięcie" },
  { label: "Sadzenie" },
  { label: "Porządki" },
  { label: "Projekt" },
];

export default function Example9() {
  return (
    <>
    <SitePreloader
      storageKey="ogrody:ex9"
      variant="slide"
      duration={1400}
      bgColor="#064e3b"
      iconColor="#a7f3d0"
      iconSize={48}
      brandClassName="text-3xl md:text-5xl font-semibold tracking-tight text-emerald-50"
      taglineClassName="text-[10px] uppercase tracking-[0.4em] font-medium text-emerald-200/80"
      tagline="Katalog usług ogrodniczych"
    />
    <main className="min-h-screen bg-white font-[family-name:var(--font-manrope)] text-neutral-900">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5">
          <a href="#" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-700 text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M12 2c-3 4-6 7-6 11a6 6 0 0 0 12 0c0-4-3-7-6-11z" />
              </svg>
            </span>
            <span className="font-semibold tracking-tight">
              {COMPANY.name}
            </span>
          </a>
          <nav className="hidden gap-7 text-sm text-neutral-700 md:flex">
            <a href="#katalog" className="hover:text-emerald-700">Katalog</a>
            <a href="#proces" className="hover:text-emerald-700">Jak to działa</a>
            <a href="#opinie" className="hover:text-emerald-700">Opinie</a>
            <a href="#kontakt" className="hover:text-emerald-700">Kontakt</a>
          </nav>
          <div className="flex shrink-0 items-center gap-3">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="hidden text-sm text-neutral-700 hover:text-emerald-700 md:block"
            >
              {COMPANY.phone}
            </a>
            <a
              href="#kontakt"
              className="rounded-full bg-neutral-900 px-3 py-2 text-xs font-medium text-white sm:px-4 sm:text-sm"
            >
              <span className="sm:hidden">Wycena</span>
              <span className="hidden sm:inline">Zamów wycenę</span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-10 pb-10 sm:gap-10 sm:px-6 sm:pt-14 sm:pb-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <HeroReveal delay={0.05}>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Sezon {new Date().getFullYear()} — przyjmujemy zlecenia
              </span>
            </HeroReveal>
            <HeroReveal delay={0.15}>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:mt-5 sm:text-5xl md:text-6xl lg:text-7xl">
                Wybierz usługę.{" "}
                <span className="text-emerald-700">Zajmiemy się resztą.</span>
              </h1>
            </HeroReveal>
            <HeroReveal delay={0.3}>
              <p className="mt-5 max-w-xl text-base text-neutral-600 sm:mt-6 sm:text-lg">
                Przejrzysty katalog usług ogrodniczych z orientacyjną wyceną.
                Zamów konkretną usługę albo opiekę sezonową — wszystko w jednym
                miejscu.
              </p>
            </HeroReveal>
          </div>
          <HeroReveal delay={0.25} className="lg:col-span-5">
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {[
                { v: "10+", l: "lat" },
                { v: "500+", l: "ogrodów" },
                { v: "4.9", l: "ocena" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-4 text-center sm:px-4 sm:py-5"
                >
                  <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    <Stat value={s.v} />
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-neutral-500 sm:text-xs">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
              <span className="text-amber-500">★★★★★</span>
              <span>4.9 / 5</span>
              <span>·</span>
              <span>187 opinii klientów</span>
              <span>·</span>
              <span>Polska, cały kraj</span>
            </div>
          </HeroReveal>
        </div>

        {/* Filter bar */}
        <div className="border-y border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-3 sm:px-6">
            <span className="shrink-0 text-xs uppercase tracking-widest text-neutral-500">
              Kategoria:
            </span>
            {filters.map((f) => (
              <button
                key={f.label}
                type="button"
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${
                  f.active
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="ml-auto hidden shrink-0 text-xs text-neutral-500 md:inline">
              {services.length} usług dostępnych
            </span>
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section id="katalog" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {services.map((s, i) => (
            <StaggerItem key={s.slug} className="h-full">
              {/* Inner wrapper owns the transform + shadow hover so
                  motion's transform on StaggerItem isn't smeared by a
                  competing CSS `transition: all`. */}
              <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-neutral-900/5">
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <WarpedHoverImage
                  src={s.img}
                  alt=""
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                {i === 1 && (
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-emerald-700 px-3 py-1 text-xs font-medium text-white">
                    Najpopularniejsze
                  </span>
                )}
                {i === 6 && (
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-amber-400 px-3 py-1 text-xs font-medium text-neutral-900">
                    Projekt + realizacja
                  </span>
                )}
                <span className="absolute right-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-neutral-700">
                  0{i + 1}
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
                  <a
                    href="#kontakt"
                    className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-2 text-xs font-medium text-white transition-colors group-hover:bg-emerald-700"
                  >
                    Zamów →
                  </a>
                </div>
              </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* DETAIL / PROCESS */}
      <section id="proces" className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-10 sm:gap-12 lg:grid-cols-12 lg:items-start">
            <Reveal className="lg:col-span-5">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                Jak to działa
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Cztery kroki od kliknięcia do gotowego ogrodu.
              </h2>
              <p className="mt-5 max-w-md text-sm text-neutral-600 sm:mt-6 sm:text-base">
                Zamawiasz konkretną usługę z katalogu — resztę bierzemy na
                siebie. Bez ukrytych kosztów, w stałym kontakcie.
              </p>
              <a
                href="#kontakt"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-medium text-white sm:mt-8"
              >
                Zacznij od bezpłatnej wyceny →
              </a>
            </Reveal>
            <StaggerGrid className="grid gap-3 lg:col-span-7">
              {PROCESS.map((p, i) => (
                <StaggerItem
                  key={p.no}
                  className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-5 sm:gap-5 sm:p-6"
                >
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                      i === 0
                        ? "bg-emerald-700 text-white"
                        : "bg-neutral-100 text-neutral-900"
                    }`}
                  >
                    {p.no}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                      {p.desc}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-emerald-900 text-emerald-50">
        <StaggerGrid className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:gap-8 sm:px-6 sm:py-14 md:grid-cols-4">
          {STATS.map((s) => (
            <StaggerItem key={s.label}>
              <p className="text-4xl font-semibold tracking-tight sm:text-5xl"><Stat value={s.value} /></p>
              <p className="mt-2 text-[11px] uppercase tracking-widest text-emerald-200 sm:text-xs">
                {s.label}
              </p>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* TESTIMONIALS */}
      <section id="opinie" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5 sm:mb-12 sm:gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                Opinie klientów
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Wracają, polecają, zostają na lata.
              </h2>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-2">
              <span className="text-amber-500">★★★★★</span>
              <span className="text-sm font-medium">4.9 / 5</span>
              <span className="text-sm text-neutral-500">· 187 opinii</span>
            </div>
          </div>
        </Reveal>
        <StaggerGrid className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.slice(0, 3).map((t) => (
            <StaggerItem
              key={t.name}
              className="flex h-full flex-col rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7"
            >
              <div className="flex items-center gap-2 text-amber-500">
                ★★★★★
              </div>
              <blockquote className="mt-4 text-base leading-relaxed text-neutral-700">
                „{t.quote}”
              </blockquote>
              <figcaption className="mt-auto pt-6">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-neutral-500">{t.role}</p>
              </figcaption>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* TEAM */}
      <section id="zespol" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-5 sm:mb-12 sm:gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
              Zespół
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Ludzie, którzy odbiorą Wasz telefon.
            </h2>
          </div>
        </Reveal>
        <StaggerGrid className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4" amount={0.05}>
          {TEAM.map((m) => (
            <StaggerItem key={m.name} className="h-full">
              <div className="h-full overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-neutral-900/5">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                  <WarpedHoverImage
                    src={m.photo}
                    alt={`Portret ${m.name}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="text-lg font-semibold tracking-tight">{m.name}</p>
                  <p className="mt-1 text-xs text-emerald-700">{m.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                    {m.bio}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* CALCULATOR */}
      <section id="kalkulator" className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-5">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                Kalkulator
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Wycena{" "}
                <span className="text-emerald-700">teoretyczna</span> — w 30 sekund.
              </h2>
              <p className="mt-5 max-w-md text-sm text-neutral-600 sm:mt-6 sm:text-base">
                Wybierzcie zakres prac i wielkość ogrodu. Dokładną ofertę
                otrzymujecie po wizycie.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10">
                <CalculatorForm
                  theme={{
                    activeBg: "#047857",
                    activeFg: "#ffffff",
                    inactiveBorder: "border-neutral-300",
                    inactiveFg: "text-neutral-700 hover:bg-neutral-100",
                    priceColor: "#047857",
                    chipRadiusClass: "rounded-full",
                  }}
                  showBreakdown
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* MAP — catalog style with city chips + zip lookup */}
      <section id="mapa" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-5 sm:mb-12 sm:gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
              Region
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              {COVERAGE_HEADLINE}
            </h2>
            <p className="mt-5 max-w-2xl text-sm text-neutral-600 sm:text-base">
              {COVERAGE_INTRO}
            </p>
          </div>
        </Reveal>
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white p-2">
              <CoverageMap
                variant="streets"
                aspect="4/3"
                pinColor="047857"
                hqColor="171717"
                rounded="rounded-[20px]"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
              <label
                htmlFor="zip-lookup"
                className="text-xs uppercase tracking-[0.3em] text-neutral-500"
              >
                Wpisz kod pocztowy
              </label>
              <input
                id="zip-lookup"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="np. 85-001"
                className="mt-3 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-base outline-none transition focus:border-emerald-700"
              />
              <p className="mt-2 text-xs text-neutral-500">
                Pokażemy, kiedy najbliższa wizyta jest dostępna w Waszej
                okolicy.
              </p>
              <ul className="mt-6 flex flex-col gap-1.5 border-t border-neutral-200 pt-5">
                {COVERAGE_CITIES.slice(0, 9).map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center justify-between border-b border-neutral-100 pb-1.5 text-sm"
                  >
                    <span className="font-medium text-neutral-900">{c.name}</span>
                    <span className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="tabular-nums">{c.zip}</span>
                      <span className="tabular-nums">
                        {c.km === 0 ? "baza" : `${c.km} km`}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs italic text-neutral-500">{COVERAGE_NOTE}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ANTIGRAVITY — clean dark break between catalog and FAQ */}
      <AntigravitySection
        color="#10b981"
        bg="#0a0a0a"
        textColor="#fafafa"
        paddingClass="py-28 sm:py-36"
        count={1600}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
            Zamów raz · odbierz cały sezon
          </p>
          <h2 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Wybierz z katalogu.{" "}
            <span className="text-emerald-300">My zajmiemy się resztą.</span>
          </h2>
          <p className="mt-8 max-w-md mx-auto text-base text-neutral-300 sm:text-lg">
            Bez pakietów na siłę. Bez ukrytych kosztów. Wycena w 30 sekund, oferta w 24 godziny.
          </p>
        </div>
      </AntigravitySection>

      {/* FAQ */}
      <section id="faq" className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-5">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                FAQ
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Pięć pytań,
                <br />
                które słyszymy{" "}
                <span className="text-emerald-700">najczęściej</span>.
              </h2>
              <p className="mt-5 max-w-md text-sm text-neutral-600 sm:text-base">
                Wszystko zwięźle. Po szczegóły zapraszamy do rozmowy —
                oddzwaniamy w ciągu jednego dnia roboczego.
              </p>
              <a
                href="#kontakt"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 sm:mt-8"
              >
                Zadaj własne pytanie →
              </a>
            </Reveal>
            <StaggerGrid className="lg:col-span-7" amount={0.05}>
              <div className="divide-y divide-neutral-200 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                {FAQ.map((f, i) => (
                  <StaggerItem key={f.q}>
                    <details className="group">
                      <summary className="flex cursor-pointer items-start gap-4 px-6 py-5 transition hover:bg-neutral-50 sm:gap-5 sm:px-7 sm:py-6">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-800 sm:h-8 sm:w-8 sm:text-sm">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-base font-semibold tracking-tight sm:text-lg">
                          {f.q}
                        </span>
                        <span
                          aria-hidden
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-700 transition group-open:rotate-45 group-open:bg-emerald-700 group-open:text-white sm:h-8 sm:w-8"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                          </svg>
                        </span>
                      </summary>
                      <p className="ml-11 max-w-prose pb-5 pr-9 text-sm leading-relaxed text-neutral-600 sm:ml-13 sm:pb-6 sm:text-base">
                        {f.a}
                      </p>
                    </details>
                  </StaggerItem>
                ))}
              </div>
            </StaggerGrid>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="kontakt" className="mx-auto max-w-7xl px-4 pb-14 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
        <Reveal className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="relative min-h-[200px] overflow-hidden sm:min-h-[280px]">
              <WarpedHoverImage
                src={IMG.tulipField}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 z-10 bg-gradient-to-tr from-emerald-900/70 to-transparent" />
              <div
                className="absolute inset-0 z-20 flex items-end p-6 text-white sm:p-8"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.45)" }}
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                    Sezon {new Date().getFullYear()}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Wolne terminy
                    <br />w tym tygodniu.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8 md:p-12">
              <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Zacznijmy
                <br />
                <span className="text-emerald-700">od rozmowy.</span>
              </h2>
              <p className="mt-4 text-sm text-neutral-600 sm:mt-5 sm:text-base">
                Zostaw kontakt lub zadzwoń — w ciągu jednego dnia roboczego
                potwierdzimy termin oględzin.
              </p>
              <div className="mt-6 space-y-3 sm:mt-8">
                <a
                  href={`tel:${COMPANY.phoneRaw}`}
                  className="flex items-center justify-between rounded-2xl bg-neutral-900 px-6 py-4 text-white"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-400">
                      Telefon
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                      {COMPANY.phone}
                    </p>
                  </div>
                  <span>→</span>
                </a>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 px-6 py-4"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500">
                      E-mail
                    </p>
                    <p className="mt-1 text-base font-semibold">
                      {COMPANY.email}
                    </p>
                  </div>
                  <span className="text-emerald-700">→</span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER — catalog */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Brand */}
            <div className="lg:col-span-4">
              <a href="#" className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-700 text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                    <path d="M12 2c-3 4-6 7-6 11a6 6 0 0 0 12 0c0-4-3-7-6-11z" />
                  </svg>
                </span>
                <span className="text-base font-semibold tracking-tight">{COMPANY.name}</span>
              </a>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-600">
                Katalog usług ogrodniczych dla Bydgoszczy i województwa
                Kujawsko-Pomorskiego. Wybierz pakiet, my dojeżdżamy.
              </p>
              <Socials className="mt-6 text-neutral-700" variant="outline" />
            </div>

            {/* Katalog */}
            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Katalog</p>
              <ul className="mt-5 space-y-2.5 text-sm text-neutral-700">
                {SERVICES.slice(0, 5).map((s) => (
                  <li key={s.slug}>
                    <a href={`#${s.slug}`} className="underline-offset-4 hover:text-emerald-700 hover:underline">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Firma */}
            <div className="lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Firma</p>
              <ul className="mt-5 space-y-2.5 text-sm text-neutral-700">
                <li><a href="#zespol" className="underline-offset-4 hover:text-emerald-700 hover:underline">Zespół</a></li>
                <li><a href="#proces" className="underline-offset-4 hover:text-emerald-700 hover:underline">Jak to działa</a></li>
                <li><a href="#opinie" className="underline-offset-4 hover:text-emerald-700 hover:underline">Opinie</a></li>
                <li><a href="#faq" className="underline-offset-4 hover:text-emerald-700 hover:underline">FAQ</a></li>
              </ul>
            </div>

            {/* Kontakt */}
            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Kontakt</p>
              <address className="mt-5 space-y-3 text-sm not-italic">
                <a
                  href={`tel:${COMPANY.phoneRaw}`}
                  className="block rounded-2xl bg-neutral-900 px-4 py-3 text-white transition hover:bg-emerald-700"
                >
                  <span className="text-xs uppercase tracking-wider text-neutral-400">Telefon</span>
                  <span className="mt-1 block text-lg font-semibold">{COMPANY.phone}</span>
                </a>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="block rounded-2xl border border-neutral-200 px-4 py-3 transition hover:border-emerald-700"
                >
                  <span className="text-xs uppercase tracking-wider text-neutral-500">E-mail</span>
                  <span className="mt-1 block text-sm font-semibold text-neutral-900">{COMPANY.email}</span>
                </a>
                <p className="px-1 text-xs text-neutral-500">
                  {ADDRESS.fullLine}
                  <br />
                  {ADDRESS.hours}
                </p>
              </address>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-6 text-xs text-neutral-500">
            <p>© {new Date().getFullYear()} {COMPANY.name} · NIP {ADDRESS.nip}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-neutral-900 hover:underline">{l.label}</a>
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
