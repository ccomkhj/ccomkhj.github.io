# AGENTS.md

Guidance for AI agents (Claude Code, etc.) working on this Jekyll blog.

## Math formatting

Use single dollar signs for inline math, e.g. `$\hat{\beta}_1$` within a sentence.
Use double dollar signs only for standalone display equations, with the delimiters
on their own lines:

```latex
$$
t = \frac{\hat{\beta}_1}{\operatorname{SE}(\hat{\beta}_1)}
$$
```

## Post tagging

Posts live in `_posts/` with YAML frontmatter. The site uses **tags only** — never
`categories:` (the permalink pattern `/:categories/:title/` in `_config.yml` means
adding a category silently changes the post's URL and breaks inbound links).

Every post must carry **1–3 tags from the controlled vocabulary below, primary tag
first**. Do not invent new tags; if no tag fits, add the new tag to this file and to
`_data/tags.yml` in the same change and say so.

### Tag vocabulary

**Tech**

| Tag | Use for |
|---|---|
| `Machine Learning` | ML/statistics modeling, forecasting, paper reviews, model internals (XGBoost, VAE, KL, distillation, DDP) |
| `Computer Vision` | Vision-specific topics: stereo, ViT vs CNN, detection metrics |
| `Agents` | LLM agents, RAG, MCP, context engineering, agent evaluation and workflows |
| `Engineering` | Programming, infra, security, and how-tos: Python, k8s, SSH, DNS, JWT/auth, code review, tooling setup |
| `Math` | Statistics and math foundations: p-values, intervals, Hilbert spaces, distributions. Often co-tagged with `Machine Learning` |
| `Science` | Natural-science topics that aren't math/ML (e.g. relativity) |

**Essays** (the former `Philosophy` tag, split up — never reintroduce `Philosophy`)

| Tag | Use for |
|---|---|
| `Mindset` | Psychology, emotions, self-knowledge, well-being, motivation |
| `Growth` | Habits, learning, productivity, language study, personal journals |
| `Decision-Making` | Choices, judgment, evaluation, argumentation (steel-manning) |
| `Career` | Leadership, startup lessons, founder experience, job search, professional direction |
| `Society` | Social systems, inequality, economy-and-morality, generational change |

**Other**

| Tag | Use for |
|---|---|
| `Business` | Entrepreneurship, strategy, hiring, team building, market thinking |
| `Reading` | Book notes and book-driven essays. Usually a secondary tag next to the topic tag |

### Frontmatter format

```yaml
tags:
  - Primary Tag
  - Secondary Tag
ai_researched: false
```

Block style, two-space indent, exact capitalization as listed above
(`Machine Learning`, not `machine-learning`). `ai_researched` is covered below.

### Retired tags — do not use

`Philosophy` (split into Mindset/Growth/Decision-Making/Career/Society),
`Programing` (typo → `Engineering`), `Mathematics` (→ `Math`),
`Security` and `MCP` (folded into `Engineering`/`Agents`; revive only once a tag
would cover 3+ posts).

### Health check

Keep each tag roughly between 5 and 25 posts. If a tag outgrows ~25, propose a
split (as was done for Philosophy); if a new topic accumulates 3+ posts under a
loose fit, propose a new tag — in both cases update this file in the same commit.

Tag pages are generated dynamically (`_layouts/tags_tree.html` iterates
`site.tags`), so no layout changes are needed when tags change. The /writings/
explorer groups tags by `_data/tags.yml` (group, icon, one-line blurb); keep it in
step with the vocabulary above when tags are added, renamed, or retired.

## Provenance and Featured

Two independent editorial dimensions in post front matter. Neither is a tag or a category,
and neither measures the other: an AI-researched post can be Featured, and an unfeatured
note is not "low quality".

| Key | Values | Rule |
|---|---|---|
| `ai_researched` | `true` / `false` (unquoted) | **Required on every new post.** `true` when AI substantially did the research, source synthesis, or drafting of the technical explanation, even if Huijo chose the ideas and steered. `false` when Huijo supplied the investigation, experience, evidence, or reasoning and AI at most critiqued, edited, formatted, or polished. |
| `ai_research_note` | string | Optional, only with `ai_researched: true`. Replaces the site-wide disclosure (`ai_research_default_note` in `_config.yml`) when that wording would be inaccurate for this post. Never claim testing or verification that did not happen. |
| `featured` | `true` | Optional; Huijo's manual recommendation. Missing means not Featured. |
| `featured_rank` | positive integer | Required with `featured: true`, unique across posts, lowest shown first; use 10, 20, 30… to leave room. Not allowed without `featured: true`. |

- **New posts:** always set `ai_researched`. A post an agent researched or drafted
  substantially (e.g. one carrying a `Co-Authored-By: Claude` commit) is `true`; the default
  note then applies, so no `ai_research_note` is needed unless it would be untrue. A post
  substantially AI-*drafted* from Huijo's own investigation is `false`; describe that in the
  post body instead of the note.
- **Featured is Huijo's call.** Never add or change `featured`/`featured_rank` unless he asks.
  A Featured post needs explicit `ai_researched`, a front-matter `excerpt` that honestly
  describes it, and a unique rank. Before featuring, check the central argument, key numbers,
  firsthand claims ("I built", "I measured"), and evidence. Unfeature by deleting both keys.
- **Legacy posts:** posts without `ai_researched` show as "Unclassified". Only files listed in
  `scripts/legacy_unclassified_posts.txt` may omit it. Never add a post there; once a legacy post
  is classified, delete its line. Do not classify posts by guesswork (title, date, or style
  alone).
- `ai_researched: false` is never shown as "human-written"; it simply gets no badge.
- Surfaces: the Welcome window on `/` (top three by rank), the Featured shelf and folder on
  `/writings/` (`/writings/#featured`), the post reader, and related-post cards. Badge words live
  in `_includes/post-badges.html` (and its JS twins in `_layouts/writings.html` and
  `assets/js/win98-desktop.js`).
- **Checks:** `just check-posts` validates front matter (CI runs it before the build);
  `just check-writings` asserts on the built pages with fixture posts; `just check-landing` covers
  the desktop; `just check-browser` drives the Explorer and Welcome window in Chromium.
