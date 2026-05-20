import type { Metadata } from "next";
import { COMPANY, SERVICES, FAQ, STATS, PROCESS, TEAM, ADDRESS, LEGAL_LINKS, IMG } from "@/lib/data";
import { COVERAGE_HEADLINE, COVERAGE_INTRO } from "@/lib/coverage";
import { Reveal, HeroReveal, StaggerGrid, StaggerItem } from "@/components/motion";
import { Stat } from "@/components/Stat";
import { SitePreloader } from "@/components/SitePreloader";
import { CoverageMap } from "@/components/CoverageMap";
import { AntigravitySection } from "@/components/AntigravitySection";
import { Socials } from "@/components/Socials";
import { CalculatorForm } from "@/components/CalculatorForm";
import { WarpedHoverImage } from "@/components/WarpedHoverImage";

type PlanFeature = { label: string; value: string | true | false };
type PlanTier = {
  name: string;
  tag: string;
  blurb: string;
  recommended?: boolean;
  features: PlanFeature[];
};

const PLAN_TIERS: PlanTier[] = [
  {
    name: "Lekki",
    tag: "Mały ogród · jednorazowo",
    blurb: "Idealny gdy potrzebujesz tylko podstawowej regularnej obsługi.",
    features: [
      { label: "Koszenie trawnika · 2× w miesiącu", value: true },
      { label: "Podkaszanie krawędzi", value: true },
      { label: "Wywóz skoszonej trawy", value: true },
      { label: "Faktura lub paragon", value: true },
      { label: "Ubezpieczenie OC", value: true },
      { label: "SLA odpowiedzi", value: "72 h" },
      { label: "Cięcie żywopłotów", value: false },
      { label: "Porządki sezonowe (wiosna + jesień)", value: false },
      { label: "Doradztwo nasadzeń", value: false },
    ],
  },
  {
    name: "Sezonowy",
    tag: "Najczęściej wybierany",
    blurb: "Pełna regularna opieka od marca do listopada. 90% naszych klientów wybiera ten pakiet.",
    recommended: true,
    features: [
      { label: "Koszenie trawnika · co tydzień", value: true },
      { label: "Podkaszanie krawędzi", value: true },
      { label: "Cięcie żywopłotów · 1× w miesiącu", value: true },
      { label: "Porządki sezonowe (wiosna + jesień)", value: true },
      { label: "Doradztwo nasadzeń · telefonicznie", value: true },
      { label: "Wywóz odpadów zielonych", value: true },
      { label: "Faktura lub paragon", value: true },
      { label: "Ubezpieczenie OC", value: true },
      { label: "SLA odpowiedzi", value: "24 h" },
    ],
  },
  {
    name: "Premium",
    tag: "Reprezentacyjny ogród",
    blurb: "Pełen serwis dla wymagających ogrodów — wizyty 2× w tygodniu, własny ogrodnik.",
    features: [
      { label: "Koszenie trawnika · 2× w tygodniu", value: true },
      { label: "Podkaszanie krawędzi", value: true },
      { label: "Cięcie żywopłotów · 2× w miesiącu", value: true },
      { label: "Porządki sezonowe (wiosna + jesień)", value: true },
      { label: "Doradztwo nasadzeń · wizyta + plan", value: true },
      { label: "Pełna pielęgnacja roślin", value: true },
      { label: "Stały opiekun ogrodu", value: true },
      { label: "Ubezpieczenie OC", value: true },
      { label: "SLA odpowiedzi", value: "Tego samego dnia" },
    ],
  },
];

export const metadata: Metadata = { title: `${COMPANY.name} — SaaS` };

