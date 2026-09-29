import { ActionForm } from "@/components/admin/action-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { CheckboxField, TextField } from "@/components/admin/fields";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireRolePage } from "@/lib/auth";
import { adminListNavItems } from "@/services/admin-site";
import { deleteNavItemAction, saveNavItemAction } from "../site-actions";

export const metadata = { title: "Navigation" };

const ROW = "grid items-end gap-3 md:grid-cols-[1fr_1.4fr_6rem_auto]";

export default async function NavigationPage() {
  await requireRolePage("admin", "/admin/navigation");
  const items = await adminListNavItems();

  return (
    <div>
      <AdminPageHeader
        title="Navigation"
        description="Header links. Use site paths such as /resources, /category/<slug>, /type/<slug> or /submit."
      />
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="card p-4">
            <ActionForm action={saveNavItemAction} className="space-y-3">
              <input type="hidden" name="id" value={item.id} />
              <div className={ROW}>
                <TextField name="label" label="Label" required idSuffix={item.id} defaultValue={item.label} />
                <TextField name="href" label="Link" required idSuffix={item.id} defaultValue={item.href} />
                <TextField name="position" label="Order" type="number" idSuffix={item.id} defaultValue={String(item.position)} />
              </div>
              <div className="flex flex-wrap gap-6">
                <CheckboxField name="enabled" label="Visible" idSuffix={item.id} defaultChecked={item.enabled} />
                <CheckboxField name="highlight" label="Highlight as button" idSuffix={item.id} defaultChecked={item.highlight} />
              </div>
            </ActionForm>
            <div className="mt-1">
              <ConfirmButton action={deleteNavItemAction} hidden={{ id: item.id }} label="Delete" confirmMessage={`Remove “${item.label}” from navigation?`} />
            </div>
          </div>
        ))}
        <div className="card border-dashed p-4">
          <h2 className="mb-2 text-sm font-semibold">Add link</h2>
          <ActionForm action={saveNavItemAction} submitLabel="Add" className={ROW}>
            <TextField name="label" label="Label" required idSuffix="new" />
            <TextField name="href" label="Link" required idSuffix="new" placeholder="/category/..." />
            <TextField name="position" label="Order" type="number" idSuffix="new" defaultValue={String((items.at(-1)?.position ?? 0) + 10)} />
            <input type="hidden" name="enabled" value="on" />
          </ActionForm>
        </div>
      </div>
    </div>
  );
}
