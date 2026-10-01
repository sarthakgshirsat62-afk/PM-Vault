import { requireRolePage } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResourceDetailView } from "@/components/public/resource-detail";
import { adminGetResource } from "@/services/admin-resources";
import { LABELS } from "@/types/domain";

export const metadata = { title: "Preview" };

export default async function PreviewResourcePage(props: PageProps<"/admin/resources/[id]/preview">) {
  await requireRolePage("editor", "/admin/resources");
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const resource = await adminGetResource(id);
  if (!resource) notFound();

  return (
    <div className="-mx-4 sm:-mx-6">
      <div role="status" className="mx-4 mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-pick/40 bg-pick-soft p-3 text-sm text-pick sm:mx-6">
        <span>
          <strong>Preview</strong> · status: {LABELS.status[resource.status]}. Similar resources appear once published.
        </span>
        <Link href={`/admin/resources/${id}`} className="font-semibold underline">
          Back to editor
        </Link>
      </div>
      <ResourceDetailView resource={resource} similar={[]} preview />
    </div>
  );
}
