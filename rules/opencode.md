# OpenCode

- Load root [`AGENTS.md`](../AGENTS.md) and [`docs/RAILS.md`](../docs/RAILS.md).
- Build only under `src/` and `tests/` unless `docs/README.md` (repo layout) is updated in the same PR and `scripts/verify.sh` still passes.
- Source of truth for what to build: `docs/decisions/D6-source-of-truth.md`. The demo is reference only.
- Write the failing test first: `docs/plans/2026-10-14-tdd-and-e2e-strategy.md`.
- Before claiming done: `./scripts/lint.sh && ./scripts/test.sh && ./scripts/verify.sh` (exit 0). Use Node 22.13 or newer.
- Encode recurring misses up the ladder. Prefer tests/scripts over new prose.
- Grok Bot coordinates. You build.
- Update `skills/feature-map/FEATURE_MAP.md` when user-facing behavior changes.
- **Wireframes:** static HTML in `static/wireframes/`. Use Penpot only when Ty asks. See [`skills/penpot-wireframe/SKILL.md`](../skills/penpot-wireframe/SKILL.md).
- **Product UAT:** see [`uat.md`](uat.md). Not part of `rails-gate`.
