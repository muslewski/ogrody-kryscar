// src/app/zima/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/lib/data";
import { getWinterServices } from "@/lib/winter";
import { isWinterNow } from "@/lib/season";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CoverageMap } from "@/components/CoverageMap";
import { WinterServiceCard } from "@/components/WinterServiceCard";
import { Reveal } from "@/components/motion";

// Daily ISR so the seasonal eyebrow flips without a redeploy.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Usługi zimowe — odśnieżanie, oświetlenie, zabezpieczanie roślin | Ogrody Kryscar",
  description:
    "Zimowe usługi Ogrody Kryscar w Bydgoszczy i okolicy: odśnieżanie podjazdów i chodników, montaż świątecznego oświetlenia ogrodów i zabezpieczanie roślin na zimę. Bezpłatna wycena.",
  alternates: { canonical: "/zima" },
};

export default async function ZimaHubPage() {
  const services = await getWinterServices();
  const winter = isWinterNow();

  return (
    <main className="bg-white text-neutral-900">
      <SiteHeader />

      {/* Breadcrumb */}
      <nav
        aria-label="Okruszki"
        className="mx-auto max-w-7xl px-4 pt-6 text-xs text-neutral-500 sm:px-6"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-emerald-700">Strona główna</Link></li>
          <li aria-hidden>›</li>
          <li className="text-neutral-900">Zima</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
            {winter ? "Sezon zimowy — teraz" : "Usługi całoroczne"}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Działamy też zimą.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            Gdy ogród śpi, my dalej pracujemy. Odśnieżanie, świąteczne oświetlenie ogrodów i zimowe zabezpieczanie roślin — ten sam zaufany zespół, który dba o Twój ogród przez resztę roku.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:gap-5 md:grid-cols-3">
          {services.map((s) => (
            <WinterServiceCard key={s.slug} service={s} tone="light" />
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white p-2">
          <CoverageMap
            variant="streets"
            aspect="16/9"
            pinColor="047857"
            hqColor="171717"
            rounded="rounded-[20px]"
            alt="Obszar obsługi usług zimowych — Bydgoszcz i okolice"
          />
        </div>
      </section>

      {/* CTA */}
      <section id="kontakt" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-12">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Zima nie musi być <span className="text-emerald-700">problemem.</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm text-neutral-600 sm:text-base">
            Zadzwoń lub napisz — ustalimy zakres i terminy zimowej obsługi Twojej posesji.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`tel:${COMPANY.phoneRaw}`} className="rounded-2xl bg-neutral-900 px-6 py-4 text-white transition hover:bg-emerald-700">
              {COMPANY.phone}
            </a>
            <a href={`mailto:${COMPANY.email}`} className="rounded-2xl border border-neutral-200 px-6 py-4 transition hover:border-emerald-700">
              {COMPANY.email}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
