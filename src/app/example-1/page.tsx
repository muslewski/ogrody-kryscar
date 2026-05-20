import type { Metadata } from "next";
import { COMPANY, SERVICES, PROCESS, TESTIMONIALS, STATS, FAQ, TEAM, ADDRESS, LEGAL_LINKS, IMG } from "@/lib/data";
import {
  COVERAGE_CITIES,
  COVERAGE_HEADLINE,
  COVERAGE_INTRO,
  COVERAGE_NOTE,
} from "@/lib/coverage";
import { Reveal, HeroReveal, StaggerGrid, StaggerItem } from "@/components/motion";
import { Socials } from "@/components/Socials";
import { Stat } from "@/components/Stat";
import { SitePreloader } from "@/components/SitePreloader";
import { CoverageMap, CityList } from "@/components/CoverageMap";
import { AntigravitySection } from "@/components/AntigravitySection";
import { CalculatorForm } from "@/components/CalculatorForm";
import { WarpedHoverImage } from "@/components/WarpedHoverImage";

export const metadata: Metadata = { title: `${COMPANY.name} — Minimalist` };

export default function Example1() {
  return (
    <>
    <SitePreloader
      storageKey="ogrody:ex1"
      variant="slide"
      duration={1400}
      bgColor="#fafaf9"
      iconColor="#047857"
      iconSize={48}
      brandClassName="text-3xl md:text-5xl tracking-tight text-stone-900"
      taglineClassName="text-[10px] uppercase tracking-[0.4em] font-medium text-emerald-700"
    />
    <main className="min-h-screen bg-stone-50 font-[family-name:var(--font-inter)] text-stone-900">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <a href="#" className="flex items-center gap-2.5 sm:gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-700 text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12 2c-3 4-6 7-6 11a6 6 0 0 0 12 0c0-4-3-7-6-11z" />
              </svg>
            </span>
            <span className="text-sm font-medium tracking-tight">
              {COMPANY.name}
            </span>
          </a>
          <nav className="hidden gap-8 text-sm text-stone-600 md:flex">
            <a href="#uslugi" className="hover:text-emerald-700">Usługi</a>
            <a href="#o-nas" className="hover:text-emerald-700">O nas</a>
            <a href="#proces" className="hover:text-emerald-700">Jak pracujemy</a>
            <a href="#opinie" className="hover:text-emerald-700">Opinie</a>
            <a href="#kontakt" className="hover:text-emerald-700">Kontakt</a>
          </nav>
          <a
            href={`tel:${COMPANY.phoneRaw}`}
            className="shrink-0 rounded-full bg-stone-900 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-emerald-800"
          >
            <span className="md:hidden">Zadzwoń</span>
            <span className="hidden md:inline">{COMPANY.phone}</span>
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <HeroReveal delay={0.05}>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                Profesjonalne usługi ogrodnicze
              </p>
            </HeroReveal>
            <HeroReveal delay={0.15}>
              <h1 className="mt-5 text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Twój ogród
                <br />
                w naszych <span className="font-[family-name:var(--font-fraunces)] italic text-emerald-800">rękach</span>.
              </h1>
            </HeroReveal>
            <HeroReveal delay={0.3}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-600 sm:mt-8 sm:text-lg">
                Koszenie, pielęgnacja, sadzenie, cięcie i sezonowe porządki —
                wszystko, czego potrzebuje Twój ogród, w jednym miejscu.
                Bez systemów nawadniania.
              </p>
            </HeroReveal>
            <HeroReveal delay={0.45}>
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
                <a
                  href="#kontakt"
                  className="rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-800"
                >
                  Bezpłatna wycena
                </a>
                <a
                  href="#uslugi"
                  className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-800 transition hover:border-stone-900"
                >
                  Zobacz usługi →
                </a>
              </div>
            </HeroReveal>

            <HeroReveal delay={0.6}>
              <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-stone-200 pt-6 sm:mt-16 sm:gap-8 sm:pt-8">
                {STATS.slice(0, 3).map((s) => (
                  <div key={s.label}>
                    <dt className="text-2xl tracking-tight sm:text-3xl"><Stat value={s.value} /></dt>
                    <dd className="mt-1 text-[10px] uppercase tracking-wider text-stone-500 sm:text-xs">
                      {s.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </HeroReveal>
          </div>

          <HeroReveal delay={0.2} className="relative lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-stone-200">
              <WarpedHoverImage
                src={IMG.gardenerYard}
                alt="Praca w ogrodzie"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden w-56 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl lg:block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-700/10 text-emerald-700">
                  ★
                </div>
                <div>
                  <p className="text-sm font-medium">4.9 / 5</p>
                  <p className="text-xs text-stone-500">opinie klientów</p>
                </div>
              </div>
            </div>
          </HeroReveal>
        </div>
      </section>

      {/* TRUSTED STRIP */}
      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 text-sm text-stone-500 sm:gap-6 sm:px-6 sm:py-6">
          <span>Zaufali nam właściciele domów, wspólnoty i firmy.</span>
          <div className="flex flex-wrap gap-x-4 gap-y-2 font-[family-name:var(--font-fraunces)] italic text-stone-700 sm:gap-6">
            <span>Domy jednorodzinne</span>
            <span className="hidden sm:inline">·</span>
            <span>Wspólnoty</span>
            <span className="hidden sm:inline">·</span>
            <span>Domki letniskowe</span>
            <span className="hidden sm:inline">·</span>
            <span>Biura i ogrody firmowe</span>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="uslugi" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6 sm:gap-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                01 — Usługi
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl tracking-tight sm:mt-4 sm:text-4xl md:text-5xl">
                Wszystko, czego potrzebuje Twój ogród przez cały rok.
              </h2>
            </div>
            <a
              href="#kontakt"
              className="hidden whitespace-nowrap text-sm text-stone-600 underline-offset-4 hover:underline md:inline"
            >
              Zapytaj o wycenę →
            </a>
          </div>
        </Reveal>

        <StaggerGrid className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <StaggerItem key={s.slug} className="group flex flex-col gap-5 bg-stone-50 p-7 transition-colors hover:bg-white">
              <span className="text-xs text-stone-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-xl tracking-tight">{s.title}</h3>
              <p className="text-sm leading-relaxed text-stone-600">
                {s.description}
              </p>
              <span className="mt-auto inline-flex items-center text-xs text-emerald-700">
                Dowiedz się więcej
                <span className="ml-1 transition group-hover:translate-x-1">→</span>
              </span>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* ABOUT */}
      <section id="o-nas" className="bg-stone-100">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:gap-12 sm:px-6 sm:py-20 lg:grid-cols-2 lg:py-28">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
              <WarpedHoverImage
                src={IMG.lawnTexture}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative aspect-square w-full translate-y-6 overflow-hidden rounded-2xl sm:translate-y-12">
              <WarpedHoverImage
                src={IMG.hedgeShears}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
              <WarpedHoverImage
                src={IMG.sprout}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative aspect-square w-full translate-y-6 overflow-hidden rounded-2xl sm:translate-y-12">
              <WarpedHoverImage
                src={IMG.daffodils}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <Reveal className="lg:pl-8">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
              02 — O nas
            </p>
            <h2 className="mt-3 text-3xl tracking-tight sm:mt-4 sm:text-4xl md:text-5xl">
              Dziesięć lat w trawie po kolana.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-stone-600 sm:mt-6 sm:text-lg">
              Ogrody Kryscar zaczęły się od miłości do ziemi i odrobiny
              uporu. Dzisiaj prowadzimy kilkaset ogrodów — od kilkuarowych
              działek po reprezentacyjne tereny zielone wspólnot i firm.
            </p>
            <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">
              Pracujemy{" "}
              <span className="font-[family-name:var(--font-fraunces)] italic">
                regularnie, sezonowo i jednorazowo
              </span>
              . Zawsze własnym sprzętem i własnymi rękami.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-5 sm:mt-10 sm:gap-6">
              {[
                ["Sprzęt", "Profesjonalne kosiarki, podkaszarki, nożyce"],
                ["Sezon", "Marzec – listopad"],
                ["Forma współpracy", "Jednorazowo lub stale"],
                ["Płatność", "Faktura lub paragon"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs uppercase tracking-wider text-stone-500">
                    {k}
                  </p>
                  <p className="mt-1 text-sm text-stone-900">{v}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROCESS */}
      <section id="proces" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
            03 — Jak pracujemy
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl tracking-tight sm:mt-4 sm:text-4xl md:text-5xl">
            Cztery kroki do ogrodu, którym nie musisz się martwić.
          </h2>
        </Reveal>
        <StaggerGrid className="mt-10 grid gap-8 sm:mt-16 sm:gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p) => (
            <StaggerItem key={p.no} className="border-t border-stone-300 pt-5 sm:pt-6">
              <span className="font-[family-name:var(--font-fraunces)] text-4xl italic text-emerald-800 sm:text-5xl">
                {p.no}
              </span>
              <h3 className="mt-3 text-lg tracking-tight sm:mt-4">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:mt-3">
                {p.desc}
              </p>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* TESTIMONIALS */}
      <section id="opinie" className="bg-emerald-900 text-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              04 — Opinie
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl tracking-tight sm:mt-4 sm:text-4xl md:text-5xl">
              Klienci mówią o nas{" "}
              <span className="font-[family-name:var(--font-fraunces)] italic text-emerald-200">
                prosto i ciepło
              </span>
              .
            </h2>
          </Reveal>
          <StaggerGrid className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-3">
            {TESTIMONIALS.slice(0, 3).map((t) => (
              <StaggerItem key={t.name} className="rounded-2xl border border-emerald-800 bg-emerald-950/40 p-7">
                <blockquote className="text-lg leading-relaxed text-stone-100">
                  „{t.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-emerald-800 pt-4 text-sm">
                  <p className="text-stone-100">{t.name}</p>
                  <p className="text-emerald-300">{t.role}</p>
                </figcaption>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* TEAM */}
      <section id="zespol" className="bg-stone-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
              06 — Zespół
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl tracking-tight sm:mt-4 sm:text-4xl md:text-5xl">
              Ludzie,{" "}
              <span className="font-[family-name:var(--font-fraunces)] italic text-emerald-800">
                którzy
              </span>{" "}
              przyjadą do Was.
            </h2>
          </Reveal>
          <StaggerGrid className="mt-10 grid gap-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4" amount={0.05}>
            {TEAM.map((m) => (
              <StaggerItem key={m.name} className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-200">
                  <WarpedHoverImage
                    src={m.photo}
                    alt={`Portret ${m.name}`}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-4 text-lg tracking-tight">{m.name}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-stone-500">
                  {m.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {m.bio}
                </p>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="kalkulator" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
              07 — Kalkulator
            </p>
            <h2 className="mt-3 text-3xl tracking-tight sm:mt-4 sm:text-4xl md:text-5xl">
              Wycena{" "}
              <span className="font-[family-name:var(--font-fraunces)] italic text-emerald-800">
                teoretyczna
              </span>
              .
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-stone-600 sm:mt-6 sm:text-lg">
              Wybierzcie usługi i wielkość ogrodu — pokażemy widełki cenowe.
              Konkretną ofertę otrzymują Państwo po wizycie.
            </p>
            <a
              href="#kontakt"
              className="mt-8 inline-flex items-center gap-2 text-sm text-emerald-800 underline-offset-4 hover:underline"
            >
              Zamów dokładną wycenę →
            </a>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 text-stone-900 sm:p-8 md:p-10">
              <CalculatorForm
                theme={{
                  activeBg: "#1c1917",
                  activeFg: "#ffffff",
                  inactiveBorder: "border-stone-300",
                  inactiveFg: "text-stone-700 hover:bg-stone-100",
                  priceColor: "#047857",
                  chipRadiusClass: "rounded-full",
                }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* BEFORE / AFTER — bespoke for ex1 */}
      <section id="przed-po" className="bg-stone-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
              08 — Przed i po
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl tracking-tight sm:mt-4 sm:text-4xl md:text-5xl">
              Sześć miesięcy{" "}
              <span className="font-[family-name:var(--font-fraunces)] italic text-emerald-800">
                opieki
              </span>
              .
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-stone-600 sm:text-lg">
              Rezydencja w Osielsku — pierwsza wizyta w marcu 2025, regularny
              grafik co dwa tygodnie. Zdjęcia: maj i październik 2025.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6">
              <figure className="relative">
                <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-stone-200">
                  <WarpedHoverImage
                    src={IMG.backyard1}
                    alt="Ogród przed pielęgnacją — marzec"
                    className="absolute inset-0 h-full w-full object-cover grayscale"
                  />
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-white/95 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-stone-700">
                    Przed · marzec
                  </span>
                </div>
              </figure>
              <figure className="relative">
                <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-stone-200">
                  <WarpedHoverImage
                    src={IMG.backyard3 ?? IMG.parkGarden}
                    alt="Ogród po pielęgnacji — październik"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-emerald-700 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-emerald-50">
                    Po · październik
                  </span>
                </div>
              </figure>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ANTIGRAVITY — restrained dark break */}
      <AntigravitySection
        color="#10b981"
        bg="#1c1917"
        textColor="#f5f5f4"
        paddingClass="py-28 sm:py-36"
        count={1600}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
            Dziesięć lat. Setki ogrodów.
          </p>
          <h2 className="mt-5 text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Twój ogród{" "}
            <span className="font-[family-name:var(--font-fraunces)] italic text-emerald-300">
              zasługuje
            </span>
            <br />
            na regularny rytm.
          </h2>
          <p className="mt-8 max-w-md mx-auto text-base leading-relaxed text-stone-300/85 sm:text-lg">
            Nie kosimy raz na pół roku. Wpisujemy się w Wasz kalendarz na cały sezon.
          </p>
        </div>
      </AntigravitySection>

      {/* MAP — coverage area */}
      <section id="mapa" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
              09 — Mapa działania
            </p>
            <h2 className="mt-3 text-3xl tracking-tight sm:mt-4 sm:text-4xl md:text-5xl">
              {COVERAGE_HEADLINE}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-stone-600 sm:mt-6 sm:text-lg">
              {COVERAGE_INTRO}
            </p>
            <p className="mt-4 max-w-md text-sm italic text-stone-500">
              {COVERAGE_NOTE}
            </p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
              <CoverageMap
                variant="light"
                aspect="4/3"
                pinColor="047857"
                hqColor="1c1917"
                rounded=""
              />
              <CityList
                cities={COVERAGE_CITIES.slice(0, 9)}
                className="grid grid-cols-2 gap-x-6 px-6 py-5 sm:grid-cols-3"
                itemClassName="flex items-baseline justify-between gap-3 border-b border-stone-200 py-2 text-sm text-stone-700"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
              06 — FAQ
            </p>
            <h2 className="mt-3 text-3xl tracking-tight sm:mt-4 sm:text-4xl md:text-5xl">
              Najczęstsze{" "}
              <span className="font-[family-name:var(--font-fraunces)] italic text-emerald-800">
                pytania
              </span>
              .
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-stone-600 sm:mt-6 sm:text-base">
              Nie znalazłeś odpowiedzi? Zadzwoń —{" "}
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="text-stone-900 underline-offset-4 hover:underline"
              >
                {COMPANY.phone}
              </a>
              .
            </p>
          </Reveal>
          <StaggerGrid className="divide-y divide-stone-200 border-t border-stone-200 lg:col-span-8" amount={0.05}>
            {FAQ.map((f, i) => (
              <StaggerItem key={f.q}>
                <details className="group">
                  <summary className="flex cursor-pointer items-start gap-5 py-5 transition hover:text-emerald-800 sm:gap-6 sm:py-6">
                    <span className="mt-0.5 shrink-0 font-[family-name:var(--font-fraunces)] text-sm italic text-stone-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-base tracking-tight sm:text-lg">
                      {f.q}
                    </span>
                    <span
                      aria-hidden
                      className="mt-0.5 shrink-0 text-stone-400 transition group-open:rotate-45 group-open:text-emerald-700"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-5 pl-11 pr-9 text-sm leading-relaxed text-stone-600 sm:pb-6 sm:pl-14 sm:text-base">
                    {f.a}
                  </p>
                </details>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* CTA */}
      <section id="kontakt" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        <Reveal>
          <div className="grid items-center gap-8 rounded-3xl border border-stone-200 bg-white p-6 sm:gap-10 sm:p-10 md:grid-cols-2 md:p-16">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                05 — Kontakt
              </p>
              <h2 className="mt-3 text-3xl tracking-tight sm:mt-4 sm:text-4xl md:text-5xl">
                Porozmawiajmy o Twoim ogrodzie.
              </h2>
              <p className="mt-5 max-w-md text-base text-stone-600 sm:mt-6 sm:text-lg">
                Bez zobowiązań. Najpierw rozmowa, potem wizyta, potem konkretna
                oferta.
              </p>
            </div>
            <div className="grid gap-3 sm:gap-4">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-6 py-5 transition hover:border-emerald-700"
            >
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-500">
                  Telefon
                </p>
                <p className="mt-1 text-2xl tracking-tight">{COMPANY.phone}</p>
              </div>
              <span className="text-emerald-700">→</span>
            </a>
            <a
              href={`mailto:${COMPANY.email}`}
              className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-6 py-5 transition hover:border-emerald-700"
            >
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-500">
                  E-mail
                </p>
                <p className="mt-1 text-lg tracking-tight">{COMPANY.email}</p>
              </div>
              <span className="text-emerald-700">→</span>
            </a>
          </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-stone-200 bg-stone-100 text-stone-700">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-14">
            {/* Brand */}
            <div className="lg:col-span-4">
              <a href="#" className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-700 text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                    <path d="M12 2c-3 4-6 7-6 11a6 6 0 0 0 12 0c0-4-3-7-6-11z" />
                  </svg>
                </span>
                <span className="text-base font-medium tracking-tight text-stone-900">
                  {COMPANY.name}
                </span>
              </a>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-stone-600">
                Pracownia ogrodnicza w Bydgoszczy. Pielęgnacja, sadzenie,
                porządki sezonowe — od marca do listopada.
              </p>
              <Socials
                className="mt-6 text-emerald-700"
                variant="outline"
              />
            </div>

            {/* Usługi */}
            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                Usługi
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {SERVICES.slice(0, 5).map((s) => (
                  <li key={s.slug}>
                    <a
                      href={`#${s.slug}`}
                      className="text-stone-700 underline-offset-4 hover:text-emerald-700 hover:underline"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kontakt */}
            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                Kontakt
              </p>
              <address className="mt-5 space-y-2.5 text-sm not-italic">
                <p className="text-stone-700">{ADDRESS.fullLine}</p>
                <p>
                  <a
                    href={`tel:${COMPANY.phoneRaw}`}
                    className="text-stone-900 underline-offset-4 hover:underline"
                  >
                    {COMPANY.phone}
                  </a>
                </p>
                <p>
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="text-stone-900 underline-offset-4 hover:underline"
                  >
                    {COMPANY.email}
                  </a>
                </p>
                <p className="text-xs text-stone-500">{ADDRESS.hours}</p>
              </address>
            </div>

            {/* Strona */}
            <div className="lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                Strona
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li>
                  <a href="#o-nas" className="text-stone-700 underline-offset-4 hover:text-emerald-700 hover:underline">O nas</a>
                </li>
                <li>
                  <a href="#proces" className="text-stone-700 underline-offset-4 hover:text-emerald-700 hover:underline">Jak pracujemy</a>
                </li>
                <li>
                  <a href="#opinie" className="text-stone-700 underline-offset-4 hover:text-emerald-700 hover:underline">Opinie</a>
                </li>
                <li>
                  <a href="#faq" className="text-stone-700 underline-offset-4 hover:text-emerald-700 hover:underline">FAQ</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-stone-300/60 pt-6 text-xs text-stone-500 sm:mt-14 sm:pt-8">
            <p>
              © {new Date().getFullYear()} {COMPANY.name}. Wszystkie prawa zastrzeżone.
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
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
