# AGENTS.md

Pocket Change (`TyTech99/Pocketchange` on GitHub, the source of truth). This file says which bot owns what. Details are in `docs/bots/`.

## Bots

| Bot | Owns | Detail |
|---|---|---|
| PocketChange Launch | Path from wireframes to live production | [docs/bots/pocketchange-launch.md](docs/bots/pocketchange-launch.md) |
| PocketChange | Project orchestration: repo layout, agent-rails graft, UAT plans | [docs/bots/pocketchange.md](docs/bots/pocketchange.md) |
| loanbot | Built the prototype. It is reference only (`src/routes/demo/`, `src/lib/demo/`) and does not own the build. | [docs/bots/loanbot.md](docs/bots/loanbot.md) |

## Other actors

- **Grok Bot** orchestrates the bots. It made the initial commit as `grokbot_ty` (9e80a91).
- **OpenCode** is an external coding tool on OmarMacMini. It does the code edits.
- **Ty** approves plans and decides priorities.

## Rules

- Present plans to Ty for approval before any clone, graft, or conversion.
- App code is written by OpenCode, not by the PocketChange bot.
- Bots stay inside the limits in their own file.

## Rails

Short rules for **OpenCode**, **Hermes**, and **Grok Bot**. Full ladder: [`docs/RAILS.md`](docs/RAILS.md). The gate is `.github/workflows/rails-gate.yml`.

### Mandatory

1. Read [`docs/RAILS.md`](docs/RAILS.md) and [`docs/decisions/D6-source-of-truth.md`](docs/decisions/D6-source-of-truth.md) before changing structure.
2. Stay on the paved path: app code in `src/`, tests in `tests/`, gates in `scripts/` + GitHub Actions. The demo in `src/routes/demo/` is reference only; do not copy it as a pattern.
3. Encode fixes **up** the ladder (codebase → static analysis → rules → skills → style). Do not paper over misses with style bullets.
4. Never claim green without **script/CI evidence** (`./scripts/lint.sh`, `./scripts/test.sh`, `./scripts/verify.sh` exit 0).
5. Run those scripts from the repo root before claiming done.
6. Do not invent top-level folders outside the layout in [`docs/README.md`](docs/README.md).
7. No secrets in git. No bypassing CI.
8. **UI:** wireframes before build. They are static HTML in `static/wireframes/`. Use Penpot only when Ty asks ([`skills/penpot-wireframe/SKILL.md`](skills/penpot-wireframe/SKILL.md)).
9. **Product UAT:** before human product review, serve wireframes on `:12000` and the app on `:12001`. Not a `rails-gate` check. See [`rules/uat.md`](rules/uat.md) and `docs/plans/2026-10-14-tdd-and-e2e-strategy.md`.

### Roles

Ownership is in the **Bots** table above. On the rails:

- **Grok Bot** — outer coordinator only; see `rules/grok-bot.md`. Does not replace OpenCode or own pass/fail.
- **PocketChange** — owns repo layout, the agent-rails graft and UAT plans; see `docs/bots/pocketchange.md`. Writes no app code.
- **PocketChange Launch** — owns the test strategy and the path to production; see `docs/bots/pocketchange-launch.md`.
- **OpenCode** — builds features and tests; see `rules/opencode.md`. Wireframes via Penpot MCP only when Ty asks: `skills/penpot-wireframe/SKILL.md`.
- **Hermes** — optional always-on; see `rules/hermes.md`. Off by default on the happy path.
- **Ty** — approves plans, sets priorities, reviews rail paths. Nothing goes to `main` without Ty's go-ahead.

### Out of scope

- No Grok Build discovery/PM/sign-off theatre.
- Gates are GitHub Actions + scripts, not chat assertions.

## Repo state at time of writing

- Branch: `main` only.
- History: see `git log`. The first commits are `9e80a91` (initial, grokbot_ty) and `5c4fb21` (Ty, 2026-09-28).
- UAT ports: wireframes `:12000`, Svelte app `:12001` (see `docs/plans/2026-10-14-tdd-and-e2e-strategy.md`).
- The earlier prototype is reference material in `src/routes/demo/` and `src/lib/demo/` (served at `/demo/`). It is not the architecture. It uses `node:sqlite`. Hostinger builds the repo as a Node.js web app from `main`.
