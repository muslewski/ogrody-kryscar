// src/app/realizacje/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPANY, SITE_URL } from "@/lib/data";
import { BLUR_DATA } from "@/lib/blur-data";
import {
  getAllProjects,
  getProjectBySlug,
  getProjectSlugs,
  CATEGORY_LABELS,
} from "@/lib/projects";
import { getCatalogServices } from "@/lib/catalog";
import type { CatalogItem } from "@/components/service-catalog";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectJsonLd } from "@/components/ProjectJsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/motion";

// Daily ISR so the seasonal winter banner (SiteHeader) flips without a redeploy.
export const revalidate = 86400;

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Nie znaleziono" };
  return {
    title: project.metaTitle,
    description: project.metaDescription,
    alternates: { canonical: `/realizacje/${project.slug}` },
    openGraph: {
      title: project.metaTitle,
      description: project.metaDescription,
      url: `/realizacje/${project.slug}`,
      type: "article",
      images: [`${SITE_URL}${project.pairs[0]?.after ?? ""}`],
    },
  };
}

export default async function RealizacjaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const service = (await getCatalogServices()).find(
    (c): c is CatalogItem => c.slug === project.relatedService,
  );
  const others = (await getAllProjects()).filter((p) => p.slug !== project.slug).slice(0, 3);
  const cover = project.pairs[0]?.after ?? "";

  return (
    <main className="bg-white text-neutral-900">
      <ProjectJsonLd
        title={project.title}
        image={`${SITE_URL}${cover}`}
        breadcrumbs={[
          { name: "Strona główna", item: SITE_URL },
          { name: "Realizacje", item: `${SITE_URL}/realizacje` },
          { name: project.title, item: `${SITE_URL}/realizacje/${project.slug}` },
        ]}
      />
      <SiteHeader />

      {/* Breadcrumb */}
      <nav aria-label="Okruszki" className="mx-auto max-w-5xl px-4 pt-6 text-xs text-neutral-500 sm:px-6">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-emerald-700">Strona główna</Link></li>
          <li aria-hidden>›</li>
          <li><Link href="/realizacje" className="hover:text-emerald-700">Realizacje</Link></li>
          <li aria-hidden>›</li>
          <li className="text-neutral-900">{project.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider text-neutral-500">
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-800">
              {CATEGORY_LABELS[project.category] ?? "Realizacja"}
            </span>
            <span>{project.location}</span>
            <span aria-hidden>·</span>
            <span>{project.year}</span>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-700">{project.excerpt}</p>
        </Reveal>
      </section>

      {/* Before/after slider(s) */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="space-y-4">
          {project.pairs.map((pair, i) => (
            <figure key={i}>
              <BeforeAfterSlider
                before={{ src: pair.before, blurDataURL: BLUR_DATA[pair.before], alt: `${project.title} — przed` }}
                after={{ src: pair.after, blurDataURL: BLUR_DATA[pair.after], alt: `${project.title} — po` }}
              />
              {pair.caption && (
                <figcaption className="mt-2 text-center text-xs text-neutral-500">{pair.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </section>

      {/* Zakres prac + opis */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Zakres prac</h2>
            <ul className="mt-6 space-y-3">
              {project.scope.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-neutral-700">
                  <span aria-hidden className="mt-0.5 text-emerald-700">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">O realizacji</h2>
            {project.body.map((p, i) => (
              <p key={i} className="mt-4 text-sm leading-relaxed text-neutral-700 sm:text-base">{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Related offer */}
      {service && (
        <section className="bg-neutral-50">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">Chcesz podobny efekt u siebie?</h2>
            <p className="mt-3 max-w-2xl text-sm text-neutral-600">
              Tę realizację wykonaliśmy w ramach usługi „{service.title}&rdquo;. Zacznijmy od bezpłatnej wyceny.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/uslugi/${service.slug}`} className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium transition-colors hover:border-emerald-700 hover:text-emerald-700">
                {service.title} →
              </Link>
              <a href={`tel:${COMPANY.phoneRaw}`} className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
                Zadzwoń: {COMPANY.phone}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Inne realizacje */}
      {others.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Inne realizacje</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
