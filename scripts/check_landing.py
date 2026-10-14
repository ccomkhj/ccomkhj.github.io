#!/usr/bin/env python3
"""Build-output check for the Win98 landing page (`/`, `_layouts/win98_desktop.html`).

Builds the site in production mode into a temp directory and asserts on the
generated `index.html`: the post list handed to `assets/js/win98-desktop.js`
as JSON, the pre-rendered MS-DOS window the terminal engine attaches to, the
boot screen, the `<noscript>` fallback, and the absence of prototype code.
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
    check(".layout--win98_desktop .masthead" in page, "the masthead stays hidden")
    in_start_menu = [e["attrs"].get("href") for e in tree.elements if e["tag"] == "a" and any(
        "startmenu98" in a["attrs"].get("class", "").split() for a in e["ancestors"])]
    check(f"{base}/feed.xml" in in_start_menu, "the Start menu keeps the RSS link")
    check("It's now safe to turn off" in page, "the shut-down screen is rendered")
    noscript = [e["attrs"].get("href") for e in tree.elements
                if e["tag"] == "a" and any(a["tag"] == "noscript" for a in e["ancestors"])]
    for section in ("writings", "about", "portfolio", "bookmarks"):
        check(f"{base}/{section}/" in noscript, f"<noscript> links to /{section}/")
    check("{{" not in page and "{%" not in page, "no raw Liquid leaks into the page")
    for leftover in ("proto-switcher", "landing-prototype", "?variant="):
        check(leftover not in page, f"no prototype leftover '{leftover}'")
    check(not (ROOT / "_includes" / "landing-prototype").exists(), "no _includes/landing-prototype/")


def check_posts_json(page: str, dest: Path):
    m = re.search(r'<script type="application/json" id="desktop98-posts">(.*?)</script>', page, re.S)
    check(m is not None, "index.html carries the post list as a JSON script")
    if not m:
        return
    try:
        posts = json.loads(m.group(1))
    except json.JSONDecodeError as err:
        check(False, f"post list is valid JSON ({err})")
        return
    on_disk = post_files()
    check(len(posts) == on_disk, f"post list has one entry per post in _posts/ ({len(posts)} vs {on_disk})")
    check(all(set(p) == {"title", "url", "date", "tag"} for p in posts),
          "every entry has exactly title, url, date and tag")
    check(all(p["title"] and p["tag"] for p in posts), "no entry has an empty title or tag")
    dates = [p["date"] for p in posts]
    check(all(re.fullmatch(r"\d{4}-\d{2}-\d{2}", d) for d in dates), "dates are YYYY-MM-DD")
    check(dates == sorted(dates, reverse=True), "entries are newest first")
    base = baseurl(page)
    missing = [p["url"] for p in posts if not built_page(dest, p["url"], base).exists()]
    check(not missing, f"every entry's url is a built page {missing[:3]}")


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
    finally:
        shutil.rmtree(dest, ignore_errors=True)

    if failures:
        print(f"\n{len(failures)} check(s) failed")
        sys.exit(1)
    print("\nall checks passed")


if __name__ == "__main__":
    main()
