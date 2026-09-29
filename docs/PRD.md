# Product Requirements Document

> Source PRD for PM Vault, saved from the project kickoff (2026-09-29). Where this document and `CLAUDE.md` differ, the **Decisions Log in `CLAUDE.md` §12** records how the conflict was resolved.

## 1. Product Working Name

**PM Resource Vault**

Alternative names:
- PM Vault
- Product Stash
- PM Toolkit
- Product Manager Library
- Product Resource Hub
- BuildBetter
- Product Playbook
- Product Stack

For this PRD, the working name **PM Vault** will be used.

---

# 2. Executive Summary

PM Vault is a curated discovery platform for Product Managers, aspiring PMs, founders, Product Owners, Product Analysts, Product Marketing Managers, and product teams.

The platform centralizes high-quality resources across the product-management lifecycle, including:

- PRD templates
- Product strategy templates
- Roadmaps
- Prioritization frameworks
- Discovery frameworks
- User research templates
- GTM frameworks
- Product launch templates
- Product analytics resources
- KPI frameworks
- Experimentation resources
- API documentation examples
- Technical PM resources
- AI prompts for PMs
- Product tools
- Product-management courses
- Interview resources
- Product leadership resources
- Product operations templates
- Stakeholder communication templates
- Pricing and monetization frameworks

The application must answer one fundamental user question:

> **"I am trying to accomplish X as a Product Manager. What is the best resource I should use?"**

The platform should therefore provide much more than links.

Every resource should contain contextual information explaining:

- What the resource is
- What problem it solves
- When to use it
- When not to use it
- Who should use it
- Whether it is free or paid
- Difficulty level
- Required tools
- Estimated time to use
- Example output
- Pros and limitations
- Similar alternatives
- Related PM workflows

The entire content library must be manageable without editing application code.

Administrators must be able to:

- Create resources
- Edit resources
- Delete resources
- Publish/unpublish resources
- Create categories
- Create collections
- Create tags
- Upload images
- Upload documents
- Import resources in bulk
- Reorder featured resources
- Add new resource types
- Control homepage sections
- Create SEO landing pages

through an administration interface.

---

# 3. Market Research

## 3.1 Current Market

There is substantial demand for product-management templates and workflows, but resources are fragmented across multiple ecosystems.

Notion's Product marketplace currently contains thousands of Product templates across categories including roadmaps, PRDs, launch plans, strategy documents, user research and sprint planning.

Notion additionally supports filters such as:

- Free vs paid
- Popular
- Most recent
- Template category

This demonstrates that **price, category and popularity are important discovery dimensions**.

Miro currently maintains hundreds of product-management templates spanning product vision, roadmaps, discovery, product canvas, launches, backlogs and related workflows.

Miro's individual template pages combine the template itself with explanatory context describing when and why it should be used.

Product School takes a stronger editorial approach. Its PRD template, for example, is presented as a guided template and identifies an expert validator.

GitHub contains several curated PM lists, but these generally organize resources as categorized collections of links rather than providing structured recommendations, previews, comparison logic or task-specific discovery.

Figma Community supports discovery using categories, search, creator names and tags, with filtering by resource type.

Startup Stash combines curated resources with long-form editorial material, contributor submissions and newsletter distribution.

---

# 4. Market Gap

The opportunity is NOT:

> "Another website containing 5,000 PM links."

Users already have Google, Notion Marketplace, Miro, Figma, Medium, GitHub, LinkedIn and AI tools for that.

The opportunity is:

> **A curated decision engine for Product Managers.**

The problem with existing libraries is primarily **information overload**.

A PM searching "PRD template" may encounter hundreds of templates.

But their real question may be:

> "Which PRD should I use for a 0→1 B2B SaaS AI product?"

PM Vault should answer exactly that.

---

# 5. Product Positioning

## Primary positioning

### "The curated operating system for Product Managers."

Alternative:

### "Find the best template, framework or tool for any PM problem."

Alternative SEO positioning:

### "The best Product Management templates, frameworks, tools and resources — curated in one place."

---

# 6. Product Principles

## Principle 1 — Quality over quantity

Resources should be intentionally curated.

100 excellent PRD resources are less useful than:

- 1 recommended startup PRD
- 1 enterprise PRD
- 1 AI-product PRD
- 1 technical PRD
- 1 lightweight PRD
- 1 one-page PRD

Each with proper context.

---

## Principle 2 — Task-first discovery

Users rarely think:

> "I need a framework."

They think:

> "I need to prioritize my backlog."

Therefore discovery should support:

**Problem → Resource → Template → Action**

rather than merely:

**Category → Links**

---

## Principle 3 — Actionability

Every resource should answer:

- What is this?
- Why should I use it?
- When should I use it?
- How do I use it?
- What will the output look like?

---

## Principle 4 — Trust

Every resource should display:

- Source
- Author
- Date added
- Last reviewed
- Curation status
- Free/paid status
- External link
- Editorial recommendation

---

## Principle 5 — Content without deployment

Adding content must NEVER require changing source code.

All resource data must live outside the frontend application.

---

# 7. Target Users

## Persona 1 — Aspiring Product Manager

Needs:

- Learn PM frameworks
- Interview preparation
- Sample PRDs
- Case studies
- Product terminology
- Templates
- Product teardown examples

Typical query:

> "How do I write my first PRD?"

---

## Persona 2 — Early-Career PM

Needs:

- Practical templates
- Stakeholder communication
- Prioritization
- Sprint planning
- Metrics
- User research
- Roadmaps

Typical query:

> "My manager asked me to create a roadmap. Which format should I use?"

---

## Persona 3 — Senior PM

Needs:

- Product strategy
- Business cases
- Executive communication
- Portfolio planning
- GTM planning
- Advanced prioritization
- Product analytics

Typical query:

> "I need a framework for deciding whether we should enter a new market."

---

## Persona 4 — Technical Product Manager

Needs:

- API documentation
- API requirements
- System design
- Architecture diagrams
- Technical discovery
- Integration requirements
- Data contracts

Typical query:

> "What does a good API PRD look like?"

---

## Persona 5 — AI Product Manager

Needs:

- AI PRDs
- AI evaluation frameworks
- Prompt templates
- RAG evaluation
- Model comparison
- AI UX
- Guardrail documentation
- AI metrics

---

## Persona 6 — Founder

Needs:

- Lightweight PM frameworks
- Product-market-fit resources
- GTM
- Pricing
- MVP prioritization
- Product strategy

---

## Persona 7 — Product Leader

Needs:

- Product operating models
- Portfolio planning
- Team structures
- Product reviews
- OKRs
- Hiring
- Strategy frameworks

---

# 8. Jobs To Be Done

Users should be able to say:

### "When I need to perform a PM activity, help me quickly find a trusted resource so I don't waste hours searching."

Secondary JTBD:

> "When I discover a useful PM resource, let me save it so I can use it later."

> "When I am learning Product Management, help me understand which resources matter for my level."

> "When I want to solve a specific product problem, recommend a suitable framework."

> "When I discover a high-quality PM asset, let me submit it to the community."

---

# 9. Information Architecture

Primary navigation:

**Home**

**Resources**

**Templates**

**Frameworks**

**Tools**

**Examples**

**Collections**

**AI for PM**

**Learn**

**Submit Resource**

Search bar always visible.

---

# 10. Core Resource Sections

Each section below must have its **own landing page**, while all resources remain part of the same underlying content system.

Example URLs:

`/resources/prd`

`/resources/roadmapping`

`/resources/go-to-market`

This allows strong SEO and scalable navigation.

---

# 11. Section — PRD Templates

URL:

`/prd-templates`

Subcategories:

- One-page PRD
- Startup PRD
- Enterprise PRD
- Technical PRD
- API PRD
- AI Product PRD
- Feature PRD
- Mobile App PRD
- SaaS PRD
- Platform PRD
- Experiment PRD
- Data Product PRD

Resource metadata should include:

- Complexity
- Company stage
- Product type
- Team size
- Document format
- Editable/not editable
- Free/paid

Special feature:

### PRD Comparison

Example:

| Resource | Best For | Complexity | Format |
|---|---|---|---|
| Lightweight PRD | Startup | Low | Notion |
| Enterprise PRD | Large product teams | High | Docs |
| API PRD | Platform teams | Medium | Docs |

---

# 12. Section — Product Roadmapping

URL:

`/roadmapping`

Subcategories:

- Now/Next/Later
- Outcome Roadmaps
- Feature Roadmaps
- Timeline Roadmaps
- Product Strategy Roadmaps
- Platform Roadmaps
- Technology Roadmaps
- Portfolio Roadmaps

Miro's template ecosystem demonstrates that multiple roadmap styles are valuable depending on use case rather than there being one universal roadmap format.

---

# 13. Section — Product Strategy

URL:

`/product-strategy`

Resources:

- Product vision
- North Star
- Product strategy canvas
- Product principles
- Strategy narrative
- Strategic pillars
- Product bets
- Opportunity assessment
- Product-market-fit
- Market sizing
- Business case
- Build vs buy

---

# 14. Section — Prioritization

URL:

`/prioritization`

Frameworks:

- RICE
- ICE
- MoSCoW
- Kano
- WSJF
- Impact/Effort
- Opportunity scoring
- Cost of Delay
- Value vs Complexity
- Weighted scoring

Each framework page should include:

### What it is

### Formula

### Example

### When to use

### When NOT to use

### Pros

### Limitations

### Template

### Alternatives

---

# 15. Section — Product Discovery

URL:

`/product-discovery`

Resources:

- Opportunity Solution Tree
- Discovery interview
- Continuous discovery
- Assumption mapping
- Problem framing
- Jobs To Be Done
- Customer journey
- Problem statements
- Hypothesis template

---

# 16. Section — User Research

URL:

`/user-research`

Resources:

- Interview script
- Research plan
- Survey templates
- Persona templates
- Usability testing
- Customer journey
- Research repository
- Insight synthesis

---

# 17. Section — Product Analytics

URL:

`/product-analytics`

Resources:

- KPI trees
- North Star Metric
- Funnel analysis
- Cohort analysis
- Retention
- Activation
- Churn
- Engagement
- DAU/MAU
- Product dashboards
- Experiment metrics