export default function Example8() {
  return (
    <>
    <SitePreloader
      storageKey="ogrody:ex8"
      variant="stairs"
      duration={1400}
      bgColor="#0b1118"
      iconColor="#34d399"
      iconSize={52}
      brandClassName="text-4xl md:text-6xl font-medium tracking-tight text-slate-50"
      taglineClassName="text-[10px] uppercase tracking-[0.4em] font-medium text-emerald-300/80"
      stairCount={6}
      stairsRevealFrom="center"
    />
    <main className="min-h-screen bg-[#0b1118] font-[family-name:var(--font-grotesk)] text-slate-100">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0b1118]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <a href="#" className="flex items-center gap-2 font-medium">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#0b1118]">
                <path d="M12 2c-3 4-6 7-6 11a6 6 0 0 0 12 0c0-4-3-7-6-11z" />
              </svg>
            </span>
            <span>{COMPANY.name}</span>
          </a>
          <nav className="hidden gap-8 text-sm text-slate-300 md:flex">
            {["Usługi", "Pakiety", "Realizacje", "FAQ"].map((l) => (
              <a key={l} href="#" className="hover:text-white">
                {l}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-3">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="hidden text-sm text-slate-300 hover:text-white md:block"
            >
              {COMPANY.phone}
            </a>
            <a
              href="#kontakt"
              className="rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 px-3 py-2 text-xs font-medium text-[#0b1118] transition hover:opacity-90 sm:px-4 sm:text-sm"
            >
              <span className="sm:hidden">Wycena →</span>
              <span className="hidden sm:inline">Bezpłatna wycena →</span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 right-0 -z-0 h-[700px] w-[700px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.22),transparent_60%)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 -z-0 h-[600px] w-[600px] bg-[radial-gradient(circle_at_center,rgba(132,204,22,0.18),transparent_60%)] blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pt-8 pb-16 sm:px-6 sm:pb-20 lg:grid-cols-12 lg:items-center lg:gap-16 lg:pt-10">
          <div className="lg:col-span-6">
            <HeroReveal delay={0.05}>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Nowy sezon — wolne terminy
              </span>
            </HeroReveal>
            <HeroReveal delay={0.15}>
              <h1 className="mt-5 text-4xl font-medium leading-[1.05] tracking-tight sm:mt-6 sm:text-5xl md:text-6xl lg:text-7xl">
                Ogród,
                <br />
                w którym{" "}
                <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-lime-300 bg-clip-text text-transparent">
                  znów chce się
                </span>{" "}
                być.
              </h1>
            </HeroReveal>
            <HeroReveal delay={0.3}>
              <p className="mt-5 max-w-xl text-base text-slate-300 sm:mt-6 sm:text-lg">
                Koszenie, pielęgnacja, sadzenie i porządki sezonowe — w
                spokojnym, przewidywalnym rytmie. Pakiety od 199 zł za wizytę.
              </p>
            </HeroReveal>
            <HeroReveal delay={0.45}>
            <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9">
              <a
                href="#kontakt"
                className="rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 px-6 py-3 text-sm font-medium text-[#0b1118] shadow-lg shadow-emerald-500/20"
              >
                Bezpłatna wycena →
              </a>
              <a
                href="#uslugi"
                className="rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Co dokładnie robimy
              </a>
            </div>
            </HeroReveal>

            <HeroReveal delay={0.6}>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-400 sm:mt-12 sm:gap-x-8 sm:gap-y-4">
              <div className="flex items-center gap-2">
                <span className="text-amber-300">★★★★★</span>
                <span>
                  <span className="text-white">4.9 / 5</span>{" "}
                  <span className="text-slate-500">· 187 opinii</span>
                </span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <span>
                <span className="text-white">500+</span>{" "}
                <span className="text-slate-500">zadbanych ogrodów</span>
              </span>
              <div className="h-4 w-px bg-white/10" />
              <span>
                <span className="text-white">10+</span>{" "}
                <span className="text-slate-500">lat doświadczenia</span>
              </span>
            </div>
            </HeroReveal>
          </div>

          {/* Photo hero card */}
          <HeroReveal delay={0.25} className="relative lg:col-span-6">
            <div className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl">
                <WarpedHoverImage
                  src={IMG.backyard9}
                  alt="Zadbany ogród"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0b1118]/40 to-transparent" />
              </div>

              {/* Secondary photo (collage) */}
              <div className="absolute -bottom-6 -left-6 hidden h-44 w-44 overflow-hidden rounded-2xl border-4 border-[#0b1118] shadow-2xl md:block">
                <WarpedHoverImage
                  src={IMG.daffodils}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Trust badge — feels like a sticker, not a UI screenshot */}
              <div className="absolute right-5 top-5 rounded-full bg-emerald-400 px-4 py-3 text-center text-[#0b1118] shadow-lg shadow-emerald-500/30">
                <p className="text-[10px] uppercase tracking-widest opacity-80">
                  Sezon
                </p>
                <p className="text-xl font-bold leading-none">
                  {new Date().getFullYear()}
                </p>
              </div>

              {/* Next slot card — looks like a glassmorphic info chip */}
              <div className="absolute -right-4 bottom-12 hidden w-64 rounded-2xl border border-white/15 bg-[#0b1118]/85 p-4 backdrop-blur-md md:block">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-400/20 text-emerald-300">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 fill-none stroke-current"
                      strokeWidth={2}
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="16"
                        rx="2"
                        strokeLinecap="round"
                      />
                      <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Najbliższy termin</p>
                    <p className="text-sm font-medium">w tym tygodniu</p>
                  </div>
                </div>
              </div>
            </div>
          </HeroReveal>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-6 text-[11px] uppercase tracking-widest text-slate-500 sm:justify-around sm:gap-8 sm:px-6 sm:py-8 sm:text-xs">
          <span>Zaufali nam:</span>
          {[
            "Wspólnoty mieszkaniowe",
            "Domy jednorodzinne",
            "Hotele i pensjonaty",
            "Biura i kampusy",
            "Domki letniskowe",
          ].map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </section>

      {/* SERVICES / FEATURES */}
      <section id="uslugi" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <Reveal className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
            Pełen zakres usług
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
            Wszystko, czego potrzebuje Twój ogród, w jednej ekipie.
          </h2>
        </Reveal>
        <StaggerGrid className="mt-10 grid gap-3 sm:mt-14 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.slice(0, 6).map((s, i) => (
            <StaggerItem
              key={s.slug}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-emerald-400/30 hover:bg-white/[0.06]"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/0 transition group-hover:bg-emerald-500/10" />
              <div className="relative">
                <span className="inline-grid h-11 w-11 place-items-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path
                      d={[
                        "M12 2v4M5 5l3 3M2 12h4M5 19l3-3M12 22v-4M19 19l-3-3M22 12h-4M19 5l-3 3",
                        "M12 2C9 6 6 9 6 13a6 6 0 0 0 12 0c0-4-3-7-6-11z",
                        "M3 12c4 2 8 2 18-2-3 5-9 9-18 2zM3 12v6h2v-6",
                        "M12 22c-2-3-2-7 0-10 2 3 2 7 0 10zM12 12V2",
                        "M3 4l4 4 14-14M3 12l4 4 14-14M3 20l4-4",
                        "M3 5h18M3 12h18M3 19h12",
                      ][i % 6]}
                      strokeWidth={1.5}
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h3 className="mt-5 text-xl font-medium tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {s.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm text-emerald-300">
                  Dowiedz się więcej
                  <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* PROCESS / HOW IT WORKS */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <Reveal className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
              Jak to działa
            </p>
            <h2 className="mt-3 text-3xl font-medium sm:text-4xl md:text-5xl">
              Cztery kroki do gotowego ogrodu.
            </h2>
          </Reveal>
          <StaggerGrid className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p) => (
              <StaggerItem
                key={p.no}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1722] p-6"
              >
                <span className="font-[family-name:var(--font-grotesk)] text-6xl text-emerald-400/30">
                  {p.no}
                </span>
                <h3 className="mt-2 text-lg font-medium">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{p.desc}</p>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <StaggerGrid className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
          {STATS.map((s) => (
            <StaggerItem key={s.label} className="bg-[#0b1118] p-6 sm:p-8">
              <p className="text-3xl font-medium text-emerald-300 sm:text-4xl md:text-5xl">
                <Stat value={s.value} />
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-wider text-slate-400 sm:text-xs">
                {s.label}
              </p>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* PRICING */}
      <section id="pakiety" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
            Pakiety
          </p>
          <h2 className="mt-3 text-3xl font-medium sm:text-4xl md:text-5xl">
            Przejrzyste ceny, bez ukrytych kosztów.
          </h2>
        </Reveal>
        <StaggerGrid className="mt-10 grid gap-3 sm:mt-14 sm:gap-4 lg:grid-cols-3">
          {[
            {
              name: "Lekki",
              price: "199 zł",
              per: "/ wizyta",
              feats: [
                "Koszenie 2x w miesiącu",
                "Podkaszanie krawędzi",
                "Wywóz skoszonej trawy",
              ],
              accent: false,
            },
            {
              name: "Sezonowy",
              price: "349 zł",
              per: "/ wizyta",
              feats: [
                "Koszenie co tydzień",
                "Cięcie krzewów raz w miesiącu",
                "Porządki wiosna + jesień",
                "Doradztwo nasadzeń",
              ],
              accent: true,
            },
            {
              name: "Premium",
              price: "indywidualnie",
              per: "",
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
              className={`relative rounded-2xl border p-6 sm:p-8 ${
                p.accent
                  ? "border-emerald-400/40 bg-gradient-to-br from-emerald-500/10 to-transparent"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {p.accent && (
                <span className="absolute -top-3 left-8 rounded-full bg-emerald-400 px-3 py-1 text-xs font-medium text-[#0b1118]">
                  Najczęściej wybierany
                </span>
              )}
              <p className="text-sm uppercase tracking-wider text-slate-400">
                {p.name}
              </p>
              <p className="mt-4 text-4xl font-medium">
                {p.price}
                <span className="text-base text-slate-500">{p.per}</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-300">
                {p.feats.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#kontakt"
                className={`mt-8 block rounded-lg px-4 py-3 text-center text-sm font-medium ${
                  p.accent
                    ? "bg-emerald-400 text-[#0b1118]"
                    : "border border-white/10 hover:bg-white/5"
                }`}
              >
                Wybierz pakiet →
              </a>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* TEAM */}
      <section id="zespol" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <Reveal className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
            Zespół
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
            Cztery osoby, jeden grafik, każdy ogród znany z imienia.
          </h2>
        </Reveal>
        <StaggerGrid className="mt-10 grid gap-3 sm:mt-14 sm:gap-4 md:grid-cols-2 lg:grid-cols-4" amount={0.05}>
          {TEAM.map((m) => (
            <StaggerItem
              key={m.name}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <WarpedHoverImage
                  src={m.photo}
                  alt={`Portret ${m.name}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <p className="text-lg font-medium tracking-tight">{m.name}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-emerald-300">
                  {m.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {m.bio}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* PLAN DETAILS — bespoke for ex8 */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <Reveal className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
              Pakiety w szczegółach
            </p>
            <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
              Co dokładnie dostajecie w&nbsp;każdym pakiecie.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400 sm:text-base">
              Bez ukrytych pozycji. Cena z wyceny zawsze równa się rachunkowi.
            </p>
          </Reveal>
          <StaggerGrid
            className="mt-10 grid gap-4 sm:mt-14 sm:gap-5 lg:grid-cols-3"
            amount={0.05}
          >
            {PLAN_TIERS.map((p) => (
              <StaggerItem
                key={p.name}
                className={[
                  "relative flex flex-col rounded-2xl border p-7 sm:p-8",
                  p.recommended
                    ? "border-emerald-400/40 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/5 shadow-xl shadow-emerald-500/10 lg:scale-[1.02]"
                    : "border-white/10 bg-white/[0.03]",
                ].join(" ")}
              >
                {p.recommended && (
                  <span className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-3 py-1 text-[11px] font-medium tracking-wider text-[#0b1118]">
                    ★ Polecane
                  </span>
                )}
                <p
                  className={[
                    "text-xs uppercase tracking-[0.2em]",
                    p.recommended ? "text-emerald-300" : "text-slate-400",
                  ].join(" ")}
                >
                  {p.tag}
                </p>
                <h3 className="mt-3 text-3xl font-medium tracking-tight">
                  {p.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {p.blurb}
                </p>

                <ul className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm">
                  {p.features.map((f) => (
                    <li
                      key={f.label}
                      className="flex items-start gap-3"
                    >
                      <span
                        className={[
                          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                          f.value === false
                            ? "bg-white/5 text-slate-600"
                            : p.recommended
                              ? "bg-emerald-400 text-[#0b1118]"
                              : "bg-emerald-500/15 text-emerald-300",
                        ].join(" ")}
                        aria-hidden
                      >
                        {f.value === false ? "—" : "✓"}
                      </span>
                      <span
                        className={[
                          "flex-1 leading-snug",
                          f.value === false ? "text-slate-500 line-through decoration-slate-700" : "text-slate-200",
                        ].join(" ")}
                      >
                        {f.label}
                        {typeof f.value === "string" && (
                          <span
                            className={[
                              "ml-1.5 text-xs",
                              p.recommended ? "text-emerald-200" : "text-slate-400",
                            ].join(" ")}
                          >
                            · {f.value}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#kontakt"
                  className={[
                    "mt-8 block rounded-lg px-4 py-3 text-center text-sm font-medium transition",
                    p.recommended
                      ? "bg-emerald-400 text-[#0b1118] hover:bg-emerald-300"
                      : "border border-white/15 text-white hover:bg-white/5",
                  ].join(" ")}
                >
                  Zamów {p.name.toLowerCase()} →
                </a>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="kalkulator" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
              Kalkulator
            </p>
            <h2 className="mt-3 text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
              Wycena
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                teoretyczna
              </span>
              .
            </h2>
            <p className="mt-5 max-w-sm text-base text-slate-300 sm:mt-6 sm:text-lg">
              Wybierzcie zakres prac, wielkość ogrodu i częstotliwość —
              dostajecie widełki cenowe.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-[#0f1722] p-6 sm:p-10 [&_*]:!text-slate-100">
              <CalculatorForm
                theme={{
                  activeBg: "#34d399",
                  activeFg: "#0b1118",
                  inactiveBorder: "border-white/15",
                  inactiveFg: "text-slate-300 hover:bg-white/5",
                  priceColor: "#a7f3d0",
                  chipRadiusClass: "rounded-lg",
                }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* MAP */}
      <section id="mapa" className="border-t border-white/5 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:py-24">
          <Reveal className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
              Region
            </p>
            <h2 className="mt-3 text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
              {COVERAGE_HEADLINE}
            </h2>
            <p className="mt-5 max-w-md text-base text-slate-300 sm:mt-6 sm:text-lg">
              {COVERAGE_INTRO}
            </p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f1722] p-2">
              <CoverageMap
                variant="dark"
                aspect="4/3"
                pinColor="34d399"
                hqColor="6ee7b7"
                rounded="rounded-[20px]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ANTIGRAVITY — emerald particles on near-black */}
      <AntigravitySection
        color="#34d399"
        bg="#0b1118"
        textColor="#e2e8f0"
        paddingClass="py-28 sm:py-36"
        className="border-y border-white/5"
        count={1800}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
            Cykliczna opieka · zero kalendarza po Waszej stronie
          </p>
          <h2 className="mt-5 text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Trawnik,{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-lime-300 bg-clip-text text-transparent">
              który aktualizuje
            </span>{" "}
            się sam.
          </h2>
          <p className="mt-8 max-w-md mx-auto text-base text-slate-300/85 sm:text-lg">
            Wpisujemy się w grafik raz. Resztę roku grafik się trzyma.
          </p>
        </div>
      </AntigravitySection>

      {/* FAQ */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:gap-10 sm:px-6 sm:py-20 md:grid-cols-12 lg:py-24">
          <Reveal className="md:col-span-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-medium sm:text-4xl md:text-5xl">
              Najczęstsze pytania.
            </h2>
            <p className="mt-4 text-sm text-slate-400 sm:text-base">
              Nie znalazłeś odpowiedzi? Zadzwoń: {COMPANY.phone}
            </p>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-8">
            <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1722]">
              {FAQ.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium sm:gap-6 sm:px-6 sm:py-5 sm:text-base">
                    {f.q}
                    <span className="text-xl transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400 sm:px-6">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section id="kontakt" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <Reveal className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-transparent to-teal-500/10 p-6 sm:p-10 md:p-16">
          <div className="grid gap-8 sm:gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
                Zacznijmy
                <br />
                <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                  od bezpłatnej wyceny.
                </span>
              </h2>
              <p className="mt-5 max-w-md text-sm text-slate-300 sm:mt-6 sm:text-base">
                Zadzwoń lub zostaw kontakt — oddzwonimy w ciągu jednego dnia
                roboczego.
              </p>
            </div>
            <div className="grid gap-3">
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-6 py-4 hover:bg-white/10"
              >
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Telefon
                  </p>
                  <p className="mt-1 text-xl font-medium">{COMPANY.phone}</p>
                </div>
                <span className="text-emerald-300">→</span>
              </a>
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-6 py-4 hover:bg-white/10"
              >
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    E-mail
                  </p>
                  <p className="mt-1 text-base font-medium">{COMPANY.email}</p>
                </div>
                <span className="text-emerald-300">→</span>
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER — tech SaaS */}
      <footer className="border-t border-white/5">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#0b1118]" aria-hidden>
                  <path d="M12 2c-3 4-6 7-6 11a6 6 0 0 0 12 0c0-4-3-7-6-11z" />
                </svg>
              </span>
              <span className="font-medium text-white">{COMPANY.name}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              {COMPANY.description}
            </p>
            <Socials className="mt-6 text-emerald-300" variant="outline" iconSize={16} />
          </div>

          {/* Pakiety */}
          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Pakiety</p>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-300">
              <li><a href="#pakiety" className="hover:text-emerald-300">Lekki</a></li>
              <li><a href="#pakiety" className="hover:text-emerald-300">Sezonowy</a></li>
              <li><a href="#pakiety" className="hover:text-emerald-300">Premium</a></li>
              <li><a href="#kalkulator" className="hover:text-emerald-300">Kalkulator</a></li>
            </ul>
          </div>

          {/* Strona */}
          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Strona</p>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-300">
              <li><a href="#uslugi" className="hover:text-emerald-300">Usługi</a></li>
              <li><a href="#zespol" className="hover:text-emerald-300">Zespół</a></li>
              <li><a href="#mapa" className="hover:text-emerald-300">Region</a></li>
              <li><a href="#faq" className="hover:text-emerald-300">FAQ</a></li>
            </ul>
          </div>

          {/* Kontakt */}
          <div className="lg:col-span-3">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Kontakt</p>
            <address className="mt-5 space-y-3 text-sm not-italic text-slate-300">
              <p>
                <a href={`tel:${COMPANY.phoneRaw}`} className="text-base text-white hover:text-emerald-300">
                  {COMPANY.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${COMPANY.email}`} className="hover:text-emerald-300">
                  {COMPANY.email}
                </a>
              </p>
              <p className="text-slate-400">{ADDRESS.fullLine}</p>
              <p className="text-xs text-slate-500">{ADDRESS.hours}</p>
            </address>
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-slate-500 sm:px-6">
            <span>© {new Date().getFullYear()} {COMPANY.name} · NIP {ADDRESS.nip}</span>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-slate-200">{l.label}</a>
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
