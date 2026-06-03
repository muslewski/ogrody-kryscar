import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/data";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Internal design variants — not part of the public site.
      disallow: "/example-",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
