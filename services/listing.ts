import "server-only";
import { FILTER_TERM_KINDS, type ListingParams } from "@/lib/listing-params";
import type { ResourceType, Subcategory, TaxonomyKind, TaxonomyTerm } from "@/types/domain";
import { searchResources, type SearchResult } from "./resources";
import { getResourceTypes, getSubcategories, getTaxonomyTerms } from "./taxonomy";

export const PAGE_SIZE = 24;

export type ListingScope = { categoryId?: string; typeId?: string };

export type FilterOptions = {
  types: ResourceType[];
  subcategories: Subcategory[];
  terms: { kind: TaxonomyKind; values: TaxonomyTerm[] }[];
};

export type Listing = SearchResult & { options: FilterOptions };

/** Resolves URL slugs to ids (unknown slugs are ignored) and runs the ranked search. */
export async function loadListing(params: ListingParams, scope: ListingScope = {}): Promise<Listing> {
  const [types, allTerms, subcategories] = await Promise.all([
    getResourceTypes(),
    getTaxonomyTerms(),
    scope.categoryId ? getSubcategories(scope.categoryId) : Promise.resolve([] as Subcategory[]),
  ]);

  const typeIds = scope.typeId ? [scope.typeId] : types.filter((t) => params.types.includes(t.slug)).map((t) => t.id);
  const termIds = allTerms.filter((t) => params.terms[t.kind]?.includes(t.slug)).map((t) => t.id);
  const subcategoryId = params.sub ? (subcategories.find((s) => s.slug === params.sub)?.id ?? null) : null;

  const result = await searchResources({
    q: params.q,
    categoryId: scope.categoryId ?? null,
    subcategoryId,
    typeIds,
    prices: params.prices,
    difficulties: params.difficulties,
    termIds,
    sort: params.sort,
    page: params.page,
    pageSize: PAGE_SIZE,
  });

  return {
    ...result,
    options: {
      types: scope.typeId ? [] : types,
      subcategories,
      terms: FILTER_TERM_KINDS.map((kind) => ({ kind, values: allTerms.filter((t) => t.kind === kind) })).filter(
        (g) => g.values.length > 0,
      ),
    },
  };
}
