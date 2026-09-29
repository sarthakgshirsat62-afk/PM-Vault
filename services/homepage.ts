import "server-only";
import { publicDb, userDb, check } from "./db";
import type { HomepageBlock } from "@/types/domain";

export async function getEnabledHomepageBlocks(): Promise<HomepageBlock[]> {
  const db = publicDb();
  if (!db) return [];
  const data = check(
    await db.from("homepage_blocks").select("*").eq("enabled", true).order("position"),
    "loading homepage",
  );
  return (data ?? []) as HomepageBlock[];
}

export async function adminListHomepageBlocks(): Promise<HomepageBlock[]> {
  const db = await userDb();
  const data = check(await db.from("homepage_blocks").select("*").order("position"), "loading homepage blocks");
  return (data ?? []) as HomepageBlock[];
}

/** Maps resource slugs to ids, reporting unknown slugs. */
export async function resolveResourceSlugs(slugs: string[]): Promise<{ ids: string[]; missing: string[] }> {
  if (slugs.length === 0) return { ids: [], missing: [] };
  const db = await userDb();
  const data = check(await db.from("resources").select("id, slug").in("slug", slugs), "resolving resources") as
    | { id: string; slug: string }[]
    | null;
  const bySlug = new Map((data ?? []).map((r) => [r.slug, r.id]));
  return {
    ids: slugs.map((s) => bySlug.get(s)).filter((v): v is string => Boolean(v)),
    missing: slugs.filter((s) => !bySlug.has(s)),
  };
}

export async function slugsForIds(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const db = await userDb();
  const data = check(await db.from("resources").select("id, slug").in("id", ids), "loading resource slugs") as
    | { id: string; slug: string }[]
    | null;
  const byId = new Map((data ?? []).map((r) => [r.id, r.slug]));
  return ids.map((id) => byId.get(id)).filter((v): v is string => Boolean(v));
}
