/** Headline number: label, value, and an optional plain-language definition. */
export function StatTile({ label, value, note, href }: { label: string; value: string | number; note?: string; href?: string }) {
  const body = (
    <>
      <span className="block text-sm text-ink-muted">{label}</span>
      <span className="mt-1 block text-3xl font-semibold tabular-nums text-ink">{typeof value === "number" ? value.toLocaleString("en-GB") : value}</span>
      {note && <span className="mt-1 block text-xs text-ink-subtle">{note}</span>}
    </>
  );
  return href ? (
    <a href={href} className="card block p-4 hover:border-line-strong">
      {body}
    </a>
  ) : (
    <div className="card p-4">{body}</div>
  );
}

export function PeriodNav({ basePath, days }: { basePath: string; days: number }) {
  return (
    <nav aria-label="Time period" className="flex gap-1 text-sm">
      {[7, 30, 90].map((d) => (
        <a
          key={d}
          href={`${basePath}?days=${d}`}
          aria-current={days === d ? "page" : undefined}
          className={`rounded-lg px-3 py-1.5 ${days === d ? "bg-accent-soft font-semibold text-accent" : "text-ink-muted hover:bg-surface-muted"}`}
        >
          {d} days
        </a>
      ))}
    </nav>
  );
}

export function parseDays(value: unknown, fallback = 30): number {
  const n = Number(value);
  return [7, 30, 90].includes(n) ? n : fallback;
}
