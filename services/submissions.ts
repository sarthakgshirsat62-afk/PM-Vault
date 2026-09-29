import "server-only";
import { publicDb, userDb, check, ServiceError } from "./db";
import { findDuplicateResources, saveResource, uniqueResourceSlug } from "./admin-resources";
import { normalizeUrl } from "@/lib/url";
import type { SubmissionInput } from "@/lib/validation/submission";
import type { Submission, SubmissionStatus } from "@/types/domain";

/** Published resource with the same normalized URL, if any (public data only). */
export async function findPublishedByUrl(url: string): Promise<{ title: string; slug: string } | null> {
  const db = publicDb();
  const normalized = normalizeUrl(url);
  if (!db || !normalized) return null;
  const { data } = await db.from("resources").select("title, slug").eq("normalized_url", normalized).eq("status", "published").limit(1);
  return (data?.[0] as { title: string; slug: string } | undefined) ?? null;
}

/** Stores a pending submission. RLS only accepts status = pending. */
export async function createSubmission(input: SubmissionInput): Promise<void> {
  const db = publicDb();
  if (!db) throw new ServiceError("Submissions are not available yet.");
  const normalized = normalizeUrl(input.resource_url);
  if (!normalized) throw new ServiceError("Invalid URL.");
  const { error } = await db.from("submissions").insert({
    resource_name: input.resource_name,
    resource_url: input.resource_url,
    normalized_url: normalized,
    description: input.description,
    category_id: input.category_id,
    resource_type_id: input.resource_type_id,
    creator: input.creator,
    price_type: input.price_type,
    why_useful: input.why_useful,
    submitter_email: input.submitter_email,
    status: "pending",
  });
  if (error) {
    console.error("[submissions:create]", error.message);
    throw new ServiceError("We couldn't save your submission. Please try again.");
  }
}

export type AdminSubmission = Submission & {
  category: { name: string } | null;
  type: { name: string } | null;
};

export async function adminListSubmissions(status: SubmissionStatus): Promise<AdminSubmission[]> {
  const db = await userDb();
  const data = check(
    await db
      .from("submissions")
      .select("*, category:categories(name), type:resource_types(name)")
      .eq("status", status)
      .order("created_at", { ascending: status === "pending" })
      .limit(200),
    "loading submissions",
  );
  return (data ?? []) as unknown as AdminSubmission[];
}

export async function adminSubmissionCounts(): Promise<Record<SubmissionStatus, number>> {
  const db = await userDb();
  const statuses: SubmissionStatus[] = ["pending", "approved", "rejected"];
  const entries = await Promise.all(
    statuses.map(async (s) => {
      const { count } = await db.from("submissions").select("id", { count: "exact", head: true }).eq("status", s);
      return [s, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<SubmissionStatus, number>;
}

async function getSubmission(id: string): Promise<Submission> {
  const db = await userDb();
  const data = check(await db.from("submissions").select("*").eq("id", id).maybeSingle(), "loading submission") as Submission | null;
  if (!data) throw new ServiceError("Submission not found.");
  return data;
}

/**
 * Approves a submission by creating a DRAFT resource prefilled from it.
 * An editor must still review, complete and publish the draft.
 */
export async function approveSubmission(id: string, userId: string, notes: string): Promise<string> {
  const sub = await getSubmission(id);
  if (sub.status !== "pending") throw new ServiceError("This submission has already been reviewed.");
  const dupes = await findDuplicateResources(sub.resource_url);
  if (dupes.length) throw new ServiceError(`Already in the library as “${dupes[0]?.title}”. Reject it as a duplicate instead.`);

  const saved = await saveResource(
    {
      title: sub.resource_name,
      slug: await uniqueResourceSlug(sub.resource_name),
      short_description: sub.description.slice(0, 300),
      long_description: "",
      problem_solved: "",
      external_url: sub.resource_url,
      thumbnail_url: null,
      thumbnail_alt: null,
      resource_type_id: sub.resource_type_id,
      category_id: sub.category_id,
      subcategory_id: null,
      price_type: sub.price_type ?? "free",
      difficulty: "beginner",
      estimated_time: null,
      author: sub.creator,
      organization: null,
      best_for: [],
      use_when: [],
      avoid_when: [],
      how_to_use: [],
      strengths: [],
      limitations: [],
      example_output: "",
      featured: false,
      editors_pick: false,
      sponsored: false,
      sponsor_name: null,
      affiliate: false,
      seo_title: null,
      meta_description: null,
      og_image_url: null,
      status: "draft",
      editorial_score: 50,
      internal_notes: `From community submission.${sub.why_useful ? ` Submitter's reason: ${sub.why_useful}` : ""}`.slice(0, 2000),
      tag_names: [],
      term_ids: [],
    },
    { userId },
  );

  const db = await userDb();
  check(
    await db
      .from("submissions")
      .update({ status: "approved", reviewed_by: userId, reviewed_at: new Date().toISOString(), resource_id: saved.id, review_notes: notes })
      .eq("id", id),
    "approving submission",
  );
  return saved.id;
}

export async function rejectSubmission(id: string, userId: string, notes: string): Promise<void> {
  const sub = await getSubmission(id);
  if (sub.status !== "pending") throw new ServiceError("This submission has already been reviewed.");
  const db = await userDb();
  check(
    await db
      .from("submissions")
      .update({ status: "rejected", reviewed_by: userId, reviewed_at: new Date().toISOString(), review_notes: notes })
      .eq("id", id),
    "rejecting submission",
  );
}
