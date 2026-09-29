# PM Vault — Setup

## 1. Prerequisites

- Node.js 20.9+ (developed on Node 24)
- A Supabase project (free tier is fine) — https://supabase.com

No Docker or Supabase CLI is required; migrations are run in the Supabase SQL editor.

## 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` (never commit it):

| Variable | Where to find it | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` public key | Yes (safe: RLS enforces access) |
| `NEXT_PUBLIC_SITE_URL` | Your public origin, e.g. `http://localhost:3000` | Yes |
| `RATE_LIMIT_SALT` | Any long random string | No (server only) |

The app never uses the Supabase **service-role** key. Do not add it.

## 3. Database

Run each file in `supabase/migrations/` **in filename order** in Supabase → SQL Editor:

1. `20260929000001_core_schema.sql` — tables, enums, triggers, RLS, storage bucket
2. `20260929000002_search_and_analytics.sql` — grants, search, recommendations, analytics functions
3. `20260929000003_popular_and_search_clicks.sql` — "Most popular" (real activity only) and search-result click logging

Never edit a migration that has already been applied — add a new file instead.

### Local-development seed (optional)

`supabase/seed.sql` adds sample categories, taxonomy, ~16 resources and homepage blocks so pages have data. **Development only** — do not treat it as production content. Run it in the SQL editor after the migrations. It is idempotent.

## 4. Auth configuration (Supabase dashboard)

- Authentication → Providers → **Email**: enabled (magic link).
- Authentication → URL Configuration:
  - Site URL: your `NEXT_PUBLIC_SITE_URL`
  - Redirect URLs: add `http://localhost:3000/auth/callback` (and your production `/auth/callback`).
- Google OAuth is planned for P1 (member accounts).

## 5. Create the first admin

1. Run the app (`npm run dev`), open `/login`, and sign in with your email.
2. In the Supabase SQL editor, run (replace the email):

```sql
update public.profiles set role = 'super_admin' where email = 'you@example.com';
```

3. Visit `/admin`.

Roles: `member` (default) → `editor` (create/edit resources, moderate submissions) → `admin` (taxonomy, homepage, settings, delete, analytics) → `super_admin` (change roles). Role changes by anyone other than a `super_admin` are blocked by a database trigger.

## 6. Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck  # next typegen && tsc --noEmit
npm test           # vitest
npm run build
```

## 7. Managing content (no code, no deploy)

| Task | Where |
|---|---|
| Add / edit / publish / unpublish a resource | `/admin/resources` → Add resource. Save draft · Submit for review · Publish · Preview |
| Bulk import | `/admin/import` → upload CSV or JSON → review every row → import valid rows as **drafts** → `/admin/resources?status=draft` → select → "Set to Published" |
| New category (gets `/category/<slug>` automatically) | `/admin/categories` → Add category (editorial intro + SEO fields) |
| Subcategories | Open a category → Subcategories |
| Resource types (`/type/<slug>`), tags, filter values | `/admin/types`, `/admin/tags`, `/admin/filters` |
| Homepage blocks (order, headings, hand-picked resources) | `/admin/homepage` |
| Header links / About & Privacy pages / site name & SEO defaults | `/admin/navigation`, `/admin/pages`, `/admin/settings` |
| Community submissions | `/admin/submissions` → Approve creates a **draft** · Reject |
| Search analytics & content gaps | `/admin/analytics` |

Every admin change purges the cached public pages and the sitemap immediately.

**Roles in the UI:** editors see Resources, Submissions, Import and Tags; admins also see taxonomy, homepage, navigation, pages, analytics and settings, and can delete. The database enforces the same rules (RLS), independent of the UI.

## 8. Not yet built (later phases)

Member accounts & Google sign-in, saved resources, collections, newsletter, broken-link monitoring, voting, playbooks, AI features (P1+). The resource card has no Save button until accounts ship.

## 9. Known limitations (MVP)

- Analytics logging functions (`log_resource_view`, `log_search`, `log_resource_click`) are callable by anyone with the public anon key, so popularity numbers could be inflated by a determined abuser. Popularity is only 15% of ranking and editorial score outweighs it. Revisit (server-side secret or edge rate limiting) before scaling.
- The rate limiter is a simple Postgres fixed-window counter keyed by a salted daily hash of the client IP; raw IPs are never stored.
- No cookies are set for anonymous analytics, so session-level metrics (session depth, returning visitors) are not yet captured. Add them only with a consent mechanism.
- `user_rating` in the ranking formula is 0 for all resources until voting ships (P2); it does not affect ordering.
- Import files are capped at 500 rows / 700 KB (Next.js server-action body limit is 1 MB). Split larger datasets.
- Analytics skip requests from obvious bots (user-agent heuristic); sophisticated bots can still be counted.
