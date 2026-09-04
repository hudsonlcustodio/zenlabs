# ADR-0006 — Shared schema with PostgreSQL Row-Level Security

**Status**: Accepted · **Authority**: brief §7, §33

## Context
Multi-tenant from the first schema. Threats: tenant escape, IDOR, queries without
a tenant filter, jobs running under the wrong tenant, cross-tenant embedding
retrieval.

## Decision
**Shared database, shared schema, `tenant_id` on every client-owned table,
enforced by RLS with `FORCE ROW LEVEL SECURITY`**, with `SET LOCAL
vyra.tenant_id` per transaction. Four defence layers per `architecture.md` §5.

## Alternatives rejected
- **Schema per tenant** — rejected: migration cost grows linearly with tenants;
  connection/search_path management becomes the new failure mode.
- **Database per tenant** — rejected: operationally disproportionate for a
  one-user-per-tenant MVP; cross-tenant internal operations become hard.
- **Application-only filtering** — rejected: a single forgotten `WHERE` is a
  breach. The database must be the backstop.

## Consequences
- The app role must not own tables and must not have `BYPASSRLS`.
- Every new client-owned table must ship RLS in the same migration (FF-01).
- `SET LOCAL` is transaction-scoped, making connection pooling safe.
