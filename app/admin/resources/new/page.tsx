import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ResourceForm } from "@/components/admin/resource-form";
import { adminListCategories, adminListSubcategories, adminListTerms, adminListTypes } from "@/services/taxonomy";

export const metadata = { title: "Add resource" };

export default async function NewResourcePage() {
  const [categories, subcategories, types, terms] = await Promise.all([
    adminListCategories(),
    adminListSubcategories(),
    adminListTypes(),
    adminListTerms(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Add resource"
        description="New resources start as drafts. Nothing is public until you publish."
        actions={
          <Link href="/admin/resources" className="btn btn-ghost">
            Back to resources
          </Link>
        }
      />
      <ResourceForm categories={categories} subcategories={subcategories} types={types} terms={terms} />
    </div>
  );
}
