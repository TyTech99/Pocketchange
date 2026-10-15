# Pocket Change MVP — Agent API + OAuth 2.1 sketch

Status: MVP design sketch; endpoint names and JSON are provisional. This API is an additional client surface over the same Pocket Change rules used by web and SMS. It does not change the product stance: *friends & family loan tracker; we never touch your money.*

## Non-negotiable boundaries

- Agents are first-class Pocket Change clients. An agent may help a person **propose**, **agree**, and record or clarify **payments**, subject to that person's delegated scopes.
- An agent is never a hidden party to a loan and cannot consent for the other party. The same two-party **mutual agree** gate used by the web UI applies to API calls.
- Pocket Change records proposals, agreements, payment evidence, ledger applications, reminders, and audit history. Pocket Change never holds, routes, initiates, or moves funds.
- There is no `money:move`, bank/card write, payout, collection, or “auto-agree” permission in MVP.
- Agent-originated work follows the same SMS doorbell/web handoff rule: complex terms, change requests, disputes, and clarification resolve on a page or an equivalent explicitly authorized API intent, not a multi-turn SMS wizard.

## OAuth 2.1 / delegated authorization

Use OAuth 2.1 Authorization Code + PKCE (`S256`) for agent clients. Do not use the implicit grant or resource-owner-password grant. TLS is required.

Illustrative issuer endpoints:

```text
GET  https://auth.personalloantracker.io/oauth/authorize
POST https://auth.personalloantracker.io/oauth/token
POST https://auth.personalloantracker.io/oauth/revoke
GET  https://auth.personalloantracker.io/.well-known/oauth-authorization-server
```

An agent starts authorization with a registered `client_id`, exact pre-registered `redirect_uri`, `response_type=code`, `code_challenge`, `code_challenge_method=S256`, `state`, and the minimum requested scopes. OpenID Connect may add `nonce` and identity claims, but the API only trusts the resulting issuer/audience-bound access token.

Access tokens are short-lived bearer tokens for the Pocket Change API audience. Refresh tokens, when issued to an eligible client, rotate on use and can be revoked. The API validates issuer, audience, expiry, client, user subject, and scopes; it never accepts a caller-supplied user ID as proof of delegation.

### Scopes (MVP sketch)

| Scope | Allows | Does not allow |
|---|---|---|
| `profile:read` | Read the consenting user's basic profile | Read another party's private profile |
| `loans:read` | Read loans and permitted ledger/event views | Change terms or status |
| `loans:propose` | Create/update the user's own draft proposal | Send an agreement on behalf of the other party |
| `loans:agree` | Submit that user's agreement or change request | Satisfy the other party's agreement |
| `payments:read` | Read payment evidence and ledger results visible to the user | Move or withdraw money |
| `payments:propose` | Submit a payment receipt/application intent for review or configured immediate recording | Initiate a transfer |
| `clarify:respond` | Answer one pending payment clarification for the user | Turn clarification into an unrelated loan |
| `addons:propose` | Propose a **tab add-on** (add to running-tab balance under existing yardstick) | Rebalance a funded fixed-purpose loan; change terms without the other party's agreement |
| `webhooks:manage` | Manage this user's event subscriptions | Subscribe to another user's events |

No MVP scope grants household-wide access. A client must request only what it needs; the user can deny or later revoke consent.

### Act-as-user and audit context

“Act as user” is a delegated authorization mode, not impersonation. The authorization screen names the agent, the user, requested scopes, and (when available) the specific loan. The issued token is bound to the consenting user and client, for example:

```json
{
  "iss": "https://auth.personalloantracker.io",
  "aud": "https://api.personalloantracker.io",
  "sub": "usr_123",             
  "client_id": "agent_acme",
  "scope": "loans:read loans:propose payments:propose",
  "token_use": "delegated_agent"
}
```

The API derives the acting user from `sub`; an `act_as_user` request field or header is never accepted as a way to switch users. Any future service-to-service token exchange must produce the same explicit delegated subject and be limited to registered clients.

