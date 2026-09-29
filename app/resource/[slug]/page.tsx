import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/public/json-ld";
import { ResourceDetailView, resourceCrumbs } from "@/components/public/resource-detail";
import { ViewTracker } from "@/components/public/trackers";
import { isValidSlug } from "@/lib/slug";
import { breadcrumbSchema, resourceSchema } from "@/lib/structured-data";
import { getPublishedResourceBySlug, getSimilarResources } from "@/services/resources";

// Statically generated on first visit, then cached; admin edits purge it.
export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata(props: PageProps<"/resource/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const r = isValidSlug(slug) ? await getPublishedResourceBySlug(slug) : null;
  if (!r) return { title: "Not found", robots: { index: false } };
  const title = r.seo_title || r.title;
  const description = r.meta_description || r.short_description;
  const image = r.og_image_url || r.thumbnail_url;
  return {
    // A custom SEO title is used verbatim; otherwise "<title> · <site name>".
    title: r.seo_title ? { absolute: r.seo_title } : r.title,
    description,
    alternates: { canonical: `/resource/${r.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/resource/${r.slug}`,
      images: image ? [{ url: image, alt: r.thumbnail_alt ?? "" }] : undefined,
      publishedTime: r.published_at ?? undefined,
      modifiedTime: r.updated_at,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export default async function ResourcePage(props: PageProps<"/resource/[slug]">) {
  const { slug } = await props.params;
  if (!isValidSlug(slug)) notFound();
  const resource = await getPublishedResourceBySlug(slug);
  if (!resource) notFound();
  const similar = await getSimilarResources(resource.id, 4);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(resourceCrumbs(resource)),
          resourceSchema({ ...resource, tags: resource.tags.map((t) => t.name) }),
        ]}
      />
      <ViewTracker resourceId={resource.id} />
      <ResourceDetailView resource={resource} similar={similar} />
    </>
  );
}
