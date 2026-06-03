// src/app/ogrodowe-abc/page.tsx
import type { Metadata } from "next";
import { COMPANY, SITE_URL } from "@/lib/data";
import {
  getAllGuides,
  SEASON_LABELS,
  SEASON_ORDER,
  type Guide,
  type Season,
} from "@/lib/guides";
import { GuideCard } from "@/components/GuideCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Ogrodowe ABC — poradnik ogrodniczy | Ogrody Kryscar",
  description:
    "Ogrodowe ABC: praktyczne porady ogrodnicze krok po kroku — kiedy kosić trawnik, jak przygotować ogród na zimę, co i kiedy sadzić. Wiedza od ekipy Ogrody Kryscar z Bydgoszczy.",
  alternates: { canonical: "/ogrodowe-abc" },
};

// Daily ISR so the seasonal winter banner (SiteHeader) flips without a redeploy.
export const revalidate = 86400;

export default async function OgrodoweAbcPage() {
  const guides = await getAllGuides();

  // Group by season, preserving SEASON_ORDER.
  const seasons = (Object.keys(SEASON_ORDER) as Season[])
    .map((season) => ({
      season,
      items: guides.filter((g) => g.season === season),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <main className="bg-white text-neutral-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Strona główna", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Ogrodowe ABC", item: `${SITE_URL}/ogrodowe-abc` },
            ],
          }),
        }}
      />
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Ogrodowe ABC</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Poradnik ogrodniczy krok po kroku
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-700">
            Praktyczna wiedza od ekipy, która na co dzień dba o ogrody w Bydgoszczy i okolicy.
            Kiedy kosić trawnik, jak przygotować ogród na zimę, co i kiedy sadzić — bez teorii,
            za to z konkretami, które sprawdzają się w naszym klimacie.
          </p>
        </Reveal>
      </section>

      {/* Guides grouped by season */}
      {seasons.map(({ season, items }) => (
        <section key={season} className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {SEASON_LABELS[season]}
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((g: Guide) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 sm:p-12">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            Wolisz zlecić to nam?
          </h2>
          <p className="mt-4 max-w-xl text-sm text-neutral-600 sm:text-base">
            Zadzwoń — doradzimy i przyjedziemy. Koszenie, pielęgnacja, sadzenie i porządki w Bydgoszczy i okolicy.
          </p>
          <div className="mt-6">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Zadzwoń: {COMPANY.phone}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
