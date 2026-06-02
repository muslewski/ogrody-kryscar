import { SERVICES, IMG } from "@/lib/data";
import type { CatalogItem } from "@/components/service-catalog";

const SERVICE_IMAGES: Record<string, string> = {
  koszenie: IMG.lawnTexture,
  pielegnacja: IMG.gardenerYard,
  grabienie: IMG.autumn1,
  sadzenie: IMG.sprout,
  ciecie: IMG.hedgeShears,
  porzadki: IMG.autumn3,
  aranzacja: IMG.daffodils,
  rabaty: IMG.echinacea,
};

const PRICES: Record<string, { from: string; duration: string }> = {
  koszenie: { from: "od 199 zł", duration: "~ 1 wizyta" },
  pielegnacja: { from: "od 349 zł", duration: "pakiet sezonowy" },
  grabienie: { from: "od 249 zł", duration: "~ 1 wizyta" },
  sadzenie: { from: "od 399 zł", duration: "wycena indywidualna" },
  ciecie: { from: "od 299 zł", duration: "~ 1 wizyta" },
  porzadki: { from: "od 449 zł", duration: "pakiet 2 wizyty" },
  aranzacja: { from: "wycena", duration: "projekt + realizacja" },
  rabaty: { from: "od 599 zł", duration: "projekt + sadzenie" },
};

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
