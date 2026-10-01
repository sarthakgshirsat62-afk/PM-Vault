import { DIFFICULTIES, PRICE_TYPES, SORT_OPTIONS, TAXONOMY_KINDS } from "@/types/domain";
import type { Difficulty, PriceType, SortOption, TaxonomyKind } from "@/types/domain";
import { isValidSlug } from "@/lib/slug";

/** Filter dimensions shown on listing pages, in display order. */
export const FILTER_TERM_KINDS: TaxonomyKind[] = ["career_level", "product_type", "product_stage", "company_stage", "format", "persona"];

export type ListingParams = {
  q: string;
  types: string[];
  prices: PriceType[];
  difficulties: Difficulty[];
  terms: Partial<Record<TaxonomyKind, string[]>>;
  sub: string | null;
  sort: SortOption;
  page: number;
};

export type RawParams = Record<string, string | string[] | undefined>;

function values(raw: RawParams, key: string): string[] {
  const v = raw[key];
  const arr = Array.isArray(v) ? v : v === undefined ? [] : [v];
  return arr
    .flatMap((s) => s.split(","))
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function slugs(raw: RawParams, key: string): string[] {
  return [...new Set(values(raw, key).filter(isValidSlug))].slice(0, 20);
}

function oneOf<T extends string>(list: readonly T[], items: string[]): T[] {
  return [...new Set(items.filter((i): i is T => (list as readonly string[]).includes(i)))];
}

/** Parses untrusted URL search params into a safe, normalized filter set. */
export function parseListingParams(raw: RawParams): ListingParams {
  const qRaw = raw.q;
  const q = ((Array.isArray(qRaw) ? qRaw[0] : qRaw) ?? "").trim().slice(0, 200);
  const terms: Partial<Record<TaxonomyKind, string[]>> = {};
  for (const kind of TAXONOMY_KINDS) {
    const s = slugs(raw, kind);
    if (s.length) terms[kind] = s;
  }
  const sortValue = values(raw, "sort")[0] ?? "";
  const sort = (SORT_OPTIONS as readonly string[]).includes(sortValue) ? (sortValue as SortOption) : "relevance";
  const pageNum = Number.parseInt(values(raw, "page")[0] ?? "1", 10);
  return {
    q,
    types: slugs(raw, "type"),
    prices: oneOf(PRICE_TYPES, values(raw, "price")),
    difficulties: oneOf(DIFFICULTIES, values(raw, "difficulty")),
    terms,
    sub: slugs(raw, "sub")[0] ?? null,
    sort,
    page: Number.isFinite(pageNum) && pageNum > 0 ? Math.min(pageNum, 500) : 1,
  };
}

/** True when any filter (not just q/sort/page) is active. */
export function hasActiveFilters(p: ListingParams): boolean {
  return p.types.length + p.prices.length + p.difficulties.length + Object.keys(p.terms).length > 0 || p.sub !== null;
}

/** Serializes params back into a query string, dropping defaults. */
export function toQueryString(p: Partial<ListingParams>): string {
  const sp = new URLSearchParams();
  if (p.q) sp.set("q", p.q);
  if (p.types?.length) sp.set("type", p.types.join(","));
  if (p.prices?.length) sp.set("price", p.prices.join(","));
  if (p.difficulties?.length) sp.set("difficulty", p.difficulties.join(","));
  for (const kind of TAXONOMY_KINDS) {
    const list = p.terms?.[kind];
    if (list?.length) sp.set(kind, list.join(","));
  }
  if (p.sub) sp.set("sub", p.sub);
  if (p.sort && p.sort !== "relevance") sp.set("sort", p.sort);
  if (p.page && p.page > 1) sp.set("page", String(p.page));
  const s = sp.toString();
  return s ? `?${s}` : "";
}
