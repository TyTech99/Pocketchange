# Skill: feature-map

Keep [`FEATURE_MAP.md`](FEATURE_MAP.md) accurate so agents know where features live and how to verify them.

## When to update

- New user-facing behavior
- Moved routes or modules under `src/`
- Changed verify steps (URL, curl, test file, script)
- A "none yet" verify cell gets a real test

## Format

Table columns: Feature | Where | How to verify

- Every path in **Where** must exist on `main`. Check before you commit.
- **How to verify** is either a command or the words "none yet". Never leave it blank and never invent a command.
- Production features (auth, loans, and so on) get a row only when code for them exists. Until then they are specified in `docs/product/` and listed under "Not built yet" in the map.
