import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { hasRole } from "@/lib/roles";
import type { UserRole } from "@/types/domain";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

/** Current user + role, verified with the auth server (not just the cookie). */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  // Not configured = nobody can be signed in (fails closed → login page).
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, name, role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!profile) return null;
  return profile as SessionUser;
});

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

/**
 * Page guard: redirects to login when signed out, 404-style redirect when
 * the role is insufficient. Database RLS enforces the same rules again.
 */
export async function requireRolePage(required: UserRole, nextPath = "/admin"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!hasRole(user.role, required)) redirect("/login?error=forbidden");
  return user;
}

/** Server-action / route guard: throws instead of redirecting. */
export async function requireRole(required: UserRole): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || !hasRole(user.role, required)) throw new ForbiddenError();
  return user;
}
