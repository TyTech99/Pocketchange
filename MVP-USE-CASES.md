# Personal Loan Tracker — MVP use cases

Working name: personalloantracker.io  
Primary user: friends & family (Ty → kids first).  
PLT never touches money.

## Stance

- Shared notebook + calm messenger for F&F. Not a lender, bank, collections, or commercial loan product.
- Chat-first but **SMS is doorbell**: short critical nudges / OTP / inbound receipt ack. Complex work = link → web.
- **Free F&F:** email payment rail + small SMS bucket.
- **Plus ~$5/mo household:** when SMS volume / extra loans matter.
- Never take a % of principal, late-fee kickback, or move funds.
- Copy: *Friends & family · we never touch your money.*

## Voice lock
- Drafter / reader = I/me/my; other party = 2a display name else “the lender” / “the borrower”; never bare “you” in UI.
- Receipts: “When [Name] sends a payment receipt” (lender drafts) / “When I send a payment receipt” (borrower drafts).
- Late: “If [Name] is late…” / “If I’m late…”. Decide: “I’ll decide” vs “[Name] decides whether to add the late fee”. Reminder role-aware.

## Scope

- One lender + one borrower per loan (multi-borrower splits later).
- Either side may draft; monitoring starts only after **mutual agree**.
- Required: loan **nickname**, **phone + email** for both (push both; email is the ripcord). Phone may change later.

## Lifecycle

1. **Draft** — nickname, principal, pricing mode, schedule, late policy, payment-trust, contacts. **Web wizard only.**
2. **Invite** — soft SMS/email after drafter OTP; no amount in first SMS; recipient Continue / Report on web.
3. **Mutual agree** — terms on web (SMS = link only) → Pending funding (no interest, no nudges).
4. **Funded** — lender marks funded on page → borrower SMS one-liner → clock/reminders on.
5. **Funding dispute** — SMS handoff → freeze page until both resolve. Post-MVP: forward payment email as evidence if lender silent; then “work it out.”
6. **Paid off** — congrats to borrower; loan closed for both.
7. **Cancel** — lender-only approve, unless an open dispute.

## Pricing modes (agree screen)

1. **Flat fee** — borrow $X, pay back $X + **configurable fee** (fee may be $0); split across the chosen payment schedule.
2. **Installment (rate)** — annual % + term; show **payment per period + estimated total** in plain language (amortizing math OK; copy never leads with “compounded”).

### Schedule cadence *(locked UX Ty 2026-09-26)*

- **Define mode:** A · length in months, or B · $ per payment (months derived in preview).
- **Frequency** (3 only): **Weekly · Monthly · Twice a month**. No “Every 2 weeks” top-level sibling. No “ish” language.
- **On** (progressive disclosure by frequency):
  - Weekly → interval **Every week** / **Every 2 weeks** + weekday (Mon–Sun); preview “Every Friday” / “Every other Friday”
  - Monthly → **Day of month** (default) XOR **Nth weekday**; e.g. “On the 15th” / “On the 3rd Friday”
  - Twice a month → On modes **only**:
    1. **Same two dates each month** — two dates default 1 & 15; preview “On the 1st and the 15th”
    2. **Same two weekdays each month** — weekday + 1st & 3rd / 2nd & 4th; preview “On the 1st and 3rd Friday each month”
    — **Removed** from Twice a month: “Same weekday every 2 weeks” (lives under Weekly → Every 2 weeks)
- First due: after funded (+ optional exact date). Plain-English preview always visible.
- Reminders (−3 / due / +3) follow the chosen period, not calendar-month only. SMS = one-liner + optional open-loan link.

## Repayment

- **Count as paid right away (default):** forwarded payment receipt from borrower’s known channel counts as paid.
- **Wait for [me | Mom | the lender] to confirm:** same receipt, lender must confirm. (Propose copy is role-aware voice lock; no A/B letters.)
- Borrower can declare paid / partial / paid off / pause (hardship). Partials and early payoff are in scope.
- Every ledger hit sends a **confirmation to both** — SMS one-liner only: `$50 applied · $420 left` (no ask).
- Multi-loan same counterparty: **borrower-only** split; offer template; default **“Same as last time?”** as one fork (taps), not chat.
- Off-pattern amount/timing: **ONE** Jev-style clarify (taps or link); ignored → pending in notebook; don’t chase in SMS.

## Rails

- **One SMS number** for all; route via From + nickname + receipt to/from; ask when ambiguous (**one** fork max).
- **One email:** `payment@personalloantracker.io`; route via forwarder metadata + body; same clarify rules.
- Prefer **email forward** for payment proof (including pasting an SMS receipt into email); SMS/MMS forward is the easy alternate — **same parser path**, then confirm SMS or clarify once.
- Magic links: SMS and/or email; email preferred when present for heavy work.

## Reminders & late

- Gentle reminders at **−3 days**, **due day**, **+3 days**; further nudges only if lender asks.
- **Late-fee eve reminder (NEW):** when a late fee **$>0** is contracted and mode is **Right away** or **After grace**, borrower gets an SMS/email on the **last day before the late fee would apply** if still overdue (Right away → due-day evening or day before fee posts; After grace → last day of grace). **Decide each time:** still remind on last day of grace if grace > 0; otherwise discretionary “fee may be added soon if unpaid.” Wireframe copy (role-aware): *[Mom gets a reminder / I’ll get a reminder]: last day before a late fee would apply (if still unpaid).*
- Late policy set on propose/agree web screens (never explained in SMS) — **fee $ first**:
  1. Choose **Late fee $** (presets + custom; **$0 = no late fee** → hide timing).
  2. If **$>0**, choose **When a payment is late**:
     - **Right away**
     - **After a grace period** → Wait N days
     - **Decide each time** (lender add-or-skip only at contract $; role-aware copy)
