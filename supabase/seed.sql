-- PM Vault — LOCAL DEVELOPMENT SEED ONLY.
-- Gives developers realistic data to click through. This is NOT production
-- content: production resources are curated by editors in /admin or imported
-- via CSV/JSON. Descriptions below are original summaries; verify every link,
-- price and author before reusing any of this editorially.
-- Safe to re-run: every insert is idempotent (on conflict do nothing).

-- Site settings -------------------------------------------------------------
update public.site_settings set
  site_name = 'PM Vault',
  tagline = 'Everything a Product Manager needs. Curated.',
  default_meta_description = 'Find the best product management templates, frameworks, tools and examples — curated, with context on when to use each one.',
  footer_text = 'Resources are linked, not reproduced. Descriptions are written by the PM Vault editorial team.'
where id = 1;

-- Navigation ----------------------------------------------------------------
insert into public.nav_items (label, href, position, highlight)
select * from (values
  ('Resources', '/resources', 10, false),
  ('Templates', '/type/templates', 20, false),
  ('Frameworks', '/type/frameworks', 30, false),
  ('Tools', '/type/tools', 40, false),
  ('Examples', '/type/examples', 50, false),
  ('AI for PM', '/category/ai-product-management', 60, false),
  ('Submit Resource', '/submit', 90, true)
) v(label, href, position, highlight)
where not exists (select 1 from public.nav_items);

-- Resource types --------------------------------------------------------------
insert into public.resource_types (name, plural_name, slug, display_order) values
  ('Template', 'Templates', 'templates', 10),
  ('Framework', 'Frameworks', 'frameworks', 20),
  ('Guide', 'Guides', 'guides', 30),
  ('Article', 'Articles', 'articles', 40),
  ('Tool', 'Tools', 'tools', 50),
  ('Example', 'Examples', 'examples', 60),
  ('Book', 'Books', 'books', 70),
  ('Course', 'Courses', 'courses', 80),
  ('Video', 'Videos', 'videos', 90),
  ('Checklist', 'Checklists', 'checklists', 100),
  ('Cheat sheet', 'Cheat sheets', 'cheat-sheets', 110)
on conflict (slug) do nothing;

-- Categories ----------------------------------------------------------------
insert into public.categories (name, slug, description, editorial_intro, icon, seo_title, meta_description, display_order) values
  ('PRD Templates', 'prd-templates', 'Requirement documents for every stage, from one-pagers to enterprise specs.',
   'There is no single best PRD. A two-person startup and a regulated enterprise need very different documents. Start with the context you are in — company stage, team size and product type — and pick the lightest format that still gets engineering, design and stakeholders aligned.',
   'file-text', 'Best PRD Templates for Product Managers', 'Curated PRD templates and examples — one-page, startup, technical, API and AI PRDs — with guidance on when to use each.', 10),
  ('Roadmapping', 'roadmapping', 'Roadmap formats for communicating direction, not just dates.',
   'Roadmaps are communication tools. Outcome and Now/Next/Later formats work well when uncertainty is high; timeline roadmaps suit fixed commitments. Choose based on your audience and how confident you are in delivery dates.',
   'map', 'Product Roadmap Templates and Formats', 'Now/Next/Later, outcome, timeline and portfolio roadmap resources with advice on choosing the right format.', 20),
  ('Product Strategy', 'product-strategy', 'Vision, strategy, bets and the frameworks that connect them.',
   'Strategy resources help you explain where the product is going and why. Use them to make trade-offs explicit before they turn into roadmap arguments.',
   'compass', 'Product Strategy Templates and Frameworks', 'Product vision, North Star, strategy canvas and value proposition resources for product managers.', 30),
  ('Prioritization', 'prioritization', 'Frameworks for deciding what to build next — and what not to.',
   'Every prioritization framework trades precision for speed. Scoring models like RICE need reasonable estimates; simpler models like MoSCoW work when you need alignment quickly. Pick the one your inputs can actually support.',
   'list-ordered', 'Prioritization Frameworks for Product Managers', 'RICE, Kano, MoSCoW, WSJF and more — explained with when to use and when to avoid each framework.', 40),
  ('Product Discovery', 'product-discovery', 'Find problems worth solving before committing to solutions.',
   'Discovery resources help teams test assumptions cheaply. They are most valuable before a roadmap commitment, when changing direction is still inexpensive.',
   'search', 'Product Discovery Frameworks and Templates', 'Opportunity solution trees, Jobs To Be Done, assumption mapping and interview resources.', 50),
  ('User Research', 'user-research', 'Interview guides, research plans and synthesis methods.',
   'Good research starts with a clear question. These resources help you plan, run and synthesise research without leading your participants.',
   'users', 'User Research Templates for Product Teams', 'Interview scripts, research plans and synthesis resources for product managers.', 60),
  ('Product Analytics', 'product-analytics', 'Metrics, North Star and measurement frameworks.',
   'Measure outcomes, not output. These resources help you choose metrics that reflect real user value and connect them to team goals.',
   'chart', 'Product Analytics and Metrics Frameworks', 'North Star Metric, HEART, funnel and retention resources for product managers.', 70),
  ('Go-To-Market', 'go-to-market', 'Positioning, messaging and launch planning.',
   'Go-to-market starts with positioning: who the product is for and why it wins. Launch plans and checklists come after.',
   'megaphone', 'Go-To-Market Templates and Frameworks', 'Positioning, ICP, messaging and launch resources for product managers.', 80),
  ('Technical PM & APIs', 'technical-product-management', 'API design, documentation and platform product resources.',
   'Technical PMs need to evaluate API design, documentation quality and developer experience. These resources show what good looks like.',
   'code', 'Technical Product Management and API Resources', 'API PRDs, documentation examples and developer-experience resources for technical PMs.', 90),
  ('AI Product Management', 'ai-product-management', 'Designing, evaluating and shipping AI-powered products.',
   'AI products fail in different ways from traditional software. These resources cover human-AI interaction design, evaluation and responsible deployment.',
   'sparkles', 'AI Product Management Resources', 'Guidelines, frameworks and tools for AI product managers — AI UX, evaluation and responsible AI.', 100),
  ('Experimentation', 'experimentation', 'A/B testing, experiment design and statistics.',
   'Experiments are only as good as their design. Decide your hypothesis, metric and sample size before you launch.',
   'flask', 'Product Experimentation Resources', 'Experiment design, A/B testing and statistical significance resources for PMs.', 110),
  ('PM Career', 'product-management-career', 'Interviews, career growth and PM competencies.',
   'Whether you are breaking into product or moving up, these resources focus on the skills interviewers and managers actually assess.',
   'briefcase', 'Product Manager Career and Interview Resources', 'PM interview prep, career ladders and competency resources.', 120)
