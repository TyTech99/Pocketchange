#!/usr/bin/env bash
# Lint / static checks for PocketChange (SvelteKit + TypeScript). Fail closed.
# Runs: Node version check, npm ci, svelte-kit sync, tsc type check.
# eslint, prettier and svelte-check are NOT configured in package.json, so they are
# not run. Add them as devDependencies plus a package.json script, then extend this file.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
# shellcheck source=scripts/_common.sh
source "$ROOT/scripts/_common.sh"

echo "==> lint: node version"
require_node

ensure_deps

echo "==> lint: svelte-kit sync (generates .svelte-kit/tsconfig.json)"
npx --no-install svelte-kit sync

echo "==> lint: type check (tsc --noEmit; checks .ts files only, not .svelte)"
npx --no-install tsc --noEmit

# Optional linters: run only if the project configures them. Never invent config.
if node -e 'const s=require("./package.json").scripts||{}; process.exit(s.lint?0:1)'; then
  echo "==> lint: npm run lint (configured in package.json)"
  npm run --silent lint
else
  echo "NOTE: no 'lint' script in package.json: eslint/prettier not configured, skipped"
fi
if node -e 'const s=require("./package.json").scripts||{}; process.exit(s.check?0:1)'; then
  echo "==> lint: npm run check (configured in package.json)"
  npm run --silent check
else
  echo "NOTE: no 'check' script in package.json: svelte-check not configured, .svelte files are not type-checked"
fi

echo "lint OK"
