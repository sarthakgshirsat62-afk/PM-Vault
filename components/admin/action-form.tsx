"use client";

import { useActionState } from "react";
import { INITIAL_ACTION_STATE, type ActionState } from "@/lib/action-state";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  /** Extra submit buttons (name="intent") rendered next to the primary one. */
  extraButtons?: React.ReactNode;
};

/** Server-action form with accessible success / error summaries. */
export function ActionForm({ action, children, submitLabel = "Save", className, extraButtons }: Props) {
  const [state, formAction, pending] = useActionState(action, INITIAL_ACTION_STATE);
  const errorEntries = Object.entries(state.errors ?? {});

  return (
    <form
      action={formAction}
      className={className ?? "space-y-5"}
      aria-busy={pending}
    >
      {state.message && (
        <div
          role={state.ok ? "status" : "alert"}
          className={`rounded-lg border p-3 text-sm ${
            state.ok ? "border-success/30 bg-success-soft text-success" : "border-danger/30 bg-danger-soft text-danger"
          }`}
        >
          <p className="font-semibold">{state.message}</p>
          {errorEntries.length > 0 && (
            <ul className="mt-1 list-disc pl-5">
              {errorEntries.map(([field, msg]) => (
                <li key={field}>
                  <span className="font-medium">{humanize(field)}:</span> {msg}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {children}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {extraButtons}
      </div>
    </form>
  );
}

function humanize(field: string): string {
  if (field === "_form") return "Form";
  return field.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
