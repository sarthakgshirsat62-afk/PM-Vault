-- PM Vault — 0001 core schema
-- Tables, enums, triggers and Row Level Security for the P0 MVP.
-- Run once, in order, in the Supabase SQL editor (or `supabase db push`).
-- Never edit this file after it has been applied: add a new migration instead.

create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('member', 'editor', 'admin', 'super_admin');
create type public.resource_status as enum ('draft', 'in_review', 'published', 'archived', 'broken_link', 'needs_review');
create type public.price_type as enum ('free', 'freemium', 'paid');
create type public.difficulty as enum ('beginner', 'intermediate', 'advanced');
create type public.submission_status as enum ('pending', 'approved', 'rejected');
-- Filter dimensions. Values inside each dimension are admin-managed rows;
-- adding a whole new dimension is a data-model change (new migration).
create type public.taxonomy_kind as enum ('persona', 'career_level', 'product_type', 'product_stage', 'company_stage', 'format');
create type public.homepage_block_type as enum (
  'hero', 'popular_tasks', 'featured_resources', 'editors_picks', 'most_popular',
  'recently_added', 'categories', 'browse_terms', 'newsletter'
);

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles & roles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text,
  avatar_url text,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Role lookups are SECURITY DEFINER so RLS policies can call them without
-- recursing into the profiles policies.
create or replace function public.current_user_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_editor()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() in ('editor', 'admin', 'super_admin'), false);
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() in ('admin', 'super_admin'), false);
$$;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() = 'super_admin', false);
$$;

-- Create a profile row for every new auth user. Everyone starts as 'member';
-- promotion happens only via SQL or a super_admin.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only a super_admin may change anyone's role (including their own).
-- auth.uid() is null for SQL-editor / service sessions, which is how the
-- first super_admin is bootstrapped.
create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_super_admin() then
    raise exception 'Only a super_admin can change roles';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ---------------------------------------------------------------------------
-- Site settings (single row) & navigation
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_name text not null default 'PM Vault',
  tagline text not null default '',
  default_meta_description text not null default '',
  default_og_image_url text,
  footer_text text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1);

create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

create table public.nav_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null check (href ~ '^/'),
  position integer not null default 0,
  enabled boolean not null default true,
  highlight boolean not null default false
);

-- Static content pages (About, Privacy, Terms...) editable in admin.
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  body text not null default '',
  meta_description text,
  published boolean not null default false,
  show_in_footer boolean not null default false,
  updated_at timestamptz not null default now()
);

create trigger pages_updated_at before update on public.pages
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Taxonomy
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  editorial_intro text not null default '',
  icon text,
  seo_title text,
  meta_description text,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  name text not null,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  display_order integer not null default 0,
  unique (category_id, slug)
);

create table public.resource_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plural_name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  display_order integer not null default 0
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create table public.taxonomy_terms (
  id uuid primary key default gen_random_uuid(),
  kind public.taxonomy_kind not null,
  name text not null,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  display_order integer not null default 0,
  unique (kind, slug)
);

-- ---------------------------------------------------------------------------
-- Resources
-- ---------------------------------------------------------------------------
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  short_description text not null default '' check (char_length(short_description) <= 300),
  long_description text not null default '',
  problem_solved text not null default '',
  external_url text not null check (external_url ~* '^https?://'),
  normalized_url text not null,
  thumbnail_url text,
  thumbnail_alt text,
  resource_type_id uuid references public.resource_types (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  subcategory_id uuid references public.subcategories (id) on delete set null,
  price_type public.price_type not null default 'free',
  difficulty public.difficulty not null default 'beginner',
  estimated_time text,
  author text,
  organization text,
  best_for text[] not null default '{}',
  use_when text[] not null default '{}',
  avoid_when text[] not null default '{}',
  how_to_use text[] not null default '{}',
  strengths text[] not null default '{}',
  limitations text[] not null default '{}',
  example_output text not null default '',
  featured boolean not null default false,
  editors_pick boolean not null default false,
  sponsored boolean not null default false,
  sponsor_name text,
  affiliate boolean not null default false,
  seo_title text,
  meta_description text,
  og_image_url text,
  status public.resource_status not null default 'draft',
  published_at timestamptz,
  last_verified_at timestamptz,
  search_vector tsvector,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Editorial independence: a sponsored resource can never be an Editor's Pick.
  constraint sponsored_not_editors_pick check (not (sponsored and editors_pick))
);

