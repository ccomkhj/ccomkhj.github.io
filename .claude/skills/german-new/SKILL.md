---
name: german-new
description: "Draft a German Session from a Source URL: propose Words with their sentences, author strikes the known ones, write the file, run /german."
disable-model-invocation: true
---

Draft a Session in `_learn_german/` from the URL in `$ARGUMENTS` (optionally followed by
Words the author already noted). Schema: `.claude/skills/german/SKILL.md`.
The author owns the word list — every proposed Word is confirmed or struck before writing.

1. **Fetch** the URL: title as published, `type` (`video` for video platforms, else
   `article`), today as `source.date`. No fetchable text → ask the author for the Words.
2. **Propose** 8–15 Words a B1–B2 learner likely doesn't know, each with its sentence
   quoted verbatim as `seen`. Skip proper nouns and numbers; flag Words already in
   `_learn_german/` (by stem) instead of proposing them.
3. **Confirm**: show the numbered list, ask what to strike or add, wait. Words passed in
   `$ARGUMENTS` are always kept.
4. **Write** `_learn_german/YYYY-MM-DD-<slug>.md` (slug: title, lower-case ASCII, hyphens,
   ≤5 words; never overwrite). Entries in Source order with `word`, `seen`, empty
   `meaning`, `examples: []`, empty `note`.
5. **Complete** it via the `german` skill with the file path; relay its report.
6. Stop — no commit.
