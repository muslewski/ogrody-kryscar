import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/data";
import { getLocationSlugs } from "@/lib/locations";
import { getWinterServiceSlugs } from "@/lib/winter";
import { getServiceSlugs } from "@/lib/services";
import { getAllGuides } from "@/lib/guides";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [citySlugs, winterSlugs, serviceSlugs, guides] = await Promise.all([
    getLocationSlugs(),
    getWinterServiceSlugs(),
    getServiceSlugs(),
    getAllGuides(),
  ]);
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/zima`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ogrodowe-abc`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...guides.map((g) => ({
      url: `${SITE_URL}/ogrodowe-abc/${g.slug}`,
      lastModified: new Date(g.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...winterSlugs.map((slug) => ({
      url: `${SITE_URL}/zima/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...serviceSlugs.map((slug) => ({
      url: `${SITE_URL}/uslugi/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...citySlugs.map((slug) => ({
      url: `${SITE_URL}/ogrodnik/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
