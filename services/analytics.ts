import "server-only";
import { publicDb } from "./db";
import type { TrackEvent } from "@/lib/validation/track";

/**
 * Writes analytics through SECURITY DEFINER functions as the anonymous role.
 * No IPs, cookies or user identifiers are stored.
 */
export async function recordEvent(event: TrackEvent): Promise<{ searchId?: number }> {
  const db = publicDb();
  if (!db) return {};
  switch (event.type) {
    case "view": {
      const { error } = await db.rpc("log_resource_view", { p_resource_id: event.resource_id, p_referrer_path: event.referrer_path ?? null });
      if (error) console.error("[analytics:view]", error.message);
      return {};
    }
    case "search": {
      const { data, error } = await db.rpc("log_search", {
        p_query: event.query,
        p_filters: event.filters ?? {},
        p_result_count: event.result_count,
      });
      if (error) console.error("[analytics:search]", error.message);
      return typeof data === "number" ? { searchId: data } : {};
    }
    case "search_click": {
      const { error } = await db.rpc("log_search_click", { p_search_query_id: event.search_id, p_resource_id: event.resource_id });
      if (error) console.error("[analytics:search_click]", error.message);
      return {};
    }
  }
}

/** Logs an outbound click and returns the destination URL (null if not published). */
export async function recordOutboundClick(slug: string, fromDetail: boolean): Promise<string | null> {
  const db = publicDb();
  if (!db) return null;
  const { data, error } = await db.rpc("log_resource_click", { p_slug: slug, p_from_detail: fromDetail, p_search_query_id: null });
  if (error) {
    console.error("[analytics:click]", error.message);
    return null;
  }
  return typeof data === "string" ? data : null;
}

/** Destination lookup without logging (used for bots). */
export async function getPublishedUrl(slug: string): Promise<string | null> {
  const db = publicDb();
  if (!db) return null;
  const { data } = await db.from("resources").select("external_url").eq("slug", slug).eq("status", "published").maybeSingle();
  return (data as { external_url: string } | null)?.external_url ?? null;
}
