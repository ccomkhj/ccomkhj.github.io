set shell := ["sh", "-eu", "-c"]

run:
    gem install bundler -v 4.0.2
    bundle _4.0.2_ install
    bundle _4.0.2_ exec jekyll serve

# Build the site with fixture Sessions and assert on the /learn/german output.
check-german:
    python3 scripts/check_german.py
