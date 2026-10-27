# Skill: penpot-wireframe

How **OpenCode** produces wireframes in Penpot, **only when Ty asks**. The default wireframes in this repo are static HTML in `static/wireframes/` (rank 4 in `docs/decisions/D6-source-of-truth.md`). The PocketChange bot does not replace them with Penpot unless Ty asks (`docs/bots/pocketchange.md`).

## When to use

- Ty asks for Penpot work.
- A new user-facing screen or a major layout change needs a visual contract, and Ty has chosen Penpot for it.

Otherwise edit the HTML files in `static/wireframes/`. Start from `static/wireframes/README.md` and `map.html`.

## Prerequisites

1. A Penpot URL from Ty. It is not stored in this repo.
2. The target file open in Penpot with **File → Connect** active. The Connect tab stays open.
3. An OpenCode session with Penpot MCP configured. Do not skip Connect and scrape the UI instead.

## Steps (OpenCode)

1. Confirm Connect is live for the correct Penpot file.
2. List and inspect existing boards. Update the existing file instead of creating orphan copies.
3. Build wireframes (structure and states): empty, happy path, validation/error, loading as needed.
4. Name frames clearly (screen + state). Keep rules and numbers in `docs/product/`. Penpot owns layout only.
5. Hand back Penpot file or board links to the coordinator for Ty's review before UI coding under `src/`.

## Must not

- Start UI implementation under `src/` before wireframes exist for the scoped screens.
- Drive Penpot by bypassing OpenCode (for example Grok Bot calling Penpot MCP directly).
- Close the Connect tab mid-session or switch files without re-Connect.
- Replace the wireframes with ASCII wireframes in markdown.
- Treat Penpot as ranking above `docs/product/` in D6.

## Related

- [`static/wireframes/README.md`](../../static/wireframes/README.md)
- [`docs/decisions/D6-source-of-truth.md`](../../docs/decisions/D6-source-of-truth.md)
- [`docs/product/MVP-SCREENS.md`](../../docs/product/MVP-SCREENS.md)
- [`rules/opencode.md`](../../rules/opencode.md)
