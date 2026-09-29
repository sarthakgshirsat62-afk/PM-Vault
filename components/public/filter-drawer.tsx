"use client";

import { useRef } from "react";

/** Mobile bottom sheet built on the native <dialog> (focus trap + Esc for free). */
export function FilterDrawer({ activeCount, children }: { activeCount: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <div className="lg:hidden">
      <button type="button" className="btn btn-secondary w-full" onClick={() => ref.current?.showModal()} aria-haspopup="dialog">
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-current">
          <path d="M2 4h16v2H2zm3 5h10v2H5zm3 5h4v2H8z" />
        </svg>
        Filters{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>
      <dialog
        ref={ref}
        aria-labelledby="filter-drawer-title"
        className="m-0 mt-auto max-h-[85vh] w-full max-w-none rounded-t-2xl bg-surface p-0 text-ink backdrop:bg-black/40"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-4 py-3">
          <h2 id="filter-drawer-title" className="font-semibold">
            Filters
          </h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => ref.current?.close()}>
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </dialog>
    </div>
  );
}
