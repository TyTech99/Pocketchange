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
| `static/wireframes/` | Exists | HTML and PNG mockups. Design reference. SvelteKit serves them at `/wireframes/` (public on the preprod site). Dev port `:12000`. |
| repo root (`src/`, `package.json`, `svelte.config.js`, `vite.config.ts`) | Exists | SvelteKit app shell. Serves only the Hello World placeholder at `/`. Hostinger builds it as a Node.js web app from `main`. |
| `static/demo/` | Exists | The earlier interactive prototype (pages, API routes, `node:sqlite` code), kept as reference. Served as-is at `/demo/`. Not the architecture. |
| `production/` | Empty | Future live app code. Nothing here until Ty approves the start. |
| `docs/` | New | Plans, decisions, bot roles. |
| `artifacts/` | New | Evidence: screenshots and test output. |

## Rules

- Nothing existing is moved or deleted without Ty's yes.
- The demo is reference material in `static/demo/`. The real app is designed from the product requirements, not from the demo.
- Wireframes, the demo, and production code never share a directory.
- Each plan and decision file names an owner and a date.
- Source for the ports: `/workspace/agent-rails-uat/UAT.md`.
