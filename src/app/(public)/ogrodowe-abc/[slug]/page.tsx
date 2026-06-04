// src/app/ogrodowe-abc/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPANY, SITE_URL } from "@/lib/data";
import {
  getAllGuides,
  getGuideBySlug,
  getGuideSlugs,
  SEASON_LABELS,
} from "@/lib/guides";
import { getCatalogServices } from "@/lib/catalog";
import { getWinterServices } from "@/lib/winter";
import type { CatalogItem } from "@/components/service-catalog";
import type { WinterService } from "@/lib/winter";
import { BlurImage } from "@/components/BlurImage";
import { GuideCard } from "@/components/GuideCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ArticleJsonLd } from "@/components/ArticleJsonLd";
import { Reveal } from "@/components/motion";

// Daily ISR so the seasonal winter banner (SiteHeader) flips without a redeploy.
export const revalidate = 86400;

export async function generateStaticParams() {
  const slugs = await getGuideSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "Nie znaleziono" };
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: `/ogrodowe-abc/${guide.slug}` },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: `/ogrodowe-abc/${guide.slug}`,
      type: "article",
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const catalog = await getCatalogServices();
  const winter = await getWinterServices();
  const relatedServices = guide.relatedServices
    .map((s) => catalog.find((c) => c.slug === s))
    .filter((c): c is CatalogItem => Boolean(c));
  const relatedWinter = (guide.relatedWinter ?? [])
    .map((s) => winter.find((w) => w.slug === s))
    .filter((w): w is WinterService => Boolean(w));
  const others = (await getAllGuides())
    .filter((g) => g.slug !== guide.slug)
    .slice(0, 3);

  const published = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(guide.publishedAt));

  return (
    <main className="bg-white text-neutral-900">
      <ArticleJsonLd
        title={guide.title}
        description={guide.metaDescription}
        url={`${SITE_URL}/ogrodowe-abc/${guide.slug}`}
        image={`${SITE_URL}${guide.img}`}
        datePublished={guide.publishedAt}
        dateModified={guide.updatedAt}
        faq={guide.faq}
        breadcrumbs={[
          { name: "Strona główna", item: SITE_URL },
          { name: "Ogrodowe ABC", item: `${SITE_URL}/ogrodowe-abc` },
          { name: guide.title, item: `${SITE_URL}/ogrodowe-abc/${guide.slug}` },
        ]}
      />
      <SiteHeader />

      {/* Breadcrumb */}
      <nav
        aria-label="Okruszki"
        className="mx-auto max-w-3xl px-4 pt-6 text-xs text-neutral-500 sm:px-6"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-emerald-700">Strona główna</Link></li>
          <li aria-hidden>›</li>
          <li><Link href="/ogrodowe-abc" className="hover:text-emerald-700">Ogrodowe ABC</Link></li>
          <li aria-hidden>›</li>
          <li className="text-neutral-900">{guide.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider text-neutral-500">
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-800">
              {SEASON_LABELS[guide.season]}
            </span>
            <span>{published}</span>
            <span aria-hidden>·</span>
            <span>{guide.readMinutes} min czytania</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {guide.title}
          </h1>
          {guide.intro.map((p, i) => (
            <p key={i} className="mt-5 text-base leading-relaxed text-neutral-700">
              {p}
            </p>
          ))}
        </Reveal>

        {/* Hero image */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200">
          <div className="relative aspect-[16/9] w-full bg-neutral-100">
            <BlurImage
              src={guide.img}
              alt={guide.title}
              fill
              preload
              className="object-cover"
              sizes="(min-width: 768px) 768px, 100vw"
            />
          </div>
        </div>

        {/* Sections */}
        <div className="mt-10 space-y-10">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
              {section.paragraphs.map((p, i) => (
                <p key={i} className="mt-4 text-base leading-relaxed text-neutral-700">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* FAQ */}
        {guide.faq.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold tracking-tight">Najczęstsze pytania</h2>
            <div className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
              {guide.faq.map((f) => (
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
        )}
      </article>

      {/* Related offers */}
      {(relatedServices.length > 0 || relatedWinter.length > 0) && (
        <section className="bg-neutral-50">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">Pomożemy z tym w Twoim ogrodzie</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {relatedServices.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/uslugi/${s.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm font-medium transition-colors hover:border-emerald-700 hover:text-emerald-700"
                  >
                    <span>{s.title}</span>
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
              {relatedWinter.map((w) => (
                <li key={w.slug}>
                  <Link
                    href={`/zima/${w.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm font-medium transition-colors hover:border-emerald-700 hover:text-emerald-700"
                  >
                    <span>{w.name}</span>
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                Zadzwoń: {COMPANY.phone}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Other guides */}
      {others.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Zobacz też</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
