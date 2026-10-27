# Feature map

What exists on `main` today, where it lives, and how to prove it. The demo rows are reference material, not the architecture (`docs/decisions/D6-source-of-truth.md`).

Dev server: `npm run dev` serves `http://127.0.0.1:3456`. "Gate" means the `verify` job in `.github/workflows/rails-gate.yml`, which builds the app. It checks no behavior.

| Feature | Where | How to verify |
|---------|-------|---------------|
| Home placeholder at `/` (Hello World) | `src/routes/+page.svelte`, `src/routes/+layout.svelte` | Automated: none yet (gate only builds). Manual: `npm run dev`, then `curl -s http://127.0.0.1:3456/` contains `Hello, ` and `world.` |
| Static wireframes at `/wireframes/` (design reference) | `static/wireframes/` (start at `map.html`) | Automated: none yet. Manual: `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3456/wireframes/map.html` prints `200`. Note: in dev, `/wireframes/` alone returns 404; use a file name. |
| Demo entry redirect: `/demo/` goes to `/demo/loans`, `/demo/olaf` goes to `/demo/oauth-agent` | `src/routes/demo/+page.server.ts`, `src/routes/demo/olaf/+page.server.ts` | none yet. Manual: `curl -s -o /dev/null -w '%{http_code} %{redirect_url}' http://127.0.0.1:3456/demo` prints `307 http://127.0.0.1:3456/demo/loans` |
| Demo loan list, create loan, loan detail with ledger and confirmations | `src/routes/demo/loans/`, `src/routes/demo/create/`, `src/routes/demo/loan/[id]/`, `src/routes/demo/+layout.svelte` | none yet. Manual: open `/demo/loans`, create a loan at `/demo/create`, open it from the list |
| Demo SMS simulator at `/demo/sms` | `src/routes/demo/sms/` | none yet. Manual: open `/demo/sms`, send a fake payment text, check the balance on the loan page |
| Demo OAuth agent walkthrough at `/demo/oauth-agent` | `src/routes/demo/oauth-agent/+page.svelte` | none yet. Manual: `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3456/demo/oauth-agent` prints `200` |
| Demo JSON loans API: `GET` and `POST /demo/api/loans` | `src/routes/demo/api/loans/+server.ts` | none yet. Manual: `curl -s http://127.0.0.1:3456/demo/api/loans` returns `{"loans":[...]}` |
| Inbound SMS webhook `POST /demo/api/sms` (Twilio-style form or JSON) | `src/routes/demo/api/sms/+server.ts`, `src/lib/demo/processInboundSms.ts` | none yet. Manual: create a loan with `POST /demo/api/loans`, then `POST /demo/api/sms?format=json` with `From` and `Body`; expect `"ok":true` and a `balance_remaining_cents` |
| Payment SMS parsing (PayPal, Zelle, Venmo, Cash App): amount in cents, sender hint, provider, confidence. Reference for the production parser (D6 rank 5) | `src/lib/demo/parsePaymentSms.ts` | none yet. First red tests are in `docs/plans/2026-10-14-tdd-and-e2e-strategy.md` (characterization tests, catalog B). Manual: a `Body` with no dollar amount returns `"ok":false` from the webhook |
| SQLite storage through `node:sqlite` (tables `loans`, `participants`, `payments`, `confirmations`; file `data/loans.db`, gitignored) | `src/lib/demo/db.ts` | none yet for `db.ts`. The smoke test (`tests/unit/smoke.test.js`) only opens an in-memory `node:sqlite` database. Decision record: `docs/decisions/2026-10-14-node-sqlite.md` |

## Not built yet

Specified, with no code on `main`. These are not feature rows.

- Production app lifecycle: propose, agree, fund, pay, dispute, pause. Spec: `docs/product/MVP-USE-CASES.md`. Screens: `docs/product/MVP-SCREENS.md`. API sketch: `docs/product/MVP-API.md`. Code goes in `production/` only after Ty approves (`docs/README.md`).
- Auth, OTP and magic links, email and MMS receipt forward, and the OAuth agent API. The demo only imitates some of these.
- Automated tests, end-to-end scenarios and fixtures: `docs/plans/2026-10-14-tdd-and-e2e-strategy.md` (proposed).
