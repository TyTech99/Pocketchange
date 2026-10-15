# Pocket Change MVP — screen sketches

Mobile-first. Chat/SMS is the daily driver doorbell; these screens are magic-link web.

Copy hammer on every public surface: *Friends & family loan tracker. We never touch your money.*

## Voice lock (Ty 2026-09-26)
- **Drafter / reader** = I / me / my. **Other party** = display name from 2a (Mom) else “the lender” / “the borrower”. **Never bare “you”** in UI (SMS doorbell may still address the phone owner).
- Propose 2d+review JS helper syncs role + name. Agree uses **reader** voice. Named-party screens (invite, pending-funding, tab-addon, clarify, active, dispute, pause) personalize when a party is named.

---

## SMS templates + handoff points (locked)

**SMS = doorbell + one fork ONLY.** One outbound SMS may do at most ONE of:

| Kind | Example |
|------|---------|
| Alert | Payment due Fri · $43.87 |
| Handoff | Open to agree / tab add-on / dispute: [link] |
| Binary fork | Same as last time? [Yes] [No — open] (prefer tap links) |
| Confirm | Boat: $50 applied · $420 left |

**NEVER in SMS:** multi-step wizards, collecting terms, explaining policy, nested if/then, free-text Q&A loops.

Complex work ALWAYS: **link → page**. Ambiguous payment: at most ONE clarify ping; ignored → pending in notebook. Free-text they send anyway: one ack + link; second unclear → stop texting, flag in-app.

**Hybrid:** email-first for heavy (`payment@personalloantracker.io` + magic links); SMS for short critical nudges / OTP / inbound receipt when they text.

### Handoff map

| # | Flow | SMS | Web |
|---|------|-----|-----|
| 1 | Soft invite | Soft copy + link (amount hidden) | invite → Continue → agree |
| 2 | OTP | Code only | verify page |
| 3 | Agree / Request change | Link only | agree / request-change |
| 4 | Pending funding / Funded | One-liner + link | pending-funding |
| 5 | Payment applied | One-liner ONLY (both) | optional toast |
| 6 | Ambiguous clarify | ONE fork (taps) or link | clarify |
| 7 | Tab add-on / late / pause / dispute | Handoff link only | respective pages |
| 8 | Due (−3 / due / +3) | One-liner + optional link | active |
| 9 | Receipt forward | Prefer email; MMS → same parser | confirm or ONE clarify |
| 10 | Same as last time? | One fork with taps | clarify if No |

Wireframes: `static/wireframes/sms-templates.html`, `static/wireframes/handoff.html`, plus SMS preview strips on invite / clarify / active / pending-funding / tab-addon / dispute / pause / agree / confirm-toast / otp.

### Key template wording

```
Invite:  Ty wants to set up a friends & family loan tracker with you on Pocket Change.
         Not a bill. Not a charge. We never touch money.
         Open only if you know them: [link]

OTP:     Pocket Change code: 482917. Enter it on the page. Never share this code.

Agree:   Boat terms ready. Open to agree or request a change: [link]

Funding: Boat agreed — waiting on Ty to fund. Open: [link]
Funded:  Boat funded. Reminders start. Open loan: [link]

Confirm: Boat: $50 applied · $420 left

Clarify: Got $150. Apply how?  [ Same as last ] [ All to Boat ] [ Open ]

Tab add-on: Mom wants to add $65 to Household tab (groceries). Open: [link]

Extras on fixed: use tab add-on or propose a new fixed loan (fixed pile-on deprecated)

Due:     Boat due Fri · $43.87. Open loan: [link]

Same?:   Same as last time? ($100 Motorcycle · $50 Boat)  [ Yes ] [ No — open ]

Free-text ack: Got it. Open to tell us: [link]
```

---

## 1. Home — My loans
```
┌─────────────────────────────┐
│ Pocket Change       │
│ F&F tracker · no money moved│
├─────────────────────────────┤
│ [ + Propose a loan ]        │
├─────────────────────────────┤
│ Boat · with Mom             │
│ Due Sun · $87.50 left       │
│ ● Active                    │
├─────────────────────────────┤
│ Car · with Mom              │
│ Waiting on Mom to agree     │
│ ○ Pending                   │
├─────────────────────────────┤
│ Cabin · with Dad            │
│ Paid off 🎉                 │
│ ✓ Closed                    │
└─────────────────────────────┘
```

---

## 2. Propose — wizard (drafter)
Steps; back/next; progress dots. **Web only — never an SMS wizard.**

**2a · Who**
- Role: I’m the lender / I’m the borrower
- Their name
- Their phone *required*
- Their email *required (ripcord)* — helper: “Email keeps the loan if their number changes”
- Your phone + email (OTP next)


