import Link from "next/link";
import {
  parseBlockConfig, type BrowseTermsConfig, type HeroConfig, type LimitConfig, type ResourceListConfig, type TasksConfig,
} from "@/lib/homepage-config";
import { getEditorsPicks, getFeaturedResources, getMostPopular, getRecentlyAdded, getResourcesByIds } from "@/services/resources";
import { getCategoryCounts, getPublishedCategories, getTaxonomyTerms } from "@/services/taxonomy";
import type { HomepageBlock } from "@/types/domain";
import { ResourceGrid } from "./resource-card";
import { SearchForm } from "./search-form";

function Section({ block, children, action }: { block: HomepageBlock; children: React.ReactNode; action?: React.ReactNode }) {
  const headingId = `block-${block.id}`;
  return (
    <section aria-labelledby={block.heading ? headingId : undefined} className="container-page py-10">
      {(block.heading || action) && (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            {block.heading && (
              <h2 id={headingId} className="font-display text-2xl font-semibold sm:text-3xl">
                {block.heading}
              </h2>
            )}
            {block.subheading && <p className="mt-1 text-ink-muted">{block.subheading}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function Hero({ block }: { block: HomepageBlock }) {
  const c = parseBlockConfig("hero", block.config) as HeroConfig;
  return (
    <section className="border-b border-line bg-gradient-to-b from-surface to-canvas">
      <div className="container-page py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{block.heading}</h1>
          {block.subheading && <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-muted">{block.subheading}</p>}
          <div className="mx-auto mt-8 max-w-2xl text-left">
            <SearchForm id="hero-search" label={c.search_label} placeholder={c.search_placeholder} size="lg" hideLabel={false} />
          </div>
          {(c.primary_cta.href || c.secondary_cta.href) && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {c.primary_cta.href && c.primary_cta.label && (
                <Link href={c.primary_cta.href} className="btn btn-primary">
                  {c.primary_cta.label}
                </Link>
              )}
              {c.secondary_cta.href && c.secondary_cta.label && (
                <Link href={c.secondary_cta.href} className="btn btn-secondary">
                  {c.secondary_cta.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PopularTasks({ block }: { block: HomepageBlock }) {
  const { items } = parseBlockConfig("popular_tasks", block.config) as TasksConfig;
  if (items.length === 0) return null;
  return (
    <Section block={block}>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item) => (
          <li key={`${item.label}-${item.href}`}>
            <Link href={item.href} className="card group flex h-full flex-col justify-between gap-2 p-4 hover:border-accent/50">
              <span className="font-semibold group-hover:text-accent">{item.label}</span>
              {item.description && <span className="text-sm text-ink-muted">{item.description}</span>}
              <span aria-hidden="true" className="text-sm text-accent">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

async function ResourceListBlock({ block }: { block: HomepageBlock }) {
  let resources;
  if (block.block_type === "most_popular" || block.block_type === "recently_added") {
    const { limit } = parseBlockConfig(block.block_type, block.config) as LimitConfig;
    resources = block.block_type === "most_popular" ? await getMostPopular(limit) : await getRecentlyAdded(limit);
  } else {
    const c = parseBlockConfig(block.block_type, block.config) as ResourceListConfig;
    resources = c.resource_ids?.length
      ? (await getResourcesByIds(c.resource_ids)).slice(0, c.limit)
      : block.block_type === "editors_picks"
        ? await getEditorsPicks(c.limit)
        : await getFeaturedResources(c.limit);
  }
  if (resources.length === 0) return null;
  const moreHref = block.block_type === "recently_added" ? "/resources?sort=newest" : "/resources";
  return (
    <Section
      block={block}
      action={
        <Link href={moreHref} className="text-sm font-semibold text-accent hover:underline">
          View all →
        </Link>
      }
    >
      <ResourceGrid resources={resources} />
    </Section>
  );
}

async function Categories({ block }: { block: HomepageBlock }) {
  const { limit } = parseBlockConfig("categories", block.config) as LimitConfig;
  const [categories, counts] = await Promise.all([getPublishedCategories(), getCategoryCounts()]);
  const visible = categories.filter((c) => (counts.get(c.id) ?? 0) > 0).slice(0, limit);
  if (visible.length === 0) return null;
  return (
    <Section block={block}>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((c) => (
          <li key={c.id}>
            <Link href={`/category/${c.slug}`} className="card group flex h-full flex-col gap-1 p-5 hover:border-accent/50">
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-semibold group-hover:text-accent">{c.name}</span>
                <span className="text-xs text-ink-subtle">
                  {counts.get(c.id)} resource{counts.get(c.id) === 1 ? "" : "s"}
                </span>
              </span>
              {c.description && <span className="text-sm text-ink-muted">{c.description}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

async function BrowseTerms({ block }: { block: HomepageBlock }) {
  const { kind } = parseBlockConfig("browse_terms", block.config) as BrowseTermsConfig;
  const terms = (await getTaxonomyTerms()).filter((t) => t.kind === kind);
  if (terms.length === 0) return null;
  return (
    <Section block={block}>
      <ul className="flex flex-wrap gap-2">
        {terms.map((t) => (
          <li key={t.id}>
            <Link href={`/resources?${kind}=${t.slug}`} className="btn btn-secondary">
              {t.name}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function HomeBlock({ block }: { block: HomepageBlock }) {
  switch (block.block_type) {
    case "hero":
      return <Hero block={block} />;
    case "popular_tasks":
      return <PopularTasks block={block} />;
    case "featured_resources":
    case "editors_picks":
    case "most_popular":
    case "recently_added":
      return <ResourceListBlock block={block} />;
    case "categories":
      return <Categories block={block} />;
    case "browse_terms":
      return <BrowseTerms block={block} />;
    default:
      // Newsletter signup ships in P1.
      return null;
  }
}
