# `/learn/german/prompt` — Voice-chat brief, done marks, quiz directions (Design Spec)

**Date:** 2026-08-30 · **Status:** Implemented · **Extends:** `2026-08-25-learn-german-design.md`

## Problem

Sessions accumulate. Speaking practice needs a conversation partner that knows *which* Words
to drill — the recent, unlearned ones — without me pasting a list before every chat. And
Quiz mode only tested recognition (Word → Meaning), while the goal is production.

## Solution

1. **`done:` date on the Entry.** Author-owned; `/german` never touches it. Written by
   `/german-done` → `scripts/german_done.py` (stem match, file otherwise byte-identical).
   Done Entries stay in place on the Session page (muted, badged) and in the Glossary
   (ticked) but leave the prompt.
2. **The prompt is a URL.** `/learn/german/prompt/` (HTML, Copy button) and
   `/learn/german/prompt.txt` render the same `_includes/german_prompt.txt`: the
   `german_prompt.words` (15) newest open Words with Meaning and Seen sentence, rules,
   Sources. The learner says *"Read …/prompt.txt and follow it"* and switches to voice.
3. **The loop closes through git.** The brief ends with `MASTERED: a; b; …` → `/german-done`
   → push → the next build drops those Words.
4. **Quiz directions** — *word*, *meaning* (headword hidden until tapped), *cloze* (Seen
   sentence with the `<mark>` blanked, Meaning as hint). Each card carries all three
   questions; `data-german-direction` on the page root selects one via CSS; JS only,
   mirrored in the URL hash. No highlightable Seen sentence → falls back to *meaning*.
5. **Capture**: `/german-new <url>` drafts a Session from a Source, the author strikes
   known Words, then it runs `/german`. (A "+ New Session" link into GitHub's web editor
   was tried and removed — it only added a sign-in step.)

## Decisions

- **Build-time rendering, no browser state.** A fetcher runs no JS; the brief must be
  complete in the HTML/text. A phone-side staging layer was designed and dropped — the
  `MASTERED:` line is the staging.
- **Date, not boolean** — enables later "done N days ago" views.
- **Cap (15 newest open), not a window** — the brief stays speakable even if nothing is
  ever marked done.
- **Encounter order kept for done cards** (2026-08-25 spec: a Session reads like the Source).
- `scripts/fixtures/check_config.yml` lifts the cap so fixture Words reach the prompt in
  `just check-german` regardless of real Sessions.
- `robots: noindex` stays; `robots.txt` allows `/learn/`; prompt pages are out of
  sitemap/search.

## Testing

`just check-german` also covers: stem rule + `german_done.py` on fixture copies (insert,
idempotent, MASTERED line, unmatched → exit 1, undo byte-identical); done rendering on
Session, index, Glossary; prompt HTML ≡ prompt.txt, lists open fixture Words with Meaning
and Seen sentence, omits the done one, asks for MASTERED/REVIEW, Sources newest-first;
direction switch, both question types, cloze fallback.

## Out of scope

Spaced re-surfacing of done Words; per-Session or topic-specific briefs; ingesting
`REVIEW:` errors into Entries; a GitHub Action running `/german` on push.
