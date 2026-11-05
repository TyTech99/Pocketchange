# docs/decisions/

Purpose: record of decisions. One file per decision.

Each record states: the decision, who decided, the date, the reason, and what it replaces.

File name: `YYYY-MM-DD-short-name.md`.

Records are not edited after the fact. A new record supersedes an old one and links to it.

## Index

| Record | Decision |
|---|---|
| [2026-10-14-node-sqlite.md](2026-10-14-node-sqlite.md) | Replace `better-sqlite3` with `node:sqlite`. |
| [D6-source-of-truth.md](D6-source-of-truth.md) | Source-of-truth ranking for product development. |
| [2026-11-05-ledger-event-log.md](2026-11-05-ledger-event-log.md) | Ledger as a signed, append-only event log with downloadable, verifiable records. |
| [2026-11-05-auth-contract.md](2026-11-05-auth-contract.md) | Auth contract (A1): OTP email or SMS, name step, D-A1 to D-A5. |

Open questions are tracked in [open-questions.md](open-questions.md).
