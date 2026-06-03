import type { Metadata } from "next";
import { COMPANY, SERVICES, FAQ, IMG, STATS, TEAM, ADDRESS, LEGAL_LINKS } from "@/lib/data";
import { COVERAGE_HEADLINE, COVERAGE_INTRO } from "@/lib/coverage";
import { Reveal, HeroReveal, StaggerGrid, StaggerItem } from "@/components/motion";
import { Stat } from "@/components/Stat";
import { SitePreloader } from "@/components/SitePreloader";
import { CoverageMap } from "@/components/CoverageMap";
import { AntigravitySection } from "@/components/AntigravitySection";
import { Socials } from "@/components/Socials";
import { CalculatorForm } from "@/components/CalculatorForm";
import { WarpedHoverImage } from "@/components/WarpedHoverImage";

const EQUIPMENT = [
  { code: "01", name: "Kosiarki Stihl", spec: "RM 4 RTP / 3 RT · spalinowe i akumulatorowe" },
  { code: "02", name: "Podkaszarki", spec: "FS 56 RC-E · żyłka 2,4 mm" },
  { code: "03", name: "Nożyce Felco", spec: "Sekatory + nożyce dwuręczne · ostre, regulowane" },
  { code: "04", name: "Wertykulator", spec: "RLE 540 · spalinowy, do 1 200 m²" },
  { code: "05", name: "Dmuchawa", spec: "BG 86 · do liści i porządków" },
  { code: "06", name: "Pilarka", spec: "MS 211 · cięcie konarów i drewna opałowego" },
];

export const metadata: Metadata = { title: `${COMPANY.name} — Brutalist` };

