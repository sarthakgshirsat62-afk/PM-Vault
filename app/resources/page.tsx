import type { Metadata } from "next";
import { ListingView } from "@/components/public/listing-view";
import { SearchTracker } from "@/components/public/trackers";
import { hasActiveFilters, parseListingParams } from "@/lib/listing-params";
import { loadListing } from "@/services/listing";

export async function generateMetadata(props: PageProps<"/resources">): Promise<Metadata> {
  const params = parseListingParams(await props.searchParams);
  const filtered = Boolean(params.q) || hasActiveFilters(params) || params.page > 1 || params.sort !== "relevance";
  return {
    title: params.q ? `Search: ${params.q}` : "All product management resources",
    description: "Browse curated product management templates, frameworks, tools and examples, with guidance on when to use each.",
    alternates: { canonical: "/resources" },
    // Search and filter permutations are thin duplicates: keep them out of the index.
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function ResourcesPage(props: PageProps<"/resources">) {
  const params = parseListingParams(await props.searchParams);
  const listing = await loadListing(params);

  return (
    <div className="container-page py-8">
      <header className="mb-8 max-w-3xl">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          {params.q ? (
            <>
              Results for <span className="text-accent">“{params.q}”</span>
            </>
          ) : (
            "All resources"
          )}
        </h1>
        <p className="mt-2 text-ink-muted">
          {params.q
            ? "Ranked by relevance and editorial quality — not just clicks."
            : "Every resource is reviewed by an editor and comes with guidance on when to use it — and when not to."}
        </p>
      </header>
      <ListingView basePath="/resources" params={params} listing={listing}>
        {params.q && params.page === 1 && (
          <SearchTracker query={params.q} resultCount={listing.total} filters={{ ...params, q: undefined, page: undefined }} />
        )}
      </ListingView>
    </div>
  );
}
