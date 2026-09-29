"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AdminNavItem = { href: string; label: string };

export function AdminNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin">
      <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
        {items.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                  active ? "bg-accent-soft text-accent" : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
