#!/usr/bin/env bash
# AC-6 — verifies component LOC budget.
set -e
cd "$(dirname "$0")/.."

fail=0

# All .astro files must be ≤ 200 LOC.
while IFS= read -r f; do
  lc=$(wc -l < "$f" | tr -d ' ')
  if [ "$lc" -gt 200 ]; then
    echo "FAIL: $f has $lc lines (> 200)"
    fail=1
  fi
done < <(find src -name "*.astro")

# index.astro must be ≤ 60 LOC.
idx_lc=$(wc -l < src/pages/index.astro | tr -d ' ')
if [ "$idx_lc" -gt 60 ]; then
  echo "FAIL: src/pages/index.astro has $idx_lc lines (> 60)"
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  echo "AC-6 PASS — all components within budget (index.astro: $idx_lc lines)"
fi
exit $fail
