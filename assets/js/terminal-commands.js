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
