# Skill: verify

Prove work before claiming done.

## Steps

1. Use Node 22.13 or newer (`node:sqlite` needs it). From the repo root, run `chmod +x scripts/*.sh` if needed.
2. Run `./scripts/lint.sh` — must exit 0. (`npm ci`, `svelte-kit sync`, `tsc --noEmit`.)
3. Run `./scripts/test.sh` — must exit 0.
4. Run `./scripts/verify.sh` — must exit 0. (Required paths, lint, test, then `npm run build` and a check for `build/index.js`, the Hostinger entry point.)
5. Drive the app like a user (below) for any change a user can see.
6. Record evidence: command lines + exit codes (or the CI check URL). Test output goes to `artifacts/test-output/`.

The scripts and the gate land with PR #8. Before that PR merges, steps 2–4 cannot run on `main`. See `docs/RAILS.md`, section "Status".

## Drive the app like a user

Find the feature and its verify steps in [`../feature-map/FEATURE_MAP.md`](../feature-map/FEATURE_MAP.md).

```bash
npm ci
npm run dev        # http://127.0.0.1:3456
```

- Open the route in the feature-map row. Check the page, not only the unit test.
- Demo data is a local SQLite file, `data/loans.db`. It is gitignored. The path is fixed today, so delete the file before and after a run to start clean.
- `DB_PATH` (a throwaway test database) is a planned first red test in the TDD plan. It is not built.
- For the SMS webhook, send fake data only. Phones use `+1-555-0100` to `+1-555-0199`. No real receipts.
- UAT ports `:12000` and `:12001` are explained in `rules/uat.md`. UAT is manual and is not a gate.

## Rules

- Never claim done on unit green alone without script exit 0.
- Never claim CI green without a runner check or local verify exit 0.
- Write the failing test first. A bug fix starts with a test that reproduces it (`docs/plans/2026-10-14-tdd-and-e2e-strategy.md`).
- If a required path is missing, fix the tree or update `docs/README.md` **and** `scripts/verify.sh` together.
- No mocks for SQLite. Mock only the outside edge: Twilio, email provider, clock.
- If a feature-map row says verify is "none yet", say that. Do not invent a command.
