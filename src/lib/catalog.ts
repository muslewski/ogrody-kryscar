import { SERVICES, IMG } from "@/lib/data";
import type { CatalogItem } from "@/components/service-catalog";
import { SERVICE_IMAGES, PRICES } from "@/lib/services-seed-data";

/** Build the enriched catalog items used by <ServiceCatalog>. Presentation
 *  data (images + display pricing) — intentionally static, not CMS content. */
export function getCatalogServices(): CatalogItem[] {
  return SERVICES.map((s) => ({
    ...s,
    img: SERVICE_IMAGES[s.slug] ?? IMG.parkGarden,
    from: PRICES[s.slug]?.from ?? "wycena",
    duration: PRICES[s.slug]?.duration ?? "indywidualnie",
  }));
}
