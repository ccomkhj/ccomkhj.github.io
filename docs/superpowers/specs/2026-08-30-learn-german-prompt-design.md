# `/learn/german/prompt` — Voice-chat brief and Done marks (Design Spec)

**Date:** 2026-08-30
**Status:** Implemented
**Author:** Huijo Kim (with Claude)
**Extends:** `2026-08-25-learn-german-design.md`. Vocabulary in `CONTEXT.md` (Done, Prompt).

## Problem

Sessions accumulate. Reviewing on the phone works, but speaking practice needs a
conversation partner, and a partner needs to know *which* Words to drill — not all of
them, ever growing, but the recent ones I haven't learned yet. Copying and pasting a
word list into ChatGPT before each chat is friction I won't keep up.

## Solution

1. **`done:` on the Entry.** A date the learner sets when a Word is learned. Author-owned;
   `/german` never touches it. Written by `/german-done` → `scripts/german_done.py`, which
   matches Words by stem (same rule as `_includes/german_stem.html`) and appends the line
   to the Entry block, leaving the file otherwise byte-identical. A done Entry stays in
   place on its Session page (muted, badged) and in the Glossary (ticked) — the Glossary
   is the archive — but is excluded from the Prompt.

2. **The Prompt is a URL, not a paste.** `/learn/german/prompt/` (HTML, `<pre>`, Copy
   button) and `/learn/german/prompt.txt` (raw) render the *same* include,
   `_includes/german_prompt.txt`: an agent-addressed brief containing the
   `site.german_prompt.words` (15) most recently collected open Words — newest Session
   first, encounter order within a Session — each with Meaning and Seen sentence, then the
   conversation rules and the Sources. The learner tells the partner *"Read
   …/learn/german/prompt.txt and follow it"* and switches to voice.

3. **The loop closes through git.** The brief ends by asking for a `MASTERED: a; b; …`
   line. The learner pastes it to `/german-done`, eyeballs the diff, pushes; the next build
   drops those Words and the next open ones move in.

## Decisions

- **Build-time rendering, no browser state.** A fetching agent runs no JavaScript and
  has no `localStorage`, so the brief must be complete in the HTML/text. This also keeps
  the section stateless as the original spec chose. A phone-side "mark done" staging
  layer was designed and dropped: with the agent reading the URL there is nothing to
  stage — the `MASTERED:` line *is* the staging.
- **A date, not a boolean.** Costs nothing, allows "done this month" views later, and
  reads well in a diff.
- **Cap, not a window.** "15 most recent open Words" rather than "last session": even if
  nothing is ever marked done, the brief stays speakable in 15 minutes.
- **Encounter order kept for done cards.** Sorting done cards to the bottom was
  considered; the original spec's "a Session reads like the Source did" wins.
- **One config block.** `german_prompt: {words, minutes, level}` in `_config.yml`;
  `scripts/fixtures/check_config.yml` overrides `words` so fixture Words reach the prompt
  in `just check-german` regardless of how many real Sessions exist.
- **Fetchability.** `robots: noindex` stays (search engines), `robots.txt` allows
  `/learn/`; `sitemap: false` / `search: false` on both prompt pages.

## Testing

`just check-german` (`scripts/check_german.py`) now also: unit-checks the stem rule and
runs `german_done.py` on copies of the fixtures (insert, idempotent, MASTERED line,
unmatched → exit 1, undo restores byte-identical); asserts done rendering on the Session,
index and Glossary; asserts the prompt page and `prompt.txt` exist, carry the identical
brief, list every open fixture Word with Meaning and Seen sentence, omit the done one, ask
for the MASTERED/REVIEW lines, and list Sources newest-first; and that `prompt.txt` stays
out of the sitemap.

## Out of scope

- Spaced repetition / re-surfacing done Words after N weeks.
- Per-Session prompts, prompt variants by topic, or a "pick these Words" UI.
- A GitHub Action that applies `MASTERED:` lines without a laptop.
