import { ActionForm } from "@/components/admin/action-form";
import { CategoryFields } from "@/components/admin/category-fields";
import { CheckboxField, Fieldset, SelectField, TextArea, TextField } from "@/components/admin/fields";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { UrlDuplicateField } from "@/components/admin/url-duplicate-field";
import { saveResourceAction } from "@/app/admin/resources/actions";
import type { EditableResource } from "@/services/admin-resources";
import {
  DIFFICULTIES, LABELS, PRICE_TYPES, RESOURCE_STATUSES, TAXONOMY_KINDS,
  type Category, type ResourceType, type Subcategory, type TaxonomyTerm,
} from "@/types/domain";

type Props = {
  resource?: EditableResource | null;
  categories: Category[];
  subcategories: Subcategory[];
  types: ResourceType[];
  terms: TaxonomyTerm[];
};

const lines = (list?: string[]) => (list ?? []).join("\n");
const LIST_HINT = "One item per line.";

export function ResourceForm({ resource, categories, subcategories, types, terms }: Props) {
  const r = resource;
  const selectedTerms = new Set(r?.terms.map((t) => t.id) ?? []);
  const isPublished = r?.status === "published";

  return (
    <ActionForm
      action={saveResourceAction}
      submitLabel="Save"
      extraButtons={
        <>
          <button type="submit" name="intent" value="draft" className="btn btn-secondary">
            Save draft
          </button>
          <button type="submit" name="intent" value="review" className="btn btn-secondary">
            Submit for review
          </button>
          {isPublished ? (
            <button type="submit" name="intent" value="unpublish" className="btn btn-secondary">
              Unpublish
            </button>
          ) : (
            <button type="submit" name="intent" value="publish" className="btn btn-secondary">
              Publish
            </button>
          )}
        </>
      }
    >
      {r && <input type="hidden" name="id" value={r.id} />}

      <Fieldset legend="Basic information">
        <TextField name="title" label="Title" required maxLength={200} defaultValue={r?.title} />
        <TextField
          name="slug"
          label="URL slug"
          maxLength={100}
          defaultValue={r?.slug}
          hint="Leave blank to generate from the title. Public URL: /resource/<slug>"
        />
        <TextField
          name="short_description"
          label="One-line value proposition"
          required
          maxLength={300}
          defaultValue={r?.short_description}
          hint="Shown on cards and in search results. Write it in your own words."
        />
        <TextArea name="long_description" label="Editorial overview" rows={6} maxLength={10000} defaultValue={r?.long_description} />
        <TextArea
          name="problem_solved"
          label="Problem this solves"
          rows={2}
          maxLength={1000}
          defaultValue={r?.problem_solved}
          hint="Phrase it the way a PM would search: “Stakeholders keep changing requirements”."
        />
        <UrlDuplicateField defaultValue={r?.external_url} resourceId={r?.id} />
        <ImageUploadField name="thumbnail_url" label="Thumbnail" defaultValue={r?.thumbnail_url} folder="thumbnails" />
        <TextField name="thumbnail_alt" label="Thumbnail alt text" maxLength={200} defaultValue={r?.thumbnail_alt} hint="Describe the image for screen-reader users." />
      </Fieldset>

      <Fieldset legend="Classification">
        <CategoryFields
          categories={categories}
          subcategories={subcategories}
          defaultCategoryId={r?.category_id}
          defaultSubcategoryId={r?.subcategory_id}
        />
        <SelectField
          name="resource_type_id"
          label="Resource type"
          defaultValue={r?.resource_type_id}
          emptyLabel="— None —"
          options={types.map((t) => ({ value: t.id, label: t.name }))}
        />
        <TextField
          name="tag_names"
          label="Tags"
          defaultValue={r?.tags.map((t) => t.name).join(", ")}
          hint="Comma-separated. New tags are created automatically."
        />
      </Fieldset>

      <Fieldset legend="Product context & filters" description="These power the public filters. Choose all that apply.">
        <div className="grid gap-5 sm:grid-cols-2">
          {TAXONOMY_KINDS.map((kind) => {
            const options = terms.filter((t) => t.kind === kind);
            if (options.length === 0) return null;
            return (
              <fieldset key={kind}>
                <legend className="label">{LABELS.taxonomy[kind]}</legend>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {options.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="term_ids" value={t.id} defaultChecked={selectedTerms.has(t.id)} className="h-4 w-4" />
                      {t.name}
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          })}
        </div>
      </Fieldset>

      <Fieldset legend="Resource metadata">
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            name="price_type"
            label="Price"
            required
            defaultValue={r?.price_type ?? "free"}
            options={PRICE_TYPES.map((p) => ({ value: p, label: LABELS.price[p] }))}
          />
          <SelectField
            name="difficulty"
            label="Difficulty"
            required
            defaultValue={r?.difficulty ?? "beginner"}
            options={DIFFICULTIES.map((d) => ({ value: d, label: LABELS.difficulty[d] }))}
          />
          <TextField name="estimated_time" label="Estimated time" maxLength={100} defaultValue={r?.estimated_time} placeholder="e.g. 1–2 hours" />
        </div>
      </Fieldset>

      <Fieldset legend="Editorial guidance" description="The context layer is the product. Be specific and honest.">
        <div className="grid gap-4 md:grid-cols-2">
          <TextArea name="best_for" label="Best for" hint={LIST_HINT} defaultValue={lines(r?.best_for)} />
          <TextArea name="use_when" label="Use this when" hint={LIST_HINT} defaultValue={lines(r?.use_when)} />
          <TextArea name="avoid_when" label="Avoid this when" hint={LIST_HINT} defaultValue={lines(r?.avoid_when)} />
          <TextArea name="how_to_use" label="How to use (steps)" hint={LIST_HINT} rows={6} defaultValue={lines(r?.how_to_use)} />
          <TextArea name="strengths" label="Strengths" hint={LIST_HINT} defaultValue={lines(r?.strengths)} />
          <TextArea name="limitations" label="Limitations" hint={LIST_HINT} defaultValue={lines(r?.limitations)} />
        </div>
        <TextArea
          name="example_output"
          label="Example output"
          rows={3}
          maxLength={3000}
          defaultValue={r?.example_output}
          hint="Describe what using it produces. Don't paste copyrighted content."
        />
      </Fieldset>

      <Fieldset legend="Source">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="author" label="Author" maxLength={200} defaultValue={r?.author} />
          <TextField name="organization" label="Organization / publisher" maxLength={200} defaultValue={r?.organization} />
        </div>
      </Fieldset>

      <Fieldset legend="Curation" description="The editorial score is never shown publicly.">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            name="status"
            label="Status"
            required
            defaultValue={r?.status ?? "draft"}
            options={RESOURCE_STATUSES.map((s) => ({ value: s, label: LABELS.status[s] }))}
            hint="Used by “Save”. The other buttons set the status for you."
          />
          <TextField
            name="editorial_score"
            label="Editorial score (0–100)"
            type="number"
            defaultValue={String(r?.editorial_score ?? 50)}
            hint="Usefulness 30 · Quality 20 · Credibility 15 · Ease 15 · Originality 10 · Freshness 10"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <CheckboxField name="featured" label="Featured" defaultChecked={r?.featured} hint="Eligible for the homepage Featured block." />
          <CheckboxField name="editors_pick" label="Editor's Pick" defaultChecked={r?.editors_pick} hint="Cannot be combined with Sponsored." />
          <CheckboxField name="sponsored" label="Sponsored" defaultChecked={r?.sponsored} hint="Always labelled “Sponsored”. Never affects ranking." />
          <CheckboxField name="affiliate" label="Affiliate link" defaultChecked={r?.affiliate} hint="Discloses the affiliate relationship on the page." />
        </div>
        <TextField name="sponsor_name" label="Sponsor name" maxLength={120} defaultValue={r?.sponsor_name} hint="Required when Sponsored is ticked." />
        <TextArea name="internal_notes" label="Internal notes" rows={2} maxLength={2000} defaultValue={r?.internal_notes} />
      </Fieldset>

      <Fieldset legend="SEO" description="Optional overrides. Defaults come from the title and value proposition.">
        <TextField name="seo_title" label="SEO title" maxLength={120} defaultValue={r?.seo_title} />
        <TextArea name="meta_description" label="Meta description" rows={2} maxLength={300} defaultValue={r?.meta_description} />
        <ImageUploadField name="og_image_url" label="Social share image (OG)" defaultValue={r?.og_image_url} folder="og" />
      </Fieldset>
    </ActionForm>
  );
}