on conflict (slug) do nothing;

insert into public.subcategories (category_id, name, slug, display_order)
select c.id, v.name, v.slug, v.ord from (values
  ('prd-templates', 'One-page PRD', 'one-page-prd', 10),
  ('prd-templates', 'Startup PRD', 'startup-prd', 20),
  ('prd-templates', 'Technical PRD', 'technical-prd', 30),
  ('roadmapping', 'Now/Next/Later', 'now-next-later', 10),
  ('roadmapping', 'Outcome roadmaps', 'outcome-roadmaps', 20),
  ('prioritization', 'Scoring models', 'scoring-models', 10),
  ('prioritization', 'Categorisation models', 'categorisation-models', 20),
  ('product-discovery', 'Jobs To Be Done', 'jobs-to-be-done', 10),
  ('product-discovery', 'Continuous discovery', 'continuous-discovery', 20)
) v(cat, name, slug, ord)
join public.categories c on c.slug = v.cat
on conflict (category_id, slug) do nothing;

-- Tags ----------------------------------------------------------------------
insert into public.tags (name, slug) values
  ('Prioritization', 'prioritization'), ('Roadmapping', 'roadmapping'), ('Backlog', 'backlog'),
  ('Product Strategy', 'product-strategy'), ('Discovery', 'discovery'), ('Customer interviews', 'customer-interviews'),
  ('Metrics', 'metrics'), ('North Star', 'north-star'), ('Requirements', 'requirements'),
  ('Positioning', 'positioning'), ('Launch', 'launch'), ('API', 'api'), ('Developer experience', 'developer-experience'),
  ('AI UX', 'ai-ux'), ('Responsible AI', 'responsible-ai'), ('A/B testing', 'ab-testing'),
  ('Statistics', 'statistics'), ('Stakeholders', 'stakeholders'), ('Agile', 'agile'), ('Interviews', 'interviews')
on conflict (slug) do nothing;

-- Filter dimensions -----------------------------------------------------------
insert into public.taxonomy_terms (kind, name, slug, display_order) values
  ('career_level', 'Aspiring PM', 'aspiring-pm', 10), ('career_level', 'APM', 'apm', 20),
  ('career_level', 'PM', 'pm', 30), ('career_level', 'Senior PM', 'senior-pm', 40),
  ('career_level', 'Group PM', 'group-pm', 50), ('career_level', 'Product Leader', 'product-leader', 60),
  ('product_type', 'B2B', 'b2b', 10), ('product_type', 'B2C', 'b2c', 20), ('product_type', 'SaaS', 'saas', 30),
  ('product_type', 'Marketplace', 'marketplace', 40), ('product_type', 'Mobile', 'mobile', 50),
  ('product_type', 'Platform', 'platform', 60), ('product_type', 'API', 'api', 70),
  ('product_type', 'AI', 'ai', 80), ('product_type', 'Data', 'data', 90),
  ('product_stage', 'Idea', 'idea', 10), ('product_stage', 'Discovery', 'discovery', 20),
  ('product_stage', 'MVP', 'mvp', 30), ('product_stage', 'Growth', 'growth', 40), ('product_stage', 'Scale', 'scale', 50),
  ('company_stage', 'Startup', 'startup', 10), ('company_stage', 'Scale-up', 'scale-up', 20), ('company_stage', 'Enterprise', 'enterprise', 30),
  ('format', 'Notion', 'notion', 10), ('format', 'Google Docs', 'google-docs', 20), ('format', 'Google Sheets', 'google-sheets', 30),
  ('format', 'Excel', 'excel', 40), ('format', 'Figma', 'figma', 50), ('format', 'Miro', 'miro', 60),
  ('format', 'PDF', 'pdf', 70), ('format', 'Website', 'website', 80), ('format', 'Book', 'book', 90),
  ('persona', 'Aspiring PM', 'aspiring-pm', 10), ('persona', 'Early-career PM', 'early-career-pm', 20),
  ('persona', 'Senior PM', 'senior-pm', 30), ('persona', 'Technical PM', 'technical-pm', 40),
  ('persona', 'AI PM', 'ai-pm', 50), ('persona', 'Founder', 'founder', 60), ('persona', 'Product Leader', 'product-leader', 70)