---

# 18. Section — Go-To-Market

URL:

`/go-to-market`

Resources:

- GTM canvas
- Product positioning
- ICP
- Messaging
- Launch plan
- Marketing plan
- Sales enablement
- Competitive positioning
- Pricing
- Launch checklist

Miro's GTM framework, for example, combines business-model context, GTM strategy and the customer journey rather than treating launch planning as a single checklist.

---

# 19. Section — Product Launch

URL:

`/product-launch`

Subsections:

- Pre-launch
- Launch
- Post-launch
- Beta launch
- Product Hunt launch
- Enterprise launch
- Feature announcement
- Internal launch

---

# 20. Section — API & Technical PM

URL:

`/technical-product-management`

Categories:

- API PRD
- API documentation
- REST examples
- GraphQL resources
- API requirements
- Authentication
- Webhooks
- Data contracts
- Sequence diagrams
- Architecture diagrams
- System design
- Platform products
- Developer experience
- API metrics

This section can become an important differentiator because many PM resource libraries heavily emphasize general product work.

---

# 21. Section — AI Product Management

URL:

`/ai-product-management`

Categories:

- AI PRDs
- AI product strategy
- LLM evaluation
- RAG
- Prompt engineering
- AI UX
- Human-in-the-loop
- Hallucination management
- Guardrails
- AI metrics
- Model selection
- Cost management
- Agents
- Responsible AI

---

# 22. Section — Product Experiments

URL:

`/experimentation`

Resources:

- Experiment design
- Hypothesis templates
- A/B testing
- Experiment prioritization
- Statistical significance
- Experiment results
- Decision logs

---

# 23. Section — Stakeholder Management

URL:

`/stakeholder-management`

Resources:

- Weekly updates
- Executive updates
- Product reviews
- Status reports
- Decision documents
- Meeting templates
- RACI
- RAID logs
- Product demos

---

# 24. Section — Product Operations

URL:

`/product-operations`

Resources:

- Intake process
- Backlog process
- Product review
- Release management
- Portfolio tracking
- Capacity planning
- Product governance
- Decision logging
- Product operating model

---

# 25. Section — PM Career

URL:

`/product-management-career`

Resources:

- PM resume
- PM interviews
- Product case interviews
- Behavioral interviews
- Product sense
- Execution questions
- Metrics questions
- Portfolio examples
- Career ladder
- PM competencies

---

# 26. Section — Tools

URL:

`/product-management-tools`

Tool categories:

- Roadmapping
- Analytics
- User research
- Feedback
- Documentation
- Prototyping
- Experimentation
- AI
- Product discovery
- Project management
- API
- Collaboration

Each tool page can contain:

- Description
- Pricing classification
- Free plan
- Best for
- Company stage
- Integrations
- Pros
- Limitations
- Alternatives
- Official website

---

# 27. Homepage

Homepage structure:

## Hero

Headline:

**Everything a Product Manager needs. Curated.**

Subheadline:

> Find the best PM templates, frameworks, tools, examples and playbooks without searching across dozens of websites.

Primary search:

**What are you trying to accomplish?**

Placeholder:

> Search "create a PRD", "prioritize features", "launch a product"...

CTA:

**Explore Resources**

Secondary CTA:

**Browse Templates**

---

## Popular PM Tasks

Cards:

- Write a PRD
- Build a Roadmap
- Prioritize Features
- Conduct User Research
- Define Product Strategy
- Launch a Product
- Analyze Metrics
- Create a Business Case

---

## Featured Resources

Admin-selectable.

---

## Most Popular

Automatically determined.

---

## Recently Added

Automatically determined.

---

## Browse by Category

Category cards.

---

## Browse by Career Stage

- Aspiring PM
- APM
- PM
- Senior PM
- Group PM
- Product Leader

---

## Browse by Product Type

- B2B
- B2C
- SaaS
- Marketplace
- Mobile
- Platform
- API
- AI
- Data

---

## Editor's Picks

Curated manually.

---

## Collections

Examples:

**Everything You Need to Launch a Product**

**The Ultimate PRD Starter Pack**

**AI PM Toolkit**

**First 30 Days as a Product Manager**

**Product Strategy Toolkit**

---

## Newsletter

CTA:

> One exceptional PM resource every week.

Email capture.

---

# 28. Universal Search

Search is a P0 feature.

Search should support:

### Keyword search

"PRD"

### Natural-language intent

"I need to prioritize features"

### Tool search

"Jira"

### Framework search

"RICE"

### Problem search

"Stakeholders keep changing requirements"

Search fields:

- Resource title
- Description
- Tags
- Category
- Problem solved
- Use cases
- Author
- Tool
- Resource type

---

# 29. Search Ranking

Initial ranking:

`Search Score =`

**Text relevance × 40%**

+

**Editorial quality × 25%**

+

**Popularity × 15%**

+

**Recency × 10%**

+

**User rating × 10%**

Editorial score should carry more importance than popularity.

This prevents low-quality but highly clicked resources from dominating.

---

# 30. Filters

Users should be able to filter by:

### Resource Type
- Template
- Framework
- Article
- Guide
- Video
- Tool
- Course
- Example
- Checklist
- Cheat sheet

### Price
- Free
- Freemium
- Paid

### Experience
- Beginner
- Intermediate
- Advanced

### Career Level
- APM
- PM
- Senior PM
- Leader

### Product Type
- B2B
- B2C
- SaaS
- AI
- API
- Marketplace
- Mobile

### Stage
- Idea
- Discovery
- MVP
- Growth
- Scale

### Format
- Notion
- Google Docs
- Google Sheets
- Excel
- Figma
- FigJam
- Miro
- PDF
- Website
- GitHub

---

# 31. Resource Card

Every resource card should show:

- Thumbnail
- Resource name
- Short description
- Source
- Category
- Resource type
- Free/paid badge
- Difficulty
- Editor's Pick indicator
- Save button

Optional:

- Rating
- Usage count

CTA:

**View Resource**

Not:

**Visit Website**

The goal is to make users enter your resource detail page first.

---

# 32. Resource Detail Page

SEO-friendly URL:

`/resource/rice-prioritization-template`

Structure:

### Breadcrumbs

Home → Prioritization → RICE → Resource

### Title

### One-line value proposition

### Thumbnail / preview

### Resource metadata

- Free/paid
- Format
- Difficulty
- Source
- Author
- Last reviewed

### Primary CTA

**Open Resource**

Must open external website in new tab.

---

## Editorial Overview

Explain the resource.

---

## Best For

Examples:

- B2B product teams
- Early-stage startups
- Quarterly prioritization

---

## Use This When

Specific scenarios.

---

## Avoid This When

Important differentiator.

Example:

> Avoid RICE when reliable Reach estimates cannot reasonably be produced.

---

## How To Use

Step-by-step instructions.

---

## Example

Show a sample output if legally appropriate.

---

## Strengths

---

## Limitations

---

## Similar Resources

Automatic recommendation engine.

---

## Related Categories

---

# 33. Collections

Collections bundle multiple resources into one workflow.

Example:

## Launch a New Product

Resources:

1. Market research template
2. Persona template
3. Positioning framework
4. GTM canvas
5. Launch checklist
6. KPI template
7. Retrospective

Collections should have:

- Title
- Description
- Banner
- Resource list
- Sequence
- Estimated completion time
- Difficulty
- Target persona

---

# 34. Playbooks

Later-stage feature.

Playbooks turn static resources into workflows.

Example:

## Build Your First Product Roadmap

Step 1 — Define product objectives

Step 2 — Collect opportunities

Step 3 — Prioritize

Step 4 — Select roadmap format

Step 5 — Build roadmap

Step 6 — Communicate roadmap

Each step links to resources.

---

# 35. Accounts

Browsing must NOT require login.

Account benefits:

- Save resources
- Create collections
- Submit resources
- Rate resources
- Follow categories
- Newsletter personalization

Authentication options:

- Google
- Email magic link

---

# 36. Saved Resources

Users can click:

♡ Save

Saved resource organization:

Default:

**Saved**

Users can create folders:

- Interview Prep
- Work
- AI PM
- Product Strategy
- Reading

---

# 37. Resource Submission

CTA:

**Submit a Resource**

Fields:

- Resource name
- URL
- Description
- Category
- Resource type
- Creator
- Price
- Why useful
- Submitter email

Submission state:

`Pending`

Admin reviews.

Then:

`Approved`

or

`Rejected`

No submission should automatically publish.

---

# 38. Community Voting

Potential Phase 2.

Allow:

▲ Useful

Avoid traditional five-star ratings initially because ratings become unreliable with low volumes.

Display:

**327 PMs found this useful**

---

# 39. Quality/Curation Score

Internal administrator field:

0–100.

Suggested criteria:

| Dimension | Weight |
|---|---:|
| Practical usefulness | 30 |
| Content quality | 20 |
| Credibility | 15 |
| Ease of use | 15 |
| Originality | 10 |
| Freshness | 10 |

Only admins see exact score.

Users see:

- Recommended
- Editor's Pick
- Popular

---

# 40. CMS Requirement

This is one of the most important product requirements.

### No resources should be hardcoded.

The application must use a database or headless CMS.

Recommended options:

**Option A — Custom Admin + Supabase**

Best when building everything yourself.

**Option B — Sanity CMS**

Best editorial experience.

**Option C — Directus**

Excellent if you want a highly configurable CMS over a relational database.

### Preferred architecture

**Next.js frontend**

+

**PostgreSQL/Supabase**

+

**Custom Admin Dashboard**

This keeps user data, resource data and application data within one data model while giving complete UI control.

---

# 41. Admin Portal

URL:

`/admin`

Admin navigation:

Dashboard

Resources

Categories

Subcategories

Tags

Collections

Playbooks

Submissions

Users

Newsletter

Homepage

SEO

Analytics

Settings

---

# 42. Admin — Create Resource

Admin clicks:

**Add Resource**

Fields:

### Basic Information
- Title
- Slug
- Short description
- Long description
- URL
- Thumbnail

### Classification
- Category
- Subcategory
- Resource type
- Tags

