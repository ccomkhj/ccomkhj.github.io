#!/usr/bin/env python3
"""Build-output check for the Win98 landing page (`/`, `_layouts/win98_desktop.html`).

Builds the site in production mode into a temp directory and asserts on the
generated `index.html`: the Latest post handed to `assets/js/win98-desktop.js`
as JSON, the pre-rendered MS-DOS window the terminal engine attaches to, the
boot screen, the `<noscript>` fallback, and the absence of prototype code.
Featured picks and provenance are covered by `scripts/check_writings.py`.
Also asserts that every way into the site's sections follows `_data/navigation.yml`
(desktop icons, Start menu, taskbar on inner pages, <noscript>), that tag links
land on an anchor, and that repo files are not published.
Runtime behaviour (boot, window manager) is not covered; check that in a browser.

Extra Jekyll config overlays can be passed as arguments, e.g. to exclude a
section whose build is broken by unrelated work in progress. Run via
`just check-landing`.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS = ROOT / "_posts"
NAVIGATION = ROOT / "_data" / "navigation.yml"
POST_NAME = re.compile(r"\d+-\d+-\d+-.+\.md$")  # Jekyll skips files not named like this

failures = []


def check(cond, msg):
    status = "ok  " if cond else "FAIL"
    print(f"[{status}] {msg}")
    if not cond:
        failures.append(msg)


def build(dest: Path, overlays):
    configs = ",".join(["_config.yml", *overlays])
    subprocess.run(
        ["bundle", "exec", "jekyll", "build", "--strict_front_matter",
         "--config", configs, "--destination", str(dest)],
        cwd=ROOT, check=True, env={**os.environ, "JEKYLL_ENV": "production"},
    )


def nav_urls() -> list:
    """Section URLs from _data/navigation.yml, in order (only `main:` entries carry `url:`)."""
    return re.findall(r"^\s+url:\s*(\S+)\s*$", NAVIGATION.read_text(encoding="utf-8"), re.M)


def post_files() -> int:
    return sum(1 for f in POSTS.glob("*.md") if POST_NAME.match(f.name))


def baseurl(page: str) -> str:
    """The site's baseurl as rendered into the page head (github-metadata may set it)."""
    m = re.search(r'href="([^"]*)/feed\.xml" type="application/atom\+xml"', page)
    return m.group(1) if m else ""


def built_page(dest: Path, url: str, base: str) -> Path:
    path = dest / url.removeprefix(base).lstrip("/")
    return path / "index.html" if url.endswith("/") else path


class Tree(HTMLParser):
    """Records every element with its ancestors, so checks can ask "is X inside Y"."""
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
            "source", "track", "wbr"}

    def __init__(self, page: str):
        super().__init__()
        self.stack, self.elements = [], []
        self.feed(page)

    def handle_starttag(self, tag, attrs):
        node = {"tag": tag, "attrs": dict(attrs), "ancestors": list(self.stack)}
        self.elements.append(node)
        if tag not in self.VOID:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i]["tag"] == tag:
                del self.stack[i:]
                break

    def with_id(self, id_):
        return [e for e in self.elements if e["attrs"].get("id") == id_]

    def links_inside(self, cls):
        """hrefs of <a> elements nested in an element carrying class `cls`."""
        return [e["attrs"].get("href") for e in self.elements if e["tag"] == "a" and any(
            cls in a["attrs"].get("class", "").split() for a in e["ancestors"])]

    def with_class(self, tag, cls):
        return [e for e in self.elements if e["tag"] == tag and cls in e["attrs"].get("class", "").split()]

    def scripts(self):
        return [e["attrs"]["src"] for e in self.elements if e["tag"] == "script" and "src" in e["attrs"]]


def check_terminal_window(tree: Tree, dest: Path, base: str):
    for id_ in ("terminal-container", "terminal-output", "terminal-input-line", "terminal-input"):
        check(len(tree.with_id(id_)) == 1, f"#{id_} appears exactly once")
    found = tree.with_id("terminal-container")
    windows = [a for a in found[0]["ancestors"] if a["attrs"].get("data-window") == "dos"] if found else []
    check(bool(windows), "the terminal is pre-rendered inside the MS-DOS window")
    check(bool(windows) and "hidden" in windows[0]["attrs"], "the MS-DOS window starts hidden")
    scripts = [s.removeprefix(base) for s in tree.scripts()]
    order = [s for s in scripts if s in ("/assets/js/terminal-commands.js", "/assets/js/terminal-shell.js",
                                         "/assets/js/win98-desktop.js")]
    check(order == ["/assets/js/terminal-commands.js", "/assets/js/terminal-shell.js", "/assets/js/win98-desktop.js"],
          f"terminal engine loads before the desktop script {order}")
    check((dest / "assets/js/win98-desktop.js").exists(), "assets/js/win98-desktop.js is built")


