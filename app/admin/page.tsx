import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { adminStatusCounts } from "@/services/admin-resources";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const counts = await adminStatusCounts();
  const tiles = [
    { label: "Total resources", value: counts.total, href: "/admin/resources" },
    { label: "Published", value: counts.published, href: "/admin/resources?status=published" },
    { label: "Drafts", value: counts.draft, href: "/admin/resources?status=draft" },
    { label: "In review", value: counts.in_review, href: "/admin/resources?status=in_review" },
    { label: "Broken links", value: counts.broken_link, href: "/admin/resources?status=broken_link" },
    { label: "Needs review", value: counts.needs_review, href: "/admin/resources?status=needs_review" },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        actions={
          <Link href="/admin/resources/new" className="btn btn-primary">
            Add resource
          </Link>
        }
      />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className="card block p-4 hover:border-line-strong">
              <span className="block text-sm text-ink-muted">{t.label}</span>
              <span className="mt-1 block text-3xl font-semibold tabular-nums">{t.value}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
