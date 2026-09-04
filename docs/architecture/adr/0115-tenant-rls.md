# ADR-0115 — Tenant isolation with PostgreSQL RLS backstop

**Status:** Proposed / preserved

## Decision
Shared schema, tenant_id on client-owned records, FORCE RLS where applicable, transaction-local tenant context.

Application authorization remains required; RLS is defense-in-depth.
