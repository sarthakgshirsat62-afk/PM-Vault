"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import type { NavItem } from "@/types/domain";

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState<string | null>(null);
  const pathname = usePathname();
  const panelId = useId();

  // Close the menu after navigating.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="btn btn-ghost px-2"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 fill-current">
          {open ? (
            <path d="M4.3 4.3l11.4 11.4-1.4 1.4L2.9 5.7zM15.7 4.3L4.3 15.7l-1.4-1.4L14.3 2.9z" />
          ) : (
            <path d="M3 5h14v2H3zm0 4h14v2H3zm0 4h14v2H3z" />
          )}
        </svg>
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>
      {open && (
        <nav id={panelId} aria-label="Main" className="absolute inset-x-0 top-full z-40 border-b border-line bg-surface shadow-lg">
          <ul className="container-page py-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`block rounded-lg px-3 py-3 font-medium hover:bg-surface-muted ${item.highlight ? "text-accent" : ""}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
