# CLAUDE.md — PM Vault

This file gives Claude Code the context it needs to work on this repository.
Read it fully at the start of every session.

> **Mandatory:** All rules in `rule.md` apply to every action in this repository and take priority over anything in this file.
> @rule.md

---

## 1. Project Overview

**PM Vault** (working name; alternatives: PM Resource Vault, Product Stash, Product Playbook) is a **curated decision engine for Product Managers** — not another link directory.

The product answers one question:

> "I am trying to accomplish X as a Product Manager. What is the best resource I should use?"

Every resource carries editorial context: what it is, the problem it solves, when to use it, when **not** to use it, who it's for, price, difficulty, format, time to use, example output, strengths, limitations, alternatives and related workflows.

**Positioning:** "The curated operating system for Product Managers."

**Target users:** Aspiring PMs, early-career PMs, senior PMs, technical PMs, AI PMs, founders, product leaders.

---

## 2. Product Principles (apply these to every design and code decision)

1. **Quality over quantity** — curated, contextual resources beat large link dumps.
2. **Task-first discovery** — flow is `Problem → Resource → Template → Action`, not `Category → Links`.
3. **Actionability** — every resource explains what, why, when, how, and expected output.
4. **Trust** — show source, author, date added, last reviewed, curation status, free/paid, editorial recommendation.
5. **Content without deployment** — adding or changing content must **never** require a code change.

---

## 3. Non-Negotiable Architecture Rules

