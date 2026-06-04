// src/lib/services.ts
/**
 * Landing-page content for /uslugi/[usluga].
 *
 * MIGRATION (PayloadCMS): this module is the ONLY place that knows the
 * service-landing-page content source. `ServicePageContent` mirrors a future
 * Payload `services` collection / SEO field-group (slug:text-unique →
 * matches a SERVICES slug, hero:array<{paragraph}> or richText,
 * includes:array<{item:text}>, pricingNote:textarea, faq:array<{q,a}>,
 * metaTitle:text + metaDescription:textarea in an `seo` group). To migrate:
 * reimplement `compose()` below to read Payload + the catalog projection.
 * NOTHING ELSE in the app changes — pages consume only the async accessors.
 *
 * Composition: the thin catalog fields (title/short/icon/category) and the
 * display price (from/duration/img) come from `getCatalogServices()` so the
 * slug list and the price are NOT duplicated here. This module adds only the
 * landing-page depth. SERVICES (data.ts) stays thin and drives the catalog
 * filter; this mirrors the winter-data-module decision.
 */
import { getCatalogServices } from "@/lib/catalog";
import { SERVICE_CONTENT, type ServiceFaq } from "@/lib/services-seed-data";

/** Composed view a page consumes: thin catalog fields + price + content. */
export interface ServicePage {
  slug: string;
  category: string;
  title: string;
  short: string;
  icon: string;
  img: string;
  from: string;
  duration: string;
  hero: string[];
  includes: string[];
  pricingNote: string;
  faq: ServiceFaq[];
  metaTitle: string;
  metaDescription: string;
}

/** Compose the catalog projection (thin + price + img) with landing content.
 *  A slug without authored content is dropped (so the page 404s, not renders
 *  half-empty). Returns items in catalog (SERVICES) order. */
function compose(): ServicePage[] {
  const result: ServicePage[] = [];
  for (const c of getCatalogServices()) {
    const content = SERVICE_CONTENT.find((x) => x.slug === c.slug);
    if (!content) continue;
    result.push({
      slug: c.slug,
      category: c.category,
      title: c.title,
      short: c.short,
      icon: c.icon,
      img: c.img,
      from: c.from,
      duration: c.duration,
      hero: content.hero,
      includes: content.includes,
      pricingNote: content.pricingNote,
      faq: content.faq,
      metaTitle: content.metaTitle,
      metaDescription: content.metaDescription,
    });
  }
  return result;
}

export async function getAllServices(): Promise<ServicePage[]> {
  return compose();
}

export async function getServiceSlugs(): Promise<string[]> {
  return compose().map((s) => s.slug);
}

export async function getServiceBySlug(slug: string): Promise<ServicePage | null> {
  return compose().find((s) => s.slug === slug) ?? null;
}
