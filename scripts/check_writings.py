#!/usr/bin/env python3
"""Build-output check for Featured writing and research provenance.

1. Runs `scripts/check_post_metadata.rb` on the real posts, on the real posts plus the
   valid fixtures, and on `scripts/fixtures/post_metadata_invalid/`, expecting each invalid
   fixture to fail on its field.
2. Copies the fixture posts (`scripts/fixtures/posts/`: every Featured x provenance
   combination, a grandfathered unclassified post, a future-dated Latest post, and a title
   and note full of HTML end tags) into `_posts/`, builds in production mode with
   `scripts/fixtures/check_writings_config.yml`, removes the fixtures again, and asserts on
   /writings/, `/` and the article pages: JSON types, rank order agreeing across surfaces,
   badges, disclosures, escaping and the no-JavaScript fallbacks.
3. Builds a copy of the site with every `featured`/`featured_rank` stripped and a different
   `ai_research_default_note`: no empty Featured shelf anywhere, and only posts without an
   override pick up the new default.
Browser behaviour (filters, folders, keyboard) is in scripts/check_writings_browser.js, which
drives the fixture build kept by `--keep DIR`. Run via `just check-writings` / `just check-browser`.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from check_landing import Tree, baseurl, built_page  # noqa: E402

FIXTURES = ROOT / "scripts" / "fixtures" / "posts"
INVALID = ROOT / "scripts" / "fixtures" / "post_metadata_invalid"
OVERLAY = ROOT / "scripts" / "fixtures" / "check_writings_config.yml"
POSTS = ROOT / "_posts"
VALIDATOR = ["ruby", str(ROOT / "scripts" / "check_post_metadata.rb")]
CHANGED_NOTE = "Changed default note for scripts/check_writings.py."

# invalid fixture -> the field its error must name
INVALID_FIELDS = {
    "1999-04-01-missing-provenance.md": "ai_researched",
    "1999-04-02-string-provenance.md": "ai_researched",
    "1999-04-03-featured-not-boolean.md": "featured",
    "1999-04-04-featured-unclassified.md": "featured",
    "1999-04-05-featured-no-rank.md": "featured_rank",
    "1999-04-06-featured-rank-zero.md": "featured_rank",
    "1999-04-07-featured-rank-text.md": "featured_rank",
    "1999-04-08-duplicate-rank-a.md": "featured_rank",
    "1999-04-09-duplicate-rank-b.md": "featured_rank",
    "1999-04-10-rank-not-featured.md": "featured_rank",
    "1999-04-11-featured-placeholder-excerpt.md": "excerpt",
    "1999-04-12-blank-note.md": "ai_research_note",
    "1999-04-13-note-not-ai.md": "ai_research_note",
    "1999-04-14-explicit-null.md": "ai_researched",
    "1999-04-15-featured-no-excerpt.md": "excerpt",
}

# fixture title prefix -> (ai, featured, rank, note: "default" | "override" | None)
FIXTURE_POSTS = {
    "Fixture A": (True, True, 1, "override"),
    "Fixture B": (False, True, 2, None),
    "Fixture C": (True, True, 3, "default"),
    "Fixture D": (False, True, 4, None),
    "Fixture E": (True, False, None, "default"),
    "Fixture F": (False, False, None, None),
    "Fixture G": (None, False, None, None),
    "Fixture H": (False, False, None, None),
}
OVERRIDE_NOTE = 'Fixture override: AI gathered the sources </script><b>not bold</b> & "quoted" text.'

failures = []


def check(cond, msg):
    status = "ok  " if cond else "FAIL"
    print(f"[{status}] {msg}")
    if not cond:
        failures.append(msg)


def default_note() -> str:
    m = re.search(r'^ai_research_default_note\s*:\s*"(.*)"\s*$', (ROOT / "_config.yml").read_text(encoding="utf-8"), re.M)
    return m.group(1) if m else ""


def source_overrides() -> list:
    """`ai_research_note` values in the real and fixture posts, as YAML double-quoted strings."""
    found = []
    for post in [*POSTS.glob("*.md"), *FIXTURES.glob("*.md")]:
        m = re.search(r'^ai_research_note:\s*"((?:[^"\\]|\\.)*)"\s*$', post.read_text(encoding="utf-8"), re.M)
        if m:
            found.append(json.loads(f'"{m.group(1)}"'))
    return found


def labels(p) -> list:
    """Badge words a post must carry everywhere (_includes/post-badges.html)."""
    out = ["Featured"] if p["f"] else []
    if p["ai"] is True:
        out.append("AI-researched")
    elif p["ai"] is None:
        out.append("Unclassified")
    return out


def badge_words(fragment: str) -> list:
    return re.findall(r'<span class="badge98[^"]*">([^<]+)</span>', fragment)


def json_script(page: str, id_: str):
    m = re.search(r'<script[^>]*id="' + id_ + r'"[^>]*>(.*?)</script>', page, re.S)
    return (m.group(0), m.group(1)) if m else (None, None)


# ---------------------------------------------------------------- validator

def check_validator():
    real = subprocess.run(VALIDATOR, cwd=ROOT, capture_output=True, text=True)
    check(real.returncode == 0, f"real posts pass check_post_metadata.rb {real.stderr.strip()[-300:]}")
    combined = subprocess.run(VALIDATOR + ["--allowlist", "scripts/legacy_unclassified_posts.txt",
                                           "--allowlist", str(FIXTURES / "legacy_unclassified_posts.txt"),
                                           "_posts", str(FIXTURES)], cwd=ROOT, capture_output=True, text=True)
    check(combined.returncode == 0, f"real posts + valid fixtures pass {combined.stderr.strip()[-300:]}")
    bad = subprocess.run(VALIDATOR + ["--allowlist", str(INVALID / "legacy_unclassified_posts.txt"), str(INVALID)],
                         cwd=ROOT, capture_output=True, text=True)
    check(bad.returncode == 1, "invalid fixtures fail check_post_metadata.rb")
    for name, field in INVALID_FIELDS.items():
        check(f"{name}: {field}:" in bad.stderr, f"{name} is rejected on `{field}`")
    on_disk = {f.name for f in INVALID.glob("*.md")}
    check(on_disk == set(INVALID_FIELDS), f"every invalid fixture has an expected field {sorted(on_disk ^ set(INVALID_FIELDS))}")


# ---------------------------------------------------------------- builds

def build(source: Path, dest: Path, overlays):
    configs = ",".join(str(c) for c in [source / "_config.yml", *overlays])
    subprocess.run(["bundle", "exec", "jekyll", "build", "--strict_front_matter", "--source", str(source),
                    "--config", configs, "--destination", str(dest)],
                   cwd=ROOT, check=True, env={**os.environ, "JEKYLL_ENV": "production"})


def build_with_fixtures(dest: Path):
    copied = []
    try:
        for fixture in sorted(FIXTURES.glob("*.md")):
            target = POSTS / fixture.name
            if target.exists():
                sys.exit(f"refusing to overwrite existing post {target}")
            shutil.copy(fixture, target)
            copied.append(target)
        build(ROOT, dest, [OVERLAY])
    finally:
        for target in copied:
            target.unlink(missing_ok=True)


def build_without_featured(dest: Path, work: Path):
    """A copy of the site where nothing is Featured and the default note differs."""
    files = subprocess.run(["git", "ls-files", "--cached", "--others", "--exclude-standard"],
                           cwd=ROOT, capture_output=True, text=True, check=True).stdout.split("\n")
    for rel in filter(None, files):
        src = ROOT / rel
        if rel.startswith(("docs/", "test/")) or not src.is_file():
            continue
        (work / rel).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(src, work / rel)
    for fixture in FIXTURES.glob("*.md"):
        shutil.copy(fixture, work / "_posts" / fixture.name)
    for post in (work / "_posts").glob("*.md"):
        text = post.read_text(encoding="utf-8")
        post.write_text(re.sub(r"^(featured|featured_rank):.*\n", "", text, flags=re.M), encoding="utf-8")
    overlay = work / "check_zero_featured.yml"
    overlay.write_text(f'ai_research_default_note: "{CHANGED_NOTE}"\n', encoding="utf-8")
    build(work, dest, [OVERLAY, overlay])


# ---------------------------------------------------------------- assertions

def check_index(dest: Path):
    """/writings/: the JSON index, the Featured shelf and the server-rendered rows."""
    page = (dest / "writings" / "index.html").read_text(encoding="utf-8")
    base = baseurl(page)
    whole, raw = json_script(page, "wr-data")
    check(raw is not None, "/writings/ carries the post index as a JSON script")
    check(whole is not None and "<" not in raw, "the post index has no raw '<' (titles and notes can't end the script)")
    data = json.loads(raw)
    posts = data["posts"]
    n_rows = int(re.search(r'<span id="wr-n">(\d+) writings</span>', page).group(1))
    check(len(posts) == n_rows, f"the index has one entry per post ({len(posts)} vs {n_rows})")
    keys = {"t", "u", "d", "tags", "x", "w", "ai", "f", "rank", "note"}
    check(all(set(p) == keys for p in posts), f"every entry has exactly {sorted(keys)}")
    check(all(p["ai"] in (True, False, None) for p in posts), "ai is a real true/false/null on every entry")
    check(all(isinstance(p["f"], bool) for p in posts), "f is a real boolean on every entry")
    check(all((isinstance(p["rank"], int) and p["rank"] > 0) if p["f"] else p["rank"] is None for p in posts),
          "rank is a positive integer exactly on Featured entries, else null")
    check(all(isinstance(p["note"], str) and p["note"].strip() if p["ai"] is True else p["note"] is None for p in posts),
          "note is a non-empty string exactly on AI-researched entries, else null")
    check(not any(v in ("null", "true", "false") for p in posts for v in (p["ai"], p["f"], p["rank"], p["note"])),
          "no YAML value leaks as the string 'null'/'true'/'false'")
    check(not any(p["f"] and p["ai"] is None for p in posts), "no Featured entry is unclassified")

    for prefix, (ai, f, rank, note) in FIXTURE_POSTS.items():
        found = [p for p in posts if p["t"].startswith(prefix)]
        check(len(found) == 1, f"{prefix} is in the index")
        if not found:
            continue
        p = found[0]
        want_note = {"override": OVERRIDE_NOTE, "default": default_note(), None: None}[note]
        check((p["ai"], p["f"], p["rank"], p["note"]) == (ai, f, rank, want_note),
              f"{prefix}: ai={p['ai']} f={p['f']} rank={p['rank']} note={(p['note'] or '')[:40]!r}")
    a = next(p for p in posts if p["t"].startswith("Fixture A"))
    check(a["t"] == 'Fixture A </script><b>bold?</b> & "quotes"', "a title with </script> survives the JSON round trip")

    ranked = sorted((p for p in posts if p["f"]), key=lambda p: p["rank"])
    tree = Tree(page)
    shelf = tree.with_class("section", "wr-shelf")
    check(len(shelf) == 1 and shelf[0]["attrs"].get("id") == "featured",
          "the Featured shelf is server-rendered as #featured (no-JS target of /writings/#featured)")
    items = [e for e in tree.elements if e["tag"] == "li" and any("wr-shelf" in a["attrs"].get("class", "").split() for a in e["ancestors"])]
    shelf_links = tree.links_inside("wr-shelf")
    check(shelf_links[:-1] == [p["u"] for p in ranked], f"the shelf lists every Featured post by rank {shelf_links[:5]}")
    check([("wr-shelf-extra" in i["attrs"].get("class", "")) for i in items] == [i >= 3 for i in range(len(ranked))],
          "only the first three shelf items show with JavaScript (the rest are .wr-shelf-extra)")
    check(shelf_links[-1:] == ["#featured"], "the shelf ends with 'See all Featured' to #featured")
    check(re.search(r"<noscript><style>[^<]*\.wr-shelf-extra \{ display: list-item; \}", page) is not None,
          "without JavaScript every Featured pick shows")
    missing = [u for u in shelf_links[:-1] if not built_page(dest, u, base).exists()]
    check(not missing, f"every shelf link is a built page {missing[:3]}")

    shelf_html = page[page.index('<section class="wr-shelf"'):page.index("</section>", page.index('<section class="wr-shelf"'))]
    check("Fixture A &lt;/script&gt;&lt;b&gt;bold?&lt;/b&gt;" in shelf_html, "the shelf escapes titles")
    check("Featured</span>" not in shelf_html, "shelf items skip the redundant Featured badge")

    rows = re.findall(r'<div class="wr-file"><span class="ic">📄</span><div><a class="t" href="([^"]+)">(.*?)</a><div class="m">(.*?)</div></div></div>', page)
    check(len(rows) == len(posts), f"one server-rendered row per post ({len(rows)})")
    by_url = {p["u"]: p for p in posts}
    wrong = [u for u, _, meta in rows if badge_words(meta) != labels(by_url[u])]
    check(not wrong, f"server-rendered rows carry the same badges as the index {wrong[:3]}")
    check(not any("</script>" in t or "<b>" in t for _, t, _ in rows), "server-rendered rows escape titles")
    missing = [u for u, _, _ in rows if not built_page(dest, u, base).exists()]
    check(not missing, f"every row links a built page {missing[:3]}")
    words = set(badge_words(page))
    check(words <= {"Featured", "AI-researched", "Unclassified"}, f"/writings/ badges use only the three label words {words}")
    select = re.search(r'<label>Provenance <select id="wr-ai"[^>]*>(.*?)</select>', page, re.S)
    check(select is not None and re.findall(r'<option value="([^"]+)">([^<]+)</option>', select.group(1)) ==
          [("all", "All provenance"), ("ai", "AI-researched"), ("not_ai", "Not AI-researched"), ("unknown", "Unclassified")],
          "a labelled native provenance select offers All / AI-researched / Not AI-researched / Unclassified")
    return posts, ranked, base


def check_home(dest: Path, posts, ranked, base):
    page = (dest / "index.html").read_text(encoding="utf-8")
    whole, raw = json_script(page, "desktop98-featured")
    check(raw is not None, "/ carries the Featured picks as JSON")
    if raw is None:
        return
    check("<" not in raw, "the Featured JSON has no raw '<'")
    picks = json.loads(raw)
    total = re.search(r'data-total="(\d+)"', whole)
    check(total and int(total.group(1)) == len(ranked), f"data-total is the number of Featured posts ({len(ranked)})")
    check([p["url"] for p in picks] == [p["u"] for p in ranked[:3]], "the Welcome window gets the top three by rank")
    check([p["ai"] for p in picks] == [p["ai"] is True for p in ranked[:3]], "Welcome picks carry their AI-researched flag")
    check(all(set(p) == {"title", "url", "ai"} for p in picks), "Welcome picks have exactly title, url and ai")
    tree = Tree(page)
    noscript = tree.links_inside("desktop98-noscript-featured")
    check(noscript == [p["u"] for p in ranked[:3]], f"the <noscript> fallback links the same top three {noscript}")
    check(f"{base}/writings/#featured" in [e["attrs"].get("href") for e in tree.elements if e["tag"] == "a"
                                            and any(a["tag"] == "noscript" for a in e["ancestors"])],
          "the <noscript> fallback links /writings/#featured")
    latest = json.loads(json_script(page, "desktop98-posts")[1])
    newest = posts[0]
    check(latest and latest[0]["url"] == newest["u"] and newest["t"].startswith("Fixture H"),
          "Latest is the newest post (an ordinary note), independent of Featured")
    check(newest["u"] not in [p["url"] for p in picks], "a new ordinary post does not displace a Featured pick")


def article(dest: Path, base: str, url: str) -> str:
    path = built_page(dest, url, base)
    return path.read_text(encoding="utf-8") if path.exists() else ""


def provenance_block(page: str) -> str:
    m = re.search(r'<aside class="post-provenance[^"]*".*?</aside>', page, re.S)
    return m.group(0) if m else ""


def check_articles(dest: Path, posts, base, note_for_default):
    by_prefix = {prefix: next((p for p in posts if p["t"].startswith(prefix)), None) for prefix in FIXTURE_POSTS}
    for prefix, p in by_prefix.items():
        if not p:
            continue
        page = article(dest, base, p["u"])
        block = provenance_block(page)
        check(bool(page), f"{prefix}: article is built")
        if p["f"] or p["ai"] is not False:
            check(bool(block), f"{prefix}: article shows a provenance block")
            title_at, block_at, body_at = page.find('id="page-title"'), page.find(block), page.find('class="page__content')
            check(-1 < title_at < block_at < body_at, f"{prefix}: the block sits under the title and date, before the body")
            check(badge_words(block) == labels(p), f"{prefix}: article badges {badge_words(block)} == {labels(p)}")
        else:
            check(not block, f"{prefix}: no provenance block for an unfeatured not-AI-researched post")
        if p["ai"] is True:
            want = OVERRIDE_NOTE if prefix == "Fixture A" else note_for_default
            esc = want.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
            check(esc in block, f"{prefix}: article shows the effective note")
            check("not how far its details were independently verified" in block, f"{prefix}: the note disclaims verification")
        if p["ai"] is None:
            check("Research provenance has not yet been classified for this older post." in block,
                  f"{prefix}: the Unclassified notice is shown")
        check("human" not in block.lower(), f"{prefix}: the provenance block makes no human-authorship claim")
    a_page = article(dest, base, by_prefix["Fixture A"]["u"])
    check("<b>not bold</b>" not in a_page and "&lt;/script&gt;&lt;b&gt;not bold&lt;/b&gt;" in a_page,
          "an override note with HTML is escaped in the article")
    ld = re.findall(r'<script type="application/ld\+json">(.*?)</script>', a_page, re.S)
    try:
        headlines = [json.loads(block).get("headline") for block in ld]
    except json.JSONDecodeError:
        headlines = []
    check(by_prefix["Fixture A"]["t"] in headlines, "a title with </script> can't break the article's JSON-LD")

    # related-post cards carry the same badges as the index
    by_url, cards = {p["u"]: p for p in posts}, 0
    for p in list(by_prefix.values()) + posts[:5]:
        page = article(dest, base, p["u"])
        related = page[page.find('class="post-related"'):]
        for item in re.split(r'<li class="post-related__item">', related)[1:]:
            href = re.search(r'class="post-related__name"><a href="([^"]+)">', item)
            if not href or href.group(1) not in by_url:
                continue
            cards += 1
            if badge_words(item.split("</li>")[0]) != labels(by_url[href.group(1)]):
                check(False, f"related card {href.group(1)} on {p['u']} has badges {badge_words(item)}")
    check(cards > 0, f"related-post cards carry the index's badges ({cards} cards checked)")


def check_zero_featured(dest: Path):
    writings = (dest / "writings" / "index.html").read_text(encoding="utf-8")
    home = (dest / "index.html").read_text(encoding="utf-8")
    posts = json.loads(json_script(writings, "wr-data")[1])["posts"]
    check(not any(p["f"] for p in posts), "zero Featured: no post is Featured")
    check('class="wr-shelf"' not in writings and 'id="featured"' not in writings, "zero Featured: /writings/ has no shelf")
    whole, raw = json_script(home, "desktop98-featured")
    check(raw is not None and json.loads(raw) == [] and 'data-total="0"' in whole, "zero Featured: the Welcome picks are empty")
    links = [e["attrs"].get("href", "") for e in Tree(home).elements if e["tag"] == "a"]
    check("desktop98-noscript-featured" not in home and not any("#featured" in h for h in links),
          "zero Featured: no Featured links on /")
    base = baseurl(writings)
    check_articles(dest, posts, base, CHANGED_NOTE)
    a = next(p for p in posts if p["t"].startswith("Fixture A"))
    check(a["note"] == OVERRIDE_NOTE, "a changed default note leaves overrides alone")
    overrides = source_overrides()
    notes = [p["note"] for p in posts if p["ai"] is True]
    check(all(n == CHANGED_NOTE or n in overrides for n in notes) and
          notes.count(CHANGED_NOTE) == len(notes) - len(overrides),
          f"every AI-researched post without an override picks up the changed default note "
          f"({notes.count(CHANGED_NOTE)} default, {len(overrides)} overrides)")


def main():
    keep = Path(sys.argv[sys.argv.index("--keep") + 1]).resolve() if "--keep" in sys.argv else None
    check_validator()
    if keep:
        shutil.rmtree(keep, ignore_errors=True)
    dest = keep or Path(tempfile.mkdtemp(prefix="check-writings-"))
    zero = Path(tempfile.mkdtemp(prefix="check-writings-zero-"))
    work = Path(tempfile.mkdtemp(prefix="check-writings-src-"))
    try:
        build_with_fixtures(dest)
        posts, ranked, base = check_index(dest)
        check(len(ranked) > 3, f"the fixture build has more than three Featured posts ({len(ranked)})")
        check_home(dest, posts, ranked, base)
        check_articles(dest, posts, base, default_note())
        build_without_featured(zero, work)
        check_zero_featured(zero)
    finally:
        for d in (zero, work) if keep else (dest, zero, work):
            shutil.rmtree(d, ignore_errors=True)

    if failures:
        print(f"\n{len(failures)} check(s) failed")
        sys.exit(1)
    print("\nall checks passed")


if __name__ == "__main__":
    main()
