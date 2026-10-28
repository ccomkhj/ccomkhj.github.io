#!/usr/bin/env node
/* Browser smoke test for Featured writing and research provenance, on the fixture build that
   `python3 scripts/check_writings.py --keep DIR` leaves behind (fixture posts A–H, see
   scripts/fixtures/posts/). Serves DIR, then drives /writings/, / and a post in Chromium at
   375, 768 and 1280 px, by keyboard, with reduced motion and without JavaScript.
   Needs Playwright (not a dependency of this repo): `just check-browser` runs both steps.

     node scripts/check_writings_browser.js DIR [SCREENSHOT_DIR] */
"use strict";
const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const dir = path.resolve(process.argv[2] || "");
const shots = process.argv[3] && path.resolve(process.argv[3]);
if (!process.argv[2] || !fs.existsSync(path.join(dir, "writings", "index.html"))) {
  console.error("usage: check_writings_browser.js DIR [SCREENSHOT_DIR]  (DIR from check_writings.py --keep)");
  process.exit(2);
}
/* github-metadata may give the build a baseurl; serve the site under it */
const feed = fs.readFileSync(path.join(dir, "index.html"), "utf8").match(/href="([^"]*)\/feed\.xml" type="application\/atom\+xml"/);
const base = feed ? feed[1].replace(/^https?:\/\/[^/]+/, "") : "";
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".xml": "application/xml" };

const failures = [];
function check(cond, msg) {
  console.log(`[${cond ? "ok  " : "FAIL"}] ${msg}`);
  if (!cond) failures.push(msg);
}

