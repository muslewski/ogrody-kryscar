import type { Metadata } from "next";
import { COMPANY, SERVICES, TESTIMONIALS, STATS, FAQ, TEAM, ADDRESS, LEGAL_LINKS, IMG } from "@/lib/data";
import {
  COVERAGE_HEADLINE,
  COVERAGE_INTRO,
} from "@/lib/coverage";
import { Reveal, HeroReveal, StaggerGrid, StaggerItem } from "@/components/motion";
import { Stat } from "@/components/Stat";
import { SitePreloader } from "@/components/SitePreloader";
import { CoverageMap } from "@/components/CoverageMap";
import { AntigravitySection } from "@/components/AntigravitySection";
import { Socials } from "@/components/Socials";
import { CalculatorForm } from "@/components/CalculatorForm";
import { WarpedHoverImage } from "@/components/WarpedHoverImage";
import { Ex3Nav } from "./_nav";

const GARDEN_STYLES = [
  { name: "Naturalistyczny", note: "Łąki kwietne, byliny rodzime", bg: "bg-emerald-100", img: IMG.echinacea },
  { name: "Skandynawski", note: "Brzozy, kamień, minimalna paleta", bg: "bg-stone-100", img: IMG.lawnTexture },
  { name: "Angielski", note: "Klasyczne rabaty, róże, hortensje", bg: "bg-amber-100", img: IMG.daffodils },
  { name: "Śródziemnomorski", note: "Trawy ozdobne, lawenda, kamień", bg: "bg-emerald-50", img: IMG.hedge1 },
  { name: "Wiejski", note: "Sad, zioła, drewniane akcenty", bg: "bg-stone-200", img: IMG.cherry },
  { name: "Minimalistyczny", note: "Trawnik, jedna forma, czyste linie", bg: "bg-emerald-200", img: IMG.parkPath },
];

export const metadata: Metadata = { title: `${COMPANY.name} — Bento` };

