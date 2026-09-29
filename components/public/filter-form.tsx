import Link from "next/link";
import { DIFFICULTIES, LABELS, PRICE_TYPES } from "@/types/domain";
import type { ListingParams } from "@/lib/listing-params";
import type { FilterOptions } from "@/services/listing";

type Props = { basePath: string; params: ListingParams; options: FilterOptions; idPrefix: string };

function Group({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line pb-4">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">{legend}</legend>
      <div className="space-y-1.5">{children}</div>
    </fieldset>
  );
}

function Check({ id, name, value, label, checked }: { id: string; name: string; value: string; label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <input id={id} type="checkbox" name={name} value={value} defaultChecked={checked} className="h-4 w-4 accent-[var(--accent)]" />
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
    </div>
  );
}

/**
 * Plain GET form: every filter is a query parameter, so filtered views are
 * shareable, work without JavaScript, and use the browser's back button.
 */
export function FilterForm({ basePath, params, options, idPrefix }: Props) {
  const p = idPrefix;
  return (
    <form action={basePath} method="get" className="space-y-4" aria-label="Filter resources">
      {params.q && <input type="hidden" name="q" value={params.q} />}
      {params.sort !== "relevance" && <input type="hidden" name="sort" value={params.sort} />}

      {options.subcategories.length > 0 && (
        <Group legend="Topic">
          <div className="flex items-center gap-2">
            <input id={`${p}-sub-all`} type="radio" name="sub" value="" defaultChecked={!params.sub} className="h-4 w-4 accent-[var(--accent)]" />
            <label htmlFor={`${p}-sub-all`} className="text-sm">
              All topics
            </label>
          </div>
          {options.subcategories.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <input
                id={`${p}-sub-${s.slug}`}
                type="radio"
                name="sub"
                value={s.slug}
                defaultChecked={params.sub === s.slug}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <label htmlFor={`${p}-sub-${s.slug}`} className="text-sm">
                {s.name}
              </label>
            </div>
          ))}
        </Group>
      )}

      {options.types.length > 0 && (
        <Group legend="Resource type">
          {options.types.map((t) => (
            <Check key={t.id} id={`${p}-type-${t.slug}`} name="type" value={t.slug} label={t.name} checked={params.types.includes(t.slug)} />
          ))}
        </Group>
      )}

      <Group legend="Price">
        {PRICE_TYPES.map((v) => (
          <Check key={v} id={`${p}-price-${v}`} name="price" value={v} label={LABELS.price[v]} checked={params.prices.includes(v)} />
        ))}
      </Group>

      <Group legend="Experience">
        {DIFFICULTIES.map((v) => (
          <Check key={v} id={`${p}-difficulty-${v}`} name="difficulty" value={v} label={LABELS.difficulty[v]} checked={params.difficulties.includes(v)} />
        ))}
      </Group>

      {options.terms.map(({ kind, values }) => (
        <Group key={kind} legend={LABELS.taxonomy[kind]}>
          {values.map((t) => (
            <Check key={t.id} id={`${p}-${kind}-${t.slug}`} name={kind} value={t.slug} label={t.name} checked={params.terms[kind]?.includes(t.slug) ?? false} />
          ))}
        </Group>
      ))}

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary flex-1">
          Apply filters
        </button>
        <Link href={`${basePath}${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`} className="btn btn-ghost">
          Clear
        </Link>
      </div>
    </form>
  );
}
