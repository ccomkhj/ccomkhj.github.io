/* Terminal command registry.
   To add a command: append one object to the array below.
   Each: { name, aliases?, desc, usage?, hidden?, run(args, ctx) }
   ctx provides: print(text), printHTML(html), clear(), navigate(url),
                 lunr {idx, store}, commands[], args, history[]. */
(function () {
  "use strict";

  var PAGES = {
    about:     { url: "/about/",     blurb: "polymath journey, core pillars, things I'm proud of." },
    portfolio: { url: "/portfolio/", blurb: "agent workflows, self-improving harnesses, agentic ML, and applied systems." },
    writings:  { url: "/writings/",  blurb: "100+ posts on ML, forecasting, CV, MLOps, reflections." },
    bookmarks: { url: "/bookmarks/", blurb: "curated links worth keeping." },
    tags:      { url: "/tags/",      blurb: "writings grouped by tag." },
    card:      { url: "/card/",      blurb: "contact card, ready to add to your phone." },
    qr:        { url: "/qr/",        blurb: "scan-to-connect QR page." }
  };

  /* Who Huijo is: _data/profile.yml, via _includes/profile-data.html. */
  var P = window.Profile || {};
  var GREEN = "<span style='color:#33ff00'>";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function pad(s, n) { while (s.length < n) s += " "; return s; }
  /* Stable fake commit hash for `log` (djb2, 7 hex digits). */
  function sha(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
    return ("0000000" + h.toString(16)).slice(-7);
  }

  var BIO =
    "<div style='margin-top:8px;margin-bottom:12px;color:#ccc'>" +
    (P.bio || []).map(function (p) { return "<p>" + p + "</p>"; }).join("") +
    "</div>";
  window.TerminalBio = BIO; /* also read by the landing page's README and Welcome windows */

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
      name: "whoami", aliases: ["bio"], desc: "who is huijo",
      run: function (args, ctx) {
        var rows = P.whoami || [];
        var w = Math.max.apply(null, rows.map(function (r) { return r.k.length; }).concat(0));
        ctx.printHTML(GREEN + esc((P.name || "").toLowerCase()) + "</span> · " +
          esc(P.title + " @ " + P.company) + " · " + esc(P.headline));
        rows.forEach(function (r) {
          ctx.printHTML("  " + GREEN + pad(r.k, w) + "</span>  " + esc(r.v));
        });
        ctx.printHTML("  more → <a href='/about/'>/about/</a> · career → log");
      }
    },
    {
      name: "log", aliases: ["git"], desc: "career, as a git log",
      run: function (args, ctx) {
        if (args.trim() && !/^(log\b|--)/.test(args.trim())) { ctx.print("usage: log  (or: git log)"); return; }
        (P.timeline || []).forEach(function (e, i) {
          var head = i === 0 ? " <span style='color:#33ccff'>(HEAD -&gt; " + esc(e.org.toLowerCase()) + ")</span>" : "";
          ctx.printHTML("<span style='color:#ffcc00'>" + sha(e.year + e.org) + "</span>" + head +
            " " + e.year + " " + GREEN + esc(e.org) + "</span>: " + esc(e.what));
        });
      }
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
        var prev = P.previously || {};
        ctx.printHTML("  <span style='color:#33ff00'>role</span>     " + esc(P.title + " @ " + P.company));
        ctx.printHTML("  <span style='color:#33ff00'>prev</span>     " + esc(prev.role + " @ " + prev.company + " (" + prev.note + ")"));
        ctx.printHTML("  <span style='color:#33ff00'>stack</span>    " + esc((P.stack || []).join(" · ")));
        ctx.printHTML("  <span style='color:#33ff00'>focus</span>    " + esc((P.focus || []).join(" · ")));
        ctx.printHTML("  <span style='color:#33ff00'>uptime</span>   shipping since " + esc(P.since));
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
