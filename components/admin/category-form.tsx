import { ActionForm } from "@/components/admin/action-form";
import { CheckboxField, Fieldset, TextArea, TextField } from "@/components/admin/fields";
import { saveCategoryAction } from "@/app/admin/taxonomy-actions";
import type { Category } from "@/types/domain";

export function CategoryForm({ category }: { category?: Category | null }) {
  const c = category;
  return (
    <ActionForm action={saveCategoryAction} submitLabel={c ? "Save category" : "Create category"}>
      {c && <input type="hidden" name="id" value={c.id} />}
      <Fieldset legend="Category">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="name" label="Name" required maxLength={80} defaultValue={c?.name} />
          <TextField name="slug" label="URL slug" maxLength={100} defaultValue={c?.slug} hint="Blank = generated from the name. Public URL: /category/<slug>" />
        </div>
        <TextField name="description" label="Short description" maxLength={300} defaultValue={c?.description} hint="Shown on category cards." />
        <TextArea
          name="editorial_intro"
          label="Editorial introduction"
          rows={6}
          maxLength={5000}
          defaultValue={c?.editorial_intro}
          hint="Guidance shown at the top of the category page — how to choose between resources here. Blank lines separate paragraphs."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="display_order" label="Display order" type="number" defaultValue={String(c?.display_order ?? 0)} hint="Lower numbers appear first." />
          <TextField name="icon" label="Icon keyword (optional)" maxLength={40} defaultValue={c?.icon} />
        </div>
        <CheckboxField name="is_published" label="Published" defaultChecked={c?.is_published ?? true} hint="Unpublished categories are hidden from visitors." />
      </Fieldset>
      <Fieldset legend="SEO">
        <TextField name="seo_title" label="SEO title" maxLength={120} defaultValue={c?.seo_title} hint="e.g. “Best PRD Templates for Product Managers”" />
        <TextArea name="meta_description" label="Meta description" rows={2} maxLength={300} defaultValue={c?.meta_description} />
      </Fieldset>
    </ActionForm>
  );
}
