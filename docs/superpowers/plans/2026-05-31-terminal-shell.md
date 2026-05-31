# `/terminal` Interactive Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the landing page's passive search-terminal with an interactive command REPL built on a maintainable command registry.

**Architecture:** Two plain scripts — `terminal-commands.js` (the editable registry: a flat list of command objects) and `terminal-shell.js` (the engine: boot, input, history, dispatch, render) — wired into a new `_includes/terminal_shell.html` markup partial that the landing page includes. Reuses the existing `_terminal.scss` styles, Lorenz canvas animation, and lunr.js search index (`idx`/`store`, loaded site-wide). Adding a command later (including `demo kl`) is a one-file append; `help` is generated from the registry.

**Tech Stack:** Vanilla JS (ES5-compatible, no build step), Jekyll/Liquid, existing lunr.js. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-05-31-terminal-shell-design.md`

**Verification note:** This repo has no JavaScript test harness (only Ruby/HTML tests under `test/`). Per the spec, JS files are syntax-checked with `node --check`, and behavior is verified manually in the browser via `bundle exec jekyll serve` (see `run.sh`). Do not introduce a JS test framework — it is out of scope and against existing patterns.

---

## File Structure

- **Create** `assets/js/terminal-commands.js` — the command registry (`window.TerminalCommands`). The one file you edit to add/change commands. Holds the page map and all command objects.
- **Create** `assets/js/terminal-shell.js` — the REPL engine. Lorenz background, boot typewriter, input/history handling, command dispatch, `ctx` construction, render helpers. Rarely touched.
- **Create** `_includes/terminal_shell.html` — markup partial: canvas, terminal container, input line, `<noscript>` fallback, and the two `<script>` tags (commands before engine).
- **Modify** `_pages/landing_page.md` — swap `{% include terminal_search.html %}` → `{% include terminal_shell.html %}`.
- **Leave unchanged** `_includes/terminal_search.html` — becomes unused but kept as harmless reference (per spec; deletion is a separate future commit).

---

## Task 1: Command registry (`terminal-commands.js`)

**Files:**
- Create: `assets/js/terminal-commands.js`

- [ ] **Step 1: Write the registry file**

Create `assets/js/terminal-commands.js` with exactly this content:

```js
/* Terminal command registry.
   To add a command: append one object to the array below.
   Each: { name, aliases?, desc, usage?, hidden?, run(args, ctx) }
   ctx provides: print(text), printHTML(html), clear(), navigate(url),
                 lunr {idx, store}, commands[], args, history[]. */
