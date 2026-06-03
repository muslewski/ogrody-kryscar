// src/components/ServiceJsonLd.tsx
import { COMPANY, ADDRESS } from "@/lib/data";

export interface JsonLdCrumb {
  name: string;
  item: string; // absolute URL
}

/**
 * Emits JSON-LD `Service` (+ `BreadcrumbList`) for any service landing page.
 * Generic over name/description/url/breadcrumbs so both /zima/[usluga] and
 * /uslugi/[usluga] share it. `provider` is the Ogrody Kryscar LocalBusiness.
 */
export function ServiceJsonLd({
  name,
  description,
  url,
  breadcrumbs,
}: {
  name: string;
  description: string;
  url: string;
  breadcrumbs: JsonLdCrumb[];
}) {
  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name,
        serviceType: name,
        description,
        url,
        provider: {
          "@type": "LocalBusiness",
          name: COMPANY.name,
          telephone: COMPANY.phone,
          email: COMPANY.email,
          areaServed: { "@type": "City", name: ADDRESS.city },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: b.item,
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
