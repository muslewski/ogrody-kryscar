// src/lib/services.ts
/**
 * Landing-page accessors for /uslugi/[usluga], now sourced from the Payload
 * `services` collection (was SERVICE_CONTENT). Components consume ONLY these
 * async accessors (the migration boundary). Image is the media URL + its
 * generated blurDataURL (rendered via MediaImage).
 */
import { getPayload } from "payload";
import config from "@payload-config";

import type { Service } from "@/payload-types";

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface ServicePage {
  slug: string;
  category: string;
  title: string;
  short: string;
  icon: string;
  img: string;
  blurDataURL: string | null;
  imageAlt: string;
  from: string;
  duration: string;
  hero: string[];
  includes: string[];
  pricingNote: string;
  faq: ServiceFaq[];
  metaTitle: string;
  metaDescription: string;
}

function project(s: Service): ServicePage {
  const image = typeof s.image === "object" && s.image ? s.image : null;
  return {
    slug: s.slug,
    category: s.category,
    title: s.title,
    short: s.short,
    icon: s.icon,
    img: image?.url ?? "",
    blurDataURL: image?.blurDataURL ?? null,
    imageAlt: image?.alt ?? s.title,
    from: s.priceFrom,
    duration: s.duration,
    hero: (s.hero ?? []).map((h) => h.paragraph),
    includes: (s.includes ?? []).map((i) => i.item),
    pricingNote: s.pricingNote,
    faq: (s.faq ?? []).map((f) => ({ q: f.question, a: f.answer })),
    metaTitle: s.seo?.metaTitle ?? s.title,
    metaDescription: s.seo?.metaDescription ?? s.short,
  };
}

export async function getAllServices(): Promise<ServicePage[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "services",
    sort: "order",
    depth: 1,
    limit: 100,
  });
  return docs.map(project);
}

export async function getServiceSlugs(): Promise<string[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "services",
    sort: "order",
    depth: 0,
    limit: 100,
  });
  return docs.map((s) => s.slug);
}

export async function getServiceBySlug(slug: string): Promise<ServicePage | null> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "services",
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  });
  return docs[0] ? project(docs[0]) : null;
}
