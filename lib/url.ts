const TRACKING_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id",
  "gclid", "fbclid", "mc_cid", "mc_eid", "ref", "ref_src", "igshid",
]);

/** Parses and validates an external http(s) URL. Returns null if unsafe. */
export function parseExternalUrl(input: string): URL | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  if (!url.hostname.includes(".")) return null;
  return url;
}

/**
 * Canonical form used for duplicate detection:
 * lowercase host without "www.", no hash, no tracking params, sorted query,
 * no trailing slash, protocol ignored.
 */
export function normalizeUrl(input: string): string | null {
  const url = parseExternalUrl(input);
  if (!url) return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const port = url.port && url.port !== "80" && url.port !== "443" ? `:${url.port}` : "";
  const params = [...url.searchParams.entries()]
    .filter(([key]) => !TRACKING_PARAMS.has(key.toLowerCase()))
    .sort(([a], [b]) => a.localeCompare(b));
  const query = params.length ? `?${new URLSearchParams(params).toString()}` : "";
  let path = url.pathname.replace(/\/{2,}/g, "/");
  if (path.length > 1) path = path.replace(/\/+$/, "");
  if (path === "/") path = "";
  return `${host}${port}${path}${query}`;
}

/** Display-friendly destination, e.g. "intercom.com". */
export function displayHost(input: string): string {
  const url = parseExternalUrl(input);
  return url ? url.hostname.replace(/^www\./, "") : "";
}

/** Only allow same-site relative redirects (prevents open redirects). */
export function safeRelativePath(input: string | null | undefined, fallback = "/"): string {
  if (!input || !input.startsWith("/") || input.startsWith("//") || input.includes("\\")) return fallback;
  return input;
}