on conflict (kind, slug) do nothing;

-- Resources -----------------------------------------------------------------
insert into public.resources (
  title, slug, short_description, long_description, problem_solved, external_url, normalized_url,
  resource_type_id, category_id, subcategory_id, price_type, difficulty, estimated_time, author, organization,
  best_for, use_when, avoid_when, how_to_use, strengths, limitations, example_output,
  featured, editors_pick, status, last_verified_at
)
select v.title, v.slug, v.short_description, v.long_description, v.problem_solved, v.url, v.nurl,
  (select id from public.resource_types where slug = v.type_slug),
  (select id from public.categories where slug = v.cat_slug),
  (select s.id from public.subcategories s join public.categories c on c.id = s.category_id where c.slug = v.cat_slug and s.slug = v.sub_slug),
  v.price::public.price_type, v.diff::public.difficulty, v.est, v.author, v.org,
  v.best_for, v.use_when, v.avoid_when, v.how_to_use, v.strengths, v.limitations, v.example,
  v.featured, v.pick, v.status::public.resource_status, now()
from (values
  ('RICE Prioritization Framework', 'rice-prioritization-framework',
   'Score initiatives by Reach, Impact, Confidence and Effort to compare very different ideas on one scale.',
   'RICE turns a prioritization debate into four explicit estimates. Multiplying reach, impact and confidence, then dividing by effort, gives a single comparable score. Its real value is less the number itself than forcing the team to write down — and challenge — the assumptions behind each idea.',
   'Comparing many competing feature ideas without a shared, transparent scoring method.',
   'https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/', 'intercom.com/blog/rice-simple-prioritization-for-product-managers',
   'frameworks', 'prioritization', 'scoring-models', 'free', 'beginner', '30–60 min per planning cycle', 'Sean McBride', 'Intercom',
   array['Quarterly planning with 10+ candidate initiatives', 'Teams with usage data to estimate reach', 'Making prioritization assumptions visible to stakeholders'],
   array['You need to compare ideas of very different size and type', 'Stakeholders are debating priorities based on opinion'],
   array['Reach cannot reasonably be estimated (e.g. brand-new products)', 'Strategic bets dominate and numeric scores would mislead'],
   array['List candidate initiatives', 'Estimate reach per time period using real data where possible', 'Score impact on a fixed scale (e.g. 0.25–3)', 'Assign a confidence percentage', 'Estimate effort in person-months', 'Compute (Reach × Impact × Confidence) ÷ Effort and sort', 'Review the ranking as a team and sanity-check outliers'],
   array['Simple and widely understood', 'Confidence factor penalises wishful thinking', 'Makes trade-offs explicit and discussable'],
   array['Impact scores remain subjective', 'Ignores dependencies and strategic fit', 'Can create false precision'],
   'A ranked spreadsheet of initiatives with a RICE score per row and short notes justifying each estimate.',
   true, true, 'published'),
  ('Opportunity Solution Trees', 'opportunity-solution-trees',
   'Visual map linking a desired outcome to customer opportunities, solutions and assumption tests.',
   'An opportunity solution tree keeps discovery anchored to an outcome. It separates the problem space (customer needs, pain points and desires) from the solution space, which helps teams avoid jumping straight to features and makes it easy to compare several solutions for the same opportunity.',
   'Teams jump from a goal straight to a feature idea without exploring the underlying customer problems.',
   'https://www.producttalk.org/opportunity-solution-trees/', 'producttalk.org/opportunity-solution-trees',
   'frameworks', 'product-discovery', 'continuous-discovery', 'free', 'intermediate', '2–3 hours to build the first tree', 'Teresa Torres', 'Product Talk',
   array['Product trios doing continuous discovery', 'Outcome-based teams', 'Structuring interview insights'],
   array['You have a clear outcome metric but many possible directions', 'You are running regular customer interviews'],
   array['The solution is already mandated and fixed', 'You have no access to customers to discover opportunities'],
   array['Write the desired outcome at the top', 'Map opportunities discovered in customer interviews beneath it', 'Pick a target opportunity', 'Brainstorm several solutions for it', 'Identify assumptions behind each solution and design small tests'],
   array['Keeps discovery tied to business outcomes', 'Encourages comparing multiple solutions', 'Great for communicating rationale'],
   array['Needs ongoing customer contact to stay current', 'Trees can grow large and messy without pruning'],
   'A tree diagram: one outcome, 4–8 opportunities, 2–3 candidate solutions under the chosen opportunity, each with assumption tests.',
   true, true, 'published'),
  ('Kano Model Guide', 'kano-model-guide',
   'In-depth guide to classifying features as basic expectations, performance drivers or delighters.',
   'The Kano model explains why some features only prevent dissatisfaction while others create delight. This guide walks through the theory and, importantly, how to run a Kano survey and analyse its results, rather than just drawing the famous chart.',
   'Understanding which features customers take for granted versus which ones differentiate the product.',
   'https://foldingburritos.com/blog/kano-model/', 'foldingburritos.com/blog/kano-model',
   'guides', 'prioritization', 'categorisation-models', 'free', 'intermediate', '1–2 hours to read; days to run a survey', 'Daniel Zacarias', 'Folding Burritos',
   array['Customer-facing products with many feature requests', 'Balancing table-stakes features against differentiators'],
   array['You need evidence on how customers perceive feature categories', 'Planning a release that must include must-haves'],
   array['You need a quick decision this week', 'The user base is too small for a meaningful survey'],
   array['Choose features to evaluate', 'Write paired functional/dysfunctional questions', 'Survey target users', 'Classify responses with the Kano evaluation table', 'Use results to balance your roadmap'],
   array['Grounded in customer perception', 'Explains why "more features" does not equal satisfaction'],
   array['Surveys take time to design and run', 'Categories shift over time as expectations change'],
   'A table of features classified as Must-be, Performance, Attractive, Indifferent or Reverse.',
   false, false, 'published'),
  ('MoSCoW Prioritization', 'moscow-prioritization',
   'Sort requirements into Must, Should, Could and Won''t to agree scope quickly.',
   'MoSCoW is a lightweight way to agree release scope with stakeholders. Its most useful category is often "Won''t have (this time)", which makes deferred scope explicit instead of silently dropped.',
   'Getting quick stakeholder agreement on what is in and out of a fixed-time release.',
   'https://www.productplan.com/glossary/moscow-prioritization/', 'productplan.com/glossary/moscow-prioritization',
   'frameworks', 'prioritization', 'categorisation-models', 'free', 'beginner', '30 minutes', null, 'ProductPlan',
   array['Fixed-deadline releases', 'Workshops with non-product stakeholders', 'MVP scoping'],
   array['The deadline is fixed and scope must flex', 'You need alignment more than precision'],
   array['Comparing many initiatives of different size — use a scoring model instead', 'Everything ends up as "Must"'],
   array['List requirements for the release', 'Agree the definition of each category up front', 'Classify each item together with stakeholders', 'Cap Musts at roughly 60% of capacity', 'Record Won''t items explicitly'],
   array['Very easy to explain', 'Fast in workshops', 'Makes out-of-scope items explicit'],
   array['No ranking within categories', 'Prone to "everything is a Must" inflation'],
   'A requirements list grouped into four labelled buckets with agreed scope for the release.',
   false, false, 'published'),
  ('Now/Next/Later Roadmap', 'now-next-later-roadmap',
   'A timeline-free roadmap format that communicates priorities and certainty without committing to dates.',
   'The Now/Next/Later roadmap groups work by time horizon instead of specific dates. Items in "Now" are well defined; "Later" items are problems to explore. This matches how certainty really decreases over time and reduces the pressure of date-driven feature lists.',
   'Roadmaps that promise dates the team cannot reliably hit, eroding trust.',
   'https://www.prodpad.com/blog/invented-now-next-later-roadmap/', 'prodpad.com/blog/invented-now-next-later-roadmap',
   'templates', 'roadmapping', 'now-next-later', 'free', 'beginner', '1–2 hours', 'Janna Bastow', 'ProdPad',
   array['Startups and teams with high uncertainty', 'Outcome-focused roadmaps', 'Communicating with executives'],
   array['Dates keep slipping and trust is eroding', 'You want to communicate problems, not just features'],
   array['Contractual or regulatory deadlines require dates', 'Stakeholders need a release calendar for coordination'],
   array['Create three columns: Now, Next, Later', 'Place committed, well-understood work in Now', 'Place validated but unscheduled problems in Next', 'Place strategic problems to explore in Later', 'Tie each item to an objective', 'Review regularly and move items left as they firm up'],
   array['Honest about uncertainty', 'Keeps focus on problems and outcomes', 'Easy to maintain'],
   array['Some stakeholders will still ask "when?"', 'Needs discipline to keep items outcome-oriented'],
   'A three-column board where each card states the problem, the objective it serves and a confidence level.',
   true, false, 'published'),
  ('Shape Up', 'shape-up',
   'Free online book describing Basecamp''s approach to shaping, betting on and building product work.',
   'Shape Up describes an alternative to backlog-driven sprints: work is shaped into bounded pitches with a fixed appetite, bet on in a planning table, and built by small autonomous teams in six-week cycles. Even if you do not adopt it wholesale, its ideas on appetite and shaping sharpen any PRD process.',
   'Projects that drag on because scope is never bounded before work begins.',
   'https://basecamp.com/shapeup', 'basecamp.com/shapeup',
   'books', 'prd-templates', 'startup-prd', 'free', 'intermediate', '4–6 hours to read', 'Ryan Singer', 'Basecamp',
   array['Small product teams', 'Founders designing their product process', 'Replacing heavyweight PRDs with pitches'],
   array['Projects keep overrunning', 'You want an alternative to endless backlogs'],
   array['Your organisation requires detailed upfront specifications', 'Teams are not empowered to make scope decisions'],
   array['Read the shaping chapters first', 'Write a pitch with problem, appetite, solution sketch, rabbit holes and no-gos', 'Trial one cycle before changing your whole process'],
   array['Concrete, practical and free', 'Introduces "appetite" as a scoping tool'],
   array['Some practices depend on company culture', 'Less guidance for large, multi-team organisations'],
   'A one-to-two-page pitch document with a fat-marker sketch and explicit no-gos.',
   false, true, 'published'),
  ('Confluence Product Requirements Template', 'confluence-product-requirements-template',
   'A ready-made PRD structure for teams already using Confluence and Jira.',
   'This template provides a conventional PRD structure — goals, background, assumptions, requirements, user interaction and questions — inside Confluence. It is useful as a starting skeleton for teams that document work in the Atlassian ecosystem.',
   'Starting a PRD from a blank page with no shared structure.',
   'https://www.atlassian.com/software/confluence/templates/product-requirements', 'atlassian.com/software/confluence/templates/product-requirements',
   'templates', 'prd-templates', 'one-page-prd', 'freemium', 'beginner', '1–3 hours', null, 'Atlassian',
   array['Teams using Confluence and Jira', 'Feature-level requirements', 'First-time PRD writers'],
   array['You need a familiar, conventional structure', 'Engineering already works in Jira'],
   array['You do not use Confluence', 'You are writing a strategic, pre-solution document'],
   array['Create the page from the template', 'Fill in goals and success metrics first', 'Link Jira epics to requirements', 'Record open questions and decisions as you go'],
   array['Familiar structure', 'Integrates with Jira'],
   array['Requires a Confluence workspace', 'Generic — needs adapting for AI or API products'],
   'A Confluence page with requirement tables, linked Jira issues and a decisions log.',
   false, false, 'published'),
  ('North Star Framework', 'north-star-framework',
   'Define a single metric that captures the core value your product delivers, plus the inputs that drive it.',
   'The North Star Framework connects a single value-focused metric to a small set of input metrics teams can influence. It gives product teams a shared definition of success that balances customer value and business results.',
   'Teams optimise conflicting local metrics without a shared definition of value.',
   'https://amplitude.com/north-star', 'amplitude.com/north-star',
   'frameworks', 'product-analytics', null, 'free', 'intermediate', 'Half-day workshop', null, 'Amplitude',
   array['Aligning multiple product teams', 'Growth-stage products', 'Connecting strategy to metrics'],
   array['Teams disagree on what success means', 'You are setting up product metrics for the first time'],
   array['The product has no clear core value moment yet', 'You need short-term revenue targets only'],
   array['Identify the moment users get core value', 'Draft candidate North Star metrics', 'Test them against value, leading-ness and actionability', 'Break the chosen metric into 3–5 input metrics', 'Assign input metrics to teams'],
   array['Creates shared focus', 'Links team work to long-term value'],
   array['Picking the metric is hard and contentious', 'Can hide important guardrail metrics if used alone'],
   'A North Star metric statement with a tree of 3–5 input metrics and owning teams.',
   true, false, 'published'),
  ('Google HEART Framework', 'google-heart-framework',
   'Research paper introducing Happiness, Engagement, Adoption, Retention and Task success metrics.',
   'The HEART framework, from Google researchers, offers a structured way to pick user-centred metrics. It pairs with the Goals–Signals–Metrics process so each metric traces back to a specific goal rather than whatever is easy to measure.',
   'Choosing UX metrics that reflect user experience rather than vanity numbers.',
   'https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/', 'research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications',
   'articles', 'product-analytics', null, 'free', 'intermediate', '45 minutes to read', 'Kerry Rodden, Hilary Hutchinson, Xin Fu', 'Google',
   array['Defining metrics for a new feature', 'UX-heavy products', 'Pairing research with analytics'],
   array['You need a checklist of experience dimensions to measure', 'Metrics currently focus only on usage volume'],
   array['You need business or revenue metrics', 'You want a single North Star metric'],
   array['Pick the HEART dimensions relevant to the feature', 'Define goals for each', 'Identify signals that indicate progress', 'Turn signals into measurable metrics'],
   array['User-centred and well-structured', 'Goals–Signals–Metrics prevents vanity metrics'],
   array['Academic format', 'Does not cover business metrics'],
   'A table mapping each HEART dimension to a goal, signal and metric for one feature.',
   false, false, 'published'),
  ('Stripe API Reference', 'stripe-api-reference',
   'Widely cited example of clear, developer-friendly API documentation.',
   'Stripe''s API reference is a benchmark technical PMs often study: consistent resource naming, runnable examples side by side with explanations, clear error documentation and versioning. Use it as a reference for what good API documentation looks like.',
   'Not knowing what "good" API documentation looks like when writing API requirements.',
   'https://docs.stripe.com/api', 'docs.stripe.com/api',
   'examples', 'technical-product-management', null, 'free', 'advanced', '1 hour to review', null, 'Stripe',
   array['Technical PMs writing API requirements', 'Platform and developer-tool teams', 'Reviewing documentation quality'],
   array['You are defining documentation standards for an API', 'You need an example to show engineering and stakeholders'],
   array['You need a template to fill in — this is an example, not a template'],
   array['Review how a single resource (e.g. customers) is documented', 'Note the structure: description, parameters, returns, errors, examples', 'Compare with your own API docs and list gaps'],
   array['Excellent consistency', 'Examples in many languages', 'Clear error and versioning docs'],
   array['Built by a large, well-resourced team — adapt expectations'],
   'A gap analysis comparing your API documentation to the Stripe structure.',
   false, true, 'published'),
  ('People + AI Guidebook', 'people-ai-guidebook',
   'Google PAIR''s guidance on designing human-centred AI products.',
   'The People + AI Guidebook covers user needs, mental models, explainability, feedback and graceful failure for AI-powered products. It is practical, pattern-oriented and useful well beyond Google''s own products.',
   'Designing AI features that users trust, understand and can recover from when the model is wrong.',
   'https://pair.withgoogle.com/guidebook/', 'pair.withgoogle.com/guidebook',
   'guides', 'ai-product-management', null, 'free', 'intermediate', '2–4 hours', null, 'Google PAIR',
   array['AI PMs designing user-facing features', 'Teams introducing ML into existing products'],
   array['Deciding whether AI is the right solution', 'Designing feedback and error-handling for AI features'],
   array['You need model evaluation or MLOps guidance'],
   array['Start with the "User needs + defining success" chapter', 'Use the worksheets in a team workshop', 'Revisit the errors and graceful failure chapter before launch'],
   array['Human-centred and practical', 'Includes worksheets'],
   array['Light on LLM-specific topics such as hallucination evaluation'],
   'Completed worksheets defining user needs, confidence display and failure handling for an AI feature.',
   true, true, 'published'),
  ('Microsoft HAX Toolkit', 'microsoft-hax-toolkit',
   'Guidelines, design patterns and a playbook for human-AI interaction.',
   'The HAX Toolkit packages Microsoft''s research-backed Guidelines for Human-AI Interaction with patterns and a playbook for anticipating failures. It is a strong checklist for reviewing AI features before launch.',
   'AI features that behave unpredictably without setting user expectations.',
   'https://www.microsoft.com/en-us/haxtoolkit/', 'microsoft.com/en-us/haxtoolkit',
   'tools', 'ai-product-management', null, 'free', 'intermediate', '1–3 hours', null, 'Microsoft Research',
   array['Design reviews of AI features', 'Cross-functional AI product teams'],
   array['Reviewing an AI feature before launch', 'Planning for likely AI failure modes'],
   array['You need hands-on model evaluation tooling'],
   array['Review the 18 guidelines with your team', 'Use the workbook to prioritise which apply', 'Run the playbook to anticipate failures'],
   array['Research-backed', 'Actionable checklists'],
   array['Pre-dates many generative-AI patterns'],
   'A prioritised list of human-AI guidelines with owners and planned design responses.',
   false, false, 'published'),
  ('Value Proposition Canvas', 'value-proposition-canvas',
   'Map customer jobs, pains and gains against your product''s pain relievers and gain creators.',
   'The Value Proposition Canvas helps teams check fit between what a customer segment needs and what the product offers. It is especially useful early, before positioning and messaging work.',
   'Unclear fit between what the product offers and what customers actually need.',
   'https://www.strategyzer.com/library/the-value-proposition-canvas', 'strategyzer.com/library/the-value-proposition-canvas',
   'templates', 'product-strategy', null, 'free', 'beginner', '1–2 hours', 'Alexander Osterwalder', 'Strategyzer',
   array['Founders', 'New product lines', 'Pre-positioning workshops'],
   array['Exploring a new customer segment', 'Testing product-market fit hypotheses'],
   array['You lack any customer evidence — do research first'],
   array['Pick one customer segment', 'List their jobs, pains and gains', 'List your products, pain relievers and gain creators', 'Check for fit and gaps', 'Turn gaps into hypotheses to test'],
   array['Visual and easy to facilitate', 'Pairs well with the Business Model Canvas'],
   array['Can become an opinion exercise without research'],
   'A completed canvas for one customer segment with highlighted fit and gaps.',
   false, false, 'published'),
  ('Obviously Awesome', 'obviously-awesome',
   'Book on product positioning with a step-by-step process for B2B and tech products.',
   'April Dunford''s book lays out a repeatable positioning process: start from competitive alternatives, identify unique attributes and the value they enable, then choose the market frame that makes that value obvious.',
   'Products that are good but hard for buyers to understand or compare.',
   'https://www.aprildunford.com/', 'aprildunford.com',
   'books', 'go-to-market', null, 'paid', 'intermediate', '4–5 hours to read', 'April Dunford', null,
   array['B2B SaaS', 'Repositioning an existing product', 'PMMs and founders'],
   array['Sales cycles stall because buyers do not "get it"', 'Preparing a major launch'],
   array['You need a launch checklist rather than strategy'],
   array['Gather a cross-functional team', 'List competitive alternatives', 'Isolate unique attributes', 'Map attributes to value', 'Identify best-fit customers', 'Choose a market category'],
   array['Clear, repeatable process', 'Highly practical examples'],
   array['Paid book', 'Focused on B2B tech'],
   'A positioning canvas: alternatives, unique attributes, value, target customers and market category.',
   false, false, 'published'),
  ('A/B Test Sample Size Calculator', 'ab-test-sample-size-calculator',
   'Free calculator for the sample size an A/B test needs before you launch it.',
   'Evan Miller''s calculator estimates how many users each variant needs to detect a given effect with chosen significance and power. Running this before launch prevents underpowered experiments and early peeking.',
   'Experiments stopped too early or run with too few users to detect real effects.',
   'https://www.evanmiller.org/ab-testing/sample-size.html', 'evanmiller.org/ab-testing/sample-size.html',
   'tools', 'experimentation', null, 'free', 'intermediate', '10 minutes', 'Evan Miller', null,
   array['Planning A/B tests', 'Explaining test duration to stakeholders'],
   array['Before launching any conversion experiment'],
   array['Your traffic is too low to reach the required sample in a reasonable time'],
   array['Enter the baseline conversion rate', 'Choose the minimum detectable effect', 'Set significance and power', 'Divide the sample size by daily traffic to estimate duration'],
   array['Fast and free', 'Well-regarded statistical approach'],
   array['Covers conversion-rate tests only', 'Does not replace a full experiment design'],
   'Required users per variant and an estimated test duration.',
   false, false, 'published'),
  ('Weighted Shortest Job First (WSJF)', 'weighted-shortest-job-first',
   'Prioritise by cost of delay divided by job size — draft for editorial review.',
   'WSJF, popularised by the Scaled Agile Framework, sequences work by economic impact of delay relative to size.',
   'Sequencing large backlogs where delay has real economic cost.',
   'https://framework.scaledagile.com/wsjf', 'framework.scaledagile.com/wsjf',
   'frameworks', 'prioritization', 'scoring-models', 'free', 'advanced', '1–2 hours', null, 'Scaled Agile',
   array['Large organisations using SAFe'], array['Delay has clear economic cost'], array['Small teams without SAFe practices'],
   array['Estimate cost of delay components', 'Estimate job size', 'Divide and rank'],
   array['Economic framing'], array['Estimates are relative and subjective'],
   '', false, false, 'draft')
) v(title, slug, short_description, long_description, problem_solved, url, nurl,
    type_slug, cat_slug, sub_slug, price, diff, est, author, org,
    best_for, use_when, avoid_when, how_to_use, strengths, limitations, example,
    featured, pick, status)
