import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidSlug } from "@/lib/slug";
import { getPublishedPage } from "@/services/site";

export const revalidate = 3600;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata(props: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const page = isValidSlug(slug) ? await getPublishedPage(slug) : null;
  if (!page) return { title: "Not found", robots: { index: false } };
  return { title: page.title, description: page.meta_description ?? undefined, alternates: { canonical: `/p/${page.slug}` } };
}

export default async function ContentPage(props: PageProps<"/p/[slug]">) {
  const { slug } = await props.params;
  if (!isValidSlug(slug)) notFound();
  const page = await getPublishedPage(slug);
  if (!page) notFound();

  return (
    <article className="container-page max-w-3xl py-12">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{page.title}</h1>
      <p className="mt-2 text-sm text-ink-subtle">
        Last updated <time dateTime={page.updated_at}>{new Date(page.updated_at).toLocaleDateString("en-GB", { dateStyle: "long" })}</time>
      </p>
      <div className="prose-editorial mt-8 leading-relaxed">
        {page.body
          .split(/\n{2,}/)
          .filter(Boolean)
          .map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
      </div>
    </article>
  );
}
