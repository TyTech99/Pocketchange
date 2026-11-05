# AGENTS.md

Pocket Change (`TyTech99/Pocketchange` on GitHub, the source of truth). This file assigns roles any coding-agent team can fill. Historical bot profiles stay in `docs/bots/` as reference only.

## Start here

1. [`README.md`](README.md)
2. Plan of record: [`docs/product/MVP-USE-CASES.md`](docs/product/MVP-USE-CASES.md), [`MVP-SCREENS.md`](docs/product/MVP-SCREENS.md), [`MVP-API.md`](docs/product/MVP-API.md), [`static/wireframes/`](static/wireframes/)
3. Decisions: [`docs/decisions/`](docs/decisions/) — start with D6, node-sqlite, the 2026-11-05 ledger event log, and the 2026-11-05 auth contract
4. Build order: [`docs/plans/2026-10-14-auth-first-task-list.md`](docs/plans/2026-10-14-auth-first-task-list.md) — do A2 through A8 in order (A1 is done)
5. Non-blocking open items: [`docs/decisions/open-questions.md`](docs/decisions/open-questions.md)

Agents own technical decisions. Ty owns product concept and scenarios. Bring product questions to Ty one at a time, with plain-words context. Agents decide tech without asking him.

## Roles

| Role | Owns |
|---|---|
| **Ty** | Product owner: concept, scenarios, and approvals. Nothing goes to `main` without his explicit go. One go covers one action only. |
| **Coordinator** (also called Reviewer) | Plans, records tech decisions, checks evidence before anything is called done. See [`rules/coordinator.md`](rules/coordinator.md). |
| **Builder** | Writes app code and tests under `src/` and `tests/`. See [`rules/builder.md`](rules/builder.md). |
| **Deployer** | Preprod at `pocketchange.afterthedemo.com` (Hostinger Node.js from `main`). Confirms live behavior after merge. |

Optional companion notes: [`rules/hermes.md`](rules/hermes.md). Review checklist: [`rules/bugbot.md`](rules/bugbot.md). Product UAT: [`rules/uat.md`](rules/uat.md).

Retired bot profiles (PocketChange Launch, PocketChange, loanbot) are historical only: [`docs/bots/`](docs/bots/). Use the roles above.

## Rails

Full ladder: [`docs/RAILS.md`](docs/RAILS.md). The gate is `.github/workflows/rails-gate.yml`.

### Mandatory

1. Read [`docs/RAILS.md`](docs/RAILS.md) and [`docs/decisions/D6-source-of-truth.md`](docs/decisions/D6-source-of-truth.md) before changing structure.
2. Stay on the paved path: app code in `src/`, tests in `tests/`, gates in `scripts/` + GitHub Actions. The demo in `src/routes/demo/` is reference only; do not copy it as a pattern.
3. Encode fixes **up** the ladder (codebase → static analysis → rules → skills → style). Do not paper over misses with style bullets.
4. Never claim green without **script/CI evidence** (`./scripts/lint.sh`, `./scripts/test.sh`, `./scripts/verify.sh` exit 0).
5. Run those scripts from the repo root before claiming done.
6. Do not invent top-level folders outside the layout in [`docs/README.md`](docs/README.md).
7. No secrets in git. No bypassing CI. Env var names only in docs and chat.
8. **UI:** wireframes before build. They are static HTML in `static/wireframes/`. Use Penpot only when Ty asks ([`skills/penpot-wireframe/SKILL.md`](skills/penpot-wireframe/SKILL.md)).
9. **Product UAT:** before human product review, serve wireframes on `:12000` and the app on `:12001`. Not a `rails-gate` check. See [`rules/uat.md`](rules/uat.md) and `docs/plans/2026-10-14-tdd-and-e2e-strategy.md`.

### Out of scope

- Gates are GitHub Actions + scripts, not chat assertions.
- UAT ports: wireframes `:12000`, Svelte app `:12001` (see `docs/plans/2026-10-14-tdd-and-e2e-strategy.md`).
- The earlier prototype is reference material in `src/routes/demo/` and `src/lib/demo/` (served at `/demo/`). It is not the architecture. It uses `node:sqlite`. Hostinger builds the repo as a Node.js web app from `main`.
