import Link from "next/link";
import { LABELS, type SortOption } from "@/types/domain";
import { toQueryString, type ListingParams } from "@/lib/listing-params";
import type { Listing } from "@/services/listing";
import { FilterDrawer } from "./filter-drawer";
import { FilterForm } from "./filter-form";
import { Pagination } from "./pagination";
import { ResourceGrid } from "./resource-card";

type Props = {
  basePath: string;
  params: ListingParams;
  listing: Listing;
  /** Rendered above the results in the main column (e.g. a tracker). */
  children?: React.ReactNode;
};

const SORT_LABELS: Record<SortOption, string> = { relevance: "Recommended", newest: "Newest", popular: "Most popular" };

type Chip = { label: string; href: string };

function activeChips(basePath: string, params: ListingParams, listing: Listing): Chip[] {
  const chips: Chip[] = [];
  const without = (patch: Partial<ListingParams>) => `${basePath}${toQueryString({ ...params, ...patch, page: 1 })}`;
  if (params.sub) {
    const s = listing.options.subcategories.find((x) => x.slug === params.sub);
    if (s) chips.push({ label: s.name, href: without({ sub: null }) });
  }
  for (const slug of params.types) {
    const t = listing.options.types.find((x) => x.slug === slug);
    if (t) chips.push({ label: t.name, href: without({ types: params.types.filter((v) => v !== slug) }) });
  }
  for (const v of params.prices) chips.push({ label: LABELS.price[v], href: without({ prices: params.prices.filter((x) => x !== v) }) });
  for (const v of params.difficulties)
    chips.push({ label: LABELS.difficulty[v], href: without({ difficulties: params.difficulties.filter((x) => x !== v) }) });
  for (const group of listing.options.terms) {
    for (const slug of params.terms[group.kind] ?? []) {
      const t = group.values.find((x) => x.slug === slug);
      if (!t) continue;
      const rest = (params.terms[group.kind] ?? []).filter((x) => x !== slug);
      chips.push({ label: t.name, href: without({ terms: { ...params.terms, [group.kind]: rest } }) });
    }
  }
  return chips;
}

export function ListingView({ basePath, params, listing, children }: Props) {
  const chips = activeChips(basePath, params, listing);
  const { total } = listing;

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
      <aside aria-label="Filters">
        <div className="hidden lg:block">
          <FilterForm basePath={basePath} params={params} options={listing.options} idPrefix="side" />
        </div>
        <FilterDrawer activeCount={chips.length}>
          <FilterForm basePath={basePath} params={params} options={listing.options} idPrefix="drawer" />
        </FilterDrawer>
      </aside>

      <div className="min-w-0">
        {children}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-muted" role="status">
            {total === 0 ? "No resources found" : `${total} resource${total === 1 ? "" : "s"}`}
          </p>
          <nav aria-label="Sort" className="flex gap-1 text-sm">
            {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
              <Link
                key={s}
                href={`${basePath}${toQueryString({ ...params, sort: s, page: 1 })}`}
                aria-current={params.sort === s ? "true" : undefined}
                className={`rounded-lg px-2.5 py-1.5 ${params.sort === s ? "bg-accent-soft font-semibold text-accent" : "text-ink-muted hover:bg-surface-muted"}`}
              >
                {SORT_LABELS[s]}
              </Link>
            ))}
          </nav>
        </div>

        {chips.length > 0 && (
          <ul className="mb-4 flex flex-wrap gap-2" aria-label="Active filters">
            {chips.map((c) => (
              <li key={c.href + c.label}>
                <Link href={c.href} className="badge bg-accent-soft text-accent hover:underline">
                  {c.label} <span aria-hidden="true">×</span>
                  <span className="sr-only"> (remove filter)</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {listing.items.length > 0 ? (
          <div data-results>
            <ResourceGrid resources={listing.items} headingLevel={2} />
          </div>
        ) : (
          <div className="card p-8 text-center">
            <h2 className="font-semibold">Nothing matches yet</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Try fewer filters or different words. Know a great resource we&apos;re missing?
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {chips.length > 0 && (
                <Link href={`${basePath}${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`} className="btn btn-secondary">
                  Clear filters
                </Link>
              )}
              <Link href="/submit" className="btn btn-primary">
                Suggest a resource
              </Link>
            </div>
          </div>
        )}

        <Pagination basePath={basePath} params={params} total={total} pageSize={listing.pageSize} />
      </div>
    </div>
  );
}
