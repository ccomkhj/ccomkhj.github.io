# `/learn/german` — German Vocabulary Sessions (Design Spec)

**Date:** 2026-08-25
**Status:** Ready for planning
**Author:** Huijo Kim (with Claude)
**Vocabulary:** see `CONTEXT.md` (Session, Source, Entry, Word, Meaning, Seen sentence, Example, Note, Glossary, Quiz mode)

## Problem Statement

While reading German articles and watching German videos I jot down words I don't know,
usually with the sentence I met them in. Those jottings currently die in scattered notes:
there is no place where they are collected, no consistent shape, and nothing I can open on
the bus to actually review them. Writing a full blog post per word list is far too much
effort, and the blog's `_posts` are essays — vocabulary lists don't belong in `/writings/`,
the RSS feed, or the tag tree.

I want capture to cost roughly one line per word, and review to be a single URL on my
phone that turns each Session into a tap-to-reveal recall exercise.

## Solution

A dedicated, unlisted section of the site at `/learn/german/`, built as a Jekyll
**collection** separate from `_posts`.

- One **Session** page per **Source** (one article, one video).
- A Session is a single Markdown file whose YAML frontmatter *is* the data. I write the
  skeleton — Source metadata plus, per Entry, the **Word** and the **Seen sentence**. That's
  the whole capture cost.
- A project skill (`/german`) completes every incomplete Entry: fixes the headword form
  (article + plural, principal parts), adds a one-line English **Meaning**, silently
  corrects the Seen sentence's grammar, writes exactly two **Examples** (one everyday, one
  formal/written), and an optional **Note**. It never overwrites a field I already filled.
- The Session layout renders Entries as stacked **cards** (mobile-first, no table) in
  **Quiz mode by default**: Word visible, Meaning + Seen sentence + Examples hidden until
  tapped, with a "Show all / Hide all" toggle.
- The index at `/learn/german/` lists Sessions newest-first (date, Source title, word
  count) followed by the A–Z **Glossary** of every Word linking back to its Session(s).
- The whole section is `noindex`, excluded from site search and sitemap, and not in the
  nav — reachable by URL only until the generated German has earned trust.

## User Stories

1. As a learner on the bus, I want to open `/learn/german/` on my phone and see my most recent Sessions first, so that I can review what I read this week.
2. As a learner, I want each Session to open in Quiz mode with only the Words visible, so that I attempt recall before seeing the answer.
3. As a learner, I want to tap a card to reveal its Meaning, Seen sentence and Examples, so that I can check myself one Word at a time.
4. As a learner, I want a "Show all / Hide all" toggle at the top of a Session, so that I can switch to plain reading when I'm tired.
5. As a learner, I want the Word shown with its article and plural (nouns) or principal parts (irregular verbs), so that I review the grammatically useful form, not just the stem.
6. As a learner, I want the Seen sentence displayed with the Word highlighted, so that I remember the context I met it in.
7. As a learner, I want two Examples per Word in different registers, so that I see how the Word behaves outside the one context I found it in.
8. As a learner, I want an optional Note on tricky Words (false friend, governed preposition, register), so that the recurring traps are called out.
9. As a learner, I want Entries in the order I encountered them, so that a Session reads like the Source did.
10. As a learner, I want a link to the Source at the top of a Session, so that I can re-read or re-watch it.
11. As a learner, I want an A–Z Glossary across all Sessions, so that I can look up a Word I half-remember without knowing where I met it.
12. As a learner, I want a Word that appears in several Sessions to be listed once in the Glossary with links to each Session, so that repeats are visible rather than duplicated.
13. As a learner, I want the Session and index pages to be readable at 375 px width with no horizontal scrolling, so that phone review is comfortable.
14. As a note-taker, I want to create a Session by writing only the Source metadata and `word` + `seen` per Entry, so that capture costs about one line per Word.
15. As a note-taker, I want to be able to omit the Seen sentence for a Word, so that a Word I overheard without context still gets Examples.
16. As a note-taker, I want to create or edit a Session file from GitHub's web editor on my phone, so that capture doesn't require a laptop.
17. As a note-taker, I want to run `/german` in Claude Code and have every incomplete Entry across all Sessions completed, so that I don't re-explain the format each time.
18. As a note-taker, I want `/german` to leave fields I already filled untouched, so that my own wording survives re-runs.
19. As a note-taker, I want `/german` to silently correct grammar in my Seen sentence, so that I review correct German rather than my typo.
20. As a note-taker, I want `/german` to report which Sessions and how many Entries it completed, so that I can eyeball the diff before committing.
21. As the site owner, I want Sessions kept out of `/writings/`, the tag tree, related-posts, and the RSS feed, so that vocabulary lists don't dilute the blog.
22. As the site owner, I want `/learn/german/` to be `noindex`, absent from lunr search and the sitemap, and absent from the nav, so that unverified AI-generated German isn't served to search engines.
23. As the site owner, I want the section to build with plain GitHub Pages Jekyll (no new plugins, no build step), so that deployment stays as it is.
24. As the site owner, I want to flip the section public later by changing frontmatter and adding one nav entry, so that the privacy decision is cheap to reverse.
25. As a future maintainer (human or agent), I want the Entry schema and the skill's rules documented in one place, so that Sessions stay consistent over years.

