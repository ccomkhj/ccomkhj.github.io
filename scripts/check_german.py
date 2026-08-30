#!/usr/bin/env python3
"""Build-output check for the /learn/german section.

Copies the fixture Sessions into `_learn_german/`, builds the site into a temp
directory (with `scripts/fixtures/check_config.yml` lifting the prompt cap so
fixture Words reach the prompt), removes the fixtures again, and asserts on the
generated HTML and text. Also exercises `scripts/german_done.py` on a copy of a
fixture. Run via `just check-german`.
"""
import html
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIXTURES = ROOT / "scripts" / "fixtures" / "learn_german"
CHECK_CONFIG = ROOT / "scripts" / "fixtures" / "check_config.yml"
COLLECTION = ROOT / "_learn_german"

sys.path.insert(0, str(ROOT / "scripts"))
import german_done  # noqa: E402

ALPHA_URL = "/learn/german/1999-01-01-fixture-alpha/"
BETA_URL = "/learn/german/1999-01-02-fixture-beta/"
PROMPT_URL = "/learn/german/prompt/"
PROMPT_TXT = "/learn/german/prompt.txt"

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
             "--config", f"_config.yml,{CHECK_CONFIG.relative_to(ROOT)}",
             "--destination", str(dest)],
            cwd=ROOT, check=True,
        )
    finally:
        for target in copied:
            target.unlink(missing_ok=True)


def read(dest: Path, rel: str) -> str:
    path = dest / rel.lstrip("/")
    return path.read_text(encoding="utf-8") if path.exists() else ""


