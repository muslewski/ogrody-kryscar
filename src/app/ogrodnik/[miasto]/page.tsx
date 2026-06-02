import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPANY, PROCESS } from "@/lib/data";
import {
  getAllLocations,
  getLocationBySlug,
  getLocationSlugs,
} from "@/lib/locations";
import { getCatalogServices } from "@/lib/catalog";
import { ServiceCatalog } from "@/components/service-catalog";
import { CoverageMap } from "@/components/CoverageMap";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LocationJsonLd } from "@/components/LocationJsonLd";
import { Reveal } from "@/components/motion";

export async function generateStaticParams() {
  const slugs = await getLocationSlugs();
  return slugs.map((miasto) => ({ miasto }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ miasto: string }>;
}): Promise<Metadata> {
  const { miasto } = await params;
  const loc = await getLocationBySlug(miasto);
  if (!loc) return { title: "Nie znaleziono" };
  return {
    title: loc.metaTitle,
    description: loc.metaDescription,
    alternates: { canonical: `/ogrodnik/${loc.slug}` },
    openGraph: {
      title: loc.metaTitle,
      description: loc.metaDescription,
      url: `/ogrodnik/${loc.slug}`,
      type: "website",
    },
  };
}

export default async function OgrodnikMiastoPage({
  params,
}: {
  params: Promise<{ miasto: string }>;
}) {
  const { miasto } = await params;
  const loc = await getLocationBySlug(miasto);
  if (!loc) notFound();

  const services = getCatalogServices();
  const neighbours = (await getAllLocations())
    .filter((l) => l.slug !== loc.slug)
    .slice(0, 6);

  return (
    <main className="bg-white text-neutral-900">
      <LocationJsonLd location={loc} />
      <SiteHeader />

      {/* Breadcrumb */}
      <nav
        aria-label="Okruszki"
        className="mx-auto max-w-7xl px-4 pt-6 text-xs text-neutral-500 sm:px-6"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-emerald-700">Strona główna</Link></li>
          <li aria-hidden>›</li>
          <li>Ogrodnik</li>
          <li aria-hidden>›</li>
          <li className="text-neutral-900">{loc.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
            {loc.gmina !== loc.name ? `gm. ${loc.gmina} · ` : ""}pow. {loc.powiat}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Ogrodnik {loc.name} — usługi ogrodnicze
          </h1>
          {loc.intro.map((p, i) => (
            <p key={i} className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
              {p}
            </p>
          ))}
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Zadzwoń: {COMPANY.phone}
            </a>
            <a
              href="#kontakt"
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium transition-colors hover:border-emerald-700 hover:text-emerald-700"
            >
              Bezpłatna wycena
            </a>
          </div>
        </Reveal>
      </section>

      {/* Services (reused) */}
      <ServiceCatalog services={services} />

      {/* Obszar obsługi */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Obszar obsługi — {loc.name} i okolice
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            {loc.localNote} Dojazd: {loc.travel}
            {loc.km > 0 ? ` (ok. ${loc.km} km od bazy w Bydgoszczy).` : "."}
          </p>
          {loc.nearbyAreas.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {loc.nearbyAreas.map((a) => (
                <li key={a} className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm text-neutral-700">
                  {a}
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </section>

      {/* Process (reused data) */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Jak to działa</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {PROCESS.map((p) => (
              <li key={p.no} className="rounded-3xl border border-neutral-200 bg-white p-6">
                <p className="text-xs font-semibold text-emerald-700">{p.no}</p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{p.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Map centered on the city */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white p-2">
          <CoverageMap
            variant="streets"
            aspect="16/9"
            center={{ lat: loc.lat, lng: loc.lng }}
            zoom={11}
            rounded="rounded-[20px]"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Najczęstsze pytania</h2>
        <div className="mt-8 divide-y divide-neutral-200 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          {loc.faq.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer items-start gap-4 px-6 py-5 transition hover:bg-neutral-50">
                <span className="flex-1 text-base font-semibold tracking-tight">{f.q}</span>
                <span aria-hidden className="text-neutral-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-prose px-6 pb-5 text-sm leading-relaxed text-neutral-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Cross-links to neighbouring city pages (internal-link SEO) */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Obsługujemy też</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {neighbours.map((n) => (
            <li key={n.slug}>
              <Link
                href={`/ogrodnik/${n.slug}`}
                className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700 transition-colors hover:border-emerald-700 hover:text-emerald-700"
              >
                Ogrodnik {n.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section id="kontakt" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-12">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Zacznijmy <span className="text-emerald-700">od rozmowy.</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm text-neutral-600 sm:text-base">
            Zostaw kontakt lub zadzwoń — w ciągu jednego dnia roboczego potwierdzimy termin oględzin w {loc.name}.
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
