# Pocket Change MVP — clickable wireframes

Mid-fi gray-box HTML wireframes for the Pocket Change MVP.
Static only — no Twilio, no SQLite, in-memory / link navigation.

Progressive disclosure on propose + tab-addon / clarify (dependent fields reveal only when the parent choice needs them). Fixed pile-on is **deprecated / out of MVP**.
Propose **2d Late & trust** locked: **Late fee $ first** (presets $0/$15/$25/Custom; $0 = no late fee → hide timing). If $>0: late timing + decide + reminder. **Voice lock:** drafter = I/me/my; other = 2a name else the lender/the borrower; never bare you. Late “If Mom is late…” / “If I’m late…”. Receipts “When Mom sends…” / “When I send…”. Decide “I’ll decide” / “Mom decides whether to add the late fee”. Reminder “[Name] gets…” / “I’ll get…”. Review meta “Me (lender) ↔ Mom…”. Agree = reader voice.
Propose **2b Kind fork** locked: **Running tab** vs **Fixed-purpose loan** (high fork after Who). Tab: first charge creates balance; one active tab per pair; yardstick XOR **Target date** (recalc payment; lender reset/clear date) OR **Fixed payment** (duration extends on charges; lender reset $); tab add-on = add to balance (no rebalance wizard); preview weeks-left or payment-to-hit-date. Fixed: existing schedule UX; **stays the agreed contract after Funded** — no pile-on rebalance. Incidental extras → tab add-on; real new purpose → new propose. Overpay on fixed → default tab credit when tab exists. Optional Note on both; mutual re-agree to edit. Voice lock I/name; progressive disclosure.

Propose **2c Schedule** locked: define months XOR $ / payment → Frequency (Weekly · Monthly · Twice a month only) → On filtered by frequency; Weekly = Every week / Every 2 weeks + weekday chips (preview “Every Friday” / “Every other Friday”); Monthly = Day of month XOR Nth weekday; Twice a month On modes = Same two dates each month · Same two weekdays each month only (no “Same weekday every 2 weeks” under Twice a month); plain-English preview always on. No “Every 2 weeks” top-level sibling. No “ish”.

## Open

**LAN (ubuDual5060):** http://192.168.1.202:3460/  
**Tailscale:** http://100.64.0.9:3460/  
**Local box:** http://127.0.0.1:3460/

- Home: `/index.html`
- Screen map: `/map.html`
- **SMS POR:** `/sms-templates.html`
- **Handoff map:** `/handoff.html`
- **OAuth agent flow:** `/oauth-agent.html` (consent · draft · Mom agree · ledger · prefs)

Port **3460** (do not touch :10880 or model ports).

## Locked SMS paradigm (HARD RULE)

**SMS = doorbell + one fork ONLY.** One outbound SMS may do at most ONE of:

1. **Alert** — e.g. payment due Fri  
2. **Handoff** — open to agree / tab add-on / dispute  
3. **Binary fork** — Cabin trip or Car help? Prefer tap links over reply 1/2  
4. **Confirm what already happened** — `$50 applied · $420 left`

**NEVER in SMS:** multi-step wizards, collecting terms, explaining policy, nested if/then, free-text Q&A loops.

Complex work ALWAYS: **link → page (web)**. Ambiguous payment: at most ONE clarify ping; if ignored → pending in notebook; don’t chase in SMS.  
Free-text they send anyway: one ack with link if mappable; else “Open to tell us: [link]”; second unclear → stop texting, flag in-app.

**Hybrid:** email-first for heavy (magic links + `payment@personalloantracker.io`); SMS only short critical nudges / OTP / inbound receipt forwards when they text.

Copy hammer: *Friends & family · we never touch your money.* Chat-first but SMS is doorbell.

## MMS / web handoff points (shown in mockups)

| # | Flow | SMS does | Web does |
|---|------|----------|----------|
| 1 | Soft invite | Soft copy + link (amount hidden) | `invite.html` → Continue → agree |
| 2 | OTP | Code only | `otp.html` verify |
| 3 | Agree / Request change | Link only | `agree.html` / `request-change.html` |
| 4 | Pending funding / Funded | One-liner + link | `pending-funding.html` |
| 5 | Payment applied | One-liner ONLY (both) | optional toast `confirm-toast.html` |
| 6 | Ambiguous payment | ONE fork (taps) or link | `clarify.html` |
| 7 | Tab add-on / late / pause / dispute | Handoff link only | respective pages (fixed pile-on deprecated) |
| 8 | Due (−3/due/+3) | One-liner + optional link | `active.html` |
| 9 | Receipt forward | Prefer email; MMS → same parser | confirm or ONE clarify |
| 10 | Same as last time? | One fork with taps | clarify if No |

