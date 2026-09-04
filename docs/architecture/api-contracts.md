# API CONTRACTS V2

## 1. Conventions

Base: `/api/v1`

Errors use RFC-style `application/problem+json`.

Stable error codes currently inherited by executable scaffold:

`unauthenticated`, `forbidden`, `not_found`, `validation_failed`, `conflict`, `idempotency_key_reuse`, `entitlement_exhausted`, `consent_revoked`, `capability_unsupported`, `provider_unavailable`, `rate_limited`, `connection_invalid`, `state_transition_not_allowed`, `internal_error`

Cursor pagination:
`?cursor=&limit=` → `{ data, nextCursor }`

Client-facing routes do not accept tenantId; tenant comes from authenticated context.

### 1.1 Error codes

`unauthenticated`, `forbidden`, `not_found`, `validation_failed`, `conflict`, `idempotency_key_reuse`, `entitlement_exhausted`, `consent_revoked`, `capability_unsupported`, `provider_unavailable`, `rate_limited`, `connection_invalid`, `state_transition_not_allowed`, `internal_error`

[PROPOSTA para implementation] adicionar códigos específicos como `budget_guard_triggered`, `policy_blocked`, `identity_not_calibrated` somente junto de code + OpenAPI + tests.

## 2. Candidate V2 resources

- `/clients`
- `/digital-twins`
- `/identity-packs`
- `/consents`
- `/production-policies`
- `/production-requests`
- `/productions`
- `/productions/{id}/plan`
- `/productions/{id}/cost-estimate`
- `/productions/{id}/approve`
- `/productions/{id}/exceptions`
- `/productions/{id}/qc`
- `/productions/{id}/release`
- `/production-packs`
- `/internal/provider-capabilities`
- `/internal/exceptions`
- `/internal/capacity`

## 3. Idempotency

Mutating commands that can be retried accept `Idempotency-Key`.

## 4. Internal routes

Internal/admin routes may accept explicit tenant filters only when authorization permits cross-tenant operations.

## 5. Provider isolation

No public DTO exposes provider-specific payloads/IDs unless explicitly diagnostic and internal.
