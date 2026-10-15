# Pocket Change

**Pocket Change** (working names: personalloantracker / PLT) is a Ty Tech prototype for tracking friends-and-family IOUs.

Borrowers forward PayPal/Zelle/etc. payment SMS; the app records the payment, texts participants a confirmation, and shows the running balance left. **Pocket Change never moves money** — it records payment evidence and shared ledger state only.

## Quick start

```bash
npm install
npm run dev
```

Dev server: http://127.0.0.1:3456

## Paths

- `/` — loan list
- `/create` — create loan
- `/loan/[id]` — detail + ledger + confirmations
- `/sms` — SMS simulator (same processing as Twilio webhook)
- `POST /api/sms` — Twilio-ready webhook (`From`, `Body` form params)
- `GET|POST /api/loans` — JSON API

## Data

Local SQLite through Node's built-in `node:sqlite` (needs Node 22.13 or newer). Runtime file, not committed: `data/loans.db`

## Deploy

GitHub (`TyTech99/Pocketchange`, `main`) is the source of truth. Hostinger builds the app from it as a Node.js web app at `pocketchange.afterthedemo.com`. See `docs/decisions/` for the open deploy questions.

## Docs & wireframes

- [MVP use cases](MVP-USE-CASES.md) — lifecycle, SMS doorbell, repayment, and guardrails
- [MVP screens](MVP-SCREENS.md) — web/magic-link screen sketches
- [MVP Agent API + OAuth 2.1 sketch](MVP-API.md) — delegated agent client, scoped tokens, intents, events, and audit boundaries
- [Wireframes](wireframes/) — HTML/PNG mockups (start at [wireframes/map.html](wireframes/map.html))

Agents use the same mutual-agree lifecycle as the web UI.

**Extras after Funded:** incidental charges → running **tab add-on**; real new purpose → new fixed propose. Fixed-loan pile-on rebalance is out of MVP.