(function () {
  "use strict";

  var PAGES = {
    about:     { url: "/about/",     blurb: "polymath journey, core pillars, things I'm proud of." },
    portfolio: { url: "/portfolio/", blurb: "drone vision, 3D reconstruction, stereo, cancer detector." },
    writings:  { url: "/writings/",  blurb: "100+ posts on ML, forecasting, CV, MLOps, reflections." },
    bookmarks: { url: "/bookmarks/", blurb: "curated links worth keeping." },
    card:      { url: "/card/",      blurb: "terminal-style contact card." },
    qr:        { url: "/qr/",        blurb: "scan-to-connect QR page." }
  };

  var BIO =
    "<div style='margin-top:8px;margin-bottom:12px;color:#ccc'>" +
    "<p>Machine learning practitioner and former founder working across predictive " +
    "modeling, computer vision, MLOps, and autonomous systems. After mechanical " +
    "engineering, worked on EV development at <strong>Hyundai Motor Group</strong>.</p>" +
    "<p>Founded and scaled an <a href='http://hexafarms.com'>agtech startup</a> from " +
    "zero to six-figure ARR, then moved into e-commerce, applying ML to large-scale " +
    "experimentation and operational optimization.</p>" +
    "<p>Interested in explainability-driven optimization, agent-based workflows, and " +
    "cross-disciplinary system design.</p></div>";

  window.TerminalCommands = [
    {
      name: "help", aliases: ["?"], desc: "list available commands",
      run: function (args, ctx) {
        ctx.print("available commands:");
        ctx.commands.forEach(function (c) {
          if (c.hidden) return;
          var label = c.name + (c.aliases && c.aliases.length ? " (" + c.aliases.join(", ") + ")" : "");
          ctx.printHTML("  <span style='color:#33ff00'>" + label + "</span>  —  " + c.desc);
        });
      }
    },
    {
      name: "ls", desc: "list sections (try: ls writings)",
      run: function (args, ctx) {
        if (args.trim() === "writings") {
          var store = ctx.lunr.store;
          if (!store) { ctx.print("index still loading, try again."); return; }
          var n = Math.min(store.length, 12);
          for (var i = 0; i < n; i++) {
            ctx.printHTML("  <a href='" + store[i].url + "'>" + store[i].title + "</a>");
          }
          return;
        }
        Object.keys(PAGES).forEach(function (s) { ctx.print("  " + s + "/"); });
        ctx.print("hint: open <name>  ·  cat <name>  ·  ls writings");
      }
    },
    {
      name: "open", aliases: ["cd"], desc: "open a section (open <name>)",
      run: function (args, ctx) {
        var key = args.trim().toLowerCase();
        var p = PAGES[key];
        if (!p) { ctx.print("unknown section: " + key + ". try 'ls'."); return; }
        ctx.print("opening " + key + "...");
        ctx.navigate(p.url);
      }
    },
    {
      name: "cat", desc: "preview a section (cat <name>)",
      run: function (args, ctx) {
        var key = args.trim().toLowerCase();
        var p = PAGES[key];
        if (!p) { ctx.print("unknown section: " + key + ". try 'ls'."); return; }
        ctx.print(p.blurb);
        ctx.printHTML("  → <a href='" + p.url + "'>" + p.url + "</a>");
      }
    },
    {
      name: "find", aliases: ["grep", "search"], desc: "search writings (find <query>)",
      run: function (args, ctx) {
        var query = args.trim().toLowerCase();
        if (!query) { ctx.print("usage: find <query>"); return; }
        var idx = ctx.lunr.idx, store = ctx.lunr.store;
        if (!idx || !store || typeof lunr === "undefined") {
          ctx.print("index still loading, try again."); return;
        }
        var result = idx.query(function (q) {
          query.split(lunr.tokenizer.separator).forEach(function (term) {
            q.term(term, { boost: 100 });
            if (query.lastIndexOf(" ") != query.length - 1) {
              q.term(term, { usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING, boost: 10 });
            }
            if (term != "") { q.term(term, { usePipeline: false, editDistance: 1, boost: 1 }); }
          });
        });
        if (!result.length) { ctx.print("> no results."); return; }
        ctx.print("> found " + result.length + " result(s):");
        var limit = Math.min(result.length, 8);
        for (var i = 0; i < limit; i++) {
          var doc = store[result[i].ref];
          ctx.printHTML("  [" + (doc.categories || "file") + "] <a href='" + doc.url + "'>" + doc.title + "</a>");
        }
      }
    },
    {
      name: "whoami", aliases: ["bio"], desc: "print bio",
      run: function (args, ctx) { ctx.printHTML(BIO); }
    },
    {
      name: "contact", desc: "show contact links",
      run: function (args, ctx) {
        ctx.printHTML("  <a href='https://www.linkedin.com/in/khj17'>linkedin.com/in/khj17</a>");
        ctx.printHTML("  <a href='https://github.com/ccomkhj'>github.com/ccomkhj</a>");
        ctx.printHTML("  <a href='mailto:huijo.kim@voids.ai'>huijo.kim@voids.ai</a> (work)");
        ctx.printHTML("  <a href='mailto:ccomkhj@gmail.com'>ccomkhj@gmail.com</a> (personal)");
        ctx.printHTML("  full card → <a href='/card/'>/card/</a>");
      }
    },
    {
      name: "clear", aliases: ["cls"], desc: "clear the screen",
      run: function (args, ctx) { ctx.clear(); }
    },
    {
      name: "history", desc: "show command history",
      run: function (args, ctx) {
        (ctx.history || []).forEach(function (h, i) { ctx.print("  " + (i + 1) + "  " + h); });
      }
    },
    {
      name: "neofetch", desc: "system info banner",
      run: function (args, ctx) {
        [
          "  _   _       _ _       ",
          " | | | |_   _(_|_) ___  ",
          " | |_| | | | | | |/ _ \\ ",
          " |  _  | |_| | | | (_) |",
          " |_| |_|\\__,_|_|_|\\___/ "
        ].forEach(function (l) { ctx.print(l); });
        ctx.print("");
        ctx.printHTML("  <span style='color:#33ff00'>host</span>     huijo.xyz");
        ctx.printHTML("  <span style='color:#33ff00'>role</span>     Data Scientist @ voids.ai");
        ctx.printHTML("  <span style='color:#33ff00'>prev</span>     cofounder @ hexafarms (0→400k ARR)");
        ctx.printHTML("  <span style='color:#33ff00'>stack</span>    python · pytorch · jax · k8s · jekyll");
        ctx.printHTML("  <span style='color:#33ff00'>focus</span>    forecasting · CV · agents · MLOps");
        ctx.printHTML("  <span style='color:#33ff00'>uptime</span>   shipping since 0→1");
      }
    },
    {
      name: "eval", desc: "evaluate a math expression", hidden: true,
      run: function (args, ctx) {
        try { ctx.print("> " + eval(args)); }   // local static-site input only
        catch (e) { ctx.print("> error: " + e.message); }
      }
    }
  ];
})();
```

- [ ] **Step 2: Syntax-check the file**

Run: `node --check assets/js/terminal-commands.js`
Expected: no output, exit code 0 (no syntax errors).

- [ ] **Step 3: Commit**

```bash
git add assets/js/terminal-commands.js
git commit -m "feat(terminal): add command registry for interactive shell"
```

---

## Task 2: REPL engine (`terminal-shell.js`)

**Files:**
- Create: `assets/js/terminal-shell.js`

- [ ] **Step 1: Write the engine file**

Create `assets/js/terminal-shell.js` with exactly this content:

```js
/* Interactive terminal engine. Reads window.TerminalCommands (loaded first),
   runs the boot sequence, handles input/history, dispatches commands. */