### Product Context
- User persona
- Career level
- Product stage
- Company stage
- Product type

### Resource Metadata
- Free/paid
- Format
- Difficulty
- Estimated usage time

### Editorial Information
- Best for
- Use when
- Don't use when
- How to use
- Pros
- Limitations

### Source
- Author
- Organization
- Original URL

### Curation
- Editorial score
- Featured
- Editor's Pick
- Status

### SEO
- SEO title
- Meta description
- OG image

Then:

Save Draft

Preview

Publish

---

# 43. Bulk Upload

Required.

Admin can upload:

**CSV**

Fields should map automatically.

Example columns:

`title`

`description`

`url`

`category`

`subcategory`

`resource_type`

`tags`

`price_type`

`difficulty`

`career_level`

`product_stage`

`best_for`

`use_when`

`avoid_when`

`author`

`thumbnail`

System should:

1. Parse file.
2. Validate required fields.
3. Identify duplicates.
4. Show errors.
5. Preview import.
6. Import valid rows.

---

# 44. JSON Import

Provide JSON upload for more structured datasets.

This is useful when AI tools generate resource datasets.

Example conceptual structure:

Resource

→ metadata

→ categories

→ use cases

→ editorial review

No deployment required.

---

# 45. URL Import

High-value future feature.

Admin pastes:

`https://example.com/resource`

System retrieves:

- Page title
- Meta description
- Site name
- OG image
- Favicon

AI can suggest:

- Category
- Tags
- Description
- Resource type

Admin confirms before publishing.

---

# 46. Google Sheets Integration

Phase 2.

Allow administrators to manage resources through a Google Sheet.

Possible workflow:

Google Sheet

→ Sync

→ Database

Useful for rapid bulk curation.

---

# 47. Content Status

Each resource supports:

`Draft`

`In Review`

`Published`

`Archived`

`Broken Link`

---

# 48. Broken Link Detection

Run recurring URL health checks.

If external website returns repeated errors:

Mark:

**Needs Review**

Do not immediately delete resource.

---

# 49. Version History

Admin actions should maintain:

- Created by
- Updated by
- Created date
- Updated date
- Previous revision

---

# 50. Database Model

## resources

Fields:

`id`

`title`

`slug`

`short_description`

`long_description`

`external_url`

`thumbnail_url`

`resource_type_id`

`category_id`

`subcategory_id`

`price_type`

`difficulty`

`estimated_time`

`author`

`organization`

`best_for`

`use_when`

`avoid_when`

`how_to_use`

`strengths`

`limitations`

`editorial_score`

`featured`

`editors_pick`

`status`

`published_at`

`created_at`

`updated_at`

---

## categories

`id`

`name`

`slug`

`description`

`icon`

`seo_title`

`meta_description`

`display_order`

---

## subcategories

`id`

`category_id`

`name`

`slug`

---

## tags

`id`

`name`

`slug`

---

## resource_tags

`resource_id`

`tag_id`

---

## resource_personas

`resource_id`

`persona_id`

---

## collections

`id`

`title`

`slug`

`description`

`image`

`difficulty`

---

## collection_resources

`collection_id`

`resource_id`

`position`

---

## users

`id`

`email`

`name`

`avatar`

`role`

---

## saved_resources

`user_id`

`resource_id`

`collection_id`

`created_at`

---

## submissions

`id`

`resource_url`

`resource_name`

`submitter_email`

`status`

`created_at`

---

## votes

`user_id`

`resource_id`

`vote`

---

## resource_clicks

`resource_id`

`user_id`

`session_id`

`timestamp`

---

# 51. Dynamic Category Architecture

This requirement is critical.

The frontend must NEVER contain logic such as:

"If category = PRD show PRD page."

Instead:

Category records live in database.

Example:

Category:

`PRD Templates`

Slug:

`prd-templates`

The application dynamically generates:

`/category/prd-templates`

Therefore administrators can create:

**Product Pricing**

and automatically receive:

`/category/product-pricing`

without changing code.

This achieves your requirement:

> **Add new sections/resources without code changes.**

---

# 52. Homepage Configuration

Homepage should also be CMS-driven.

Admin can configure blocks:

- Hero
- Featured categories
- Editor's picks
- Trending
- Collections
- Newsletter
- Newly added

Admin should be able to:

- Enable block
- Disable block
- Change heading
- Change order
- Select resources

without coding.

---

# 53. Recommendation Engine

Phase 1:

Rules-based.

Recommend resources based on:

- Same category
- Same tags
- Same persona
- Similar difficulty
- Same product stage

Phase 2:

Semantic embeddings.

Example:

User views:

**API PRD Template**

Recommendations:

- API documentation guide
- Technical requirements template
- API design checklist
- Developer experience framework

---

# 54. Natural Language Discovery

High-value Phase 2 feature.

Search box:

> "What are you trying to do?"

Examples:

"I need to launch a B2B SaaS product."

System responds:

**Recommended resources**

1. ICP Template
2. Positioning Canvas
3. GTM Strategy
4. Launch Checklist
5. SaaS Metrics Framework

This could eventually become:

### Ask PM Vault

---

# 55. SEO Strategy

