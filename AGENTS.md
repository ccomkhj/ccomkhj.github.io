# AGENTS.md

Guidance for AI agents (Claude Code, etc.) working on this Jekyll blog.

## Post tagging

Posts live in `_posts/` with YAML frontmatter. The site uses **tags only** — never
`categories:` (the permalink pattern `/:categories/:title/` in `_config.yml` means
adding a category silently changes the post's URL and breaks inbound links).

Every post must carry **1–3 tags from the controlled vocabulary below, primary tag
first**. Do not invent new tags; if no tag fits, add the new tag to this file in the
same change and say so.

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
```

Block style, two-space indent, exact capitalization as listed above
(`Machine Learning`, not `machine-learning`).

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
`site.tags`), so no layout changes are needed when tags change.
