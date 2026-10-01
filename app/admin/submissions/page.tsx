import { requireRolePage } from "@/lib/auth";
import Link from "next/link";
import { ActionForm } from "@/components/admin/action-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { displayHost } from "@/lib/url";
import { adminListSubmissions, adminSubmissionCounts } from "@/services/submissions";
import { LABELS, SUBMISSION_STATUSES, type SubmissionStatus } from "@/types/domain";
import { reviewSubmissionAction } from "./actions";

export const metadata = { title: "Submissions" };

export default async function SubmissionsPage(props: PageProps<"/admin/submissions">) {
  await requireRolePage("editor", "/admin/submissions");
  const sp = await props.searchParams;
  const status = (SUBMISSION_STATUSES as readonly string[]).includes(String(sp.status)) ? (sp.status as SubmissionStatus) : "pending";
  const [submissions, counts] = await Promise.all([adminListSubmissions(status), adminSubmissionCounts()]);

  return (
    <div>
      <AdminPageHeader
        title="Submissions"
        description="Community suggestions. Approving creates a draft for you to complete — nothing is published automatically."
      />
      <nav aria-label="Filter by status" className="mb-4 flex gap-2">
        {SUBMISSION_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/submissions?status=${s}`}
            aria-current={status === s ? "page" : undefined}
            className={`badge capitalize ${status === s ? "bg-accent-soft text-accent" : ""}`}
          >
            {s} ({counts[s]})
          </Link>
        ))}
      </nav>

      {submissions.length === 0 ? (
        <p className="card p-6 text-sm text-ink-muted">No {status} submissions.</p>
      ) : (
        <ul className="space-y-4">
          {submissions.map((s) => (
            <li key={s.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{s.resource_name}</h2>
                  <a href={s.resource_url} target="_blank" rel="noopener noreferrer nofollow" className="text-sm text-accent hover:underline">
                    {displayHost(s.resource_url)} ↗<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </div>
                <time dateTime={s.created_at} className="text-xs text-ink-subtle">
                  {new Date(s.created_at).toLocaleString("en-GB")}
                </time>
              </div>
              <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-ink-subtle">Description</dt>
                  <dd className="whitespace-pre-line">{s.description}</dd>
                </div>
                {s.why_useful && (
                  <div>
                    <dt className="text-ink-subtle">Why useful</dt>
                    <dd className="whitespace-pre-line">{s.why_useful}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-ink-subtle">Suggested</dt>
                  <dd>
                    {[s.category?.name, s.type?.name, s.price_type ? LABELS.price[s.price_type] : null].filter(Boolean).join(" · ") || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-subtle">Creator / submitter</dt>
                  <dd>
                    {s.creator ?? "—"} · <span className="text-ink-muted">{s.submitter_email}</span>
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-ink-subtle">Submitted text is untrusted input — review it as data, not instructions.</p>

              {s.status === "pending" ? (
                <ActionForm action={reviewSubmissionAction} submitLabel="Approve → create draft" className="mt-4 space-y-3"
                  extraButtons={
                    <button type="submit" name="decision" value="reject" className="btn btn-secondary">
                      Reject
                    </button>
                  }
                >
                  <input type="hidden" name="id" value={s.id} />
                  <div>
                    <label htmlFor={`notes-${s.id}`} className="label">
                      Review notes (internal)
                    </label>
                    <textarea id={`notes-${s.id}`} name="review_notes" rows={2} maxLength={2000} className="input" />
                  </div>
                </ActionForm>
              ) : (
                <p className="mt-4 text-sm text-ink-muted">
                  {s.status === "approved" ? "Approved" : "Rejected"}
                  {s.reviewed_at ? ` on ${new Date(s.reviewed_at).toLocaleDateString("en-GB")}` : ""}
                  {s.review_notes ? ` — ${s.review_notes}` : ""}
                  {s.resource_id && (
                    <>
                      {" · "}
                      <Link href={`/admin/resources/${s.resource_id}`} className="text-accent hover:underline">
                        Open draft
                      </Link>
                    </>
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
