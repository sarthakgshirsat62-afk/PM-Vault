import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ResourceForm } from "@/components/admin/resource-form";
import { getSessionUser, requireRolePage } from "@/lib/auth";
import { hasRole } from "@/lib/roles";
import { adminGetResource, listRevisions } from "@/services/admin-resources";
import { adminListCategories, adminListSubcategories, adminListTerms, adminListTypes } from "@/services/taxonomy";
import { LABELS } from "@/types/domain";
import { deleteResourceAction } from "../actions";

export const metadata = { title: "Edit resource" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditResourcePage(props: PageProps<"/admin/resources/[id]">) {
  await requireRolePage("editor", "/admin/resources");
  const { id } = await props.params;
  const sp = await props.searchParams;
  if (!UUID.test(id)) notFound();

  const [resource, categories, subcategories, types, terms, revisions, user] = await Promise.all([
    adminGetResource(id),
    adminListCategories(),
    adminListSubcategories(),
    adminListTypes(),
    adminListTerms(),
    listRevisions(id),
    getSessionUser(),
  ]);
  if (!resource) notFound();

  return (
    <div>
      <AdminPageHeader
        title={resource.title}
        description={`Status: ${LABELS.status[resource.status]} · Last updated ${new Date(resource.updated_at).toLocaleString("en-GB")}`}
        actions={
          <>
            <Link href={`/admin/resources/${id}/preview`} className="btn btn-secondary">
              Preview
            </Link>
            {resource.status === "published" && (
              <Link href={`/resource/${resource.slug}`} className="btn btn-secondary">
                View live
              </Link>
            )}
          </>
        }
      />

      {sp.saved && (
        <p role="status" className="mb-4 rounded-lg border border-success/30 bg-success-soft p-3 text-sm text-success">
          Resource created.
        </p>
      )}

      <ResourceForm resource={resource} categories={categories} subcategories={subcategories} types={types} terms={terms} />

      <section className="mt-10" aria-labelledby="history-heading">
        <h2 id="history-heading" className="text-lg font-semibold">
          Version history
        </h2>
        <p className="text-sm text-ink-muted">
          Created {new Date(resource.created_at).toLocaleString("en-GB")}. Each save stores the previous version.
        </p>
        {revisions.length === 0 ? (
          <p className="mt-3 text-sm text-ink-subtle">No earlier versions yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {revisions.map((rev) => (
              <li key={rev.id} className="card p-3 text-sm">
                <details>
                  <summary className="cursor-pointer">
                    <time dateTime={rev.created_at}>{new Date(rev.created_at).toLocaleString("en-GB")}</time>
                    {rev.changed_by_email ? ` — ${rev.changed_by_email}` : ""} · was “{String(rev.snapshot.title ?? "")}” (
                    {String(rev.snapshot.status ?? "")})
                  </summary>
                  <pre className="mt-2 max-h-80 overflow-auto rounded bg-surface-muted p-3 text-xs">{JSON.stringify(rev.snapshot, null, 2)}</pre>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      {user && hasRole(user.role, "admin") && (
        <section className="mt-10 rounded-lg border border-danger/30 p-4" aria-labelledby="danger-heading">
          <h2 id="danger-heading" className="font-semibold text-danger">
            Danger zone
          </h2>
          <p className="mb-3 text-sm text-ink-muted">Deleting is permanent. Prefer Unpublish or Archive to keep history.</p>
          <ConfirmButton
            action={deleteResourceAction}
            hidden={{ id }}
            label="Delete resource"
            confirmMessage={`Permanently delete “${resource.title}”? This cannot be undone.`}
            className="btn btn-danger btn-sm"
          />
        </section>
      )}
    </div>
  );
}
