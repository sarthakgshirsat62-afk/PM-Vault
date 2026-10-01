import { requireRolePage } from "@/lib/auth";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { adminListResources, adminStatusCounts } from "@/services/admin-resources";
import { LABELS, RESOURCE_STATUSES, type ResourceStatus } from "@/types/domain";
import { bulkStatusAction } from "./actions";

export const metadata = { title: "Resources" };

const PAGE_SIZE = 50;

export default async function AdminResourcesPage(props: PageProps<"/admin/resources">) {
  await requireRolePage("editor", "/admin/resources");
  const sp = await props.searchParams;
  const statusParam = typeof sp.status === "string" ? sp.status : "";
  const status = (RESOURCE_STATUSES as readonly string[]).includes(statusParam) ? (statusParam as ResourceStatus) : null;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
  const page = Math.max(1, Number.parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);

  const [{ rows, total }, counts] = await Promise.all([
    adminListResources({ status, q, page, pageSize: PAGE_SIZE }),
    adminStatusCounts(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (overrides: Record<string, string | number | null>) => {
    const params = new URLSearchParams();
    const merged = { status: status ?? "", q, page: String(page), ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v !== null && v !== "" && !(k === "page" && v === "1")) params.set(k, String(v));
    const s = params.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div>
      <AdminPageHeader
        title="Resources"
        description="Create, edit, publish and unpublish resources. Changes go live immediately — no deployment."
        actions={
          <>
            <Link href="/admin/import" className="btn btn-secondary">
              Import CSV / JSON
            </Link>
            <Link href="/admin/resources/new" className="btn btn-primary">
              Add resource
            </Link>
          </>
        }
      />

      {sp.deleted && (
        <p role="status" className="mb-4 rounded-lg border border-success/30 bg-success-soft p-3 text-sm text-success">
          Resource deleted.
        </p>
      )}

      <nav aria-label="Filter by status" className="mb-4 flex flex-wrap gap-2">
        <Link href={`/admin/resources${qs({ status: null, page: null })}`} className={`badge ${!status ? "bg-accent-soft text-accent" : ""}`} aria-current={!status ? "page" : undefined}>
          All ({counts.total})
        </Link>
        {RESOURCE_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/resources${qs({ status: s, page: null })}`}
            className={`badge ${status === s ? "bg-accent-soft text-accent" : ""}`}
            aria-current={status === s ? "page" : undefined}
          >
            {LABELS.status[s]} ({counts[s]})
          </Link>
        ))}
      </nav>

      <form className="mb-4 flex max-w-md gap-2" role="search">
        {status && <input type="hidden" name="status" value={status} />}
        <label htmlFor="admin-q" className="sr-only">
          Search resources
        </label>
        <input id="admin-q" name="q" defaultValue={q} className="input" placeholder="Search by title or URL" />
        <button className="btn btn-secondary" type="submit">
          Search
        </button>
      </form>

      {rows.length === 0 ? (
        <p className="card p-6 text-sm text-ink-muted">No resources match.</p>
      ) : (
        <form action={bulkStatusAction}>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <label htmlFor="bulk-status" className="font-medium">
              With selected:
            </label>
            <select id="bulk-status" name="status" className="input w-auto" defaultValue="published">
              {RESOURCE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  Set to {LABELS.status[s]}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-secondary btn-sm">
              Apply
            </button>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Resources</caption>
              <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-subtle">
                <tr>
                  <th scope="col" className="w-10 p-3">
                    <span className="sr-only">Select</span>
                  </th>
                  <th scope="col" className="p-3">Title</th>
                  <th scope="col" className="p-3">Status</th>
                  <th scope="col" className="p-3">Category</th>
                  <th scope="col" className="p-3">Type</th>
                  <th scope="col" className="p-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="p-3">
                      <input type="checkbox" name="ids" value={r.id} aria-label={`Select ${r.title}`} className="h-4 w-4" />
                    </td>
                    <td className="p-3">
                      <Link href={`/admin/resources/${r.id}`} className="font-medium hover:underline">
                        {r.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {r.featured && <span className="badge">Featured</span>}
                        {r.editors_pick && <span className="badge bg-pick-soft text-pick">Editor&apos;s Pick</span>}
                        {r.sponsored && <span className="badge bg-sponsored-soft text-sponsored">Sponsored</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`badge ${r.status === "published" ? "bg-success-soft text-success" : ""}`}>{LABELS.status[r.status]}</span>
                    </td>
                    <td className="p-3 text-ink-muted">{r.category?.name ?? "—"}</td>
                    <td className="p-3 text-ink-muted">{r.type?.name ?? "—"}</td>
                    <td className="p-3 text-ink-muted">
                      <time dateTime={r.updated_at}>{new Date(r.updated_at).toLocaleDateString("en-GB")}</time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex items-center gap-3 text-sm">
          {page > 1 && (
            <Link className="btn btn-secondary btn-sm" href={`/admin/resources${qs({ page: page - 1 })}`}>
              Previous
            </Link>
          )}
          <span>
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link className="btn btn-secondary btn-sm" href={`/admin/resources${qs({ page: page + 1 })}`}>
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
