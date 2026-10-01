import { ActionForm } from "@/components/admin/action-form";
import { Fieldset, TextArea, TextField } from "@/components/admin/fields";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireRolePage } from "@/lib/auth";
import { adminGetSettings } from "@/services/admin-site";
import { saveSettingsAction } from "../site-actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireRolePage("admin", "/admin/settings");
  const s = await adminGetSettings();

  return (
    <div>
      <AdminPageHeader title="Settings" description="Site-wide name and SEO defaults." />
      <ActionForm action={saveSettingsAction} submitLabel="Save settings">
        <Fieldset legend="Brand">
          <TextField name="site_name" label="Site name" required maxLength={60} defaultValue={s.site_name} />
          <TextField name="tagline" label="Tagline" maxLength={160} defaultValue={s.tagline} />
          <TextArea name="footer_text" label="Footer note" rows={2} maxLength={500} defaultValue={s.footer_text} />
        </Fieldset>
        <Fieldset legend="SEO defaults">
          <TextArea
            name="default_meta_description"
            label="Default meta description"
            rows={2}
            maxLength={300}
            defaultValue={s.default_meta_description}
          />
          <ImageUploadField name="default_og_image_url" label="Default social share image" defaultValue={s.default_og_image_url} folder="og" />
        </Fieldset>
      </ActionForm>
      <p className="mt-6 text-sm text-ink-muted">
        User roles are changed by a super admin in the Supabase SQL editor (see docs/SETUP.md). A roles screen arrives with member accounts in P1.
      </p>
    </div>
  );
}
