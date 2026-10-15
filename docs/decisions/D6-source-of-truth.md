# D6: Source of truth for PocketChange product development

Date: 2026-10-14
Decided by: Ty
Status: Decided
Source of truth: GitHub, `TyTech99/Pocketchange`.
Replaces: nothing. The earlier demo-as-reference rule in `docs/README.md` stays and is made specific here.

## Decision

Source of truth for PocketChange product development, in this ranking:

| Rank | Artifact | Role |
|---|---|---|
| 1 | `docs/product/MVP-USE-CASES.md` | Behavior spec. The full lifecycle: propose, agree, fund, pay, dispute, pause. Two contract types: basic loan and revolving credit (the docs call them fixed-purpose loan and running tab). Foul-weather paths. |
| 2 | `docs/product/MVP-SCREENS.md` | UI spec. |
| 3 | `docs/product/MVP-API.md` | Interface sketch. |
| 4 | `static/wireframes/` | Visual reference. |
| 5 | `src/routes/demo/` | Reference only, specifically for the inbound SMS parsing concept: parsing PayPal, Zelle, Venmo and Cash App payment notifications. It is not the architecture and not the source of truth. |

## Known contradictions

The docs contain known contradictions and gaps:
- pricing modes
- auto-agree wording
- missing API routes for mark funded, pause, dispute, cancel and late fee

These are resolved as decisions, each recorded in this folder. They are not resolved by switching to another source.

## Note

The `docs/product/` paths exist on `main` once the housekeeping pull request (#6) is merged.
