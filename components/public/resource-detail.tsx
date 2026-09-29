import Link from "next/link";
import type { ResourceDetail } from "@/services/resources";
import { displayHost } from "@/lib/url";
import { LABELS, type ResourceCard as Card, type TaxonomyKind } from "@/types/domain";
import { DifficultyBadge, EditorsPickBadge, PriceBadge, SponsoredBadge } from "./badges";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { ResourceGrid } from "./resource-card";
import { Thumbnail } from "./thumbnail";

type Props = {
  resource: ResourceDetail;
  similar: Card[];
  /** Admin preview of an unpublished resource: link straight to the URL (no tracking). */
  preview?: boolean;
};

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function resourceCrumbs(r: ResourceDetail): Crumb[] {
  const crumbs: Crumb[] = [{ name: "Home", href: "/" }];
  if (r.category) crumbs.push({ name: r.category.name, href: `/category/${r.category.slug}` });
  if (r.category && r.subcategory) crumbs.push({ name: r.subcategory.name, href: `/category/${r.category.slug}?sub=${r.subcategory.slug}` });
  crumbs.push({ name: r.title });
  return crumbs;
}

function OpenResourceLink({ resource, preview, className }: { resource: ResourceDetail; preview?: boolean; className: string }) {
  const paid = resource.sponsored || resource.affiliate;
  const rel = ["noopener", "noreferrer", paid ? "sponsored" : "", resource.affiliate ? "nofollow" : ""].filter(Boolean).join(" ");
  const href = preview ? resource.external_url : `/go/${resource.slug}?from=detail`;
  const host = displayHost(resource.external_url);
  return (
    <a href={href} target="_blank" rel={rel} className={className} data-outbound={resource.id}>
      Open resource
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-current">
        <path d="M11 3h6v6h-2V6.4l-6.3 6.3-1.4-1.4L13.6 5H11V3zM5 5h4v2H5v8h8v-4h2v6H3V5h2z" />
      </svg>
      <span className="sr-only">
        {" "}
        on {host} (opens in a new tab)
      </span>
    </a>
  );
}

function ListSection({ id, title, items, ordered, tone }: { id: string; title: string; items: string[]; ordered?: boolean; tone?: "avoid" }) {
  if (items.length === 0) return null;
  const List = ordered ? "ol" : "ul";
  return (
    <section aria-labelledby={id} className={tone === "avoid" ? "rounded-xl border border-danger/25 bg-danger-soft/40 p-5" : undefined}>
      <h2 id={id} className="font-display text-xl font-semibold">
        {title}
      </h2>
      <List className={`mt-3 space-y-2 pl-5 ${ordered ? "list-decimal" : "list-disc"} marker:text-ink-subtle`}>
        {items.map((item, i) => (
          <li key={i} className="pl-1 leading-relaxed">
            {item}
          </li>
        ))}
      </List>
    </section>
  );
}