**2b · Kind fork** *(locked Ty 2026-09-26 — high fork)*
- ( ) **Running tab** — open balance · first charge creates it · one active tab per pair
- ( ) **Fixed-purpose loan** — named principal + schedule (existing UX)

**If Running tab → 2c Tab setup** (skips full fixed schedule)
- Tab nickname *
- Yardstick XOR:
  - **Target date** → date · preview “payment recalcs to hit date” · lender can reset/clear later
  - **Fixed payment** → $ · preview “duration extends on new charges” · lender can reset $ later
- Reminder cadence: Weekly · Monthly · Twice a month (light)
- Optional Note (mutual re-agree to edit)
- Soft copy: opens at $0 until first charge

**If Fixed-purpose → 2c Nickname & money** (was prior 2b)

**2c · Nickname & money** *(fixed branch)*
- Loan nickname *required* (Boat)
- Principal $
- Pricing: (●) **No fee**  ( ) Flat fee  ( ) Installment %
  - **No fee** (F&F default): $0 · borrow X → pay back X; hide fee $/APR inputs
  - Flat: reveal **fee $** → borrow + fee → pay back total
  - Installment: reveal annual % + term → shows **$/period + est. total** big
- **Progressive disclosure:** only the active pricing block is visible; plain-language preview + 2e review update with mode

**2d · Schedule** *(fixed branch · locked UX Ty 2026-09-26)*
- **How do you want to define the loan?**
  - A · Length of time (months) → months count, then Frequency
  - B · Payment amount ($ per payment) → $ amount, then Frequency (derived months/end in preview)
- **Frequency** (3 only; plain words):
  **Weekly · Monthly · Twice a month**
  — No “Every 2 weeks” top-level sibling. No “ish” language.
- **On:** progressive disclosure filtered by frequency
  - Weekly → interval **Every week** / **Every 2 weeks** + weekday chips (Mon–Sun); preview “Every Friday” / “Every other Friday”
  - Monthly → mode: **Day of month** (default: 1st / 15th / last / other) XOR **Nth weekday** (e.g. 3rd Friday); previews “On the 15th” / “On the 3rd Friday”
  - Twice a month → On modes **only** (progressive):
    1. **Same two dates each month** — two date inputs default 1 & 15; preview “On the 1st and the 15th”
    2. **Same two weekdays each month** — weekday + 1st & 3rd / 2nd & 4th; preview “On the 1st and 3rd Friday each month”
    — **Removed:** “Same weekday every 2 weeks” (that cadence lives under Weekly → Every 2 weeks)
- Plain-English schedule preview line always visible
- First due: simple “after funded” + optional exact date if known
- Progressive disclosure: only On: for selected frequency; only months OR payment $ for define mode; Weekly interval + weekday; one Twice-a-month On mode at a time; Day XOR Nth under Monthly

**2e · Late & trust** (both kinds · locked Ty 2026-09-26 — fee $ first + reminder + **voice lock**)
- **Late fee $ first** — presets **$0 / $15 / $25 / Custom…** (custom $ input only when Custom). Hint: **$0 = no late fee**.
- If fee **$0**: hide timing + reminder; review **“Late fee: none.”**
- If fee **$>0**: reveal late timing (role-aware header)
  1. **Right away** — fee posts as soon as it’s late
  2. **After a grace period** → **Wait N days** (then fee)
  3. **Decide** — lender add-or-skip only at the **contract $**
- **Voice lock** (JS helper syncs role + 2a display name; never bare “you”):
  - Drafter = **I / me / my**; other party = display name from 2a (e.g. Mom) else **“the lender” / “the borrower”**
  - Late header: lender drafts **“If Mom is late…”**; borrower drafts **“If I’m late…”**
  - Receipts header (option A): lender **“When Mom sends a payment receipt”**; borrower **“When I send a payment receipt”**
  - Decide: **“I’ll decide”** / **“Mom decides whether to add the late fee”**
  - Reminder callout: **“Mom gets a reminder…”** / **“I’ll get a reminder…”**
  - Trust options: **Count as paid right away** / **Wait for me to confirm** · **Wait for Mom to confirm**
- Reminder body (when fee $>0):
  - Right away or After grace: *last day before a late fee would apply (if still unpaid).* (Right away → due-day evening or day before fee posts; After grace → last day of grace.)
  - Decide: discretionary *fee may be added soon if unpaid (I’ll decide / Mom decides whether to add the late fee).*
- Review (2e) meta: **Me (lender) ↔ Mom (borrower)** (never “You”); late/trust lines match:
  - `Late fee: none.` · `$15 right away when late` · `Wait 10 days, then $15` · `I’ll decide whether to add the late fee · $15`
  - `Count as paid right away` · `Wait for me to confirm` / `Wait for Mom to confirm`


