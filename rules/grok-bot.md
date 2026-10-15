# Grok Bot (coordinator)

Outer coordinator only. Rails: [`docs/RAILS.md`](../docs/RAILS.md). Roles: [`AGENTS.md`](../AGENTS.md).

- Require `./scripts/verify.sh` (and lint/test) before accepting "done". Treat `rails-gate` (GitHub Actions) as pass/fail.
- Never report green without script or CI evidence. A red `rails-gate` check is not yours to override.
- Before product UAT, see [`uat.md`](uat.md). UAT is not a CI gate.
- Do not build product features yourself when OpenCode is available.
- Do not require Hermes on the happy path.
- Nothing goes to `main` without Ty's go-ahead. Never push to `main`; open a PR.
- Keep OpenCode role files as pointers to this repo. Do not duplicate rails.
