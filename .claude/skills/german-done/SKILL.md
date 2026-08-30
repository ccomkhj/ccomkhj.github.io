---
name: german-done
description: "Mark Words in the German vocabulary Sessions as done so they drop out of /learn/german/prompt."
disable-model-invocation: true
---

Mark the Words given in `$ARGUMENTS` as done in `_learn_german/*.md`. The Words come
from the `MASTERED:` line the conversation partner outputs at the end of a voice chat
(see `_includes/german_prompt.txt`) — paste that line whole, or list headwords/stems.

## Steps

1. Run `python3 scripts/german_done.py $ARGUMENTS` (pass the arguments through
   verbatim, quoted as given). The script appends `done: <today>` to every matching
   Entry, matching by stem, and leaves the rest of each file byte-identical.
2. Relay its report: which Entries were marked, and any `✗` lines (Words that matched
   nothing — usually a misspelling or a Word already renamed by `/german`). For a `✗`
   Word, look for the intended Entry in the Sessions and, if it is unambiguous, rerun
   the script with the correct headword; otherwise ask.
3. Stop — no commit. The author eyeballs the diff; the next push rebuilds
   `/learn/german/prompt` without the marked Words.

`--undo <word>` removes a mark; `--date YYYY-MM-DD` records a date other than today.
