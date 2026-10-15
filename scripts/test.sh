#!/usr/bin/env bash
# Run unit tests with the Node built-in test runner. Fail closed.
# Fails if tests/unit/ has no *.test.js files, so the gate can never pass with zero tests.
# Explicit file list (not a directory): `node --test tests/unit/` breaks on Node 22.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
# shellcheck source=scripts/_common.sh
source "$ROOT/scripts/_common.sh"

echo "==> test: node version"
require_node

# No npm ci here: the tests use only Node built-ins (node:test, node:sqlite).
# Add ensure_deps when tests import project dependencies.

shopt -s nullglob
files=(tests/unit/*.test.js)
if [[ ${#files[@]} -eq 0 ]]; then
  echo "test FAIL: no tests/unit/*.test.js files (fail closed: zero tests is not a pass)" >&2
  exit 1
fi

echo "==> test: node --test (${#files[@]} file(s))"
node --test "${files[@]}"
echo "test OK"
