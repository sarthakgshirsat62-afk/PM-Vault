// Shared domain types mirroring supabase/migrations. Replace with
// `supabase gen types typescript` output once the CLI is set up.

export const USER_ROLES = ["member", "editor", "admin", "super_admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const RESOURCE_STATUSES = ["draft", "in_review", "published", "archived", "broken_link", "needs_review"] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

export const PRICE_TYPES = ["free", "freemium", "paid"] as const;
export type PriceType = (typeof PRICE_TYPES)[number];

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const SUBMISSION_STATUSES = ["pending", "approved", "rejected"] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const TAXONOMY_KINDS = ["persona", "career_level", "product_type", "product_stage", "company_stage", "format"] as const;
export type TaxonomyKind = (typeof TAXONOMY_KINDS)[number];

export const HOMEPAGE_BLOCK_TYPES = [
  "hero", "popular_tasks", "featured_resources", "editors_picks", "most_popular",
  "recently_added", "categories", "browse_terms", "newsletter",
] as const;
export type HomepageBlockType = (typeof HOMEPAGE_BLOCK_TYPES)[number];

export const SORT_OPTIONS = ["relevance", "newest", "popular"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  editorial_intro: string;
  icon: string | null;
  seo_title: string | null;
  meta_description: string | null;
  display_order: number;
  is_published: boolean;
  updated_at: string;
};

export type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
};

export type ResourceType = {
  id: string;
  name: string;
  plural_name: string;
  slug: string;
  description: string;
  display_order: number;
};

export type Tag = { id: string; name: string; slug: string };

export type TaxonomyTerm = {
  id: string;
  kind: TaxonomyKind;
  name: string;
  slug: string;
  display_order: number;
};

export type Resource = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  long_description: string;
  problem_solved: string;
  external_url: string;
  normalized_url: string;
  thumbnail_url: string | null;
  thumbnail_alt: string | null;
  resource_type_id: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  price_type: PriceType;
  difficulty: Difficulty;
  estimated_time: string | null;
  author: string | null;
  organization: string | null;
  best_for: string[];
  use_when: string[];
  avoid_when: string[];
  how_to_use: string[];
  strengths: string[];
  limitations: string[];
  example_output: string;
  featured: boolean;
  editors_pick: boolean;
  sponsored: boolean;
  sponsor_name: string | null;
  affiliate: boolean;
  seo_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  status: ResourceStatus;
  published_at: string | null;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Card-shaped row returned by search_resources / similar_resources. */
export type ResourceCard = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  thumbnail_url: string | null;
  thumbnail_alt: string | null;
  price_type: PriceType;
  difficulty: Difficulty;
  organization: string | null;
  author: string | null;
  editors_pick: boolean;
  sponsored: boolean;
  featured: boolean;
  category_name: string | null;
  category_slug: string | null;
  type_name: string | null;
  type_slug: string | null;
  published_at: string | null;
  score?: number;
  total_count?: number;
};

export type HomepageBlock = {
  id: string;
  block_type: HomepageBlockType;
  heading: string;
  subheading: string;
  position: number;
  enabled: boolean;
  config: Record<string, unknown>;
};

export type NavItem = { id: string; label: string; href: string; position: number; enabled: boolean; highlight: boolean };

export type SiteSettings = {
  site_name: string;
  tagline: string;
  default_meta_description: string;
  default_og_image_url: string | null;
  footer_text: string;
};

export type Submission = {
  id: string;
  resource_name: string;
  resource_url: string;
  normalized_url: string;
  description: string;
  category_id: string | null;
  resource_type_id: string | null;
  creator: string | null;
  price_type: PriceType | null;
  why_useful: string;
  submitter_email: string;
  status: SubmissionStatus;
  review_notes: string;
  reviewed_at: string | null;
  resource_id: string | null;
  created_at: string;
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  body: string;
  meta_description: string | null;
  published: boolean;
  show_in_footer: boolean;
  updated_at: string;
};

export const LABELS = {
  price: { free: "Free", freemium: "Freemium", paid: "Paid" } satisfies Record<PriceType, string>,
  difficulty: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } satisfies Record<Difficulty, string>,
  status: {
    draft: "Draft", in_review: "In review", published: "Published",
    archived: "Archived", broken_link: "Broken link", needs_review: "Needs review",
  } satisfies Record<ResourceStatus, string>,
  taxonomy: {
    persona: "Persona", career_level: "Career level", product_type: "Product type",
    product_stage: "Stage", company_stage: "Company stage", format: "Format",
  } satisfies Record<TaxonomyKind, string>,
};
