import { ActionForm } from "@/components/admin/action-form";
import { CheckboxField, Fieldset, TextArea, TextField } from "@/components/admin/fields";
import { savePageAction } from "@/app/admin/site-actions";
import type { Page } from "@/types/domain";

export function PageForm({ page }: { page?: Page | null }) {
  return (
    <ActionForm action={savePageAction} submitLabel={page ? "Save page" : "Create page"}>
      {page && <input type="hidden" name="id" value={page.id} />}
      <Fieldset legend="Page">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="title" label="Title" required maxLength={120} defaultValue={page?.title} />
          <TextField name="slug" label="Slug" maxLength={100} defaultValue={page?.slug} hint="Public URL: /p/<slug>" />
        </div>
        <TextArea
          name="body"
          label="Body"
          rows={14}
          defaultValue={page?.body}
          hint="Plain text. Leave a blank line between paragraphs. Legal pages (privacy, terms) must be reviewed by a qualified person before publishing."
        />
        <TextArea name="meta_description" label="Meta description" rows={2} maxLength={300} defaultValue={page?.meta_description} />
        <div className="flex flex-wrap gap-6">
          <CheckboxField name="published" label="Published" defaultChecked={page?.published} />
          <CheckboxField name="show_in_footer" label="Link in footer" defaultChecked={page?.show_in_footer} />
        </div>
      </Fieldset>
    </ActionForm>
  );
}