export function ResourceDetailView({ resource: r, similar, preview }: Props) {
  const source = r.organization || r.author;
  const host = displayHost(r.external_url);
  const termsByKind = new Map<TaxonomyKind, typeof r.terms>();
  for (const t of r.terms) termsByKind.set(t.kind, [...(termsByKind.get(t.kind) ?? []), t]);

  const meta: { label: string; value: React.ReactNode }[] = [
    { label: "Price", value: <PriceBadge price={r.price_type} /> },
    { label: "Difficulty", value: <DifficultyBadge difficulty={r.difficulty} /> },
  ];
  if (r.type) meta.push({ label: "Type", value: <Link className="hover:underline" href={`/type/${r.type.slug}`}>{r.type.name}</Link> });
  const formats = termsByKind.get("format");
  if (formats?.length) meta.push({ label: "Format", value: formats.map((t) => t.name).join(", ") });
  if (r.estimated_time) meta.push({ label: "Time to use", value: r.estimated_time });
  if (r.author) meta.push({ label: "Author", value: r.author });
  if (r.organization) meta.push({ label: "Source", value: r.organization });
  meta.push({ label: "Website", value: host });
  const added = formatDate(r.published_at);
  if (added) meta.push({ label: "Added", value: added });
  const reviewed = formatDate(r.last_verified_at);
  if (reviewed) meta.push({ label: "Last reviewed", value: reviewed });

  return (
    <article className="pb-24 lg:pb-12">
      <div className="container-page pt-6">
        <Breadcrumbs items={resourceCrumbs(r)} />
      </div>

      <header className="container-page mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div>
          <div className="flex flex-wrap gap-1.5">
            {r.sponsored && <SponsoredBadge sponsor={r.sponsor_name} />}
            {r.editors_pick && <EditorsPickBadge />}
            {r.type && <span className="badge">{r.type.name}</span>}
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">{r.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-muted">{r.short_description}</p>
          {source && <p className="mt-2 text-sm text-ink-subtle">By {source}</p>}
          {r.sponsored && (
            <p className="mt-3 text-sm text-sponsored">
              Sponsored{r.sponsor_name ? ` by ${r.sponsor_name}` : ""}. Sponsorship never affects our editorial ratings or ranking.
            </p>
          )}
          {r.affiliate && (
            <p className="mt-3 text-sm text-ink-muted">
              Affiliate disclosure: we may earn a commission if you buy through this link, at no extra cost to you.
            </p>
          )}
          <div className="mt-6 hidden sm:block">
            <OpenResourceLink resource={r} preview={preview} className="btn btn-primary" />
            <p className="mt-2 text-xs text-ink-subtle">Opens {host} in a new tab.</p>
          </div>
        </div>
        <div className="space-y-4">
          <Thumbnail
            src={r.thumbnail_url}
            alt={r.thumbnail_alt}
            label={r.type?.name ?? r.title}
            sizes="(min-width: 1024px) 22rem, 100vw"
            priority
            className="rounded-xl border border-line"
          />
          <dl className="card divide-y divide-line text-sm">
            {meta.map((m) => (
              <div key={m.label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <dt className="text-ink-subtle">{m.label}</dt>
                <dd className="text-right font-medium">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="container-page mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="max-w-3xl space-y-10">
          {(r.long_description || r.problem_solved) && (
            <section aria-labelledby="overview">
              <h2 id="overview" className="font-display text-xl font-semibold">
                Editorial overview
              </h2>
              {r.problem_solved && (
                <p className="mt-3 rounded-lg bg-surface-muted p-4 text-sm">
                  <span className="font-semibold">Problem it solves: </span>
                  {r.problem_solved}
                </p>
              )}
              <div className="prose-editorial mt-3 leading-relaxed text-ink">
                {r.long_description
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
              </div>
            </section>
          )}
          <ListSection id="best-for" title="Best for" items={r.best_for} />
          <ListSection id="use-when" title="Use this when" items={r.use_when} />
          <ListSection id="avoid-when" title="Avoid this when" items={r.avoid_when} tone="avoid" />
          <ListSection id="how-to" title="How to use" items={r.how_to_use} ordered />
          {r.example_output && (
            <section aria-labelledby="example">
              <h2 id="example" className="font-display text-xl font-semibold">
                Example output
              </h2>
              <p className="mt-3 rounded-lg border border-line bg-surface p-4 leading-relaxed">{r.example_output}</p>
            </section>
          )}
          <div className="grid gap-8 md:grid-cols-2">
            <ListSection id="strengths" title="Strengths" items={r.strengths} />
            <ListSection id="limitations" title="Limitations" items={r.limitations} />
          </div>
        </div>

        <aside className="space-y-6" aria-label="Related">
          {r.category && (
            <section aria-labelledby="related-cats" className="card p-4">
              <h2 id="related-cats" className="text-sm font-semibold uppercase tracking-wide text-ink-subtle">
                Related categories
              </h2>
              <ul className="mt-2 space-y-1 text-sm">
                <li>
                  <Link href={`/category/${r.category.slug}`} className="text-accent hover:underline">
                    {r.category.name}
                  </Link>
                </li>
                {r.subcategory && (
                  <li>
                    <Link href={`/category/${r.category.slug}?sub=${r.subcategory.slug}`} className="text-accent hover:underline">
                      {r.subcategory.name}
                    </Link>
                  </li>
                )}
              </ul>
            </section>
          )}
          {r.terms.length > 0 && (
            <section aria-labelledby="context" className="card p-4">
              <h2 id="context" className="text-sm font-semibold uppercase tracking-wide text-ink-subtle">
                Who it&apos;s for
              </h2>
              <dl className="mt-2 space-y-2 text-sm">
                {[...termsByKind.entries()].map(([kind, terms]) => (
                  <div key={kind}>
                    <dt className="text-ink-subtle">{LABELS.taxonomy[kind]}</dt>
                    <dd className="mt-1 flex flex-wrap gap-1">
                      {terms.map((t) => (
                        <Link key={t.id} href={`/resources?${kind}=${t.slug}`} className="badge hover:bg-accent-soft hover:text-accent">
                          {t.name}
                        </Link>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          {r.tags.length > 0 && (
            <section aria-labelledby="tags" className="card p-4">
              <h2 id="tags" className="text-sm font-semibold uppercase tracking-wide text-ink-subtle">
                Tags
              </h2>
              <ul className="mt-2 flex flex-wrap gap-1">
                {r.tags.map((t) => (
                  <li key={t.id}>
                    <Link href={`/resources?q=${encodeURIComponent(t.name)}`} className="badge hover:bg-accent-soft hover:text-accent">
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar" className="container-page mt-16">
          <h2 id="similar" className="mb-4 font-display text-2xl font-semibold">
            Similar resources
          </h2>
          <ResourceGrid resources={similar} />
        </section>
      )}

      {/* Mobile: primary CTA always visible. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 p-3 backdrop-blur sm:hidden">
        <OpenResourceLink resource={r} preview={preview} className="btn btn-primary w-full" />
      </div>
    </article>
  );
}
