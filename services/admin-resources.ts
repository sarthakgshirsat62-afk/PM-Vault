import "server-only";
import { userDb, check, ServiceError } from "./db";
import { DETAIL_SELECT, toDetail, type DetailRow, type ResourceDetail } from "./resources";
import { normalizeUrl } from "@/lib/url";
import { slugify } from "@/lib/slug";
import type { ResourceInput } from "@/lib/validation/resource";
import type { ResourceStatus } from "@/types/domain";

export type AdminResourceRow = {
  id: string;
  title: string;
  slug: string;
  status: ResourceStatus;
  featured: boolean;
  editors_pick: boolean;
  sponsored: boolean;
  updated_at: string;
  published_at: string | null;
  category: { name: string } | null;
  type: { name: string } | null;
};

export async function adminListResources(opts: {
  status?: ResourceStatus | null;
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: AdminResourceRow[]; total: number }> {
  const db = await userDb();
  const pageSize = opts.pageSize ?? 50;
  const page = Math.max(1, opts.page ?? 1);
  let query = db
    .from("resources")
    .select(
      "id, title, slug, status, featured, editors_pick, sponsored, updated_at, published_at, category:categories(name), type:resource_types(name)",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (opts.status) query = query.eq("status", opts.status);
  if (opts.q) {
    // Escape PostgREST ilike wildcards and the filter separators.
    const term = opts.q.replace(/[%_,()\\]/g, " ").trim();
    if (term) query = query.or(`title.ilike.%${term}%,external_url.ilike.%${term}%`);
  }
  const { data, error, count } = await query;
  if (error) throw new ServiceError("Could not load resources.", error);
  return { rows: (data ?? []) as unknown as AdminResourceRow[], total: count ?? 0 };
}

export async function adminStatusCounts(): Promise<Record<ResourceStatus | "total", number>> {
  const db = await userDb();
  const statuses: ResourceStatus[] = ["draft", "in_review", "published", "archived", "broken_link", "needs_review"];
  const counts = await Promise.all(
    statuses.map(async (s) => {
      const { count } = await db.from("resources").select("id", { count: "exact", head: true }).eq("status", s);
      return [s, count ?? 0] as const;
    }),
  );
  const out = Object.fromEntries(counts) as Record<ResourceStatus, number>;
  return { ...out, total: counts.reduce((sum, [, n]) => sum + n, 0) };
}

export type EditableResource = ResourceDetail & { editorial_score: number; internal_notes: string };

export async function adminGetResource(id: string): Promise<EditableResource | null> {
  const db = await userDb();
  const row = check(await db.from("resources").select(DETAIL_SELECT).eq("id", id).maybeSingle(), "loading resource") as unknown as
    | DetailRow
    | null;
  if (!row) return null;
  const curation = check(
    await db.from("resource_curation").select("editorial_score, internal_notes").eq("resource_id", id).maybeSingle(),
    "loading curation",
  ) as { editorial_score: number; internal_notes: string } | null;
  return { ...toDetail(row), editorial_score: curation?.editorial_score ?? 50, internal_notes: curation?.internal_notes ?? "" };
}

export type DuplicateMatch = { id: string; title: string; slug: string; status: ResourceStatus };

/** Resources whose normalized URL matches (PRD §75 "Possible Duplicate"). */
export async function findDuplicateResources(url: string, excludeId?: string | null): Promise<DuplicateMatch[]> {
  const normalized = normalizeUrl(url);
  if (!normalized) return [];
  const db = await userDb();
  let query = db.from("resources").select("id, title, slug, status").eq("normalized_url", normalized).limit(5);
  if (excludeId) query = query.neq("id", excludeId);
  return (check(await query, "checking duplicates") ?? []) as DuplicateMatch[];
}

/** Picks a free slug: base, base-2, base-3 … */
export async function uniqueResourceSlug(base: string, excludeId?: string | null): Promise<string> {
  const db = await userDb();
  const root = slugify(base) || "resource";
  const { data } = await db.from("resources").select("id, slug").like("slug", `${root}%`);
  const taken = new Set((data ?? []).filter((r) => r.id !== excludeId).map((r) => r.slug as string));
  if (!taken.has(root)) return root;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${root}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${root}-${Date.now()}`;
}

/** Ensures tags exist (creating missing ones) and returns their ids. */
export async function ensureTags(names: string[]): Promise<string[]> {
  if (names.length === 0) return [];
  const db = await userDb();
  const rows = names.map((name) => ({ name, slug: slugify(name) })).filter((t) => t.slug);
  const uniqueRows = [...new Map(rows.map((r) => [r.slug, r])).values()];
  check(await db.from("tags").upsert(uniqueRows, { onConflict: "slug", ignoreDuplicates: true }), "creating tags");
  const data = check(
    await db.from("tags").select("id").in("slug", uniqueRows.map((r) => r.slug)),
    "loading tags",
  ) as { id: string }[] | null;
  return (data ?? []).map((t) => t.id);
}

/**
 * Creates or updates a resource with its tags, filter terms and curation
 * data. Returns the saved id and slug. RLS rejects non-editors.
 */
export async function saveResource(
  input: ResourceInput,
  opts: { id?: string | null; userId: string },
): Promise<{ id: string; slug: string }> {
  const db = await userDb();
  const normalized = normalizeUrl(input.external_url);
  if (!normalized) throw new ServiceError("Invalid URL.");

  const slug = input.slug
    ? await uniqueResourceSlug(input.slug, opts.id)
    : await uniqueResourceSlug(input.title, opts.id);

  const row = {
    title: input.title,
    slug,
    short_description: input.short_description,
    long_description: input.long_description,
    problem_solved: input.problem_solved,
    external_url: input.external_url,
    normalized_url: normalized,
    thumbnail_url: input.thumbnail_url,
    thumbnail_alt: input.thumbnail_alt,
    resource_type_id: input.resource_type_id,
    category_id: input.category_id,
    subcategory_id: input.subcategory_id,
    price_type: input.price_type,
    difficulty: input.difficulty,
    estimated_time: input.estimated_time,
    author: input.author,
    organization: input.organization,
    best_for: input.best_for,
    use_when: input.use_when,
    avoid_when: input.avoid_when,
    how_to_use: input.how_to_use,
    strengths: input.strengths,
    limitations: input.limitations,
    example_output: input.example_output,
    featured: input.featured,
    editors_pick: input.sponsored ? false : input.editors_pick,
    sponsored: input.sponsored,
    sponsor_name: input.sponsored ? input.sponsor_name : null,
    affiliate: input.affiliate,
    seo_title: input.seo_title,
    meta_description: input.meta_description,
    og_image_url: input.og_image_url,
    status: input.status,
    updated_by: opts.userId,
  };

  let id = opts.id ?? null;
  if (id) {
    check(await db.from("resources").update(row).eq("id", id), "updating resource");
  } else {
    const created = check(
      await db.from("resources").insert({ ...row, created_by: opts.userId }).select("id").single(),
      "creating resource",
    ) as { id: string };
    id = created.id;
  }

  // Tags: replace the set.
  const tagIds = await ensureTags(input.tag_names);
  check(await db.from("resource_tags").delete().eq("resource_id", id), "clearing tags");
  if (tagIds.length) {
    check(await db.from("resource_tags").insert(tagIds.map((tag_id) => ({ resource_id: id, tag_id }))), "saving tags");
  }

  // Filter terms: replace the set.
  check(await db.from("resource_terms").delete().eq("resource_id", id), "clearing filters");
  if (input.term_ids.length) {
    check(
      await db.from("resource_terms").insert(input.term_ids.map((term_id) => ({ resource_id: id, term_id }))),
      "saving filters",
    );
  }

  check(
    await db
      .from("resource_curation")
      .upsert({ resource_id: id, editorial_score: input.editorial_score, internal_notes: input.internal_notes }),
    "saving curation",
  );

  return { id, slug };
}

export async function setResourceStatus(ids: string[], status: ResourceStatus, userId: string): Promise<number> {
  if (ids.length === 0) return 0;
  const db = await userDb();
  const patch: Record<string, unknown> = { status, updated_by: userId };
  if (status === "published") patch.last_verified_at = new Date().toISOString();
  const data = check(await db.from("resources").update(patch).in("id", ids).select("id"), "updating status") as
    | { id: string }[]
    | null;
  return data?.length ?? 0;
}

export async function deleteResource(id: string): Promise<void> {
  const db = await userDb();
  const data = check(await db.from("resources").delete().eq("id", id).select("id"), "deleting resource") as
    | { id: string }[]
    | null;
  if (!data?.length) throw new ServiceError("Resource not deleted — only admins can delete resources.");
}

export type Revision = { id: string; created_at: string; changed_by_email: string | null; snapshot: Record<string, unknown> };

export async function listRevisions(resourceId: string, limit = 20): Promise<Revision[]> {
  const db = await userDb();
  const data = check(
    await db
      .from("resource_revisions")
      .select("id, created_at, snapshot, changed_by:profiles(email)")
      .eq("resource_id", resourceId)
      .order("created_at", { ascending: false })
      .limit(limit),
    "loading revisions",
  ) as unknown as { id: string; created_at: string; snapshot: Record<string, unknown>; changed_by: { email: string } | null }[] | null;
  return (data ?? []).map((r) => ({
    id: r.id,
    created_at: r.created_at,
    snapshot: r.snapshot,
    changed_by_email: r.changed_by?.email ?? null,
  }));
}

export async function adminResourceOptions(): Promise<{ id: string; title: string; slug: string }[]> {
  const db = await userDb();
  const data = check(
    await db.from("resources").select("id, title, slug").eq("status", "published").order("title").limit(1000),
    "loading resource options",
  );
  return (data ?? []) as { id: string; title: string; slug: string }[];
}
