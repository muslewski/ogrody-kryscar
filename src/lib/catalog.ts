import { getPayload } from "payload";
import config from "@payload-config";

import type { CatalogItem } from "@/components/service-catalog";
import type { Service } from "@/payload-types";

function img(image: Service["image"]): string {
  return typeof image === "object" && image ? (image.url ?? "") : "";
}

/** Catalog projection, now sourced from the Payload `services` collection
 *  (sorted by `order`). Display image is the media URL. */
export async function getCatalogServices(): Promise<CatalogItem[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "services",
    sort: "order",
    depth: 1,
    limit: 100,
  });
  return docs.map((s) => ({
    slug: s.slug,
    category: s.category,
    title: s.title,
    short: s.short,
    description: s.description,
    icon: s.icon,
    img: img(s.image),
    from: s.priceFrom,
    duration: s.duration,
    badge: s.badge?.label
      ? { label: s.badge.label, tone: (s.badge.tone ?? "primary") as "primary" | "accent" }
      : undefined,
  }));
}
