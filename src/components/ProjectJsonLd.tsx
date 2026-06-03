// src/components/ProjectJsonLd.tsx
import { COMPANY } from "@/lib/data";

export interface JsonLdCrumb {
  name: string;
  item: string; // absolute URL
}

/** Emits ImageObject (the "after" photo) + BreadcrumbList for a project page. */
export function ProjectJsonLd({
  title,
  image,
  breadcrumbs,
}: {
  title: string;
  image: string; // absolute URL
  breadcrumbs: JsonLdCrumb[];
}) {
  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ImageObject",
        contentUrl: image,
        name: title,
        creditText: COMPANY.name,
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