Every read and mutation carries an append-only **via-agent audit** record with at least:

```json
{
  "request_id": "req_...",
  "actor_type": "agent",
  "actor_id": "agent_acme",
  "client_id": "agent_acme",
  "subject_user_id": "usr_123",
  "via_agent": true,
  "scopes": ["payments:propose"],
  "created_at": "2026-09-26T...-07:00"
}
```

The audit trail records the agent/client and the user it acted for, including denied attempts and resulting state changes. It is visible to the relevant user and cannot be edited by the agent.

## Intent-oriented API surface

Base URL: `https://api.personalloantracker.io/v1`. JSON resource names below are illustrative. The server should expose intent records rather than a generic unrestricted state-update endpoint.

All POSTs require an `Idempotency-Key` and return the intent's stable ID, status, and resulting resource links. A repeated key with the same authenticated client, subject, route, and request hash returns the original result; a different body with that key returns `409 idempotency_conflict`.

### `propose`

```http
POST /v1/proposals
Authorization: Bearer <access-token>
Idempotency-Key: prop_01...
```

Creates or updates a draft proposal for the authorized drafter. It includes the nickname, parties/contact handles, principal, pricing mode, schedule, late policy, receipt trust, and optional note. Creating a proposal never activates monitoring, charges anyone, or marks funding. Sending the invite is a separate server-side action governed by the same OTP/anti-spam checks as web.

Typical states: `draft`, `invite_pending`, `awaiting_other_party`, `change_requested`, `expired`, `mutually_agreed`.

### `agree`

```http
POST /v1/loans/{loan_id}/agreement-intents
Authorization: Bearer <access-token>
Idempotency-Key: agree_01...
```

Submits the authorized user's `agree` or `request_change` intent against the terms/version shown. The server rejects stale versions and treats one party's agreement as `awaiting_other_party`; only two valid, current, separate party consents produce `mutually_agreed`. An agent cannot submit the other party's consent, skip the web-equivalent review, or activate reminders by itself.

### `apply_payment`

```http
POST /v1/payment-applications
Authorization: Bearer <access-token>
Idempotency-Key: pay_01...
```

Records a receipt/evidence or a user's paid/partial/paid-off claim and asks Pocket Change to match it to a loan. It may result in `pending_clarification`, `pending_confirmation`, or `applied` according to the loan's agreed receipt-trust setting. `applied` means a Pocket Change ledger entry and dual notification—not a transfer. Ambiguous matches create one `clarify` intent; ignored clarification remains pending rather than triggering a chase loop.

### `clarify`

```http
POST /v1/clarifications/{clarification_id}/responses
Authorization: Bearer <access-token>
Idempotency-Key: clarify_01...
```

Accepts one offered match/split, marks the evidence as not-a-loan-payment, or requests the web flow. Responses are constrained to the presented choices and expire. They cannot silently create a new loan or alter terms.

### `addon` (tab add-on only)

```http
POST /v1/loans/{loan_id}/addon-intents
Authorization: Bearer <access-token>
Idempotency-Key: addon_01...
```

Proposes a **running-tab add-on**: amount, note/evidence, and yardstick preview (weeks-left or payment-to-hit-date). Adds to the tab balance under the existing yardstick — **no** keep-length / keep-payment rebalance. The other party must review and mutually agree before the balance contract changes.

**Out of MVP / deprecated:** fixed-purpose pile-on rebalance intents. A funded fixed loan stays the agreed contract; incidental extras use this tab `addon` (when a tab exists) or a new `propose` for a real new purpose. The server rejects `addon` against a fixed-purpose loan.

## Webhooks and events

A user with `webhooks:manage` may register an HTTPS endpoint. Deliveries use a unique `event_id`, `delivery_id`, event type, resource version, and a timestamped HMAC signature (for example `X-Pocket Change-Signature: t=...,v1=...`). Consumers must verify the signature, reject stale timestamps, deduplicate `event_id`, and return a 2xx only after durable handling. Pocket Change retries with backoff; delivery is at-least-once, not exactly-once.