- Fee presets: $0 / $15 / $25 / Custom.
- Receipts: **When [Name]/I send a payment receipt** → **Count as paid right away** / **Wait for me|[Name] to confirm** (no A/B letters; voice lock).
- Late / pause / dispute actions: SMS handoff link → page.


## Anti-spam

- Drafter phone (and email) OTP before invites.
- Soft invite copy — track a loan with someone you know; not a bill.
- Recipient Continue / Report; rate limits; expire ignored invites.
- Show amount only after recipient opens.
- Free-text loops: one ack; second unclear → stop texting, flag in-app.

## Out of MVP / later

- Multi-borrower splits
- Rent / private-party car / seller-finance skins
- iMessage as transport
- Native CC from Zelle / Venmo / PayPal
- Formal payment “courtroom” disputes (rely on dual confirms + routing clarity)
- Monetization beyond Free / Plus sketched above

---

Captured from Ty + loanbot product conversation, 2026-09-25 PT.  
SMS paradigm locked 2026-09-26 PT.

## SMS paradigm (doorbell)

Use case: product must not turn SMS into a chatbot.

1. Outbound SMS does at most one of: alert · handoff · binary fork · confirm-what-happened.
2. Propose / agree terms / tab add-on / dispute resolution always open a page.
3. Hybrid: email-first for heavy; SMS for short critical nudges, OTP, and when they text first.
4. Wireframes show the SMS POR in `static/wireframes/sms-templates.html` and the flowchart in `static/wireframes/handoff.html`.

## MMS / SMS receipt forward → web confirm / clarify

Use case: borrower (or lender) forwards a payment screenshot or receipt.

1. **Prefer email** to `payment@personalloantracker.io` (including pasting an SMS receipt into email).
2. If they **MMS/SMS** a screenshot/receipt to the PLT number → same parser path as email.
3. On clear match (loan + amount): post ledger → **confirm SMS one-liner to both** (`Boat: $50 applied · $420 left`). No ask.
4. On ambiguous (multi-loan / odd amount / unknown): **ONE** clarify SMS with tap choices or link to `clarify.html`. If ignored → mark pending in notebook; do not chase.
5. Wait-for-confirm trust: same path, but lender confirms on web (or one handoff) before posting.

## Extras after Funded (locked Ty 2026-09-26)

**Fixed-purpose loan stays the agreed contract after Funded.** No pile-on rebalance that mutates an established fixed loan’s schedule (keep-length / keep-payment is **out of MVP / deprecated**).

When Mom/Dad (or either party) covers a small extra (electric, vet, groceries, car help):

1. **Incidental extras → running tab (tab add-on)** — if a Household (or pair) tab exists, add the charge to the tab balance under the existing yardstick (`tab-addon.html`). Preview weeks-left or payment-to-hit-date; **no** keep-length / keep-payment wizard. Mutual accept via handoff SMS → accept page. Ledger: `Add-on +$65 · groceries` · dual-notify one-liner.
2. **Real new purpose → new fixed-purpose loan** — propose a new named loan (Boat repair, Vet bill…) via `propose.html`. Fresh mutual agree + funding; does not rewrite an existing funded fixed loan.
3. Fixed active hub offers: open/use tab add-on, or propose a new fixed loan — **not** “Add to this loan (pile-on).”

Flow (canonical under SMS paradigm) for tab add-on:
1. Lender texts something like: `Sent John $65 for groceries` (or forwards a receipt).
2. PLT: if tab clear → **one handoff SMS**: `Mom wants to add $65 to Household tab (groceries). Open: [link]`. If ambiguous → ONE fork, then handoff.
3. On **web** (`tab-addon.html`): amount + note + yardstick preview only.
4. Soft confirm to other party via **handoff SMS** → `tab-addon-confirm.html` (mutual).
5. Ledger updates · dual-notify one-liner.

**Deprecated / out of MVP:** fixed-loan pile-on rebalance (`pile-on.html` / `pile-on-confirm.html` kept only as marked-deprecated historical wireframes). **Not allowed:** multi-turn SMS wizard (“new loan or add? → length or payment? → confirm…”).

## Agent/API boundary (MVP sketch)

Agents are first-class clients for the same flows: they may help an authorized person **propose**, **agree**, and submit or clarify **payment** evidence. OAuth 2.1 + PKCE, scoped tokens, explicit act-as-user delegation, and via-agent audit records are required; an agent cannot impersonate the other party. Intent resources (`propose`, `agree`, `apply_payment`, `clarify`, `addon` for **tab add-on only**) use idempotency keys and emit signed, deduplicated webhooks/events. Agents do not rebalance funded fixed loans; extras go to tab add-on or a new `propose`. The API never bypasses mutual agree and never moves money. MCP, if added later, is only a thin wrapper over these same tokens and rules. Household capability grants are a post-MVP roadmap item. See [`MVP-API.md`](MVP-API.md).

## Explore: Jev decision model

See `MVP-API.md` — TypeSafe Jev complements the stack for ambiguous-payment routing and agent auto-agree gates; does not replace SvelteKit/SQLite/OAuth.
