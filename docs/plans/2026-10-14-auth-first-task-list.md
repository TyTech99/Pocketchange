# Auth-first task list

Status: **proposed**. Nothing here is built.
Owner: PocketChange Launch (task list). PocketChange bot aligns repo layout and UAT. OpenCode writes the tests and code.
Date: 2026-10-14. Updated 2026-10-27 with Ty's product decision on sign-in and names.

## Summary

- Auth is task 1. No loan, SMS, or list operation exists without it.
- The flow: the user picks email or phone, gets a six-digit one-time code there, and enters it. After the first successful code, the user must enter a first and last name before any other operation.
- This applies to every participant, lenders and borrowers alike.
- Tests can read the code without real delivery through a test-only outbox endpoint, off by default.
- After auth comes the existing e2e spine: test harness, sample data, then the late-payment workflow.

## Facts (verified in repo at 49d8541)

- The app has no auth. Every route is open. The prototype routes live under `/demo/` (`src/routes/demo/`): `/demo/create`, `/demo/loans`, `/demo/loan/[id]`, `/demo/sms`, `/demo/oauth-agent`, `POST /demo/api/sms`, `GET|POST /demo/api/loans`.
- Root `/` is a Hello World placeholder. `src/hooks.server.ts` is an empty placeholder.
- The preprod site `pocketchange.afterthedemo.com` is public, so these routes are public today.
- The tables are `loans`, `participants`, `payments`, `confirmations` (`src/lib/demo/db.ts`, via `node:sqlite`). There is no user, code, or session table.
- `POST /demo/api/sms` is written as a Twilio webhook. Twilio cannot send a login session with it.
- The plan of record already requires a one-time code for both parties:
  - Drafter: phone (and email) code before sending an invite (`docs/product/MVP-USE-CASES.md:89`, `docs/product/MVP-SCREENS.md:110` and `:180`).
  - Recipient: "Continue → light OTP → full terms" before agreeing (`docs/product/MVP-USE-CASES.md:30`, `docs/product/MVP-SCREENS.md:220`, `static/wireframes/invite.html`, `static/wireframes/otp.html`).
  - The code channel is SMS first, with email allowed ("Use email instead" in `static/wireframes/otp.html`).
- Today only the drafter types a display name, and it is the other party's name (Propose step 2a, `docs/product/MVP-SCREENS.md:105`). No participant enters their own name. None of this is built.

## Product decision (Ty, 2026-10-27)

> "The product should require an OTP challenge for either the email or the SMS. Once that satisfied, they must select a first and last name. This is true for all participants, the lender and the borrower."

The code requirement for both parties matches the specs above. The new part is the name step: after the code, every participant enters their own first and last name.

## Assumptions

1. Sign-in is a six-digit one-time code sent to the user's choice of email address or phone number (SMS). The identity is the verified email address or phone number.
2. After the first successful code, the user must enter a first and last name. Until both are saved, every operation except the name form and sign out is refused.
3. Rules 1 and 2 apply to all participants: the lender, the borrower, the drafter and the invite recipient.
4. Code rules: six digits, expires in 10 minutes, single use, five wrong tries, 60 seconds between resends.
5. Session is a signed, HTTP-only cookie.
6. Public pages stay public: `/`, `/wireframes/`, `/login`, and `/verify`. Everything under `/demo/` is gated.

## Task list

### Phase 0. Auth first

| # | Task | Done when | Owner |
|---|---|---|---|
| A1 | Record the auth contract: assumptions 1 to 6, Ty's 2026-10-27 decision, and decisions D-A1 to D-A5 below. | The decision record is in `docs/decisions/`. | PocketChange bot |
| A2 | Write the auth e2e scenarios as failing tests first. See the scenarios below. | Every scenario exists and fails for the right reason. | OpenCode |
| A3 | Data model: `users` (verified email or phone, first name, last name), `login_codes` (channel, address, a hash of the code, never the code), `sessions`. | Migration runs on a throwaway database. | OpenCode |
| A4 | Code delivery behind one interface: `send(channel, address, code)`, where channel is `email` or `sms`. Hostinger SMTP for email, Twilio for SMS, in-memory outbox in test mode. | Tests swap the sender without changing app code. | OpenCode |
| A5 | Test hook. See the section below. | Tests get the code with no real delivery. The hook is provably off in production. | OpenCode |
| A6 | Name step: after the first successful code, require first and last name before any other operation. Both fields are required and trimmed. | Scenarios for the name step pass. | OpenCode |
| A7 | Gate every operation behind a verified session with a saved name. Pages redirect to `/login`, or to the name form when the name is missing. API routes return 401, or 403 when the name is missing. Today this covers the `/demo/*` routes. Production routes follow the same rule when they exist. | Scenarios A2 pass. | OpenCode |
| A8 | Run the auth scenarios on the preprod site with test mode off. | An unverified request is rejected on the live site. | PocketChange Launch |

