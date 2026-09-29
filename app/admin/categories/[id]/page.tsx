import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/admin/action-form";
import { CategoryForm } from "@/components/admin/category-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { TextField } from "@/components/admin/fields";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireRolePage } from "@/lib/auth";
import { adminGetCategory, adminListSubcategories } from "@/services/taxonomy";
import { deleteCategoryAction, deleteSubcategoryAction, saveSubcategoryAction } from "../../taxonomy-actions";

export const metadata = { title: "Edit category" };

export default async function EditCategoryPage(props: PageProps<"/admin/categories/[id]">) {
  const { id } = await props.params;
  await requireRolePage("admin", `/admin/categories/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const sp = await props.searchParams;
  const [category, allSubs] = await Promise.all([adminGetCategory(id), adminListSubcategories()]);
  if (!category) notFound();
  const subs = allSubs.filter((s) => s.category_id === id);

  return (
    <div>
      <AdminPageHeader
        title={category.name}
        description={`Public page: /category/${category.slug}`}
        actions={
          <>
            <Link href={`/category/${category.slug}`} className="btn btn-secondary">
              View page
            </Link>
            <Link href="/admin/categories" className="btn btn-ghost">
              Back
            </Link>
          </>
        }
      />
      {sp.created && (
        <p role="status" className="mb-4 rounded-lg border border-success/30 bg-success-soft p-3 text-sm text-success">
          Category created. Its public page is live.
        </p>
      )}
      <CategoryForm category={category} />

      <section className="mt-10" aria-labelledby="subs-heading">
        <h2 id="subs-heading" className="text-lg font-semibold">
          Subcategories
        </h2>
        <p className="mb-4 text-sm text-ink-muted">
          Shown as filter chips on the category page (/category/{category.slug}?sub=&lt;slug&gt;).
        </p>
        <div className="space-y-3">
          {subs.map((s) => (
            <div key={s.id} className="card p-4">
              <ActionForm action={saveSubcategoryAction} submitLabel="Save" className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_7rem_auto]">
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="category_id" value={id} />
                <TextField name="name" label="Name" required idSuffix={s.id} defaultValue={s.name} />
                <TextField name="slug" label="Slug" idSuffix={s.id} defaultValue={s.slug} />
                <TextField name="display_order" label="Order" type="number" idSuffix={s.id} defaultValue={String(s.display_order)} />
              </ActionForm>
              <div className="mt-2">
                <ConfirmButton
                  action={deleteSubcategoryAction}
                  hidden={{ id: s.id, category_id: id }}
                  label="Delete subcategory"
                  confirmMessage={`Delete “${s.name}”? Resources keep their category.`}
                />
              </div>
            </div>
          ))}
          <div className="card border-dashed p-4">
            <h3 className="mb-2 text-sm font-semibold">Add subcategory</h3>
            <ActionForm action={saveSubcategoryAction} submitLabel="Add" className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_7rem_auto]">
              <input type="hidden" name="category_id" value={id} />
              <TextField name="name" label="Name" required idSuffix="new" />
              <TextField name="slug" label="Slug" hint="Optional" idSuffix="new" />
              <TextField name="display_order" label="Order" type="number" idSuffix="new" defaultValue="0" />
            </ActionForm>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-lg border border-danger/30 p-4" aria-labelledby="danger">
        <h2 id="danger" className="font-semibold text-danger">
          Danger zone
        </h2>
        <p className="mb-3 text-sm text-ink-muted">Deleting removes the public page. Resources stay, but become uncategorised.</p>
        <ConfirmButton
          action={deleteCategoryAction}
          hidden={{ id }}
          label="Delete category"
          confirmMessage={`Delete the “${category.name}” category and its subcategories?`}
          className="btn btn-danger btn-sm"
        />
      </section>
    </div>
  );
}