on conflict (slug) do nothing;

insert into public.resource_curation (resource_id, editorial_score)
select r.id, v.score from (values
  ('rice-prioritization-framework', 88), ('opportunity-solution-trees', 92), ('kano-model-guide', 78),
  ('moscow-prioritization', 70), ('now-next-later-roadmap', 84), ('shape-up', 86),
  ('confluence-product-requirements-template', 65), ('north-star-framework', 82), ('google-heart-framework', 76),
  ('stripe-api-reference', 90), ('people-ai-guidebook', 89), ('microsoft-hax-toolkit', 80),
  ('value-proposition-canvas', 74), ('obviously-awesome', 85), ('ab-test-sample-size-calculator', 79),
  ('weighted-shortest-job-first', 60)
) v(slug, score)
join public.resources r on r.slug = v.slug
on conflict (resource_id) do nothing;

insert into public.resource_tags (resource_id, tag_id)
select r.id, t.id from (values
  ('rice-prioritization-framework', 'prioritization'), ('rice-prioritization-framework', 'roadmapping'), ('rice-prioritization-framework', 'backlog'),
  ('opportunity-solution-trees', 'discovery'), ('opportunity-solution-trees', 'customer-interviews'), ('opportunity-solution-trees', 'product-strategy'),
  ('kano-model-guide', 'prioritization'), ('kano-model-guide', 'customer-interviews'),
  ('moscow-prioritization', 'prioritization'), ('moscow-prioritization', 'stakeholders'), ('moscow-prioritization', 'requirements'),
  ('now-next-later-roadmap', 'roadmapping'), ('now-next-later-roadmap', 'stakeholders'),
  ('shape-up', 'requirements'), ('shape-up', 'agile'),
  ('confluence-product-requirements-template', 'requirements'),
  ('north-star-framework', 'metrics'), ('north-star-framework', 'north-star'), ('north-star-framework', 'product-strategy'),
  ('google-heart-framework', 'metrics'),
  ('stripe-api-reference', 'api'), ('stripe-api-reference', 'developer-experience'),
  ('people-ai-guidebook', 'ai-ux'), ('people-ai-guidebook', 'responsible-ai'),
  ('microsoft-hax-toolkit', 'ai-ux'), ('microsoft-hax-toolkit', 'responsible-ai'),
  ('value-proposition-canvas', 'product-strategy'), ('value-proposition-canvas', 'positioning'),
  ('obviously-awesome', 'positioning'), ('obviously-awesome', 'launch'),
  ('ab-test-sample-size-calculator', 'ab-testing'), ('ab-test-sample-size-calculator', 'statistics'),
  ('weighted-shortest-job-first', 'prioritization'), ('weighted-shortest-job-first', 'agile')
) v(rslug, tslug)
join public.resources r on r.slug = v.rslug
join public.tags t on t.slug = v.tslug
on conflict do nothing;

