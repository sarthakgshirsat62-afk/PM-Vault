import "server-only";
import { cache } from "react";
import { publicDb, userDb, check } from "./db";
import type { Category, ResourceType, Subcategory, Tag, TaxonomyKind, TaxonomyTerm } from "@/types/domain";

// ---- Public (cacheable) ------------------------------------------------------

export const getPublishedCategories = cache(async (): Promise<Category[]> => {
  const db = publicDb();
  if (!db) return [];
  const data = check(
    await db.from("categories").select("*").eq("is_published", true).order("display_order").order("name"),
    "loading categories",
  );
  return (data ?? []) as Category[];
});

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const db = publicDb();
  if (!db) return null;
  const data = check(
    await db.from("categories").select("*").eq("slug", slug).eq("is_published", true).maybeSingle(),
    "loading category",
  );
  return (data as Category | null) ?? null;
});

export const getCategoryCounts = cache(async (): Promise<Map<string, number>> => {
  const db = publicDb();
  if (!db) return new Map();
  const data = check(await db.rpc("category_resource_counts"), "counting resources") as
    | { category_id: string; resource_count: number }[]
    | null;
  return new Map((data ?? []).map((r) => [r.category_id, Number(r.resource_count)]));
});

export const getSubcategories = cache(async (categoryId?: string): Promise<Subcategory[]> => {
  const db = publicDb();
  if (!db) return [];
  let query = db.from("subcategories").select("*").order("display_order").order("name");
  if (categoryId) query = query.eq("category_id", categoryId);
  return (check(await query, "loading subcategories") ?? []) as Subcategory[];
});

export const getResourceTypes = cache(async (): Promise<ResourceType[]> => {
  const db = publicDb();
  if (!db) return [];
  const data = check(await db.from("resource_types").select("*").order("display_order").order("name"), "loading types");
  return (data ?? []) as ResourceType[];
});

export const getResourceTypeBySlug = cache(async (slug: string): Promise<ResourceType | null> => {
  const types = await getResourceTypes();
  return types.find((t) => t.slug === slug) ?? null;
});

export const getTaxonomyTerms = cache(async (): Promise<TaxonomyTerm[]> => {
  const db = publicDb();
  if (!db) return [];
  const data = check(
    await db.from("taxonomy_terms").select("*").order("kind").order("display_order").order("name"),
    "loading taxonomy",
  );
  return (data ?? []) as TaxonomyTerm[];
});

export function groupTermsByKind(terms: TaxonomyTerm[]): Map<TaxonomyKind, TaxonomyTerm[]> {
  const map = new Map<TaxonomyKind, TaxonomyTerm[]>();
  for (const term of terms) {
    const list = map.get(term.kind) ?? [];
    list.push(term);
    map.set(term.kind, list);
  }
  return map;
}

// ---- Admin (session-bound, RLS enforced) ---------------------------------------

export async function adminListCategories(): Promise<Category[]> {
  const db = await userDb();
  return (check(await db.from("categories").select("*").order("display_order").order("name"), "loading categories") ??
    []) as Category[];
}

export async function adminGetCategory(id: string): Promise<Category | null> {
  const db = await userDb();
  return (check(await db.from("categories").select("*").eq("id", id).maybeSingle(), "loading category") ??
    null) as Category | null;
}

export async function adminListSubcategories(): Promise<Subcategory[]> {
  const db = await userDb();
  return (check(await db.from("subcategories").select("*").order("display_order").order("name"), "loading subcategories") ??
    []) as Subcategory[];
}

export async function adminListTypes(): Promise<ResourceType[]> {
  const db = await userDb();
  return (check(await db.from("resource_types").select("*").order("display_order").order("name"), "loading types") ??
    []) as ResourceType[];
}

export async function adminListTags(): Promise<(Tag & { usage: number })[]> {
  const db = await userDb();
  const data = check(await db.from("tags").select("id, name, slug, resource_tags(count)").order("name"), "loading tags") as
    | (Tag & { resource_tags: { count: number }[] })[]
    | null;
  return (data ?? []).map(({ resource_tags, ...tag }) => ({ ...tag, usage: resource_tags?.[0]?.count ?? 0 }));
}

export async function adminListTerms(): Promise<TaxonomyTerm[]> {
  const db = await userDb();
  return (check(
    await db.from("taxonomy_terms").select("*").order("kind").order("display_order").order("name"),
    "loading taxonomy",
  ) ?? []) as TaxonomyTerm[];
}