### Phase 1. The existing e2e spine

| # | Task | Source | Owner |
|---|---|---|---|
| E1 | Harness prerequisites: database path and app port from environment, a `test` script, the Vitest and Playwright decision. | `2026-10-14-tdd-and-e2e-strategy.md`, decisions B4 and B5 | OpenCode |
| E2 | Fixtures and seed script. Fixtures now include verified, named users and sessions for both lender and borrower. | `2026-10-14-e2e-sample-data.md`, Part 2 | OpenCode |
| E3 | Late-payment workflow W1, run by verified, named users. | `2026-10-14-e2e-sample-data.md`, Part 1 | OpenCode |
| E4 | Remaining workflows after W1, in the priority order Ty sets. | Decision B6 | OpenCode |
| E5 | UAT run and evidence in `artifacts/test-output/`. | `2026-10-14-tdd-and-e2e-strategy.md` | PocketChange Launch |

## Auth e2e scenarios (task A2)

1. Unverified: create loan, view loans, view one loan, simulator, and `POST /demo/api/sms` without a valid Twilio signature are all rejected. Pages redirect, API returns 401.
2. Happy path by email: enter email, get code, enter code, enter first and last name, then create a loan and view it.
3. Happy path by SMS: enter phone number, get code, enter code, enter first and last name, then create a loan and view it.
4. Name required: after a correct code, every operation except the name form and sign out is refused until both names are saved. A blank first or last name is rejected.
5. Borrower: an invite recipient taps Continue, verifies by code, enters their own first and last name, then sees the full terms and can agree.
6. Wrong code: rejected. The fifth wrong try locks that code.
7. Expired code: rejected after 10 minutes. The test moves the clock, it does not wait.
8. Reused code: rejected the second time.
9. Resend inside 60 seconds: rejected.
10. A session for user A cannot see loans that belong to user B.
11. Sign out ends the session.

## Test hook (task A5)

Decision: a test-only outbox endpoint, `GET /api/test/last-code?to=...`, where `to` is the email address or phone number.

- In test mode both senders write into an in-memory outbox instead of sending.
- The endpoint returns the latest code for that address from the outbox.
- It exists only when `APP_ENV=test`. Otherwise it returns 404.
- The app refuses to start if `APP_ENV=test` and `NODE_ENV=production`.
- A scenario proves the endpoint returns 404 when the flag is off.

Why this and not a fixed code like `000000`: the outbox keeps the real code path under test, including expiry, reuse, and wrong-code limits. A fixed code skips most of that and is dangerous if it ever ships on.

## Decisions

| # | Decision | Status |
|---|---|---|
| D-A1 | `POST /demo/api/sms` is a Twilio webhook and cannot carry a session. It authenticates by verifying Twilio's `X-Twilio-Signature` header with the Auth Token, per the Twilio setup doc (PR #10). A verified user session covers the web simulator. | Decided (agent, 2026-10-27) |
| D-A2 | Code sender: email through Hostinger SMTP (PR #11) and SMS through Twilio (PR #10), behind the swappable sender interface in A4. | Decided (agent, 2026-10-27) |
| D-A3 | Who verifies: all participants, lender and borrower. The code requirement for both parties is already in the plan of record (drafter: `MVP-USE-CASES.md:89`, `MVP-SCREENS.md:110` and `:180`; recipient: `MVP-USE-CASES.md:30`, `MVP-SCREENS.md:220`, `static/wireframes/invite.html`, `static/wireframes/otp.html`), so those specs resolve it. Ty added on 2026-10-27: the code goes to the user's choice of email or SMS, and after it every participant enters their own first and last name before any other operation. | Decided by Ty, 2026-10-27 |
| D-A4 | Code rules as written in assumption 4. | Decided (agent, 2026-10-27) |
| D-A5 | Test hook: the outbox endpoint, test-only, as described above. | Decided (agent, 2026-10-27) |

## Risks

- The public prototype routes stay open until A7 ships. Gate them first, before real data.
- A test hook left on in production exposes every login code. The startup refusal and the 404 scenario are the guards.
- Email codes can land in spam, and SMS codes depend on Twilio carrier registration. Both are untested until the providers are set up per PR #10 and PR #11.

## Next step

PocketChange bot records the decisions above in `docs/decisions/` (A1). OpenCode then starts A2.
