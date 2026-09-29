-- PM Vault — 0002 search, recommendations, analytics and grants.

-- ---------------------------------------------------------------------------
-- Explicit API grants (RLS still decides which rows are visible/writable).
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.site_settings, public.nav_items, public.pages, public.categories,
  public.subcategories, public.resource_types, public.tags, public.taxonomy_terms,
  public.resources, public.resource_tags, public.resource_terms, public.homepage_blocks
  to anon, authenticated;

grant insert, update, delete on public.site_settings, public.nav_items, public.pages,
  public.categories, public.subcategories, public.resource_types, public.tags,
  public.taxonomy_terms, public.resources, public.resource_tags, public.resource_terms,
  public.homepage_blocks, public.resource_curation
  to authenticated;

grant select on public.profiles, public.resource_curation, public.resource_revisions,
  public.resource_views, public.resource_clicks, public.search_queries, public.submissions
  to authenticated;
grant update on public.profiles, public.submissions to authenticated;
grant delete on public.submissions to authenticated;
grant insert on public.submissions to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Keep the search index fresh when taxonomy names change.
-- ---------------------------------------------------------------------------
create or replace function public.reindex_resources_for_taxonomy()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.name is distinct from old.name then
    if tg_table_name = 'categories' then
      update public.resources set search_vector = public.build_resource_search_vector(resources) where category_id = new.id;
    elsif tg_table_name = 'subcategories' then
      update public.resources set search_vector = public.build_resource_search_vector(resources) where subcategory_id = new.id;
    elsif tg_table_name = 'resource_types' then
      update public.resources set search_vector = public.build_resource_search_vector(resources) where resource_type_id = new.id;
    elsif tg_table_name = 'tags' then
      update public.resources set search_vector = public.build_resource_search_vector(resources)
       where id in (select resource_id from public.resource_tags where tag_id = new.id);
    end if;
  end if;
  return null;
end;
$$;

create trigger categories_reindex after update on public.categories
  for each row execute function public.reindex_resources_for_taxonomy();
create trigger subcategories_reindex after update on public.subcategories
  for each row execute function public.reindex_resources_for_taxonomy();
create trigger resource_types_reindex after update on public.resource_types
  for each row execute function public.reindex_resources_for_taxonomy();
create trigger tags_reindex after update on public.tags
  for each row execute function public.reindex_resources_for_taxonomy();

-- ---------------------------------------------------------------------------
-- Popularity: views + 3x outbound clicks over the last 90 days.
-- ---------------------------------------------------------------------------
create or replace function public.resource_popularity_raw()
returns table (resource_id uuid, events bigint)
language sql stable security definer set search_path = public as $$
  select resource_id, sum(w)::bigint as events from (
    select resource_id, 1 as w from public.resource_views where created_at > now() - interval '90 days'
    union all
    select resource_id, 3 as w from public.resource_clicks where created_at > now() - interval '90 days'
  ) e group by resource_id;
$$;
revoke execute on function public.resource_popularity_raw() from public, anon, authenticated;

-- Turns free text (including natural-language questions) into an OR query of
-- stemmed, prefix-matched lexemes: "I need to prioritize features" →
-- 'need':* | 'priorit':* | 'featur':*. Ranking rewards matching more terms.
create or replace function public.build_search_tsquery(p_query text)
returns tsquery
language sql immutable set search_path = public as $$
  select case when count(*) = 0 then null
         else string_agg(quote_literal(lexeme) || ':*', ' | ')::tsquery end
  from unnest(to_tsvector('english', coalesce(p_query, '')));
$$;

-- ---------------------------------------------------------------------------
-- Search / listing.
-- score = text_relevance*0.40 + editorial*0.25 + popularity*0.15
--       + recency*0.10 + user_rating*0.10
-- user_rating is 0 for everyone until voting ships (P2), so it does not
-- change ordering. `sponsored` is deliberately never used in ranking.
-- ---------------------------------------------------------------------------
create or replace function public.search_resources(
  p_query text default null,
  p_category_id uuid default null,
  p_subcategory_id uuid default null,
  p_type_ids uuid[] default null,
  p_prices public.price_type[] default null,
  p_difficulties public.difficulty[] default null,
  p_term_ids uuid[] default null,
  p_sort text default 'relevance',
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  id uuid, slug text, title text, short_description text, thumbnail_url text,
  thumbnail_alt text, price_type public.price_type, difficulty public.difficulty,
  organization text, author text, editors_pick boolean, sponsored boolean,
  featured boolean, category_name text, category_slug text, type_name text,
  type_slug text, published_at timestamptz, score double precision, total_count bigint
)
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  v_query text := nullif(btrim(left(coalesce(p_query, ''), 200)), '');
  v_tsq tsquery := public.build_search_tsquery(v_query);
