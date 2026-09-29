import type { Metadata } from "next";
import Link from "next/link";
import { requireRolePage } from "@/lib/auth";
import { hasRole } from "@/lib/roles";
import { AdminNav, type AdminNavItem } from "@/components/admin/admin-nav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };

const EDITOR_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/resources", label: "Resources" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/import", label: "Import" },
  { href: "/admin/tags", label: "Tags" },
];

const ADMIN_ITEMS: AdminNavItem[] = [
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/types", label: "Resource types" },
  { href: "/admin/filters", label: "Filters" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/navigation", label: "Navigation" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireRolePage("editor", "/admin");
  const items = hasRole(user.role, "admin") ? [...EDITOR_ITEMS, ...ADMIN_ITEMS] : EDITOR_ITEMS;

  return (
    <div className="container-page py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <Link href="/admin" className="font-display text-xl font-semibold">
            PM Vault Admin
          </Link>
          <p className="text-xs text-ink-subtle">
            Signed in as {user.email} · <span className="capitalize">{user.role.replace("_", " ")}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="btn btn-secondary btn-sm">
            View site
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn btn-ghost btn-sm">
              Sign out
            </button>
          </form>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[13rem_1fr]">
        <aside>
          <AdminNav items={items} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
