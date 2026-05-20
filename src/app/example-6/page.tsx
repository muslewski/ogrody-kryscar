import type { Metadata } from "next";
import { COMPANY, SERVICES, PROCESS, TESTIMONIALS, FAQ, TEAM, ADDRESS, LEGAL_LINKS, IMG } from "@/lib/data";
import { COVERAGE_HEADLINE, COVERAGE_INTRO } from "@/lib/coverage";
import { Reveal, HeroReveal, StaggerGrid, StaggerItem } from "@/components/motion";
import { SitePreloader } from "@/components/SitePreloader";
import { CoverageMap } from "@/components/CoverageMap";
import { AntigravitySection } from "@/components/AntigravitySection";
import { Socials } from "@/components/Socials";
import { CalculatorForm } from "@/components/CalculatorForm";
import { WarpedHoverImage } from "@/components/WarpedHoverImage";
import { Ex6Nav } from "./_nav";

const ECO_PRINCIPLES = [
  {
    title: "Bez chemii",
    body: "Naturalne nawożenie, kompost na miejscu — bez herbicydów, bez sztucznych pestycydów.",
  },
  {
    title: "Z natury",
    body: "Rośliny rodzime tam, gdzie to możliwe. Łąki kwietne, byliny, drzewa dostosowane do klimatu.",
  },
  {
    title: "Bez nawodnień",
    body: "Nie instalujemy systemów podlewania — specjalizujemy się w pielęgnacji, sadzeniu i porządkach.",
  },
  {
    title: "Bez ściemy",
    body: "Wycena = realny koszt. Bez ukrytych pozycji. Faktura lub paragon, do wyboru.",
  },
];

export const metadata: Metadata = { title: `${COMPANY.name} — Organic` };

const palette = {
  cream: "#f5efe1",
  moss: "#5b6b3f",
  terracotta: "#c47754",
  sage: "#a3b18a",
  ink: "#2a2a23",
};

