# Auth contract (A1)

Date: 2026-11-05
Decided by: Ty (product, 2026-10-27); agents (tech, D-A1 to D-A5)
Status: Decided
Source of truth: GitHub, `TyTech99/Pocketchange`.
Closes task A1 in `docs/plans/2026-10-14-auth-first-task-list.md`.
Replaces: nothing. This is the first auth decision record.

## Ty's product decision (verbatim, 2026-10-27)

> "The product should require an OTP challenge for either the email or the SMS. Once that satisfied, they must select a first and last name. This is true for all participants, the lender and the borrower."

## Assumptions (from the auth-first task list)

1. Sign-in is a six-digit one-time code sent to the user's choice of email address or phone number (SMS). The identity is the verified email address or phone number.
2. After the first successful code, the user must enter a first and last name. Until both are saved, every operation except the name form and sign out is refused.
3. Rules 1 and 2 apply to all participants: the lender, the borrower, the drafter and the invite recipient.
4. Code rules: six digits, expires in 10 minutes, single use, five wrong tries, 60 seconds between resends.
5. Session is a signed, HTTP-only cookie.
6. Public pages stay public: `/`, `/wireframes/`, `/login`, and `/verify`. Everything under `/demo/` is gated.

## Facts

- The app has no auth today. Prototype routes under `/demo/` are public on preprod (`pocketchange.afterthedemo.com`).
- Storage is `node:sqlite` (`docs/decisions/2026-10-14-node-sqlite.md`).
- Email delivery for the MVP is Hostinger SMTP (`docs/plans/2026-10-22-email-setup.md`). Env names: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`.
- SMS delivery for the MVP is Twilio (`docs/plans/2026-10-18-twilio-setup.md`). Env names: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_API_KEY_SID`, `TWILIO_API_KEY_SECRET`, `TWILIO_FROM_NUMBER`.
- The 2026-11-05 ledger decision ties party signing keys to the verified OTP sign-in identity (`docs/decisions/2026-11-05-ledger-event-log.md`).
- No secrets belong in git or chat. Env var names only.

## Tech decisions (agents, per Ty's 2026-10-24 rule that agents own tech)

| # | Decision |
|---|---|
| D-A1 | `POST /demo/api/sms` stays a Twilio webhook. It authenticates with Twilio's `X-Twilio-Signature` and `TWILIO_AUTH_TOKEN`. It never carries a user session. The web simulator uses a verified user session. |
| D-A2 | One sender interface `send(channel, address, code)` with `channel` of `email` or `sms`. Email uses Hostinger SMTP. SMS uses Twilio. Tests swap in an in-memory outbox with no app-code change. |
| D-A3 | Who verifies: every participant (lender and borrower), per Ty's quote above and the plan of record. After the code, each person enters their own first and last name before any other operation. |
| D-A4 | Code rules match assumption 4: six-digit code, hash stored at rest (never the clear code), ~10 minute expiry, single use, five wrong tries then lock that code, 60 seconds between resends. Session: signed `httpOnly` `Secure` cookie (name chosen at implement time). |
| D-A5 | Test hook: `GET /api/test/last-code?to=...` returns the latest outbox code for that address only when an explicit test-mode env var is set (for example `APP_ENV=test`). Otherwise 404. The app refuses to start if that test mode is on together with `NODE_ENV=production`. A scenario proves 404 when the flag is off. |

## Related

- Build order: A2 through A8 in `docs/plans/2026-10-14-auth-first-task-list.md`.
- Ledger signing identity: `docs/decisions/2026-11-05-ledger-event-log.md`.
