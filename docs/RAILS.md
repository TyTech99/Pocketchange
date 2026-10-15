# Agent rails — five things

When an agent is wrong, encode the lesson on the **highest** rung that will hold. Do not add a style-guide bullet if a paved path, lint, hook, or skill can catch it.

Source: poteto "if you only remember these 5 things" (correct-the-agent ladder).
Talk: https://x.com/poteto/status/2102050467505430555

This file was ported from the generic `agent-rails` scaffold and adapted to Pocket Change: SvelteKit, TypeScript, `node:sqlite`, Node 22.13 or newer, GitHub Actions, Hostinger Node.js deploy.

## Status

Status when this file was written. Delete this section when PR #8 merges.

- The gate is `.github/workflows/rails-gate.yml`. It runs the jobs `lint`, `test` and `verify`.
- The gate, `scripts/lint.sh`, `scripts/test.sh`, `scripts/verify.sh`, `.github/CODEOWNERS` and `tests/unit/` land with PR #8. They are not on `main` yet.
- Until PR #8 merges, no script or CI run can prove "done". Say so; do not claim green.

## Strong → weak

| # | Rung | What it is | In this repo |
|---|------|------------|--------------|
| 1 | **Codebase** | One paved path. Delete the hack so the next agent cannot copy it. | `src/`, `tests/` (PR #8), `skills/feature-map/FEATURE_MAP.md`, `docs/README.md` (repo layout) |
| 2 | **Static analysis** | Lint / test / CI. Mechanical refuse. | `scripts/lint.sh`, `scripts/test.sh`, `scripts/verify.sh` and `.github/workflows/rails-gate.yml` (all PR #8) |
| 3 | **Rules / hooks** | Fires on the tool call. | Root `AGENTS.md`, `rules/`, `.github/pull_request_template.md` |
| 4 | **Skills** | How to run and prove the work. | `skills/verify/`, `skills/feature-map/`, `skills/playbooks/` |
| 5 | **Style guide** | Weakest. Prose you hope the model remembers. | `docs/STYLE.md`. Do not grow this when a higher rung can take the rule. |

## How to encode a correction

| Miss | Put it here | Not here |
|------|-------------|----------|
| Copied a workaround | Delete it; one path in `src/` + feature-map row | A comment that teaches the workaround |
| Same class of bug | Test or lint (`scripts/*`) | Another paragraph in `AGENTS.md` |
| Sloppy commit / secrets | Hook or CI check | Commit-message essay only |
| Claimed done without running the app | `skills/verify` + feature-map verify column | Chat "tests passed" |
| Tone / wording only | Short note in `docs/STYLE.md` | A new markdown file |

## Process

- **Gardener** — pull weeds. Agents copy hacks as patterns. The demo in `src/routes/demo/` is reference only (`docs/decisions/D6-source-of-truth.md`). Do not copy it as a pattern.
- **No justifying comments** — fix the path.
- **Hard boundaries** — structure/tooling over memory.
- **Done** — evidence from verify skill + scripts exit 0. Unit green alone is not enough.

## Related

- [`AGENTS.md`](../AGENTS.md) — constitution and nine mandatory rules
- [`STYLE.md`](STYLE.md) — weakest rung
- [`../skills/verify/SKILL.md`](../skills/verify/SKILL.md) — how to prove work
- [`plans/2026-10-14-tdd-and-e2e-strategy.md`](plans/2026-10-14-tdd-and-e2e-strategy.md) — TDD and end-to-end plan (proposed)
