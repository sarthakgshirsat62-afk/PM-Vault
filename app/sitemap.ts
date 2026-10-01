import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { getPublishedSlugs, searchResources } from "@/services/resources";
import { getCategoryCounts, getPublishedCategories, getResourceTypes } from "@/services/taxonomy";
import { publicDb } from "@/services/db";

// Regenerated hourly and whenever content changes in admin (lib/revalidate.ts).
export const revalidate = 3600;

async function publishedPages(): Promise<{ slug: string; updated_at: string }[]> {
  const db = publicDb();
  if (!db) return [];
  const { data } = await db.from("pages").select("slug, updated_at").eq("published", true);
  return (data ?? []) as { slug: string; updated_at: string }[];
}

/**
 * Only pages with real curated content are listed (PRD §56): categories and
 * types with at least one published resource, published resources and pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [resources, categories, counts, types, pages] = await Promise.all([
    getPublishedSlugs(),
    getPublishedCategories(),
    getCategoryCounts(),
    getResourceTypes(),
    publishedPages(),
  ]);
  const typeTotals = await Promise.all(types.map(async (t) => ({ t, total: (await searchResources({ typeIds: [t.id], pageSize: 1 })).total })));

  const latest = resources[0]?.updated_at ? new Date(resources[0].updated_at) : undefined;

  return [
    { url: `${base}/`, lastModified: latest, changeFrequency: "daily", priority: 1 },
    { url: `${base}/resources`, lastModified: latest, changeFrequency: "daily", priority: 0.9 },
    ...categories
      .filter((c) => (counts.get(c.id) ?? 0) > 0)
      .map((c) => ({ url: `${base}/category/${c.slug}`, lastModified: new Date(c.updated_at), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...typeTotals
      .filter(({ total }) => total > 0)
      .map(({ t }) => ({ url: `${base}/type/${t.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...resources.map((r) => ({ url: `${base}/resource/${r.slug}`, lastModified: new Date(r.updated_at), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...pages.map((p) => ({ url: `${base}/p/${p.slug}`, lastModified: new Date(p.updated_at), changeFrequency: "yearly" as const, priority: 0.3 })),
    { url: `${base}/submit`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