- **No hardcoded content.** Never store resources, categories, collections, homepage blocks or SEO copy in source files (no `resources.ts`, `resources.json`, seed arrays used in production). All production content comes from the database.
- **Dynamic categories.** The frontend must never contain logic like `if (category === 'prd')`. Category pages are generated from database records by slug (e.g. `/category/[slug]`). A new category created in admin must get a working public URL with zero code changes.
- **CMS-driven homepage.** Homepage blocks (hero, featured categories, editor's picks, trending, collections, newsletter, newly added) are configured in the database: enable/disable, heading, order, selected resources.
- **Server-side authorization.** Admin routes and APIs must enforce roles on the server and via database policies (Supabase RLS). Hidden UI is never security.
- **Editorial independence.** Sponsored placement must never affect editorial score, Editor's Pick, or organic ranking. Sponsored items are always labelled **Sponsored**.
- **AI never auto-publishes.** AI-assisted curation produces drafts only; a human publishes.
- **Submissions never auto-publish.** User submissions start as `Pending` and require admin moderation.

A developer should only be needed to change application behavior, the data model, or add platform capabilities — never to add resources, categories, collections, homepage content, descriptions or SEO copy.

---

## 4. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript (strict), Tailwind CSS |
| Backend | Next.js server actions / route handlers |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth — Google OAuth + email magic link |
| Storage | Supabase Storage (thumbnails, OG images, uploaded documents) |
| Search (MVP) | PostgreSQL full-text search |
| Search (later) | Algolia / Typesense / Meilisearch, then vector/semantic search |
| Analytics | Product analytics platform + Google Search Console + web analytics |

Do not introduce a new framework, database, or paid service without human approval (see `rule.md`).

### Repository structure

```
/app          # Next.js routes (public + /admin)
/components   # UI components
/lib          # shared utilities, supabase clients, validation schemas
/services     # data access and business logic
/types        # shared TypeScript types
/admin        # admin-specific components/logic
/api          # API route handlers
/supabase     # migrations, RLS policies, seed data for LOCAL DEV ONLY
```

---

## 5. Data Model (core tables)

- **resources** — `id, title, slug, short_description, long_description, external_url, thumbnail_url, resource_type_id, category_id, subcategory_id, price_type, difficulty, estimated_time, author, organization, best_for, use_when, avoid_when, how_to_use, strengths, limitations, editorial_score (0–100, admin-only), featured, editors_pick, sponsored, status, last_verified_at, published_at, created_at, updated_at, created_by, updated_by`
- **categories** — `id, name, slug, description, icon, seo_title, meta_description, display_order`
- **subcategories** — `id, category_id, name, slug`
- **resource_types** — dynamic (Template, Framework, Article, Guide, Video, Tool, Course, Example, Checklist, Cheat sheet — admin can add more)
- **tags**, **resource_tags**
- **personas**, **resource_personas**
- **collections** — `id, title, slug, description, image, difficulty, estimated_time, target_persona`
- **collection_resources** — `collection_id, resource_id, position`
- **homepage_blocks** — type, heading, order, enabled, config/selected resources
- **users** — `id, email, name, avatar, role`
- **saved_resources** — `user_id, resource_id, folder_id, created_at`
- **submissions** — `id, resource_url, resource_name, description, category, resource_type, creator, price, why_useful, submitter_email, status, created_at`
- **votes** — `user_id, resource_id, vote`
- **resource_clicks** — `resource_id, user_id, session_id, timestamp`
- **search_queries** — query, result count, clicked result (for search analytics & zero-result content gaps)
- **resource_revisions** — previous versions for version history

**Resource status:** `draft | in_review | published | archived | broken_link` (+ `needs_review` queue from link checks and freshness).

**User roles:** `visitor | member | editor | admin | super_admin`.

All schema changes go through versioned migration files. Never modify the database by hand or edit an already-applied migration.

---

## 6. Key Features & Behaviour

### Public site
- **Navigation:** Home, Resources, Templates, Frameworks, Tools, Examples, Collections, AI for PM, Learn, Submit Resource. Search bar always visible.
- **Homepage hero:** "Everything a Product Manager needs. Curated." Primary search: "What are you trying to accomplish?"
- **Resource card:** thumbnail, name, short description, source, category, type, free/paid badge, difficulty, Editor's Pick indicator, save button. CTA is **View Resource** (goes to detail page), not "Visit Website".
- **Resource detail page** (`/resource/[slug]`): breadcrumbs, title, value prop, preview, metadata, **Open Resource** (new tab), Editorial Overview, Best For, Use This When, Avoid This When, How To Use, Example, Strengths, Limitations, Similar Resources, Related Categories.
- **Filters:** resource type, price, experience, career level, product type, stage, format. On mobile, filters open in a bottom sheet.
- **Browse:** by category, career stage, product type; collections; editor's picks; most popular; recently added.

### Search ranking (initial)
```
score = text_relevance*0.40 + editorial_quality*0.25 + popularity*0.15 + recency*0.10 + user_rating*0.10
```
Search fields: title, description, tags, category, problem solved, use cases, author, tool, resource type. Log every query; store zero-result queries as content gaps.

### Recommendations
Phase 1 rules-based: same category, tags, persona, difficulty, product stage. Phase 2: embeddings.

### Admin (`/admin`)
Dashboard, Resources, Categories, Subcategories, Tags, Collections, Playbooks, Submissions, Users, Newsletter, Homepage, SEO, Analytics, Settings.
- Resource form: basic info, classification, product context, metadata, editorial info, source, curation, SEO → Save Draft / Preview / Publish.
- **CSV bulk import:** parse → validate required fields → detect duplicates → show errors → preview → import valid rows **as Draft** → bulk publish.
- **JSON import** for structured datasets.
- **Duplicate detection:** normalize URL, check DB, show "Possible Duplicate".
- **Broken link detection:** recurring health checks; mark `Needs Review`, never auto-delete.
- **Version history:** created/updated by, dates, previous revision.

### External links
Open in new tab with `rel="noopener noreferrer"` (add `sponsored` / `nofollow` where appropriate), track outbound click, clearly identify destination. Affiliate links must be disclosed.

### SEO
Every public page: unique `<title>`, meta description, canonical URL, OG tags, Twitter/X card, structured data, breadcrumb schema, auto-updating sitemap. Category pages include editorial copy. Do **not** generate thin programmatic pages — only index pages with meaningful curated content.

---

## 7. Non-Functional Requirements

- **Accessibility:** WCAG 2.2 AA — keyboard navigation, semantic HTML, visible focus, alt text, form labels, contrast, screen-reader support.
- **Performance:** LCP < 2.5s, CLS < 0.1. Use static generation/ISR where appropriate, CDN, `next/image`, lazy loading, server caching.
- **Security:** secure auth, RBAC, RLS policies, input sanitization, URL validation, rate limiting, CSRF protection, secure file uploads (type + size validation).
- **Design:** modern, editorial, minimal, high-trust. Reference: Product Hunt × Notion × Linear × editorial publication. Max content width ~1200–1400px, 3–4 card grid on desktop, vertical cards on mobile.

---

## 8. Scope & Build Sequence

**P0 (MVP):** homepage, categories, subcategories, resource library, detail pages, search, filters, admin dashboard, resource CRUD, dynamic categories, tags, CSV import, draft/publish, SEO metadata, analytics, outbound click tracking, responsive UI.
**P1:** accounts, saved resources, collections, submissions, editor's picks, popular, recently added, newsletter, broken-link monitoring, advanced analytics.
**P2:** natural-language search ("Ask PM Vault"), AI recommendations, Google Sheets sync, AI URL metadata extraction, personalization, voting, playbooks, following categories, digests.
**P3:** sponsored listings, affiliates, premium templates, sponsored newsletter, vendor pages.

**Sprints:** 1 Foundation → 2 Content Management → 3 Public Experience → 4 Discovery → 5 Content Operations → 6 Growth (SEO/analytics) → 7 Accounts → 8 Intelligence.

Work only on the phase/sprint the human has asked for. Do not build later-phase features early.

### MVP acceptance criteria
1. Admin creates a category without code changes. 2. Category gets its own public URL. 3. Admin creates a resource without code changes. 4. Resource appears under relevant categories automatically. 5. Resource has an SEO-friendly page. 6. Search works. 7. Filters work. 8. Browse by category works. 9. External clicks tracked. 10. CSV import works. 11. Published resources editable. 12. Resources can be unpublished. 13. Homepage featured content changeable without code. 14. Works on desktop and mobile. 15. Sitemap auto-updates. 16. Public pages indexable. 17. Duplicate URLs detected. 18. Users can submit resources. 19. Submissions require moderation. 20. Analytics capture discovery and outbound clicks.

---

## 9. Metrics to instrument

- **North Star:** Weekly Useful Resource Discoveries (save, OR open external resource after reading the detail page, OR mark useful).
- **Supporting:** discovery success rate, save rate, outbound CTR, returning user rate, newsletter conversion, zero-result searches, per-query result CTR.

---

## 10. Coding Conventions

- TypeScript `strict`; no `any` without a justified comment.
- Validate all external input (forms, CSV, JSON, URLs, query params) with a schema library (e.g. Zod) on the server.
- Data access lives in `/services`; components don't query the DB directly.
- Server Components by default; Client Components only when interactivity requires it.
- Use Tailwind; keep design tokens (colors, spacing, typography) centralized.
- Every new feature needs tests for business logic (ranking, import validation, duplicate detection, permissions).
- Keep changes small and focused; one concern per change.
- Environment variables via `.env.local` (never committed); document required variables in `.env.example`.

---

## 11. Common Commands

Claude must ask before running any command not listed here that changes state. Setup details: `docs/SETUP.md`. Full PRD: `docs/PRD.md`.

```bash
npm install          # install dependencies (ask first if adding new packages)
npm run dev          # local dev server (http://localhost:3000)
npm run lint         # eslint (flat config, eslint-config-next)
npm run typecheck    # next typegen && tsc --noEmit
npm test             # vitest run (tests/**/*.test.ts)
npm run build        # production build check
```

Database migrations live in `supabase/migrations/` and are run by the human in the Supabase SQL editor (no Docker/CLI on the dev machine). `supabase/seed.sql` is local-dev only.

Before declaring any task complete: run lint, typecheck, tests and build, and report results honestly.

---

## 12. Decisions Log

Decisions made with the human; follow them unless a newer entry overrides.

| Date | Decision |
|---|---|
| 2026-09-29 | Product name in UI: **PM Vault** (stored in `site_settings`, editable without code). |
| 2026-09-29 | Work in the nested clone `PM-Vault/PM-Vault` on feature branches; build the P0 MVP sprint by sprint (1–6), pausing for review after each. |
| 2026-09-29 | Database: **hosted Supabase**. The human runs migrations in the SQL editor after reviewing them. The app never uses the service-role key; all access goes through the anon key + user session + RLS. |
| 2026-09-29 | Category URLs are **`/category/[slug]`** only (no per-section routes like `/prd-templates`). Resource-type listings use `/type/[slug]`. Top-level SEO aliases may come later as DB-driven redirects. |
| 2026-09-29 | **Submissions + moderation are in P0** (acceptance criteria 18–19), despite being listed under P1. |
| 2026-09-29 | Auth in P0 = email magic link (for staff). Google OAuth, member accounts and saves = P1. |
| 2026-09-29 | Analytics = **first-party Supabase tables** (`resource_views`, `resource_clicks`, `search_queries`); no third-party analytics and no anonymous tracking cookies in P0. |
| 2026-09-29 | First admin is created by the human with a one-line SQL `update profiles set role='super_admin'`; no in-app bootstrap path. |
| 2026-09-29 | Tests: **Vitest only** (unit tests for business logic). No Playwright for now. |
| 2026-09-29 | Filter dimensions (persona, career level, product type, product stage, company stage, format) are rows in one `taxonomy_terms` table (`kind` enum) with `resource_terms`, replacing separate `personas`/`resource_personas` tables. Admins add values without code; a new *dimension* is a migration. |
| 2026-09-29 | Exact `editorial_score` lives in the staff-only `resource_curation` table so the public API can never read it. |
| 2026-09-29 | Navigation, content pages (About/Privacy), homepage blocks and site settings are all DB-driven (`nav_items`, `pages`, `homepage_blocks`, `site_settings`). |
| 2026-09-29 | Pinned TypeScript 6.0 (TS 7 native port changes the JS API Next relies on) and ESLint 9 (flat config). Fonts use system stacks (no build-time network fetch). |
| 2026-09-29 | Tried ESLint 10: incompatible with the `eslint-plugin-react` bundled in `eslint-config-next` 16.3 (`getFilename is not a function`). Stay on ESLint 9 until eslint-config-next supports 10. |
| 2026-09-29 | Editorial list fields (best_for, use_when, avoid_when, how_to_use, strengths, limitations) are `text[]` rendered as plain text — no HTML/markdown rendering, avoiding XSS. |
| 2026-09-29 | `proxy.ts` runs only on `/admin`, `/login`, `/auth`. Public pages never read auth cookies so they stay ISR-cached; every admin mutation calls `revalidatePublicContent()` (lib/revalidate.ts) to purge pages + sitemap. |
| 2026-09-29 | Every admin page calls `requireRolePage()` and every server action calls `requireRole()` itself — layouts and pages render concurrently, so a layout guard alone is not enough. The admin segment is `force-dynamic`. |
| 2026-09-29 | Collections deferred to P1 (the PRD lists them in Sprint 5, but they are P1 scope). Newsletter, accounts and the card Save button are also P1. |
| 2026-09-29 | Bulk import is capped at 500 rows / 700 KB per file (Next.js 1 MB server-action body limit); imported rows are always drafts and re-validated server-side. |
| 2026-09-29 | Approving a submission creates a **draft** resource; an editor completes and publishes it. |
| 2026-09-29 | "Most popular" shows only resources with real activity (views + 3× outbound clicks, 30 days); the block hides itself when there is none. |
| 2026-09-29 | Outbound links go through `/go/[slug]`, which resolves the destination from the DB only (no open redirect) and skips logging for likely bots. |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
