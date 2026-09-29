import { ActionForm } from "@/components/admin/action-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { TextField } from "@/components/admin/fields";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireRolePage } from "@/lib/auth";
import { adminListTypes } from "@/services/taxonomy";
import { deleteTypeAction, saveTypeAction } from "../taxonomy-actions";

export const metadata = { title: "Resource types" };

const ROW = "grid items-end gap-3 md:grid-cols-[1fr_1fr_1fr_6rem_auto]";

export default async function TypesPage() {
  await requireRolePage("admin", "/admin/types");
  const types = await adminListTypes();

  return (
    <div>
      <AdminPageHeader
        title="Resource types"
        description="Template, Framework, Tool… Each type gets a public listing at /type/<slug>. Add new types any time."
      />
      <div className="space-y-3">
        {types.map((t) => (
          <div key={t.id} className="card p-4">
            <ActionForm action={saveTypeAction} className={ROW}>
              <input type="hidden" name="id" value={t.id} />
              <TextField name="name" label="Name" required idSuffix={t.id} defaultValue={t.name} />
              <TextField name="plural_name" label="Plural" required idSuffix={t.id} defaultValue={t.plural_name} />
              <TextField name="slug" label="Slug" idSuffix={t.id} defaultValue={t.slug} />
              <TextField name="display_order" label="Order" type="number" idSuffix={t.id} defaultValue={String(t.display_order)} />
            </ActionForm>
            <div className="mt-2">
              <ConfirmButton
                action={deleteTypeAction}
                hidden={{ id: t.id }}
                label="Delete"
                confirmMessage={`Delete the “${t.name}” type? Resources keep existing but lose this type.`}
              />
            </div>
          </div>
        ))}
        <div className="card border-dashed p-4">
          <h2 className="mb-2 text-sm font-semibold">Add resource type</h2>
          <ActionForm action={saveTypeAction} submitLabel="Add" className={ROW}>
            <TextField name="name" label="Name" required idSuffix="new" placeholder="Playbook" />
            <TextField name="plural_name" label="Plural" required idSuffix="new" placeholder="Playbooks" />
            <TextField name="slug" label="Slug" idSuffix="new" hint="Optional" />
            <TextField name="display_order" label="Order" type="number" idSuffix="new" defaultValue="0" />
          </ActionForm>
        </div>
      </div>
    </div>
  );
}