(function () {
  "use strict";

  var PROMPT = "whoami@huijo.xyz:~$";

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function startLorenz() {
    var canvas = document.getElementById("math-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var width, height;
    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);
    }
    window.addEventListener("resize", resize);
    resize();
    var x = 0.1, y = 0, z = 0, sigma = 10, rho = 28, beta = 8 / 3, dt = 0.01;
    function draw() {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 255, 100, 0.4)";
      ctx.lineWidth = 0.8;
      for (var i = 0; i < 20; i++) {
        ctx.moveTo(width / 2 + x * 15, height / 2 + z * 10 - 200);
        var dx = sigma * (y - x) * dt;
        var dy = (x * (rho - z) - y) * dt;
        var dz = (x * y - beta * z) * dt;
        x += dx; y += dy; z += dz;
        ctx.lineTo(width / 2 + x * 15, height / 2 + z * 10 - 200);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(5, 5, 5, 0.01)";
      ctx.fillRect(0, 0, width, height);
      requestAnimationFrame(draw);
    }
    draw();
  }

  function init() {
    startLorenz();

    var container = document.getElementById("terminal-container");
    var outputDiv = document.getElementById("terminal-output");
    var inputLine = document.getElementById("terminal-input-line");
    var inputField = document.getElementById("terminal-input");
    if (!outputDiv || !inputField || !inputLine) return;

    var history = [];
    var historyIndex = 0;

    function scrollToBottom() {
      if (container) container.scrollTop = container.scrollHeight;
    }

    var ctx = {
      print: function (text) {
        var div = document.createElement("div");
        div.className = "terminal-line";
        div.textContent = text;
        outputDiv.appendChild(div);
      },
      printHTML: function (html) {
        var div = document.createElement("div");
        div.className = "terminal-line";
        div.innerHTML = html;
        outputDiv.appendChild(div);
      },
      clear: function () { outputDiv.innerHTML = ""; },
      navigate: function (url) { window.location.href = url; },
      lunr: {
        get idx() { return typeof idx !== "undefined" ? idx : null; },
        get store() { return typeof store !== "undefined" ? store : null; }
      },
      commands: window.TerminalCommands || [],
      history: history
    };

    function findCommand(name) {
      var list = window.TerminalCommands || [];
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.name === name || (c.aliases && c.aliases.indexOf(name) !== -1)) return c;
      }
      return null;
    }

    function run(line) {
      var trimmed = line.trim();
      var echo = document.createElement("div");
      echo.className = "terminal-line";
      echo.innerHTML = "<span class='terminal-prompt'>" + PROMPT + "</span> " + escapeHtml(trimmed);
      outputDiv.appendChild(echo);

      if (trimmed === "") { scrollToBottom(); return; }
      history.push(trimmed);
      historyIndex = history.length;

      var name = trimmed.split(/\s+/)[0].toLowerCase();
      var argStr = trimmed.slice(name.length).trim();
      var cmd = findCommand(name);
      if (!cmd) {
        ctx.print("command not found: " + name + ". type 'help' for a list.");
      } else {
        ctx.args = argStr;
        try { cmd.run(argStr, ctx); }
        catch (err) { ctx.print("error: " + err.message); }
      }
      scrollToBottom();
    }

    inputField.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var val = inputField.value;
        inputField.value = "";
        run(val);
      } else if (e.key === "ArrowUp") {
        if (!history.length) return;
        historyIndex = Math.max(0, historyIndex - 1);
        inputField.value = history[historyIndex] || "";
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        if (!history.length) return;
        historyIndex = Math.min(history.length, historyIndex + 1);
        inputField.value = history[historyIndex] || "";
        e.preventDefault();
      }
    });

    if (container) {
      container.addEventListener("click", function () { inputField.focus(); });
    }

    function showPrompt() {
      inputLine.style.display = "flex";
      inputField.focus();
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get("cmd") === "cat_bio") {
      showPrompt();
      run("whoami");
      window.history.replaceState({}, document.title, "/");
      return;
    }

    var bootText = [
      "Initializing kernel...",
      "Verifying Euler's identity: e^(iπ) + 1 = 0 ... [OK]",
      "System ready.",
      "type 'help' to begin."
    ];
    var li = 0, ci = 0;
    function typeWriter() {
      if (li < bootText.length) {
        if (ci === 0) {
          var p = document.createElement("div");
          p.className = "terminal-line";
          outputDiv.appendChild(p);
        }
        var cur = bootText[li];
        var last = outputDiv.lastElementChild;
        if (ci < cur.length) {
          last.textContent += cur.charAt(ci);
          ci++;
          setTimeout(typeWriter, 18);
        } else {
          li++; ci = 0;
          setTimeout(typeWriter, 120);
        }
      } else {
        showPrompt();
      }
    }
    typeWriter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