insert into public.resource_terms (resource_id, term_id)
select r.id, t.id from (values
  ('rice-prioritization-framework', 'career_level', 'pm'), ('rice-prioritization-framework', 'career_level', 'apm'),
  ('rice-prioritization-framework', 'product_type', 'b2b'), ('rice-prioritization-framework', 'product_type', 'saas'),
  ('rice-prioritization-framework', 'product_stage', 'growth'), ('rice-prioritization-framework', 'format', 'website'),
  ('opportunity-solution-trees', 'career_level', 'pm'), ('opportunity-solution-trees', 'career_level', 'senior-pm'),
  ('opportunity-solution-trees', 'product_stage', 'discovery'), ('opportunity-solution-trees', 'format', 'website'),
  ('kano-model-guide', 'career_level', 'pm'), ('kano-model-guide', 'product_type', 'b2c'), ('kano-model-guide', 'format', 'website'),
  ('moscow-prioritization', 'career_level', 'apm'), ('moscow-prioritization', 'product_stage', 'mvp'), ('moscow-prioritization', 'format', 'website'),
  ('now-next-later-roadmap', 'career_level', 'pm'), ('now-next-later-roadmap', 'company_stage', 'startup'),
  ('now-next-later-roadmap', 'product_type', 'saas'), ('now-next-later-roadmap', 'format', 'website'),
  ('shape-up', 'company_stage', 'startup'), ('shape-up', 'career_level', 'senior-pm'), ('shape-up', 'format', 'book'),
  ('confluence-product-requirements-template', 'company_stage', 'enterprise'), ('confluence-product-requirements-template', 'career_level', 'apm'),
  ('north-star-framework', 'product_stage', 'growth'), ('north-star-framework', 'career_level', 'senior-pm'), ('north-star-framework', 'product_type', 'saas'),
  ('google-heart-framework', 'product_type', 'b2c'), ('google-heart-framework', 'format', 'pdf'),
  ('stripe-api-reference', 'product_type', 'api'), ('stripe-api-reference', 'product_type', 'platform'), ('stripe-api-reference', 'persona', 'technical-pm'),
  ('people-ai-guidebook', 'product_type', 'ai'), ('people-ai-guidebook', 'persona', 'ai-pm'),
  ('microsoft-hax-toolkit', 'product_type', 'ai'), ('microsoft-hax-toolkit', 'persona', 'ai-pm'),
  ('value-proposition-canvas', 'persona', 'founder'), ('value-proposition-canvas', 'product_stage', 'idea'),
  ('obviously-awesome', 'product_type', 'b2b'), ('obviously-awesome', 'product_type', 'saas'), ('obviously-awesome', 'format', 'book'),
  ('ab-test-sample-size-calculator', 'product_stage', 'growth'), ('ab-test-sample-size-calculator', 'format', 'website')
) v(rslug, kind, tslug)
join public.resources r on r.slug = v.rslug
join public.taxonomy_terms t on t.kind = v.kind::public.taxonomy_kind and t.slug = v.tslug
on conflict do nothing;

