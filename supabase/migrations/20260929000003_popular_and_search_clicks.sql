-- PM Vault — 0003 honest "Most popular" + search result click attribution.

-- Most popular = real activity only (views + 3x outbound clicks, 30 days).
-- Returns nothing when there is no activity, so the homepage never labels
-- editorially-ordered resources as "popular".
create or replace function public.popular_resources(p_limit integer default 4)
returns table (
  id uuid, slug text, title text, short_description text, thumbnail_url text,
  thumbnail_alt text, price_type public.price_type, difficulty public.difficulty,
  organization text, author text, editors_pick boolean, sponsored boolean,
  featured boolean, category_name text, category_slug text, type_name text,
  type_slug text, published_at timestamptz, score double precision, total_count bigint
)
language sql stable security definer set search_path = public as $$
  with events as (
    select resource_id, sum(w)::double precision as n from (
      select resource_id, 1 as w from public.resource_views where created_at > now() - interval '30 days'
      union all
      select resource_id, 3 as w from public.resource_clicks where created_at > now() - interval '30 days'
    ) e group by resource_id
  )
  select r.id, r.slug, r.title, r.short_description, r.thumbnail_url, r.thumbnail_alt,
         r.price_type, r.difficulty, r.organization, r.author, r.editors_pick, r.sponsored,
         r.featured, c.name, c.slug, ty.name, ty.slug, r.published_at, ev.n, count(*) over ()
  from events ev
  join public.resources r on r.id = ev.resource_id and r.status = 'published'
  left join public.categories c on c.id = r.category_id
  left join public.resource_types ty on ty.id = r.resource_type_id
  order by ev.n desc, r.title
  limit least(greatest(p_limit, 1), 24);
$$;
grant execute on function public.popular_resources(integer) to anon, authenticated;

-- Records which result a searcher opened (per-query result CTR).
-- Only the first click per search is kept; only recent searches qualify.
create or replace function public.log_search_click(p_search_query_id bigint, p_resource_id uuid)
returns void
language sql volatile security definer set search_path = public as $$
  update public.search_queries q
     set clicked_resource_id = p_resource_id
   where q.id = p_search_query_id
     and q.clicked_resource_id is null
     and q.created_at > now() - interval '1 hour'
     and exists (select 1 from public.resources r where r.id = p_resource_id and r.status = 'published');
$$;
grant execute on function public.log_search_click(bigint, uuid) to anon, authenticated;
