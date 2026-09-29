"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { checkDuplicateAction } from "@/app/admin/resources/actions";
import type { DuplicateMatch } from "@/services/admin-resources";

export function UrlDuplicateField({ defaultValue, resourceId }: { defaultValue?: string; resourceId?: string | null }) {
  const [matches, setMatches] = useState<DuplicateMatch[]>([]);
  const [pending, startTransition] = useTransition();

  function check(url: string) {
    if (!/^https?:\/\/\S+\.\S+/i.test(url)) {
      setMatches([]);
      return;
    }
    startTransition(async () => setMatches(await checkDuplicateAction(url, resourceId ?? null)));
  }

  return (
    <div>
      <label htmlFor="f-external_url" className="label">
        Resource URL<span className="text-danger"> *</span>
      </label>
      <input
        id="f-external_url"
        name="external_url"
        type="url"
        required
        maxLength={2000}
        className="input"
        defaultValue={defaultValue ?? ""}
        placeholder="https://"
        onBlur={(e) => check(e.currentTarget.value)}
        aria-describedby="f-external_url-hint f-external_url-dupes"
      />
      <p id="f-external_url-hint" className="hint">
        The original page. Visitors reach it through a tracked, new-tab link.
      </p>
      <div id="f-external_url-dupes" aria-live="polite">
        {pending && <p className="hint">Checking for duplicates…</p>}
        {matches.length > 0 && (
          <div className="mt-2 rounded-lg border border-pick/40 bg-pick-soft p-3 text-sm">
            <p className="font-semibold text-pick">Possible duplicate</p>
            <ul className="mt-1 list-disc pl-5">
              {matches.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/resources/${m.id}`} className="underline">
                    {m.title}
                  </Link>{" "}
                  <span className="text-ink-muted">({m.status})</span>
                </li>
              ))}
            </ul>
            <label className="mt-2 flex items-center gap-2">
              <input type="checkbox" name="confirm_duplicate" className="h-4 w-4" /> Save anyway
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
