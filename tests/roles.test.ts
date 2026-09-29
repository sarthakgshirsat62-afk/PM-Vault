import { describe, expect, it } from "vitest";
import { hasRole } from "@/lib/roles";

describe("hasRole", () => {
  it("visitors have no role", () => {
    expect(hasRole(null, "member")).toBe(false);
    expect(hasRole(undefined, "editor")).toBe(false);
  });
  it("members cannot access editor features", () => {
    expect(hasRole("member", "editor")).toBe(false);
  });
  it("editors can edit content but not administer", () => {
    expect(hasRole("editor", "editor")).toBe(true);
    expect(hasRole("editor", "admin")).toBe(false);
  });
  it("roles are hierarchical", () => {
    expect(hasRole("admin", "editor")).toBe(true);
    expect(hasRole("super_admin", "admin")).toBe(true);
    expect(hasRole("admin", "super_admin")).toBe(false);
  });
});
