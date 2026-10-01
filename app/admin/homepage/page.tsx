import Link from "next/link";
import { ActionForm } from "@/components/admin/action-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { CheckboxField, SelectField, TextArea, TextField } from "@/components/admin/fields";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireRolePage } from "@/lib/auth";
import { parseBlockConfig, taskLines, type BrowseTermsConfig, type HeroConfig, type LimitConfig, type ResourceListConfig, type TasksConfig } from "@/lib/homepage-config";
import { adminListHomepageBlocks, slugsForIds } from "@/services/homepage";
import { adminResourceOptions } from "@/services/admin-resources";
import { LABELS, TAXONOMY_KINDS, type HomepageBlock, type HomepageBlockType } from "@/types/domain";
import { deleteHomepageBlockAction, saveHomepageBlockAction } from "../site-actions";

export const metadata = { title: "Homepage" };

const BLOCK_LABELS: Record<HomepageBlockType, string> = {
  hero: "Hero & search",
  popular_tasks: "Popular PM tasks",
  featured_resources: "Featured resources",
  editors_picks: "Editor's Picks",
  most_popular: "Most popular (automatic)",
  recently_added: "Recently added (automatic)",
  categories: "Browse by category",
  browse_terms: "Browse by filter (career stage, product type…)",
  newsletter: "Newsletter (available in P1)",
};

// Newsletter signup ships with P1, so it can't be added yet.
const ADDABLE: HomepageBlockType[] = ["hero", "popular_tasks", "featured_resources", "editors_picks", "most_popular", "recently_added", "categories", "browse_terms"];

async function BlockFields({ block }: { block: HomepageBlock }) {
  const sfx = block.id;
  const config = parseBlockConfig(block.block_type, block.config);
  switch (block.block_type) {
    case "hero": {
      const c = config as HeroConfig;
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField name="search_label" label="Search label" idSuffix={sfx} defaultValue={c.search_label} />
          <TextField name="search_placeholder" label="Search placeholder" idSuffix={sfx} defaultValue={c.search_placeholder} />
          <TextField name="primary_label" label="Primary button label" idSuffix={sfx} defaultValue={c.primary_cta.label} />
          <TextField name="primary_href" label="Primary button link" idSuffix={sfx} defaultValue={c.primary_cta.href} hint="Starts with /" />
          <TextField name="secondary_label" label="Secondary button label" idSuffix={sfx} defaultValue={c.secondary_cta.label} />
          <TextField name="secondary_href" label="Secondary button link" idSuffix={sfx} defaultValue={c.secondary_cta.href} />
        </div>
      );
    }
    case "popular_tasks":
      return (
        <TextArea
          name="items"
          label="Task cards"
          rows={8}
          idSuffix={sfx}
          defaultValue={taskLines((config as TasksConfig).items)}
          hint="One per line: Label | /link | optional description"
        />
      );
    case "featured_resources":
    case "editors_picks": {
      const c = config as ResourceListConfig;
      const slugs = await slugsForIds(c.resource_ids ?? []);
      return (
        <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
          <TextField name="limit" label="How many" type="number" idSuffix={sfx} defaultValue={String(c.limit)} />
          <TextArea
            name="resource_slugs"
            label="Hand-picked resources (optional, in display order)"
            rows={4}
            idSuffix={sfx}
            defaultValue={slugs.join("\n")}
            hint={`One resource slug per line. Leave empty to show resources flagged “${block.block_type === "featured_resources" ? "Featured" : "Editor's Pick"}”, newest first.`}
          />
        </div>
      );
    }
    case "most_popular":
    case "recently_added":
    case "categories":
      return <TextField name="limit" label="How many" type="number" idSuffix={sfx} defaultValue={String((config as LimitConfig).limit)} className="max-w-[10rem]" />;
    case "browse_terms":
      return (
        <SelectField
          name="kind"
          label="Filter dimension"
          idSuffix={sfx}
          defaultValue={(config as BrowseTermsConfig).kind}
          options={TAXONOMY_KINDS.map((k) => ({ value: k, label: LABELS.taxonomy[k] }))}
        />
      );
    default:
      return null;
  }
}

export default async function HomepageAdminPage() {
  await requireRolePage("admin", "/admin/homepage");
  const [blocks, resources] = await Promise.all([adminListHomepageBlocks(), adminResourceOptions()]);

  return (
    <div>
      <AdminPageHeader
        title="Homepage"
        description="Blocks appear in order of their position (lowest first). Enable, disable, retitle or reorder them — changes are live immediately."
        actions={
          <Link href="/" className="btn btn-secondary">
            View homepage
          </Link>
        }
      />

      <div className="space-y-4">
        {blocks.map((block) => (
          <section key={block.id} className="card p-5" aria-label={`${BLOCK_LABELS[block.block_type]} block`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">
                {BLOCK_LABELS[block.block_type]}{" "}
                {!block.enabled && <span className="badge ml-1">Disabled</span>}
              </h2>
              <ConfirmButton
                action={deleteHomepageBlockAction}
                hidden={{ id: block.id }}
                label="Remove block"
                confirmMessage="Remove this block from the homepage?"
              />
            </div>
            <ActionForm action={saveHomepageBlockAction} submitLabel="Save block" className="space-y-3">
              <input type="hidden" name="id" value={block.id} />
              <input type="hidden" name="block_type" value={block.block_type} />
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_7rem]">
                <TextField name="heading" label="Heading" idSuffix={block.id} defaultValue={block.heading} />
                <TextField name="subheading" label="Subheading" idSuffix={block.id} defaultValue={block.subheading} />
                <TextField name="position" label="Position" type="number" idSuffix={block.id} defaultValue={String(block.position)} />
              </div>
              <BlockFields block={block} />
              <CheckboxField name="enabled" label="Enabled" idSuffix={block.id} defaultChecked={block.enabled} />
            </ActionForm>
          </section>
        ))}

        <section className="card border-dashed p-5" aria-labelledby="add-block">
          <h2 id="add-block" className="mb-3 font-semibold">
            Add block
          </h2>
          <ActionForm action={saveHomepageBlockAction} submitLabel="Add block" className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_7rem_auto]">
            <SelectField
              name="block_type"
              label="Block type"
              required
              idSuffix="new"
              options={ADDABLE.map((t) => ({ value: t, label: BLOCK_LABELS[t] }))}
            />
            <TextField name="heading" label="Heading" idSuffix="new" />
            <TextField name="position" label="Position" type="number" idSuffix="new" defaultValue={String((blocks.at(-1)?.position ?? 0) + 10)} />
            <input type="hidden" name="enabled" value="on" />
            <input type="hidden" name="kind" value="career_level" />
            <input type="hidden" name="limit" value="4" />
          </ActionForm>
          <p className="hint">New blocks start with default settings — edit them above after adding.</p>
        </section>

        <details className="card p-5">
          <summary className="cursor-pointer font-semibold">Published resource slugs (for hand-picked blocks)</summary>
          <ul className="mt-3 max-h-80 space-y-1 overflow-auto text-sm">
            {resources.map((r) => (
              <li key={r.id}>
                <code className="rounded bg-surface-muted px-1">{r.slug}</code> — {r.title}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