begin
  return query
  with pop as (
    select pr.resource_id, pr.events from public.resource_popularity_raw() pr
  ),
  pop_max as (select greatest(max(events), 1) as m from pop),
  base as (
    select r.*,
      case when v_query is null then 0::double precision
           else greatest(
             case when v_tsq is null then 0 else ts_rank_cd(r.search_vector, v_tsq, 32) end,
             similarity(r.title, v_query) * 0.8
           )::double precision
      end as text_rel,
      coalesce(cu.editorial_score, 50) / 100.0 as editorial,
      coalesce(ln(1 + p.events) / ln(1 + (select m from pop_max)), 0) as popularity,
      exp(-extract(epoch from (now() - coalesce(r.published_at, r.created_at))) / 86400.0 / 180.0) as recency,
      coalesce(p.events, 0) as pop_events
    from public.resources r
    left join public.resource_curation cu on cu.resource_id = r.id
    left join pop p on p.resource_id = r.id
    where r.status = 'published'
      and (v_query is null
           or (v_tsq is not null and r.search_vector @@ v_tsq)
           or r.title % v_query
           or r.title ilike '%' || v_query || '%')
      and (p_category_id is null or r.category_id = p_category_id
           or exists (select 1 from public.subcategories s where s.id = r.subcategory_id and s.category_id = p_category_id))
      and (p_subcategory_id is null or r.subcategory_id = p_subcategory_id)
      and (p_type_ids is null or cardinality(p_type_ids) = 0 or r.resource_type_id = any(p_type_ids))
      and (p_prices is null or cardinality(p_prices) = 0 or r.price_type = any(p_prices))
      and (p_difficulties is null or cardinality(p_difficulties) = 0 or r.difficulty = any(p_difficulties))
      -- Terms: OR within a dimension, AND across dimensions.
      and (p_term_ids is null or cardinality(p_term_ids) = 0 or not exists (
        select 1 from public.taxonomy_terms sel
        where sel.id = any(p_term_ids)
          and not exists (
            select 1 from public.resource_terms rt
            join public.taxonomy_terms t on t.id = rt.term_id
            where rt.resource_id = r.id and t.kind = sel.kind and t.id = any(p_term_ids)
          )
      ))
  ),
  scored as (
    select b.*,
      (case when v_query is null then 0
            else b.text_rel / nullif(max(b.text_rel) over (), 0) end) as text_norm
    from base b
  ),
  final as (
    select s.*,
      (coalesce(s.text_norm, 0) * 0.40 + s.editorial * 0.25 + s.popularity * 0.15 + s.recency * 0.10 + 0 * 0.10)::double precision as final_score
    from scored s
  )
  select f.id, f.slug, f.title, f.short_description, f.thumbnail_url, f.thumbnail_alt,
         f.price_type, f.difficulty, f.organization, f.author, f.editors_pick, f.sponsored,
         f.featured, c.name, c.slug, ty.name, ty.slug, f.published_at, f.final_score,
         count(*) over ()
  from final f
  left join public.categories c on c.id = f.category_id
  left join public.resource_types ty on ty.id = f.resource_type_id
  order by
    case when p_sort = 'newest' then extract(epoch from f.published_at) end desc nulls last,
    case when p_sort = 'popular' then f.pop_events end desc nulls last,
    f.final_score desc,
    f.title asc
  limit least(greatest(p_limit, 1), 100)
  offset greatest(p_offset, 0);
end;
$$;

