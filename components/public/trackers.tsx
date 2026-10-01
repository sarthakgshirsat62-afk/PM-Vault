"use client";

import { useEffect, useRef } from "react";

function send(body: Record<string, unknown>): Promise<Response | null> {
  return fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => null);
}

/** Records one detail-page view (no cookies or identifiers). */
export function ViewTracker({ resourceId }: { resourceId: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    let referrerPath: string | undefined;
    try {
      const ref = document.referrer ? new URL(document.referrer) : null;
      if (ref && ref.origin === window.location.origin) referrerPath = (ref.pathname + ref.search).slice(0, 300);
    } catch {
      referrerPath = undefined;
    }
    void send({ type: "view", resource_id: resourceId, referrer_path: referrerPath });
  }, [resourceId]);
  return null;
}

/**
 * Logs a search (for search analytics / zero-result content gaps) and which
 * result the visitor opens (per-query result CTR).
 */
export function SearchTracker({ query, resultCount, filters }: { query: string; resultCount: number; filters: Record<string, unknown> }) {
  const sent = useRef<string | null>(null);
  const searchId = useRef<number | null>(null);
  const key = JSON.stringify([query, filters]);

  useEffect(() => {
    if (sent.current === key) return;
    sent.current = key;
    searchId.current = null;
    void send({ type: "search", query, result_count: resultCount, filters: JSON.parse(key)[1] })
      .then((res) => (res && res.ok ? res.json() : null))
      .then((data: { searchId?: number } | null) => {
        if (data?.searchId) searchId.current = data.searchId;
      })
      .catch(() => undefined);
  }, [key, query, resultCount]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const link = (e.target as Element | null)?.closest?.("[data-results] a[data-resource-link]");
      const id = link?.getAttribute("data-resource-link");
      if (id && searchId.current) void send({ type: "search_click", search_id: searchId.current, resource_id: id });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
