# ADR-0008 — Drizzle ORM as the single data access layer

**Status**: Accepted · **Authority**: brief §40

## Context
Must work with NestJS, versioned migrations, PostgreSQL, pgvector, transactions,
query safety, RLS session variables, and be maintainable by agents. Brief
requires choosing exactly one — no open alternatives.

## Decision
**Drizzle ORM** with `drizzle-kit` migrations. Single choice; no secondary ORM.

Deciding factors:
1. **RLS support** — `SET LOCAL vyra.tenant_id` must run on the same connection
   inside the transaction. Drizzle's explicit transaction handle makes this
   direct and auditable.
2. **pgvector** — custom column types are first-class, so `halfvec` and `<=>`
   operators are expressible without escaping to raw strings.
3. **SQL-first readability** — generated SQL is predictable, which matters for a
   codebase maintained largely by agents and for reviewing tenancy predicates.
4. **Migrations are plain SQL** — reviewable, and compatible with the
   expand/contract discipline.

## Alternatives rejected
- **Prisma** — rejected: its generated client historically constrains raw SQL and
  per-transaction session variables, which are load-bearing for RLS here;
  pgvector support requires escape hatches; the extra engine layer complicates
  connection-level guarantees.
- **TypeORM** — rejected: decorator-driven schema drifts from migrations, and its
  transaction/connection semantics have been a recurring source of subtle bugs.
- **Raw SQL only** — rejected: no compile-time typing of results; too easy to
  build query strings, which conflicts with FF-22.

## Consequences
- Repositories accept an explicit transaction handle carrying tenant context.
- Migrations are hand-reviewable SQL.
- Team must maintain schema/type definitions deliberately, without decorators.
