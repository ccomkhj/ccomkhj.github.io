# Personal Website

This is my personal website where I showcase my work and projects. Built with Jekyll and styled with [98.css](https://jdan.github.io/98.css/) for a nostalgic Windows 98 aesthetic.

## About

This site serves as a portfolio and personal showcase of my projects, writings, and experiences.

## Learn German (`/learn/german`)

Unlisted vocabulary section: one **Session** page per article/video, built from YAML in
`_learn_german/`. Specs: `docs/superpowers/specs/2026-08-{25,30}-*`. Terms: `CONTEXT.md`.
Entry rules: `.claude/skills/german/SKILL.md`.

| I want to… | Do this |
|---|---|
| Capture on my phone | `/learn/german/` → **+ New Session** opens GitHub's editor with the skeleton. Fix filename + `date:`, paste the URL, one `word:`/`seen:` pair per Word, commit. |
| Capture from a URL on my laptop | `/german-new <url>` — proposes Words with sentences, you strike known ones, it writes and completes the Session. |
| Fill meanings/examples | `/german [file]` — normalises headwords, corrects `seen`, adds `meaning`, two `examples`, optional `note`. Never touches filled fields or `done`. |
| Review on the phone | Open a Session; tap cards to reveal. Directions: **Word → meaning**, **Meaning → word**, **Cloze** (`#meaning` / `#cloze` in the URL bookmarks one). |
| Look up a Word | Glossary on `/learn/german/` — A–Z by stem, tap for meaning, ✓ = done. |
| Speak with ChatGPT/Claude | *"Read https://ccomkhj.github.io/learn/german/prompt.txt and follow it"*, then voice. 15 newest open Words + rules; ends with a `MASTERED:` line. Human view: `/learn/german/prompt/`. |
| Mark Words learned | `/german-done "MASTERED: der Antrag; einreichen"` (or `just german-done …`) → `done: <today>`; commit, push. Undo: `/german-done --undo <word>`. |
| Tune the brief | `_config.yml` → `german_prompt: {words, minutes, level}`; wording in `_includes/german_prompt.txt`. |
| Check nothing broke | `just check-german` |
| Publish the section | Drop `sitemap/search/robots` from the collection defaults and `_pages/learn_german*.md`; add a nav entry. |
