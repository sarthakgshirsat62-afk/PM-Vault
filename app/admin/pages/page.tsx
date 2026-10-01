import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PageForm } from "@/components/admin/page-form";
import { requireRolePage } from "@/lib/auth";
import { adminListPages } from "@/services/admin-site";

export const metadata = { title: "Pages" };

export default async function PagesAdmin() {
  await requireRolePage("admin", "/admin/pages");
  const pages = await adminListPages();

  return (
    <div>
      <AdminPageHeader title="Pages" description="Simple content pages such as About and Privacy, served at /p/<slug>." />
      <ul className="mb-8 space-y-2">
        {pages.map((p) => (
          <li key={p.id} className="card flex flex-wrap items-center justify-between gap-2 p-3">
            <Link href={`/admin/pages/${p.id}`} className="font-medium hover:underline">
              {p.title}
            </Link>
            <span className="flex items-center gap-2 text-sm text-ink-muted">
              /p/{p.slug}
              <span className={`badge ${p.published ? "bg-success-soft text-success" : ""}`}>{p.published ? "Published" : "Draft"}</span>
            </span>
          </li>
        ))}
      </ul>
      <h2 className="mb-3 text-lg font-semibold">New page</h2>
      <PageForm />
    </div>
  );
}
