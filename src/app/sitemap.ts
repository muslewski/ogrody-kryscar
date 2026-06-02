import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/data";
import { getLocationSlugs } from "@/lib/locations";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getLocationSlugs();
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...slugs.map((slug) => ({
      url: `${SITE_URL}/ogrodnik/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
