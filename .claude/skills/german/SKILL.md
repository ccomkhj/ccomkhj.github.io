---
name: german
description: "Complete every incomplete Entry in the German vocabulary Sessions under _learn_german/."
disable-model-invocation: false
---

Complete the incomplete Entries in the German vocabulary Sessions (`_learn_german/*.md`).
Vocabulary: `CONTEXT.md`. Design: `docs/superpowers/specs/2026-08-25-learn-german-design.md`.
This file is the single source of truth for the Entry rules below.

Scope: `$ARGUMENTS` — Session file paths; when empty, every file in `_learn_german/`.

## Steps

1. **Scan.** Read each Session. An Entry is *incomplete* when `meaning` is empty or
   `examples` has fewer than two items. Done when every Entry in every Session is
   classified complete or incomplete.
2. **Complete.** For each incomplete Entry, fill the empty fields per the rules below,
   in encounter order. Done when the Entry has a normalised `word`, a corrected `seen`
   (if present), a `meaning`, exactly two `examples`, and `note` decided (filled or left
   empty).
3. **Write back** each touched Session in place: same key order (`word`, `seen`,
   `meaning`, `examples`, `note`, `done`), comments and untouched values byte-identical, valid
   YAML (quote values containing `: `, `#`, or leading `-`/`[`/`{`). The body below the
   frontmatter stays as it was.
4. **Verify** with `just check-german` (builds the site; any YAML slip fails the build).
5. **Report** and stop — no commit. One line per touched Session:
   `<file> — <n> Entries completed`, then a total. The author eyeballs the diff.

## Author-owned fields

`word`, `seen` and `done` belong to the author. Never touch `done`. Normalise `word` (add article, plural,
principal parts) and correct `seen` (grammar, spelling, punctuation), keeping the
author's wording and meaning; a `seen` that is already correct stays byte-identical.
A missing `seen` stays missing. A filled `meaning` or `note` stays as written; an
`examples` list with two or more items stays as written; one with a single item gets
the missing register added.

## Field rules

**word** — the headword form the learner should memorise:

| Kind | Form | Example |
|---|---|---|
| Noun | `der/die/das Wort, die Plural` | `der Antrag, die Anträge` · `die Prüfung, die Prüfungen` |
| Noun, no plural / plural only | `(kein Pl.)` · `(Pl.)` | `der Regen (kein Pl.)` · `die Eltern (Pl.)` |
| Regular verb | infinitive | `bezahlen` |
| Irregular, separable or mixed verb | `infinitive (3rd sg., preterite, perfect)` | `einreichen (reicht ein, reichte ein, hat eingereicht)` |
| Reflexive / with object | `sich (Akk./Dat.) etw. verb` | `sich (Dat.) etw. leisten` |
| Adjective, adverb, other | bare form | `fristgerecht` |

Write the plural out in full (`die Anträge`), not as an ending — the learner should
see the form, and `-¨e` renders badly. The *stem* — the
last token once article, plural ending, principal parts and case markers are dropped
(`Antrag`, `einreichen`, `leisten`) — is what the Session page highlights inside `seen`
and what the Glossary sorts on (`_includes/german_stem.html`).

**meaning** — one line of English, sense used in `seen` first, further senses after `;`
(`exam; inspection, check`). English only; a Korean anchor goes in `note`.

**examples** — exactly two natural German sentences that use the Word (inflected is
fine), 8–16 words each, self-contained, no translation:
1. everyday spoken register (conversation, chat message);
2. formal or written register (news, official letter, academic prose).

**note** — one line, only when it saves the learner from a recurring trap: false friend,
governed preposition or case, register, separable/irregular quirk, or a Korean anchor
when English is a poor one. Otherwise leave `note:` empty and keep the key.

## Session schema

```yaml
---
title: "Tagesschau: Bundestagswahl 2026"   # Source title, doubles as page title
source:
  url: https://…
  type: article | video
  date: 2026-08-25                          # when it was read/watched
entries:
  - word: Antrag                            # author's bare form → "der Antrag, die Anträge"
    seen: Ich habe den Antrag gestern eingereicht.   # optional
    meaning:
    examples: []
    note:
    done: 2026-08-30                          # optional; set by /german-done, never by /german
---
```

**done** — date the learner marked the Word learned; written only by `/german-done`.
Absent means still learning.

File name `YYYY-MM-DD-<slug>.md`; the date prefix is part of the URL
(`/learn/german/YYYY-MM-DD-<slug>/`). `source.date` is mandatory (the index sorts on
it; the build fails without it). Sessions carry no `tags:`.
