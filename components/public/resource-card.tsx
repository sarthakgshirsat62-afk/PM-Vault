import Link from "next/link";
import type { ResourceCard as Card } from "@/types/domain";
import { DifficultyBadge, EditorsPickBadge, PriceBadge, SponsoredBadge } from "./badges";
import { Thumbnail } from "./thumbnail";

export function ResourceCard({ resource, headingLevel = 3 }: { resource: Card; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const source = resource.organization || resource.author;
  const href = `/resource/${resource.slug}`;

  return (
    <article className="card group relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md focus-within:shadow-md" data-resource-id={resource.id}>
      <Thumbnail
        src={resource.thumbnail_url}
        alt={resource.thumbnail_alt}
        label={resource.type_name ?? resource.title}
        sizes="(min-width: 1280px) 22rem, (min-width: 768px) 45vw, 100vw"
      />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {resource.sponsored && <SponsoredBadge />}
          {resource.editors_pick && <EditorsPickBadge />}
          {resource.type_name && <span className="badge">{resource.type_name}</span>}
          <PriceBadge price={resource.price_type} />
          <DifficultyBadge difficulty={resource.difficulty} />
        </div>
        <Heading className="text-base font-semibold leading-snug">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none" data-resource-link={resource.id}>
            {resource.title}
          </Link>
        </Heading>
        <p className="line-clamp-3 text-sm text-ink-muted">{resource.short_description}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1 text-xs text-ink-subtle">
          <span className="min-w-0 truncate">
            {source && <span>{source}</span>}
            {source && resource.category_name && <span aria-hidden="true"> · </span>}
            {resource.category_name && <span>{resource.category_name}</span>}
          </span>
          <span aria-hidden="true" className="shrink-0 font-semibold text-accent group-hover:underline">
            View resource →
          </span>
        </div>
      </div>
    </article>
  );
}

export function ResourceGrid({ resources, headingLevel }: { resources: Card[]; headingLevel?: 2 | 3 }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {resources.map((r) => (
        <li key={r.id}>
          <ResourceCard resource={r} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
