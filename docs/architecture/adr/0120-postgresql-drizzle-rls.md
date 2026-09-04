# ADR-0120 — PostgreSQL 17 + Drizzle + RLS

**Status:** Proposed

## Decision
Use Amazon RDS PostgreSQL 17 as transactional source-of-truth.

Use `pg` + Drizzle ORM with reviewable SQL migrations.

Every client-owned table includes `tenant_id`; RLS is a defense-in-depth backstop.

Transactional outbox shares the same database transaction as the domain change.
