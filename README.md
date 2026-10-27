# Pocket Change

**Pocket Change** is a Ty Tech project for tracking friends-and-family IOUs.

Borrowers forward PayPal/Zelle/etc. payment SMS; the app records the payment, texts participants a confirmation, and shows the running balance left. **Pocket Change never moves money** — it records payment evidence and shared ledger state only.

## Quick start

```bash
npm install
npm run dev
```

Dev server: http://127.0.0.1:3456

## Paths

- `/` is the Hello World placeholder for the real app.
- `/wireframes/` is the design reference: plain HTML and PNG files in `static/wireframes/`.
- `/demo/` is the earlier interactive prototype, kept as reference material. It is a normal SvelteKit route tree in `src/routes/demo/` (support code in `src/lib/demo/`). It is not the architecture. The real architecture will be designed from the product requirements.

Demo routes, all under `/demo/`:

- `/demo/loans` is the loan list. `/demo/` redirects here.
- `/demo/create` creates a loan.
- `/demo/loan/[id]` shows detail, ledger and confirmations.
- `/demo/sms` is the SMS simulator.
- `/demo/oauth-agent` is the OAuth agent walkthrough.
- `POST /demo/api/sms` is the Twilio-style webhook (`From`, `Body` form params).
- `GET|POST /demo/api/loans` is the JSON API.

## Data

The demo uses local SQLite through Node's built-in `node:sqlite` (needs Node 22.13 or newer). Runtime file, not committed: `data/loans.db`

## Checks

GitHub Actions runs `rails-gate` (`.github/workflows/rails-gate.yml`) on pull requests to `main` and on pushes to `main`. It has three jobs: `lint`, `test`, `verify`. Run the same scripts locally with Node 22.13 or newer:

```bash
./scripts/lint.sh
./scripts/test.sh
./scripts/verify.sh
```

## Deploy

GitHub (`TyTech99/Pocketchange`, `main`) is the source of truth. Hostinger builds the app from it as a Node.js web app at `pocketchange.afterthedemo.com`. See `docs/decisions/` for the open deploy questions.

## Docs & wireframes

- [MVP use cases](docs/product/MVP-USE-CASES.md) — lifecycle, SMS doorbell, repayment, and guardrails
- [MVP screens](docs/product/MVP-SCREENS.md) — web/magic-link screen sketches
- [MVP Agent API + OAuth 2.1 sketch](docs/product/MVP-API.md) — delegated agent client, scoped tokens, intents, events, and audit boundaries
- [Wireframes](static/wireframes/) — HTML/PNG mockups (start at [static/wireframes/map.html](static/wireframes/map.html)); served at `/wireframes/` on the preprod site

Agents use the same mutual-agree lifecycle as the web UI.

**Extras after Funded:** incidental charges → running **tab add-on**; real new purpose → new fixed propose. Fixed-loan pile-on rebalance is out of MVP.