create index resources_status_idx on public.resources (status);
create index resources_category_idx on public.resources (category_id);
create index resources_type_idx on public.resources (resource_type_id);
create index resources_normalized_url_idx on public.resources (normalized_url);
create index resources_search_idx on public.resources using gin (search_vector);
create index resources_title_trgm_idx on public.resources using gin (title extensions.gin_trgm_ops);
create index resources_published_at_idx on public.resources (published_at desc);

create table public.resource_tags (
  resource_id uuid not null references public.resources (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (resource_id, tag_id)
);
create index resource_tags_tag_idx on public.resource_tags (tag_id);

create table public.resource_terms (
  resource_id uuid not null references public.resources (id) on delete cascade,
  term_id uuid not null references public.taxonomy_terms (id) on delete cascade,
  primary key (resource_id, term_id)
);
create index resource_terms_term_idx on public.resource_terms (term_id);

-- Admin-only curation data. Kept out of `resources` so the exact score is
-- never readable by the public, while search functions can still rank on it.
create table public.resource_curation (
  resource_id uuid primary key references public.resources (id) on delete cascade,
  editorial_score smallint not null default 50 check (editorial_score between 0 and 100),
  internal_notes text not null default '',
  updated_at timestamptz not null default now()
);

create trigger resource_curation_updated_at before update on public.resource_curation
  for each row execute function public.set_updated_at();

create table public.resource_revisions (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources (id) on delete cascade,
  snapshot jsonb not null,
  changed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index resource_revisions_resource_idx on public.resource_revisions (resource_id, created_at desc);

-- Search document: title (A); summary, problem, tags (B); context lists,
-- category, type (C); long copy, author, organization (D).
create or replace function public.build_resource_search_vector(r public.resources)
returns tsvector
language sql stable set search_path = public as $$
  select
    setweight(to_tsvector('english', coalesce(r.title, '')), 'A') ||
    setweight(to_tsvector('english',
      coalesce(r.short_description, '') || ' ' || coalesce(r.problem_solved, '') || ' ' ||
      coalesce((select string_agg(t.name, ' ') from public.resource_tags rt
                join public.tags t on t.id = rt.tag_id where rt.resource_id = r.id), '')
    ), 'B') ||
    setweight(to_tsvector('english',
      array_to_string(r.best_for, ' ') || ' ' || array_to_string(r.use_when, ' ') || ' ' ||
      coalesce((select c.name from public.categories c where c.id = r.category_id), '') || ' ' ||
      coalesce((select s.name from public.subcategories s where s.id = r.subcategory_id), '') || ' ' ||
      coalesce((select ty.name || ' ' || ty.plural_name from public.resource_types ty where ty.id = r.resource_type_id), '')
    ), 'C') ||
    setweight(to_tsvector('english',
      coalesce(r.long_description, '') || ' ' || coalesce(r.author, '') || ' ' ||
      coalesce(r.organization, '') || ' ' || array_to_string(r.how_to_use, ' ')
    ), 'D');
$$;

create or replace function public.resources_before_write()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  -- Sponsored/affiliate state never changes curation: enforced by the check
  -- constraint above and by ranking functions ignoring these columns.
  new.search_vector := public.build_resource_search_vector(new);
  return new;
end;
$$;

create trigger resources_before_write before insert or update on public.resources
  for each row execute function public.resources_before_write();

-- Snapshot the previous version on every update (version history).
create or replace function public.resources_record_revision()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if to_jsonb(old) - 'search_vector' - 'updated_at' is distinct from to_jsonb(new) - 'search_vector' - 'updated_at' then
    insert into public.resource_revisions (resource_id, snapshot, changed_by)
    values (old.id, to_jsonb(old) - 'search_vector', auth.uid());
  end if;
  return new;
end;
$$;

create trigger resources_record_revision after update on public.resources
  for each row execute function public.resources_record_revision();

-- Re-index a resource when its tags change (tag names are in the vector).
create or replace function public.resource_tags_reindex()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.resources
     set search_vector = public.build_resource_search_vector(resources)
   where id = coalesce(new.resource_id, old.resource_id);
  return null;
end;
$$;

create trigger resource_tags_reindex after insert or delete on public.resource_tags
  for each row execute function public.resource_tags_reindex();

-- ---------------------------------------------------------------------------
-- Homepage blocks (CMS-driven homepage)
-- ---------------------------------------------------------------------------
-- config shape depends on block_type, validated in the app (lib/validation):
--   hero:            { search_placeholder, primary_cta: {label, href}, secondary_cta: {label, href} }
--   popular_tasks:   { items: [{ label, description, href }] }
--   featured_resources / editors_picks: { resource_ids?: uuid[], limit }
--   most_popular / recently_added: { limit }
--   categories:      { limit }
--   browse_terms:    { kind: taxonomy_kind }
--   newsletter:      { cta_label, note }
create table public.homepage_blocks (
  id uuid primary key default gen_random_uuid(),
  block_type public.homepage_block_type not null,
  heading text not null default '',
  subheading text not null default '',
  position integer not null default 0,
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger homepage_blocks_updated_at before update on public.homepage_blocks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Submissions (never auto-publish)
-- ---------------------------------------------------------------------------
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  resource_name text not null check (char_length(resource_name) between 1 and 200),
  resource_url text not null check (resource_url ~* '^https?://'),
  normalized_url text not null,
  description text not null default '' check (char_length(description) <= 2000),
  category_id uuid references public.categories (id) on delete set null,
  resource_type_id uuid references public.resource_types (id) on delete set null,
  creator text check (char_length(creator) <= 200),
  price_type public.price_type,
  why_useful text not null default '' check (char_length(why_useful) <= 2000),
  submitter_email text not null check (char_length(submitter_email) <= 320),
  status public.submission_status not null default 'pending',
  review_notes text not null default '',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  resource_id uuid references public.resources (id) on delete set null,
  created_at timestamptz not null default now()
);
create index submissions_status_idx on public.submissions (status, created_at desc);

-- ---------------------------------------------------------------------------
-- First-party analytics (no cookies, no IPs stored)
-- ---------------------------------------------------------------------------
create table public.resource_views (
  id bigint generated always as identity primary key,
  resource_id uuid not null references public.resources (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  referrer_path text,
  created_at timestamptz not null default now()
);
create index resource_views_resource_idx on public.resource_views (resource_id, created_at desc);
create index resource_views_created_idx on public.resource_views (created_at desc);

create table public.resource_clicks (
  id bigint generated always as identity primary key,
  resource_id uuid not null references public.resources (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  -- true when the click came from the resource detail page (North Star input)
  from_detail_page boolean not null default false,
  search_query_id bigint,
  created_at timestamptz not null default now()
);
create index resource_clicks_resource_idx on public.resource_clicks (resource_id, created_at desc);
create index resource_clicks_created_idx on public.resource_clicks (created_at desc);

create table public.search_queries (
  id bigint generated always as identity primary key,
  query text not null,
  normalized_query text not null,
  filters jsonb not null default '{}'::jsonb,
  result_count integer not null,
  clicked_resource_id uuid references public.resources (id) on delete set null,
  user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index search_queries_normalized_idx on public.search_queries (normalized_query);
create index search_queries_created_idx on public.search_queries (created_at desc);

alter table public.resource_clicks
  add constraint resource_clicks_search_fk foreign key (search_query_id)
  references public.search_queries (id) on delete set null;

-- Simple fixed-window rate limiter. Keys are opaque hashes computed by the
-- app server (never raw IPs).
create table public.rate_limits (
  key text not null,
  bucket text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, bucket, window_start)
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.nav_items enable row level security;
alter table public.pages enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.resource_types enable row level security;
alter table public.tags enable row level security;
alter table public.taxonomy_terms enable row level security;
alter table public.resources enable row level security;
alter table public.resource_tags enable row level security;
alter table public.resource_terms enable row level security;
alter table public.resource_curation enable row level security;
alter table public.resource_revisions enable row level security;
alter table public.homepage_blocks enable row level security;
alter table public.submissions enable row level security;
alter table public.resource_views enable row level security;
alter table public.resource_clicks enable row level security;
alter table public.search_queries enable row level security;
alter table public.rate_limits enable row level security;

-- profiles: own row, or admins see everyone. Role changes guarded by trigger.
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy profiles_update_self on public.profiles for update
  using (id = auth.uid() or public.is_super_admin())
  with check (id = auth.uid() or public.is_super_admin());

-- site settings / nav / pages / homepage: public read, admin write.
create policy site_settings_read on public.site_settings for select using (true);
create policy site_settings_write on public.site_settings for update
  using (public.is_admin()) with check (public.is_admin());

create policy nav_items_read on public.nav_items for select using (enabled or public.is_admin());
create policy nav_items_write on public.nav_items for all
  using (public.is_admin()) with check (public.is_admin());

create policy pages_read on public.pages for select using (published or public.is_editor());
create policy pages_write on public.pages for all
  using (public.is_admin()) with check (public.is_admin());

create policy homepage_blocks_read on public.homepage_blocks for select using (enabled or public.is_admin());
create policy homepage_blocks_write on public.homepage_blocks for all
  using (public.is_admin()) with check (public.is_admin());

-- taxonomy: public read; admins manage structure, editors may add tags.
create policy categories_read on public.categories for select using (is_published or public.is_editor());
create policy categories_write on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy subcategories_read on public.subcategories for select using (true);
create policy subcategories_write on public.subcategories for all
  using (public.is_admin()) with check (public.is_admin());

create policy resource_types_read on public.resource_types for select using (true);
create policy resource_types_write on public.resource_types for all
  using (public.is_admin()) with check (public.is_admin());

create policy taxonomy_terms_read on public.taxonomy_terms for select using (true);
create policy taxonomy_terms_write on public.taxonomy_terms for all
  using (public.is_admin()) with check (public.is_admin());

create policy tags_read on public.tags for select using (true);
create policy tags_insert on public.tags for insert with check (public.is_editor());
create policy tags_update on public.tags for update using (public.is_editor()) with check (public.is_editor());
create policy tags_delete on public.tags for delete using (public.is_admin());

-- resources: public sees published only; editors create/edit; admins delete.
create policy resources_read on public.resources for select
  using (status = 'published' or public.is_editor());
create policy resources_insert on public.resources for insert with check (public.is_editor());
create policy resources_update on public.resources for update
  using (public.is_editor()) with check (public.is_editor());
create policy resources_delete on public.resources for delete using (public.is_admin());

create policy resource_tags_read on public.resource_tags for select using (
  public.is_editor() or exists (select 1 from public.resources r where r.id = resource_id and r.status = 'published')
);
create policy resource_tags_write on public.resource_tags for all
  using (public.is_editor()) with check (public.is_editor());

create policy resource_terms_read on public.resource_terms for select using (
  public.is_editor() or exists (select 1 from public.resources r where r.id = resource_id and r.status = 'published')
);
create policy resource_terms_write on public.resource_terms for all
  using (public.is_editor()) with check (public.is_editor());

create policy resource_curation_all on public.resource_curation for all
  using (public.is_editor()) with check (public.is_editor());

create policy resource_revisions_read on public.resource_revisions for select using (public.is_editor());
-- (inserted only by the SECURITY DEFINER trigger)

-- submissions: anyone may create a *pending* submission; staff moderate.
create policy submissions_insert on public.submissions for insert
  with check (status = 'pending' and reviewed_by is null and reviewed_at is null and resource_id is null);
create policy submissions_read on public.submissions for select using (public.is_editor());
create policy submissions_update on public.submissions for update
  using (public.is_editor()) with check (public.is_editor());
create policy submissions_delete on public.submissions for delete using (public.is_admin());

-- analytics: written only through SECURITY DEFINER functions; admins read.
create policy resource_views_read on public.resource_views for select using (public.is_admin());
create policy resource_clicks_read on public.resource_clicks for select using (public.is_admin());
create policy search_queries_read on public.search_queries for select using (public.is_admin());
-- rate_limits: no policies => no direct access; used via check_rate_limit().

-- ---------------------------------------------------------------------------
-- Storage: public-read media bucket, editor uploads, images only, 5 MB.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do nothing;

create policy media_editor_insert on storage.objects for insert
  with check (bucket_id = 'media' and public.is_editor());
create policy media_editor_update on storage.objects for update
  using (bucket_id = 'media' and public.is_editor());
create policy media_admin_delete on storage.objects for delete
  using (bucket_id = 'media' and public.is_admin());