```

- [ ] **Step 2: Syntax-check the file**

Run: `node --check assets/js/terminal-shell.js`
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add assets/js/terminal-shell.js
git commit -m "feat(terminal): add REPL engine (boot, input, history, dispatch)"
```

---

## Task 3: Markup include (`terminal_shell.html`)

**Files:**
- Create: `_includes/terminal_shell.html`

- [ ] **Step 1: Write the include**

Create `_includes/terminal_shell.html` with exactly this content:

```html
<!-- Interactive terminal shell. Replaces terminal_search.html on the landing page.
     Commands live in assets/js/terminal-commands.js; engine in terminal-shell.js. -->
<canvas id="math-canvas" class="math-canvas"></canvas>

<div id="terminal-container" class="terminal-container terminal-container--overlay">
  <div id="terminal-output"></div>
  <div id="terminal-input-line" class="terminal-input-line" style="display: none;">
    <span class="terminal-prompt">whoami@huijo.xyz:~$</span>
    <input type="text" id="terminal-input" class="terminal-input"
           autocomplete="off" spellcheck="false" aria-label="terminal input">
  </div>
</div>

<noscript>
  <div class="terminal-container">
    <p>JavaScript is disabled. The essentials:</p>
    <ul>
      <li><a href="/about/">about</a></li>
      <li><a href="/portfolio/">portfolio</a></li>
      <li><a href="/writings/">writings</a></li>
      <li><a href="/card/">contact card</a></li>
    </ul>
  </div>
</noscript>

<script src="{{ '/assets/js/terminal-commands.js' | relative_url }}"></script>
<script src="{{ '/assets/js/terminal-shell.js' | relative_url }}"></script>
```