SEO should be built into the product architecture from day one.

Primary keywords:

- PRD template
- Product roadmap template
- Product strategy template
- Product manager templates
- RICE framework
- Product launch checklist
- GTM template
- Product requirement document example
- API PRD example

---

# 56. Programmatic SEO

Dynamic landing pages can target combinations.

Examples:

`/templates/prd`

`/templates/product-roadmap`

`/templates/ai-product-manager`

Potential advanced pages:

`/prd-templates/startups`

`/prd-templates/ai-products`

`/roadmaps/b2b-saas`

Do not generate thousands of thin SEO pages.

Only index pages containing meaningful curated content.

---

# 57. SEO Requirements

Every resource page supports:

- Unique `<title>`
- Meta description
- Canonical URL
- OG tags
- Twitter/X card
- Structured data
- Breadcrumb schema
- Sitemap inclusion

Categories should include editorial copy, not simply lists.

---

# 58. Internal Linking

Each resource should link to:

- Parent category
- Related resources
- Collections
- Related framework pages
- Alternative resources

This creates a strong information graph.

---

# 59. Newsletter

Newsletter is important for retention.

Signup locations:

- Homepage
- Resource detail
- Category pages
- Footer

Possible newsletter:

### "5 PM Resources Worth Saving"

Weekly.

Content automatically pulled from:

Featured resources.

---

# 60. Monetization

Do NOT monetize aggressively during initial growth.

Potential monetization:

## Sponsored Resource

Clearly marked:

**Sponsored**

Sponsors cannot purchase:

**Editor's Pick**

---

## Sponsored Collection

Example:

**Product Analytics Toolkit — sponsored by Mixpanel**

---

## Affiliate Links

For paid PM tools.

Must disclose affiliate relationships.

---

## Premium Templates

Later.

---

## Recruitment Sponsorship

PM job placements.

---

## Newsletter Sponsorship

Once subscriber base grows.

---

# 61. Analytics

Track:

## Acquisition
- Visitors
- Traffic source
- SEO clicks
- Landing pages

## Engagement
- Searches
- Resource views
- Save rate
- Category views
- Session depth

## Resource Quality
- CTR to resource
- Saves
- Useful votes
- Bounce rate

## Search Quality
- Searches performed
- Zero-result searches
- Result CTR

## Retention
- Returning visitors
- Logged-in users
- Newsletter subscribers

---

# 62. North Star Metric

Recommended:

### Weekly Useful Resource Discoveries

A useful discovery can be counted when:

User:

- Saves resource

OR

- Opens external resource after reading resource page

OR

- Marks resource useful

This measures value better than simple page views.

---

# 63. Supporting Metrics

### Discovery Success Rate

Search sessions with resource interaction / total searches.

### Save Rate

Resources saved / resource detail views.

### Outbound Resource CTR

External resource clicks / resource page views.

### Returning User Rate

Returning users / monthly users.

### Newsletter Conversion

Newsletter signups / visitors.

---

# 64. Search Analytics

Create internal dashboard showing:

Most common searches.

Example:

| Query | Searches | Result CTR |
|---|---:|---:|
| PRD | 3,240 | 63% |
| roadmap | 1,985 | 58% |
| API | 980 | 42% |
| pricing | 780 | 31% |

Low-CTR queries become content opportunities.

---

# 65. Zero-Result Intelligence

Store queries producing no useful results.

Example:

`product sunset template`

Admin dashboard:

### Content Gaps

Then curate relevant content.

This creates a direct content feedback loop.

---

# 66. Admin Dashboard

Display:

Total resources

Published resources

Draft resources

Pending submissions

Broken links

Visitors

Resource clicks

Saves

Searches

Top categories

Top resources

Content gaps

---

# 67. Design Direction

Visual identity:

Modern

Editorial

Minimal

High-trust

Avoid a cluttered marketplace appearance.

Reference aesthetic:

Product Hunt × Notion × Linear × curated editorial publication.

---

# 68. Desktop Layout

Maximum content width:

Approximately 1200–1400px.

Sidebar filters on listing pages.

Resource grid:

3–4 cards desktop.

---

# 69. Mobile

Filters become bottom sheet/drawer.

Search remains prominent.

Cards become vertical.

Primary CTA always visible.

---

# 70. Accessibility

Target WCAG 2.2 AA.

Requirements:

- Keyboard navigation
- Semantic HTML
- Visible focus
- Image alt text
- Form labels
- Accessible contrasts
- Screen-reader support

---

# 71. Performance

Target:

LCP < 2.5 seconds.

CLS < 0.1.

Use:

- Static generation where appropriate
- CDN
- Image optimization
- Lazy loading
- Server-side caching

---

# 72. Security

Requirements:

- Secure authentication
- Role-based access
- Admin authorization
- Input sanitization
- URL validation
- Rate limiting
- CSRF protections where applicable
- Secure file uploads
- Database policies

Admin routes must NEVER rely solely on hidden frontend UI for security.

---

# 73. User Roles

### Visitor

Browse/search.

### Member

Save/vote/submit.

### Editor

Create/edit resource content.

### Admin

Full CMS and configuration.

### Super Admin