Screens show a companion **phone SMS preview** strip and/or a green **SMS / MMS → web** callout.

## Start / restart server

On ubuDual5060 the folder is served already (`python -m http.server` on :3460). Locally:

```bash
cd /workspace/personalloantracker/wireframes
python3 -m http.server 3460 --bind 127.0.0.1
```

## Core spine (tap through)

1. Home — My loans  
2. Propose wizard (web only — never SMS) · early tab vs fixed fork  
3. OTP stub (SMS code → web)  
4. Invite SMS preview → Invite landing (Continue / Report)  
5. Agree terms (link only from SMS)  
6. Pending funding (SMS nudge + Mark funded)  
7. Active loan hub (confirm SMS strip · due reminder · extras → tab or new propose)  
8. Clarify one-fork (taps)  
9. Tab add-on (entry via SMS link) → mutual confirm  
10. Funding dispute / pause (handoff)  
11. Paid off congrats  
12. **SMS templates** + **Handoff map**
13. **OAuth agent scenario** — OAuth act-as-user · $200 vet tab add-on · via-agent audit · human-in-loop prefs

## Files

| File | Screen |
|------|--------|
| `index.html` | Home |
| `propose.html` | Propose wizard (web) · tab|fixed fork |
| `agree-tab.html` | Agree · running tab sample |
| `tab-active.html` | Active running tab hub |
| `tab-addon.html` / `tab-addon-confirm.html` | Tab add-on (no rebalance) |
| `otp.html` | OTP + SMS strip |
| `invite-preview.html` | Invite SMS copy |
| `invite.html` | Invite landing + SMS strip |
| `agree.html` | Agree · link-only note |
| `pending-funding.html` | Pending funding + SMS nudge |
| `active.html` | Active hub + confirm/due SMS |
| `clarify.html` | One-fork clarify + SMS preview |
| `confirm-toast.html` | Dual-confirm one-liner |
| `pile-on.html` / `pile-on-confirm.html` | **DEPRECATED** fixed pile-on · redirect note → tab-addon / propose |
| `dispute.html` / `pause.html` | Dispute / pause handoff |
| `sms-templates.html` | SMS plan of record (POR templates) |
| `handoff.html` | SMS→web flowchart |
| `oauth-agent.html` | OAuth agent flow map |
| `oauth-agent-consent.html` | OAuth 2.1 + PKCE consent · scopes · via-agent audit |
| `oauth-agent-draft.html` | Agent drafts $200 vet onto Household tab |
| `oauth-agent-agree.html` | Mom’s agent soft-confirm agree |
| `oauth-agent-ledger.html` | Payment SMS doorbell + via-agent ledger badge |
| `oauth-agent-prefs.html` | Auto-agree in scope vs require human tap |
| `map.html` | Screen map |
| `styles.css` | Shared mid-fi + SMS strip styles |

Screenshots (if present): `home.png`, `agree.png`, `active.png`.

## MVP docs and agent API sketch

The served markdown copies are part of the wireframes folder so they can be opened from the same host:

- [`MVP-API.md`](../../docs/product/MVP-API.md) — Pocket Change agent API, OAuth 2.1 + PKCE, scoped act-as-user tokens, audit, intents, events, and roadmap
- [`MVP-USE-CASES.md`](../../docs/product/MVP-USE-CASES.md) — lifecycle and product guardrails
- [`MVP-SCREENS.md`](../../docs/product/MVP-SCREENS.md) — screen sketches and SMS/web handoffs

Agents are first-class clients of the same propose/agree/payment flows. Mutual agree remains mandatory; Pocket Change records payment evidence but never moves money. MCP is optional later and must use the same tokens and audit boundaries.

**OAuth agent demo screens:** start at [`oauth-agent.html`](oauth-agent.html) for the act-as-user story (consent → draft $200 vet → Mom’s agent agree → payment SMS + via-agent ledger → human-in-loop prefs).
