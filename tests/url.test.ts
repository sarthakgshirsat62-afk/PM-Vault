import { describe, expect, it } from "vitest";
import { displayHost, normalizeUrl, parseExternalUrl, safeRelativePath } from "@/lib/url";

describe("normalizeUrl (duplicate detection)", () => {
  it("treats protocol, www, trailing slash and hash as equivalent", () => {
    const a = normalizeUrl("https://www.Intercom.com/blog/rice/#top");
    const b = normalizeUrl("http://intercom.com/blog/rice");
    expect(a).toBe("intercom.com/blog/rice");
    expect(a).toBe(b);
  });
  it("drops tracking params and sorts the rest", () => {
    expect(normalizeUrl("https://x.com/p?b=2&utm_source=news&a=1&fbclid=abc")).toBe("x.com/p?a=1&b=2");
  });
  it("keeps meaningful query params", () => {
    expect(normalizeUrl("https://x.com/p?id=1")).not.toBe(normalizeUrl("https://x.com/p?id=2"));
  });
  it("normalizes a bare domain", () => {
    expect(normalizeUrl("https://www.miro.com/")).toBe("miro.com");
  });
  it("rejects non-http and malformed URLs", () => {
    expect(normalizeUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeUrl("ftp://files.example.com/x")).toBeNull();
    expect(normalizeUrl("not a url")).toBeNull();
    expect(normalizeUrl("http://localhost/x")).toBeNull();
  });
});

describe("parseExternalUrl", () => {
  it("rejects credentials in URLs", () => {
    expect(parseExternalUrl("https://user:pass@example.com")).toBeNull();
  });
});

describe("displayHost", () => {
  it("shows a clean destination", () => {
    expect(displayHost("https://www.producttalk.org/opportunity-solution-trees/")).toBe("producttalk.org");
    expect(displayHost("nope")).toBe("");
  });
});

describe("safeRelativePath (open-redirect protection)", () => {
  it("allows same-site paths", () => {
    expect(safeRelativePath("/admin/resources")).toBe("/admin/resources");
  });
  it("blocks absolute and protocol-relative URLs", () => {
    expect(safeRelativePath("https://evil.com")).toBe("/");
    expect(safeRelativePath("//evil.com")).toBe("/");
    expect(safeRelativePath("/\\evil.com")).toBe("/");
    expect(safeRelativePath(null, "/admin")).toBe("/admin");
  });
});