Manage administrators/settings.

---

# 74. External Link Safety

External links should:

- Open new tab
- Use appropriate rel attributes
- Track outbound event
- Clearly identify destination

---

# 75. Duplicate Detection

When admin adds URL:

Normalize URL.

Check database.

If existing resource found:

Display:

**Possible Duplicate**

with existing record.

---

# 76. Resource Freshness

Each resource should have:

`last_verified_at`

Resources not reviewed within defined interval can enter:

**Needs Review**

queue.

---

# 77. MVP Scope

## P0 — Must Have

Homepage

Categories

Subcategories

Resource library

Resource detail pages

Search

Filters

Admin dashboard

Add/edit/delete resource

Dynamic categories

Tags

Bulk CSV upload

Draft/publish

SEO metadata

Analytics

External click tracking

Responsive UI

---

# 78. P1 — Should Have

Accounts

Saved resources

Collections

Resource submissions

Editor's picks

Popular resources

Recently added

Newsletter integration

Broken-link monitoring

Advanced analytics

---

# 79. P2 — Growth Features

Natural-language search

AI recommendations

Google Sheets synchronization

AI URL metadata extraction

Personalized recommendations

Voting

Reviews

Playbooks

Following categories

Weekly personalized digest

---

# 80. P3 — Monetization

Sponsored listings

Affiliate resources

Premium templates

Sponsored newsletter

Vendor pages

Promoted collections

---

# 81. MVP User Journey

User searches Google:

**best PRD template**

↓

Landing page:

**Best PRD Templates for Product Managers**

↓

User filters:

`B2B SaaS`

↓

Views:

**Lightweight SaaS PRD**

↓

Reads:

Best For

When To Use

How To Use

↓

Clicks:

**Open Template**

↓

Returns later.

↓

Creates account.

↓

Saves resources.

↓

Subscribes newsletter.

---

# 82. Admin User Journey

Admin discovers useful resource.

↓

Open:

`/admin/resources/new`

↓

Paste resource URL.

↓

Enter details.

↓

Choose:

Category: Roadmapping

Type: Template

Format: Miro

Level: Intermediate

↓

Add:

Best for

Use when

Limitations

↓

Preview.

↓

Publish.

↓

Page automatically becomes available.

No developer.

No code change.

No deployment.

---

# 83. Bulk Content Journey

Admin prepares:

`resources.csv`

↓

Uploads file.

↓

System detects:

100 rows

↓

95 valid

3 duplicate

2 missing URLs

↓

Admin resolves errors.

↓

Imports 95 resources.

↓

Resources remain Draft by default.

↓

Admin reviews.

↓

Bulk Publish.

---

# 84. Example Resource Record

### Name

RICE Prioritization Framework

### Category

Prioritization

### Type

Framework

### Difficulty

Beginner

### Best For

Comparing product initiatives when estimated Reach, Impact and Effort can be reasonably quantified.

### Don't Use When

Inputs are highly speculative or strategic considerations dominate numerical scoring.

### Format

Framework + calculator

### Tags

Prioritization

Roadmapping

Product Strategy

Backlog

---

# 85. Example Collection

## "Build Your Product Strategy"

Contains:

1. Product Vision Template
2. Market Analysis Template
3. Jobs-to-be-Done
4. Value Proposition Canvas
5. Product Strategy Canvas
6. North Star Metric
7. Outcome Roadmap

---

# 86. API Requirements

Application should maintain a clean internal API.

Example conceptual endpoints:

`GET /api/resources`

`GET /api/resources/:slug`

`GET /api/categories`

`GET /api/search`

`GET /api/collections`

Authenticated:

`POST /api/resources`

`PATCH /api/resources/:id`

`DELETE /api/resources/:id`

---

# 87. Recommended Technical Architecture

## Frontend

Next.js

React

TypeScript

Tailwind CSS

---

## Backend

Next.js server APIs

or equivalent server architecture.

---

## Database

PostgreSQL.

Recommended managed implementation:

Supabase.

---

## Authentication

Supabase Auth or equivalent.

---

## Search

MVP:

PostgreSQL full-text search.

Growth stage:

Algolia, Typesense or Meilisearch.

AI stage:

Vector/semantic search.

---

## Storage

Supabase Storage or object storage.

---

## Analytics

Product analytics platform +

Google Search Console +

Web analytics.

---

# 88. Suggested Repository Structure

`/app`

`/components`

`/lib`

`/services`

`/types`

`/admin`

`/api`

Do NOT store resource content inside:

`resources.ts`

or

`resources.json`

within source code.

All production content must come from CMS/database.

---

# 89. Content Management Rule

A developer should only be required when changing:

- Application behavior
- Data model
- New platform capability

A developer should NOT be required for:

- Adding resources
- Creating categories
- Changing homepage content
- Updating descriptions
- Changing SEO copy
- Creating collections
- Reordering sections

---

# 90. AI-Assisted Curation

Future admin tool:

Admin submits URL.

AI produces draft:

**Title**

**Summary**

**Best For**

**Category**

**Tags**

**Difficulty**

**Pros**

**Limitations**

**Suggested related resources**

Admin reviews.

AI must NEVER auto-publish.

