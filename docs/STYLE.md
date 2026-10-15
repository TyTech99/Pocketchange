# Style (weakest rung)

Prefer encoding rules **up** the ladder ([`RAILS.md`](RAILS.md)) over growing this file.

## Defaults

- **Conventional commits**: `feat:`, `fix:`, `docs:`, `rails:`, `ci:`, `test:`, `chore:`
- **No secrets** in commits, logs, or PRs
- **Prefer the paved path**: app code in `src/`, tests in `tests/`, layout in `docs/README.md`
- Keep PRs reviewable; one coherent change set

## Human review required

Escalate to a human (do not auto-merge / auto-claim) for:

- ACL / auth / security-sensitive changes
- Production secrets or credential rotation
- Architecture exceptions (new top-level folders, bypassing `src/` / `tests/`)

Ty decides. Nothing goes to `main` without Ty's go-ahead.

## Anti-pattern

Do not add style bullets for recurring bugs — add a test, lint rule, or delete the hack.
