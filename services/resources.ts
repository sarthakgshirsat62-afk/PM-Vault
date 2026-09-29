import "server-only";
import { cache } from "react";
import { publicDb, check } from "./db";
import type {
  Category, Difficulty, PriceType, Resource, ResourceCard, ResourceType,
  SortOption, Subcategory, Tag, TaxonomyTerm,
} from "@/types/domain";

export const CARD_SELECT =
  "id, slug, title, short_description, thumbnail_url, thumbnail_alt, price_type, difficulty, organization, author, editors_pick, sponsored, featured, published_at, category:categories(name, slug), type:resource_types(name, slug)";

export type CardRow = Omit<ResourceCard, "category_name" | "category_slug" | "type_name" | "type_slug"> & {
  category: { name: string; slug: string } | null;
  type: { name: string; slug: string } | null;
};

export function toCard(row: CardRow): ResourceCard {
  const { category, type, ...rest } = row;
  return {
    ...rest,
    category_name: category?.name ?? null,
    category_slug: category?.slug ?? null,
    type_name: type?.name ?? null,
    type_slug: type?.slug ?? null,
  };
}

export type SearchInput = {
  q?: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  typeIds?: string[];
  prices?: PriceType[];
  difficulties?: Difficulty[];
  termIds?: string[];
  sort?: SortOption;
  page?: number;
  pageSize?: number;
};

export type SearchResult = { items: ResourceCard[]; total: number; page: number; pageSize: number };

export async function searchResources(input: SearchInput): Promise<SearchResult> {
  const pageSize = input.pageSize ?? 24;
  const page = input.page ?? 1;
  const db = publicDb();
  if (!db) return { items: [], total: 0, page, pageSize };
  const data = check(
    await db.rpc("search_resources", {
      p_query: input.q || null,
      p_category_id: input.categoryId ?? null,
      p_subcategory_id: input.subcategoryId ?? null,
      p_type_ids: input.typeIds?.length ? input.typeIds : null,
      p_prices: input.prices?.length ? input.prices : null,
      p_difficulties: input.difficulties?.length ? input.difficulties : null,
      p_term_ids: input.termIds?.length ? input.termIds : null,
      p_sort: input.sort ?? "relevance",
      p_limit: pageSize,
      p_offset: (page - 1) * pageSize,
    }),
    "searching resources",
  ) as ResourceCard[] | null;
  const items = data ?? [];
  return { items, total: Number(items[0]?.total_count ?? 0), page, pageSize };
}

export type ResourceDetail = Resource & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
  subcategory: Pick<Subcategory, "id" | "name" | "slug"> | null;
  type: Pick<ResourceType, "id" | "name" | "slug"> | null;
  tags: Tag[];
  terms: TaxonomyTerm[];
};

export const DETAIL_SELECT =
  "*, category:categories(id, name, slug), subcategory:subcategories(id, name, slug), type:resource_types(id, name, slug), resource_tags(tag:tags(id, name, slug)), resource_terms(term:taxonomy_terms(id, kind, name, slug, display_order))";

export type DetailRow = Omit<ResourceDetail, "tags" | "terms"> & {
  resource_tags: { tag: Tag | null }[];
  resource_terms: { term: TaxonomyTerm | null }[];
  search_vector?: unknown;
};

export function toDetail(row: DetailRow): ResourceDetail {
  const { resource_tags, resource_terms, search_vector: _unused, ...rest } = row;
  void _unused;
  return {
    ...rest,
    tags: resource_tags
      .map((rt) => rt.tag)
      .filter((t): t is Tag => t !== null)
      .sort((a, b) => a.name.localeCompare(b.name)),
    terms: resource_terms
      .map((rt) => rt.term)
      .filter((t): t is TaxonomyTerm => t !== null)
      .sort((a, b) => a.kind.localeCompare(b.kind) || a.display_order - b.display_order),
  };
}

export const getPublishedResourceBySlug = cache(async (slug: string): Promise<ResourceDetail | null> => {
  const db = publicDb();
  if (!db) return null;
  const data = check(
    await db.from("resources").select(DETAIL_SELECT).eq("slug", slug).eq("status", "published").maybeSingle(),
    "loading resource",
  ) as unknown as DetailRow | null;
  return data ? toDetail(data) : null;
});

export async function getSimilarResources(resourceId: string, limit = 4): Promise<ResourceCard[]> {
  const db = publicDb();
  if (!db) return [];
  const data = check(await db.rpc("similar_resources", { p_resource_id: resourceId, p_limit: limit }), "loading similar resources");
  return (data ?? []) as ResourceCard[];
}

async function flaggedCards(flag: "featured" | "editors_pick", limit: number): Promise<ResourceCard[]> {
  const db = publicDb();
  if (!db) return [];
  const data = check(
    await db
      .from("resources")
      .select(CARD_SELECT)
      .eq("status", "published")
      .eq(flag, true)
      .order("published_at", { ascending: false })
      .limit(limit),
    `loading ${flag} resources`,
  ) as unknown as CardRow[] | null;
  return (data ?? []).map(toCard);
}

export const getFeaturedResources = (limit = 6) => flaggedCards("featured", limit);
export const getEditorsPicks = (limit = 4) => flaggedCards("editors_pick", limit);

/** Published resources in the given order (e.g. an admin-picked homepage block). */
export async function getResourcesByIds(ids: string[]): Promise<ResourceCard[]> {
  const db = publicDb();
  if (!db || ids.length === 0) return [];
  const data = check(
    await db.from("resources").select(CARD_SELECT).eq("status", "published").in("id", ids),
    "loading selected resources",
  ) as unknown as CardRow[] | null;
  const byId = new Map((data ?? []).map((r) => [r.id, toCard(r)]));
  return ids.map((id) => byId.get(id)).filter((r): r is ResourceCard => r !== undefined);
}

export async function getRecentlyAdded(limit = 4): Promise<ResourceCard[]> {
  return (await searchResources({ sort: "newest", pageSize: limit })).items;
}

export async function getMostPopular(limit = 4): Promise<ResourceCard[]> {
  return (await searchResources({ sort: "popular", pageSize: limit })).items;
}

export async function getPublishedSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const db = publicDb();
  if (!db) return [];
  const data = check(
    await db
      .from("resources")
      .select("slug, updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(5000),
    "listing resources for sitemap",
  );
  return (data ?? []) as { slug: string; updated_at: string }[];
}