def check_desktop(page: str, tree: Tree, base: str, post_count: int):
    check(len(tree.with_id("desktop98")) == 1, "the desktop is rendered")
    check('class="boot98"' in page, "the boot screen is rendered")
    check(f"... {post_count} THOUGHTS" in page, f"the POST screen counts {post_count} thoughts")
    check("sessionStorage.getItem(\"booted98\")" in page, "the boot is gated on the booted98 session key")
    check("taskbar98--page" not in page, "the desktop has no page taskbar (it renders its own)")
    in_start_menu = [e["attrs"].get("href") for e in tree.elements if e["tag"] == "a" and any(
        "startmenu98" in a["attrs"].get("class", "").split() for a in e["ancestors"])]
    check(f"{base}/feed.xml" in in_start_menu, "the Start menu keeps the RSS link")
    check("It's now safe to turn off" in page, "the shut-down screen is rendered")
    noscript = [e["attrs"].get("href") for e in tree.elements if e["tag"] == "a" and any(
        a["tag"] == "noscript" for a in e["ancestors"]) and any(
        "desktop98-noscript-nav" in a["attrs"].get("class", "").split() for a in e["ancestors"])]
    sections = [base + u for u in nav_urls()]
    check(len(sections) >= 4, f"_data/navigation.yml lists the sections {sections}")
    check(noscript == sections, f"the <noscript> section list is exactly the navigation.yml sections {noscript}")
    icons = [e["attrs"].get("href") for e in tree.with_class("a", "desktop98-icon")]
    check(icons[:len(sections)] == sections, f"desktop icons start with the sections, in order {icons}")
    check(all(s in in_start_menu for s in sections), "the desktop Start menu links every section")
    menus = tree.with_class("nav", "startmenu98")
    check(len(menus) == 1 and any("taskbar98" in a["attrs"].get("class", "").split() for a in menus[0]["ancestors"]),
          "the desktop Start menu sits inside the taskbar, right after Start (Tab reaches its items)")
    check("{{" not in page and "{%" not in page, "no raw Liquid leaks into the page")
    for leftover in ("proto-switcher", "landing-prototype", "?variant="):
        check(leftover not in page, f"no prototype leftover '{leftover}'")
    check(not (ROOT / "_includes" / "landing-prototype").exists(), "no _includes/landing-prototype/")


def check_posts_json(page: str, dest: Path):
    """The Welcome window's Latest link: the newest post only (the Writings index has them all)."""
    m = re.search(r'<script type="application/json" id="desktop98-posts">(.*?)</script>', page, re.S)
    check(m is not None, "index.html carries the latest post as a JSON script")
    if not m:
        return
    try:
        posts = json.loads(m.group(1))
    except json.JSONDecodeError as err:
        check(False, f"latest post is valid JSON ({err})")
        return
    check(len(posts) == 1, f"the list holds just the latest post ({len(posts)})")
    check(all(set(p) == {"title", "url", "date", "tag"} for p in posts),
          "every entry has exactly title, url, date and tag")
    check(all(p["title"] and p["tag"] for p in posts), "no entry has an empty title or tag")
    check(all(re.fullmatch(r"\d{4}-\d{2}-\d{2}", p["date"]) for p in posts), "dates are YYYY-MM-DD")
    writings = (dest / "writings" / "index.html").read_text(encoding="utf-8")
    index = re.search(r'<script id="wr-data" type="application/json">(.*?)</script>', writings, re.S)
    newest = json.loads(index.group(1))["posts"][0]["u"] if index else None
    check(posts[:1] and posts[0]["url"] == newest, f"it is the newest post on /writings/ ({newest})")
    base = baseurl(page)
    missing = [p["url"] for p in posts if not built_page(dest, p["url"], base).exists()]
    check(not missing, f"every entry's url is a built page {missing[:3]}")


