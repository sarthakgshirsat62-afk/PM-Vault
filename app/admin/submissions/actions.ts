"use server";

import { redirect } from "next/navigation";
import { requireRole, ForbiddenError } from "@/lib/auth";
import { actionError, actionOk, type ActionState } from "@/lib/action-state";
import { cleanText } from "@/lib/validation/fields";
import { revalidatePublicContent } from "@/lib/revalidate";
import { approveSubmission, rejectSubmission } from "@/services/submissions";
import { ServiceError } from "@/services/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function reviewSubmissionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  // The primary button carries no value (= approve); "Reject" submits decision=reject.
  const decision = String(formData.get("decision") ?? "approve");
  const notes = cleanText(formData.get("review_notes")).slice(0, 2000);
  if (!UUID.test(id) || !["approve", "reject"].includes(decision)) return actionError("Invalid request.");

  let draftId: string | null = null;
  try {
    const user = await requireRole("editor");
    if (decision === "approve") draftId = await approveSubmission(id, user.id, notes);
    else await rejectSubmission(id, user.id, notes);
  } catch (e) {
    if (e instanceof ForbiddenError) return actionError("You don't have permission to do that.");
    return actionError(e instanceof ServiceError ? e.message : "Something went wrong.");
  }
  revalidatePublicContent();
  if (draftId) redirect(`/admin/resources/${draftId}?saved=1`);
  return actionOk("Submission rejected.");
}