## Implementation Decisions

**Collection, not posts.** A new Jekyll collection (`learn_german`) with `output: true`
and permalink `/learn/german/:name/`. Session files are named `YYYY-MM-DD-<slug>.md`; the
date prefix is part of the URL. Collection documents don't feed `site.tags`, `site.posts`,
related posts, or jekyll-feed by default, which is exactly the isolation wanted. Sessions
carry **no `tags:`** — the AGENTS.md tag vocabulary governs `_posts` only.

**The Session file is the Note.** There is no separate raw-notes directory. The author
writes the skeleton frontmatter; the skill completes it in place. The body of the file
stays empty (the layout renders entirely from frontmatter). Schema:

```yaml
---
title: "Tagesschau: Bundestagswahl 2026"   # Source title, doubles as page title
source:
  url: https://…
  type: article | video
  date: 2026-08-25                          # when it was read/watched
entries:
  - word: Antrag                            # author writes the bare form; skill normalises → "der Antrag, -¨e"
    seen: Ich habe den Antrag gestern eingereicht.   # optional; corrected in place by the skill
    meaning:                                # filled by skill
    examples: []                            # filled by skill: exactly 2
    note:                                   # optional, filled by skill only when useful
---
```

An Entry is **incomplete** when `meaning` is empty or `examples` has fewer than two items.
`word` and `seen` are the only author-owned fields; the skill may *normalise* `word`
(add article/plural/principal parts) and *correct* `seen`, but must not change their
meaning or replace them wholesale.

**Quiz mode by default.** The Session layout renders one card per Entry. Initial state:
Word visible, everything else collapsed. Tapping a card toggles it; a single control at
the top toggles all cards. No persistence of state across loads (keep it stateless; add
`localStorage` later only if it turns out to matter). Implemented with a small dedicated
script and stylesheet following the pattern already used by `teach-quiz.js` /
`teach.css` — not by extending those files, since this is a different feature. Cards must
work with JavaScript disabled by degrading to "everything visible".

**Cards, not a table, and no Win98 chrome.** The existing `bookmarks` / `writings_table`
layouts wrap content in a 98.css window with a fixed-height scroll pane; that wastes
width and fights native scrolling on a phone. Sessions and the index use the plain
`single`-style page frame with a wide content class and card markup of their own.

**Index page.** A page at `/learn/german/` (in `_pages/`) with its own layout that iterates
the collection twice: (1) Sessions sorted by `source.date` descending showing date, title,
Source type, Entry count; (2) the Glossary — every Entry's Word across all Sessions,
sorted A–Z (case-insensitive, umlauts fold to their base vowel for sorting), grouped by
identical Word so repeats collapse to one line with one link per Session. Pure Liquid over
frontmatter; no JS required for the index.

