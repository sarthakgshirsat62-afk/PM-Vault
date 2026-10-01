"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitResourceAction } from "@/app/submit/actions";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { LABELS, PRICE_TYPES } from "@/types/domain";

type Option = { id: string; name: string };

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="mt-1 text-sm text-danger">
      {message}
    </p>
  ) : null;
}

export function SubmitForm({ categories, types }: { categories: Option[]; types: Option[] }) {
  const [state, action, pending] = useActionState(submitResourceAction, INITIAL_ACTION_STATE);
  const e = state.errors ?? {};
  const existing = state.data?.existing as { title: string; slug: string } | undefined;

  if (state.ok) {
    return (
      <div role="status" className="card p-6">
        <h2 className="text-lg font-semibold">Submission received</h2>
        <p className="mt-2 text-ink-muted">{state.message}</p>
        <Link href="/resources" className="btn btn-secondary mt-4">
          Browse resources
        </Link>
      </div>
    );
  }

  const describedBy = (field: string, hint?: string) => [hint, e[field] ? `err-${field}` : null].filter(Boolean).join(" ") || undefined;

  return (
    <form action={action} className="space-y-5" noValidate={false}>
      {state.message && (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
          {state.message}
          {existing && (
            <>
              {" "}
              <Link href={`/resource/${existing.slug}`} className="font-semibold underline">
                View “{existing.title}”
              </Link>
            </>
          )}
        </div>
      )}

      <div>
        <label htmlFor="s-name" className="label">
          Resource name <span className="text-danger">*</span>
        </label>
        <input id="s-name" name="resource_name" required maxLength={200} className="input" aria-invalid={Boolean(e.resource_name)} aria-describedby={describedBy("resource_name")} />
        <FieldError id="err-resource_name" message={e.resource_name} />
      </div>

      <div>
        <label htmlFor="s-url" className="label">
          URL <span className="text-danger">*</span>
        </label>
        <input id="s-url" name="resource_url" type="url" required maxLength={2000} placeholder="https://" className="input" aria-invalid={Boolean(e.resource_url)} aria-describedby={describedBy("resource_url")} />
        <FieldError id="err-resource_url" message={e.resource_url} />
      </div>

      <div>
        <label htmlFor="s-desc" className="label">
          What is it? <span className="text-danger">*</span>
        </label>
        <textarea id="s-desc" name="description" required maxLength={2000} rows={3} className="input" aria-invalid={Boolean(e.description)} aria-describedby={describedBy("description")} />
        <FieldError id="err-description" message={e.description} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="s-cat" className="label">
            Category
          </label>
          <select id="s-cat" name="category_id" className="input" defaultValue="">
            <option value="">Not sure</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="s-type" className="label">
            Type
          </label>
          <select id="s-type" name="resource_type_id" className="input" defaultValue="">
            <option value="">Not sure</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="s-price" className="label">
            Price
          </label>
          <select id="s-price" name="price_type" className="input" defaultValue="">
            <option value="">Not sure</option>
            {PRICE_TYPES.map((p) => (
              <option key={p} value={p}>
                {LABELS.price[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="s-creator" className="label">
          Creator
        </label>
        <input id="s-creator" name="creator" maxLength={200} className="input" placeholder="Person or company who made it" />
      </div>

      <div>
        <label htmlFor="s-why" className="label">
          Why is it useful?
        </label>
        <textarea id="s-why" name="why_useful" maxLength={2000} rows={3} className="input" placeholder="When would a PM reach for it?" />
      </div>

      <div>
        <label htmlFor="s-email" className="label">
          Your email <span className="text-danger">*</span>
        </label>
        <input id="s-email" name="submitter_email" type="email" required maxLength={320} autoComplete="email" className="input" aria-invalid={Boolean(e.submitter_email)} aria-describedby={describedBy("submitter_email", "s-email-hint")} />
        <p id="s-email-hint" className="hint">
          Only used to follow up about this submission. Never shown publicly or added to a mailing list.
        </p>
        <FieldError id="err-submitter_email" message={e.submitter_email} />
      </div>

      {/* Honeypot — hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="s-website">Website</label>
        <input id="s-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <div className="flex items-start gap-2">
          <input id="s-consent" name="consent" type="checkbox" required className="mt-1 h-4 w-4" aria-describedby={e.consent ? "err-consent" : undefined} />
          <label htmlFor="s-consent" className="text-sm">
            I agree that PM Vault may store my email to contact me about this submission.
          </label>
        </div>
        <FieldError id="err-consent" message={e.consent} />
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Sending…" : "Submit for review"}
      </button>
    </form>
  );
}