---

# 91. Editorial Standards

A resource should only be published if:

- Link works
- Source is credible
- Resource provides actual value
- Resource is relevant to PM work
- Description is original
- Usage context is explained
- Pricing classification is accurate

---

# 92. Sponsored Content Policy

Editorial recommendations must remain independent.

Sponsored resources must display:

**Sponsored**

Sponsored placement must not influence:

- Editorial score
- Editor's Pick
- Organic ranking

---

# 93. Content Seed Strategy

Do not launch with thousands of links.

Launch with approximately:

### 150–300 exceptionally curated resources.

Suggested distribution:

PRD — 20

Roadmapping — 20

Strategy — 20

Discovery — 20

Prioritization — 15

GTM — 20

Analytics — 20

AI PM — 25

Technical PM/API — 20

Career — 15

Tools — 30+

Some resources can belong to multiple relevant categories through tags.

---

# 94. Launch Collections

Create these before launch:

### Ultimate PRD Toolkit

### Product Manager Starter Pack

### AI Product Manager Toolkit

### Product Strategy Toolkit

### Product Launch Toolkit

### Product Discovery Toolkit

### Product Analytics Toolkit

### Technical PM Toolkit

### PM Interview Toolkit

### Senior PM Toolkit

These provide better landing pages than individual resources alone.

---

# 95. Differentiation

The core differentiator should be:

### Existing marketplace

"Here are 500 PRD templates."

### PM Vault

"You are building a B2B SaaS product with a five-person product/engineering team. Here are the three PRD formats most appropriate for that environment, why they work, and when each should be used."

That contextual layer is the product.

---

# 96. Future Moat

The real moat will eventually become the structured dataset connecting:

**PM Problem**

↓

**Task**

↓

**Framework**

↓

**Template**

↓

**Tool**

↓

**Example**

↓

**Outcome**

For example:

`Need to prioritize roadmap`

→ Prioritization

→ RICE

→ RICE Template

→ Google Sheets / Notion

→ Example calculation

→ Roadmap decision

Over time this graph becomes much more valuable than a simple directory.

---

# 97. Potential AI Experience

Eventually homepage search becomes:

## "What are you working on?"

User:

> I'm a PM at a startup. We have around 40 feature requests and I need to decide what goes into Q2.

PM Vault:

> Start with these three resources:

**1. RICE Prioritization Template**

Best if you can estimate reach.

**2. Impact/Effort Matrix**

Best if estimates are still rough.

**3. Opportunity Scoring**

Best when you have customer research.

Then:

**Build my prioritization workflow**

This transforms the platform from:

**Resource Directory**

into:

**PM Copilot + curated knowledge base.**

---

# 98. Competitive Advantage

PM Vault should combine five things existing platforms typically separate:

### 1. Marketplace-style discovery

Search, categories and filters.

### 2. Editorial curation

Only high-quality resources.

### 3. Context

Explain when each resource should be used.

### 4. Workflow

Connect related resources into playbooks.

### 5. Intelligence

Eventually recommend resources based on the user's actual product problem.

---

# 99. MVP Acceptance Criteria

The MVP is considered complete when:

1. Admin can create a new category without code changes.
2. Category receives its own public URL.
3. Admin can create a resource without code changes.
4. Resource appears automatically under relevant categories.
5. Resource has its own SEO-friendly page.
6. User can search resources.
7. User can filter resources.
8. User can browse by category.
9. External resource clicks are tracked.
10. Admin can import resources from CSV.
11. Admin can edit published resources.
12. Admin can unpublish resources.
13. Homepage featured content can be changed without code.
14. Website works on desktop/mobile.
15. Sitemap automatically updates.
16. Search engines can index public resource/category pages.
17. Duplicate URLs are detected.
18. User can submit a resource.
19. Submitted resources require moderation.
20. Analytics capture discovery and outbound-click behavior.

---

# 100. Recommended Build Sequence

## Sprint 1 — Foundation

Database

Authentication

Admin roles

Category model

Resource model

---

## Sprint 2 — Content Management

Admin resource CRUD

Category CRUD

Tags

Image upload

Draft/publish

---

## Sprint 3 — Public Experience

Homepage

Category pages

Resource cards

Resource page

Navigation

---

## Sprint 4 — Discovery

Search

Filters

Sorting

Related resources

---

## Sprint 5 — Content Operations

CSV upload

Duplicate detection

Submission workflow

Featured resources

Collections

---

## Sprint 6 — Growth

SEO

Sitemap

Schema markup

Analytics

Newsletter

Search analytics

---

## Sprint 7 — Accounts

Authentication

Saved resources

Personal collections

---

## Sprint 8 — Intelligence

Natural-language search

AI recommendations

AI-assisted resource ingestion

---

# 101. Product Recommendation

Do **not** start by trying to become the biggest PM directory.

Start by becoming:

> **The website PMs trust when they need to know which template, framework or tool they should actually use.**

The winning homepage experience therefore should not begin with:

**"Browse 10,000 resources."**

It should begin with:

## "What are you trying to accomplish?"

That single product decision shifts PM Vault from being another directory into a **decision-support product for Product Managers**.
