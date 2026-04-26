#!/usr/bin/env bash
# Generate WebP variants of large PNG/JPG files in assets/images.
# Original files are kept untouched. Run from repo root.
#
# Requires `cwebp` (brew install webp).

set -euo pipefail

SRC_DIR="${1:-assets/images}"
SIZE_THRESHOLD_KB=200

if ! command -v cwebp >/dev/null; then
  echo "cwebp not found. Install with: brew install webp" >&2
  exit 1
fi

find "$SRC_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | while read -r src; do
  size_kb=$(du -k "$src" | cut -f1)
  if [ "$size_kb" -lt "$SIZE_THRESHOLD_KB" ]; then
    continue
  fi
  out="${src%.*}.webp"
  if [ -f "$out" ] && [ "$out" -nt "$src" ]; then
    continue
  fi
  echo "Encoding $src -> $out (${size_kb}KB)"
  cwebp -q 80 -quiet "$src" -o "$out"
done

echo "Done. Reference WebP variants in posts using e.g. ![](/assets/images/foo.webp)"
