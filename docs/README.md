# docs/

Plan of record. Text only. Evidence goes in `../artifacts/`.

## Layout

| Path | Holds |
|---|---|
| `bots/` | One role file per bot. See `../AGENTS.md`. |
| `plans/` | Plans: launch plan, UAT plans, graft plans. One file per plan. |
| `decisions/` | Decision records: what was decided, by whom, when, and why. |

## Repo layout (current and target)

| Path | Status | Purpose |
|---|---|---|
| `wireframes/` | Exists | HTML and PNG mockups. Design reference only. Not shipped. Dev port `:12000`. |
| repo root (`src/`, `package.json`, `svelte.config.js`, `vite.config.ts`) | Exists | SvelteKit and SQLite (`node:sqlite`) prototype. Hostinger builds it as a Node.js web app from `main`. UAT dev port is `:12001`, but `package.json` currently fixes `3456`. Not production. |
| `production/` | Empty | Future live app code. Nothing here until Ty approves the start. |
| `docs/` | New | Plans, decisions, bot roles. |
| `artifacts/` | New | Evidence: screenshots and test output. |

## Rules

- Nothing existing is moved or deleted without Ty's yes.
- The prototype stays at the repo root until Ty approves a move.
- Wireframes, prototype, and production code never share a directory.
- Each plan and decision file names an owner and a date.
- Source for the ports: `/workspace/agent-rails-uat/UAT.md`.
