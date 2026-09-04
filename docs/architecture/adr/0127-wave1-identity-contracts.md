# ADR-0127 — Wave 1 identity contracts before persistence

**Status:** Accepted and implemented in memory

## Decision

Implement the first vertical slice contract-first. Tenant, Client, Consent,
DigitalTwin, IdentityPack and AuditEvent are defined as Zod contracts in
`@zenlabs/contracts`, with tenant scope and lifecycle invariants enforced at
the schema boundary.

Persistence migrations, authentication integration and provider adapters remain
out of scope until their respective gates. The application layer must consume
these contracts without importing provider SDKs or database drivers into the
domain.

## Invariants

- client-owned records carry `tenantId`;
- revoked consent requires `revokedAt`;
- DigitalTwin identity is ZENLABS-owned and has no provider identity field;
- identity-bearing operations must reference a consent record;
- AuditEvent is tenant-scoped and append-only by policy.

## Evidence

Contract tests cover the complete Tenant → Client → Consent → DigitalTwin →
IdentityPack → AuditEvent chain and reject missing tenant scope or invalid
consent state. Application tests additionally cover calibrated-pack activation,
idempotent consent revocation, audit emission and post-revocation blocking.

Residual risk: the in-memory store is not durable and the service is not yet
bound to an authenticated HTTP surface; both are explicit follow-up gates.