grant execute on function public.search_resources(text, uuid, uuid, uuid[], public.price_type[], public.difficulty[], uuid[], text, integer, integer) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Rules-based recommendations (Phase 1).
-- ---------------------------------------------------------------------------
create or replace function public.similar_resources(p_resource_id uuid, p_limit integer default 4)
returns table (
  id uuid, slug text, title text, short_description text, thumbnail_url text,
  thumbnail_alt text, price_type public.price_type, difficulty public.difficulty,
  organization text, author text, editors_pick boolean, sponsored boolean,
  featured boolean, category_name text, category_slug text, type_name text,
  type_slug text, published_at timestamptz, score double precision, total_count bigint
)
language sql stable security definer set search_path = public as $$
  with src as (select * from public.resources where id = p_resource_id),
  candidates as (
    select r.*,
      (case when r.category_id = (select category_id from src) then 3 else 0 end
       + case when r.subcategory_id is not null and r.subcategory_id = (select subcategory_id from src) then 2 else 0 end
       + 2 * (select count(*) from public.resource_tags a join public.resource_tags b on a.tag_id = b.tag_id
              where a.resource_id = r.id and b.resource_id = p_resource_id)
       + (select count(*) from public.resource_terms a join public.resource_terms b on a.term_id = b.term_id
              where a.resource_id = r.id and b.resource_id = p_resource_id)
       + case when r.difficulty = (select difficulty from src) then 1 else 0 end
       + case when r.resource_type_id = (select resource_type_id from src) then 1 else 0 end
      )::double precision
      + coalesce(cu.editorial_score, 50) / 1000.0 as sim
    from public.resources r
    left join public.resource_curation cu on cu.resource_id = r.id
    where r.status = 'published' and r.id <> p_resource_id
  )
  select c.id, c.slug, c.title, c.short_description, c.thumbnail_url, c.thumbnail_alt,
         c.price_type, c.difficulty, c.organization, c.author, c.editors_pick, c.sponsored,
         c.featured, cat.name, cat.slug, ty.name, ty.slug, c.published_at, c.sim, count(*) over ()
  from candidates c
  left join public.categories cat on cat.id = c.category_id
  left join public.resource_types ty on ty.id = c.resource_type_id
  where c.sim >= 1
  order by c.sim desc, c.title
  limit least(greatest(p_limit, 1), 12);
$$;

grant execute on function public.similar_resources(uuid, integer) to anon, authenticated;

-- Published-resource counts per category (for category cards / sitemap).
create or replace function public.category_resource_counts()
returns table (category_id uuid, resource_count bigint)
language sql stable security definer set search_path = public as $$
  select category_id, count(*) from public.resources
  where status = 'published' and category_id is not null
  group by category_id;
