# UAT (manual preview)

Before **product** review:

1. Serve the wireframes on `:12000` and the app on `:12001`. Ports and the full plan: [`docs/plans/2026-10-14-tdd-and-e2e-strategy.md`](../docs/plans/2026-10-14-tdd-and-e2e-strategy.md), section "Reconciliation with UAT.md".
2. `package.json` currently fixes the app port to `3456`, so the app does not come up on `12001` by default.
3. `scripts/uat-serve.sh` is not in this repo. Do not assume it exists.
4. Do **not** treat UAT as a `rails-gate` / CI check. The gate is lint, test and verify only.

Tests green first, then UAT. Evidence of test runs goes to `artifacts/test-output/`.
