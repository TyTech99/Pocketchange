# Open questions

Tracked, not decided. Each item is open as of 2026-10-14.

Sources: `tdd-and-e2e-strategy.md` (strategy draft) and `e2e-sample-data.md` (sample data draft). Both are proposals and are not in this repo yet. "Requirements" means `MVP-USE-CASES.md`, `MVP-SCREENS.md`, and `MVP-API.md`.

## A. Late-payment workflow assumptions

| # | Question | Status | Date | Source |
|---|---|---|---|---|
| A1 | Does late begin the day after the due date? | Open | 2026-10-14 | Sample data draft, Part 1 assumptions |
| A2 | Does a "right away" fee post on that first late day (D+1)? | Open | 2026-10-14 | Sample data draft, Part 1 assumptions |
| A3 | Does a grace-period fee post on day D+N? | Open | 2026-10-14 | Sample data draft, Part 1 assumptions |
| A4 | Is the fee added to the amount owed, once per missed payment? | Open | 2026-10-14 | Sample data draft, Part 1 assumptions |
| A5 | Does only the borrower get the three reminders? | Open | 2026-10-14 | Sample data draft, Part 1 assumptions |
| A6 | Are reminders checked once a day, and at what time of day? | Open | 2026-10-14 | Sample data draft, Part 1 assumptions |
| A7 | Is the lender's "skip" under "decide each time" the Got it or Not yet button? | Open | 2026-10-14 | Sample data draft, Part 1 assumptions |

## B. Test plan decisions

| # | Question | Status | Date | Source |
|---|---|---|---|---|
| B1 | Does the late-fee eve reminder join the late-payment workflow or the next one? | Open | 2026-10-14 | Sample data draft, decision 2 |
| B2 | Stored or computed checkpoints? | Open | 2026-10-14 | Sample data draft, decision 3 |
| B3 | Are B1, B2 and T1 the starting contracts? | Open | 2026-10-14 | Sample data draft, decision 4 |
| B4 | Is Vitest and Playwright approved? | Open | 2026-10-14 | Strategy draft, decision 4 |
| B5 | Where do production tests and fixtures live? | Open | 2026-10-14 | Strategy draft, decision 3 |
| B6 | What is the workflow priority order after W1 to W6? | Open | 2026-10-14 | Strategy draft, decision 5 |
| B7 | How should a duplicate forwarded receipt behave? | Open | 2026-10-14 | Strategy draft, decision 2 |
| B8 | How do gifts work: forgiven balance, standalone record, or out of MVP? | Open | 2026-10-14 | Strategy draft, decision 1 |

## C. Requirements silences

The requirements do not say what happens in these cases.

| # | Question | Status | Date | Source |
|---|---|---|---|---|
| C1 | Default: what is it, and what happens after the +3 day reminder? | Open | 2026-10-14 | Requirements review |
| C2 | Disputed balance or wrong payment after funding | Open | 2026-10-14 | Requirements review |
| C3 | Ledger corrections: undo, reverse, edit, bounced payment | Open | 2026-10-14 | Requirements review |
| C4 | Lender silence: not marking funded, not confirming a receipt | Open | 2026-10-14 | Requirements review |
| C5 | Pause: lender approval, duration, resume, missed payments | Open | 2026-10-14 | Requirements review |
| C6 | Partial payment: on-time status, and fee-versus-principal order | Open | 2026-10-14 | Requirements review |
| C7 | Late fee caps and limits | Open | 2026-10-14 | Requirements review |
| C8 | Overpay when no tab exists | Open | 2026-10-14 | Requirements review |
| C9 | Paid-off disagreement | Open | 2026-10-14 | Requirements review |
| C10 | Cancel after funding | Open | 2026-10-14 | Requirements review |
| C11 | Tab add-on decline | Open | 2026-10-14 | Requirements review |
| C12 | Receipts from an unknown channel | Open | 2026-10-14 | Requirements review |
| C13 | Clarify expiry time | Open | 2026-10-14 | Requirements review |
| C14 | Life events: death, incapacity, a party leaving, refinancing, write-off | Open | 2026-10-14 | Requirements review |

## Rules

- An item moves to a decision record in this folder only when Ty decides it.
- Closed items keep their row, with the decision date and a link to the record.
