# TDD and end-to-end test strategy

Status: **proposed**. Needs Ty's approval.
Owner: PocketChange Launch (strategy and test-case catalog). PocketChange bot aligns the UAT plan. OpenCode writes the tests and code.
Date: 2026-10-14

## Summary

- Every behavior gets a failing test before code. No exceptions for the prototype or production.
- The center of the strategy is a catalog of end-to-end scenarios. Each scenario is built from sample contracts and sample payments.
- Sample data lives in versioned fixtures. A seed script loads them into a throwaway database.
- Evidence of each run goes to `artifacts/test-output/`.
- UAT (`/workspace/agent-rails-uat/UAT.md`) stays the manual preview step. Automated tests are a separate gate.

## Facts (verified in repo at 4776670)

- `package.json` has `dev`, `build`, `preview`, `start`. It has no `test` script and no test dependencies.
- The repo has no `tests/` folder, no `scripts/` folder, and no CI config.
- The prototype is SvelteKit with `node:sqlite` (Node built-in; previously `better-sqlite3`). Tables: `loans`, `participants`, `payments`, `confirmations` (`static/demo/src/lib/db.ts`).
- The database path is fixed to `data/loans.db` under the working directory (`static/demo/src/lib/db.ts`, line 5). A test cannot point at another file today.
- `static/demo/src/lib/parsePaymentSms.ts` parses PayPal, Zelle, Venmo and Cash App SMS shapes. It returns amount in cents, sender hint, provider, and a confidence level.
- `static/demo/src/lib/processInboundSms.ts` turns an inbound SMS into a recorded payment. `POST /api/sms` and the `/sms` simulator both use it. All of this code is the demo, now in `static/demo/` (reference only, not the architecture).
- The dev server port is fixed to 3456 in `package.json`. `UAT.md` expects the app on :12001 and wireframes on :12000.
- `UAT.md` refers to `scripts/uat-serve.sh`. That script is not in this repo.
- `UAT.md` says UAT is not a CI gate. It says `rails-gate` owns lint, test and verify only.
- `MVP-USE-CASES.md` defines the lifecycle, pricing modes, schedule cadences, repayment trust modes, late-fee policies, tab add-ons and anti-spam rules.
- `MVP-USE-CASES.md` says "Ty → kids first". It has no gift scenario.

## Assumptions

- The prototype implements only part of `MVP-USE-CASES.md`. I have not checked which lifecycle states and pricing modes the code supports. The first step is a gap list.
- Email forward, MMS, OTP and magic links are specified but not built. Their scenarios start as pending tests.

## Part 1. TDD in the dev cycle

### Rule

1. Write one failing test that states the behavior.
2. Run it. Confirm it fails for the right reason (red).
3. Write the least code that passes (green).
4. Clean up with all tests passing (refactor).
5. Commit test and code together. The commit message names the behavior.

A bug fix starts with a failing test that reproduces the bug.

### What each layer tests

| Layer | Tests | Speed | Scope in this project |
|---|---|---|---|
| Unit | One function, no I/O | Milliseconds | `parsePaymentSms`; amortization and flat-fee math; schedule date generation; late-fee eligibility; ledger balance math |
| Integration | Several modules plus a real SQLite file | Under a second each | `processInboundSms` against a seeded test database; `recordPayment`; confirmation records; route handlers for `/api/sms` and `/api/loans` |
| End to end | The running app in a browser or over HTTP | Seconds | Whole workflows from the scenario catalog (Part 2) |

Rules:
- Test behavior, not implementation.
- No mocks for SQLite. Use a real throwaway database file.
- Mock only the outside edge: Twilio, email provider, clock.
- A scenario that cannot run yet is written as a pending (skipped) test with the spec line it comes from.

### Prototype versus production

| | Prototype (repo root) | Production (`production/`) |
|---|---|---|
| Tests first | Yes, from the next change onward | Yes, always |
| Existing code | Add characterization tests before changing it | Not applicable |
| Test location | `tests/` at repo root | `production/tests/` |
| Fixtures | `tests/fixtures/` | Shared copy or a single shared directory (decision below) |
| Gate | Run before any "done" claim | Required check before merge |

### Proposed tooling (recommendation)

- Vitest for unit and integration. It fits SvelteKit and Vite.
- Playwright for end to end. It records screenshots and traces.
- Add `test`, `test:unit`, `test:int`, `test:e2e` scripts to `package.json`.
- This tooling is not installed. Adding it is a change for OpenCode after Ty approves.

### First red tests (prerequisites)

1. Database path from an environment variable, default `data/loans.db`. Red test: opening the app with `DB_PATH` set uses that file.
2. App port from an environment variable. Default stays 3456. UAT sets 12001. Red test: server answers on `PORT_APP`.
3. Characterization tests for `parsePaymentSms` using the five shapes below.

## Part 2. End-to-end test case strategy

### Principle

One scenario is one workflow with fixed inputs and a checked outcome. Scenarios are built from named contracts and named payments. This keeps UAT repeatable and comparable across runs.

### Sample data conventions