- [ ] **Step 2: Verify Jekyll builds with the new include present**

Run: `bundle exec jekyll build`
Expected: build completes with no Liquid errors (the include exists; it is not referenced yet, so this just confirms it is valid and assets resolve).

- [ ] **Step 3: Commit**

```bash
git add _includes/terminal_shell.html
git commit -m "feat(terminal): add terminal_shell include markup + noscript fallback"
```

---

## Task 4: Wire into landing page + functional verification

**Files:**
- Modify: `_pages/landing_page.md`

- [ ] **Step 1: Swap the include**

In `_pages/landing_page.md`, replace the line:

```liquid
{% include terminal_search.html %}
```

with:

```liquid
{% include terminal_shell.html %}
```

- [ ] **Step 2: Build and serve**

Run: `bundle exec jekyll serve` (or `./run.sh`)
Expected: server starts at `http://127.0.0.1:4000` with no errors.

- [ ] **Step 3: Functional verification in the browser**

Open `http://127.0.0.1:4000/` and confirm each item:

- [ ] Lorenz green animation renders behind the terminal box.
- [ ] Boot text types out and ends with `type 'help' to begin.`; the input prompt then appears and is focused.
- [ ] `help` lists every command (help, ls, open, cat, find, whoami, contact, clear, history, neofetch) and does NOT list `eval`.
- [ ] `ls` prints the six sections + hint; `ls writings` prints clickable recent post links.
- [ ] `open about` navigates to `/about/`; back, `cat portfolio` prints a blurb + link without navigating.
- [ ] `find conformal` prints result link(s) to matching writings; `grep <nonsense>` prints `> no results.`
- [ ] `whoami` (and `bio`) prints the bio block; `contact` prints the link list; `neofetch` prints the ASCII banner + info.
- [ ] `clear` empties the screen; typing several commands then pressing ↑/↓ recalls them; `history` lists them.
- [ ] `eval 2+2*10` prints `> 22`.
- [ ] An unknown command (e.g. `foo`) prints `command not found: foo. type 'help' for a list.`
- [ ] Visit `http://127.0.0.1:4000/?cmd=cat_bio` → boot is skipped, bio prints immediately, and the URL bar resets to `/`.
- [ ] From `/about/`, click the existing "cat bio" button → lands on `/` showing the bio (confirms `_layouts/about_me.html` deep link still works).
- [ ] Resize to mobile width (≤520px) → terminal is readable and the input is usable.
- [ ] Temporarily disable JS in the browser and reload → the `<noscript>` link list renders.

- [ ] **Step 4: Commit**

```bash
git add _pages/landing_page.md
git commit -m "feat(terminal): make /terminal shell the landing page experience"
```

---

## Self-Review Notes (for the planner)

- **Spec coverage:** Architecture (Tasks 1-3), all v1 commands incl. `eval` hidden (Task 1), boot + `?cmd=cat_bio` compatibility (Task 2 + verified Task 4), noscript/SEO fallback (Task 3), landing swap (Task 4), styling reuse (no new SCSS needed — confirmed against `_terminal.scss`). `terminal_search.html` cleanup intentionally deferred per spec.
- **Type/name consistency:** `ctx` shape (`print`/`printHTML`/`clear`/`navigate`/`lunr`/`commands`/`history`/`args`) is defined identically in the engine (Task 2) and consumed exactly that way in the registry (Task 1). `window.TerminalCommands` produced in Task 1, read in Task 2. DOM IDs (`math-canvas`, `terminal-container`, `terminal-output`, `terminal-input-line`, `terminal-input`) match across the include (Task 3) and engine (Task 2).
- **No placeholders:** every code step contains complete, runnable content.
```
