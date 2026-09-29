"use server";

import { actionError, actionOk, type ActionState } from "@/lib/action-state";
import { checkRateLimit } from "@/lib/rate-limit";
import { fieldErrors } from "@/lib/validation/fields";
import { submissionSchema } from "@/lib/validation/submission";
import { createSubmission, findPublishedByUrl } from "@/services/submissions";
import { ServiceError } from "@/services/db";

export async function submitResourceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = submissionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    // Don't reveal the honeypot to bots; just pretend success.
    if (errors.website) return actionOk("Thanks! Your suggestion is in the review queue.");
    return actionError("Please check the highlighted fields.", errors);
  }

  if (!(await checkRateLimit("submission", 5, 3600))) {
    return actionError("You've sent several suggestions recently. Please try again in an hour.");
  }

  const existing = await findPublishedByUrl(parsed.data.resource_url);
  if (existing) {
    return actionError("Good news — that resource is already in the library.", undefined, { existing });
  }

  try {
    await createSubmission(parsed.data);
  } catch (e) {
    return actionError(e instanceof ServiceError ? e.message : "Something went wrong. Please try again.");
  }
  return actionOk("Thanks! Your suggestion is in the review queue. An editor reviews every submission before anything is published.");
}
