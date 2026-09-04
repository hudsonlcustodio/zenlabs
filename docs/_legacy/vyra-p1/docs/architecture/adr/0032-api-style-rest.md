# ADR-0032 — Resource-oriented REST with explicit action sub-resources

**Status**: Accepted · **Authority**: brief §41

## Context
The brief requires domain resources rather than generic RPC endpoints, plus
idempotency keys, pagination, filters, uploads and approval actions.

## Decision
REST with domain resources. State-machine actions are modelled as **explicit
sub-resources** (`POST /content-items/{id}/script/approve`), each mapping to
exactly one transition. Cursor pagination. `Idempotency-Key` on effectful POSTs.
**No client-facing endpoint accepts `tenantId`.**

## Alternatives rejected
- **A generic `POST /actions` RPC endpoint** — rejected by brief §41 and because
  it defeats per-action authorization and auditing.
- **Offset pagination** — rejected: unstable under concurrent inserts and costly
  at depth.
- **Accepting `tenantId` from the client** — rejected: reintroduces the IDOR class
  that the session-derived tenant eliminates structurally.

## Consequences
- Authorization and audit attach naturally per action.
- The OpenAPI document is generated from contracts (FF-18).
