# Ledger as a signed, append-only event log

Date: 2026-11-05
Decided by: Ty
Status: Decided
Source of truth: GitHub, `TyTech99/Pocketchange`.
Replaces: nothing. This is the first ledger-storage decision.

## Decision

Pocket Change stores each contract's history as a signed, append-only event log in the normal database. It does not run a custom blockchain or use cryptocurrency.

Each lifecycle step is a new event. Events are never updated or deleted. Event types include `created`, `edited`, `agreed`, `payment_recorded`, `completed`, and a `correction` that references the event it corrects.

Each event stores the hash of the previous event in that contract's chain. Changing any past event breaks the chain and is detectable.

Each party signs the events they agree to with a key only they hold. That identity is the verified OTP sign-in identity from the auth plan (`docs/plans/2026-10-14-auth-first-task-list.md`).

Either party can download their contract's full record as one file: events, signatures, and hashes. A published, open verifier checks the signatures and the unbroken chain without trusting Pocket Change.

Per-step receipts go to both parties by email or SMS. A daily public fingerprint (an anchor hash of the day's tip) is optional and reveals no contract contents.

The ledger is not public. Contents stay private through access control and encryption at rest. A signature proves who signed and that the record is intact. It does not hide the contents by itself.

Legal enforceability of any given contract is a question for a lawyer. US federal law (the E-SIGN Act) generally recognizes electronic signatures. This record is not legal advice.

## Reason

Fact: Ty asked to explore a custom blockchain so every contract stage (initial state, edits, mutual agreement, payment recording, completion) would be immutable, and so either party could take their portion of the record into a dispute.

Fact: Ty is not interested in cryptocurrency. The goal is immutability and dispute evidence.

Fact: Pocket Change is the only operator. A chain where we run every node proves nothing beyond what our own database already proves.

Fact: Family loans are private. A public chain copies every record to many places, which fights that privacy.

Fact: Chains cannot edit or delete. People mistype amounts and ask to delete accounts. Privacy laws give users a right to have data erased.

Fact: Running our own chain means nodes, consensus, key management, and upgrades. That is months of infrastructure before the MVP, for a value users will not see.

Fact: The app records payments made elsewhere (Venmo, cash, and similar). A chain cannot confirm that money actually moved, so the record is only as true as what people enter.

Fact: The plan of record already expects a ledger, dual notices, history, and a downloadable summary. It does not require a blockchain.
- `docs/product/MVP-API.md:9` — Pocket Change records proposals, agreements, payment evidence, ledger applications, reminders, and audit history. It never moves funds.
- `docs/product/MVP-API.md:63` — every via-agent audit record is append-only.
- `docs/product/MVP-API.md:168` — never last-write-wins over a consent or ledger decision.
- `docs/product/MVP-USE-CASES.md:61` — every ledger hit sends a confirmation to both parties.
- `docs/product/MVP-SCREENS.md:293` and `:298` — Active loan shows a Ledger and a Full history control.
- `docs/product/MVP-SCREENS.md:407` — Paid off includes Download summary.

A signed, hash-chained event log gives the same immutability Ty wants: tamper-evident history, party signatures, exportable proof, and optional public anchoring, without a blockchain.

## Ty's words

> Yes, build the ledger as a signed, append-only event log with downloadable, verifiable records.

## Open (agent-owned)

Ty owns the concept. Agents own the tech. These are left for implementation and do not need Ty's decision now:

- Signature algorithm
- Key custody model
- Export file format
- Anchor target for the optional daily fingerprint

## Related open question

`docs/decisions/open-questions.md` item C3 (ledger corrections: undo, reverse, edit, bounced payment) is partially answered: a correction is a new event that references the event it corrects. Remaining correction workflows stay open until product rules for each case are decided.
