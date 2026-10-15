# Pocket Change

**Pocket Change** (working names: personalloantracker / PLT) is a Ty Tech prototype for tracking friends-and-family IOUs.

Borrowers forward PayPal/Zelle/etc. payment SMS; the app records the payment, texts participants a confirmation, and shows the running balance left. **Pocket Change never moves money** — it records payment evidence and shared ledger state only.

## Quick start

```bash
npm install
npm run dev
```

Dev server: http://127.0.0.1:3456

## What is here

- `/` is the Hello World placeholder for the real app. It is the only page the app serves.
- `/wireframes/` is the design reference. Plain HTML and PNG files in `static/wireframes/`, served as-is.
- `/demo/` is the earlier interactive prototype, kept as reference material in `static/demo/`, served as-is. It is not the architecture. The real architecture will be designed from the product requirements.

## Demo (reference only)

`static/demo/` holds the prototype's pages, API routes, and support code, moved there without changes. Its routes (`/create`, `/api/sms`, `/api/loans`, `/sms`, `/oauth-agent`) do not run in the app. Nothing should be built on them.

## Docs & wireframes

- [MVP use cases](MVP-USE-CASES.md) — lifecycle, SMS doorbell, repayment, and guardrails
- [MVP screens](MVP-SCREENS.md) — web/magic-link screen sketches
- [MVP Agent API + OAuth 2.1 sketch](MVP-API.md) — delegated agent client, scoped tokens, intents, events, and audit boundaries
- [Wireframes](static/wireframes/) — HTML/PNG mockups (start at [static/wireframes/map.html](static/wireframes/map.html)); served at `/wireframes/` on the preprod site

Agents use the same mutual-agree lifecycle as the web UI.

**Extras after Funded:** incidental charges → running **tab add-on**; real new purpose → new fixed propose. Fixed-loan pile-on rebalance is out of MVP.
