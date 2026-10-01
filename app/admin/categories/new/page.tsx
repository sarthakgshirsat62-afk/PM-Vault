import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { requireRolePage } from "@/lib/auth";

export const metadata = { title: "Add category" };

export default async function NewCategoryPage() {
  await requireRolePage("admin", "/admin/categories/new");
  return (
    <div>
      <AdminPageHeader
        title="Add category"
        actions={
          <Link href="/admin/categories" className="btn btn-ghost">
            Back
          </Link>
        }
      />
      <CategoryForm />
    </div>
  );
}
