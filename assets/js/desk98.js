/* Inner-page desktops (_layouts/desk98.html, /about/ and /bookmarks/): turns section lists
   into icon views, places the windows, and lets them be focused, dragged, maximized, closed
   and reopened from the desktop icons, as on the landing desktop. win98-desktop.js also runs
   the boot, taskbar and Start menu there, so it stays separate. Below 900px the windows stay
   stacked the way the layout renders them and only the icon views and close/reopen apply. */
(function () {
  "use strict";

  var root = document.getElementById("desk98");
  if (!root) return;

  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = matchMedia("(pointer: coarse)").matches;
  var wide = matchMedia("(min-width: 900px)");
  var wins = Array.prototype.slice.call(root.querySelectorAll(".window98"));
  var icons = Array.prototype.slice.call(root.querySelectorAll(".desktop98-icon"));
  var topZ = 10;

  function byId(id) { return root.querySelector('[data-window="' + id + '"]'); }
  function live() { return root.classList.contains("desk98--live"); }

  /* ================= icon views ================= */

  /* One list item: its leading link (if any), the text after it, and its nested items. */
  function readItem(li) {
    var copy = li.cloneNode(true);
    copy.querySelectorAll("ul, ol").forEach(function (l) { l.remove(); });
    var text = copy.textContent.replace(/\s+/g, " ").trim();
    var a = copy.firstElementChild && copy.firstElementChild.tagName === "A" ? copy.firstElementChild : null;
    var lead = a && text.indexOf(a.textContent.trim()) === 0;
    var strong = copy.querySelector("strong");
    var title = lead ? a.textContent.trim() : strong && text.indexOf(strong.textContent.trim()) === 0 ? strong.textContent.trim() : text;
    var sub = li.querySelector(":scope > ul, :scope > ol");
    return {
      title: title.replace(/:$/, ""),
      href: lead ? a.getAttribute("href") : null,
      tip: text,
      kids: sub ? Array.prototype.map.call(sub.children, readItem) : []
    };
  }

  function tile(item, glyph) {
    var t = document.createElement(item.href ? "a" : "div");
    t.className = "desk98-tile" + (item.href ? " desk98-tile--link" : "");
    if (item.href) t.href = item.href; else t.tabIndex = 0;
    t.dataset.tip = item.tip;
    t.title = item.tip;
    var g = document.createElement("span");
    g.className = "desk98-tile-glyph glyph98";
    g.setAttribute("aria-hidden", "true");
    g.textContent = glyph;
    var label = document.createElement("span");
    label.className = "desk98-tile-label";
    label.textContent = item.title;
    t.append(g, label);
    return t;
  }

  /* Bookmarks: every item and sub-item a shortcut. Pillars: one control-panel icon per item. */
  root.querySelectorAll(".desk98-shortcuts, .desk98-icons").forEach(function (pane) {
    var glyphs = (pane.dataset.glyphs || "").split(" ").filter(Boolean);
    var n = 0;
    pane.querySelectorAll(":scope > ul").forEach(function (ul) {
      var grid = document.createElement("div");
      grid.className = "desk98-tiles";
      Array.prototype.forEach.call(ul.children, function (li) {
        var item = readItem(li);
        if (pane.classList.contains("desk98-icons")) {
          grid.appendChild(tile(item, glyphs[n] || "⭐"));
          n++;
          return;
        }
        grid.appendChild(tile(item, item.href ? "🌐" : "📄"));
        n++;
        item.kids.forEach(function (kid) { grid.appendChild(tile(kid, kid.href ? "🔗" : "📝")); n++; });
      });
      ul.replaceWith(grid);
    });
    count(pane, n);
  });
  root.querySelectorAll(".desk98-notepad").forEach(function (pane) {
    count(pane, pane.querySelectorAll(":scope > ul > li").length);
  });

  function count(pane, n) {
    var field = pane.closest(".window98").querySelector("[data-count]");
    if (field) field.textContent = n + " object(s)";
  }

  /* The status bar describes the icon under the pointer or focus, as Explorer does. */
  function describe(e) {
    var t = e.target.closest && e.target.closest(".desk98-tile");
    var win = e.target.closest && e.target.closest(".window98");
    var field = win && win.querySelector("[data-status]");
    if (!field) return;
    if (!field.dataset.idle) field.dataset.idle = field.textContent;
    field.textContent = t ? t.dataset.tip : field.dataset.idle;
  }
  root.addEventListener("mouseover", describe);
  root.addEventListener("focusin", describe);

  /* ================= placement ================= */

  var COLUMN = 96, DOCK_W = 300, GAP = 12, STEP = 30;

  function put(el, x, y, w, h) {
    el.style.left = Math.round(x) + "px";
    el.style.top = Math.round(y) + "px";
    el.style.width = Math.round(w) + "px";
    el.style.height = Math.round(h) + "px";
  }

  /* Docked windows stack in a column beside the icons; boxed ones take their share of the
     rest; the others cascade so every title bar shows, the first section in front. */
  function layout() {
    root.classList.toggle("desk98--live", wide.matches);
    wins.forEach(function (el) { el.style.cssText = ""; delete el.dataset.max; });
    if (!wide.matches) return;
    var W = root.clientWidth, H = root.clientHeight;

    var docked = wins.filter(function (el) { return el.dataset.dock === "left"; });
    var y = 10;
    docked.forEach(function (el, i) {
      var last = i === docked.length - 1;
      el.style.width = DOCK_W + "px";
      var h = last && i > 0 ? H - y - 10 : el.offsetHeight;
      put(el, COLUMN, y, DOCK_W, h);
      y += h + GAP;
    });

    var ax = COLUMN + DOCK_W + GAP, aw = W - ax - 10, ah = H - 20;
    var rest = wins.filter(function (el) { return !el.dataset.dock; });
    var boxed = rest.filter(function (el) { return el.dataset.box; });
    var cascade = rest.filter(function (el) { return !el.dataset.box; });
    boxed.forEach(function (el) {
      var b = el.dataset.box.split(" ").map(Number);
      put(el, ax + b[0] * aw, 10 + b[1] * ah, b[2] * aw, b[3] * ah);
    });
    var n = cascade.length, cw = Math.min(780, aw - (n - 1) * STEP);
    cascade.forEach(function (el, i) {
      var j = n - 1 - i;
      put(el, ax + j * STEP, 10 + j * STEP, cw, ah - (n - 1) * STEP);
    });

    docked.concat(boxed.slice().reverse(), cascade.slice().reverse()).forEach(focus);
  }

  /* ================= windows ================= */

  function focus(el) {
    if (!el) return;
    wins.forEach(function (w) { w.querySelector(".title-bar").classList.toggle("inactive", w !== el); });
    el.style.zIndex = ++topZ;
  }

  function topmost() {
    return wins.filter(function (w) { return !w.hidden; })
      .sort(function (a, b) { return (+b.style.zIndex || 0) - (+a.style.zIndex || 0); })[0];
  }

  function rectIn(el) {
    var r = el.getBoundingClientRect(), s = root.getBoundingClientRect();
    return { left: r.left - s.left, top: r.top - s.top, width: r.width, height: r.height };
  }

  /* The outline that flies from an icon to the window it opens. */
  function zoom(from, el) {
    if (reduced || !from || !live()) return;
    var ghost = document.createElement("div");
    ghost.className = "window98-zoom";
    root.appendChild(ghost);
    var frame = function (r) { return { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" }; };
    ghost.animate([frame(rectIn(from)), frame(rectIn(el))], { duration: 230, easing: "cubic-bezier(.4, 0, .6, 1)" })
      .onfinish = function () { ghost.remove(); };
  }

  function open(id, from) {
    var targets = id === "*" ? wins.filter(function (w) { return w.dataset.window !== "profile"; }) : [byId(id)];
    targets.reverse().forEach(function (el) {
      if (!el) return;
      var was = el.hidden;
      el.hidden = false;
      focus(el);
      if (was) zoom(from, el);
    });
    var first = targets[targets.length - 1];
    if (!first) return;
    first.focus({ preventScroll: live() });
    if (!live()) first.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  function close(el) {
    var had = el.contains(document.activeElement);
    el.hidden = true;
    var next = topmost();
    focus(next);
    if (had) (next || icons[0]).focus({ preventScroll: true });
  }

  function toggleMaximize(el) {
    if (!live()) return;
    var s = el.style;
    if (el.dataset.max) {
      var p = el.dataset.max.split(" ");
      s.left = p[0]; s.top = p[1]; s.width = p[2]; s.height = p[3];
      delete el.dataset.max;
    } else {
      el.dataset.max = [s.left, s.top, s.width, s.height].join(" ");
      s.left = "0px"; s.top = "0px"; s.width = "100%"; s.height = "100%";
    }
    el.querySelector('[data-act="max"]').setAttribute("aria-label", el.dataset.max ? "Restore" : "Maximize");
  }

  wins.forEach(function (el) { el.tabIndex = -1; });

  root.addEventListener("click", function (e) {
    var t = e.target.closest("[data-act]");
    if (!t) return;
    var el = t.closest(".window98");
    if (t.dataset.act === "close") close(el);
    if (t.dataset.act === "max") toggleMaximize(el);
  });

  /* Focus on press; drag by the title bar; double-click the title bar to maximize. */
  root.addEventListener("pointerdown", function (e) {
    var el = e.target.closest(".window98");
    if (!el) return;
    focus(el);
    var bar = e.target.closest(".title-bar");
    if (!bar || !live() || e.target.closest("button") || el.dataset.max) return;
    e.preventDefault();
    var W = root.clientWidth, H = root.clientHeight;
    var startX = e.clientX, startY = e.clientY, left = el.offsetLeft, top = el.offsetTop;
    bar.setPointerCapture(e.pointerId);
    function move(ev) {
      el.style.left = Math.max(60 - el.offsetWidth, Math.min(W - 60, left + ev.clientX - startX)) + "px";
      el.style.top = Math.max(0, Math.min(H - 22, top + ev.clientY - startY)) + "px";
    }
    function up() {
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
      bar.removeEventListener("pointercancel", up);
    }
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
    bar.addEventListener("pointercancel", up);
  });
  root.addEventListener("dblclick", function (e) {
    var bar = e.target.closest(".title-bar");
    if (bar && !e.target.closest("button")) toggleMaximize(bar.closest(".window98"));
  });

  /* ================= desktop icons ================= */

  function select(el) { icons.forEach(function (i) { i.classList.toggle("selected", i === el); }); }
  function activate(el) {
    if (el.dataset.open) open(el.dataset.open, el);
    else location.href = el.href;
  }
  icons.forEach(function (el) {
    /* As on the landing desktop: one click selects, a double-click opens; a tap or a keyboard
       click (detail 0) opens. */
    el.addEventListener("click", function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return; /* let links open in a new tab */
      e.preventDefault();
      select(el);
      if (coarse || e.detail === 0) activate(el);
    });
    el.addEventListener("dblclick", function () { if (!coarse) activate(el); });
    el.addEventListener("keydown", function (e) {
      if (el.tagName !== "A" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); activate(el); }
    });
  });
  root.addEventListener("pointerdown", function (e) { if (e.target === root) select(null); });

  /* ================= start ================= */

  layout();
  wide.addEventListener("change", layout);
  /* Pull windows back inside the desktop after a resize. */
  window.addEventListener("resize", function () {
    if (!live()) return;
    var W = root.clientWidth, H = root.clientHeight;
    wins.forEach(function (el) {
      if (el.dataset.max) return;
      var s = el.style, w = Math.min(parseFloat(s.width), W - 12), h = Math.min(parseFloat(s.height), H - 12);
      s.width = w + "px";
      s.height = h + "px";
      s.left = Math.max(6, Math.min(parseFloat(s.left), W - w - 6)) + "px";
      s.top = Math.max(6, Math.min(parseFloat(s.top), H - h - 6)) + "px";
    });
  });
  /* A #section link brings that window to the front. */
  var hashed = location.hash && byId(decodeURIComponent(location.hash.slice(1)));
  if (hashed) open(hashed.dataset.window);
})();
