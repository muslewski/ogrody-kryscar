import type { Metadata } from "next";
import { COMPANY, SERVICES, TESTIMONIALS, STATS, FAQ, TEAM, ADDRESS, LEGAL_LINKS, IMG } from "@/lib/data";
import { COVERAGE_HEADLINE, COVERAGE_INTRO } from "@/lib/coverage";
import { Reveal, HeroReveal, StaggerGrid, StaggerItem } from "@/components/motion";
import { Stat } from "@/components/Stat";
import { SitePreloader } from "@/components/SitePreloader";
import { CoverageMap } from "@/components/CoverageMap";
import { AntigravitySection } from "@/components/AntigravitySection";
import { Socials } from "@/components/Socials";
import { CalculatorForm } from "@/components/CalculatorForm";
import { WarpedHoverImage } from "@/components/WarpedHoverImage";
import { Ex5Nav } from "./_nav";

export const metadata: Metadata = { title: `${COMPANY.name} — Glass` };

export default function Example5() {
  return (
    <>
    <SitePreloader
      storageKey="ogrody:ex5"
      variant="circle"
      duration={1500}
      bgColor="#064e3b"
      iconColor="#a7f3d0"
      iconSize={48}
      brandClassName="text-3xl md:text-5xl font-medium tracking-tight text-emerald-50"
      taglineClassName="text-[10px] uppercase tracking-[0.4em] font-medium text-emerald-200/80"
    />
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-100 via-teal-50 to-lime-100 font-[family-name:var(--font-manrope)] text-emerald-950">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-emerald-400/40 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-[600px] w-[600px] rounded-full bg-teal-300/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[480px] w-[480px] rounded-full bg-lime-300/40 blur-3xl" />
      </div>

      {/* NAV — fixed with isScrolled */}
      <Ex5Nav />

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-4 pt-12 pb-12 sm:px-6 sm:pt-16 sm:pb-16 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <HeroReveal delay={0.05}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-1.5 text-xs text-emerald-950 backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Sezon {new Date().getFullYear()} — wolne terminy
              </span>
            </HeroReveal>
            <HeroReveal delay={0.15}>
              <h1 className="mt-5 text-4xl font-medium leading-[1.05] tracking-tight sm:mt-6 sm:text-5xl md:text-6xl lg:text-7xl">
                Lekki ogród.
                <br />
                <span className="bg-gradient-to-r from-emerald-700 to-teal-500 bg-clip-text text-transparent">
                  Bezstresowy sezon.
                </span>
              </h1>
            </HeroReveal>
            <HeroReveal delay={0.3}>
              <p className="mt-5 max-w-xl text-base text-emerald-900/80 sm:mt-6 sm:text-lg">
                Kompleksowa obsługa ogrodu zamknięta w przejrzystych pakietach.
                Płacisz tylko za to, czego naprawdę potrzebujesz.
              </p>
            </HeroReveal>
            <HeroReveal delay={0.45}>
            <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
              <a
                href="#kontakt"
                className="rounded-full bg-emerald-900 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800"
              >
                Zamów wycenę
              </a>
              <a
                href="#pakiety"
                className="rounded-full border border-white/80 bg-white/75 px-6 py-3 text-sm font-medium text-emerald-950 backdrop-blur-xl hover:bg-white"
              >
                Zobacz pakiety
              </a>
            </div>
            </HeroReveal>

            <HeroReveal delay={0.6}>
            <div className="mt-10 grid grid-cols-3 gap-3 sm:mt-12 sm:flex sm:flex-wrap sm:gap-4">
              {STATS.slice(0, 3).map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/80 bg-white/70 px-3 py-3 backdrop-blur-xl sm:px-5 sm:py-4"
                >
                  <p className="text-xl font-medium sm:text-2xl"><Stat value={s.value} /></p>
                  <p className="text-[11px] text-emerald-900/70 sm:text-xs">{s.label}</p>
                </div>
              ))}
            </div>
            </HeroReveal>
          </div>

          {/* Floating Glass Cards */}
          <HeroReveal delay={0.25} className="relative lg:col-span-5">
            <div className="relative h-[380px] sm:h-[480px] lg:h-[520px]">
              <div className="absolute inset-0 overflow-hidden rounded-[28px] sm:rounded-[36px]">
                <WarpedHoverImage
                  src={IMG.gardenerYard}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute right-3 top-3 w-48 rounded-2xl border border-white/90 bg-white/85 p-3 text-emerald-950 backdrop-blur-xl sm:right-4 sm:top-4 sm:w-56 sm:p-4">
                <p className="text-[11px] uppercase tracking-wider text-emerald-800 sm:text-xs">
                  Najbliższy termin
                </p>
                <p className="mt-1 text-base font-semibold sm:text-lg">w tym tygodniu</p>
                <p className="mt-1.5 text-[11px] text-emerald-800 sm:mt-2 sm:text-xs">
                  Pn – Pt, 8:00 – 18:00
                </p>
              </div>
              <div className="absolute left-3 top-1/2 hidden w-60 -translate-y-1/2 rounded-2xl border border-white/90 bg-white/85 p-4 text-emerald-950 backdrop-blur-xl sm:block sm:w-64 lg:-left-6 lg:translate-y-0">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-400/30 text-xl">
                    ⭐
                  </div>
                  <div>
                    <p className="text-sm font-semibold">4,9 / 5</p>
                    <p className="text-xs text-emerald-800">
                      187 opinii klientów
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 rounded-2xl border border-white/90 bg-white/85 p-3 text-[11px] text-emerald-950 backdrop-blur-xl sm:bottom-6 sm:right-6 sm:p-4 sm:text-xs">
                <p className="font-semibold">{COMPANY.phone}</p>
                <p className="text-emerald-800">{COMPANY.email}</p>
              </div>
            </div>
          </HeroReveal>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal className="mb-10 max-w-3xl sm:mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
            Co robimy
          </p>
          <h2 className="mt-3 text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
            Wszystko, czego potrzebuje Twój ogród.
          </h2>
        </Reveal>
        <StaggerGrid className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.slice(0, 6).map((s, i) => (
            <StaggerItem
              key={s.slug}
              className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/30 p-6 backdrop-blur-xl transition hover:bg-white/50"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-200 to-teal-100 text-xl">
                {["🌿", "🪴", "🍂", "🌱", "✂️", "🧹"][i]}
              </span>
              <h3 className="mt-5 text-xl font-medium tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">
                {s.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm text-emerald-800">
                Szczegóły
                <span className="transition group-hover:translate-x-1">→</span>
              </span>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* PRICING / PACKAGES */}
      <section id="pakiety" className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6 sm:mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                Pakiety opieki
              </p>
              <h2 className="mt-3 text-3xl font-medium sm:text-4xl md:text-5xl">
                Wybierz pakiet, który pasuje do Twojego ogrodu.
              </h2>
            </div>
            <p className="max-w-md text-sm text-emerald-900/80">
              Pakiety to wygodna formuła stałej obsługi. Wszystko możesz też
              zamówić jednorazowo.
            </p>
          </div>
        </Reveal>
        <StaggerGrid className="grid gap-3 sm:gap-4 lg:grid-cols-3">
          {[
            {
              name: "Lekki",
              tag: "Mały ogród",
              price: "od 199 zł",
              feats: [
                "Koszenie 2x w miesiącu",
                "Podkaszanie krawędzi",
                "Wywóz skoszonej trawy",
                "Drobne porządki",
              ],
              accent: false,
            },
            {
              name: "Sezonowy",
              tag: "Najczęściej wybierany",
              price: "od 349 zł",
              feats: [
                "Koszenie co tydzień",
                "Cięcie krzewów raz w miesiącu",
                "Wiosenne i jesienne porządki",
                "Doradztwo nasadzeń",
              ],
              accent: true,
            },
            {
              name: "Premium",
              tag: "Reprezentacyjny ogród",
              price: "wycena indywidualna",
              feats: [
                "Koszenie 2x w tygodniu",
                "Pełna pielęgnacja roślin",
                "Strzyżenie żywopłotów",
                "Stała opieka ogrodnika",
              ],
              accent: false,
            },
          ].map((p) => (
            <StaggerItem
              key={p.name}
              className={`relative rounded-3xl border p-6 backdrop-blur-xl sm:p-8 ${
                p.accent
                  ? "border-emerald-900 bg-emerald-900 text-emerald-50 shadow-2xl shadow-emerald-900/20"
                  : "border-white/60 bg-white/40 text-emerald-950"
              }`}
            >
              {p.accent && (
                <span className="absolute -top-3 left-8 rounded-full bg-lime-300 px-3 py-1 text-xs font-medium text-emerald-900">
                  {p.tag}
                </span>
              )}
              {!p.accent && (
                <span className="text-xs uppercase tracking-wider opacity-70">
                  {p.tag}
                </span>
              )}
              <p
                className={`mt-4 text-3xl font-medium ${
                  p.accent ? "text-lime-200" : ""
                }`}
              >
                {p.name}
              </p>
              <p className="mt-2 text-4xl font-medium">{p.price}</p>
              <ul className="mt-8 space-y-3 text-sm">
                {p.feats.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span
                      className={
                        p.accent ? "text-lime-300" : "text-emerald-700"
                      }
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#kontakt"
                className={`mt-8 block rounded-full px-5 py-3 text-center text-sm font-medium ${
                  p.accent
                    ? "bg-lime-300 text-emerald-900"
                    : "border border-emerald-900/30 text-emerald-900 hover:bg-emerald-900 hover:text-white"
                }`}
              >
                Wybierz pakiet
              </a>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal>
        <div className="rounded-[28px] border border-white/60 bg-white/30 p-6 backdrop-blur-xl sm:rounded-[36px] sm:p-10 md:p-16">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
            Opinie
          </p>
          <h2 className="mt-3 text-3xl font-medium sm:text-4xl md:text-5xl">
            Zaufali nam — i zostali na lata.
          </h2>
          <StaggerGrid className="mt-8 grid gap-5 sm:mt-10 sm:gap-6 md:grid-cols-3">
            {TESTIMONIALS.slice(0, 3).map((t) => (
              <StaggerItem
                key={t.name}
                className="rounded-2xl border border-white/70 bg-white/40 p-6 backdrop-blur-xl"
              >
                <div className="flex gap-0.5 text-amber-500">★★★★★</div>
                <blockquote className="mt-4 text-base leading-relaxed">
                  „{t.quote}”
                </blockquote>
                <figcaption className="mt-6 text-sm">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-emerald-900/70">{t.role}</p>
                </figcaption>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
        </Reveal>
      </section>

      {/* TEAM — frosted portrait cards */}
      <section id="zespol" className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal className="mb-10 max-w-3xl sm:mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
            Zespół
          </p>
          <h2 className="mt-3 text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
            Ludzie, którzy{" "}
            <span className="bg-gradient-to-r from-emerald-700 to-teal-500 bg-clip-text text-transparent">
              przyjadą do Was
            </span>
            .
          </h2>
        </Reveal>
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" amount={0.05}>
          {TEAM.map((m) => (
            <StaggerItem
              key={m.name}
              className="overflow-hidden rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <WarpedHoverImage
                  src={m.photo}
                  alt={`Portret ${m.name}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <p className="text-lg font-medium tracking-tight">{m.name}</p>
                <p className="mt-1 text-xs text-emerald-900/70">{m.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-emerald-900/80">
                  {m.bio}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* CALCULATOR — frosted glass */}
      <section id="kalkulator" className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
              Kalkulator
            </p>
            <h2 className="mt-3 text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
              Wycena
              <br />
              <span className="bg-gradient-to-r from-emerald-700 to-teal-500 bg-clip-text text-transparent">
                w 30 sekund
              </span>
              .
            </h2>
            <p className="mt-5 max-w-sm text-base text-emerald-900/80 sm:mt-6 sm:text-lg">
              Wybierzcie zakres prac i wielkość ogrodu. Pokażemy widełki
              cenowe — dokładną ofertę otrzymujecie po wizycie.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="rounded-[36px] border border-white/60 bg-white/40 p-6 backdrop-blur-xl sm:p-10">
              <CalculatorForm
                theme={{
                  activeBg: "#064e3b",
                  activeFg: "#ecfdf5",
                  inactiveBorder: "border-white/80",
                  inactiveFg: "text-emerald-950 bg-white/60 hover:bg-white/80",
                  priceColor: "#064e3b",
                  chipRadiusClass: "rounded-full",
                }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* MAP — frosted */}
      <section id="mapa" className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="overflow-hidden rounded-[36px] border border-white/60 bg-white/30 backdrop-blur-xl">
          <div className="grid gap-0 md:grid-cols-2">
            <Reveal className="p-6 sm:p-10 md:p-12">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                Region
              </p>
              <h2 className="mt-3 text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
                {COVERAGE_HEADLINE}
              </h2>
              <p className="mt-5 text-base text-emerald-900/80 sm:text-lg">
                {COVERAGE_INTRO}
              </p>
            </Reveal>
            <Reveal delay={0.1} className="p-4 sm:p-6 md:p-8">
              <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/30 p-2 backdrop-blur-xl">
                <CoverageMap
                  variant="outdoors"
                  aspect="1/1"
                  pinColor="0d9488"
                  hqColor="064e3b"
                  rounded="rounded-2xl"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ANTIGRAVITY — emerald particles on light bg */}
      <AntigravitySection
        color="#10b981"
        bg="#064e3b"
        textColor="#ecfdf5"
        paddingClass="py-28 sm:py-36"
        count={1700}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
            Stała opieka 2025
          </p>
          <h2 className="mt-5 text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Wracajcie do{" "}
            <span className="bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent">
              gotowego
            </span>
            <br />
            ogrodu.
          </h2>
          <p className="mt-8 max-w-md mx-auto text-base text-emerald-100/85 sm:text-lg">
            Wy w pracy, my w ogrodzie. Codziennie ktoś u kogoś.
          </p>
        </div>
      </AntigravitySection>

      {/* FAQ */}
      <section id="faq" className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal className="mb-10 max-w-3xl sm:mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
            Pytania
          </p>
          <h2 className="mt-3 text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
            Wszystko, co warto wiedzieć przed pierwszą rozmową.
          </h2>
        </Reveal>
        <StaggerGrid className="grid gap-3 sm:gap-4" amount={0.05}>
          {FAQ.map((f) => (
            <StaggerItem
              key={f.q}
              className="overflow-hidden rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl"
            >
              <details className="group">
                <summary className="flex cursor-pointer items-start gap-4 p-5 transition hover:bg-white/60 sm:gap-5 sm:p-6">
                  <span
                    aria-hidden
                    className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/80 bg-white/70 text-emerald-800 transition group-open:rotate-180 group-open:border-emerald-700 group-open:bg-emerald-700 group-open:text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="flex-1 text-base font-medium tracking-tight text-emerald-950 sm:text-lg">
                    {f.q}
                  </span>
                </summary>
                <div className="border-t border-white/60 bg-white/30 px-5 py-4 backdrop-blur-xl sm:px-6 sm:py-5">
                  <p className="ml-12 text-sm leading-relaxed text-emerald-900/80 sm:ml-13 sm:text-base">
                    {f.a}
                  </p>
                </div>
              </details>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* CONTACT */}
      <section id="kontakt" className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal className="overflow-hidden rounded-[28px] border border-white/60 bg-white/30 backdrop-blur-xl sm:rounded-[36px]">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="relative h-56 overflow-hidden sm:h-72 md:h-auto">
              <WarpedHoverImage
                src={IMG.cherry}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="p-6 sm:p-10 md:p-12">
              <h2 className="text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
                Zacznijmy
                <br />
                <span className="bg-gradient-to-r from-emerald-700 to-teal-500 bg-clip-text text-transparent">
                  od rozmowy.
                </span>
              </h2>
              <p className="mt-3 text-sm text-emerald-900/80 sm:mt-4 sm:text-base">
                Zadzwoń lub zostaw kontakt — oddzwonimy w ciągu jednego dnia
                roboczego.
              </p>
              <div className="mt-6 space-y-3 sm:mt-8">
                <a
                  href={`tel:${COMPANY.phoneRaw}`}
                  className="flex items-center justify-between rounded-2xl border border-emerald-900/15 bg-white/60 px-5 py-4 transition hover:bg-white"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider text-emerald-700">
                      Telefon
                    </p>
                    <p className="mt-1 text-lg font-medium">{COMPANY.phone}</p>
                  </div>
                  <span className="text-emerald-700">→</span>
                </a>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="flex items-center justify-between rounded-2xl border border-emerald-900/15 bg-white/60 px-5 py-4 transition hover:bg-white"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider text-emerald-700">
                      E-mail
                    </p>
                    <p className="mt-1 text-lg font-medium">{COMPANY.email}</p>
                  </div>
                  <span className="text-emerald-700">→</span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER — frosted card */}
      <footer className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="rounded-[36px] border border-white/60 bg-white/30 p-8 backdrop-blur-xl text-emerald-950 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <a href="#" className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-700 text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                    <path d="M12 2c-3 4-6 7-6 11a6 6 0 0 0 12 0c0-4-3-7-6-11z" />
                  </svg>
                </span>
                <span className="text-base font-medium">{COMPANY.name}</span>
              </a>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-emerald-900/80 sm:text-base">
                Lekki ogród, bezstresowy sezon. Pakiety opieki dla domów,
                wspólnot i biur w okolicy Bydgoszczy.
              </p>
              <Socials className="mt-6 text-emerald-900" variant="outline" />
            </div>

            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Pakiety</p>
              <ul className="mt-5 space-y-2.5 text-sm text-emerald-950">
                <li><a href="#pakiety" className="underline-offset-4 hover:underline">Lekki</a></li>
                <li><a href="#pakiety" className="underline-offset-4 hover:underline">Sezonowy</a></li>
                <li><a href="#pakiety" className="underline-offset-4 hover:underline">Premium</a></li>
                <li><a href="#kalkulator" className="underline-offset-4 hover:underline">Kalkulator</a></li>
                <li><a href="#faq" className="underline-offset-4 hover:underline">FAQ</a></li>
              </ul>
            </div>

            <div className="lg:col-span-4">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Kontakt</p>
              <address className="mt-5 space-y-3 text-sm not-italic">
                <p className="rounded-2xl border border-white/70 bg-white/60 px-4 py-3 backdrop-blur">
                  <span className="text-xs text-emerald-700">Telefon</span>
                  <a href={`tel:${COMPANY.phoneRaw}`} className="mt-1 block text-lg font-semibold text-emerald-950">
                    {COMPANY.phone}
                  </a>
                </p>
                <p className="rounded-2xl border border-white/70 bg-white/60 px-4 py-3 backdrop-blur">
                  <span className="text-xs text-emerald-700">E-mail</span>
                  <a href={`mailto:${COMPANY.email}`} className="mt-1 block text-sm font-medium text-emerald-950">
                    {COMPANY.email}
                  </a>
                </p>
                <p className="px-4 text-xs text-emerald-900/80">
                  {ADDRESS.fullLine} · {ADDRESS.hours}
                </p>
              </address>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-emerald-900/15 pt-6 text-xs text-emerald-900/70">
            <p>© {new Date().getFullYear()} {COMPANY.name} · NIP {ADDRESS.nip}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-emerald-900 hover:underline">{l.label}</a>
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
