import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PeriodNav, StatTile, parseDays } from "@/components/admin/stat-tile";
import { requireRolePage } from "@/lib/auth";
import { getMetrics, getSearchInsights, getTopResources, pct } from "@/services/admin-analytics";

export const metadata = { title: "Analytics" };

function Table({ caption, headers, children, empty }: { caption: string; headers: string[]; children: React.ReactNode; empty: boolean }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <caption className="p-4 text-left font-semibold">{caption}</caption>
        <thead className="border-y border-line text-xs uppercase tracking-wide text-ink-subtle">
          <tr>
            {headers.map((h, i) => (
              <th key={h} scope="col" className={`p-3 ${i > 0 ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {empty ? (
            <tr>
              <td colSpan={headers.length} className="p-4 text-ink-subtle">
                No data for this period yet.
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

const num = "p-3 text-right tabular-nums";

export default async function AnalyticsPage(props: PageProps<"/admin/analytics">) {
  await requireRolePage("admin", "/admin/analytics");
  const days = parseDays((await props.searchParams).days);
  const [m, insights, top] = await Promise.all([getMetrics(days), getSearchInsights(days), getTopResources(days, 15)]);

  const gaps = insights.filter((q) => q.zero_result_searches > 0).sort((a, b) => b.zero_result_searches - a.zero_result_searches);
  const lowCtr = insights.filter((q) => q.zero_result_searches === 0 && q.searches >= 3 && q.ctr < 0.3).sort((a, b) => a.ctr - b.ctr);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Analytics"
        description="First-party, cookie-free measurement. Bots are filtered; no IPs or personal data are stored."
        actions={<PeriodNav basePath="/admin/analytics" days={days} />}
      />

      <section aria-labelledby="kpis">
        <h2 id="kpis" className="sr-only">
          Key metrics
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <li>
            <StatTile label="Useful discoveries (North Star)" value={m.useful_discoveries} note="Outbound opens after reading a resource page. Saves and ‘useful’ votes join in P1/P2." />
          </li>
          <li>
            <StatTile label="Resource page views" value={m.views} />
          </li>
          <li>
            <StatTile label="Outbound clicks" value={m.clicks} note={`Outbound CTR ${pct(m.clicks, m.views)} of page views`} />
          </li>
          <li>
            <StatTile label="Searches" value={m.searches} />
          </li>
          <li>
            <StatTile label="Discovery success rate" value={pct(m.searches_with_click, m.searches)} note="Searches where a result was opened" />
          </li>
          <li>
            <StatTile label="Zero-result searches" value={m.zero_result_searches} note={`${pct(m.zero_result_searches, m.searches)} of searches`} />
          </li>
        </ul>
      </section>

      <Table caption="Content gaps — searches with no results" headers={["Query", "Searches", "No results"]} empty={gaps.length === 0}>
        {gaps.slice(0, 25).map((q) => (
          <tr key={q.normalized_query} className="border-b border-line last:border-0">
            <td className="p-3">
              <Link href={`/resources?q=${encodeURIComponent(q.normalized_query)}`} className="hover:underline">
                {q.normalized_query}
              </Link>
            </td>
            <td className={num}>{q.searches}</td>
            <td className={num}>{q.zero_result_searches}</td>
          </tr>
        ))}
      </Table>

      <Table caption="Top searches" headers={["Query", "Searches", "Result CTR", "Avg. results"]} empty={insights.length === 0}>
        {insights.slice(0, 25).map((q) => (
          <tr key={q.normalized_query} className="border-b border-line last:border-0">
            <td className="p-3">{q.normalized_query}</td>
            <td className={num}>{q.searches}</td>
            <td className={num}>{pct(q.clicks, q.searches)}</td>
            <td className={num}>{Math.round(q.avg_results * 10) / 10}</td>
          </tr>
        ))}
      </Table>

      <Table caption="Low-CTR searches — results exist but nobody opens them" headers={["Query", "Searches", "Result CTR"]} empty={lowCtr.length === 0}>
        {lowCtr.slice(0, 15).map((q) => (
          <tr key={q.normalized_query} className="border-b border-line last:border-0">
            <td className="p-3">{q.normalized_query}</td>
            <td className={num}>{q.searches}</td>
            <td className={num}>{pct(q.clicks, q.searches)}</td>
          </tr>
        ))}
      </Table>

      <Table caption="Top resources" headers={["Resource", "Views", "Outbound clicks", "CTR"]} empty={top.length === 0}>
        {top.map((r) => (
          <tr key={r.resource_id} className="border-b border-line last:border-0">
            <td className="p-3">
              <Link href={`/admin/resources/${r.resource_id}`} className="hover:underline">
                {r.title}
              </Link>
            </td>
            <td className={num}>{r.views}</td>
            <td className={num}>{r.clicks}</td>
            <td className={num}>{pct(r.clicks, r.views)}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