function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (!p.startsWith(base + "/")) { res.writeHead(404); return res.end(); }
    p = path.join(dir, p.slice(base.length));
    if (!p.startsWith(dir)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
    if (!fs.existsSync(p)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": types[path.extname(p)] || "application/octet-stream" });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

/* --- page helpers --- */
const rows = (page) => page.$$eval("#wr-files .wr-file .t", (as) => as.map((a) => a.textContent));
const rowBadges = (page) => page.$$eval("#wr-files .wr-file", (rs) => rs.map((r) =>
  Array.from(r.querySelectorAll(".badge98"), (b) => b.textContent)));
const noHScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const folder = (page) => page.$eval(".wr-node.sel .lbl", (el) => el.textContent);
async function shot(page, name) {
  if (shots) await page.screenshot({ path: path.join(shots, name + ".png"), fullPage: false });
}

async function writingsDesktop(browser, origin) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin + "/writings/");

  check(await folder(page) === "All writings", "/writings/ opens on All writings");
  const shelf = await page.$$eval(".wr-shelf li", (lis) => lis.filter((li) => li.offsetParent).map((li) => li.querySelector("a").textContent));
  check(shelf.length === 3 && shelf[0].startsWith("Fixture A") && shelf[1].startsWith("Fixture B") && shelf[2].startsWith("Fixture C"),
    `the shelf shows the top three by rank ${JSON.stringify(shelf)}`);
  const allRows = await rows(page);
  check(allRows[0].startsWith("Fixture H"), "All writings is newest first (the new ordinary post leads)");
  const nFeatured = await page.$$eval(".wr-shelf li", (lis) => lis.length);
  check(await page.$eval(".wr-shelf-all", (a) => a.textContent) === `See all ${nFeatured} Featured →`, "the shelf links to all Featured");
  await shot(page, "writings-1280");

  /* Featured folder */
  await page.click(".wr-shelf-all");
  check(await folder(page) === "Featured" && new URL(page.url()).hash === "#featured", "See all opens the Featured folder at #featured");
  check(await page.$eval(".wr-node.sel", (a) => a.getAttribute("aria-current")) === "true", "the open folder is aria-current");
  check((await rows(page)).length === nFeatured, `the Featured folder lists every Featured post (${nFeatured})`);
  check(await page.$eval(".wr-shelf", (s) => s.hidden), "the shelf hides inside a folder");
  check((await rowBadges(page)).every((b) => b.includes("Featured")), "every row in Featured carries the Featured badge");
  check(await page.getAttribute("#wr-q", "placeholder") === "Search Featured…", "search says it covers Featured");

  /* provenance x folder x search */
  await page.selectOption("#wr-ai", "ai");
  const aiRows = await rowBadges(page);
  check(aiRows.length > 0 && aiRows.every((b) => b.includes("AI-researched") && b.includes("Featured")), "Featured + AI-researched intersect");
  check(/· AI-researched$/.test(await page.textContent("#wr-n")), "the count line names the active filter");
  check(await page.$eval("#wr-paper", (p) => p.textContent.includes("AI-researched")), "the preview follows to a visible post");
  await page.fill("#wr-q", "Fixture");
  check(JSON.stringify((await rows(page)).map((t) => t.slice(0, 9)).sort()) === JSON.stringify(["Fixture A", "Fixture C"]),
    "folder + provenance + search intersect (A, C)");
  check(await page.textContent("#wr-count") === "2 object(s)", "the status bar counts the filtered result");
  check(/2 writings in Featured, AI-researched, matching “Fixture”/.test(await page.waitForFunction(
    () => document.getElementById("wr-live").textContent).then((h) => h.jsonValue())), "the count is announced politely");

  /* preview of A: labels and the override note, as text */
  await page.click('#wr-files .wr-file:has-text("Fixture A") .ic');
  const paper = await page.textContent("#wr-paper");
  check(paper.includes("Labels: Featured · AI-researched") && paper.includes("</script><b>not bold</b>"), "the preview shows labels and the note as plain text");
  check(!(await page.$("#wr-paper b")), "no markup from the note reaches the preview");

  /* empty state */
  await page.fill("#wr-q", "");
  await page.selectOption("#wr-ai", "unknown");
  check((await rows(page)).length === 0 && /No matching writings/.test(await page.textContent("#wr-files")), "Featured + Unclassified is empty, with a message");
  check(/Pick a writing/.test(await page.textContent("#wr-paper")), "the empty result clears the preview");
  check(await page.$eval('[data-h="random"]', (b) => b.disabled), "Surprise me is disabled on an empty result");
  await page.click('[data-h="clearai"]');
  check(await page.$eval("#wr-ai", (s) => s.value) === "all" && (await rows(page)).length === nFeatured, "Clear provenance filter recovers the list");
  check(await page.evaluate(() => document.activeElement.id) === "wr-ai", "focus lands on the provenance select after clearing");

  /* changing folder: search resets, provenance stays */
  await page.selectOption("#wr-ai", "not_ai");
  await page.fill("#wr-q", "a");
  await page.click('.wr-node[data-key="all"]');
  check(await page.inputValue("#wr-q") === "" && await page.$eval("#wr-ai", (s) => s.value) === "not_ai", "a folder change clears search but keeps the provenance filter");
  check((await rowBadges(page)).every((b) => !b.includes("AI-researched") && !b.includes("Unclassified")), "Not AI-researched shows only ai: false posts");
  check(!(await page.$eval(".wr-shelf", (s) => s.hidden)), "the shelf is back in All writings");

  /* Surprise me and Newest stay inside the filter */
  const visible = new Set(await rows(page));
  let inside = true;
  for (let i = 0; i < 12; i++) {
    await page.click('[data-h="random"]');
    const t = await page.$eval("#wr-files .wr-file.sel .t", (a) => a.textContent).catch(() => null);
    if (!visible.has(t)) inside = false;
  }
  check(inside, "Surprise me only picks visible writings");
  await page.click('[data-h="newest"]');
  check((await page.$eval("#wr-files .wr-file.sel .t", (a) => a.textContent)) === (await rows(page))[0], "Newest selects the newest visible writing");

  /* deep links, hashchange and back */
  await page.goto(origin + "/writings/#growth");
  check(await folder(page) === "Growth", "/writings/#growth still opens Growth");
  await page.goto(origin + "/writings/#2025");
  check(await folder(page) === "2025", "/writings/#2025 still opens 2025");
  await page.evaluate(() => { location.hash = "#featured"; });
  await page.waitForFunction(() => document.querySelector(".wr-node.sel .lbl").textContent === "Featured");
  await page.goBack();
  await page.waitForFunction(() => document.querySelector(".wr-node.sel .lbl").textContent === "2025");
  check(true, "hash changes and Back move between folders");

  /* keyboard: the filter is reachable and shows focus */
  await page.goto(origin + "/writings/");
  let reached = false;
  for (let i = 0; i < 40 && !reached; i++) {
    await page.keyboard.press("Tab");
    reached = await page.evaluate(() => document.activeElement.id === "wr-ai");
  }
  check(reached, "Tab reaches the provenance select");
  check(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== "none"), "the focused select shows a focus outline");
  await page.keyboard.press("ArrowDown"); /* native select: changes the option */
  check(await page.$eval("#wr-ai", (s) => s.value) !== "all", "the select works from the keyboard");
  check(errors.length === 0, `no script errors on /writings/ ${errors.join(" | ")}`);
  await ctx.close();
}

