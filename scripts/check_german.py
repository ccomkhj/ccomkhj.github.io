#!/usr/bin/env python3
"""Build-output check for the /learn/german section.

Copies the fixture Sessions into `_learn_german/`, builds the site into a temp
directory, removes the fixtures again, and asserts on the generated HTML.
Run via `just check-german`.
"""
import html
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIXTURES = ROOT / "scripts" / "fixtures" / "learn_german"
COLLECTION = ROOT / "_learn_german"

ALPHA_URL = "/learn/german/1999-01-01-fixture-alpha/"
BETA_URL = "/learn/german/1999-01-02-fixture-beta/"

failures = []


def check(cond, msg):
    status = "ok  " if cond else "FAIL"
    print(f"[{status}] {msg}")
    if not cond:
        failures.append(msg)


def build(dest: Path):
    copied = []
    try:
        for fixture in sorted(FIXTURES.glob("*.md")):
            target = COLLECTION / fixture.name
            if target.exists():
                sys.exit(f"refusing to overwrite existing Session {target}")
            shutil.copy(fixture, target)
            copied.append(target)
        subprocess.run(
            ["bundle", "exec", "jekyll", "build", "--strict_front_matter",
             "--destination", str(dest)],
            cwd=ROOT, check=True,
        )
    finally:
        for target in copied:
            target.unlink(missing_ok=True)


def read(dest: Path, rel: str) -> str:
    path = dest / rel.lstrip("/")
    return path.read_text(encoding="utf-8") if path.exists() else ""


def main():
    dest = Path(tempfile.mkdtemp(prefix="check-german-"))
    try:
        build(dest)

        # --- index page -------------------------------------------------
        index = read(dest, "/learn/german/index.html")
        check(index != "", "index page exists at /learn/german/")
        check(ALPHA_URL in index and BETA_URL in index,
              "index lists both fixture Sessions")
        check(0 <= index.find(BETA_URL) < index.find(ALPHA_URL),
              "index lists Sessions newest-first (beta before alpha)")
        check("1999-01-02" in index and "1999-01-01" in index,
              "index shows Source dates")
        check("Fixture Alpha" in index and "Fixture Beta" in index,
              "index shows Source titles")
        check(re.search(r"2\s+words", index) is not None,
              "index shows Entry counts")

        glossary = re.search(
            r'<section class="german-glossary".*?</section>', index, re.S)
        check(glossary is not None, "index has a Glossary section")
        gtext = glossary.group(0) if glossary else ""
        # Real Sessions may coexist with the fixtures: only judge fixture-linked items.
        items = [i for i in re.findall(r'<li class="german-glossary__item".*?</li>',
                                       gtext, re.S)
                 if "/learn/german/1999-" in i]
        check(len(items) == 4, f"Glossary has 4 distinct fixture Words (got {len(items)})")
        plain = [re.sub(r"<[^>]+>", "", html.unescape(i)) for i in items]
        order = [next((k for k in ("Antrag", "einreichen", "leisten", "Prüfung") if k in p), "?")
                 for p in plain]
        check(order == ["Antrag", "einreichen", "leisten", "Prüfung"],
              f"Glossary sorted A–Z by stem (article/case/umlaut-insensitive): {order}")
        pruefung = [i for i in items if "Prüfung" in html.unescape(i)]
        check(len(pruefung) == 1, "repeated Word 'Prüfung' listed once")
        links = re.findall(r'href="([^"]+)"', pruefung[0]) if pruefung else []
        check(ALPHA_URL in links and BETA_URL in links and len(links) == 2,
              "repeated Word links to both Sessions")

        # --- session page -----------------------------------------------
        session = read(dest, BETA_URL + "index.html")
        check(session != "", f"Session page exists at {BETA_URL}")
        cards = re.findall(r'class="german-card(?:\s|")', session)
        check(len(cards) == 2, f"Session renders one card per Entry (got {len(cards)})")
        check("einreichen" in session and "Prüfung" in session,
              "Session shows both Words")
        check("exam; inspection, check" in session,
              "Meaning is present in the HTML (no-JS degradation)")
        check("Eine erneute Prüfung des Falls" in session,
              "Examples are present in the HTML (no-JS degradation)")
        check("Nach der Prüfung gingen alle feiern" in html.unescape(
              re.sub(r"<[^>]+>", "", session)),
              "Seen sentence is present in the HTML")
        check("<mark>Prüfung</mark>" in session, "Word is highlighted in the Seen sentence")
        alpha = read(dest, ALPHA_URL + "index.html")
        check("<mark>leisten</mark>" in alpha,
              "reflexive verb with case marker highlights the verb, not 'sich'")
        check("<mark>Antrag</mark>" in alpha, "noun stem highlighted after article/plural stripped")
        check("https://example.com/fixture-beta" in session,
              "Session links to its Source")
        check('data-german-toggle-all' in session,
              "Session has a Show all / Hide all control")
        check(re.search(r'<meta name="robots" content="noindex', session) is not None,
              "Session HTML carries a noindex robots meta")
        check(re.search(r'<meta name="robots" content="noindex', index) is not None,
              "index HTML carries a noindex robots meta")
        check("window-themed" not in session and "title-bar" not in session,
              "Session uses no Win98 window chrome")

        # --- isolation --------------------------------------------------
        for rel, label in [
            ("/sitemap.xml", "sitemap"),
            ("/assets/js/lunr/lunr-store.js", "lunr search index"),
            ("/feed.xml", "RSS feed"),
            ("/tags/index.html", "tags tree"),
            ("/writings/index.html", "/writings/"),
        ]:
            content = read(dest, rel)
            check(content != "", f"{label} was generated")
            check("/learn/german/" not in content and "Fixture Alpha" not in content,
                  f"{label} does not reference /learn/german/")
    finally:
        shutil.rmtree(dest, ignore_errors=True)

    if failures:
        print(f"\n{len(failures)} check(s) failed")
        sys.exit(1)
    print("\nall checks passed")


if __name__ == "__main__":
    main()
