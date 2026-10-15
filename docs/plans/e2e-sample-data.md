# E2E sample data and the late-payment workflow

Status: **proposed**. Needs Ty's approval.
Owner: PocketChange Launch (data and workflow definition). OpenCode writes tests, seed script and code.
Date: 2026-10-14
Narrows: the proposed `docs/plans/tdd-and-e2e-strategy.md` (not yet in the repo). This plan covers only the first workflow and the data spine. The larger catalog in that document waits.

## Summary

- The first workflow is a late payment on a basic parent-child loan. It checks three reminders and the late fee.
- Tests are verification-class: one clear happy path per late-fee policy. No edge cases, no disputes.
- Good sample data is the goal. A seed script loads fixed JSON fixtures into a throwaway database.
- A checkpoint lets a test jump to the midpoint of a loan in one step, without running the full cycle.
- The prototype cannot run this workflow today. It stores no schedule, due dates, late policy, reminders or loan status. The first tests will fail, and that is expected.

## Facts (verified in repo at 4776670)

- Database tables: `loans` (title, principal, notes), `participants` (name, phone, role), `payments`, `confirmations` (`src/lib/demo/db.ts`).
- There is no column for fee, schedule, due date, late policy, receipt trust, or loan status.
- `confirmations` stores payment confirmation texts only. No table stores reminders or other outbound messages.
- No scheduler or clock exists in the code.
- Known gap 1: the dev server port is fixed at 3456 in `package.json`. `UAT.md` expects the app on :12001.
- Known gap 2: the database path is fixed at `data/loans.db` (`src/lib/demo/db.ts`, line 5). A test cannot point the app at another file.
- Both gaps are recorded here and are **not fixed in this plan**. They block running the seeded database under the app. Fixing them is a later change.
- `.gitignore` already ignores `data/*.db` and `data/*.db-*`, so throwaway databases stay out of git.
- Requirement sources: `MVP-USE-CASES.md` ("Reminders & late", "Repayment", "Lifecycle"), `MVP-SCREENS.md` §2d and §8.

## Terminology

- **Running tab** is the name used in the docs for revolving credit. This plan uses "running tab".
- **Basic loan** is the docs' fixed-purpose loan.
- **Lender** is the parent. **Borrower** is the child.

## Part 1. Workflow: late payment

### Scenario

Mom lends John a basic loan. They both agreed and Mom marked it funded. John pays the first three installments. He misses the fourth. Nothing else happens.

The test starts from the **midpoint checkpoint** (below), so it does not replay the first three payments.

### Dates (example data)

| Name | Date | Weekday |
|---|---|---|
| Payment 4 due date (D) | 2027-01-15 | Friday |
| D minus 3 days | 2027-01-12 | Tuesday |
| D plus 1 day | 2027-01-16 | Saturday |
| D plus 3 days | 2027-01-18 | Monday |
| D plus 5 days | 2027-01-20 | Wednesday |

The test clock is set to each date in turn. Real time never matters.

### Contract and policy variants

All variants use contract B1 (below): $600, six payments of $100, monthly on the 15th. Only the late policy changes. Fee amounts are example fixtures.

| Case | Late fee | Timing | Plain expectation |
|---|---|---|---|
| L1 | $0 | none | No fee, ever |
| L2 | $15 | Right away | Fee posts when the payment is late |
| L3 | $25 | After a 5-day grace period | Fee posts after the grace period, not before |
| L4 | Custom $20 | Right away | Same as L2 with $20 |
| L5 | $15 | Decide each time, lender adds | Fee posts only after the lender adds it |
| L6 | $15 | Decide each time, lender skips | No fee posts |

### Pass criteria

For every case, John pays nothing for payment 4. Mom and John phone numbers are fake.

**Reminders (all cases)**
1. On D minus 3 days, one reminder to the borrower says payment 4 is due on D for $100.
2. On D, one reminder to the borrower says payment 4 is due.
3. On D plus 3 days, one reminder to the borrower says payment 4 is overdue.
4. No other reminder for payment 4 is sent in the window checked. Total: three.
5. Each reminder is one short text with an optional link. It contains no terms and asks no question.

