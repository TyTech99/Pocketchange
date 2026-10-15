# AGENTS.md

Pocket Change (`TyTech99/Pocketchange` on GitHub, the source of truth; also personalloantracker / PLT). This file says which bot owns what. Details are in `docs/bots/`.

## Bots

| Bot | Owns | Detail |
|---|---|---|
| PocketChange Launch | Path from wireframes to live production | [docs/bots/pocketchange-launch.md](docs/bots/pocketchange-launch.md) |
| PocketChange | Project orchestration: repo layout, agent-rails graft, UAT plans | [docs/bots/pocketchange.md](docs/bots/pocketchange.md) |
| loanbot | Personal Loan Tracker prototype build | [docs/bots/loanbot.md](docs/bots/loanbot.md) |

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
- UAT ports: wireframes `:12000`, Svelte app `:12001` (`/workspace/agent-rails-uat/UAT.md`).
- Prototype source: the repo root (`src/`). It uses `node:sqlite`. Hostinger builds it as a Node.js web app from `main`.
