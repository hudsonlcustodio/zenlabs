---
id: P2
title: "Data foundation and tenancy"
status: generated
depends_on: [P1]
---

# Epic P2 — Data foundation and tenancy

- **Epic ID**: `P2`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 1
- **Status**: `generated`
- **Wave**: 2
- **Priority**: P0
- **Depends on**: `P1`
- **Blocks**: `P3`, `P6`, `P7`, `P9`, `P16`, `P17`
- **Story points (epic total)**: 48
- **Stories**: 11
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Make tenancy a property of the database rather than of developer discipline. After this epic it must be impossible to add a client-owned table without RLS and still have CI pass.

**Goals**
- G1 `packages/database` with Drizzle, migration tooling and a destructive-change detector.
- G2 The tenancy and identity core tables: `tenant`, `user`, `membership`, `session`, `audit_record`.
- G3 RLS policies plus the `vyra_migrator` / `vyra_app` role split, where the application role is not the table owner and lacks `BYPASSRLS`.
- G4 A `TenantContext` repository primitive that opens every transaction with the tenant GUC set.
- G5 Tenancy isolation tests (class 7) green against two seeded tenants.

**Non-goals**
- NG1 No authentication logic; `user` and `session` are tables here, behaviour is P3.
- NG2 No business tables beyond the tenancy and audit core.
- NG3 No ledger tables (P6) and no content tables (P8).

**Acceptance evidence**
- AE1 A new client-owned table without an RLS policy fails FF-01.
- AE2 Tenant A cannot read or write tenant B by any repository path (class 7).
- AE3 An UPDATE or DELETE against `audit_record` fails at the database level (FF-11).

**Assumptions**
- ASM-P2-01 The destructive-change detector's blocking list is drawn from `migrations.md`; additions require review rather than silent edits.

---

## Architecture Spec Summary

**Affected surfaces**: `packages/database`, PostgreSQL schema and roles, migration tooling, `tests/tenancy/`, `tests/migrations/`.

**Integration points**: PostgreSQL with pgvector (ADR-0007) for later epics; LocalStack is not required by this epic.

**Risks**
- RISK-07 cross-tenant leakage - Critical. Mitigated by four-layer defence in `architecture.md` §5, of which the database layer is authoritative.
- Retrofitting tenancy after business tables exist is treated as a breach, which is why this epic precedes every domain epic.

**References (by path)**
- `docs/architecture/architecture.md` §5
- `docs/architecture/database-schema.md` §1, §2, §2.1, §3.1, §4
- `docs/architecture/adr/0006-tenancy-isolation.md`
- `docs/architecture/adr/0007-postgresql-pgvector.md`
- `docs/architecture/adr/0008-orm-data-access.md`
- `docs/architecture/migrations.md`
- `docs/architecture/fitness-functions.md` FF-01, FF-11, FF-22

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | [N/A] | Routes begin in P3. |
| DB | `tenant`, `user`, `membership`, `session`, `audit_record`; RLS policy per client-owned table; roles `vyra_migrator`, `vyra_app` | `database-schema.md` §2, §3.1; nullable-`tenant_id` exceptions per §2.1 |
| UI | [N/A] | - |
| Env/Config | Database URL and role selection per environment | Must satisfy NFR-12; no shared credential across environments |
| Event | [N/A] | Outbox arrives in P7. |
| Build | `TenantContext` transaction primitive exported from `packages/database` | Sole sanctioned data access path |

---

## ADR / NFR Notes

- ADR-0006 fixes shared-database / shared-schema with RLS; ADR-0008 fixes the data access approach. No new ADR expected.
- NFR-10 multi-tenancy from the first schema is satisfied structurally here and can never be re-opened cheaply later.
- FF-22 (no string-built SQL) is added now so that the first raw query written in a later epic is already constrained.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| ADR-0008 / `architecture.md` §2.2 | `packages/database` | `P2.01` | AC-1..3 | integration boot test | - |
| `migrations.md` | migration tooling + detector | `P2.02` | AC-1..4 | class 8 migration tests | - |
| `database-schema.md` §3.1 | `tenant`, `membership` | `P2.03` | AC-1..3 | integration + class 7 | - |
| `database-schema.md` §3.1 | `user`, `session` | `P2.04` | AC-1..3 | integration | - |
| `architecture.md` §5 / FF-01 | RLS policies + role split | `P2.05` | AC-1..5 | FF-01 + class 7 | - |
| `architecture.md` §5 | `TenantContext` | `P2.06` | AC-1..4 | class 7 | - |
| FF-11 / `security-architecture.md` §9 | `audit_record` append-only | `P2.07` | AC-1..4 | FF-11 | - |
| FF-01 | tenancy fitness function | `P2.08` | AC-1..4 | FF-01 in CI | - |
| FF-22 | no string-built SQL | `P2.09` | AC-1..3 | FF-22 in CI | - |
| `testing-strategy.md` class 7 | isolation harness | `P2.10` | AC-1..4 | class 7 suite | - |
| `testing-strategy.md` class 8 | migration suite | `P2.11` | AC-1..3 | class 8 suite | - |

**BDD example IDs**
- EX-P2-01 GIVEN two seeded tenants, WHEN tenant A queries any client-owned table without its GUC, THEN zero rows are returned rather than tenant B's rows.
- EX-P2-02 GIVEN a new client-owned table with no RLS policy, WHEN CI runs, THEN FF-01 fails naming the table.
- EX-P2-03 GIVEN an existing `audit_record` row, WHEN an UPDATE is attempted as `vyra_app`, THEN the database rejects it.
- EX-P2-04 GIVEN a migration that drops a column, WHEN the detector runs, THEN the migration is blocked pending explicit approval.

**Open questions**
- OQ-P2-01 Exact retention enforcement mechanism for `audit_record` (5 years) is deferred to P16.04; the column and policy shape are fixed here.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 11/11 mapped; contracts 4/4 actionable entries mapped; examples 4/4 mapped to validations; unresolved gap codes: none.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P2.01` | packages/database with Drizzle and connection management | 3 | — | P0 |
| `P2.02` | Migration tooling, role split and destructive-change detector | 5 | `P2.01` | P0 |
| `P2.03` | tenant and membership tables | 3 | `P2.02` | P0 |
| `P2.04` | user and session tables | 3 | `P2.02` | P0 |
| `P2.05` | RLS policies and the tenant GUC | 8 | `P2.03`, `P2.04` | P0 |
| `P2.06` | TenantContext transaction primitive | 5 | `P2.05` | P0 |
| `P2.07` | audit_record append-only | 5 | `P2.05` | P0 |
| `P2.08` | FF-01 tenancy and RLS fitness function | 5 | `P2.05` | P0 |
| `P2.09` | FF-22 no string-built SQL | 3 | `P2.01` | P0 |
| `P2.10` | Tenancy isolation test harness (class 7) | 5 | `P2.06` | P0 |
| `P2.11` | Migration test class 8 | 3 | `P2.02` | P1 |

**Verification gate (epic exit)**: FF-01, FF-11 and FF-22 pass; tenancy isolation tests (class 7) green with two seeded tenants; migration tests (class 8) green.
