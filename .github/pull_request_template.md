## Summary

<!-- What changed and why (not a file list). -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation
- [ ] CI / tooling
- [ ] Other:

## Feature map

<!-- Which row of skills/feature-map/FEATURE_MAP.md does this touch? Name the row. If none, say "new row" and add it, or say "none" and why. -->

## How verify.sh covers it

<!-- Which lint, test or verify step would fail if this change were wrong? If none does, say "not covered" and say what you checked by hand. -->

## Prevent a repeat

<!-- Bug fix: what rule, lint or test would stop this bug from coming back? Put it up the ladder (docs/RAILS.md): a test or lint first, a rule or skill next, a style note last. Not a bug fix: write "n/a". -->

## How to Test

Use Node 22.13 or newer.

```bash
./scripts/lint.sh
./scripts/test.sh
./scripts/verify.sh
```

## Checklist

- [ ] Scripts above exit 0 locally (or the `rails-gate` checks are green on this PR)
- [ ] Plan of record respected (GitHub source of truth, `node:sqlite`, Hostinger Node.js deploy) — see `AGENTS.md` and `docs/decisions/`
- [ ] No secrets committed
- [ ] Tests added or updated for changed behavior (`docs/plans/2026-10-14-tdd-and-e2e-strategy.md`)
- [ ] `skills/feature-map/FEATURE_MAP.md` updated if behavior changed
- [ ] Recurring miss encoded **up** the rails (`docs/RAILS.md`), not a new style bullet
- [ ] Self-review of the diff completed
