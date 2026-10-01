import { describe, expect, it } from "vitest";
import { isLikelyBot, trackEventSchema } from "@/lib/validation/track";

const ID = "3f2b1c9e-8d7a-4b6c-9e5f-1a2b3c4d5e6f";
const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

describe("trackEventSchema", () => {
  it("accepts well-formed events", () => {
    expect(trackEventSchema.safeParse({ type: "view", resource_id: ID, referrer_path: "/resources?q=rice" }).success).toBe(true);
    expect(trackEventSchema.safeParse({ type: "search", query: "rice", result_count: 3, filters: { sort: "newest" } }).success).toBe(true);
    expect(trackEventSchema.safeParse({ type: "search_click", search_id: 42, resource_id: ID }).success).toBe(true);
  });
  it("rejects unknown types, bad ids and off-site referrers", () => {
    expect(trackEventSchema.safeParse({ type: "purchase" }).success).toBe(false);
    expect(trackEventSchema.safeParse({ type: "view", resource_id: "1; drop table" }).success).toBe(false);
    expect(trackEventSchema.safeParse({ type: "view", resource_id: ID, referrer_path: "https://evil.com" }).success).toBe(false);
  });
  it("rejects empty or oversized searches", () => {
    expect(trackEventSchema.safeParse({ type: "search", query: "   ", result_count: 0 }).success).toBe(false);
    expect(trackEventSchema.safeParse({ type: "search", query: "x".repeat(201), result_count: 0 }).success).toBe(false);
    expect(trackEventSchema.safeParse({ type: "search", query: "x", result_count: -1 }).success).toBe(false);
    expect(
      trackEventSchema.safeParse({ type: "search", query: "x", result_count: 1, filters: { big: "y".repeat(3000) } }).success,
    ).toBe(false);
  });
});

describe("isLikelyBot", () => {
  it("lets normal browsers through", () => {
    expect(isLikelyBot(CHROME)).toBe(false);
  });
  it("flags crawlers, previewers, scripts and missing agents", () => {
    for (const ua of ["Googlebot/2.1", "facebookexternalhit/1.1", "curl/8.4.0", "python-requests/2.31", "HeadlessChrome/120", null, ""]) {
      expect(isLikelyBot(ua)).toBe(true);
    }
  });
});
