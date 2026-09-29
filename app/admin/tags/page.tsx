import { ActionForm } from "@/components/admin/action-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { TextField } from "@/components/admin/fields";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getSessionUser } from "@/lib/auth";
import { hasRole } from "@/lib/roles";
import { adminListTags } from "@/services/taxonomy";
import { deleteTagAction, saveTagAction } from "../taxonomy-actions";

export const metadata = { title: "Tags" };

const ROW = "grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]";

export default async function TagsPage() {
  const [tags, user] = await Promise.all([adminListTags(), getSessionUser()]);
  const canDelete = hasRole(user?.role, "admin");

  return (
    <div>
      <AdminPageHeader
        title="Tags"
        description="Tags feed search and “similar resources”. Tags are also created automatically from the resource form."
      />
      <div className="card mb-4 border-dashed p-4">
        <h2 className="mb-2 text-sm font-semibold">Add tag</h2>
        <ActionForm action={saveTagAction} submitLabel="Add" className={ROW}>
          <TextField name="name" label="Name" required idSuffix="new" />
          <TextField name="slug" label="Slug" idSuffix="new" hint="Optional" />
        </ActionForm>
      </div>
      <ul className="space-y-2">
        {tags.map((t) => (
          <li key={t.id} className="card p-3">
            <ActionForm action={saveTagAction} className={ROW}>
              <input type="hidden" name="id" value={t.id} />
              <TextField name="name" label={`Name (${t.usage} resource${t.usage === 1 ? "" : "s"})`} required idSuffix={t.id} defaultValue={t.name} />
              <TextField name="slug" label="Slug" idSuffix={t.id} defaultValue={t.slug} />
            </ActionForm>
            {canDelete && (
              <div className="mt-1">
                <ConfirmButton
                  action={deleteTagAction}
                  hidden={{ id: t.id }}
                  label="Delete"
                  confirmMessage={`Delete tag “${t.name}”? It will be removed from ${t.usage} resource(s).`}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
