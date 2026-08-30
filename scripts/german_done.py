#!/usr/bin/env python3
"""Mark Entries in `_learn_german/*.md` as done.

    python3 scripts/german_done.py "der Antrag, die Anträge" einreichen
    python3 scripts/german_done.py --date 2026-08-30 "MASTERED: der Antrag; einreichen"
    python3 scripts/german_done.py --undo einreichen

Arguments are headwords, stems, or a whole `MASTERED:` line (`;`-separated). Matching is
by stem (as _includes/german_stem.html), case- and umlaut-insensitive. Each match gets
`done: YYYY-MM-DD` appended to its Entry block; the rest of the file is byte-identical.
`--undo` removes the line. Exit 1 if any Word matched nothing.
"""
import argparse
import datetime as dt
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COLLECTION = ROOT / "_learn_german"

ENTRY_RE = re.compile(r"^(\s*)- word:\s*(.*?)\s*$")
FIELD_RE = re.compile(r"^(\s*)([A-Za-z_]+):")
FOLD = str.maketrans({"ä": "a", "ö": "o", "ü": "u", "ß": "ss"})


def stem(word: str) -> str:
    """Mirror of _includes/german_stem.html: the token the learner would look up."""
    s = word.strip()
    if s.split(" ")[0].lower() in ("der", "die", "das"):
        s = s[4:].strip()
    s = s.split(",")[0].replace("(Akk.)", "").replace("(Dat.)", "")
    s = s.split(" (")[0].split("/")[0].strip()
    return s.split(" ")[-1] if s else ""


def key(word: str) -> str:
    return stem(word).lower().translate(FOLD)


def unquote(value: str) -> str:
    v = value.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
        return v[1:-1]
    return v


def parse_words(args) -> list:
    words = []
    for raw in args:
        text = re.sub(r"^\s*MASTERED\s*:\s*", "", raw.strip(), flags=re.I)
        parts = text.split(";") if ";" in text else [text]
        words.extend(p.strip().strip("\"'") for p in parts if p.strip())
    return words


def entry_blocks(lines):
    """Yield (start, end, indent, word) per Entry; `end` is one past the last field line
    (trailing comments/blanks belong to the next Entry, so `done:` lands under a field)."""
    fence = 0
    limit = len(lines)
    for i, line in enumerate(lines):
        if line.rstrip("\n") == "---":
            fence += 1
            if fence == 2:
                limit = i
                break
    starts = [(i, m) for i in range(limit) for m in [ENTRY_RE.match(lines[i])] if m]
    for n, (start, m) in enumerate(starts):
        indent = len(m.group(1))
        stop = starts[n + 1][0] if n + 1 < len(starts) else limit
        end = start + 1
        for j in range(start + 1, stop):
            fm = FIELD_RE.match(lines[j])
            if fm and len(fm.group(1)) <= indent:
                break  # a top-level key such as a stray `title:` ends the list
            if lines[j].strip() and not lines[j].lstrip().startswith("#"):
                end = j + 1
        yield start, end, indent, unquote(m.group(2))


def apply(path: Path, wanted: dict, date: str, undo: bool) -> int:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    changed = 0
    # Walk backwards so insertions don't shift later offsets.
    for start, end, indent, word in reversed(list(entry_blocks(lines))):
        k = key(word)
        if k not in wanted:
            continue
        wanted[k].append(f"{path.name}: {word}")
        field_indent = " " * (indent + 2)
        done_idx = next((j for j in range(start + 1, end)
                         if lines[j].startswith(f"{field_indent}done:")), None)
        if undo:
            if done_idx is not None:
                del lines[done_idx]
                changed += 1
        elif done_idx is None:
            if not lines[end - 1].endswith("\n"):
                lines[end - 1] += "\n"
            lines.insert(end, f"{field_indent}done: {date}\n")
            changed += 1
    if changed:
        path.write_text("".join(lines), encoding="utf-8")
    return changed


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("words", nargs="+", help="headwords, stems, or a MASTERED: line")
    ap.add_argument("--date", default=dt.date.today().isoformat(),
                    help="date to record (default: today)")
    ap.add_argument("--undo", action="store_true", help="remove the done mark instead")
    ap.add_argument("--dir", type=Path, default=COLLECTION,
                    help="Session directory (default: _learn_german/)")
    ns = ap.parse_args(argv)

    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", ns.date):
        sys.exit(f"--date must be YYYY-MM-DD, got {ns.date!r}")
    words = parse_words(ns.words)
    if not words:
        sys.exit("no Words given")
    wanted = {key(w): [] for w in words}

    total = 0
    for path in sorted(ns.dir.glob("*.md")):
        n = apply(path, wanted, ns.date, ns.undo)
        if n:
            verb = "unmarked" if ns.undo else "marked done"
            print(f"{path.relative_to(ROOT) if path.is_relative_to(ROOT) else path} — {n} {verb}")
        total += n

    missing = [w for w in words if not wanted[key(w)]]
    for w in words:
        hits = wanted[key(w)]
        if hits:
            print(f"  ✓ {w} → " + "; ".join(hits))
    for w in missing:
        print(f"  ✗ {w} — no Entry with stem '{stem(w)}'")
    print(f"{total} Entr{'y' if total == 1 else 'ies'} changed")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
