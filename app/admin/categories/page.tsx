import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireRolePage } from "@/lib/auth";
import { adminListCategories, adminListSubcategories } from "@/services/taxonomy";

export const metadata = { title: "Categories" };

export default async function CategoriesPage(props: PageProps<"/admin/categories">) {
  await requireRolePage("admin", "/admin/categories");
  const sp = await props.searchParams;
  const [categories, subcategories] = await Promise.all([adminListCategories(), adminListSubcategories()]);

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Every category gets its own public page at /category/<slug> automatically."
        actions={
          <Link href="/admin/categories/new" className="btn btn-primary">
            Add category
          </Link>
        }
      />
      {sp.deleted && (
        <p role="status" className="mb-4 rounded-lg border border-success/30 bg-success-soft p-3 text-sm text-success">
          Category deleted. Its resources are now uncategorised.
        </p>
      )}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <caption className="sr-only">Categories</caption>
          <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-subtle">
            <tr>
              <th scope="col" className="p-3">Order</th>
              <th scope="col" className="p-3">Name</th>
              <th scope="col" className="p-3">Public URL</th>
              <th scope="col" className="p-3">Subcategories</th>
              <th scope="col" className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="p-3 text-ink-muted">{c.display_order}</td>
                <td className="p-3">
                  <Link href={`/admin/categories/${c.id}`} className="font-medium hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="p-3">
                  <Link href={`/category/${c.slug}`} className="text-accent hover:underline">
                    /category/{c.slug}
                  </Link>
                </td>
                <td className="p-3 text-ink-muted">{subcategories.filter((s) => s.category_id === c.id).length}</td>
                <td className="p-3">
                  <span className={`badge ${c.is_published ? "bg-success-soft text-success" : ""}`}>{c.is_published ? "Published" : "Hidden"}</span>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-ink-muted">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
