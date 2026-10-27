#!/usr/bin/env bash
# Full rails verify: required paths + lint + test + production build. Fail closed.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
# shellcheck source=scripts/_common.sh
source "$ROOT/scripts/_common.sh"

REQUIRED_PATHS=(
  "AGENTS.md:AGENTS.md"
  "README.md:README.md"
  "package.json:package.json"
  "package-lock.json:package-lock.json"
  "svelte.config.js:svelte.config.js"
  "vite.config.ts:vite.config.ts"
  "tsconfig.json:tsconfig.json"
  "src/:src"
  "src/routes/:src/routes"
  "tests/unit/:tests/unit"
  "scripts/lint.sh:scripts/lint.sh"
  "scripts/test.sh:scripts/test.sh"
  "scripts/verify.sh:scripts/verify.sh"
  "scripts/_common.sh:scripts/_common.sh"
  ".github/workflows/rails-gate.yml:.github/workflows/rails-gate.yml"
  ".github/CODEOWNERS:.github/CODEOWNERS"
  ".github/pull_request_template.md:.github/pull_request_template.md"
  "docs/plans/2026-10-14-tdd-and-e2e-strategy.md:docs/plans/2026-10-14-tdd-and-e2e-strategy.md"
)

echo "==> verify: required paths"
missing=()
for entry in "${REQUIRED_PATHS[@]}"; do
  label="${entry%%:*}"
  path="${entry#*:}"
  if [[ ! -e "$ROOT/$path" ]]; then
    missing+=("$label ($path)")
  fi
done
if [[ ${#missing[@]} -gt 0 ]]; then
  echo "verify FAIL: missing required paths:" >&2
  for m in "${missing[@]}"; do
    echo "  - $m" >&2
  done
  exit 1
fi

# Scripts must be executable (git mode 100755). The workflow checks the same thing.
for s in scripts/lint.sh scripts/test.sh scripts/verify.sh; do
  if [[ ! -x "$ROOT/$s" ]]; then
    echo "verify FAIL: $s is not executable (git update-index --chmod=+x $s)" >&2
    exit 1
  fi
done

# package.json must keep the Node floor that node:sqlite needs.
if ! node -e 'const e=(require("./package.json").engines||{}).node||""; process.exit(/>=\s*22\.(1[3-9]|[2-9][0-9])|>=\s*2[3-9]/.test(e)?0:1)'; then
  echo "verify FAIL: package.json engines.node must be >=22.13 (node:sqlite)" >&2
  exit 1
fi
echo "required paths OK"

echo "==> verify: lint"
bash "$ROOT/scripts/lint.sh"
echo "==> verify: test"
bash "$ROOT/scripts/test.sh"

echo "==> verify: production build (npm run build)"
npm run build
if [[ ! -f build/index.js ]]; then
  echo "verify FAIL: build/index.js missing after build (Hostinger entry point)" >&2
  exit 1
fi
echo "verify OK"