export default function Example4() {
  return (
    <>
    <SitePreloader
      storageKey="ogrody:ex4"
      variant="stairs"
      duration={1400}
      bgColor="#000000"
      iconColor="#c9ff52"
      iconSize={56}
      brandClassName="text-4xl md:text-6xl font-black uppercase tracking-tight font-[family-name:var(--font-archivo-black)] text-[#c9ff52]"
      taglineClassName="text-xs uppercase tracking-[0.3em] font-bold text-[#c9ff52]/80"
      tagline="Ogród. Robota."
      stairCount={6}
      stairsRevealFrom="left"
    />
    <main className="min-h-screen bg-[#edf6d1] font-[family-name:var(--font-grotesk)] text-black">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b-2 border-black bg-[#edf6d1]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <a
            href="#"
            className="flex items-center gap-2 text-base font-black tracking-tight"
          >
            <span className="grid h-8 w-8 place-items-center border-2 border-black bg-black text-[#c9ff52]">
              ✦
            </span>
            <span className="font-[family-name:var(--font-archivo-black)] uppercase">
              {COMPANY.shortName}
            </span>
          </a>
          <nav className="hidden gap-1 text-[13px] font-bold uppercase md:flex">
            {["Usługi", "Cennik", "Realizacje", "FAQ", "Kontakt"].map((l) => (
              <a
                key={l}
                href="#"
                className="border-2 border-black bg-white px-3 py-1.5 transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000]"
              >
                {l}
              </a>
            ))}
          </nav>
          <a
            href={`tel:${COMPANY.phoneRaw}`}
            className="shrink-0 border-2 border-black bg-black px-3 py-2 text-[13px] font-black uppercase text-[#c9ff52]"
          >
            Zadzwoń
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b-2 border-black">
        <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-0">
          <div className="col-span-12 border-b-2 border-black px-4 py-8 sm:px-6 sm:py-10 lg:col-span-8 lg:border-b-0 lg:border-r-2 lg:py-14">
            <HeroReveal delay={0.05}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Wolne terminy w sezonie
              </div>
            </HeroReveal>
            <HeroReveal delay={0.15}>
              <h1 className="mt-5 font-[family-name:var(--font-archivo-black)] text-4xl uppercase leading-[0.95] tracking-tight sm:mt-6 sm:text-5xl md:text-7xl lg:text-[88px]">
                Twój ogród.
                <br />
                <span className="bg-black px-2 text-[#c9ff52]">Nasza</span>{" "}
                robota.
              </h1>
            </HeroReveal>
            <HeroReveal delay={0.3}>
              <p className="mt-6 max-w-xl text-base leading-relaxed sm:mt-7">
                Bez ściemy i bez napompowanych pakietów. Przyjeżdżamy, kosimy,
                grabimy, tniemy, sadzimy. Wracasz do gotowego ogrodu — koniec
                tematu.
              </p>
            </HeroReveal>
            <HeroReveal delay={0.45}>
            <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
              <a
                href="#kontakt"
                className="border-2 border-black bg-black px-5 py-3 text-sm font-bold uppercase text-[#c9ff52] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000]"
              >
                Bezpłatna wycena →
              </a>
              <a
                href="#uslugi"
                className="border-2 border-black bg-white px-5 py-3 text-sm font-bold uppercase transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000]"
              >
                Lista usług
              </a>
            </div>
            </HeroReveal>

            <HeroReveal delay={0.6}>
            <dl className="mt-10 grid max-w-xl grid-cols-3 border-t-2 border-black pt-5 sm:mt-12 sm:pt-6">
              {STATS.slice(0, 3).map((s, i) => (
                <div
                  key={s.label}
                  className={`px-2 ${i !== 0 ? "border-l-2 border-black" : ""}`}
                >
                  <dt className="font-[family-name:var(--font-archivo-black)] text-2xl sm:text-3xl md:text-4xl">
                    <Stat value={s.value} />
                  </dt>
                  <dd className="mt-1 text-[10px] font-bold uppercase tracking-wider">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
            </HeroReveal>
          </div>
          <aside className="col-span-12 flex flex-col gap-0 lg:col-span-4">
            {/* Big photo — B&W brutalist */}
            <figure className="relative h-64 w-full overflow-hidden border-b-2 border-black md:h-80 lg:h-[360px]">
              <WarpedHoverImage
                src={IMG.manMowing}
                alt="Praca w ogrodzie"
                className="absolute inset-0 h-full w-full object-cover grayscale contrast-110"
              />
              <span className="absolute left-3 top-3 z-10 border-2 border-black bg-[#c9ff52] px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                W akcji
              </span>
              <span className="absolute bottom-3 right-3 z-10 border-2 border-black bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                Sezon {new Date().getFullYear()}
              </span>
            </figure>
            {/* Phone (primary) */}
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="border-b-2 border-black bg-[#c9ff52] px-5 py-5 transition hover:bg-black hover:text-[#c9ff52]"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest">
                Telefon — najszybciej
              </p>
              <p className="mt-1 font-[family-name:var(--font-archivo-black)] text-2xl md:text-3xl">
                {COMPANY.phone}
              </p>
            </a>
            {/* Email (secondary) */}
            <a
              href={`mailto:${COMPANY.email}`}
              className="flex flex-1 items-center justify-between gap-3 bg-white px-5 py-4 transition hover:bg-black hover:text-white"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  E-mail
                </p>
                <p className="mt-0.5 text-sm font-bold">{COMPANY.email}</p>
              </div>
              <span className="text-2xl font-black">→</span>
            </a>
          </aside>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-b-2 border-black bg-black py-3 text-[#c9ff52]">
        <div className="flex w-max animate-marquee gap-6 whitespace-nowrap font-[family-name:var(--font-archivo-black)] text-lg uppercase tracking-tight sm:gap-10 sm:text-xl md:text-2xl">
          {[...Array(3)].flatMap((_, k) =>
            [
              "Koszenie ✦",
              "Pielęgnacja ✦",
              "Sadzenie ✦",
              "Grabienie ✦",
              "Cięcie ✦",
              "Porządki ✦",
              "Aranżacja ✦",
              "Bez nawodnień ✦",
            ].map((t) => <span key={`${k}-${t}`}>{t}</span>)
          )}
        </div>
      </div>

      {/* SERVICES */}
      <section className="border-b-2 border-black">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-14">
          <Reveal>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest">
                  Usługi
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-archivo-black)] text-3xl uppercase leading-[0.95] tracking-tight sm:text-4xl md:text-5xl">
                  Co robimy w ogrodzie.
                </h2>
              </div>
              <p className="max-w-sm text-sm">
                Pełen zakres — od koszenia po aranżację rabat. Wszystko własnym
                sprzętem i ekipą.
              </p>
            </div>
          </Reveal>
          <StaggerGrid className="grid gap-0 border-2 border-black bg-white">
            {SERVICES.map((s, i) => (
              <StaggerItem
                key={s.slug}
                className="group grid grid-cols-12 items-center gap-3 border-b-2 border-black px-4 py-4 transition last:border-b-0 hover:bg-[#c9ff52] sm:px-5 md:py-5"
              >
                <div className="col-span-2 font-[family-name:var(--font-archivo-black)] text-xl md:col-span-1 md:text-2xl">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-10 md:col-span-4">
                  <h3 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase leading-tight md:text-xl">
                    {s.title}
                  </h3>
                </div>
                <p className="col-span-12 text-sm md:col-span-6">
                  {s.description}
                </p>
                <span className="col-span-12 text-right text-lg font-black md:col-span-1">
                  →
                </span>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="border-b-2 border-black bg-[#c9ff52] px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-widest">
              Zasady, na których działamy
            </p>
            <p className="mt-3 max-w-4xl font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-[1.05] tracking-tight sm:mt-4 sm:text-3xl md:text-5xl">
              Nie sprzedajemy{" "}
              <span className="bg-black px-2 text-[#c9ff52]">marzeń</span>.
              Sprzedajemy{" "}
              <span className="underline decoration-[4px] underline-offset-4">
                dobrze
              </span>{" "}
              zrobiony ogród.
            </p>
          </Reveal>
          <StaggerGrid className="mt-8 grid gap-5 sm:mt-10 sm:gap-6 md:grid-cols-3">
            {[
              ["Punktualnie", "Termin to termin. Bez spóźnień i przesunięć."],
              ["Bez ukrytych kosztów", "Wycena = rachunek. Cena z oględzin nie rośnie."],
              ["Czysto po pracy", "Zostawiamy ogród gotowy. Zero śmieci, zero śladów."],
            ].map(([h, p]) => (
              <StaggerItem key={h} className="border-l-2 border-black pl-3">
                <p className="font-[family-name:var(--font-archivo-black)] text-lg uppercase">
                  {h}
                </p>
                <p className="mt-2 text-sm">{p}</p>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* GALLERY */}
      <section className="border-b-2 border-black">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-0 md:grid-cols-4">
          {[
            [IMG.lawnSuburb, "Trawnik"],
            [IMG.hedge1, "Żywopłot"],
            [IMG.tulipField, "Nasadzenia"],
            [IMG.autumn2, "Liście"],
            [IMG.echinacea, "Rabata"],
            [IMG.backyard2, "Ogród"],
            [IMG.lawnMower1, "Koszenie"],
            [IMG.cherry, "Wiosna"],
          ].map(([src, label], i) => (
            <figure
              key={i}
              className={`relative aspect-square w-full overflow-hidden ${
                i % 4 !== 3 ? "border-r-2 border-black" : ""
              } ${i < 4 ? "border-b-2 border-black" : ""}`}
            >
              <WarpedHoverImage src={src} alt="" className="h-full w-full object-cover" />
              <figcaption className="absolute left-3 top-3 z-10 border-2 border-black bg-white px-2 py-0.5 text-[10px] font-bold uppercase">
                {label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* TEAM — brutalist B&W portrait grid */}
      <section className="border-b-2 border-black bg-white px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 sm:mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest">
                  Zespół
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-archivo-black)] text-3xl uppercase leading-[0.95] tracking-tight sm:text-4xl md:text-5xl">
                  Cztery osoby. Jedna ekipa.
                </h2>
              </div>
              <p className="max-w-sm text-sm">
                Tyle nas wystarczy, żeby zająć się Waszym ogrodem od marca do
                listopada.
              </p>
            </div>
          </Reveal>
          <StaggerGrid className="grid gap-0 border-2 border-black sm:grid-cols-2 lg:grid-cols-4" amount={0.05}>
            {TEAM.map((m, i) => (
              <StaggerItem
                key={m.name}
                className={[
                  "bg-white p-5 transition hover:bg-[#c9ff52]",
                  i < TEAM.length - 1 ? "border-b-2 border-black sm:border-r-2 sm:[&:nth-child(2)]:border-r-0 lg:[&]:border-r-2 lg:[&:nth-child(4)]:border-r-0" : "",
                ].join(" ")}
              >
                <div className="relative aspect-square overflow-hidden border-2 border-black">
                  <WarpedHoverImage
                    src={m.photo}
                    alt={`Portret ${m.name}`}
                    className="h-full w-full object-cover grayscale contrast-125"
                  />
                </div>
                <p className="mt-4 font-[family-name:var(--font-archivo-black)] text-lg uppercase">
                  {m.name}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-stone-700">
                  {m.role}
                </p>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* EQUIPMENT — bespoke for ex4 */}
      <section className="border-b-2 border-black bg-[#edf6d1] px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-widest">
              Sprzęt
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-archivo-black)] text-3xl uppercase leading-[0.95] tracking-tight sm:text-4xl md:text-5xl">
              Czym robimy robotę.
            </h2>
            <p className="mt-4 max-w-2xl text-base">
              Bez dorywczego sprzętu. Marki sprawdzone, serwisowane raz w roku.
            </p>
          </Reveal>
          <StaggerGrid className="mt-8 grid gap-0 border-2 border-black bg-white sm:mt-10 sm:grid-cols-2 lg:grid-cols-3" amount={0.05}>
            {EQUIPMENT.map((e, i) => (
              <StaggerItem
                key={e.code}
                className={[
                  "p-5 transition hover:bg-[#c9ff52]",
                  i % 3 !== 2 ? "lg:border-r-2 lg:border-black" : "",
                  i % 2 !== 1 ? "sm:border-r-2 sm:border-black lg:[&:nth-child(3n)]:border-r-0" : "sm:border-r-0",
                  i < EQUIPMENT.length - (EQUIPMENT.length % 3 || 3) ? "lg:border-b-2 lg:border-black" : "",
                  "border-b-2 border-black sm:[&:nth-last-child(-n+2)]:border-b-0 sm:last:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0",
                ].join(" ")}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-wider text-stone-500">
                    {e.code}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                    PL · 2025
                  </span>
                </div>
                <p className="mt-3 font-[family-name:var(--font-archivo-black)] text-xl uppercase leading-tight">
                  {e.name}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{e.spec}</p>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* CALCULATOR — brutalist */}
      <section className="border-b-2 border-black px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-4">
            <p className="text-xs font-bold uppercase tracking-widest">
              Kalkulator
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-archivo-black)] text-3xl uppercase leading-[0.95] tracking-tight sm:text-4xl md:text-5xl">
              Wycena{" "}
              <span className="bg-black px-2 text-[#c9ff52]">teoretyczna</span>.
            </h2>
            <p className="mt-5 max-w-sm text-sm">
              Nie podajemy ceny w ciemno. Wybierzcie zakres, dostajecie
              widełki — reszta po wizycie.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-8">
            <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] sm:p-8">
              <CalculatorForm
                theme={{
                  activeBg: "#000000",
                  activeFg: "#c9ff52",
                  inactiveBorder: "border-2 border-black",
                  inactiveFg: "text-black hover:bg-[#c9ff52]",
                  priceColor: "#000000",
                  priceFontClass: "font-[family-name:var(--font-archivo-black)] uppercase",
                  chipFontClass: "uppercase tracking-wider font-bold text-[11px]",
                  chipRadiusClass: "rounded-none",
                }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* MAP — brutalist */}
      <section className="border-b-2 border-black bg-white px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <p className="text-xs font-bold uppercase tracking-widest">
              Mapa
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-archivo-black)] text-3xl uppercase leading-[0.95] tracking-tight sm:text-4xl md:text-5xl">
              {COVERAGE_HEADLINE}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed">
              {COVERAGE_INTRO}
            </p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="border-2 border-black bg-white p-2 shadow-[8px_8px_0_0_#000]">
              <CoverageMap
                variant="light"
                aspect="4/3"
                pinColor="000000"
                hqColor="000000"
                rounded=""
                className="grayscale contrast-110"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ANTIGRAVITY — lime particles on black */}
      <AntigravitySection
        color="#c9ff52"
        bg="#000000"
        textColor="#c9ff52"
        paddingClass="py-28 sm:py-36"
        className="border-b-2 border-black"
        vignette={false}
        count={1800}
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#c9ff52]/70">
            Bez ściemy. Bez napompowanych pakietów.
          </p>
          <h2 className="mt-5 font-[family-name:var(--font-archivo-black)] text-5xl uppercase leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
            Trawa rośnie{" "}
            <span className="bg-[#c9ff52] px-2 text-black">sama</span>.
            <br />
            My ją tylko{" "}
            <span className="bg-[#c9ff52] px-2 text-black">tniemy</span>.
          </h2>
          <p className="mt-8 max-w-2xl mx-auto text-base font-bold uppercase tracking-wider">
            Reszta to robota, którą znamy od dziesięciu lat.
          </p>
        </div>
      </AntigravitySection>

      {/* FAQ */}
      <section className="border-b-2 border-black px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-widest">FAQ</p>
            <h2 className="mt-2 font-[family-name:var(--font-archivo-black)] text-3xl uppercase leading-[0.95] tracking-tight sm:text-4xl md:text-5xl">
              Najczęstsze pytania
            </h2>
          </Reveal>
          <div className="mt-7 grid gap-4 sm:mt-8 md:grid-cols-2">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="group border-2 border-black bg-white transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-[family-name:var(--font-archivo-black)] text-base uppercase [&::-webkit-details-marker]:hidden">
                  <span className="flex-1">{f.q}</span>
                  <span className="shrink-0 text-xl transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="kontakt" className="bg-black px-4 py-16 text-[#c9ff52] sm:px-6 sm:py-20">
        <Reveal className="mx-auto max-w-[1400px]">
          <p className="text-xs font-bold uppercase tracking-widest">
            Bierzemy Twój ogród na siebie
          </p>
          <p className="mt-3 font-[family-name:var(--font-archivo-black)] text-3xl uppercase leading-[1] tracking-tight sm:text-4xl md:text-7xl">
            Zacznijmy{" "}
            <span className="bg-[#c9ff52] px-2 text-black">od rozmowy.</span>
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="border-2 border-[#c9ff52] bg-[#c9ff52] px-5 py-3.5 text-base font-black uppercase text-black transition hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#c9ff52] sm:px-6 sm:py-4 sm:text-lg"
            >
              {COMPANY.phone}
            </a>
            <a
              href={`mailto:${COMPANY.email}`}
              className="break-all border-2 border-[#c9ff52] px-5 py-3.5 text-sm font-black uppercase transition hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#c9ff52] sm:px-6 sm:py-4 sm:text-lg"
            >
              {COMPANY.email} →
            </a>
          </div>
        </Reveal>
      </section>

      {/* FOOTER — brutalist border grid */}
      <footer className="bg-[#c9ff52] text-black">
        <div className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 sm:pt-12">
          <div className="grid grid-cols-12 gap-0 border-2 border-black bg-white text-sm">
            {/* Brand block */}
            <div className="col-span-12 border-b-2 border-black p-6 md:col-span-5 md:border-b-0 md:border-r-2 md:p-8">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center border-2 border-black bg-black text-[#c9ff52]">✦</span>
                <span className="font-[family-name:var(--font-archivo-black)] uppercase">{COMPANY.shortName}</span>
              </div>
              <p className="mt-6 font-[family-name:var(--font-archivo-black)] text-3xl uppercase leading-[0.95] md:text-4xl">
                Twój ogród.
                <br />
                <span className="bg-black px-2 text-[#c9ff52]">Nasza</span> robota.
              </p>
              <Socials
                className="mt-8 text-black"
                linkClassName="!rounded-none !h-11 !w-11 border-2 border-black hover:bg-black hover:text-[#c9ff52]"
                variant="ghost"
              />
            </div>

            {/* Kontakt + adres */}
            <div className="col-span-12 grid grid-cols-2 border-b-2 border-black md:col-span-7 md:border-b-0">
              <div className="border-b-2 border-r-2 border-black p-6 md:p-8">
                <p className="text-[10px] font-bold uppercase tracking-widest">Telefon</p>
                <a
                  href={`tel:${COMPANY.phoneRaw}`}
                  className="mt-3 block font-[family-name:var(--font-archivo-black)] text-xl md:text-2xl"
                >
                  {COMPANY.phone}
                </a>
              </div>
              <div className="border-b-2 border-black p-6 md:p-8">
                <p className="text-[10px] font-bold uppercase tracking-widest">E-mail</p>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="mt-3 block break-all font-[family-name:var(--font-archivo-black)] text-sm md:text-base"
                >
                  {COMPANY.email}
                </a>
              </div>
              <div className="col-span-2 border-b-2 border-black p-6 md:p-8">
                <p className="text-[10px] font-bold uppercase tracking-widest">Adres</p>
                <p className="mt-3 font-[family-name:var(--font-archivo-black)] text-base uppercase md:text-lg">
                  {ADDRESS.fullLine}
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-stone-600">{ADDRESS.hours}</p>
              </div>

              {/* Strona links */}
              <div className="col-span-2 grid grid-cols-2 text-[11px] font-bold uppercase tracking-wider md:grid-cols-3">
                {[
                  { l: "Usługi", h: "#uslugi" },
                  { l: "Sprzęt", h: "#sprzet" },
                  { l: "Realizacje", h: "#realizacje" },
                  { l: "FAQ", h: "#faq" },
                  { l: "Kontakt", h: "#kontakt" },
                  { l: "Zespół", h: "#zespol" },
                ].map((n, i) => (
                  <a
                    key={n.l}
                    href={n.h}
                    className={`border-black p-4 transition hover:bg-[#c9ff52] md:p-5 ${
                      i % 2 !== 1 ? "border-r-2" : ""
                    } ${i % 3 !== 2 ? "md:border-r-2" : ""} ${
                      i < 4 ? "border-b-2 md:[&:nth-child(-n+3)]:border-b-2" : "border-b-2 md:border-b-0"
                    }`}
                  >
                    {n.l} →
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-0 flex flex-wrap items-center justify-between gap-4 border-x-2 border-b-2 border-black bg-black px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-[#c9ff52]">
            <span>{COMPANY.name} © {new Date().getFullYear()} · NIP {ADDRESS.nip}</span>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:underline">{l.label}</a>
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