**Privacy defaults.** Collection defaults set `sitemap: false`, `search: false`,
`robots: noindex` for all Sessions; the index page sets the same. Nothing is added to
`_data/navigation.yml` or the Win98 desktop. Reversal = delete three default lines and
add one nav entry.

**The `/german` skill.** A project-local skill under `.claude/skills/german/`, invoked
manually. Behaviour: scan every Session for incomplete Entries; for each, fill the
missing fields per the rules above; write the file back preserving key order and
comments; print a summary (Sessions touched, Entries completed). It does not commit. The
skill document is the single source of truth for the Entry rules (two Examples in two
registers, one-line Meaning in English, Note only when useful, silent correction of
`seen`, never overwrite filled fields).

**Word highlighting in the Seen sentence** is done at render time by a case-insensitive
match of the Word's stem; if no match is found the sentence renders unhighlighted rather
than erroring. Keep it best-effort.

**Language of Meaning:** English only. A Korean anchor, when English is a poor one, goes
in `note`.

## Testing Decisions

The site has no test suite of its own (the `test/` directory is the upstream theme's and
is excluded from the build). The highest available seam is the **Jekyll build output**:
run `bundle exec jekyll build` and assert on the generated HTML. This is the one seam;
don't add unit-level tests for Liquid or the toggle script.

A good test builds the site with a fixture Session (two Entries, one of them incomplete,
one Word repeated in a second fixture Session) and checks externally observable behaviour:

- `_site/learn/german/index.html` exists, lists both fixture Sessions newest-first, and
  the Glossary shows the repeated Word once with two Session links.
- The Session page exists at the date-prefixed URL, renders one card per Entry, and the
  cards' hidden parts are present in the HTML (so no-JS degradation works).
- The Session HTML contains `noindex`; `_site/sitemap.xml` and the lunr search index do
  not reference `/learn/german/`; `_site/feed.xml` doesn't either; the tags tree page has
  no new tag.
- `/writings/` does not list the fixture Sessions.

Expose this as a `just check-german` recipe next to the existing `run` recipe so it is
runnable in one command. Fixture Sessions live outside the collection during normal builds
(only copied in by the check), so they never ship.

For the `/german` skill, the test is a dry run against a fixture Session: assert that
`word`/`seen` semantics are preserved, both Examples are present, filled fields are
untouched, and the summary counts match. Manual, not automated — it's an LLM step.

Prior art: none in this repo for build assertions; `docs/superpowers/specs/2026-05-31-terminal-shell-design.md`
is the closest precedent for a self-contained feature spec.

## Out of Scope

- Spaced repetition, scoring, streaks, or any per-user state beyond the in-page toggle.
- Audio / pronunciation, IPA, conjugation tables, declension tables.
- CEFR level tagging, thematic tags, or per-Word categories.
- Other languages (`/learn/<x>`); the layout may be reused later but is not generalised now.
- A GitHub Action that runs Claude on push; capture from the phone is by editing the
  skeleton, generation happens on a laptop via `/german`.
- Verification of the generated German against an external dictionary or grammar checker.
- Adding the section to the nav, the Win98 desktop, search, sitemap, or feed.
- Migrating any existing notes; the first Session is written fresh.

## Further Notes

- **Risk accepted knowingly:** Examples and corrections are AI-generated and unverified.
  The `noindex` default is the mitigation; a visible "generated" marker was considered
  and rejected as noise for a personal page.
- **Decisions taken by default during synthesis** (no interview round was run for them):
  the Session file doubles as the Note; date-prefixed slugs; encounter order for Entries;
  Glossary groups identical Words; no state persistence; no Win98 window chrome; `just
  check-german` as the test entry point. Each is cheap to change before implementation.
- `.gitignore` currently ignores the teach-skill artifact directories; the new collection
  directory must **not** be ignored — Sessions are content.
- `CONTEXT.md` was created in this session and should be updated if any term shifts
  during implementation.
