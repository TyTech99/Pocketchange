# Auth-first task list

Status: **proposed**. Needs Ty's approval. Nothing here is built.
Owner: PocketChange Launch (task list). PocketChange bot aligns repo layout and UAT. OpenCode writes the tests and code.
Date: 2026-10-14

## Summary

- Auth is task 1. No loan, SMS, or list operation exists without it.
- The flow: the user gives an email, gets a six-digit code, and must verify before any operation.
- Tests can read the code without real delivery. The recommended hook is a test-only outbox endpoint, off by default.
- After auth comes the existing e2e spine: test harness, sample data, then the late-payment workflow.

## Facts (verified in repo at 6232357)

- The app has no auth. Every route is open. The prototype routes live under `/demo/` (`src/routes/demo/`): `/demo/create`, `/demo/loans`, `/demo/loan/[id]`, `/demo/sms`, `/demo/oauth-agent`, `POST /demo/api/sms`, `GET|POST /demo/api/loans`.
- Root `/` is a Hello World placeholder. `src/hooks.server.ts` is an empty placeholder.
- The preprod site `pocketchange.afterthedemo.com` is public, so these routes are public today.
- The tables are `loans`, `participants`, `payments`, `confirmations` (`src/lib/demo/db.ts`, via `node:sqlite`). There is no user, code, or session table.
- `POST /demo/api/sms` is written as a Twilio webhook. Twilio cannot send a login session with it.
- `docs/product/MVP-USE-CASES.md` and `docs/product/MVP-SCREENS.md` already specify a drafter OTP before invites, a "Verify it's you" screen, and magic links. None of it is built.

## Assumptions (need Ty's confirmation)

1. The code is delivered by email. The identity is the email address.
2. Session is a signed, HTTP-only cookie.
3. Public pages stay public: `/`, `/wireframes/`, `/login`, and `/verify`. Everything under `/demo/` is gated.
4. Defaults for the code rules: six digits, expires in 10 minutes, single use, five wrong tries, 60 seconds between resends.

## Task list

### Phase 0. Auth first

| # | Task | Done when | Owner |
|---|---|---|---|
| A1 | Confirm the auth contract: assumptions 1 to 4 above, plus the Twilio webhook rule in D-A1 below. | Ty approves it in `docs/decisions/`. | Ty, then PocketChange bot |
| A2 | Write the auth e2e scenarios as failing tests first. See the scenarios below. | Every scenario exists and fails for the right reason. | OpenCode |
| A3 | Data model: `users`, `login_codes` (store a hash, never the code), `sessions`. | Migration runs on a throwaway database. | OpenCode |
| A4 | Code delivery behind one interface: `send(email, code)`. Real provider in production, in-memory outbox in test mode. | Tests swap the sender without changing app code. | OpenCode |
| A5 | Test hook. See the section below. | Tests get the code with no real delivery. The hook is provably off in production. | OpenCode |
| A6 | Gate every operation behind a verified session. Pages redirect to `/login`. API routes return 401. Today this covers the `/demo/*` routes. Production routes follow the same rule when they exist. | Scenarios A2 pass. | OpenCode |
| A7 | Run the auth scenarios on the preprod site with test mode off. | An unverified request is rejected on the live site. | PocketChange Launch |

### Phase 1. The existing e2e spine

| # | Task | Source | Owner |
|---|---|---|---|
| E1 | Harness prerequisites: database path and app port from environment, a `test` script, the Vitest and Playwright decision. | `2026-10-14-tdd-and-e2e-strategy.md`, decisions B4 and B5 | OpenCode |
| E2 | Fixtures and seed script. Fixtures now include verified users and sessions. | `2026-10-14-e2e-sample-data.md`, Part 2 | OpenCode |
| E3 | Late-payment workflow W1, run by a verified user. | `2026-10-14-e2e-sample-data.md`, Part 1 | OpenCode |
| E4 | Remaining workflows after W1, in the priority order Ty sets. | Decision B6 | OpenCode |
| E5 | UAT run and evidence in `artifacts/test-output/`. | `2026-10-14-tdd-and-e2e-strategy.md` | PocketChange Launch |

## Auth e2e scenarios (task A2)

1. Unverified: create loan, view loans, view one loan, simulator, and `POST /demo/api/sms` are all rejected. Pages redirect, API returns 401.
2. Happy path: enter email, get code, enter code, then create a loan and view it.
3. Wrong code: rejected. The fifth wrong try locks that code.
4. Expired code: rejected after 10 minutes. The test moves the clock, it does not wait.
5. Reused code: rejected the second time.
6. Resend inside 60 seconds: rejected.
7. A session for email A cannot see loans that belong to email B.
8. Sign out ends the session.

## Test hook (task A5)

Recommendation: a test-only outbox endpoint, `GET /api/test/last-code?email=...`.

- In test mode the email sender writes into an in-memory outbox instead of sending.
- The endpoint returns the latest code for that email from the outbox.
- It exists only when `APP_ENV=test`. Otherwise it returns 404.
- The app refuses to start if `APP_ENV=test` and `NODE_ENV=production`.
- A scenario proves the endpoint returns 404 when the flag is off.

Why this and not a fixed code like `000000`: the outbox keeps the real code path under test, including expiry, reuse, and wrong-code limits. A fixed code skips most of that and is dangerous if it ever ships on.

Fallback: a fixed code in test mode. Same safety rules apply.

## Decisions needed from Ty

| # | Decision | Recommendation | Owner |
|---|---|---|---|
| D-A1 | `POST /demo/api/sms` is a Twilio webhook and cannot carry a session. Does it authenticate with Twilio's request signature instead? | Yes. A verified user session covers the web simulator. A signature check covers the webhook. | Ty |
| D-A2 | Which service sends the codes? None is chosen. | Pick one before A4. The sender interface keeps this swappable. | Ty |
| D-A3 | Do borrowers and other participants (identified by phone today) also verify, or only the lender who creates the loan? | Start with the lender and any signed-in user. Borrower verification is a later task. | Ty |
| D-A4 | Approve the code rules in assumption 4. | Approve as written. | Ty |
| D-A5 | Approve the test hook. | The outbox endpoint. | Ty |

## Risks

- The public prototype routes stay open until A6 ships. Gate them first, before real data.
- A test hook left on in production exposes every login code. The startup refusal and the 404 scenario are the guards.
- Email delivery can fail or land in spam. This is untested because no provider is chosen.

## Next step

Ty answers D-A1 to D-A5. PocketChange bot then records the decision and OpenCode starts A2.
