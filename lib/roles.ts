import type { UserRole } from "@/types/domain";

const RANK: Record<UserRole, number> = {
  member: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
};

/** True when `role` is at least `required` (visitor = null = no role). */
export function hasRole(role: UserRole | null | undefined, required: UserRole): boolean {
  if (!role) return false;
  return RANK[role] >= RANK[required];
}

export const STAFF_ROLE: UserRole = "editor";
