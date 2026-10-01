"use client";

import { usePathname } from "next/navigation";

/** The admin area has its own chrome; hide the public header/footer there. */
export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
