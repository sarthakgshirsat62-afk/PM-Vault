import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { JsonLd } from "@/components/public/json-ld";
import { ListingView } from "@/components/public/listing-view";
import { hasActiveFilters, parseListingParams } from "@/lib/listing-params";
import { isValidSlug } from "@/lib/slug";
import { breadcrumbSchema, collectionSchema } from "@/lib/structured-data";
import { loadListing } from "@/services/listing";
import { getCategoryBySlug, getCategoryCounts } from "@/services/taxonomy";

export async function generateMetadata(props: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const category = isValidSlug(slug) ? await getCategoryBySlug(slug) : null;
  if (!category) return { title: "Not found", robots: { index: false } };
  const params = parseListingParams(await props.searchParams);
  const count = (await getCategoryCounts()).get(category.id) ?? 0;
  const description = category.meta_description || category.description || undefined;
  const title = category.seo_title || `${category.name} — curated resources for product managers`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: { title, description, url: `/category/${category.slug}` },
    twitter: { title, description },
    // Only index category pages that have curated content (PRD §56).
    robots: count === 0 || hasActiveFilters(params) || params.q || params.page > 1 ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;
  if (!isValidSlug(slug)) notFound();
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const params = parseListingParams(await props.searchParams);
  const listing = await loadListing(params, { categoryId: category.id });
  const basePath = `/category/${category.slug}`;
  const crumbs = [{ name: "Home", href: "/" }, { name: "Resources", href: "/resources" }, { name: category.name }];

  return (
    <div className="container-page py-8">
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          collectionSchema({
            name: category.seo_title || category.name,
            description: category.meta_description || category.description,
            path: basePath,
            items: listing.items.map((i) => ({ name: i.title, slug: i.slug })),
          }),
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <header className="mb-8 mt-4 max-w-3xl">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{category.name}</h1>
        {category.description && <p className="mt-2 text-lg text-ink-muted">{category.description}</p>}
        {category.editorial_intro && (
          <div className="prose-editorial mt-5 border-l-2 border-accent/40 pl-4 leading-relaxed text-ink">
            {category.editorial_intro
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>
        )}
      </header>
      <ListingView basePath={basePath} params={params} listing={listing} />
    </div>
  );
}
