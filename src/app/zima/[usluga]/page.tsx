// src/app/zima/[usluga]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPANY, PROCESS, SITE_URL } from "@/lib/data";
import {
  getWinterServices,
  getWinterServiceBySlug,
  getWinterServiceSlugs,
} from "@/lib/winter";
import { getAllLocations } from "@/lib/locations";
import { getGuidesForWinter } from "@/lib/guides";
import { GuideCard } from "@/components/GuideCard";
import { CoverageMap } from "@/components/CoverageMap";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ServiceJsonLd } from "@/components/ServiceJsonLd";
import { WinterServiceIcon } from "@/components/WinterServiceCard";
import { Reveal } from "@/components/motion";
import { BlurImage, hasBlurImage } from "@/components/BlurImage";

export async function generateStaticParams() {
  const slugs = await getWinterServiceSlugs();
  return slugs.map((usluga) => ({ usluga }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ usluga: string }>;
}): Promise<Metadata> {
  const { usluga } = await params;
  const svc = await getWinterServiceBySlug(usluga);
  if (!svc) return { title: "Nie znaleziono" };
  return {
    title: svc.metaTitle,
    description: svc.metaDescription,
    alternates: { canonical: `/zima/${svc.slug}` },
    openGraph: {
      title: svc.metaTitle,
      description: svc.metaDescription,
      url: `/zima/${svc.slug}`,
      type: "website",
    },
  };
}

export default async function ZimaUslugaPage({
  params,
}: {
  params: Promise<{ usluga: string }>;
}) {
  const { usluga } = await params;
  const svc = await getWinterServiceBySlug(usluga);
  if (!svc) notFound();

  const others = (await getWinterServices()).filter((s) => s.slug !== svc.slug);
  const cities = (await getAllLocations())
    .slice()
    .sort((a, b) => a.km - b.km)
    .slice(0, 8);
  const guides = await getGuidesForWinter(svc.slug);

  return (
    <main className="bg-white text-neutral-900">
      <ServiceJsonLd
        name={svc.name}
        description={svc.metaDescription}
        url={`${SITE_URL}/zima/${svc.slug}`}
        breadcrumbs={[
          { name: "Strona główna", item: SITE_URL },
          { name: "Zima", item: `${SITE_URL}/zima` },
          { name: svc.name, item: `${SITE_URL}/zima/${svc.slug}` },
        ]}
      />
      <SiteHeader />

      {/* Breadcrumb */}
      <nav
        aria-label="Okruszki"
        className="mx-auto max-w-7xl px-4 pt-6 text-xs text-neutral-500 sm:px-6"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-emerald-700">Strona główna</Link></li>
          <li aria-hidden>›</li>
          <li><Link href="/zima" className="hover:text-emerald-700">Zima</Link></li>
          <li aria-hidden>›</li>
          <li className="text-neutral-900">{svc.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <WinterServiceIcon icon={svc.icon} className="h-3.5 w-3.5" />
            Usługi zimowe
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {svc.name}
          </h1>
          {svc.hero.map((p, i) => (
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
        {hasBlurImage(svc.image) && (
          <div className="mt-10 overflow-hidden rounded-3xl border border-neutral-200">
            <div className="relative aspect-[16/9] w-full bg-neutral-100">
              <BlurImage
                src={svc.image}
                alt={svc.name}
                fill
                preload
                className="object-cover"
                sizes="(min-width: 1280px) 1280px, 100vw"
              />
            </div>
          </div>
        )}
      </section>

      {/* Co obejmuje */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Co obejmuje</h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {svc.includes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-sm leading-relaxed text-neutral-700"
                >
                  <span aria-hidden className="mt-0.5 text-emerald-700">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-2xl text-sm italic text-neutral-500">{svc.pricingNote}</p>
          </Reveal>
        </div>
      </section>

      {/* Jak to działa (reused PROCESS) */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
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
      </section>

      {/* Coverage */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Gdzie działamy</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
          {svc.name} realizujemy w Bydgoszczy i okolicznych gminach — tam, gdzie na co dzień dbamy o ogrody.
        </p>
        <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200 bg-white p-2">
          <CoverageMap
            variant="streets"
            aspect="16/9"
            pinColor="047857"
            hqColor="171717"
            rounded="rounded-[20px]"
            alt={`Obszar obsługi — ${svc.name} w Bydgoszczy i okolicy`}
          />
        </div>
        <ul className="mt-6 flex flex-wrap gap-2">
          {cities.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/ogrodnik/${c.slug}`}
                className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700 transition-colors hover:border-emerald-700 hover:text-emerald-700"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Najczęstsze pytania</h2>
        <div className="mt-8 divide-y divide-neutral-200 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          {svc.faq.map((f) => (
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

      {/* Warto wiedzieć (related guides) */}
      {guides.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Warto wiedzieć</h2>
          <p className="mt-3 max-w-2xl text-sm text-neutral-600">
            Z naszego poradnika Ogrodowe ABC — praktyczna wiedza powiązana z tą usługą.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </section>
      )}

      {/* Other winter services */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Zobacz też</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                href={`/zima/${o.slug}`}
                className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700 transition-colors hover:border-emerald-700 hover:text-emerald-700"
              >
                {o.name}
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
            Zostaw kontakt lub zadzwoń — w ciągu jednego dnia roboczego potwierdzimy termin i zakres prac.
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