- All data is fake. Names: Mom, John, Ana (children), Dad. Phones use the reserved fictional range `+1-555-0100` to `+1-555-0199`.
- Amounts in the tables below are **example data** for fixtures. They are not product figures.
- No real payment receipts. Receipt text is synthetic.
- No secrets in fixtures.

### Catalog A. Sample contracts

IDs are stable. Fixtures refer to them by ID.

| ID | Pricing | Schedule | Late policy | Receipt trust | Purpose |
|---|---|---|---|---|---|
| C1 | Flat fee, fee $0 | Monthly, day 15 | Late fee $0 | Count as paid right away | Simplest happy path |
| C2 | Flat fee, fee $25 | Monthly, day 1 | Late fee $15, right away | Count as paid right away | Fee plus late fee |
| C3 | Installment, annual rate and term | Monthly, 3rd Friday | Late fee $15, after 5-day grace | Wait for lender to confirm | Amortization plus lender confirm |
| C4 | Flat fee | Weekly, every 2 weeks, Friday | Late fee $25, decide each time | Count as paid right away | Weekly cadence, lender add-or-skip |
| C5 | Flat fee | Twice a month, dates 1 and 15 | Late fee $0 | Count as paid right away | Twice-a-month by dates |
| C6 | Flat fee | Twice a month, 1st and 3rd Friday | Late fee $15, right away | Wait for lender to confirm | Twice-a-month by weekdays |
| C7 | Installment | Months defined by dollars per payment | Late fee $0 | Count as paid right away | Define-by-payment mode |

Coverage: both pricing modes, all three frequencies, both repayment trust modes, all three late-fee timings plus $0.

### Catalog B. Sample payments

| ID | Input | Expected result |
|---|---|---|
| P1 | PayPal text: "You received $50.00 from Jane Doe" | Amount 5000 cents, provider PayPal, sender "Jane Doe" |
| P2 | Zelle text: "Jane D sent you $25.00 with Zelle" | Amount 2500, provider Zelle, sender "Jane D" |
| P3 | Venmo text: "You paid Bob $10.00" | Amount 1000, provider Venmo, sender "Bob" |
| P4 | Cash App text: "Cash App: Jane Doe sent you $20" | Amount 2000, provider Cash App, sender "Jane Doe" |
| P5 | Generic text: "Payment from Jane Doe for $30" | Amount 3000, sender "Jane Doe" |
| P6 | Large amount with comma: "$1,200.50" | Amount 120050 |
| P7 | No dollar amount | Rejected: could not extract amount |
| P8 | Zero or negative amount | Rejected |
| P9 | Unknown sender phone, no matching loan | Rejected: no loan found |
| P10 | Partial payment below the scheduled amount | Recorded; balance reduced; confirmation to both |
| P11 | Payment equal to remaining balance | Recorded; loan reaches paid off |
| P12 | Same receipt forwarded twice | Open question: duplicate handling is not specified (decision below) |
| P13 | Receipt that matches two loans (same borrower, two loans) | One clarify; pending if ignored. Pending test until built |
| P14 | Receipt by email forward to the payment address | Same parser path as SMS. Pending test until built |
| P15 | Receipt by MMS screenshot | Same parser path. Pending test until built |

P1 to P5 mirror the code comments in `parsePaymentSms.ts`. P6 to P15 are proposed.

### Catalog C. Parent-child loan and gift scenarios

| ID | Scenario | Contracts used | Status |
|---|---|---|---|
| F1 | Parent (Mom) lends to child (John). John drafts, Mom agrees | C1 | Specified in lifecycle |
| F2 | Mom drafts for John. John agrees | C2 | Specified |
| F3 | Mom has two children (John, Ana), each with their own loan. Payments route to the right child | C1, C5 | Specified (one lender, one borrower per loan) |
| F4 | One borrower with two loans from the same parent. Ambiguous receipt gets one clarify | C1, C3 | Specified |
| F5 | Mom covers a small extra (groceries) after funding. Tab add-on, mutual accept | C1 plus tab | Specified; prototype support unverified |
| F6 | Mom covers a real new purpose (vet bill). New fixed loan, fresh agree | C1, C2 | Specified |
| F7 | John pauses for hardship. Reminders stop | C3 | Specified |
| F8 | Funding dispute freezes the loan until both resolve | C1 | Specified |
| F9 | Gift: Mom forgives or gifts part or all of a balance | Not defined | **No spec.** Decision needed |
| F10 | Gift in place of a loan: parent gives money that is not repaid | Not defined | **No spec.** Decision needed |

F9 and F10 stay as pending tests with a "needs spec" label until Ty decides how gifts work.

### Catalog D. End-to-end workflows

Each workflow is a scenario ID with steps and pass criteria.