**Balance (all cases)**
6. Between D minus 3 days and D plus 3 days, no payment is recorded. The amount owed on payment 4 stays $100 until a fee posts.

**Late fee, by case**
7. L1: no fee entry exists on D plus 5 days. The amount owed is $100.
8. L2: no fee entry on D. One $15 fee entry appears by D plus 1 day. It stays one entry through D plus 5 days. The amount owed is $115.
9. L3: no fee entry on D plus 3 days. One $25 fee entry appears on D plus 5 days. The amount owed is $125.
10. L4: same as L2, with $20. The amount owed is $120.
11. L5: no fee posts by itself. The lender gets one handoff link to decide. After the lender adds the fee, one $15 fee entry exists and the amount owed is $115.
12. L6: the lender gets the same one handoff link. After the lender skips, no fee entry exists and the amount owed stays $100.
13. In every case with a fee, the fee entry is visible in the ledger on the loan page.

The workflow passes when all of criteria 1 to 13 that apply to the case pass.

### Assumptions (need Ty's confirmation)

The requirements do not say these things. The criteria above rely on them.

- Late begins the day after the due date.
- "Right away" posts the fee on that first late day (D plus 1).
- "After a grace period of N days" posts the fee on day D plus N (D plus 5 here).
- The fee is added to the amount owed, and applies once per missed payment.
- Only the borrower receives the three reminders. The docs do not name a recipient for them.
- Reminders are checked once per day. The docs give no time of day.
- For "Decide each time", the lender's skip action is the "Got it" or "Not yet" button. The docs name the buttons but not what each does.

### Not in this workflow

- The late-fee eve reminder (a separate reminder in the docs). Proposed for the next workflow.
- Late payment followed by a payment, partial payment, early payoff, pause, dispute, cancel.
- Reminders sent twice, retries, delivery failures.
- Other schedules (weekly, twice a month) and installment-rate loans.
- Running tab late behavior. The docs do not specify it.

## Part 2. Sample data spine

### Contracts (example data)

| ID | Kind | Terms |
|---|---|---|
| B1 | Basic loan | Mom lends John $600. No fee. Six payments of $100. Monthly on the 15th. Count receipts as paid right away |
| B2 | Basic loan with flat fee | Mom lends John $1,000. Flat fee $50. Ten payments of $105. Monthly on the 15th. Count receipts as paid right away |
| T1 | Running tab | Mom and John, one active tab. Opens at $0. First charge $200 (vet). Fixed payment $50. A $40 add-on (groceries) is accepted later |

- Late policy is a fixture field. The late-payment workflow overrides it per case (L1 to L6).
- B1 is the main contract. B2 and T1 are defined now so the spine is stable, and used when their workflows are written.
- Contract terms use the product's own words and fields from `MVP-USE-CASES.md`.

### Payments (example data)

Texts match shapes the prototype parser already handles (`src/lib/demo/parsePaymentSms.ts`). All are fake.

| ID | Text | Amount |
|---|---|---|
| S1 | "You received $100.00 from John Smith via PayPal" | $100 |
| S2 | "John S sent you $100.00 with Zelle" | $100 |
| S3 | "You received $105.00 from John Smith via PayPal" | $105 |
| S4 | "You received $50.00 from John Smith via PayPal" | $50 |

- S1 and S2 are on-time installments for B1. S3 is an installment for B2. S4 is a payment on T1.
- Phones: Mom `+1-555-0101`, John `+1-555-0102`, in the reserved fictional range.
- No real receipts and no secrets.

### Checkpoints

A checkpoint is a stored loan state at a named point in the cycle.

| Contract | Checkpoint | State |
|---|---|---|
| B1 | `funded` | Funded on 2026-09-20. No payments. Clock 2026-09-20 |
| B1 | `mid` | Payments 1 to 3 recorded (due 2026-10-15, 2026-11-15, 2026-12-15, each $100, paid on the due date). Amount owed: $300 left. Next due 2027-01-15. Clock 2026-12-20 |
| B2 | `mid` | Payments 1 to 5 recorded. Amount owed: $525 left. Clock set the day after payment 5 |
| T1 | `mid` | Tab open. Charges $200 and $40, one $50 payment. Balance $190 |