async function freshFeatured(browser, origin) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(origin + "/writings/#featured");
  check(await folder(page) === "Featured", "a fresh /writings/#featured opens the Featured folder");
  check(await page.evaluate(() => window.scrollY) < 200, `the page does not jump to the hidden shelf (scrollY ${await page.evaluate(() => window.scrollY)})`);
  await ctx.close();
}

async function home(browser, origin) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin + "/");
  await page.waitForSelector('[data-window="welcome"]:not([hidden])');
  const picks = await page.$$eval(".welcome98-desc ol a", (as) => as.map((a) => [a.textContent, a.getAttribute("href")]));
  check(picks.length === 3 && picks[0][0].startsWith("Fixture A") && picks[2][0].startsWith("Fixture C"),
    `the Welcome window opens with the top three Featured picks ${JSON.stringify(picks.map((p) => p[0].slice(0, 9)))}`);
  check(picks[0][0] === 'Fixture A </script><b>bold?</b> & "quotes"', "pick titles are plain text");
  const all = await page.$eval('.welcome98-desc a[href$="/writings/#featured"]', (a) => a.textContent).catch(() => "");
  check(/^See all \d+ Featured →$/.test(all), "the Welcome window links See all Featured");
  check(/Latest: Fixture H/.test(await page.textContent(".welcome98-desc")), "Latest stays, independent of the picks");
  check(await page.$$eval(".welcome98-desc ol li", (lis) => lis.map((li) => !!li.querySelector(".badge98")).join()) === "true,false,true",
    "picks carry the AI-researched label");
  await shot(page, "home-1280");

  /* keyboard: one Tab stop for the menu, then the picks */
  await page.focus(".welcome98-item[data-latest]");
  await page.keyboard.press("Tab");
  check((await page.evaluate(() => document.activeElement.textContent)).startsWith("Fixture A"), "Tab from Read my writings reaches the first pick");
  await page.focus(".welcome98-item[data-latest]");
  await page.keyboard.press("ArrowDown");
  check(await page.evaluate(() => document.activeElement.classList.contains("on") && /Who is Huijo/.test(document.activeElement.textContent)),
    "ArrowDown moves to the next Welcome item");
  check(errors.length === 0, `no script errors on / ${errors.join(" | ")}`);
  await ctx.close();
}

async function articles(browser, origin) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(origin + "/writings/");
  const urls = await page.evaluate(() => JSON.parse(document.getElementById("wr-data").textContent).posts
    .filter((p) => p.t.startsWith("Fixture")).reduce((o, p) => (o[p.t.slice(8, 9)] = p.u, o), {}));
  await page.goto(origin + urls.A.slice(base.length));
  const block = await page.textContent(".post-provenance");
  check(/Featured/.test(block) && /AI-researched/.test(block) && block.includes("</script><b>not bold</b>"), "a post shows badges and its note as text");
  await shot(page, "article-1280");
  await page.goto(origin + urls.F.slice(base.length));
  check(!(await page.$(".post-provenance")), "a not-AI-researched, unfeatured post shows no provenance block");
  await ctx.close();
  return urls;
}

