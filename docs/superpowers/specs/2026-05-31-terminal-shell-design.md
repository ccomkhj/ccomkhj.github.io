# `/terminal` — Interactive Shell (Design Spec)

**Date:** 2026-05-31
**Status:** Approved for planning
**Author:** Huijo Kim (with Claude)

## Summary

Replace the landing page's *passive* search-terminal (`_includes/terminal_search.html`)
with an *active* command REPL. Visitors type commands to explore the site. Same Lorenz
background and green-on-black `_terminal.scss` aesthetic, but with a real prompt that
dispatches commands. v1 ships navigation, search, identity, and fun commands. No
interactive technical demo in v1, but the architecture makes adding `demo kl` (etc.)
later a one-file, ~15-line append.

This is the next member of the same family as `/card` and `/qr`: small, self-contained,
personality-forward artifacts built on the terminal identity the site already commits to
(`terminal_search`, `/card`, 98.css window chrome).

## Goals

- Turn the homepage into an interactive shell that is memorable and on-brand.
- Reuse existing infrastructure: `_terminal.scss` styles, the Lorenz canvas animation,
  the lunr.js search index (`idx` / `store`, already loaded site-wide).
- Establish a **command registry** so future commands (including technical demos) are
  trivial and low-risk to add.
- No new runtime dependencies, no build step — must work as-is on GitHub Pages.

## Non-Goals (YAGNI for v1)

- No interactive technical demo command yet (`demo kl`, `demo gp`).
- No tab-completion, no theming/skins, no fake persistent filesystem.
- No guestbook (external-service rot) and no `/now` page (standing content obligation).
- Keep v1 small; the registry leaves the door open for everything above.

## Architecture

Two plain scripts plus one include. No framework, no ES-module path concerns, no build.

```
_includes/terminal_shell.html   markup: canvas + terminal box + input line; loads the two JS files
assets/js/terminal-commands.js   THE FILE YOU EDIT. defines window.TerminalCommands = [ {…}, {…} ]
assets/js/terminal-shell.js      the engine: boot, input, history, dispatch, render (rarely touched)
```

### Loading order

`terminal-commands.js` is loaded **before** `terminal-shell.js`, so the engine can read
`window.TerminalCommands` at init. Both are referenced from `_includes/terminal_shell.html`.
`_pages/landing_page.md` swaps `{% include terminal_search.html %}` →
`{% include terminal_shell.html %}`.

### Command object contract

Each command is one self-contained object in the registry:

```js
{
  name:    "whoami",
  aliases: ["bio"],          // optional
  desc:    "print bio",       // shown by `help`
  usage:   "whoami",          // optional, shown in help/errors
  hidden:  false,             // optional; hidden commands (e.g. eval) omitted from help
  run(args, ctx) { ctx.printHTML(BIO_HTML); }
}
```

### The `ctx` object (engine → command interface)

The engine passes every `run()` a context object:

- `ctx.print(text)` — append a plain `.terminal-line`.
- `ctx.printHTML(html)` — append a line with raw HTML (for links, bio, banners).
- `ctx.clear()` — clear the output region.
- `ctx.navigate(url)` — `window.location.href = url`.
- `ctx.lunr` — `{ idx, store }` (the globals loaded by `lunr-search-scripts.html`).
- `ctx.commands` — the registry array (so `help` can introspect it).
- `ctx.args` — raw argument string (also passed as `args`).

### Why this is maintainable

- Adding a command = append one object to `terminal-commands.js`. Nothing else changes.
- `help` is **generated from the registry**, so it never goes out of sync.
- A future `demo kl` is the same shape: it renders a `<canvas>` into the output via
  `ctx.printHTML` and attaches its own JS. The engine needs no changes.
- Pure vanilla JS + existing lunr — no content rot, no dependency rot, no build rot.

## v1 Command Set

| Command | Behavior |
|---|---|
| `help` / `?` | List all non-hidden commands + descriptions, generated from the registry. |
| `ls` | List site sections. `ls writings` enumerates recent posts pulled from `store`. |
| `open <x>` | Navigate to a known page: `about`, `portfolio`, `writings`, `bookmarks`, `card`, `qr`. |
| `cat <x>` | Print a short inline blurb for `<x>` plus a link (does not navigate). |
| `find <q>` / `grep <q>` | Query the lunr `idx`, print top ~8 results as links (reuses `terminal_search.html` logic). |
| `whoami` / `bio` | Print the existing bio HTML. Also auto-run when `?cmd=cat_bio` is present (about-page link). |
| `contact` | Print LinkedIn / GitHub / work + personal email, and a pointer to `/card`. |
| `clear` | Clear the output region. |
| `history` | Print command history; ↑/↓ recall previous commands in the input. |
| `neofetch` | ASCII banner with name, role, "uptime", and stack — a personality piece. |
| `eval <expr>` | Keep the existing client-side math evaluator easter egg (`hidden: true`). |

Unknown command → `command not found: <x>. type 'help' for a list.`

### Page map for `open` / `cat`

```
about     → /about/
portfolio → /portfolio/
writings  → /writings/
bookmarks → /bookmarks/
card      → /card/
qr        → /qr/
```

## Boot & Interaction Flow

1. Lorenz canvas animation starts (reused from `terminal_search.html`).
2. Trimmed typewriter boot sequence prints, ending with `type 'help' to begin`.
3. Input line appears, autofocused. Clicking anywhere in the terminal refocuses it.
4. On `Enter`: echo the command line as `whoami@huijo.xyz:~$ <input>`, dispatch to the
   matching command (by `name` or `aliases`), render output, scroll to bottom, clear input.
5. ↑ / ↓ walk through command history.
6. **Deep-link compatibility:** if the URL has `?cmd=cat_bio`, skip the boot animation,
   run `whoami`, and clean the URL via `history.replaceState` (matches current behavior so
   the `_layouts/about_me.html` "cat bio" button keeps working).

## SEO / No-JS Fallback

The homepage stays indexable. Keep the page `<title>` and description. Add a `<noscript>`
block inside the include with plain links to about / portfolio / writings / card so crawlers
and JS-disabled visitors get the essentials. This is a net improvement — today's landing
page has no such fallback.

## Styling

Reuse `_terminal.scss` as-is (`.terminal-container`, `.terminal-container--overlay`,
`.terminal-prompt`, `.terminal-line`, `.terminal-input`, `.search-result-item`, scanline
`::before`). Add new classes only if a command needs them (e.g. a `.neofetch` block); keep
additions minimal and in the same file.

## Cleanup

`_includes/terminal_search.html` becomes unused once the landing page switches includes.
Leave it in place for now (harmless, useful reference); a follow-up commit may delete it.

## Testing / Verification

Static site — verification is manual via `bundle exec jekyll serve` (see `run.sh`):

- Homepage boots, prompt focuses, `help` lists every registry command.
- Each command behaves per the table above; `find conformal` returns post links.
- `?cmd=cat_bio` shows the bio and the about-page button still lands correctly.
- ↑/↓ history works; `clear` empties the screen; unknown command shows the error.
- JS disabled → `<noscript>` links render.
- Mobile (≤520px): terminal is readable and input usable.

## Future Work (out of scope, enabled by this design)

- `demo kl`, `demo gp`, `demo conformal` — inline canvas demos as registry commands.
- `/resume`, `/uses` micro-pages in the same terminal family.
