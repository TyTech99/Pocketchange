## Summary

<!-- What changed and why (not a file list). -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation
- [ ] CI / tooling
- [ ] Other:

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
- [ ] Recurring miss encoded in a script or rule, not a new style bullet
- [ ] Self-review of the diff completed
