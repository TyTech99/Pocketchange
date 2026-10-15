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

## Repo state at time of writing

- Branch: `main` only.
- History: see `git log`. The first commits are `9e80a91` (initial, grokbot_ty) and `5c4fb21` (Ty, 2026-09-28).
- UAT ports: wireframes `:12000`, Svelte app `:12001` (see `docs/plans/2026-10-14-tdd-and-e2e-strategy.md`).
- The earlier prototype is reference material in `src/routes/demo/` and `src/lib/demo/` (served at `/demo/`). It is not the architecture. It uses `node:sqlite`. Hostinger builds the repo as a Node.js web app from `main`.