$$;
grant execute on function public.category_resource_counts() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Rate limiting (fixed window). Returns true when the call is allowed.
-- ---------------------------------------------------------------------------
create or replace function public.check_rate_limit(p_key text, p_bucket text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql volatile security definer set search_path = public as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits integer;
begin
  if char_length(p_key) > 128 or char_length(p_bucket) > 64 or p_max < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit arguments';
  end if;
  insert into public.rate_limits (key, bucket, window_start, hits)
  values (p_key, p_bucket, v_window, 1)
  on conflict (key, bucket, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into v_hits;
  -- Opportunistic cleanup of old windows.
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;
  return v_hits <= p_max;
end;
$$;
grant execute on function public.check_rate_limit(text, text, integer, integer) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Event logging (published resources only; no IPs, no cookies).
-- ---------------------------------------------------------------------------
create or replace function public.log_resource_view(p_resource_id uuid, p_referrer_path text default null)
returns void
language sql volatile security definer set search_path = public as $$
  insert into public.resource_views (resource_id, user_id, referrer_path)
  select r.id, auth.uid(), left(p_referrer_path, 300)
  from public.resources r where r.id = p_resource_id and r.status = 'published';
$$;
grant execute on function public.log_resource_view(uuid, text) to anon, authenticated;

-- Logs an outbound click and returns the destination, so /go/[slug] needs a
-- single round-trip. Returns null for unknown or unpublished resources.
create or replace function public.log_resource_click(p_slug text, p_from_detail boolean default false, p_search_query_id bigint default null)
returns text
language plpgsql volatile security definer set search_path = public as $$
declare
  v_id uuid;
  v_url text;
begin
  select id, external_url into v_id, v_url from public.resources
  where slug = p_slug and status = 'published';
  if v_id is null then
    return null;
  end if;
  insert into public.resource_clicks (resource_id, user_id, from_detail_page, search_query_id)
  values (v_id, auth.uid(), coalesce(p_from_detail, false),
          (select id from public.search_queries where id = p_search_query_id));
  if p_search_query_id is not null then
    update public.search_queries set clicked_resource_id = v_id
    where id = p_search_query_id and clicked_resource_id is null;
  end if;
  return v_url;
end;
$$;
grant execute on function public.log_resource_click(text, boolean, bigint) to anon, authenticated;

create or replace function public.log_search(p_query text, p_filters jsonb, p_result_count integer)
returns bigint
language plpgsql volatile security definer set search_path = public as $$
declare
  v_query text := btrim(left(coalesce(p_query, ''), 200));
  v_id bigint;
begin
  if v_query = '' then
    return null;
  end if;
  insert into public.search_queries (query, normalized_query, filters, result_count, user_id)
  values (v_query, lower(regexp_replace(v_query, '\s+', ' ', 'g')),
          coalesce(p_filters, '{}'::jsonb), greatest(p_result_count, 0), auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;
grant execute on function public.log_search(text, jsonb, integer) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Admin insights (SECURITY INVOKER + explicit admin check).
-- ---------------------------------------------------------------------------
create or replace function public.admin_search_insights(p_days integer default 30, p_limit integer default 50)
returns table (normalized_query text, searches bigint, zero_result_searches bigint, clicks bigint, ctr double precision, avg_results double precision)
language plpgsql stable set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  return query
  select q.normalized_query, count(*),
         count(*) filter (where q.result_count = 0),
         count(q.clicked_resource_id),
         count(q.clicked_resource_id)::double precision / count(*),
         avg(q.result_count)::double precision
  from public.search_queries q
  where q.created_at > now() - make_interval(days => p_days)
  group by q.normalized_query
  order by count(*) desc
  limit p_limit;
end;
$$;
grant execute on function public.admin_search_insights(integer, integer) to authenticated;

create or replace function public.admin_top_resources(p_days integer default 30, p_limit integer default 10)
returns table (resource_id uuid, title text, slug text, views bigint, clicks bigint, ctr double precision)
language plpgsql stable set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  return query
  with v as (select rv.resource_id, count(*) n from public.resource_views rv
             where rv.created_at > now() - make_interval(days => p_days) group by rv.resource_id),
       c as (select rc.resource_id, count(*) n from public.resource_clicks rc
             where rc.created_at > now() - make_interval(days => p_days) group by rc.resource_id)
  select r.id, r.title, r.slug, coalesce(v.n, 0), coalesce(c.n, 0),
         case when coalesce(v.n, 0) = 0 then 0 else coalesce(c.n, 0)::double precision / v.n end
  from public.resources r
  left join v on v.resource_id = r.id
  left join c on c.resource_id = r.id
  where coalesce(v.n, 0) + coalesce(c.n, 0) > 0
  order by coalesce(c.n, 0) desc, coalesce(v.n, 0) desc
  limit p_limit;
end;
$$;
grant execute on function public.admin_top_resources(integer, integer) to authenticated;

-- North Star: weekly useful discoveries = outbound clicks from the detail page
-- (saves and "useful" votes join this once those features ship in P1/P2).
create or replace function public.admin_metrics(p_days integer default 7)
returns jsonb
language plpgsql stable set search_path = public as $$
declare
  v_since timestamptz := now() - make_interval(days => p_days);
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  return jsonb_build_object(
    'views', (select count(*) from public.resource_views where created_at > v_since),
    'clicks', (select count(*) from public.resource_clicks where created_at > v_since),
    'useful_discoveries', (select count(*) from public.resource_clicks where created_at > v_since and from_detail_page),
    'searches', (select count(*) from public.search_queries where created_at > v_since),
    'zero_result_searches', (select count(*) from public.search_queries where created_at > v_since and result_count = 0),
    'searches_with_click', (select count(*) from public.search_queries where created_at > v_since and clicked_resource_id is not null)
  );
end;
$$;
grant execute on function public.admin_metrics(integer) to authenticated;
