set shell := ["sh", "-eu", "-c"]

run:
    gem install bundler -v 4.0.2
    bundle _4.0.2_ install
    bundle _4.0.2_ exec jekyll serve

# Build the site with fixture Sessions and assert on the /learn/german output.
check-german:
    python3 scripts/check_german.py

# Mark Words done in _learn_german/ (headwords, stems, or a whole "MASTERED: a; b" line).
german-done +WORDS:
    python3 scripts/german_done.py {{WORDS}}
