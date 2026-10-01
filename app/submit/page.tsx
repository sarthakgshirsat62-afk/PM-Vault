import type { Metadata } from "next";
import { SubmitForm } from "@/components/public/submit-form";
import { getPublishedCategories, getResourceTypes } from "@/services/taxonomy";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Submit a resource",
  description: "Suggest a product management template, framework, tool or guide for the library. Every submission is reviewed by an editor.",
  alternates: { canonical: "/submit" },
};

export default async function SubmitPage() {
  const [categories, types] = await Promise.all([getPublishedCategories(), getResourceTypes()]);

  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Submit a resource</h1>
      <p className="mt-3 text-ink-muted">
        Found a template, framework or tool other PMs should know about? Tell us. An editor reviews every suggestion, writes an
        original description and decides whether it meets our standards — nothing is published automatically.
      </p>
      <div className="mt-8">
        <SubmitForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} types={types.map((t) => ({ id: t.id, name: t.name }))} />
      </div>
    </div>
  );
}
