#!/usr/bin/env bash
set -euo pipefail

gem install bundler -v 4.0.2
bundle _4.0.2_ install
bundle _4.0.2_ exec jekyll serve