export default function Example6() {
  return (
    <>
    <SitePreloader
      storageKey="ogrody:ex6"
      variant="curtain"
      duration={1500}
      bgColor={palette.moss}
      iconColor={palette.cream}
      iconSize={48}
      brandClassName="text-4xl md:text-6xl font-[family-name:var(--font-fraunces)] tracking-tight"
      taglineClassName="text-[10px] uppercase tracking-[0.4em] font-medium"
      brand={
        <div className="flex flex-col items-center gap-5 text-center" style={{ color: palette.cream }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill={palette.cream} aria-hidden="true">
            <path d="M12 2c-3 4-6 7-6 11a6 6 0 0 0 12 0c0-4-3-7-6-11z" />
          </svg>
          <div className="flex flex-col items-center gap-3">
            <span className="text-4xl md:text-6xl font-[family-name:var(--font-fraunces)] tracking-tight">
              <span className="italic">Ogrody</span> Kryscar
            </span>
            <span className="text-[10px] uppercase tracking-[0.4em] font-medium" style={{ color: palette.terracotta }}>
              Pielęgnujemy naturalnie
            </span>
          </div>
        </div>
      }
    />
    <main
      className="relative min-h-screen overflow-hidden font-[family-name:var(--font-inter)]"
      style={{ background: palette.cream, color: palette.ink }}
    >
      {/* NAV — fixed with isScrolled */}
      <Ex6Nav />
      {/* Spacer for fixed nav so the blob hero clears */}
      <div className="h-20 sm:h-24" />

      {/* HERO with blob */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-10 pb-16 sm:gap-12 sm:px-6 sm:pt-16 sm:pb-24 lg:grid-cols-12 lg:items-center">
          <div className="relative lg:col-span-6">
            <HeroReveal delay={0.05}>
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: palette.terracotta }}
              >
                Ogród, który oddycha
              </p>
            </HeroReveal>
            <HeroReveal delay={0.15}>
              <h1 className="mt-5 font-[family-name:var(--font-fraunces)] text-5xl leading-[1.02] sm:mt-6 sm:text-6xl md:text-7xl lg:text-8xl">
                Pielęgnujemy
                <br />
                <span
                  className="italic"
                  style={{ color: palette.moss }}
                >
                  naturalnie
                </span>
                .
              </h1>
            </HeroReveal>
            <HeroReveal delay={0.3}>
              <p className="mt-6 max-w-md text-base leading-relaxed sm:mt-8 sm:text-lg">
                Każdy ogród traktujemy jak żywą istotę. Słuchamy, obserwujemy i
                tylko wtedy działamy. Bez chemii, bez nawodnień, bez pośpiechu.
              </p>
            </HeroReveal>
            <HeroReveal delay={0.45}>
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
              <a
                href="#kontakt"
                className="rounded-full px-6 py-3 text-sm transition"
                style={{ background: palette.ink, color: palette.cream }}
              >
                Umów spotkanie w ogrodzie
              </a>
              <a
                href="#uslugi"
                className="rounded-full border px-6 py-3 text-sm"
                style={{ borderColor: palette.ink + "40" }}
              >
                Co dokładnie robimy →
              </a>
            </div>
            </HeroReveal>
          </div>

          <HeroReveal delay={0.25} className="relative lg:col-span-6">
            <div
              className="animate-blob relative h-[360px] w-full overflow-hidden sm:h-[460px] lg:h-[560px]"
              style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
            >
              <WarpedHoverImage
                src={IMG.cherry}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div
              className="absolute -bottom-2 left-2 grid h-24 w-24 animate-float place-items-center rounded-full text-center text-[11px] uppercase tracking-widest sm:-bottom-4 sm:-left-4 sm:h-32 sm:w-32 sm:text-xs"
              style={{ background: palette.terracotta, color: palette.cream }}
            >
              <span className="px-3">
                Sezon
                <br />
                {new Date().getFullYear()}
              </span>
            </div>
            <div
              className="absolute -top-4 right-4 grid h-20 w-20 place-items-center rounded-full font-[family-name:var(--font-fraunces)] italic sm:-top-6 sm:right-10 sm:h-24 sm:w-24"
              style={{ background: palette.sage, color: palette.ink }}
            >
              <span>z pasji</span>
            </div>
          </HeroReveal>
        </div>

        {/* Curve divider — cream → moss */}
        <svg
          className="-mb-px block h-20 w-full"
          viewBox="0 0 1440 80"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 50 Q 720 10 1440 50 L1440 80 L0 80 Z"
            fill={palette.moss}
          />
        </svg>
      </section>

      {/* SERVICES */}
      <section
        id="uslugi"
        className="relative -mt-1 py-16 sm:py-20 lg:py-24"
        style={{ background: palette.moss, color: palette.cream }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: palette.sage }}
              >
                Co robimy
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl leading-tight sm:mt-4 sm:text-5xl md:text-6xl">
                Każda usługa
                <br />
                ma swój{" "}
                <span className="italic" style={{ color: palette.cream }}>
                  rytm
                </span>
                .
              </h2>
              <p className="mt-5 max-w-md text-base opacity-80 sm:mt-6">
                Ogród nie powstaje raz. Powstaje co tydzień, co miesiąc i co
                sezon — w drobnych, regularnych gestach.
              </p>
            </Reveal>
            <StaggerGrid className="grid gap-3 sm:gap-4 lg:col-span-7 lg:grid-cols-2">
              {SERVICES.slice(0, 6).map((s) => (
                <StaggerItem key={s.slug}>
                  {/* Inner wrapper owns the hover rotation + its CSS
                      transition. Keeping that off the StaggerItem
                      (which is a motion.div) means the entrance animation
                      sets transform every frame without a competing
                      CSS `transition: all` smearing the values — that
                      was the flicker. */}
                  <div
                    className="rounded-[36px] p-6 transition-transform duration-300 ease-out hover:-rotate-1"
                    style={{ background: palette.cream, color: palette.ink }}
                  >
                    <span
                      className="grid h-10 w-10 place-items-center rounded-full text-sm font-medium"
                      style={{ background: palette.terracotta, color: palette.cream }}
                    >
                      ✿
                    </span>
                    <h3 className="mt-4 font-[family-name:var(--font-fraunces)] text-2xl">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed opacity-80">
                      {s.short}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </div>

      </section>

      {/* STORY */}
      <section id="opowiesc" className="relative py-16 sm:py-20 lg:py-24">
        {/* Curve into the story — moss → cream, asymmetric gentle sweep */}
        <svg
          className="absolute inset-x-0 -top-px block h-16 w-full -translate-y-full sm:h-24"
          viewBox="0 0 1440 96"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 96 L0 55 C 480 80 960 35 1440 65 L1440 96 Z"
            fill={palette.cream}
          />
        </svg>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:gap-16 sm:px-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div
                className="relative aspect-[3/4] w-full overflow-hidden"
                style={{ borderRadius: "60% 40% 60% 40% / 50% 60% 40% 50%" }}
              >
                <WarpedHoverImage
                  src={IMG.daffodils}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div
                className="relative aspect-[3/4] w-full translate-y-4 overflow-hidden sm:translate-y-8"
                style={{ borderRadius: "40% 60% 40% 60% / 60% 40% 60% 40%" }}
              >
                <WarpedHoverImage
                  src={IMG.hedgeShears}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
          <Reveal className="lg:col-span-7">
            <p
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: palette.terracotta }}
            >
              Nasza opowieść
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl leading-tight sm:mt-4 sm:text-5xl md:text-6xl">
              Wszystko zaczęło się od{" "}
              <span className="italic" style={{ color: palette.moss }}>
                zarośniętej działki babci
              </span>
              .
            </h2>
            <p className="mt-5 text-base leading-relaxed sm:mt-6 sm:text-lg">
              Najpierw był jeden ogród. Potem sąsiad. Potem znajomi sąsiada.
              Tak, krok po kroku, z roku na rok — wyrosło Ogrody Kryscar.
              Dziś prowadzimy setki ogrodów, a każdy z nich znamy z imienia.
            </p>
            <ul className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 sm:grid-cols-2">
              {[
                ["Bez chemii", "Naturalna pielęgnacja i nawożenie"],
                ["Bez pośpiechu", "Pracujemy dokładnie, nie szybko"],
                ["Bez nawodnień", "Specjalizujemy się w tym, co robimy"],
                ["Bez ściemy", "Wycena = realny koszt"],
              ].map(([h, p]) => (
                <li
                  key={h}
                  className="rounded-2xl border p-5"
                  style={{ borderColor: palette.ink + "20" }}
                >
                  <p className="font-[family-name:var(--font-fraunces)] text-xl">
                    {h}
                  </p>
                  <p className="mt-1 text-sm opacity-80">{p}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* PROCESS as winding path */}
      <section
        id="proces"
        className="relative py-16 sm:py-20 lg:py-24"
        style={{ background: palette.sage + "33" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <p
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: palette.terracotta }}
            >
              Jak pracujemy
            </p>
            <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-fraunces)] text-4xl sm:mt-4 sm:text-5xl md:text-6xl">
              Cztery oddechy do gotowego ogrodu.
            </h2>
          </Reveal>
          <StaggerGrid className="mt-10 grid gap-6 sm:mt-16 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <StaggerItem
                key={p.no}
                className={`relative rounded-[36px] bg-white p-7 ${
                  i % 2 === 1 ? "lg:translate-y-12" : ""
                }`}
              >
                <span
                  className="grid h-12 w-12 place-items-center rounded-full font-[family-name:var(--font-fraunces)] text-xl italic"
                  style={{ background: palette.moss, color: palette.cream }}
                >
                  {p.no}
                </span>
                <h3 className="mt-4 font-[family-name:var(--font-fraunces)] text-2xl">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm opacity-80">{p.desc}</p>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="relative py-16 sm:py-20 lg:py-24"
        style={{ background: palette.cream }}
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: palette.terracotta }}
            >
              Pytania
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl leading-tight sm:mt-4 sm:text-5xl md:text-6xl">
              Najczęściej{" "}
              <span className="italic" style={{ color: palette.moss }}>
                pytają nas
              </span>
              .
            </h2>
            <p
              className="mt-6 max-w-sm text-base leading-relaxed sm:mt-8"
              style={{ color: palette.ink, opacity: 0.8 }}
            >
              Pięć krótkich odpowiedzi. Po więcej zapraszamy na spacer po
              Twoim ogrodzie.
            </p>
            <svg
              className="mt-10 hidden sm:mt-14 lg:block"
              width="220"
              height="40"
              viewBox="0 0 220 40"
              fill="none"
              aria-hidden
            >
              <path
                d="M2 28 Q 55 6, 110 22 T 218 18"
                stroke={palette.terracotta}
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.8"
              />
              <circle cx="218" cy="18" r="3.5" fill={palette.terracotta} />
            </svg>
          </Reveal>
          <StaggerGrid className="lg:col-span-7" amount={0.05}>
            <div
              className="divide-y rounded-[32px] border bg-white/60"
              style={{
                borderColor: palette.ink + "15",
                ["--tw-divide-opacity" as string]: 1,
              }}
            >
              {FAQ.map((f, i) => (
                <StaggerItem
                  key={f.q}
                  style={{ borderColor: palette.ink + "15" }}
                >
                  <details className="group">
                    <summary
                      className="flex cursor-pointer list-none items-start gap-5 p-6 transition sm:gap-6 sm:p-7 [&::-webkit-details-marker]:hidden"
                      style={{ color: palette.ink }}
                    >
                      <span
                        className="mt-1 font-[family-name:var(--font-fraunces)] text-base italic"
                        style={{ color: palette.terracotta }}
                      >
                        0{i + 1}
                      </span>
                      <span className="flex-1 font-[family-name:var(--font-fraunces)] text-lg italic leading-snug sm:text-xl">
                        {f.q}
                      </span>
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="mt-1.5 h-5 w-5 shrink-0 transition group-open:rotate-180"
                        style={{ color: palette.moss }}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 sm:px-7 sm:pb-7">
                      <p
                        className="max-w-prose pl-9 text-[15px] leading-relaxed sm:pl-10 sm:text-base"
                        style={{ color: palette.ink, opacity: 0.78 }}
                      >
                        {f.a}
                      </p>
                    </div>
                  </details>
                </StaggerItem>
              ))}
            </div>
          </StaggerGrid>
        </div>
      </section>

      {/* TEAM — organic portraits */}
      <section id="zespol" className="py-16 sm:py-20 lg:py-24" style={{ background: palette.cream }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <p
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: palette.terracotta }}
            >
              Zespół
            </p>
            <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-fraunces)] text-4xl leading-tight sm:mt-4 sm:text-5xl md:text-6xl">
              Cztery osoby,{" "}
              <span className="italic" style={{ color: palette.moss }}>
                jeden ogród
              </span>
              .
            </h2>
          </Reveal>
          <StaggerGrid className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4" amount={0.05}>
            {TEAM.map((m, i) => {
              const radii = [
                "60% 40% 50% 50% / 40% 60% 40% 60%",
                "40% 60% 60% 40% / 60% 40% 60% 40%",
                "50% 50% 60% 40% / 60% 40% 50% 50%",
                "55% 45% 40% 60% / 45% 55% 60% 40%",
              ];
              return (
                <StaggerItem key={m.name}>
                  <div
                    className="relative aspect-square overflow-hidden"
                    style={{ borderRadius: radii[i % radii.length] }}
                  >
                    <WarpedHoverImage
                      src={m.photo}
                      alt={`Portret ${m.name}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-5 font-[family-name:var(--font-fraunces)] text-xl italic" style={{ color: palette.ink }}>
                    {m.name}
                  </p>
                  <p
                    className="mt-1 text-[11px] uppercase tracking-widest"
                    style={{ color: palette.terracotta }}
                  >
                    {m.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: palette.ink, opacity: 0.8 }}>
                    {m.bio}
                  </p>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* ECO PRINCIPLES — bespoke for ex6 */}
      <section className="relative py-16 sm:py-20 lg:py-24" style={{ background: palette.sage + "33" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: palette.terracotta }}>
              Nasze zasady
            </p>
            <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-fraunces)] text-4xl leading-tight sm:mt-4 sm:text-5xl md:text-6xl">
              Z szacunku
              <br />
              <span className="italic" style={{ color: palette.moss }}>
                do ogrodu
              </span>
              .
            </h2>
          </Reveal>
          <StaggerGrid className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4" amount={0.05}>
            {ECO_PRINCIPLES.map((p, i) => (
              <StaggerItem
                key={p.title}
                className="rounded-[32px] bg-white p-7"
                style={{
                  boxShadow: `0 1px 0 ${palette.ink}10, 0 12px 30px -18px ${palette.ink}25`,
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill={i % 2 === 0 ? palette.moss : palette.terracotta}
                  aria-hidden
                >
                  <path d="M12 2c-3 4-6 7-6 11a6 6 0 0 0 12 0c0-4-3-7-6-11z" />
                </svg>
                <p className="mt-5 font-[family-name:var(--font-fraunces)] text-2xl" style={{ color: palette.ink }}>
                  {p.title}
                </p>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: palette.ink, opacity: 0.78 }}>
                  {p.body}
                </p>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* CALCULATOR — organic */}
      <section id="kalkulator" className="py-16 sm:py-20 lg:py-24" style={{ background: palette.cream }}>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: palette.terracotta }}>
              Kalkulator
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl leading-tight sm:mt-4 sm:text-5xl md:text-6xl">
              Wycena{" "}
              <span className="italic" style={{ color: palette.moss }}>
                teoretyczna
              </span>
              .
            </h2>
            <p
              className="mt-6 max-w-sm text-base leading-relaxed"
              style={{ color: palette.ink, opacity: 0.8 }}
            >
              Wybierzcie zakres prac i wielkość ogrodu — pokażemy widełki
              cenowe. Konkretną ofertę otrzymują Państwo po wizycie.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <div
              className="rounded-[32px] border bg-white p-6 sm:p-10"
              style={{
                borderColor: palette.ink + "15",
                color: palette.ink,
              }}
            >
              <CalculatorForm
                theme={{
                  activeBg: palette.moss,
                  activeFg: palette.cream,
                  inactiveBorder: "border",
                  inactiveFg: "hover:opacity-70",
                  priceColor: palette.terracotta,
                  priceFontClass: "font-[family-name:var(--font-fraunces)] italic",
                  chipRadiusClass: "rounded-full",
                }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* MAP — organic */}
      <section id="mapa" className="py-16 sm:py-20 lg:py-24" style={{ background: palette.sage + "22" }}>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:items-center">
          <Reveal className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: palette.terracotta }}>
              Region
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl leading-tight sm:mt-4 sm:text-5xl md:text-6xl">
              {COVERAGE_HEADLINE}
            </h2>
            <p
              className="mt-6 max-w-md text-base leading-relaxed"
              style={{ color: palette.ink, opacity: 0.8 }}
            >
              {COVERAGE_INTRO}
            </p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <div
              className="overflow-hidden rounded-[32px] border bg-white p-3"
              style={{ borderColor: palette.ink + "15" }}
            >
              <CoverageMap
                variant="outdoors"
                aspect="4/3"
                pinColor="c47754"
                hqColor="5b6b3f"
                rounded="rounded-3xl"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ANTIGRAVITY — terracotta particles on moss */}
      <AntigravitySection
        color={palette.terracotta}
        bg={palette.moss}
        textColor={palette.cream}
        paddingClass="py-28 sm:py-36"
        count={1600}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: palette.terracotta }}
          >
            Pielęgnacja od marca do listopada
          </p>
          <h2 className="mt-5 font-[family-name:var(--font-fraunces)] text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
            Każda godzina,
            <br />
            <span className="italic" style={{ color: palette.cream }}>
              każdy oddech
            </span>
            <br />w ogrodzie.
          </h2>
          <p
            className="mt-8 max-w-md mx-auto text-base sm:text-lg"
            style={{ opacity: 0.85 }}
          >
            Niech ogród rośnie tak, jak chce. My tylko mu pomożemy.
          </p>
        </div>
      </AntigravitySection>

      {/* QUOTE */}
      <section className="py-16 sm:py-20 lg:py-24">
        <Reveal className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span
            className="font-[family-name:var(--font-fraunces)] text-6xl italic sm:text-8xl"
            style={{ color: palette.terracotta }}
          >
            ❝
          </span>
          <blockquote className="-mt-4 font-[family-name:var(--font-fraunces)] text-2xl italic leading-snug sm:-mt-6 sm:text-3xl md:text-4xl">
            {TESTIMONIALS[1].quote}
          </blockquote>
          <p
            className="mt-6 text-xs uppercase tracking-[0.3em] sm:mt-8"
            style={{ color: palette.terracotta }}
          >
            {TESTIMONIALS[1].name} · {TESTIMONIALS[1].role}
          </p>
        </Reveal>
      </section>

      {/* CTA */}
      <section id="kontakt" className="pb-16 sm:pb-20 lg:pb-24">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <div
            className="relative overflow-hidden rounded-[32px] px-6 py-12 sm:rounded-[48px] sm:px-8 sm:py-16 md:px-16"
            style={{ background: palette.terracotta, color: palette.cream }}
          >
            <div
              className="absolute -right-32 -top-32 h-96 w-96 animate-blob rounded-full opacity-30"
              style={{ background: palette.cream }}
            />
            <div className="relative grid gap-8 sm:gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="font-[family-name:var(--font-fraunces)] text-4xl leading-tight sm:text-5xl md:text-6xl">
                  Zacznijmy
                  <br />
                  od{" "}
                  <span className="italic">jednego spaceru</span>
                  <br />
                  po Twoim ogrodzie.
                </h2>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <a
                  href={`tel:${COMPANY.phoneRaw}`}
                  className="flex items-center justify-between rounded-3xl px-5 py-4 sm:px-6 sm:py-5"
                  style={{ background: palette.cream, color: palette.ink }}
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider opacity-70">
                      Telefon
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-fraunces)] text-xl sm:text-2xl">
                      {COMPANY.phone}
                    </p>
                  </div>
                  <span>→</span>
                </a>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="flex items-center justify-between rounded-3xl px-5 py-4 sm:px-6 sm:py-5"
                  style={{ background: palette.cream, color: palette.ink }}
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider opacity-70">
                      E-mail
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-fraunces)] text-base sm:text-xl">
                      {COMPANY.email}
                    </p>
                  </div>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER — organic */}
      <footer
        className="border-t pt-14 pb-10 sm:pt-16"
        style={{ borderColor: palette.ink + "20", background: palette.cream, color: palette.ink }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Brand */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-10 w-10 place-items-center rounded-full font-[family-name:var(--font-fraunces)] italic"
                  style={{ background: palette.moss, color: palette.cream }}
                >
                  k
                </span>
                <span className="font-[family-name:var(--font-fraunces)] text-lg">{COMPANY.name}</span>
              </div>
              <p
                className="mt-6 max-w-md font-[family-name:var(--font-fraunces)] text-2xl italic leading-snug"
                style={{ color: palette.moss }}
              >
                Słuchamy, obserwujemy
                <br />i tylko wtedy działamy.
              </p>
              <Socials
                className="mt-7"
                variant="outline"
                linkClassName="!border-current/40"
              />
            </div>

            {/* Strona */}
            <div className="lg:col-span-3">
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: palette.terracotta }}
              >
                Strona
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li><a href="#uslugi" className="hover:underline">Co robimy</a></li>
                <li><a href="#opowiesc" className="hover:underline">Opowieść</a></li>
                <li><a href="#proces" className="hover:underline">Proces</a></li>
                <li><a href="#zespol" className="hover:underline">Zespół</a></li>
                <li><a href="#faq" className="hover:underline">FAQ</a></li>
              </ul>
            </div>

            {/* Kontakt */}
            <div className="lg:col-span-4">
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: palette.terracotta }}
              >
                Kontakt
              </p>
              <address className="mt-5 space-y-3 text-sm not-italic">
                <p>
                  <a
                    href={`tel:${COMPANY.phoneRaw}`}
                    className="font-[family-name:var(--font-fraunces)] text-2xl italic"
                    style={{ color: palette.moss }}
                  >
                    {COMPANY.phone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${COMPANY.email}`} className="underline-offset-4 hover:underline">
                    {COMPANY.email}
                  </a>
                </p>
                <p>{ADDRESS.fullLine}</p>
                <p className="text-xs opacity-70">{ADDRESS.hours}</p>
              </address>
            </div>
          </div>

          <div
            className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-xs"
            style={{ borderColor: palette.ink + "20" }}
          >
            <p style={{ opacity: 0.75 }}>
              © {new Date().getFullYear()} {COMPANY.name} · NIP {ADDRESS.nip}
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:underline" style={{ color: palette.moss }}>
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
