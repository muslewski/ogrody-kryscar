import type { MetadataRoute } from "next";

const BASE_URL = "https://kryscar.pl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Internal design variants — not part of the public site.
      disallow: "/example-",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