Initial event vocabulary:

```text
proposal.created
proposal.invite_sent
agreement.requested
agreement.change_requested
loan.mutually_agreed
loan.funded_marked
payment_application.received
payment_application.clarification_requested
payment.applied
addon.proposed
addon.mutually_agreed
loan.disputed
loan.paused
loan.paid_off
```

Events are notifications, not authorization. A webhook cannot approve an agreement or cause money movement. Payloads should contain IDs, state/version, actor/audit context, and only the minimum personal data needed for the subscriber; fetch details with a scoped token.

## Common API rules and errors

- `401` invalid/expired token; `403` missing scope, wrong subject, or party permission; `404` hidden or absent resource; `409` stale version, invalid lifecycle transition, duplicate/conflicting idempotency key, or agreement not mutually complete; `422` invalid terms or schedule; `429` rate limit.
- Mutations use resource versions/ETags where concurrent web, SMS, and agent edits can collide. Never last-write-wins over a consent or ledger decision.
- Sensitive receipt content is minimized and retained under the same user-visible privacy rules as email/SMS evidence. Never put access tokens or secrets in webhook payloads, URLs, SMS, or audit notes.

## MCP wrapper (later, optional)

MCP is not an MVP auth or transport bypass. If added later, it is a thin tool wrapper over these same API resources and OAuth access tokens: same issuer/audience, scopes, user-bound subject, idempotency keys, webhook/event semantics, audit entries, and mutual-agree/money boundaries. MCP must not get a privileged direct-database tool or a second long-lived secret. REST remains the source of truth and every MCP tool call maps to an auditable intent.

## Household capability grants (roadmap)

Post-MVP, a user may grant a named household delegate narrowly scoped capabilities, such as `loan:read` or `payment:propose` for selected loans, with an expiry, notification, and immediate revocation. Grants must be explicit, least-privilege, visible to both parties where appropriate, and separate from shared household membership. They do not grant `agree` for another party, bypass mutual agreement, or move money. Multi-borrower household splits remain out of MVP.

## Relationship to MVP screens and use cases

- Web screens remain the canonical review surface for terms, consent, disputes, and **tab add-on** (fixed pile-on rebalance is deprecated); see `MVP-SCREENS.md`.
- Lifecycle, SMS doorbell, receipt trust, and “never touch your money” rules remain canonical in `MVP-USE-CASES.md`.
- This sketch describes how a delegated agent can reach the same flows; it does not expand MVP scope or turn SMS into a chatbot.

## Explore during implementation: Jev (TypeSafe AI)

**Not a stack replacement.** Jev is TypeSafe AI’s hosted System One decision model — typed Choice / Score / yes-no with calibrated probabilities; closed weights; ~$0.042/M input tokens, output free. It complements the SvelteKit + SQLite + OAuth 2.1 agent API; it does not replace it.

**Explore for:** routing ambiguous payments, soft-confirm risk scoring, and agent auto-agree gates (confidence thresholds → human tap when unsure). Same mutual-agree and never-touch-money rules still apply. See also the OAuth agent flow wireframes / `/oauth-agent` app demo for human-in-the-loop prefs this would gate.

## Wireframe demo (OAuth agent)

Clickable mid-fi screens for this sketch live under the wireframes host:
`oauth-agent.html` (flow map) → `oauth-agent-consent.html` → `oauth-agent-draft.html` ($200 vet onto Household tab, fixed $50/Fri) → `oauth-agent-agree.html` (Mom’s agent soft confirm) → `oauth-agent-ledger.html` (payment SMS doorbell + via-agent ledger badge) → `oauth-agent-prefs.html` (auto-agree in *my* scope vs require my tap). Existing propose/tab/agree screens stay intact; the OAuth agent is an additional client surface over the same mutual-agree and never-touch-money rules.
