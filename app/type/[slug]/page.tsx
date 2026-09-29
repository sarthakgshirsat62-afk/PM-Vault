import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { JsonLd } from "@/components/public/json-ld";
import { ListingView } from "@/components/public/listing-view";
import { hasActiveFilters, parseListingParams } from "@/lib/listing-params";
import { isValidSlug } from "@/lib/slug";
import { breadcrumbSchema } from "@/lib/structured-data";
import { loadListing } from "@/services/listing";
import { getResourceTypeBySlug } from "@/services/taxonomy";

export async function generateMetadata(props: PageProps<"/type/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const type = isValidSlug(slug) ? await getResourceTypeBySlug(slug) : null;
  if (!type) return { title: "Not found", robots: { index: false } };
  const params = parseListingParams(await props.searchParams);
  const title = `Product management ${type.plural_name.toLowerCase()}`;
  const description = type.description || `Curated product management ${type.plural_name.toLowerCase()}, with guidance on when to use each.`;
  return {
    title,
    description,
    alternates: { canonical: `/type/${type.slug}` },
    openGraph: { title, description, url: `/type/${type.slug}` },
    robots: hasActiveFilters(params) || params.q || params.page > 1 ? { index: false, follow: true } : undefined,
  };
}

export default async function TypePage(props: PageProps<"/type/[slug]">) {
  const { slug } = await props.params;
  if (!isValidSlug(slug)) notFound();
  const type = await getResourceTypeBySlug(slug);
  if (!type) notFound();

  const params = parseListingParams(await props.searchParams);
  const listing = await loadListing(params, { typeId: type.id });
  const crumbs = [{ name: "Home", href: "/" }, { name: "Resources", href: "/resources" }, { name: type.plural_name }];

  return (
    <div className="container-page py-8">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <header className="mb-8 mt-4 max-w-3xl">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{type.plural_name}</h1>
        {type.description && <p className="mt-2 text-lg text-ink-muted">{type.description}</p>}
      </header>
      <ListingView basePath={`/type/${type.slug}`} params={params} listing={listing} />
    </div>
  );
}