**2f · Review & send** (both · optional Note on fixed if not entered earlier; tab Note from 2c)
- Plain-language summary card (reflects No fee / flat fee / installment %)
- Disclaimer line
- [Send invite] → triggers drafter OTP if not verified

---

## 3. OTP / verify
SMS delivers code only → enter on web (or inline OTP then continue to web).
```
┌─────────────────────────────┐
│ Verify it’s you             │
│ Code sent to (•••)4567      │
│ [ _ _ _ _ _ _ ]             │
│ [ Continue ]                │
└─────────────────────────────┘
```

---

## 4. Invite SMS / email (doorbell — not a full screen)
> Ty wants to set up a **friends & family loan tracker** with you on Pocket Change.  
> Not a bill. Not a charge. We never touch money.  
> Open only if you know them: [magic link]

Amount **not** in first message. SMS = soft invite handoff → invite landing.

---

## 5. Invite landing (recipient)
```
┌─────────────────────────────┐
│ Ty invited you              │
│ Friends & family tracker    │
│ We never touch your money   │
├─────────────────────────────┤
│ Loan: Boat                  │
│ You’ll see full terms next  │
├─────────────────────────────┤
│ [ Continue ]  [ Not me /    │
│                Report ]     │
└─────────────────────────────┘
```
Continue → light OTP → full terms. Amount still hidden until Continue.

---

## 6. Agree — terms
**Not sent as SMS body; link only.** Agree / Request change always on web.
```
┌─────────────────────────────┐
│ Boat                        │
│ Ty (lender) ↔ me (borrower) │
├─────────────────────────────┤
│ Borrow          $1,000.00   │
│ Pay back about  $1,052.88   │
│ Schedule        Twice a     │
│                 month · On  │
│                 the 1st and │
│                 3rd Friday  │
│                 each month  │
│ Payment         $21.94      │
│ For             24 months · │
│                 48 payments │
│ Late            Wait 10     │
│                 days, then  │
│                 $15         │
│ Receipts        Count as    │
│                 paid right  │
│                 away        │
│                 paid right  │
│                 away        │
├─────────────────────────────┤
│ F&F tracker · not a lender  │
│ [ Agree ]  [ Request change]│
└─────────────────────────────┘
```
Request change → short note on web → re-opens for both (other party gets handoff SMS).

---

## 7. Pending funding
SMS nudge: `Boat agreed — waiting on Ty to fund. Open: [link]`
```
┌─────────────────────────────┐
│ Boat · agreed               │
│ Waiting for Ty to fund      │
│ No interest yet · no nudges │
├─────────────────────────────┤
│ (Lender only)               │
│ [ I funded this loan ]      │
├─────────────────────────────┤
│ (Borrower)                  │
│ You’ll get a text when      │
│ Ty marks it funded.         │
│ [ Never got the money ]     │
│   (after funded)            │
└─────────────────────────────┘
```
After funded SMS: `Boat funded. Reminders start. Open loan: [link]`

---

## 8. Active loan — hub
Shows payment-confirm SMS strip + due-reminder strip. Extras: tab add-on or propose new fixed — **not** fixed pile-on rebalance.
```
┌─────────────────────────────┐
│ Boat · with Mom             │
│ Remaining        $912.40    │
│ Next due Sun     $43.87     │
├─────────────────────────────┤
│ How to log a payment        │
│ Email: payment@plt… (prefer)│
│ or MMS/SMS: (555) 010-0     │
│ Tip: put “Boat” in memo     │
├─────────────────────────────┤
│ Ledger …                    │
├─────────────────────────────┤
│ [ I paid ] [ Pause ]        │
│ [ Add to Household tab ]    │
│ [ Propose new fixed loan ]  │
│ [ Full history ]            │
└─────────────────────────────┘
```

Lender extras: [ Got it ] [ Not yet ] [ Grace ] [ Apply late ] when prompted — decisions on page; SMS may hand off with a link.

**Due reminders (−3 / due / +3):** SMS one-liner + optional open-loan link.  
`Boat due Fri · $43.87. Open loan: [link]`

---


---

## 8b. Active tab — hub
```
┌─────────────────────────────┐
│ Household tab · with Mom    │
│ Balance           $180.00   │
│ Next due Fri      $50.00    │
│ Yardstick  Fixed $50 · ~4 left
│ Note: groceries + kids…     │
│ [ I paid ] [ Pause ]        │
│ [ Add charge to tab ]       │
│ Lender: [ Reset $ ] [ Date ]│
└─────────────────────────────┘
```
First charge created the tab. Overpay on a fixed loan with Mom defaults to this tab’s credit.

