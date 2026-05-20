import type { Metadata } from "next";
import { COMPANY, SERVICES, PROCESS, TESTIMONIALS, STATS, FAQ, TEAM, ADDRESS, LEGAL_LINKS, IMG } from "@/lib/data";
import { COVERAGE_HEADLINE, COVERAGE_INTRO } from "@/lib/coverage";
import { Reveal, HeroReveal, StaggerGrid, StaggerItem } from "@/components/motion";
import { Stat } from "@/components/Stat";
import { SitePreloader } from "@/components/SitePreloader";
import { CoverageMap } from "@/components/CoverageMap";
import { AntigravitySection } from "@/components/AntigravitySection";
import { Socials } from "@/components/Socials";
import { CalculatorForm } from "@/components/CalculatorForm";
import { WarpedHoverImage } from "@/components/WarpedHoverImage";

export const metadata: Metadata = { title: `${COMPANY.name} — Sunlit` };

const colors = {
  cream: "#FBF5E5",
  butter: "#F1D77A",
  sage: "#3F5E3A",
  coral: "#E07A56",
  soft: "#D9E5C0",
  ink: "#1E2A1B",
};

export default function Example7() {
  return (
    <>
    <SitePreloader
      storageKey="ogrody:ex7"
      variant="slide"
      duration={1500}
      bgColor={colors.sage}
      iconColor={colors.butter}
      iconSize={52}
      brandClassName="text-4xl md:text-6xl font-[family-name:var(--font-dm-serif)] tracking-tight"
      taglineClassName="text-[10px] uppercase tracking-[0.4em] font-medium"
      brand={
        <div className="flex flex-col items-center gap-5 text-center" style={{ color: colors.cream }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill={colors.butter} aria-hidden="true">
            <path d="M12 2c-3 4-6 7-6 11a6 6 0 0 0 12 0c0-4-3-7-6-11z" />
          </svg>
          <div className="flex flex-col items-center gap-3">
            <span className="text-4xl md:text-6xl font-[family-name:var(--font-dm-serif)] tracking-tight">
              Ogrody Kryscar
            </span>
            <span className="text-[10px] uppercase tracking-[0.4em] font-medium" style={{ color: colors.butter }}>
              Słońce ma swój kąt
            </span>
          </div>
        </div>
      }
    />
    <main
      className="min-h-screen font-[family-name:var(--font-inter)]"
      style={{ background: colors.cream, color: colors.ink }}
    >
      {/* NAV */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur"
        style={{
          borderColor: colors.ink + "15",
          background: colors.cream + "e6",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4">
          <a href="#" className="flex items-center gap-2.5">
            <span
              className="grid h-9 w-9 place-items-center rounded-full font-[family-name:var(--font-dm-serif)] text-lg"
              style={{ background: colors.sage, color: colors.cream }}
            >
              K
            </span>
            <span className="font-medium">{COMPANY.name}</span>
          </a>
          <nav className="hidden gap-7 text-sm md:flex">
            <a href="#uslugi" className="hover:opacity-70">Co robimy</a>
            <a href="#galeria" className="hover:opacity-70">Galeria</a>
            <a href="#proces" className="hover:opacity-70">Proces</a>
            <a href="#opinie" className="hover:opacity-70">Opinie</a>
            <a href="#kontakt" className="hover:opacity-70">Kontakt</a>
          </nav>
          <a
            href={`tel:${COMPANY.phoneRaw}`}
            className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-white sm:px-5"
            style={{ background: colors.sage }}
          >
            Zadzwoń →
          </a>
        </div>
      </header>

      {/* HERO COLOR BLOCK */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-0 px-4 pt-6 sm:px-6 sm:pt-4 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pt-6">
          <div className="lg:col-span-7 lg:pr-8">
            <HeroReveal delay={0.05}>
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
                style={{ background: colors.butter, color: colors.ink }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: colors.sage }}
                />
                Sezon {new Date().getFullYear()} — wolne terminy
              </span>
            </HeroReveal>
            <HeroReveal delay={0.15}>
              <h1
                className="mt-4 font-[family-name:var(--font-dm-serif)] text-4xl leading-[1.02] tracking-tight sm:text-5xl md:text-6xl"
                style={{ color: colors.ink }}
              >
                Ogród, w którym
                <br />
                <span style={{ color: colors.coral }}>słońce</span> ma{" "}
                <span style={{ color: colors.sage }}>swój</span> kąt.
              </h1>
            </HeroReveal>
            <HeroReveal delay={0.3}>
              <p className="mt-5 max-w-xl text-base leading-relaxed md:text-lg">
                Koszenie, sadzenie, cięcie i porządki. Robimy w ogrodzie
                wszystko to, na co Wam zwyczajnie brakuje czasu — od marca do
                listopada.
              </p>
            </HeroReveal>
            <HeroReveal delay={0.45}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#kontakt"
                className="rounded-full px-6 py-3 text-sm font-medium text-white transition hover:scale-[1.02]"
                style={{ background: colors.sage }}
              >
                Bezpłatna wycena
              </a>
              <a
                href="#uslugi"
                className="rounded-full border px-6 py-3 text-sm font-medium"
                style={{
                  borderColor: colors.ink + "40",
                  color: colors.ink,
                }}
              >
                Zobacz, co robimy →
              </a>
            </div>
            </HeroReveal>
            <HeroReveal delay={0.6}>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span style={{ color: colors.coral }}>★★★★★</span>
                <span className="font-medium">4.9 / 5</span>
                <span className="opacity-60">· 187 opinii</span>
              </div>
              <div
                className="h-4 w-px"
                style={{ background: colors.ink + "30" }}
              />
              <span>
                <span className="font-medium">500+</span>{" "}
                <span className="opacity-60">zadbanych ogrodów</span>
              </span>
            </div>
            </HeroReveal>
          </div>

          <HeroReveal delay={0.25} className="relative mt-10 lg:col-span-5 lg:mt-0">
            <div className="relative">
              <div
                className="absolute -right-6 -top-4 hidden h-32 w-32 rounded-full md:block"
                style={{ background: colors.butter }}
              />
              <div
                className="absolute -bottom-8 -left-8 hidden h-20 w-20 rounded-full md:block"
                style={{ background: colors.coral }}
              />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[36px]">
                <WarpedHoverImage
                  src={IMG.parkPath}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div
                className="absolute -left-4 top-12 hidden rounded-2xl px-4 py-3 shadow-xl md:block"
                style={{ background: colors.cream }}
              >
                <p
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: colors.sage }}
                >
                  Najbliższy termin
                </p>
                <p className="mt-0.5 text-sm font-medium">w tym tygodniu</p>
              </div>
            </div>
          </HeroReveal>
        </div>
      </section>

      {/* STATS STRIP */}
      <section
        className="mt-12 py-8 sm:mt-16 sm:py-10"
        style={{ background: colors.sage, color: colors.cream }}
      >
        <StaggerGrid className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:gap-8 sm:px-6 md:grid-cols-4">
          {STATS.map((s) => (
            <StaggerItem key={s.label}>
              <p className="font-[family-name:var(--font-dm-serif)] text-4xl leading-none sm:text-5xl">
                <Stat value={s.value} />
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-widest opacity-80 sm:text-xs">
                {s.label}
              </p>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* SERVICES — alternating color blocks */}
      <section id="uslugi" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <Reveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6 sm:mb-12">
            <div>
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: colors.coral }}
              >
                Co robimy
              </p>
              <h2
                className="mt-3 max-w-2xl font-[family-name:var(--font-dm-serif)] text-4xl leading-tight sm:text-5xl md:text-6xl"
                style={{ color: colors.ink }}
              >
                Wszystko, co dzieje się w ogrodzie — w jednych rękach.
              </h2>
            </div>
            <p className="max-w-xs text-sm">
              Pełen zakres opieki. Tylko systemy nawadniające pozostawiamy
              specjalistom.
            </p>
          </div>
        </Reveal>

        <StaggerGrid className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.slice(0, 6).map((s, i) => {
            const palettes = [
              { bg: colors.soft, ink: colors.ink },
              { bg: colors.butter, ink: colors.ink },
              { bg: colors.sage, ink: colors.cream },
              { bg: colors.cream, ink: colors.ink, border: true },
              { bg: colors.coral, ink: colors.cream },
              { bg: colors.soft, ink: colors.ink },
            ];
            const p = palettes[i];
            return (
              <StaggerItem
                key={s.slug}
                className={`group relative flex h-full flex-col rounded-[24px] p-6 transition hover:-translate-y-1 sm:rounded-[28px] sm:p-7 ${
                  p.border ? "border-2" : ""
                }`}
                style={{
                  background: p.bg,
                  color: p.ink,
                  borderColor: p.border ? colors.ink + "20" : undefined,
                }}
              >
                <span
                  className="font-[family-name:var(--font-dm-serif)] text-2xl"
                  style={{ opacity: 0.6 }}
                >
                  0{i + 1}
                </span>
                <h3 className="mt-4 font-[family-name:var(--font-dm-serif)] text-2xl leading-tight sm:mt-5 sm:text-3xl">
                  {s.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed opacity-90 sm:mt-3 sm:text-[15px]">
                  {s.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium sm:mt-7">
                  Dowiedz się więcej
                  <span className="transition group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      </section>

      {/* PHOTO MOSAIC */}
      <section id="galeria" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:pb-24">
        <Reveal>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
            <div>
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: colors.coral }}
              >
                Galeria realizacji
              </p>
              <h2
                className="mt-3 font-[family-name:var(--font-dm-serif)] text-4xl sm:text-5xl md:text-6xl"
                style={{ color: colors.ink }}
              >
                Z ostatnich sezonów.
              </h2>
            </div>
            <a
              href="#kontakt"
              className="hidden text-sm underline-offset-4 hover:underline md:inline"
            >
              Zobacz pełne portfolio →
            </a>
          </div>
        </Reveal>
        <div className="grid grid-cols-12 gap-3 sm:gap-4">
          <figure className="col-span-12 md:col-span-7">
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[28px]">
              <WarpedHoverImage
                src={IMG.hedgeMaze}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption
              className="mt-3 text-sm"
              style={{ color: colors.ink, opacity: 0.7 }}
            >
              Strzyżenie żywopłotów — rezydencja w Wielkopolsce.
            </figcaption>
          </figure>
          <figure className="col-span-6 md:col-span-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-[28px]">
              <WarpedHoverImage
                src={IMG.tulipField}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-sm" style={{ opacity: 0.7 }}>
              Wiosenne nasadzenia bylinowe.
            </figcaption>
          </figure>
          <figure className="col-span-6 md:col-span-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-[28px]">
              <WarpedHoverImage
                src={IMG.autumn1}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-sm" style={{ opacity: 0.7 }}>
              Październikowe porządki.
            </figcaption>
          </figure>
          <figure className="col-span-12 md:col-span-7">
            <div className="relative aspect-[5/3] w-full overflow-hidden rounded-[28px]">
              <WarpedHoverImage
                src={IMG.lawnTexture}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-sm" style={{ opacity: 0.7 }}>
              Trawnik po koszeniu — pełna regeneracja.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* PROCESS */}
      <section
        id="proces"
        className="px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
        style={{ background: colors.soft }}
      >
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: colors.coral }}
            >
              Jak pracujemy
            </p>
            <h2
              className="mt-3 max-w-3xl font-[family-name:var(--font-dm-serif)] text-4xl sm:text-5xl md:text-6xl"
              style={{ color: colors.ink }}
            >
              Cztery proste kroki — i ogród sam się prowadzi.
            </h2>
          </Reveal>
          <StaggerGrid className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <StaggerItem
                key={p.no}
                className="rounded-[24px] p-6 sm:rounded-[28px] sm:p-7"
                style={{
                  background: i === 1 ? colors.butter : colors.cream,
                  color: colors.ink,
                }}
              >
                <span
                  className="grid h-12 w-12 place-items-center rounded-full font-[family-name:var(--font-dm-serif)] text-2xl"
                  style={{ background: colors.sage, color: colors.cream }}
                >
                  {p.no}
                </span>
                <h3 className="mt-4 font-[family-name:var(--font-dm-serif)] text-xl sm:mt-5 sm:text-2xl">
                  {p.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed opacity-80 sm:mt-3">
                  {p.desc}
                </p>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="opinie" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid gap-7 sm:gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: colors.coral }}
            >
              Opinie klientów
            </p>
            <h2
              className="mt-3 font-[family-name:var(--font-dm-serif)] text-4xl leading-tight sm:text-5xl md:text-6xl"
              style={{ color: colors.ink }}
            >
              Mówią o nas
              <br />
              prosto.
            </h2>
            <p className="mt-5 max-w-sm text-base opacity-80">
              Zostawiamy ogrody w stanie, w którym ich właściciele po prostu
              chcą zostać.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <span style={{ color: colors.coral }}>★★★★★</span>
              <span className="text-sm font-medium">
                4.9 / 5 · 187 opinii
              </span>
            </div>
          </Reveal>
          <StaggerGrid className="grid gap-4 sm:gap-5 lg:col-span-8 lg:grid-cols-2">
            {TESTIMONIALS.slice(0, 4).map((t, i) => (
              <StaggerItem
                key={t.name}
                className="rounded-[24px] p-6 sm:rounded-[28px] sm:p-7"
                style={{
                  background:
                    i === 0
                      ? colors.butter
                      : i === 1
                        ? colors.cream
                        : i === 2
                          ? colors.soft
                          : colors.cream,
                  border: `1px solid ${colors.ink}15`,
                }}
              >
                <span
                  className="font-[family-name:var(--font-dm-serif)] text-5xl leading-none"
                  style={{ color: colors.coral }}
                >
                  “
                </span>
                <blockquote className="-mt-3 text-base leading-relaxed">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 text-sm">
                  <p className="font-medium">{t.name}</p>
                  <p className="opacity-70">{t.role}</p>
                </figcaption>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* TEAM — sunlit alternating colors */}
      <section id="zespol" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <Reveal>
          <p
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: colors.coral }}
          >
            Zespół
          </p>
          <h2
            className="mt-3 max-w-2xl font-[family-name:var(--font-dm-serif)] text-4xl leading-tight sm:mt-4 sm:text-5xl md:text-6xl"
            style={{ color: colors.ink }}
          >
            Ludzie, którzy przyjadą do Was.
          </h2>
        </Reveal>
        <StaggerGrid className="mt-10 grid gap-4 sm:mt-14 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4" amount={0.05}>
          {TEAM.map((m, i) => {
            const palettes = [
              { bg: colors.butter, accent: colors.sage },
              { bg: colors.cream, accent: colors.coral, border: true },
              { bg: colors.soft, accent: colors.sage },
              { bg: colors.coral, accent: colors.cream, dark: true },
            ];
            const p = palettes[i % palettes.length];
            return (
              <StaggerItem
                key={m.name}
                className={`overflow-hidden rounded-[28px] ${p.border ? "border-2" : ""}`}
                style={{
                  background: p.bg,
                  color: p.dark ? colors.cream : colors.ink,
                  borderColor: p.border ? colors.ink + "20" : undefined,
                }}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <WarpedHoverImage
                    src={m.photo}
                    alt={`Portret ${m.name}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <p className="font-[family-name:var(--font-dm-serif)] text-2xl leading-tight">
                    {m.name}
                  </p>
                  <p
                    className="mt-2 text-[11px] uppercase tracking-widest"
                    style={{ color: p.accent }}
                  >
                    {m.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed opacity-85">
                    {m.bio}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      </section>

      {/* CALCULATOR — sunlit */}
      <section
        id="kalkulator"
        className="px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
        style={{ background: colors.soft }}
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: colors.coral }}>
              Kalkulator
            </p>
            <h2
              className="mt-3 font-[family-name:var(--font-dm-serif)] text-4xl leading-tight sm:mt-4 sm:text-5xl md:text-6xl"
              style={{ color: colors.ink }}
            >
              Wycena
              <br />
              <span style={{ color: colors.coral }}>teoretyczna</span>.
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed opacity-85 sm:mt-6 sm:text-lg">
              Wybierzcie zakres prac, wielkość ogrodu i częstotliwość —
              dostajecie widełki cenowe.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <div
              className="rounded-[32px] p-6 sm:p-10"
              style={{ background: colors.cream, color: colors.ink }}
            >
              <CalculatorForm
                theme={{
                  activeBg: colors.sage,
                  activeFg: colors.cream,
                  inactiveBorder: "border",
                  inactiveFg: "hover:opacity-70",
                  priceColor: colors.coral,
                  priceFontClass: "font-[family-name:var(--font-dm-serif)]",
                  chipRadiusClass: "rounded-full",
                }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* MAP — sunlit chips */}
      <section id="mapa" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 lg:items-center">
          <Reveal className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: colors.coral }}>
              Region
            </p>
            <h2
              className="mt-3 font-[family-name:var(--font-dm-serif)] text-4xl leading-tight sm:mt-4 sm:text-5xl md:text-6xl"
              style={{ color: colors.ink }}
            >
              {COVERAGE_HEADLINE}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed opacity-80 sm:mt-6 sm:text-lg">
              {COVERAGE_INTRO}
            </p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <div
              className="overflow-hidden rounded-[32px] p-3"
              style={{ background: colors.butter }}
            >
              <CoverageMap
                variant="light"
                aspect="4/3"
                pinColor="e07a56"
                hqColor="3f5e3a"
                rounded="rounded-[24px]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-4">
            <p
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: colors.coral }}
            >
              FAQ
            </p>
            <h2
              className="mt-3 font-[family-name:var(--font-dm-serif)] text-4xl leading-tight sm:text-5xl md:text-6xl"
              style={{ color: colors.ink }}
            >
              Pytania,
              <br />
              które
              <br />
              <span style={{ color: colors.coral }}>słyszymy</span> najczęściej.
            </h2>
            <p className="mt-5 max-w-xs text-sm opacity-80">
              Nie znalazłeś odpowiedzi? Zadzwoń — chętnie wyjaśnimy.
            </p>
          </Reveal>
          <StaggerGrid className="grid gap-4 sm:gap-5 lg:col-span-8" amount={0.05}>
            {FAQ.map((f, i) => {
              const palettes = [
                { bg: colors.butter, ink: colors.ink, accent: colors.sage },
                { bg: colors.cream, ink: colors.ink, accent: colors.coral, border: true },
                { bg: colors.soft, ink: colors.ink, accent: colors.sage },
                { bg: colors.cream, ink: colors.ink, accent: colors.coral, border: true },
                { bg: colors.butter, ink: colors.ink, accent: colors.sage },
              ];
              const p = palettes[i];
              return (
                <StaggerItem
                  key={f.q}
                  className={`rounded-[24px] sm:rounded-[28px] ${p.border ? "border-2" : ""}`}
                  style={{
                    background: p.bg,
                    color: p.ink,
                    borderColor: p.border ? colors.ink + "20" : undefined,
                  }}
                >
                  <details className="group">
                    <summary className="flex cursor-pointer items-start gap-5 p-6 sm:gap-6 sm:p-7">
                      <span
                        className="font-[family-name:var(--font-dm-serif)] text-2xl sm:text-3xl"
                        style={{ color: p.accent }}
                      >
                        0{i + 1}
                      </span>
                      <span className="flex-1 font-[family-name:var(--font-dm-serif)] text-xl leading-snug sm:text-2xl">
                        {f.q}
                      </span>
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="mt-2 h-5 w-5 shrink-0 transition group-open:rotate-180"
                        style={{ color: p.accent }}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </summary>
                    <p className="px-6 pb-6 pl-14 text-sm leading-relaxed opacity-85 sm:px-7 sm:pb-7 sm:pl-16 sm:text-base">
                      {f.a}
                    </p>
                  </details>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* ANTIGRAVITY — butter particles on ink (dark break from sunlit cream) */}
      <AntigravitySection
        color={colors.butter}
        bg={colors.ink}
        textColor={colors.cream}
        paddingClass="py-28 sm:py-36"
        count={1600}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: colors.butter }}
          >
            Lato 2025 · wolne terminy
          </p>
          <h2
            className="mt-5 font-[family-name:var(--font-dm-serif)] text-5xl leading-[1.02] sm:text-6xl md:text-7xl"
            style={{ color: colors.cream }}
          >
            Trawa rośnie,
            <br />
            <span style={{ color: colors.butter }}>słońce świeci</span>,
            <br />a Wy jesteście{" "}
            <span style={{ color: colors.coral }}>w pracy</span>.
          </h2>
          <p className="mt-8 max-w-md mx-auto text-base sm:text-lg" style={{ opacity: 0.85 }}>
            Niech ogród nie czeka. Przyjedziemy dzisiaj — albo jutro o świcie.
          </p>
        </div>
      </AntigravitySection>

      {/* CTA */}
      <section id="kontakt" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <Reveal>
        <div
          className="relative overflow-hidden rounded-[28px] p-6 sm:rounded-[36px] sm:p-10 md:p-16"
          style={{ background: colors.sage, color: colors.cream }}
        >
          <div
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full"
            style={{ background: colors.butter + "33" }}
          />
          <div
            className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full"
            style={{ background: colors.coral + "22" }}
          />
          <div className="relative grid gap-8 sm:gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: colors.butter }}
              >
                Zacznijmy
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-dm-serif)] text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
                Jedna rozmowa.
                <br />
                <span style={{ color: colors.butter }}>
                  Gotowy ogród.
                </span>
              </h2>
              <p className="mt-5 max-w-md text-sm opacity-85 sm:mt-6 sm:text-base">
                Zadzwoń lub napisz — w ciągu jednego dnia roboczego
                potwierdzimy termin oględzin.
              </p>
            </div>
            <div className="grid gap-3">
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="flex items-center justify-between rounded-2xl px-6 py-5"
                style={{ background: colors.cream, color: colors.ink }}
              >
                <div>
                  <p
                    className="text-xs uppercase tracking-wider"
                    style={{ color: colors.sage }}
                  >
                    Telefon
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-dm-serif)] text-2xl">
                    {COMPANY.phone}
                  </p>
                </div>
                <span style={{ color: colors.sage }}>→</span>
              </a>
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex items-center justify-between rounded-2xl px-6 py-5"
                style={{ background: colors.cream, color: colors.ink }}
              >
                <div>
                  <p
                    className="text-xs uppercase tracking-wider"
                    style={{ color: colors.sage }}
                  >
                    E-mail
                  </p>
                  <p className="mt-1 text-base font-medium">{COMPANY.email}</p>
                </div>
                <span style={{ color: colors.sage }}>→</span>
              </a>
            </div>
          </div>
        </div>
        </Reveal>
      </section>

      {/* FOOTER — sunlit color blocks */}
      <footer
        className="border-t pt-14 sm:pt-16"
        style={{ borderColor: colors.ink + "15" }}
      >
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-12">
            {/* Brand block — sage */}
            <div
              className="rounded-[28px] p-7 sm:p-8 lg:col-span-5"
              style={{ background: colors.sage, color: colors.cream }}
            >
              <p className="font-[family-name:var(--font-dm-serif)] text-3xl leading-tight sm:text-4xl">
                {COMPANY.name}
              </p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.3em]" style={{ color: colors.butter }}>
                Pracownia · {ADDRESS.city}
              </p>
              <p className="mt-6 max-w-sm text-base leading-relaxed opacity-85 sm:text-lg">
                Słońce ma swój kąt. My znamy każdy. Pielęgnacja, sadzenie,
                cięcia — od marca do listopada.
              </p>
              <Socials className="mt-7" variant="outline" />
            </div>

            {/* Kontakt — butter */}
            <div
              className="rounded-[28px] p-7 sm:p-8 lg:col-span-4"
              style={{ background: colors.butter, color: colors.ink }}
            >
              <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: colors.coral }}>
                Kontakt
              </p>
              <address className="mt-4 space-y-3 not-italic">
                <p>
                  <a
                    href={`tel:${COMPANY.phoneRaw}`}
                    className="font-[family-name:var(--font-dm-serif)] text-3xl"
                  >
                    {COMPANY.phone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${COMPANY.email}`} className="text-sm underline-offset-4 hover:underline">
                    {COMPANY.email}
                  </a>
                </p>
                <p className="text-sm">{ADDRESS.fullLine}</p>
                <p className="text-xs opacity-70">{ADDRESS.hours}</p>
              </address>
            </div>

            {/* Strona — soft */}
            <div
              className="rounded-[28px] p-7 sm:p-8 lg:col-span-3"
              style={{ background: colors.soft, color: colors.ink }}
            >
              <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: colors.coral }}>
                Strona
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li><a href="#uslugi" className="underline-offset-4 hover:underline">Co robimy</a></li>
                <li><a href="#galeria" className="underline-offset-4 hover:underline">Galeria</a></li>
                <li><a href="#proces" className="underline-offset-4 hover:underline">Proces</a></li>
                <li><a href="#zespol" className="underline-offset-4 hover:underline">Zespół</a></li>
                <li><a href="#faq" className="underline-offset-4 hover:underline">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div
            className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-xs"
            style={{ borderColor: colors.ink + "15" }}
          >
            <p className="opacity-75">
              © {new Date().getFullYear()} {COMPANY.name} · NIP {ADDRESS.nip}
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:underline" style={{ color: colors.coral }}>
                    {l.label}
                  </a>
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
