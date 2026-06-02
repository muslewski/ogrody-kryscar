import type { MetadataRoute } from "next";

// Single-page site: the root re-exports the chosen design (example-9).
// The /example-N routes are internal design variants and are intentionally
// excluded to avoid duplicate-content indexing (see robots.ts).
const BASE_URL = "https://kryscar.pl";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
