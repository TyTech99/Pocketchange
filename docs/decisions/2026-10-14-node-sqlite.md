# Replace better-sqlite3 with node:sqlite

Date: 2026-10-14
Decided by: Ty
Status: Decided and shipped
Source of truth: GitHub, `TyTech99/Pocketchange`.
Replaces: the `better-sqlite3` dependency.

## Decision

The app uses Node's built-in `node:sqlite` module. It no longer uses `better-sqlite3`.

## Reason

Fact: The first Hostinger Node.js build failed in `npm run build` (vite build).

Fact: The error was `Error: /lib64/libm.so.6: version 'GLIBC_2.29' not found (required by .../node_modules/better-sqlite3/build/Release/better_sqlite3.node)`, code `ERR_DLOPEN_FAILED`.

Fact: Hostinger's glibc is older than 2.29. The prebuilt `better-sqlite3` binary needs 2.29 or newer, so it failed to load.

Fact: `node:sqlite` is part of Node. It has no native add-on, so the host's glibc does not matter for the database.

## Change

Pull request #1, merged to `main` at commit `4db353e`.

- `src/lib/db.ts` imports `DatabaseSync` from `node:sqlite`.
- `package.json` removes `better-sqlite3` and `@types/better-sqlite3`, adds `@types/node@^22`, and pins `engines.node` to `>=22.13`.
- `package-lock.json` and one line in `docs/plans/tdd-and-e2e-strategy.md` were updated to match.

## Verification

Local, on Node 22.23.3:

- `npm ci` passed.
- `npm run build` passed in 3.31 seconds.
- `tsc --noEmit` was clean.
- The loan, payment, and list endpoints passed.
- A duplicate-phone test rolled back with no partial loan row.

Hostinger, checked 2026-10-14 at 10:22 PM PT:

- Ty reported that the first Hostinger Node.js build after the merge succeeded.
- `https://pocketchange.afterthedemo.com/` returns 200 and serves the app (page title "Personal Loan Tracker"). `/sms` and `/api/loans` also return 200.
- Not checked: the Node.js version Hostinger runs, and whether `data/loans.db` survives a redeploy.

## Risks

- `node:sqlite` is marked experimental by Node. It prints a warning on Node 22. The API could change in a later major version, so the app is pinned to Node 22.
- Open: Hostinger may wipe `data/loans.db` on a redeploy. This needs a check before real data is stored.
