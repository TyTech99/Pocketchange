#!/usr/bin/env bash
# Shared helpers for scripts/lint.sh, test.sh and verify.sh. Source it; do not run it.
# Fail closed: every helper exits non-zero on a problem.

REQUIRED_NODE_MAJOR=22
REQUIRED_NODE_MINOR=13

# Fail unless Node is 22.13 or newer (node:sqlite needs it; see package.json engines).
require_node() {
  if ! command -v node >/dev/null 2>&1; then
    echo "FAIL: node not found on PATH (need Node ${REQUIRED_NODE_MAJOR}.${REQUIRED_NODE_MINOR}+)" >&2
    exit 1
  fi
  local v major minor
  v="$(node -p 'process.versions.node')"
  major="${v%%.*}"
  minor="${v#*.}"
  minor="${minor%%.*}"
  if (( major < REQUIRED_NODE_MAJOR )) || { (( major == REQUIRED_NODE_MAJOR )) && (( minor < REQUIRED_NODE_MINOR )); }; then
    echo "FAIL: Node ${v} is too old; need ${REQUIRED_NODE_MAJOR}.${REQUIRED_NODE_MINOR}+ (node:sqlite)" >&2
    exit 1
  fi
  echo "node ${v} OK (>= ${REQUIRED_NODE_MAJOR}.${REQUIRED_NODE_MINOR})"
}

# Install dependencies with npm ci. In CI (CI=true, set by GitHub Actions) always run it.
# Locally, run it only when node_modules is missing, so repeat runs are fast.
ensure_deps() {
  if [[ ! -f package-lock.json ]]; then
    echo "FAIL: package-lock.json missing (npm ci needs it)" >&2
    exit 1
  fi
  if [[ "${CI:-}" == "true" || ! -d node_modules ]]; then
    echo "==> npm ci"
    npm ci --no-audit --no-fund
  else
    echo "==> npm ci skipped (node_modules present, not CI)"
  fi
}