Rules:
- **Checkpoints are stored explicitly in JSON.** They are not computed. A seeded state never depends on the code under test.
- Each checkpoint includes its past reminders, so the state is consistent.
- IDs and timestamps are fixed. There is no randomness, no real clock, and no network.

### Fixture layout (proposed)

```text
tests/
  fixtures/
    contracts.json          B1, B2, T1
    payments.json           S1 to S4
    checkpoints/
      B1.funded.json
      B1.mid.json
      B2.mid.json
      T1.mid.json
    scenarios/
      late-payment.json     cases L1 to L6, dates, expected results
  seed/
    seed.ts                 seed script
```

Example contract entry (example data):

```json
{
  "id": "B1",
  "kind": "basic-loan",
  "title": "Boat",
  "lender": { "name": "Mom", "phone": "+15550101" },
  "borrower": { "name": "John", "phone": "+15550102" },
  "principalCents": 60000,
  "feeCents": 0,
  "schedule": { "frequency": "monthly", "dayOfMonth": 15 },
  "dueDates": ["2026-10-15", "2026-11-15", "2026-12-15", "2027-01-15", "2027-02-15", "2027-03-15"],
  "installmentCents": 10000,
  "receiptTrust": "count-right-away",
  "latePolicy": { "feeCents": 1500, "timing": "right-away" }
}
```

- Due dates are written out in the fixture. The seed does not run schedule math.

### Seed script

- Command: `seed --contract B1 --checkpoint mid --db data/test-late-payment-L2.db`.
- The same code is also importable, so a test calls it directly.
- It creates a fresh SQLite file, applies the schema, and inserts the checkpoint rows. It deletes any older file with the same name first.
- It sets the test clock to the checkpoint date.
- It applies a policy override when a scenario case asks for one (L1 to L6).
- Each test seeds its own database. Tests share nothing.
- Output is deterministic: the same command produces the same database every time.

### Checkpoint trust test

- One replay test per contract. It starts from the `funded` checkpoint, steps the clock, applies the sample payments, and compares the result to the stored `mid` checkpoint.
- If they differ, the fixture or the code has drifted.
- This is the only test that runs the full cycle. All other tests jump straight to a checkpoint.

### Prototype gaps for this workflow

- Schema needs: contract terms, due dates, late policy, loan status, fee entries, and an outbound message log.
- Code needs: an injected clock, a daily task runner that sends reminders and posts fees, and a message transport the test can read.
- Known gaps 1 and 2 above. They are noted and not fixed here.
- The first red tests come from these gaps. OpenCode closes them one at a time, tests first.

## Evidence

| Evidence | Location | Name |
|---|---|---|
| Late-payment run output | `artifacts/test-output/` | `YYYY-MM-DD-late-payment.txt` |
| One line per case, pass or fail | `artifacts/test-output/` | `YYYY-MM-DD-late-payment-results.md` |
| Optional: ledger with fee | `artifacts/screenshots/` | `YYYY-MM-DD-late-payment-L2-ledger.png` |

- No secrets or real data.
- A case counts as passed only when its output exists.

## Decisions needed from Ty

1. Confirm or correct the seven assumptions under Part 1.
2. Does the late-fee eve reminder join this workflow or the next? Recommendation: the next.
3. Approve explicit stored checkpoints over computed ones? Recommendation: stored, plus the one trust test.
4. Approve B1, B2 and T1 as the starting contracts?

## Recommended next actions

| What | Owner | When |
|---|---|---|
| Answer decisions 1 to 4 | Ty | Before any code |
| Write the first red test: late-payment case L2 against the `mid` checkpoint | OpenCode | After approval |
| Write the fixtures and seed script | OpenCode | After approval |
| Plan the fix for the port and database-path gaps | PocketChange bot | Before the seeded database must run under the app |
