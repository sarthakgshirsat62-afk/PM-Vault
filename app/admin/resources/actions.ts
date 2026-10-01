"use server";

import { redirect } from "next/navigation";
import { requireRole, ForbiddenError } from "@/lib/auth";
import { actionError, actionOk, type ActionState } from "@/lib/action-state";
import { resourceInputSchema } from "@/lib/validation/resource";
import { fieldErrors } from "@/lib/validation/fields";
import { revalidatePublicContent } from "@/lib/revalidate";
import { RESOURCE_STATUSES, type ResourceStatus } from "@/types/domain";
import {
  deleteResource, findDuplicateResources, saveResource, setResourceStatus, type DuplicateMatch,
} from "@/services/admin-resources";
import { ServiceError } from "@/services/db";

const INTENT_STATUS: Record<string, ResourceStatus> = {
  draft: "draft",
  review: "in_review",
  publish: "published",
  unpublish: "draft",
};

function formToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION")) continue;
    obj[key] = key === "term_ids" ? formData.getAll(key) : formData.get(key);
  }
  return obj;
}

function describe(e: unknown): string {
  if (e instanceof ForbiddenError) return "You don't have permission to do that.";
  if (e instanceof ServiceError) return e.message;
  return "Something went wrong. Please try again.";
}

export async function saveResourceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await requireRole("editor");
  } catch (e) {
    return actionError(describe(e));
  }

  const raw = formToObject(formData);
  const intent = String(formData.get("intent") ?? "");
  if (INTENT_STATUS[intent]) raw.status = INTENT_STATUS[intent];

  const parsed = resourceInputSchema.safeParse(raw);
  if (!parsed.success) return actionError("Please fix the highlighted fields.", fieldErrors(parsed.error));

  const id = typeof raw.id === "string" && raw.id ? raw.id : null;
  const confirmedDuplicate = raw.confirm_duplicate === "on";

  let saved: { id: string; slug: string };
  try {
    if (!confirmedDuplicate) {
      const dupes = await findDuplicateResources(parsed.data.external_url, id);
      if (dupes.length) {
        return actionError(
          "Possible duplicate: this URL already exists. Tick “Save anyway” below if this is intentional.",
          { external_url: dupes.map((d) => `“${d.title}” (${d.status})`).join(", ") },
          { duplicates: dupes },
        );
      }
    }
    saved = await saveResource(parsed.data, { id, userId: user.id });
  } catch (e) {
    return actionError(describe(e));
  }

  revalidatePublicContent();
  if (!id) redirect(`/admin/resources/${saved.id}?saved=1`);
  const label = parsed.data.status === "published" ? "Saved and published." : "Saved.";
  return actionOk(label, { slug: saved.slug });
}

/** Live "Possible duplicate" lookup while typing the URL. */
export async function checkDuplicateAction(url: string, excludeId: string | null): Promise<DuplicateMatch[]> {
  try {
    await requireRole("editor");
    if (typeof url !== "string" || url.length > 2000) return [];
    return await findDuplicateResources(url, excludeId);
  } catch {
    return [];
  }
}

export async function bulkStatusAction(formData: FormData): Promise<void> {
  const user = await requireRole("editor");
  const status = String(formData.get("status") ?? "");
  if (!(RESOURCE_STATUSES as readonly string[]).includes(status)) return;
  const ids = formData
    .getAll("ids")
    .map(String)
    .filter((v) => /^[0-9a-f-]{36}$/i.test(v))
    .slice(0, 500);
  await setResourceStatus(ids, status as ResourceStatus, user.id);
  revalidatePublicContent();
}

export async function deleteResourceAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  await deleteResource(id);
  revalidatePublicContent();
  redirect("/admin/resources?deleted=1");
}