async function narrow(browser, origin, urls) {
  for (const width of [375, 768]) {
    const ctx = await browser.newContext({ viewport: { width, height: 800 }, reducedMotion: "reduce", hasTouch: width < 700, isMobile: width < 700 });
    const page = await ctx.newPage();
    await page.goto(origin + "/writings/");
    check(await noHScroll(page), `${width}px: /writings/ has no horizontal scroll`);
    check(await page.isVisible("#wr-ai") && await page.isVisible(".wr-shelf"), `${width}px: the filter and shelf are visible`);
    await page.selectOption("#wr-ai", "ai");
    check(await noHScroll(page), `${width}px: still no horizontal scroll with a filter`);
    if (width < 900) {
      const note = await page.$eval("#wr-files .wr-file.sel .more", (m) => m.textContent).catch(() => "");
      check(/AI-researched:/.test(note), `${width}px: the unfolded row shows the disclosure`);
    }
    await shot(page, `writings-${width}`);
    await page.goto(origin + "/");
    await page.waitForSelector('[data-window="welcome"]:not([hidden])');
    check(await page.isVisible(".welcome98-desc ol a"), `${width}px: Featured picks are visible in the Welcome window`);
    check(await noHScroll(page), `${width}px: / has no horizontal scroll`);
    await shot(page, `home-${width}`);
    await page.goto(origin + urls.A.slice(base.length));
    check(await page.isVisible(".post-provenance") && await noHScroll(page), `${width}px: the post disclosure fits`);
    await shot(page, `article-${width}`);
    await ctx.close();
  }
}

async function motion(browser, origin) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(origin + "/writings/");
  check(!(await page.$("#wr-paper .wr-cursor")) && /Labels|Topics/.test(await page.textContent("#wr-paper")), "reduced motion: the preview appears at once");
  await page.goto(origin + "/");
  check(await page.isVisible(".welcome98-desc ol a"), "reduced motion: the Featured picks appear at once");
  await ctx.close();
}

async function noJs(browser, origin) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(origin + "/writings/#featured");
  const n = await page.$$eval(".wr-shelf li", (lis) => lis.length);
  check(n > 3 && await page.$$eval(".wr-shelf li", (lis) => lis.every((li) => li.offsetParent)), `no JS: #featured shows all ${n} picks`);
  check(!(await page.isVisible(".wr-shelf-all")), "no JS: the self-link See all is hidden");
  check(await page.$$eval(".wr-file .t", (as) => as.length > 100 && as.every((a) => a.href)), "no JS: every writing is a plain link");
  check((await page.$$eval(".wr-file .badge98", (b) => b.length)) > 0, "no JS: rows carry their badges");
  await shot(page, "writings-nojs");
  await page.goto(origin + "/");
  const picks = await page.$$eval(".desktop98-noscript-featured a", (as) => as.map((a) => a.textContent));
  check(picks.length === 3 && await page.isVisible(".desktop98-noscript-featured"), "no JS: / lists the top three picks");
  check(await page.$$eval(".desktop98-noscript-nav a", (as) => as.length) >= 4, "no JS: / still lists the sections");
  await shot(page, "home-nojs");
  await ctx.close();
}

(async () => {
  if (shots) fs.mkdirSync(shots, { recursive: true });
  const server = await serve();
  const origin = `http://127.0.0.1:${server.address().port}${base}`;
  const browser = await chromium.launch();
  try {
    await writingsDesktop(browser, origin);
    await freshFeatured(browser, origin);
    await home(browser, origin);
    const urls = await articles(browser, origin);
    await narrow(browser, origin, urls);
    await motion(browser, origin);
    await noJs(browser, origin);
  } catch (e) {
    check(false, `browser run crashed: ${e.stack || e}`);
  } finally {
    await browser.close();
    server.close();
  }
  if (failures.length) {
    console.log(`\n${failures.length} check(s) failed`);
    process.exit(1);
  }
  console.log("\nall checks passed");
})();