def check_inner_pages(dest: Path, base: str, post_url: str):
    """The taskbar on inner pages: same sections, same Start menu, the current section pressed."""
    sections = [base + u for u in nav_urls()]
    desktop_start = set(Tree((dest / "index.html").read_text(encoding="utf-8")).links_inside("startmenu98"))
    for url, current in (("/writings/", "/writings/"), ("/tags/", "/writings/"), ("/about/", "/about/"),
                         ("/card/", None), (post_url.removeprefix(base), "/writings/")):
        page = built_page(dest, base + url, base)
        if not page.exists():
            check(False, f"{url} is built")
            continue
        tree = Tree(page.read_text(encoding="utf-8"))
        bars = tree.with_class("header", "taskbar98--page")
        check(len(bars) == 1, f"{url}: one taskbar")
        check(not tree.with_class("div", "page__footer"), f"{url}: no minimal-mistakes footer")
        tasks = tree.links_inside("taskbar98-tasks")
        check(tasks == sections, f"{url}: taskbar buttons are the navigation.yml sections {tasks}")
        start = tree.links_inside("startmenu98")
        check(f"{base}/" in start and set(start) - {f"{base}/"} <= desktop_start,
              f"{url}: Start menu = Desktop + the desktop Start menu's pages")
        pressed = [e["attrs"].get("href") for e in tree.elements if e["attrs"].get("aria-current") == "page"]
        want = [base + current] if current else []
        check(pressed == want, f"{url}: {current or 'no section'} is pressed {pressed}")


def check_card(dest: Path, base: str):
    """/card/ is the contact card dialog: Close-only title bar, Add to Contacts saves huijo.vcf."""
    page = dest / "card" / "index.html"
    if not page.exists():
        check(False, "/card/ is built")
        return
    tree = Tree(page.read_text(encoding="utf-8"))
    check(len(tree.with_class("section", "card98")) == 1, "/card/ renders the contact card dialog")
    controls = [e for e in tree.elements if any("title-bar-controls" in a["attrs"].get("class", "").split()
                                                for a in e["ancestors"]) and e["tag"] in ("a", "button")]
    check([e["tag"] for e in controls] == ["a"], "/card/ title bar has Close only")
    saves = [e["attrs"].get("href") for e in tree.with_class("a", "card98-save")]
    check(saves == [f"{base}/assets/huijo.vcf"], f"/card/ Add to Contacts links the vCard {saves}")
    check((dest / "assets" / "huijo.vcf").exists(), "assets/huijo.vcf is built")


def check_tag_anchors(dest: Path, base: str, post_url: str):
    """Posts link their tags to /tags/#<tag> (address bar, "All N posts in <tag>")."""
    post = built_page(dest, post_url, base).read_text(encoding="utf-8")
    tags = Tree((dest / "tags" / "index.html").read_text(encoding="utf-8"))
    ids = {e["attrs"]["id"] for e in tags.elements if "id" in e["attrs"]}
    targets = set(re.findall(r'href="[^"]*/tags/#([^"]+)"', post))
    check(bool(targets), f"{post_url} links to {len(targets)} tag(s) on /tags/")
    missing = sorted(targets - ids)
    check(not missing, f"every /tags/#<tag> link has an anchor on /tags/ {missing[:3]}")
    closes = [e["attrs"].get("href") for e in tags.with_class("a", "title-bar-close")]
    check(len(closes) == 1 and closes[0].endswith("/writings/"), f"/tags/ window closes to /writings/ {closes}")


def check_not_published(dest: Path):
    for path in ("AGENTS/index.html", "CLAUDE/index.html", "AGENTS.md", "CLAUDE.md", "justfile", "run.sh"):
        check(not (dest / path).exists(), f"repo file {path} is not published")


def main():
    overlays = sys.argv[1:]
    dest = Path(tempfile.mkdtemp(prefix="check-landing-"))
    try:
        build(dest, overlays)
        page = (dest / "index.html").read_text(encoding="utf-8")
        check_posts_json(page, dest)
        tree, base = Tree(page), baseurl(page)
        check_terminal_window(tree, dest, base)
        check_desktop(page, tree, base, post_files())
        newest = json.loads(re.search(r'id="desktop98-posts">(.*?)</script>', page, re.S).group(1))[0]["url"]
        check_inner_pages(dest, base, newest)
        check_card(dest, base)
        check_tag_anchors(dest, base, newest)
        check_not_published(dest)
    finally:
        shutil.rmtree(dest, ignore_errors=True)

    if failures:
        print(f"\n{len(failures)} check(s) failed")
        sys.exit(1)
    print("\nall checks passed")


if __name__ == "__main__":
    main()