-- Homepage blocks -------------------------------------------------------------
insert into public.homepage_blocks (block_type, heading, subheading, position, config)
select v.block_type::public.homepage_block_type, v.heading, v.subheading, v.position, v.config::jsonb
from (values
  ('hero', 'Everything a Product Manager needs. Curated.',
   'Find the best PM templates, frameworks, tools, examples and playbooks without searching across dozens of websites.', 10,
   '{"search_label": "What are you trying to accomplish?", "search_placeholder": "Search \"create a PRD\", \"prioritize features\", \"launch a product\"...", "primary_cta": {"label": "Explore Resources", "href": "/resources"}, "secondary_cta": {"label": "Browse Templates", "href": "/type/templates"}}'),
  ('popular_tasks', 'Popular PM tasks', 'Start from what you are trying to get done.', 20,
   '{"items": [{"label": "Write a PRD", "href": "/category/prd-templates"}, {"label": "Build a Roadmap", "href": "/category/roadmapping"}, {"label": "Prioritize Features", "href": "/category/prioritization"}, {"label": "Conduct User Research", "href": "/category/user-research"}, {"label": "Define Product Strategy", "href": "/category/product-strategy"}, {"label": "Launch a Product", "href": "/category/go-to-market"}, {"label": "Analyze Metrics", "href": "/category/product-analytics"}, {"label": "Design AI Features", "href": "/category/ai-product-management"}]}'),
  ('featured_resources', 'Featured resources', 'Hand-picked by our editors this month.', 30, '{"limit": 6}'),
  ('categories', 'Browse by category', '', 40, '{"limit": 12}'),
  ('editors_picks', 'Editor''s Picks', 'The resources we recommend first.', 50, '{"limit": 4}'),
  ('browse_terms', 'Browse by career stage', '', 60, '{"kind": "career_level"}'),
  ('most_popular', 'Most popular', 'What PMs are opening most right now.', 70, '{"limit": 4}'),
  ('browse_terms', 'Browse by product type', '', 80, '{"kind": "product_type"}'),
  ('recently_added', 'Recently added', '', 90, '{"limit": 4}')
) v(block_type, heading, subheading, position, config)
where not exists (select 1 from public.homepage_blocks);

-- Content pages (placeholders — legal copy must be written and reviewed by a human) --
insert into public.pages (slug, title, body, published, show_in_footer) values
  ('about', 'About PM Vault',
   'PM Vault is a curated library of product management templates, frameworks, tools and examples.

Every resource is reviewed by an editor and described in our own words, with guidance on when to use it and when not to.', true, true),
  ('privacy', 'Privacy Policy',
   'PLACEHOLDER — a real privacy policy must be written and reviewed before launch.', false, true)
on conflict (slug) do nothing;
