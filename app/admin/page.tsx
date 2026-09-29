import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatTile } from "@/components/admin/stat-tile";
import { getSessionUser, requireRolePage } from "@/lib/auth";
import { hasRole } from "@/lib/roles";
import { adminStatusCounts } from "@/services/admin-resources";
import { getMetrics, getSearchInsights, getTopResources } from "@/services/admin-analytics";
import { adminSubmissionCounts } from "@/services/submissions";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  await requireRolePage("editor", "/admin");
  const user = await getSessionUser();
  const isAdmin = hasRole(user?.role, "admin");
  const [counts, submissions] = await Promise.all([adminStatusCounts(), adminSubmissionCounts()]);
  const [week, insights, top] = isAdmin
    ? await Promise.all([getMetrics(7), getSearchInsights(30, 50), getTopResources(30, 5)])
    : [null, [], []];
  const gaps = insights.filter((q) => q.zero_result_searches > 0).slice(0, 5);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        actions={
          <Link href="/admin/resources/new" className="btn btn-primary">
            Add resource
          </Link>
        }
      />

      <section aria-labelledby="content-heading">
        <h2 id="content-heading" className="mb-3 text-lg font-semibold">
          Content
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <li><StatTile label="Total resources" value={counts.total} href="/admin/resources" /></li>
          <li><StatTile label="Published" value={counts.published} href="/admin/resources?status=published" /></li>
          <li><StatTile label="Drafts" value={counts.draft} href="/admin/resources?status=draft" /></li>
          <li><StatTile label="Pending submissions" value={submissions.pending} href="/admin/submissions" /></li>
          <li><StatTile label="In review" value={counts.in_review} href="/admin/resources?status=in_review" /></li>
          <li><StatTile label="Broken links" value={counts.broken_link} href="/admin/resources?status=broken_link" /></li>
          <li><StatTile label="Needs review" value={counts.needs_review} href="/admin/resources?status=needs_review" /></li>
          <li><StatTile label="Archived" value={counts.archived} href="/admin/resources?status=archived" /></li>
        </ul>
      </section>

      {week && (
        <section aria-labelledby="week-heading">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="week-heading" className="text-lg font-semibold">
              Last 7 days
            </h2>
            <Link href="/admin/analytics" className="text-sm text-accent hover:underline">
              Full analytics →
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <li><StatTile label="Useful discoveries" value={week.useful_discoveries} note="North Star" /></li>
            <li><StatTile label="Resource views" value={week.views} /></li>
            <li><StatTile label="Outbound clicks" value={week.clicks} /></li>
            <li><StatTile label="Searches" value={week.searches} note={`${week.zero_result_searches} with no results`} /></li>
          </ul>
        </section>
      )}

      {isAdmin && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="gaps-heading" className="card p-5">
            <h2 id="gaps-heading" className="font-semibold">
              Content gaps (30 days)
            </h2>
            {gaps.length === 0 ? (
              <p className="mt-2 text-sm text-ink-subtle">No zero-result searches yet.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {gaps.map((g) => (
                  <li key={g.normalized_query} className="flex justify-between gap-2">
                    <span>{g.normalized_query}</span>
                    <span className="tabular-nums text-ink-muted">{g.zero_result_searches}×</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section aria-labelledby="top-heading" className="card p-5">
            <h2 id="top-heading" className="font-semibold">
              Top resources (30 days)
            </h2>
            {top.length === 0 ? (
              <p className="mt-2 text-sm text-ink-subtle">No activity yet.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {top.map((r) => (
                  <li key={r.resource_id} className="flex justify-between gap-2">
                    <Link href={`/admin/resources/${r.resource_id}`} className="truncate hover:underline">
                      {r.title}
                    </Link>
                    <span className="shrink-0 tabular-nums text-ink-muted">{r.clicks} clicks</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
