set shell := ["sh", "-eu", "-c"]
# production builds (the check-* recipes) need the repo named; git remotes only count in development
export PAGES_REPO_NWO := env_var_or_default("PAGES_REPO_NWO", "ccomkhj/ccomkhj.github.io")

run:
    gem install bundler -v 4.0.2
    bundle _4.0.2_ install
    bundle _4.0.2_ exec jekyll serve

# Build the site with fixture Sessions and assert on the /learn/german output.
check-german:
    python3 scripts/check_german.py

# Build the site and assert on the Win98 landing page output (extra config overlays optional).
check-landing *CONFIGS:
    python3 scripts/check_landing.py {{CONFIGS}}

# Mark Words done in _learn_german/ (headwords, stems, or a whole "MASTERED: a; b" line).
german-done +WORDS:
    python3 scripts/german_done.py {{WORDS}}

# Validate post front matter: ai_researched, ai_research_note, featured, featured_rank (CI runs this).
check-posts:
    ruby scripts/check_post_metadata.rb

