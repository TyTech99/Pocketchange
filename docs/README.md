# docs/

Plan of record. Text only. Evidence goes in `../artifacts/`.

## Layout

| Path | Holds |
|---|---|
| `bots/` | One role file per bot. See `../AGENTS.md`. |
| `product/` | Product requirements: `MVP-USE-CASES.md`, `MVP-SCREENS.md`, `MVP-API.md`. `MVP-SCREENS.md` follows the wireframes in `../static/wireframes/`. |
| `plans/` | Plans: launch plan, UAT plans, graft plans. One file per plan. |
| `decisions/` | Decision records: what was decided, by whom, when, and why. |

## Repo layout (current and target)

| Path | Status | Purpose |
|---|---|---|
| `static/wireframes/` | Exists | HTML and PNG mockups. Design reference. SvelteKit serves them at `/wireframes/` (public on the preprod site). Dev port `:12000`. |
| repo root (`src/`, `package.json`, `svelte.config.js`, `vite.config.ts`) | Exists | SvelteKit app. `/` is the Hello World placeholder. The earlier prototype is reference material at `src/routes/demo/` and `src/lib/demo/`, served at `/demo/`. Not the architecture. Hostinger builds it as a Node.js web app from `main`. UAT dev port is `:12001`, but `package.json` currently fixes `3456`. Not production. |
| `production/` | Empty | Future live app code. Nothing here until Ty approves the start. |
| `docs/` | New | Plans, decisions, bot roles. |
| `artifacts/` | New | Evidence: screenshots and test output. |

## Rules

- Nothing existing is moved or deleted without Ty's yes.
- The demo is reference material in `src/routes/demo/` and `src/lib/demo/`. The real app is designed from the product requirements, not from the demo.
- Wireframes, the demo, and production code never share a directory.
- Each plan and decision file names an owner and a date.
- UAT ports are explained in `plans/2026-10-14-tdd-and-e2e-strategy.md`.
