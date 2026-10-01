import { ActionForm } from "@/components/admin/action-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { SelectField, TextField } from "@/components/admin/fields";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireRolePage } from "@/lib/auth";
import { adminListTerms } from "@/services/taxonomy";
import { LABELS, TAXONOMY_KINDS } from "@/types/domain";
import { deleteTermAction, saveTermAction } from "../taxonomy-actions";

export const metadata = { title: "Filters" };

const ROW = "grid items-end gap-3 sm:grid-cols-[1fr_1fr_6rem_auto]";

export default async function FiltersPage() {
  await requireRolePage("admin", "/admin/filters");
  const terms = await adminListTerms();

  return (
    <div>
      <AdminPageHeader
        title="Filters"
        description="Values for the public filters (career level, product type, stage, format, persona…). Add or rename values without code."
      />
      <div className="card mb-6 border-dashed p-4">
        <h2 className="mb-2 text-sm font-semibold">Add filter value</h2>
        <ActionForm action={saveTermAction} submitLabel="Add" className="grid items-end gap-3 sm:grid-cols-[12rem_1fr_1fr_6rem_auto]">
          <SelectField
            name="kind"
            label="Dimension"
            required
            idSuffix="new"
            options={TAXONOMY_KINDS.map((k) => ({ value: k, label: LABELS.taxonomy[k] }))}
          />
          <TextField name="name" label="Name" required idSuffix="new" />
          <TextField name="slug" label="Slug" idSuffix="new" hint="Optional" />
          <TextField name="display_order" label="Order" type="number" idSuffix="new" defaultValue="0" />
        </ActionForm>
      </div>

      <div className="space-y-8">
        {TAXONOMY_KINDS.map((kind) => {
          const list = terms.filter((t) => t.kind === kind);
          return (
            <section key={kind} aria-labelledby={`kind-${kind}`}>
              <h2 id={`kind-${kind}`} className="mb-2 text-lg font-semibold">
                {LABELS.taxonomy[kind]} <span className="text-sm font-normal text-ink-subtle">?{kind}=&lt;slug&gt;</span>
              </h2>
              {list.length === 0 ? (
                <p className="text-sm text-ink-subtle">No values yet.</p>
              ) : (
                <ul className="space-y-2">
                  {list.map((t) => (
                    <li key={t.id} className="card p-3">
                      <ActionForm action={saveTermAction} className={ROW}>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="kind" value={t.kind} />
                        <TextField name="name" label="Name" required idSuffix={t.id} defaultValue={t.name} />
                        <TextField name="slug" label="Slug" idSuffix={t.id} defaultValue={t.slug} />
                        <TextField name="display_order" label="Order" type="number" idSuffix={t.id} defaultValue={String(t.display_order)} />
                      </ActionForm>
                      <div className="mt-1">
                        <ConfirmButton
                          action={deleteTermAction}
                          hidden={{ id: t.id }}
                          label="Delete"
                          confirmMessage={`Delete “${t.name}”? It will be removed from all resources.`}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
