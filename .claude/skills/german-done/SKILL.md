---
name: german-done
description: "Mark Words in the German Sessions as done so they leave /learn/german/prompt."
disable-model-invocation: true
---

Mark the Words in `$ARGUMENTS` as done in `_learn_german/*.md`. Accepts headwords, stems,
or the whole `MASTERED: a; b` line from a voice chat.

1. Run `python3 scripts/german_done.py $ARGUMENTS` (arguments verbatim). It appends
   `done: <today>` to each matching Entry (stem match), rest of the file byte-identical.
2. Relay the report. For a `✗` (no match) find the intended Entry; rerun with the right
   headword if unambiguous, else ask.
3. Stop — no commit.

`--undo <word>` removes a mark; `--date YYYY-MM-DD` sets another date.
