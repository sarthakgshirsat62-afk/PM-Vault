import { getSiteUrl } from "@/lib/env";

export type Crumb = { name: string; href?: string };

const abs = (path: string) => (path.startsWith("http") ? path : `${getSiteUrl()}${path}`);

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: abs(c.href) } : {}),
    })),
  };
}

export function websiteSchema(siteName: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: getSiteUrl(),
    description: description || undefined,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${getSiteUrl()}/resources?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function collectionSchema(opts: { name: string; description: string; path: string; items: { name: string; slug: string }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description || undefined,
    url: abs(opts.path),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: opts.items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: abs(`/resource/${item.slug}`),
        name: item.name,
      })),
    },
  };
}

export function resourceSchema(r: {
  title: string;
  slug: string;
  short_description: string;
  external_url: string;
  author: string | null;
  organization: string | null;
  published_at: string | null;
  updated_at: string;
  thumbnail_url: string | null;
  price_type: string;
  difficulty: string;
  tags: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: r.title,
    headline: r.title,
    description: r.short_description,
    url: abs(`/resource/${r.slug}`),
    sameAs: r.external_url,
    ...(r.author ? { author: { "@type": "Person", name: r.author } } : {}),
    ...(r.organization ? { publisher: { "@type": "Organization", name: r.organization } } : {}),
    ...(r.published_at ? { datePublished: r.published_at } : {}),
    dateModified: r.updated_at,
    ...(r.thumbnail_url ? { image: r.thumbnail_url } : {}),
    isAccessibleForFree: r.price_type === "free",
    educationalLevel: r.difficulty,
    keywords: r.tags.join(", ") || undefined,
  };
}
