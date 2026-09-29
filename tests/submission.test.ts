import { describe, expect, it } from "vitest";
import { submissionSchema } from "@/lib/validation/submission";

const valid = {
  resource_name: "Opportunity Solution Trees",
  resource_url: "https://www.producttalk.org/opportunity-solution-trees/",
  description: "A visual map from outcome to opportunities and solutions.",
  submitter_email: "Someone@Example.com",
  consent: "on",
  website: "",
};

describe("submissionSchema", () => {
  it("accepts a valid submission and normalizes email", () => {
    const r = submissionSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.submitter_email).toBe("someone@example.com");
      expect(r.data.price_type).toBeNull();
      expect(r.data.category_id).toBeNull();
    }
  });
  it("requires consent for storing the email", () => {
    expect(submissionSchema.safeParse({ ...valid, consent: undefined }).success).toBe(false);
  });
  it("rejects filled honeypot (bots)", () => {
    const r = submissionSchema.safeParse({ ...valid, website: "http://spam.example" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.some((i) => i.path[0] === "website")).toBe(true);
  });
  it("rejects bad URLs and emails", () => {
    expect(submissionSchema.safeParse({ ...valid, resource_url: "ftp://x.com" }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...valid, submitter_email: "nope" }).success).toBe(false);
  });
  it("ignores any attempt to set status or review fields", () => {
    const r = submissionSchema.safeParse({ ...valid, status: "approved", resource_id: "x" });
    expect(r.success).toBe(true);
    if (r.success) expect("status" in r.data).toBe(false);
  });
});