export default function Example3() {
  return (
    <>
    <SitePreloader
      storageKey="ogrody:ex3"
      variant="stairs"
      duration={1500}
      bgColor="#064e3b"
      iconColor="#a7f3d0"
      iconSize={52}
      brandClassName="text-4xl md:text-6xl font-[family-name:var(--font-bricolage)] tracking-tight text-emerald-50"
      taglineClassName="text-[10px] uppercase tracking-[0.4em] font-medium text-emerald-200/80"
      stairCount={6}
      stairsRevealFrom="center"
    />
    <main className="min-h-screen bg-[#f5f1e8] font-[family-name:var(--font-bricolage)] text-stone-900">
      {/* NAV — fixed with isScrolled */}
      <Ex3Nav />
      {/* Reserve space behind the fixed nav so the bento grid clears */}
      <div className="h-20 sm:h-24" />

      {/* BENTO */}
      <section className="mx-auto max-w-[1400px] px-4 pb-8 sm:px-6">
        <div className="grid grid-cols-12 gap-3 sm:gap-4">
          {/* HERO CARD */}
          <div className="col-span-12 row-span-2 flex min-h-[380px] flex-col justify-center rounded-3xl bg-emerald-900 p-6 text-stone-50 sm:min-h-[420px] sm:p-8 md:min-h-[480px] md:p-12 lg:col-span-8">
            <HeroReveal delay={0.05}>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-700/40 px-3 py-1 text-xs text-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Wolne terminy w sezonie {new Date().getFullYear()}
              </span>
            </HeroReveal>
            <HeroReveal delay={0.15}>
              <h1 className="mt-6 text-4xl leading-[1.02] tracking-tight sm:mt-8 sm:text-5xl md:text-7xl">
                Ogrodnicy,
                <br />
                którzy{" "}
                <span className="font-[family-name:var(--font-fraunces)] italic text-emerald-200">
                  naprawdę
                </span>
                <br />
                znają się na ogrodach.
              </h1>
            </HeroReveal>
            <HeroReveal delay={0.3} className="mt-8 sm:mt-10">
            <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6">
              <p className="max-w-md text-sm text-stone-300/80 sm:text-base">
                Koszenie, pielęgnacja, sadzenie, cięcie — pełna obsługa Twojego
                ogrodu przez cały sezon.
              </p>
              <a
                href="#"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-200 text-emerald-900 sm:h-14 sm:w-14 md:h-16 md:w-16"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 fill-none stroke-current"
                  strokeWidth={2}
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
            </HeroReveal>
          </div>

          {/* IMG CARD 1 */}
          <div className="relative col-span-6 row-span-1 overflow-hidden rounded-3xl bg-stone-200 lg:col-span-4">
            <WarpedHoverImage
              src={IMG.lawnTexture}
              alt=""
              className="h-full min-h-[220px] w-full object-cover"
            />
            <span className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-xs">
              Koszenie
            </span>
          </div>

          {/* RATING CARD */}
          <div className="col-span-6 row-span-1 flex flex-col justify-between gap-4 rounded-3xl bg-stone-900 p-4 text-stone-50 sm:p-6 lg:col-span-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-500 sm:text-xs">
                Oceny klientów
              </p>
              <p className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl italic leading-none sm:mt-3 sm:text-5xl md:text-6xl lg:text-7xl">
                4.9
                <span className="text-stone-500">/5</span>
              </p>
              <div className="mt-2 flex gap-0.5 text-sm text-amber-300 sm:text-base">★★★★★</div>
            </div>
            <p className="text-xs text-stone-400 sm:text-sm">
              Średnia z 187 opinii w 3 sezonach.
            </p>
          </div>

          {/* CONTACT QUICK */}
          <div className="col-span-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-dashed border-stone-900/20 bg-[#f5f1e8] p-5 sm:gap-6 sm:p-6 md:p-10 lg:col-span-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-500">
                Zadzwoń, by zacząć
              </p>
              <p className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl italic sm:text-3xl">
                {COMPANY.phone}
              </p>
            </div>
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="rounded-full bg-stone-900 px-5 py-3 text-xs uppercase tracking-wider text-white"
            >
              Dzwonię →
            </a>
          </div>

          {/* SECTION MARKER */}
          <div className="col-span-12 mt-8 flex items-baseline gap-4 sm:mt-12">
            <span className="font-[family-name:var(--font-fraunces)] text-3xl italic text-emerald-700 sm:text-4xl">
              02.
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-stone-600">
              Co robimy
            </span>
            <span className="h-px flex-1 bg-stone-300" />
            <span className="hidden text-xs text-stone-500 sm:inline">
              {SERVICES.length} usług w jednym miejscu
            </span>
          </div>

          {/* SERVICES TITLE */}
          <Reveal className="col-span-12 mt-2">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="max-w-3xl text-3xl tracking-tight sm:text-4xl md:text-5xl">
                Wszystko, co dzieje się w ogrodzie — robimy sami.
              </h2>
            </div>
          </Reveal>

          {/* SERVICE CARDS */}
          {SERVICES.slice(0, 8).map((s, i) => {
            const sizes = [
              "lg:col-span-4",
              "lg:col-span-3",
              "lg:col-span-5",
              "lg:col-span-3",
              "lg:col-span-4",
              "lg:col-span-5",
              "lg:col-span-4",
              "lg:col-span-4",
            ];
            const bgs = [
              "bg-emerald-50",
              "bg-stone-900 text-stone-50",
              "bg-amber-100",
              "bg-emerald-50",
              "bg-stone-100",
              "bg-emerald-100",
              "bg-stone-900 text-stone-50",
              "bg-amber-50",
            ];
            return (
              <article
                key={s.slug}
                className={`group relative col-span-12 flex flex-col justify-between rounded-3xl p-6 sm:p-7 md:col-span-6 ${sizes[i]} ${bgs[i]} min-h-[200px] sm:min-h-[220px]`}
              >
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-60">
                    0{i + 1}
                  </p>
                  <h3 className="mt-3 text-xl tracking-tight sm:mt-4 sm:text-2xl md:text-3xl">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed opacity-80 sm:mt-3">
                    {s.short}
                  </p>
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-sm sm:mt-6">
                  {s.description.split(".")[0]}
                  <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </article>
            );
          })}

          {/* SECTION MARKER */}
          <div className="col-span-12 mt-8 flex items-baseline gap-4 sm:mt-12">
            <span className="font-[family-name:var(--font-fraunces)] text-3xl italic text-emerald-700 sm:text-4xl">
              03.
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-stone-600">
              W liczbach
            </span>
            <span className="h-px flex-1 bg-stone-300" />
          </div>

          {/* STATS BENTO */}
          <StaggerGrid className="col-span-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {STATS.map((s) => (
              <StaggerItem
                key={s.label}
                className="rounded-3xl border border-stone-900/10 bg-white p-5 sm:p-6"
              >
                <p className="font-[family-name:var(--font-fraunces)] text-4xl italic sm:text-5xl">
                  <Stat value={s.value} />
                </p>
                <p className="mt-2 text-xs uppercase tracking-wider text-stone-500">
                  {s.label}
                </p>
              </StaggerItem>
            ))}
          </StaggerGrid>

          {/* SECTION MARKER */}
          <div className="col-span-12 mt-8 flex items-baseline gap-4 sm:mt-12">
            <span className="font-[family-name:var(--font-fraunces)] text-3xl italic text-emerald-700 sm:text-4xl">
              04.
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-stone-600">
              Opinie klientów
            </span>
            <span className="h-px flex-1 bg-stone-300" />
            <span className="hidden text-xs text-stone-500 sm:inline">187 opinii · 4.9 / 5</span>
          </div>

          {/* TESTIMONIAL + IMAGE BENTO */}
          <Reveal className="col-span-12">
            <div className="grid grid-cols-12 gap-3 sm:gap-4">
              <figure className="col-span-12 flex flex-col justify-between rounded-3xl bg-stone-900 p-6 text-stone-50 sm:p-7 lg:col-span-7">
                <div>
                  <div className="flex items-center gap-1 text-amber-300" aria-label="Ocena 5 na 5">
                    <span aria-hidden>★★★★★</span>
                    <span className="ml-2 text-xs uppercase tracking-wider text-stone-400">
                      5.0 · weryfikowana opinia
                    </span>
                  </div>
                  <blockquote className="mt-5 font-[family-name:var(--font-fraunces)] text-xl italic leading-snug text-stone-100 sm:mt-6 sm:text-2xl">
                    „{TESTIMONIALS[0].quote}”
                  </blockquote>
                </div>

                <figcaption className="mt-6 flex items-center gap-4 border-t border-white/10 pt-5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-700 font-[family-name:var(--font-fraunces)] text-base italic text-emerald-50">
                    {TESTIMONIALS[0].name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-50">
                      {TESTIMONIALS[0].name}
                    </p>
                    <p className="truncate text-xs text-stone-400">
                      {TESTIMONIALS[0].role}
                    </p>
                  </div>
                </figcaption>
              </figure>
              <div className="col-span-12 grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-5 lg:grid-cols-1 lg:grid-rows-2">
                <div className="relative overflow-hidden rounded-3xl">
                  <WarpedHoverImage
                    src={IMG.daffodils}
                    alt=""
                    className="h-full min-h-[140px] w-full object-cover sm:min-h-[140px]"
                  />
                </div>
                <div className="relative overflow-hidden rounded-3xl">
                  <WarpedHoverImage
                    src={IMG.hedge1}
                    alt=""
                    className="h-full min-h-[140px] w-full object-cover sm:min-h-[140px]"
                  />
                </div>
              </div>
            </div>
          </Reveal>

          {/* SECTION MARKER */}
          <div className="col-span-12 mt-8 flex items-baseline gap-4 sm:mt-12">
            <span className="font-[family-name:var(--font-fraunces)] text-3xl italic text-emerald-700 sm:text-4xl">
              05.
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-stone-600">
              Zespół
            </span>
            <span className="h-px flex-1 bg-stone-300" />
            <span className="hidden text-xs text-stone-500 sm:inline">4 osoby · 1 ekipa</span>
          </div>

          {/* TEAM — magazine spread, breaks the bento rhythm intentionally */}
          <Reveal className="col-span-12 mt-2">
            <div className="grid grid-cols-12 gap-3 sm:gap-4">
              {/* Lead portrait — founder, big card, photo on top */}
              <article className="group relative col-span-12 overflow-hidden rounded-3xl bg-emerald-900 text-stone-50 lg:col-span-7">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <WarpedHoverImage
                    src={TEAM[0].photo}
                    alt={`Portret ${TEAM[0].name}`}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-emerald-950/85 via-emerald-950/20 to-transparent" />
                  <span className="absolute left-5 top-5 z-20 rounded-full bg-emerald-200/95 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-900">
                    Założyciel
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-7 md:p-10">
                  <p className="text-xs uppercase tracking-widest text-emerald-300">
                    Zespół
                  </p>
                  <h2 className="mt-3 text-4xl leading-tight tracking-tight md:text-5xl">
                    Cztery osoby,
                    <br />
                    <span className="font-[family-name:var(--font-fraunces)] italic text-emerald-200">
                      jedna ekipa
                    </span>
                    .
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-200/85">
                    {TEAM[0].name} prowadzi firmę od 2014 r. Wraz z nim ogrodami
                    Państwa zajmują się trzy osoby z ekipy.
                  </p>
                </div>
              </article>

              {/* Three smaller portrait cards stacked beside the lead */}
              <div className="col-span-12 grid grid-cols-3 gap-3 sm:gap-4 lg:col-span-5 lg:grid-cols-1">
                {TEAM.slice(1, 4).map((m, i) => {
                  const bgs = [
                    "bg-amber-100 text-stone-900",
                    "bg-stone-100 text-stone-900",
                    "bg-emerald-100 text-emerald-950",
                  ];
                  return (
                    <StaggerItem
                      key={m.name}
                      className={`group flex flex-col overflow-hidden rounded-3xl ${bgs[i]} lg:flex-row`}
                    >
                      <div className="relative aspect-square w-full overflow-hidden lg:aspect-[4/5] lg:w-2/5 lg:shrink-0">
                        <WarpedHoverImage
                          src={m.photo}
                          alt={`Portret ${m.name}`}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-center p-4 lg:p-5">
                        <p className="font-[family-name:var(--font-fraunces)] text-xl italic leading-tight lg:text-2xl">
                          {m.name}
                        </p>
                        <p className="mt-1.5 text-[11px] uppercase tracking-wider opacity-65">
                          {m.role}
                        </p>
                        <p className="mt-2 hidden text-xs leading-relaxed opacity-75 lg:block">
                          {m.bio}
                        </p>
                      </div>
                    </StaggerItem>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* SECTION MARKER */}
          <div className="col-span-12 mt-8 flex items-baseline gap-4 sm:mt-12">
            <span className="font-[family-name:var(--font-fraunces)] text-3xl italic text-emerald-700 sm:text-4xl">
              06.
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-stone-600">
              Style ogrodów
            </span>
            <span className="h-px flex-1 bg-stone-300" />
          </div>

          {/* GARDEN STYLES BENTO — bespoke for ex3 */}
          <Reveal className="col-span-12 mt-2">
            <div className="grid grid-cols-12 gap-3 sm:gap-4">
              <div className="col-span-12 flex flex-col justify-between rounded-3xl bg-amber-100 p-7 md:p-10 lg:col-span-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-amber-900/70">
                    Style ogrodów
                  </p>
                  <h2 className="mt-4 text-4xl leading-tight tracking-tight text-stone-900 md:text-5xl">
                    Jaki ogród
                    <br />
                    <span className="font-[family-name:var(--font-fraunces)] italic">
                      najbardziej Wam pasuje?
                    </span>
                  </h2>
                </div>
                <p className="mt-6 text-sm text-stone-700">
                  Pomożemy znaleźć styl, który pasuje do Waszego domu i sposobu
                  spędzania czasu w ogrodzie.
                </p>
              </div>
              <StaggerGrid className="col-span-12 grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-8 lg:grid-cols-3" amount={0.05}>
                {GARDEN_STYLES.map((g) => (
                  <StaggerItem
                    key={g.name}
                    className={`overflow-hidden rounded-3xl ${g.bg}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <WarpedHoverImage
                        src={g.img}
                        alt={g.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-[family-name:var(--font-fraunces)] text-lg italic">
                        {g.name}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed opacity-70">
                        {g.note}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </div>
          </Reveal>

          {/* SECTION MARKER */}
          <div className="col-span-12 mt-8 flex items-baseline gap-4 sm:mt-12">
            <span className="font-[family-name:var(--font-fraunces)] text-3xl italic text-emerald-700 sm:text-4xl">
              07.
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-stone-600">
              Wycena i region
            </span>
            <span className="h-px flex-1 bg-stone-300" />
          </div>

          {/* CALCULATOR + MAP BENTO */}
          <Reveal className="col-span-12 mt-2">
            <div className="grid grid-cols-12 gap-3 sm:gap-4">
              <div className="col-span-12 flex flex-col rounded-3xl bg-[#f5f1e8] p-6 sm:p-8 lg:col-span-7">
                <p className="text-xs uppercase tracking-widest text-stone-500">
                  Kalkulator
                </p>
                <h2 className="mt-3 max-w-md text-3xl tracking-tight md:text-4xl">
                  Wycena{" "}
                  <span className="font-[family-name:var(--font-fraunces)] italic">
                    teoretyczna
                  </span>
                  .
                </h2>
                <div className="mt-6">
                  <CalculatorForm
                    theme={{
                      activeBg: "#1c1917",
                      activeFg: "#f5f1e8",
                      inactiveBorder: "border-stone-900/15",
                      inactiveFg: "text-stone-700 hover:bg-stone-900/5",
                      priceColor: "#1c1917",
                      priceFontClass: "font-[family-name:var(--font-fraunces)] italic",
                      chipRadiusClass: "rounded-full",
                    }}
                  />
                </div>
              </div>
              <div className="col-span-12 flex flex-col gap-3 sm:gap-4 lg:col-span-5">
                <div className="rounded-3xl bg-emerald-900 p-6 text-stone-50 sm:p-8">
                  <p className="text-xs uppercase tracking-widest text-emerald-300">
                    Region
                  </p>
                  <h3 className="mt-3 text-2xl tracking-tight md:text-3xl">
                    {COVERAGE_HEADLINE}
                  </h3>
                  <p className="mt-4 text-sm text-emerald-100/80">
                    {COVERAGE_INTRO}
                  </p>
                </div>
                <div className="overflow-hidden rounded-3xl bg-emerald-50">
                  <CoverageMap
                    variant="outdoors"
                    aspect="1/1"
                    pinColor="047857"
                    hqColor="064e3b"
                    rounded=""
                  />
                </div>
              </div>
            </div>
          </Reveal>

          {/* ANTIGRAVITY BENTO — full-width fun panel */}
          <div className="col-span-12 mt-3 overflow-hidden rounded-3xl sm:mt-4">
            <AntigravitySection
              color="#86efac"
              bg="#064e3b"
              textColor="#ecfdf5"
              paddingClass="py-24 sm:py-28"
              className="rounded-3xl"
              count={1600}
            >
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-xs uppercase tracking-widest text-emerald-300">
                  Tylko taki ogród działa
                </p>
                <h2 className="mt-4 text-5xl leading-[1.02] tracking-tight sm:text-6xl">
                  Trawnik,{" "}
                  <span className="font-[family-name:var(--font-fraunces)] italic text-emerald-200">
                    który mówi sam
                  </span>
                  <br />
                  za siebie.
                </h2>
                <p className="mt-6 max-w-md mx-auto text-base text-emerald-50/80 sm:text-lg">
                  Pokażcie sąsiadom różnicę. Pokażemy im razem.
                </p>
              </div>
            </AntigravitySection>
          </div>

          {/* SECTION MARKER */}
          <div className="col-span-12 mt-8 flex items-baseline gap-4 sm:mt-12">
            <span className="font-[family-name:var(--font-fraunces)] text-3xl italic text-emerald-700 sm:text-4xl">
              08.
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-stone-600">
              Pytania
            </span>
            <span className="h-px flex-1 bg-stone-300" />
          </div>

          {/* FAQ BENTO */}
          <Reveal className="col-span-12 mt-2">
            <div className="grid grid-cols-12 gap-3 sm:gap-4">
              <div className="col-span-12 flex flex-col justify-between rounded-3xl bg-emerald-900 p-7 text-stone-50 md:p-10 lg:col-span-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-emerald-300">
                    FAQ
                  </p>
                  <h2 className="mt-4 text-4xl leading-tight tracking-tight md:text-5xl">
                    Pytają
                    <br />
                    <span className="font-[family-name:var(--font-fraunces)] italic text-emerald-200">
                      najczęściej
                    </span>
                    .
                  </h2>
                  <p className="mt-6 max-w-xs text-sm text-stone-300/80">
                    Pięć szybkich odpowiedzi. Reszta zwykle na rozmowie.
                  </p>
                </div>
                <a
                  href="#kontakt"
                  className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-200 px-5 py-3 text-sm font-medium text-emerald-900 transition hover:bg-emerald-100"
                >
                  Mam inne pytanie →
                </a>
              </div>
              <div className="col-span-12 grid grid-cols-1 gap-3 sm:gap-4 lg:col-span-7">
                {FAQ.map((f, i) => {
                  const bgs = [
                    "bg-stone-100",
                    "bg-amber-100",
                    "bg-emerald-50",
                    "bg-stone-900 text-stone-50",
                    "bg-emerald-100",
                  ];
                  return (
                    <StaggerItem key={f.q} className={`rounded-3xl ${bgs[i % bgs.length]}`}>
                      <details className="group">
                        <summary className="flex cursor-pointer items-start justify-between gap-4 p-6 sm:p-7">
                          <div className="flex items-start gap-4">
                            <span className="font-[family-name:var(--font-fraunces)] text-2xl italic opacity-60 sm:text-3xl">
                              0{i + 1}
                            </span>
                            <span className="text-base font-medium tracking-tight sm:text-lg">
                              {f.q}
                            </span>
                          </div>
                          <span
                            aria-hidden
                            className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/10 text-lg transition group-open:rotate-45 group-open:bg-black group-open:text-white"
                          >
                            +
                          </span>
                        </summary>
                        <p className="px-6 pb-6 text-sm leading-relaxed opacity-80 sm:px-7 sm:pb-7">
                          {f.a}
                        </p>
                      </details>
                    </StaggerItem>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* SECTION MARKER */}
          <div className="col-span-12 mt-8 flex items-baseline gap-4 sm:mt-12">
            <span className="font-[family-name:var(--font-fraunces)] text-3xl italic text-emerald-700 sm:text-4xl">
              09.
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-stone-600">
              Zaczynamy
            </span>
            <span className="h-px flex-1 bg-stone-300" />
          </div>

          {/* FINAL CTA */}
          <Reveal className="col-span-12 mt-2">
          <div className="grid grid-cols-12 gap-3 sm:gap-4">
            <div className="relative col-span-12 flex flex-col justify-between overflow-hidden rounded-3xl bg-emerald-200 p-6 sm:p-10 lg:col-span-7">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-900/80">
                  Zacznijmy
                </p>
                <h3 className="mt-3 text-4xl leading-tight text-emerald-950 sm:mt-4 sm:text-5xl md:text-6xl">
                  Bezpłatna
                  <br />
                  <span className="font-[family-name:var(--font-fraunces)] italic">
                    wycena na miejscu.
                  </span>
                </h3>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
                <a
                  href={`tel:${COMPANY.phoneRaw}`}
                  className="rounded-full bg-emerald-950 px-6 py-3 text-sm font-medium text-white"
                >
                  {COMPANY.phone}
                </a>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="rounded-full border border-emerald-950/50 px-6 py-3 text-sm font-medium text-emerald-950"
                >
                  Napisz e-mail
                </a>
              </div>
            </div>
            <div className="relative col-span-12 overflow-hidden rounded-3xl lg:col-span-5">
              <WarpedHoverImage
                src={IMG.parkPath}
                alt=""
                className="h-full min-h-[200px] w-full object-cover sm:min-h-[260px]"
              />
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER — bento style */}
      <footer className="mx-auto max-w-[1400px] px-4 pb-8 sm:px-6">
        <div className="grid grid-cols-12 gap-3 sm:gap-4">
          {/* Brand block */}
          <div className="col-span-12 flex flex-col justify-between rounded-3xl bg-stone-900 p-7 text-stone-50 md:p-10 lg:col-span-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-200 text-emerald-900">
                  <span className="font-[family-name:var(--font-fraunces)] text-lg italic">k</span>
                </div>
                <span className="text-sm font-medium">{COMPANY.name}</span>
              </div>
              <p className="mt-6 font-[family-name:var(--font-fraunces)] text-3xl italic leading-tight text-emerald-200 md:text-4xl">
                Trzymamy
                <br />
                Wasz ogród
                <br />
                w grafiku.
              </p>
            </div>
            <Socials className="mt-8 text-emerald-200" variant="outline" />
          </div>

          {/* Kontakt */}
          <div className="col-span-12 rounded-3xl bg-amber-100 p-7 sm:col-span-6 md:p-8 lg:col-span-4">
            <p className="text-xs uppercase tracking-widest text-amber-900/70">Kontakt</p>
            <address className="mt-4 not-italic">
              <p className="font-[family-name:var(--font-fraunces)] text-3xl italic">
                <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a>
              </p>
              <p className="mt-2 text-sm">
                <a href={`mailto:${COMPANY.email}`} className="underline-offset-4 hover:underline">
                  {COMPANY.email}
                </a>
              </p>
              <p className="mt-4 text-sm text-stone-700">{ADDRESS.fullLine}</p>
              <p className="mt-1 text-xs text-stone-600">{ADDRESS.hours}</p>
            </address>
          </div>

          {/* Strona */}
          <div className="col-span-12 rounded-3xl bg-emerald-100 p-7 sm:col-span-6 md:p-8 lg:col-span-3">
            <p className="text-xs uppercase tracking-widest text-emerald-900/70">Strona</p>
            <ul className="mt-4 space-y-2.5 text-sm text-emerald-950">
              <li><a href="#uslugi" className="underline-offset-4 hover:underline">Usługi</a></li>
              <li><a href="#realizacje" className="underline-offset-4 hover:underline">Realizacje</a></li>
              <li><a href="#zespol" className="underline-offset-4 hover:underline">Zespół</a></li>
              <li><a href="#faq" className="underline-offset-4 hover:underline">FAQ</a></li>
              <li><a href="#kontakt" className="underline-offset-4 hover:underline">Kontakt</a></li>
            </ul>
          </div>

          {/* Bottom bar */}
          <div className="col-span-12 mt-2 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-stone-100 px-6 py-5 text-xs text-stone-600">
            <p>© {new Date().getFullYear()} {COMPANY.name} · NIP {ADDRESS.nip}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-stone-900 hover:underline">{l.label}</a>
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
