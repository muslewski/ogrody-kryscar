import { COMPANY, SITE_URL } from "@/lib/data";
import type { Location } from "@/lib/locations";

export function LocationJsonLd({ location }: { location: Location }) {
  const url = `${SITE_URL}/ogrodnik/${location.slug}`;
  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        name: COMPANY.name,
        url,
        telephone: COMPANY.phone,
        email: COMPANY.email,
        areaServed: {
          "@type": "City",
          name: location.name,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: location.lat,
          longitude: location.lng,
        },
        description: location.metaDescription,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Strona główna", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Ogrodnik", item: `${SITE_URL}/ogrodnik` },
          { "@type": "ListItem", position: 3, name: location.name, item: url },
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
