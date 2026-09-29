import "server-only";
import { userDb, check } from "./db";

export type Metrics = {
  views: number;
  clicks: number;
  useful_discoveries: number;
  searches: number;
  zero_result_searches: number;
  searches_with_click: number;
};

export type QueryInsight = {
  normalized_query: string;
  searches: number;
  zero_result_searches: number;
  clicks: number;
  ctr: number;
  avg_results: number;
};

export type TopResource = { resource_id: string; title: string; slug: string; views: number; clicks: number; ctr: number };

export async function getMetrics(days: number): Promise<Metrics> {
  const db = await userDb();
  const data = check(await db.rpc("admin_metrics", { p_days: days }), "loading metrics") as Partial<Metrics> | null;
  return {
    views: Number(data?.views ?? 0),
    clicks: Number(data?.clicks ?? 0),
    useful_discoveries: Number(data?.useful_discoveries ?? 0),
    searches: Number(data?.searches ?? 0),
    zero_result_searches: Number(data?.zero_result_searches ?? 0),
    searches_with_click: Number(data?.searches_with_click ?? 0),
  };
}

export async function getSearchInsights(days: number, limit = 100): Promise<QueryInsight[]> {
  const db = await userDb();
  const data = check(await db.rpc("admin_search_insights", { p_days: days, p_limit: limit }), "loading search insights");
  return ((data ?? []) as QueryInsight[]).map((r) => ({
    ...r,
    searches: Number(r.searches),
    zero_result_searches: Number(r.zero_result_searches),
    clicks: Number(r.clicks),
    ctr: Number(r.ctr),
    avg_results: Number(r.avg_results),
  }));
}

export async function getTopResources(days: number, limit = 10): Promise<TopResource[]> {
  const db = await userDb();
  const data = check(await db.rpc("admin_top_resources", { p_days: days, p_limit: limit }), "loading top resources");
  return ((data ?? []) as TopResource[]).map((r) => ({ ...r, views: Number(r.views), clicks: Number(r.clicks), ctr: Number(r.ctr) }));
}

/** Pure helper: ratio as a percentage string, "—" when undefined. */
export function pct(numerator: number, denominator: number): string {
  if (!denominator) return "—";
  return `${Math.round((numerator / denominator) * 1000) / 10}%`;
}
