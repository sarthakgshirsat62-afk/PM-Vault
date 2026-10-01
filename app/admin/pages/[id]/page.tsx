import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PageForm } from "@/components/admin/page-form";
import { requireRolePage } from "@/lib/auth";
import { adminGetPage } from "@/services/admin-site";
import { deletePageAction } from "../../site-actions";

export const metadata = { title: "Edit page" };

export default async function EditPageAdmin(props: PageProps<"/admin/pages/[id]">) {
  const { id } = await props.params;
  await requireRolePage("admin", `/admin/pages/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const page = await adminGetPage(id);
  if (!page) notFound();

  return (
    <div>
      <AdminPageHeader
        title={page.title}
        actions={
          <>
            {page.published && (
              <Link href={`/p/${page.slug}`} className="btn btn-secondary">
                View page
              </Link>
            )}
            <Link href="/admin/pages" className="btn btn-ghost">
              Back
            </Link>
          </>
        }
      />
      <PageForm page={page} />
      <div className="mt-8">
        <ConfirmButton
          action={deletePageAction}
          hidden={{ id }}
          label="Delete page"
          confirmMessage={`Delete “${page.title}”?`}
          className="btn btn-danger btn-sm"
        />
      </div>
    </div>
  );
}
