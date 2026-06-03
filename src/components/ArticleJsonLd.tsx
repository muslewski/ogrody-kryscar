// src/components/ArticleJsonLd.tsx
import { COMPANY, ADDRESS, SITE_URL } from "@/lib/data";

export interface JsonLdCrumb {
  name: string;
  item: string; // absolute URL
}

interface ArticleFaq {
  q: string;
  a: string;
}

/**
 * Emits JSON-LD `Article` (+ `FAQPage` when faq present + `BreadcrumbList`)
 * for an Ogrodowe ABC guide. Author/publisher = the Ogrody Kryscar business.
 */
export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  faq,
  breadcrumbs,
}: {
  title: string;
  description: string;
  url: string;
  image: string; // absolute URL
  datePublished: string;
  dateModified: string;
  faq: ArticleFaq[];
  breadcrumbs: JsonLdCrumb[];
}) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      headline: title,
      description,
      image,
      datePublished,
      dateModified,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: {
        "@type": "Organization",
        name: COMPANY.name,
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: COMPANY.name,
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
  ];

  if (faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  const json = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
