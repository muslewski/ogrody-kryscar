/**
 * Seed the `services` + `media` collections from the existing static data.
 * Idempotent: upserts each service by slug, and reuses an existing media doc
 * (matched by alt) instead of re-uploading. One-time data migration; after this
 * Payload is the source of truth.
 *
 * Run: npx tsx --env-file=.env scripts/seed-services.ts
 */
import path from "node:path";
import { getPayload } from "payload";
import type { RequiredDataFromCollectionSlug } from "payload";

import config from "../src/payload.config";
import { SERVICES, SERVICE_BADGES } from "../src/lib/data";
import {
  SERVICE_IMAGES,
  PRICES,
  SERVICE_CONTENT,
  SERVICE_PRICING,
} from "../src/lib/services-seed-data";

// The SERVICES array is not declared `as const`, so TypeScript widens the
// `category` and `icon` literal values to `string`. We re-narrow them here
// so the Payload-generated `Service` type (which uses explicit string unions)
// accepts them without a blanket cast.
type ServiceCategory = "trawnik" | "ciecie" | "sadzenie" | "porzadki" | "projekt";
type ServiceIcon =
  | "scissors"
  | "leaf"
  | "rake"
  | "sprout"
  | "hedge"
  | "broom"
  | "compass"
  | "flowers";

// Derived from RequiredDataFromCollectionSlug<"services"> but with `tenant`
// optional because the `assignDefaultTenant` beforeChange hook fills it at
// runtime on create (and update leaves the persisted value unchanged).
// This is more precise than `as any` — all other required fields are still
// statically enforced.
type ServiceUpsertData = Omit<RequiredDataFromCollectionSlug<"services">, "tenant"> & {
  tenant?: string;
};

async function main() {
  const payload = await getPayload({ config });

  // Ensure the Kryscar tenant exists — the assignDefaultTenant hook needs it.
  const tenantRes = await payload.find({
    collection: "tenants",
    where: { slug: { equals: "kryscar" } },
    limit: 1,
    depth: 0,
  });
  if (!tenantRes.docs[0]) {
    await payload.create({
      collection: "tenants",
      data: { name: "Ogrody Kryscar", slug: "kryscar" },
    });
  }

  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i];
    const content = SERVICE_CONTENT.find((c) => c.slug === s.slug);
    if (!content) {
      console.warn(`skip ${s.slug}: no SERVICE_CONTENT`);
      continue;
    }
    const price = PRICES[s.slug] ?? { from: "wycena", duration: "indywidualnie" };
    const imgPath = SERVICE_IMAGES[s.slug];
    const alt = s.title;

    // media: reuse by alt, else upload from disk (public/<imgPath>)
    let mediaId: string;
    const existingMedia = await payload.find({
      collection: "media",
      where: { alt: { equals: alt } },
      limit: 1,
      depth: 0,
    });
    if (existingMedia.docs[0]) {
      mediaId = String(existingMedia.docs[0].id);
    } else {
      const created = await payload.create({
        collection: "media",
        data: { alt },
        filePath: path.join(process.cwd(), "public", imgPath),
      });
      mediaId = String(created.id);
    }

    const badge = SERVICE_BADGES[s.slug];

    // Build the upsert payload. Two casts:
    //  1. `category` / `icon`: SERVICES[] has no `as const` so TS infers them
    //     as `string`; cast to the union the Service type requires.
    //  2. The whole object is cast to ServiceUpsertData (= RequiredDataFromCollectionSlug
    //     without the required `tenant`). At runtime `tenant` is set by the
    //     `assignDefaultTenant` beforeChange hook on create, and is left
    //     unchanged on update — so omitting it here is intentional and safe.
    const data: ServiceUpsertData = {
      slug: s.slug,
      order: i,
      title: s.title,
      short: s.short,
      description: s.description,
      category: s.category as ServiceCategory,
      icon: s.icon as ServiceIcon,
      badge: badge ? { label: badge.label, tone: badge.tone } : undefined,
      priceFrom: price.from,
      duration: price.duration,
      pricing: SERVICE_PRICING[s.slug] ?? { kind: "custom", recurring: false },
      image: mediaId,
      hero: content.hero.map((paragraph) => ({ paragraph })),
      includes: content.includes.map((item) => ({ item })),
      pricingNote: content.pricingNote,
      faq: content.faq.map((f) => ({ question: f.q, answer: f.a })),
      seo: { metaTitle: content.metaTitle, metaDescription: content.metaDescription },
    };

    const existing = await payload.find({
      collection: "services",
      where: { slug: { equals: s.slug } },
      limit: 1,
      depth: 0,
    });
    if (existing.docs[0]) {
      await payload.update({
        collection: "services",
        id: existing.docs[0].id,
        // Cast: ServiceUpsertData has `tenant?:string` but the update type
        // requires `tenant: string | Tenant`. Safe because the persisted doc
        // already has a tenant and the hook leaves it unchanged on update.
        data: data as RequiredDataFromCollectionSlug<"services">,
      });
      console.log(`updated ${s.slug}`);
    } else {
      await payload.create({
        collection: "services",
        // Cast: same reason — `tenant` is filled by the beforeChange hook.
        data: data as RequiredDataFromCollectionSlug<"services">,
      });
      console.log(`created ${s.slug}`);
    }
  }

  console.log("services seed done");
  process.exit(0);
}

main().catch((err) => {
  console.error("services seed failed:", err);
  process.exit(1);
});