| ID | Workflow | Data | Pass criteria |
|---|---|---|---|
| W1 | Draft, invite, mutual agree, fund | F1 with C1 | Loan reaches Funded. No reminders before Funded |
| W2 | Payment by SMS, count right away | F1, P1 | Ledger updated; confirmation to both with new balance |
| W3 | Payment by SMS, wait for lender confirm | F2 with C3, P2 | Not posted until lender confirms; then posted and confirmed |
| W4 | Partial payment then early payoff | C1, P10 then P11 | Balance correct after each; loan Paid off; congrats to borrower |
| W5 | Unparseable and unmatched SMS | P7, P8, P9 | Clear error; no ledger change |
| W6 | Ambiguous receipt | F4, P13 | Exactly one clarify; pending in the notebook if ignored |
| W7 | Late fee by policy | C2, C3, C4 | Fee applies per policy; decide-each-time asks lender once |
| W8 | Reminders at -3, due, +3 days | C1, controlled clock | Reminders at the right times; late-fee eve reminder when fee is above $0 |
| W9 | Tab add-on and new fixed loan | F5, F6 | Add-on needs mutual accept; new loan needs fresh agree |
| W10 | Pause and dispute | F7, F8 | Reminders stop on pause; dispute freezes until both resolve |
| W11 | Multi-child parent | F3 | No cross-contamination between children's ledgers |
| W12 | Gift scenarios | F9, F10 | Pending until spec |
| W13 | Anti-spam | Invite flow | OTP before invite; invite expires; amount hidden until opened |

W1 to W6 are first priority because they cover the money path in the prototype. W7 onward follow the order Ty sets.

### Loading sample data

- Fixtures: JSON files in `tests/fixtures/`.
  - `contracts.json` holds C1 to C7.
  - `payments.json` holds P1 to P15 with expected parse results.
  - `scenarios.json` holds F1 to F10 and W1 to W13, referencing contract and payment IDs.
- Seed script: `tests/seed.ts` (or `scripts/seed.ts`). It creates a fresh SQLite file, applies the schema, and inserts the data a scenario needs.
- Test database: `data/test-<scenario>.db`. The existing `.gitignore` rule `data/*.db` already keeps it out of git.
- The seed script needs the `DB_PATH` override (first red test above).
- The clock is injected so W8 can run without waiting.
- Each e2e test seeds its own database. Tests do not share state.

### Where evidence goes

| Evidence | Location | Name |
|---|---|---|
| Test run output | `artifacts/test-output/` | `YYYY-MM-DD-<suite>.txt` |
| Playwright screenshots | `artifacts/screenshots/` | `YYYY-MM-DD-<scenario-id>.png` |
| Scenario result summary | `artifacts/test-output/` | `YYYY-MM-DD-scenario-results.md`, one line per scenario ID with pass, fail, or pending |

- No secrets or real user data in artifacts.
- A scenario counts as passed only when its output file exists and is referenced from the plan or decision it supports.

## Reconciliation with UAT.md

| Topic | UAT.md says | This strategy |
|---|---|---|
| Purpose | Manual preview of the real app and mid-fi wireframes over HTTP | Unchanged. UAT stays manual |
| CI | UAT is not a CI gate. `rails-gate` owns lint, test, verify | Automated tests (unit, integration, e2e) are what `rails-gate` runs. `uat-serve.sh` is not added to the gate |
| Ports | Wireframes :12000, app :12001 | E2E runs against the app on `PORT_APP`, default 12001. Wireframes at :12000 are the visual spec for scenarios. They are not tested |
| App start | `package.json` `dev` script or `UAT_APP_CMD` | `dev` currently fixes port 3456, so the app does not come up on 12001 by default. Fix with the port red test |
| Script | `scripts/uat-serve.sh` | Missing from this repo. Needs the rails graft, which the PocketChange bot sequences and Ty approves |
| Logs | `.uat/` (gitignored) | `.uat/` is not in this repo's `.gitignore` yet. Add it with the graft. Test evidence goes to `artifacts/test-output/`, not `.uat/` |
| Before "done" | Run UAT before claiming product work done | Add: tests green and artifacts saved, then UAT on :12001 |

## Roles

- PocketChange Launch: owns this strategy and the scenario catalog. Reports pass, fail and pending counts.
- PocketChange bot: owns the UAT plan and the rails graft that brings `uat-serve.sh`.
- OpenCode: writes tests first, then code. Runs the gate.
- Ty: approves the plan, decides open questions, and does UAT acceptance.

## Decisions needed from Ty

1. How do gifts work (F9, F10)? Options: a forgiven balance on an existing loan, a standalone gift record, or out of MVP.
2. How should a duplicate forwarded receipt behave (P12)? Options: reject, or ask once.
3. Where do production tests and fixtures live? Options: `production/tests/` with a copy, or one shared `tests/fixtures/`.
4. Approve Vitest and Playwright?
5. Priority order after W1 to W6.

## Recommended next actions

| What | Owner | When |
|---|---|---|
| Approve or edit this plan | Ty | Before any code change |
| Produce a gap list: which `MVP-USE-CASES.md` states the prototype implements | PocketChange Launch | After approval |
| Add test tooling and the first three red tests | OpenCode | After approval |
| Plan the rails graft that brings `uat-serve.sh` | PocketChange bot | After approval |