def text_of(fragment: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", fragment))


def check_done_script():
    """scripts/german_done.py against copies of the fixtures: insert, idempotent, undo."""
    check(german_done.stem("der Antrag, die Anträge") == "Antrag", "stem: noun with plural")
    check(german_done.stem("sich (Dat.) etw. leisten") == "leisten", "stem: reflexive with case marker")
    check(german_done.stem("einreichen (reicht ein, reichte ein, hat eingereicht)") == "einreichen",
          "stem: verb with principal parts")
    check(german_done.stem("die Eltern (Pl.)") == "Eltern", "stem: plural-only noun")
    check(german_done.key("Prüfung") == german_done.key("die Prüfung, die Prüfungen"),
          "key: bare stem and full headword match")

    tmp = Path(tempfile.mkdtemp(prefix="check-german-done-"))
    try:
        for fixture in FIXTURES.glob("*.md"):
            shutil.copy(fixture, tmp / fixture.name)
        beta = tmp / "1999-01-02-fixture-beta.md"
        alpha = tmp / "1999-01-01-fixture-alpha.md"
        beta_orig = beta.read_text(encoding="utf-8")
        alpha_orig = alpha.read_text(encoding="utf-8")

        rc = german_done.main(["--dir", str(tmp), "--date", "1999-01-04", "einreichen"])
        check(rc == 0, "german_done: marking a known Word exits 0")
        expected = beta_orig.replace("    examples: []\n    note:\n",
                                     "    examples: []\n    note:\n    done: 1999-01-04\n")
        check(beta.read_text(encoding="utf-8") == expected,
              "german_done: appends `done:` under the Entry's last field, rest byte-identical")
        check(alpha.read_text(encoding="utf-8") == alpha_orig,
              "german_done: untouched Session stays byte-identical")

        german_done.main(["--dir", str(tmp), "--date", "1999-01-05", "einreichen"])
        check(beta.read_text(encoding="utf-8") == expected,
              "german_done: marking an already-done Word changes nothing")

        rc = german_done.main(["--dir", str(tmp), "--date", "1999-01-06",
                               "MASTERED: der Antrag, die Anträge; Prüfung"])
        check(rc == 0, "german_done: accepts a whole MASTERED: line")
        alpha_now = alpha.read_text(encoding="utf-8")
        check(alpha_now.count("done: 1999-01-03") == 1 and "done: 1999-01-06" in alpha_now,
              "german_done: keeps the existing Antrag date, marks Prüfung in alpha")
        check(beta.read_text(encoding="utf-8").count("done: 1999-01-06") == 1,
              "german_done: marks the repeated Word Prüfung in beta too")

        rc = german_done.main(["--dir", str(tmp), "Unbekanntwort"])
        check(rc == 1, "german_done: an unmatched Word exits 1")

        german_done.main(["--dir", str(tmp), "--undo", "einreichen", "Prüfung"])
        check(beta.read_text(encoding="utf-8") == beta_orig,
              "german_done: --undo restores beta byte-identical")
        check(alpha.read_text(encoding="utf-8") == alpha_orig,
              "german_done: --undo restores alpha byte-identical")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    check_done_script()

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
        check(re.search(r"\d+ open", index) is not None,
              "index shows the open-Word count")
        alpha_item = re.search(r'<li class="german-session-item">.*?</li>', index[index.find(ALPHA_URL) - 200:], re.S)
        check(alpha_item is not None and re.search(r"1\s+done", alpha_item.group(0)) is not None,
              "index shows the done count of a Session with a done Entry")
        check(PROMPT_URL in index, "index links to the prompt page")
        new_link = re.search(r'<a class="german-new" href="([^"]+)"', index)
        check(new_link is not None and "/new/master/_learn_german?filename=" in new_link.group(1),
              "index has a New Session link into GitHub's new-file editor")
        check(new_link is not None and "entries%3A" in new_link.group(1) and "+" not in new_link.group(1),
              "New Session link carries the URL-encoded skeleton (no literal +)")

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
        check(pruefung and "data-german-gloss-toggle" in pruefung[0],
              "Glossary Word is a toggle (click reveals the Meaning)")
        check(pruefung and pruefung[0].count("exam; inspection, check") == 1,
              "Glossary item carries the Meaning once for a repeated Word")
        antrag = [i for i in items if "Antrag" in html.unescape(i)]
        check(antrag and "application, motion (formal request)" in antrag[0],
              "Glossary item carries the Meaning (no-JS degradation)")
        einreichen = [i for i in items if "einreichen" in i]
        check(einreichen and "meaning pending" in einreichen[0],
              "Glossary item without a Meaning shows the pending hint")
        check(antrag and "german-glossary__done" in antrag[0],
              "Glossary ticks a done Word")
        check(pruefung and "german-glossary__done" not in pruefung[0],
              "Glossary leaves an open Word unticked")

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

        # --- done state --------------------------------------------------
        # Cards nest <li> (Examples), so split on the card opener rather than matching to </li>.
        alpha_cards = re.split(r'(?=<li class="german-card[" ])', alpha)[1:]
        done_cards = [c for c in alpha_cards if c.startswith('<li class="german-card is-done"')]
        check(len(done_cards) == 1 and "Antrag" in done_cards[0],
              "done Entry renders as a done card, open ones don't")
        check(done_cards and 'data-german-done="1999-01-03"' in done_cards[0],
              "done card carries its date")
        check(done_cards and 'class="german-card__done"' in done_cards[0],
              "done card shows a badge")
        check(re.search(r"1\s+done", alpha) is not None, "Session meta shows the done count")
        check("is-done" not in session, "Session without done Entries has no done cards")

        # --- quiz direction ----------------------------------------------
        check('data-german-direction="word"' in session and "data-german-directions" in session,
              "Session starts in word direction and has a direction switch")
        check(len(re.findall(r'<button type="button" data-german-direction="(word|meaning|cloze)"', session)) == 3,
              "direction switch offers word / meaning / cloze")
        beta_cards = re.split(r'(?=<li class="german-card[" ])', session)[1:]
        pruef_card = next((c for c in beta_cards if "Prüfung" in html.unescape(c)), "")
        check('german-card__question--meaning">exam; inspection, check<' in pruef_card,
              "card carries the Meaning as a question")
        cloze = re.search(r'<span class="german-card__question german-card__question--cloze">(.*?)</span>\s*(?:<span class="german-card__done|<span class="german-card__cue)', pruef_card, re.S)
        check(cloze is not None and "<mark>Prüfung</mark>" in cloze.group(1)
              and 'class="german-card__hint">exam; inspection, check' in cloze.group(1),
              "card carries the Seen sentence with the Word marked as a cloze question, Meaning as hint")
        einr_card = next((c for c in beta_cards if "einreichen" in c), "")
        check('german-card__question--cloze"><em>meaning pending</em>' in einr_card,
              "card without a highlightable Seen sentence falls back to the Meaning question in cloze")
        order = [(re.search(r'german-card__index"[^>]*>(\d+)<', c) or [None, "?"])[1] for c in alpha_cards]
        check(order == ["1", "2", "3"] and alpha_cards[0].startswith('<li class="german-card is-done"'),
              "done card keeps its encounter-order position (Antrag stays card 1)")

        # --- prompt ------------------------------------------------------
        prompt_html = read(dest, PROMPT_URL + "index.html")
        check(prompt_html != "", f"prompt page exists at {PROMPT_URL}")
        check(re.search(r'<meta name="robots" content="noindex', prompt_html) is not None,
              "prompt page carries a noindex robots meta")
        pre = re.search(r'<pre class="german-prompt"[^>]*>(.*?)</pre>', prompt_html, re.S)
        check(pre is not None, "prompt page wraps the brief in <pre>")
        pre_text = text_of(pre.group(1)) if pre else ""
        check('data-german-copy="german-prompt-text"' in prompt_html,
              "prompt page has a Copy button")
        check(PROMPT_TXT in prompt_html, "prompt page links to the plain-text version")

        txt = read(dest, PROMPT_TXT)
        check(txt != "", f"plain-text prompt exists at {PROMPT_TXT}")
        check(txt.startswith("GERMAN VOICE-CHAT BRIEF"), "plain-text prompt starts with the brief header")
        check("<" not in txt, "plain-text prompt contains no HTML")
        check(pre_text.strip() == txt.strip(), "HTML and plain-text prompt carry the identical brief")
        for word in ("die Prüfung, die Prüfungen", "sich (Dat.) etw. leisten",
                     "einreichen"):
            check(f"- {word}" in txt, f"prompt lists open Word '{word}'")
        check("der Antrag" not in txt, "prompt leaves out the done Word")
        check("seen in: „Das kann ich mir nicht leisten.“" in txt,
              "prompt carries the Seen sentence")
        check("exam; inspection, check" in txt, "prompt carries the Meaning")
        check("MASTERED:" in txt and "REVIEW:" in txt, "prompt asks for the MASTERED/REVIEW lines")
        check("Fixture Beta" in txt and "https://example.com/fixture-beta" in txt,
              "prompt lists the Sources of its Words")
        check(txt.find("Fixture Beta") < txt.find("Fixture Alpha"),
              "prompt orders Sources newest-first")
        check(re.search(r"\d+ most recently collected Words not yet marked done \(\d+ open in total\)", txt) is not None,
              "prompt states how many Words it carries")

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
        check("prompt.txt" not in read(dest, "/sitemap.xml"), "sitemap omits prompt.txt")
    finally:
        shutil.rmtree(dest, ignore_errors=True)

    if failures:
        print(f"\n{len(failures)} check(s) failed")
        sys.exit(1)
    print("\nall checks passed")


if __name__ == "__main__":
    main()
