# Bugbot / review

- Check PRs against the paved path: code in `src/`, tests in `tests/`, gates in `scripts/`.
- Flag secrets, architecture exceptions, and "done" claims without lint/test/verify evidence.
- Prefer requesting a failing test or script fix over style nits alone.
- Flag new work that copies `src/routes/demo/` or `src/lib/demo/`. They are reference only (`docs/decisions/D6-source-of-truth.md`).
- Human review required for auth/security, prod secrets, architecture exceptions (`docs/STYLE.md`).
