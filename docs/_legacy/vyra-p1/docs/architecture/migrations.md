# VYRA — Migrations

- **Authority**: brief §40
- **Tool**: `drizzle-kit` (ADR-0008)
- **IMPLEMENTATION NOT STARTED** — no executable migration is created here.

## 1. Principles

- Versioned, ordered, forward-only. Down-migrations are not used in production;
  recovery is roll-forward plus backup restore.
- Every migration is reviewed and idempotent-safe to re-run detection.
- Schema changes and data backfills are **separate** migrations.
- The migrator role (`vyra_migrator`) owns DDL; the app role never runs DDL.

## 2. Mandatory content for a new client-owned table

A migration adding a client-owned table must, in the same migration:

1. add `tenant_id uuid NOT NULL REFERENCES tenant(id)`;
2. `ENABLE ROW LEVEL SECURITY` **and** `FORCE ROW LEVEL SECURITY`;
3. create the tenant isolation policy;
4. create the `(tenant_id, …)` composite index for the hot path;
5. grant only the DML the app role needs.

Omitting any step fails FF-01 in CI, before review.

## 3. Expand/contract for destructive change

Destructive changes are never applied in one step:

```
1. EXPAND    add the new column/table, nullable, no constraint
2. BACKFILL  separate migration, batched, resumable
3. DUAL      application writes both, reads new with fallback
4. VERIFY    counts and invariants confirmed in staging and production
5. CONTRACT  add constraint / drop the old column, in a later release
```

CI's destructive-change detector flags `DROP`, narrowing `ALTER ... TYPE`, and
`SET NOT NULL` without a default, and requires an explicit annotation naming the
expand/contract step being executed (brief §39: no automatic destructive
migration).

## 4. pgvector specifics

- Changing embedding dimensionality is **not** an in-place type change. Procedure:
  add `embedding_v2 halfvec(M)`, re-embed in batches, build the new HNSW index
  concurrently, switch reads, then contract.
- HNSW index creation on a large table uses `CONCURRENTLY` to avoid a write lock.
- `halfvec` is used so the HNSW dimension ceiling (4000 for `halfvec` vs 2000 for
  `vector`) does not constrain future embedding model choice.

## 5. Ledger tables

`usage_ledger_entry`, `provider_cost_entry` and `audit_record` are append-only.
Migrations must never rewrite historical rows. A correction is a **new
compensating entry**, never an `UPDATE` (FF-11 verifies the grants).

## 6. Enum evolution

PostgreSQL enums are extended with `ADD VALUE` (non-blocking, forward-only).
Removing a value requires the expand/contract procedure with a type swap.
State-machine states are enums, so adding a state is safe and removing one is a
deliberate multi-release operation.

## 7. Validation in CI

- Migration applied to a restored staging snapshot, not an empty database.
- Post-migration invariant checks run (RLS present on every client-owned table,
  required indexes exist, append-only grants intact).
- Timing recorded; a migration exceeding the configured lock budget is rejected.