---

## 11c. Tab add-on (no rebalance)
```
┌─────────────────────────────┐
│ Add $65 to Household tab    │
│ “groceries”                 │
│ Balance $180 → $245         │
│ Preview: ~5 payments left   │
│   (or payment ↑ to hit date)│
│ [ Send to accept ]          │
└─────────────────────────────┘
```
Not keep-length / keep-payment. **Canonical path for incidental extras.** Fixed pile-on (§13) is deprecated / out of MVP.

---

## 6b. Agree — running tab sample
```
┌─────────────────────────────┐
│ Household tab               │
│ Kind: Running tab           │
│ Opens at $0 · first charge  │
│ Yardstick: Fixed $50        │
│ Note: groceries + kids…     │
│ [ Agree ] [ Request change ]│
└─────────────────────────────┘
```

## 9. Clarify — one fork only (tap links)
Ambiguous payment → **ONE** SMS with taps OR link to this page. Never a wizard thread. Ignored → pending in notebook.
```
┌─────────────────────────────┐
│ Got $150 from your forward  │
│ Apply how?                  │
│ ( ) Same as last time       │
│     $100 Motorcycle         │
│     $50 Boat                │
│ ( ) All to Boat             │
│ ( ) Split differently…      │
│ ( ) Not a loan payment      │
│ [ Confirm ]                 │
└─────────────────────────────┘
```
SMS preview: `Got $150. Apply how? [Same as last] [All to Boat] [Open]`

When a running tab exists for the pair, overpay on a fixed loan offers **default tab credit** (Boat due + rest to Household tab).

---

## 10. Confirm toast / SMS dual-notify
One-liner ONLY — confirm what already happened. No ask. Both parties.

> Boat: $50 applied · $420 left

(Disputes / “wrong” → open loan in-app or one handoff link — not an SMS argument.)

---

## 11. Funding dispute (frozen)
Entry via SMS handoff link. Resolve on page.
```
┌─────────────────────────────┐
│ Boat · paused               │
│ Alex says funds not received│
│ Monitoring is off until     │
│ you both resolve.           │
│ [ Resolved — funded ]       │
│ [ Cancel loan ] (lender)    │
└─────────────────────────────┘
```

---

## 12. Paid off
```
┌─────────────────────────────┐
│ 🎉 Boat is paid off         │
│ Nice work, Alex.            │
│ Ty has been notified.       │
│ [ Download summary ]        │
│ [ Back to my loans ]        │
└─────────────────────────────┘
```

---

## Out of MVP UI
- Fixed-purpose pile-on rebalance (keep-length / keep-payment) — extras → tab add-on or new propose
- Multi-borrower cabin splits
- Rent / car skins
- Plus paywall polish (simple banner enough)
- Screenshot OCR (MMS forward uses same parser path as email; OCR polish later)

---

## 13. ~~Pile-on — fixed-purpose~~ **DEPRECATED / out of MVP**

**Locked (Ty 2026-09-26):** A funded fixed-purpose loan stays the agreed contract. Do **not** pile-on / rebalance keep-length vs keep-payment on established fixed loans.

**Use instead:**
- Incidental extras → **tab add-on** (§11c) / `static/wireframes/tab-addon.html`
- Real new purpose → **propose a new fixed-purpose loan** / `static/wireframes/propose.html`

Wireframes `static/wireframes/pile-on.html` / `static/wireframes/pile-on-confirm.html` remain only as marked-deprecated historical pages (redirect note + links to tab-addon + propose).

## Agent/API parity (MVP sketch)

The agent API is another client of these screens and lifecycle rules, not a shortcut around them. OAuth 2.1 + PKCE scoped tokens identify the consenting user and agent; every mutation is an audited, idempotent intent (`propose`, `agree`, `apply_payment`, `clarify`, or `addon` for **tab add-on only** — not fixed pile-on rebalance). Agents can assist with propose/agree/payment flows, but terms still require mutual agree and payment application only records evidence/ledger state—Pocket Change never moves money. MCP is optional later on the same tokens. See [`MVP-API.md`](MVP-API.md).

Decisioning explore: **Jev** in `MVP-API.md` (not a stack replace). **OAuth agent demo wireframes:** `static/wireframes/oauth-agent.html` (flow) · `static/wireframes/oauth-agent-consent.html` · `static/wireframes/oauth-agent-draft.html` ($200 vet / $50 Fri Household tab) · `static/wireframes/oauth-agent-agree.html` · `static/wireframes/oauth-agent-ledger.html` · `static/wireframes/oauth-agent-prefs.html`. Linked from `static/wireframes/map.html` / `static/wireframes/index.html`.
