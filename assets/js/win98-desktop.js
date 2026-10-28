/* Win98 desktop for the landing page (_layouts/win98_desktop.html): boot sequence,
   window manager, taskbar, Start menu and Shut Down. The layout pre-renders every
   window; this file only shows, places and wires them. The MS-DOS window hosts the
   terminal engine (terminal-shell.js), which binds to its fixed IDs by itself. */
(function () {
  "use strict";

  var root = document.getElementById("desktop98");
  if (!root) return;

  var html = document.documentElement;
  var screen = root.querySelector(".desktop98-screen");
  var desk = root.querySelector(".desktop98-desk");
  var marquee = root.querySelector(".desktop98-marquee");
  var icons = Array.prototype.slice.call(root.querySelectorAll(".desktop98-icon"));
  var tasks = root.querySelector(".taskbar98-tasks");
  var startButton = root.querySelector(".taskbar98-start");
  var startMenu = root.querySelector(".startmenu98");
  var dim = root.querySelector(".shutdown98-dim");
  var shutdownDialog = root.querySelector(".shutdown98-dialog");
  var safeScreen = root.querySelector(".shutdown98-safe");
  var boot = root.querySelector(".boot98");

  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = matchMedia("(pointer: coarse)").matches;
  var posts = JSON.parse(document.getElementById("desktop98-posts").textContent);
  var featuredData = document.getElementById("desktop98-featured");
  var featured = JSON.parse(featuredData.textContent); /* top three by featured_rank */
  var bio = bioParagraphs();
  /* Read now: terminal-shell.js strips ?cmd= from the URL at DOMContentLoaded. */
  var bioRequested = new URLSearchParams(location.search).get("cmd") === "cat_bio";

  function bioParagraphs() {
    var t = document.createElement("template");
    t.innerHTML = window.TerminalBio || "";
    return Array.prototype.map.call(t.content.querySelectorAll("p"), function (p) {
      return p.textContent.replace(/\s+/g, " ").trim();
    });
  }

  function stored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function store(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (e) { /* storage blocked: the choice lasts for this page view only */ }
  }

  function navigate(href) {
    root.classList.add("desktop98-wait");
    setTimeout(function () { location.href = href; }, 220);
  }
  /* Coming Back from the back-forward cache: undo whatever was on screen when we left. */
  window.addEventListener("pageshow", function () {
    root.classList.remove("desktop98-wait");
    closeStart();
    dim.hidden = true;
    shutdownDialog.hidden = true;
  });

  /* ================= window manager ================= */

  var windows = {}; /* open windows by id: { el, task, min, max, prev } */
  var topZ = 10;
  var cascade = 0;
  var onOpen = { welcome: function () { showWelcomeItem(0); } };
  var onShow = { dos: focusTerminal };

  function windowEl(id) { return root.querySelector('[data-window="' + id + '"]'); }
  root.querySelectorAll(".window98").forEach(function (el) { el.tabIndex = -1; });

  function rectIn(el) {
    var r = el.getBoundingClientRect(), s = screen.getBoundingClientRect();
    return { left: r.left - s.left, top: r.top - s.top, width: r.width, height: r.height };
  }

  /* The outline that flies between an icon or task button and its window. */
  function zoom(from, to, done) {
    if (reduced || !from) { if (done) done(); return; }
    var ghost = document.createElement("div");
    ghost.className = "window98-zoom";
    screen.appendChild(ghost);
    var frame = function (r) {
      return { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" };
    };
    ghost.animate([frame(from), frame(to)], { duration: 230, easing: "cubic-bezier(.4, 0, .6, 1)" })
      .onfinish = function () { ghost.remove(); if (done) done(); };
  }

  function place(el) {
    var d = desk.getBoundingClientRect();
    var small = d.width < 700;
    var w = small ? d.width - 12 : Math.min(+el.dataset.w, d.width - 24);
    var h = Math.min(+el.dataset.h + (small ? 200 : 0), d.height - (small ? 12 : 24)); /* phones: narrow, so taller */
    var x, y;
    if (small) {
      x = 6; y = 6;
    } else if (el.hasAttribute("data-center")) {
      x = (d.width - w) / 2;
      y = Math.max(12, (d.height - h) / 2 - 20);
    } else {
      x = Math.min(110 + cascade * 28, d.width - w - 12);
      y = Math.min(24 + cascade * 28, d.height - h - 12);
      cascade = (cascade + 1) % 7;
    }
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.width = w + "px";
    el.style.height = h + "px";
  }

  /* Unhide a window behind the zoom outline and move focus into it. Focus happens now, inside
     the click or tap, so iOS raises the keyboard for the terminal; opacity (not visibility)
     keeps the hidden window focusable. */
  function reveal(id, from) {
    var el = windows[id].el;
    el.hidden = false;
    el.style.opacity = "0";
    focus(id);
    if (onShow[id]) onShow[id]();
    else el.focus({ preventScroll: true });
    zoom(from, rectIn(el), function () {
      el.style.opacity = "";
      if (!reduced) el.animate([{ transform: "scale(.97)", opacity: .4 }, { transform: "none", opacity: 1 }], 140);
    });
  }

  /* Keep focus inside the desktop when the window holding it goes away. */
  function handBackFocus(el) {
    if (!el.contains(document.activeElement)) return;
    var next = topmost();
    if (next) windows[next].el.focus({ preventScroll: true });
    else root.querySelector(".taskbar98-start").focus({ preventScroll: true });
  }

  function openWindow(id, fromEl) {
    var w = windows[id];
    if (w) { if (w.min) restore(id); else focus(id); return; }
    var el = windowEl(id);
    place(el);
    windows[id] = { el: el, task: addTask(id, el), min: false, max: false, prev: null };
    setMaxLabel(el, false);
    if (onOpen[id]) onOpen[id]();
    reveal(id, fromEl ? rectIn(fromEl) : null);
  }

  function addTask(id, el) {
    var task = document.createElement("button");
    task.type = "button";
    task.className = "taskbar98-task";
    Array.prototype.forEach.call(el.querySelector(".title-bar-text").children, function (span) {
      task.appendChild(span.cloneNode(true));
    });
    task.addEventListener("click", function () {
      var w = windows[id];
      if (w.min) restore(id);
      else if (topmost() === id) minimize(id);
      else focus(id);
    });
    tasks.appendChild(task);
    return task;
  }

  function focus(id) {
    Object.keys(windows).forEach(function (k) {
      var w = windows[k];
      w.el.querySelector(".title-bar").classList.toggle("inactive", k !== id);
      w.task.classList.toggle("on", k === id && !w.min);
    });
    if (windows[id]) windows[id].el.style.zIndex = ++topZ;
  }

  function topmost() {
    var best = null, bestZ = -1;
    Object.keys(windows).forEach(function (k) {
      var w = windows[k];
      if (!w.min && +w.el.style.zIndex > bestZ) { bestZ = +w.el.style.zIndex; best = k; }
    });
    return best;
  }

  function minimize(id) {
    var w = windows[id];
    zoom(rectIn(w.el), rectIn(w.task));
    w.min = true;
    handBackFocus(w.el);
    w.el.hidden = true;
    focus(topmost());
  }

  function restore(id) {
    windows[id].min = false;
    reveal(id, rectIn(windows[id].task));
  }

  function setMaxLabel(el, max) {
    el.querySelector('[data-act="max"]').setAttribute("aria-label", max ? "Restore" : "Maximize");
  }

  function toggleMaximize(id) {
    var w = windows[id], s = w.el.style;
    if (w.max) {
      s.left = w.prev[0]; s.top = w.prev[1]; s.width = w.prev[2]; s.height = w.prev[3];
    } else {
      w.prev = [s.left, s.top, s.width, s.height];
      s.left = "0px"; s.top = "0px"; s.width = "100%"; s.height = "100%";
    }
    w.max = !w.max;
    setMaxLabel(w.el, w.max);
  }

  function closeWindow(id) {
    var w = windows[id];
    if (!w) return;
    delete windows[id];
    handBackFocus(w.el);
    w.el.hidden = true;
    w.task.remove();
    focus(topmost());
  }

  /* Pull open windows back inside the desktop after a resize or rotation. */
  window.addEventListener("resize", function () {
    var d = desk.getBoundingClientRect();
    Object.keys(windows).forEach(function (id) {
      var w = windows[id], s = w.el.style;
      if (w.max) return;
      var width = Math.min(parseFloat(s.width), d.width - 12);
      var height = Math.min(parseFloat(s.height), d.height - 12);
      s.width = width + "px";
      s.height = height + "px";
      s.left = Math.max(6, Math.min(parseFloat(s.left), d.width - width - 6)) + "px";
      s.top = Math.max(6, Math.min(parseFloat(s.top), d.height - height - 6)) + "px";
    });
  });

  /* Focus on press; drag by the title bar; double-click the title bar to maximize. */
  var windowLayer = root.querySelector(".desktop98-windows");
  windowLayer.addEventListener("pointerdown", function (e) {
    var el = e.target.closest(".window98");
    if (!el) return;
    var id = el.dataset.window;
    focus(id);
    var bar = e.target.closest(".title-bar");
    if (!bar || e.target.closest("button") || windows[id].max) return;
    e.preventDefault();
    var d = desk.getBoundingClientRect();
    var startX = e.clientX, startY = e.clientY, left = el.offsetLeft, top = el.offsetTop;
    bar.setPointerCapture(e.pointerId);
    function move(ev) {
      el.style.left = Math.max(60 - el.offsetWidth, Math.min(d.width - 60, left + ev.clientX - startX)) + "px";
      el.style.top = Math.max(0, Math.min(d.height - 22, top + ev.clientY - startY)) + "px";
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
  windowLayer.addEventListener("dblclick", function (e) {
    var bar = e.target.closest(".title-bar");
    if (bar && !e.target.closest("button")) toggleMaximize(bar.parentNode.dataset.window);
  });

  /* ================= window contents ================= */

  var welcomeItems = Array.prototype.slice.call(root.querySelectorAll(".welcome98-item"));
  var welcomeDesc = root.querySelector(".welcome98-desc");
  var welcomeShow = document.getElementById("welcome98-show");
  var typing;

  function para(text, className) {
    var p = document.createElement("p");
    if (className) p.className = className;
    if (text) p.textContent = text;
    return p;
  }

  /* Featured picks above Latest; Latest stays independent of curation. Real links, built
     with textContent, so no title can inject markup. */
  function featuredPicks() {
    var box = document.createDocumentFragment();
    box.appendChild(para("Featured picks", "welcome98-label"));
    var ol = document.createElement("ol");
    featured.forEach(function (post) {
      var li = document.createElement("li"), a = document.createElement("a");
      a.href = post.url;
      a.textContent = post.title;
      li.appendChild(a);
      if (post.ai) { /* same words as _includes/post-badges.html */
        var badges = li.appendChild(document.createElement("span"));
        badges.className = "badges98";
        var badge = badges.appendChild(document.createElement("span"));
        badge.className = "badge98";
        badge.textContent = "AI-researched";
      }
      ol.appendChild(li);
    });
    box.appendChild(ol);
    var all = document.createElement("a");
    all.href = featuredData.dataset.all;
    all.textContent = "See all " + featuredData.dataset.total + " Featured →";
    box.appendChild(para()).appendChild(all);
    return box;
  }

  function showWelcomeItem(i) {
    var item = welcomeItems[i];
    var text = item.dataset.desc || bio[0] || "";
    welcomeItems.forEach(function (el) {
      el.classList.toggle("on", el === item);
      el.tabIndex = el === item ? 0 : -1; /* one Tab stop; arrows move between items */
    });
    welcomeDesc.textContent = "";
    var h = document.createElement("h4");
    h.textContent = item.children[0].textContent + " " + item.children[1].textContent;
    var typed = para("", "welcome98-caret");
    welcomeDesc.append(h, typed);
    if (item.hasAttribute("data-latest") && featured.length) welcomeDesc.appendChild(featuredPicks());
    if (item.hasAttribute("data-latest") && posts.length) {
      var latest = document.createElement("a");
      latest.href = posts[0].url;
      latest.textContent = posts[0].title;
      var p = para("Latest: ");
      p.appendChild(latest);
      welcomeDesc.appendChild(p);
    }
    var hint = document.createElement("i");
    hint.textContent = coarse ? "Tap to open. Icons on the desktop open with a tap."
                              : "Click to open, or use ↑ ↓ and Enter. Icons on the desktop open with a double-click.";
    welcomeDesc.appendChild(para()).appendChild(hint);

    clearInterval(typing);
    if (reduced) { typed.textContent = text; return; }
    var n = 0;
    typing = setInterval(function () {
      n += 3;
      typed.textContent = text.slice(0, n);
      if (n >= text.length) clearInterval(typing);
    }, 16);
  }
  /* The menu is one Tab stop (arrow keys pick an item), so Tab goes on into the links of the
     shown description, e.g. the Featured picks, instead of to the next item. */
  welcomeItems.forEach(function (item, i) {
    item.addEventListener("mouseenter", function () { showWelcomeItem(i); });
    item.addEventListener("focus", function () { showWelcomeItem(i); });
    item.addEventListener("keydown", function (e) {
      var n = welcomeItems.length;
      var to = { ArrowDown: (i + 1) % n, ArrowUp: (i + n - 1) % n, Home: 0, End: n - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      welcomeItems[to].focus();
    });
  });
  welcomeShow.checked = stored("welcome98") !== "off";
  welcomeShow.addEventListener("change", function () {
    store("welcome98", welcomeShow.checked ? null : "off");
  });

  /* System Properties tabs */
  var system = windowEl("system");
  var tabs = Array.prototype.slice.call(system.querySelectorAll("[role=tab]"));
  tabs.forEach(function (tab) {
    tab.tabIndex = 0;
    tab.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tab.click(); }
    });
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.setAttribute("aria-selected", t === tab); });
      system.querySelectorAll("[data-panel]").forEach(function (panel) {
        panel.hidden = panel.dataset.panel !== tab.dataset.tab;
      });
    });
  });

  var readme = windowEl("readme").querySelector("textarea");
  readme.value = readme.value.replace("%BIO%", bio.join("\n\n"));

  function focusTerminal() {
    document.getElementById("terminal-input").focus({ preventScroll: true });
  }

  /* ================= desktop icons ================= */

  function select(chosen) {
    icons.forEach(function (el) { el.classList.toggle("selected", chosen.indexOf(el) !== -1); });
  }
  function openIcon(el) {
    if (el.dataset.open) openWindow(el.dataset.open, el);
    else navigate(el.href);
  }
  icons.forEach(function (el) {
    /* One click selects, a double-click opens; a tap or a keyboard click (detail 0) opens. */
    el.addEventListener("click", function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return; /* let links open in a new tab */
      e.preventDefault();
      select([el]);
      if (coarse || e.detail === 0) openIcon(el);
    });
    el.addEventListener("dblclick", function () { if (!coarse) openIcon(el); });
    el.addEventListener("keydown", function (e) {
      if (el.tagName !== "A" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openIcon(el); }
    });
  });

  /* Rubber-band selection on the empty desktop */
  desk.addEventListener("pointerdown", function (e) {
    if (e.target !== desk || e.pointerType !== "mouse" || e.button !== 0) return;
    closeStart();
    select([]);
    var d = desk.getBoundingClientRect();
    var startX = e.clientX - d.left, startY = e.clientY - d.top;
    desk.setPointerCapture(e.pointerId);
    function move(ev) {
      var x = ev.clientX - d.left, y = ev.clientY - d.top;
      var l = Math.min(startX, x), t = Math.min(startY, y);
      var w = Math.abs(x - startX), h = Math.abs(y - startY);
      marquee.style.cssText = "display:block;left:" + l + "px;top:" + t + "px;width:" + w + "px;height:" + h + "px";
      select(icons.filter(function (el) {
        var r = el.getBoundingClientRect();
        var il = r.left - d.left, it = r.top - d.top;
        return il < l + w && il + r.width > l && it < t + h && it + r.height > t;
      }));
    }
    function up() {
      marquee.style.display = "none";
      desk.removeEventListener("pointermove", move);
      desk.removeEventListener("pointerup", up);
      desk.removeEventListener("pointercancel", up);
    }
    desk.addEventListener("pointermove", move);
    desk.addEventListener("pointerup", up);
    desk.addEventListener("pointercancel", up);
  });

  /* ================= Start menu and actions ================= */

  function setStart(open) {
    startMenu.classList.toggle("open", open);
    startButton.classList.toggle("on", open);
    startButton.setAttribute("aria-expanded", open);
  }
  function closeStart() { setStart(false); }
  startButton.addEventListener("click", function (e) {
    e.stopPropagation();
    setStart(!startMenu.classList.contains("open"));
    /* Opened from the keyboard: move focus into the menu (its items follow the button in Tab order) */
    if (e.detail === 0 && startMenu.classList.contains("open")) startMenu.querySelector("a").focus();
  });
  startMenu.addEventListener("focusout", function (e) {
    if (e.relatedTarget && !startMenu.contains(e.relatedTarget) && e.relatedTarget !== startButton) closeStart();
  });
  document.addEventListener("click", function (e) {
    if (!startMenu.contains(e.target)) closeStart();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (startMenu.contains(document.activeElement)) startButton.focus();
    closeStart();
    if (!shutdownDialog.hidden) { dim.hidden = true; shutdownDialog.hidden = true; }
  });

  root.addEventListener("click", function (e) {
    var t = e.target.closest("[data-act],[data-open],[data-href]");
    if (!t || t.classList.contains("desktop98-icon")) return;
    /* Ctrl/Cmd/Shift-click on a real page link opens that page in a new tab, as links do */
    if ((e.ctrlKey || e.metaKey || e.shiftKey) && t.tagName === "A" && t.getAttribute("href").charAt(0) !== "#") return;
    var win = t.closest("[data-window]");
    var id = win && win.dataset.window;
    if (t.dataset.open) {
      e.preventDefault();
      closeStart();
      openWindow(t.dataset.open, t);
      return;
    }
    if (t.dataset.href) { navigate(t.dataset.href); return; }
    e.preventDefault();
    switch (t.dataset.act) {
      case "min": minimize(id); break;
      case "max": toggleMaximize(id); break;
      case "close": closeWindow(id); break;
      case "shutdown":
        closeStart();
        dim.hidden = false;
        shutdownDialog.hidden = false;
        shutdownDialog.querySelector('[data-act="shutdown-ok"]').focus();
        break;
      case "shutdown-cancel": dim.hidden = true; shutdownDialog.hidden = true; break;
      case "shutdown-ok": shutDown(shutdownDialog.querySelector("input[name=shutdown98]:checked").value); break;
    }
  });

  /* ================= Shut Down, power cycle and boot ================= */

  function shutDown(choice) {
    shutdownDialog.hidden = true;
    if (choice === "dos") { navigate(shutdownDialog.dataset.terminal); return; }
    if (choice === "restart") { powerCycle(); return; }
    setTimeout(function () { dim.hidden = true; safeScreen.hidden = false; }, 450);
  }
  safeScreen.addEventListener("click", powerCycle);

  /* CRT power-off, then a fresh desktop and the boot again. */
  function powerCycle() {
    dim.hidden = true;
    shutdownDialog.hidden = true;
    function reboot() {
      safeScreen.hidden = true;
      screen.classList.remove("off");
      Object.keys(windows).forEach(closeWindow);
      cascade = 0;
      runBoot();
    }
    if (reduced) { reboot(); return; }
    screen.classList.add("off");
    setTimeout(reboot, 1000);
  }

  var post = boot.querySelector(".boot98-post");
  var postLines = Array.prototype.slice.call(boot.querySelectorAll(".boot98-line"));
  var memory = boot.querySelector("[data-memory]");
  var splash = boot.querySelector(".boot98-splash");
  var bootTimers = [];

  function at(ms, fn) { bootTimers.push(setTimeout(fn, ms)); }

  function countMemory() {
    var t0 = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - t0) / 420);
      memory.textContent = "Memory Test :  " + String(Math.round(65536 * k)).padStart(5, " ") + "K" + (k === 1 ? " OK" : "");
      if (k < 1 && html.classList.contains("booting98")) requestAnimationFrame(step);
    })(t0);
  }

  /* About 3.7 s from power-on to desktop: CRT flash, POST, splash, fade. */
  function runBoot() {
    closeStart();
    bootTimers.forEach(clearTimeout);
    bootTimers = [];
    if (reduced) { desktopReady(); return; }
    boot.classList.remove("out");
    post.classList.remove("on");
    splash.classList.remove("on");
    postLines.forEach(function (line) { line.classList.remove("on"); });
    html.classList.add("booting98"); /* display: none -> block restarts the CRT flash */
    document.addEventListener("keydown", endBoot);
    at(520, function () { post.classList.add("on"); });
    postLines.forEach(function (line, i) {
      at(550 + i * 80, function () {
        line.classList.add("on");
        if (line === memory) countMemory();
      });
    });
    var postEnd = 550 + postLines.length * 80 + 220;
    at(postEnd, function () { splash.classList.add("on"); });
    at(postEnd + 1600, endBoot);
  }

  function endBoot() {
    bootTimers.forEach(clearTimeout);
    bootTimers = [];
    document.removeEventListener("keydown", endBoot);
    if (!html.classList.contains("booting98") || boot.classList.contains("out")) return;
    boot.classList.add("out");
    setTimeout(function () {
      html.classList.remove("booting98");
      boot.classList.remove("out");
      desktopReady();
    }, 350);
  }
  boot.addEventListener("click", endBoot);

  function desktopReady() {
    if (bioRequested) {
      bioRequested = false;
      openWindow("dos"); /* terminal-shell.js runs whoami in it */
    } else if (welcomeShow.checked) {
      openWindow("welcome");
    }
  }

  /* ================= tray ================= */

  var crtToggle = root.querySelector(".taskbar98-crt");
  crtToggle.addEventListener("click", function () {
    var off = root.classList.toggle("nocrt");
    crtToggle.setAttribute("aria-pressed", !off);
  });

  var clock = root.querySelector(".taskbar98-clock");
  function tick() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    clock.textContent = ((h % 12) || 12) + ":" + (m < 10 ? "0" : "") + m + " " + (h < 12 ? "AM" : "PM");
  }
  tick();
  setInterval(tick, 15000);

  /* The layout's inline script decided before first paint whether this visit boots. */
  if (html.classList.contains("booting98")) runBoot();
  else desktopReady();
})();
