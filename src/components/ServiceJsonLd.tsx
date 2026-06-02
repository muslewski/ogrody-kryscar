// src/components/ServiceJsonLd.tsx
import { COMPANY, ADDRESS, SITE_URL } from "@/lib/data";
import type { WinterService } from "@/lib/winter";

export function ServiceJsonLd({ service }: { service: WinterService }) {
  const url = `${SITE_URL}/zima/${service.slug}`;
  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.name,
        serviceType: service.name,
        description: service.metaDescription,
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
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Strona główna", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Zima", item: `${SITE_URL}/zima` },
          { "@type": "ListItem", position: 3, name: service.name, item: url },
        ],
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
