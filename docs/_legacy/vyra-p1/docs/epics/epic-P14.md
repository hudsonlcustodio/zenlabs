---
id: P14
title: "Performance"
status: generated
depends_on: [P13]
---

# Epic P14 — Performance

- **Epic ID**: `P14`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 13
- **Status**: `generated`
- **Wave**: 9
- **Priority**: P0
- **Depends on**: `P13`
- **Blocks**: `P15`, `P16`, `P21`
- **Story points (epic total)**: 39
- **Stories**: 8
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Make published performance readable without ever letting a dashboard open become a provider call, and store platform metrics in a way that survives the platforms changing what they mean.

**Goals**
- G1 `performance_snapshot` as a normalized snapshot plus the original raw payload, every normalized field nullable (FR-PF02, FR-PF03, I-PF1).
- G2 Asynchronous collection in windows scheduled relative to publication time (FR-PF04, `performance.md` §3).
- G3 Idempotent collection on `(publication_id, captured_bucket)` (`architecture.md` §7).
- G4 A read path that serves dashboards from snapshots only (FR-PF05, FF-16).
- G5 Partial and failed collections that record a gap and never fabricate a value (`performance.md` §5).

**Non-goals**
- NG1 No synchronous provider call on any read path; that is the single thing FF-16 exists to prevent.
- NG2 No cross-platform aggregation presented as equivalent; per-platform is the default and any aggregate is labelled indicative (ASM-PF01).
- NG3 No UI; the performance screens are P15.
- NG4 No retention job; `raw_payload` retention is executed by the Phase 15 retention jobs in P16.

**Acceptance evidence**
- AE1 Opening a dashboard makes zero provider calls.
- AE2 A metric absent on a platform is `NULL` and is never read as zero.
- AE3 A retried collection for the same window inserts and updates nothing twice.

**Assumptions**
- ASM-PF01 Cross-platform metric aggregation is indicative only; per-platform presentation is the default, pending product review (`assumptions.md`, `performance.md` §6).

---

## Architecture Spec Summary

**Affected surfaces**: Module `performance` (`architecture.md` §4 row 15); the metric collector loop (`workflows-state-machines.md` §7); `tests/integration/`, `tests/idempotency/`, `tests/tenancy/`, `tests/contract/`.

**Integration points**: `PublishingProvider.fetchMetrics(ExternalPostRef)` from the P13 adapters; the P7 worker harness and reconciliation loops; `scheduled_publication` as the publication reference.

**Risks**
- A dashboard that calls a provider on open would consume the platform rate limit that publishing depends on and would break NFR-03; FF-16 converts that into a build failure.
- Treating an absent metric as zero would silently misreport performance; I-PF1 forbids it and the schema keeps every normalized column nullable.
- Discarding the raw payload would make re-normalization impossible when platform semantics change; I-PF2 and the 13-month retention prevent it.

**References (by path)**
- `docs/architecture/performance.md` §1, §2, §3, §4, §5, §6
- `docs/architecture/prd.md` §8.12 FR-PF01-FR-PF05, §10 NFR-03
- `docs/architecture/database-schema.md` §3.6, §4, §5
- `docs/architecture/domain-model.md` §9 I-PF1, I-PF2
- `docs/architecture/architecture.md` §7
- `docs/architecture/fitness-functions.md` FF-16

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | `GET /performance?contentItemId=&platform=&window=` — snapshots only, no provider call | `api-contracts.md` §3.5 |
| DB | `performance_snapshot` with nullable normalized columns, `raw_payload jsonb` and `UNIQUE (publication_id, captured_bucket)` | `database-schema.md` §3.6 |
| UI | [N/A] | Performance screens are P15. |
| Env/Config | Collection window set, collection retry budget, raw payload retention window | Windows are configuration, not constants (`performance.md` §3) |
| Event | None new; collection is scheduled from `PublicationCompleted` (`P13.10`) | `workflows-state-machines.md` T19 |
| Build | `modules/performance` request handlers may not import `PublishingProvider` | FF-16 |

---

## ADR / NFR Notes

- FR-PF05 forbids dashboards from triggering synchronous provider calls on every open; `performance.md` §4 states this bounds NFR-03 and protects the platform rate limits publishing depends on.
- NFR-15 lists metric updates as a cross-cutting idempotency surface; `architecture.md` §7 fixes the key as `(publication_id, captured_at_bucket)`.
- `database-schema.md` §5 retains `performance_snapshot.raw_payload` for 13 months as the re-normalization window; the job that enforces it is Phase 15 work in P16.
- `performance_snapshot` is a client-owned table and therefore carries `tenant_id` with RLS under FF-01 and NFR-10.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| FR-PF02, FR-PF03 / I-PF1, I-PF2 | `performance_snapshot` | `P14.01` | AC-1..5 | class 1 + class 8 | - |
| FR-PF04 / `performance.md` §3 | collection windows | `P14.02` | AC-1..4 | integration | - |
| `architecture.md` §7 / NFR-15 | `(publication_id, captured_bucket)` | `P14.03` | AC-1..3 | class 10 | - |
| `provider-architecture.md` §1 / `performance.md` §1 | `fetchMetrics` + normalization | `P14.04` | AC-1..5 | class 4 + class 1 | - |
| `performance.md` §5 | partial data and gaps | `P14.05` | AC-1..4 | integration | - |
| FR-PF05 / `api-contracts.md` §3.5 | performance read path | `P14.06` | AC-1..4 | class 3 | - |
| FF-16 / NFR-03 | no synchronous provider call | `P14.07` | AC-1..3 | FF-16 in CI | - |
| `testing-strategy.md` classes 3, 6, 7 | read-path coverage | `P14.08` | AC-1..3 | classes 3, 6, 7 | - |

**BDD example IDs**
- EX-P14-01 GIVEN a performance request, WHEN the endpoint serves it, THEN zero provider calls are observed against the mock.
- EX-P14-02 GIVEN a platform that does not return `saves`, WHEN the snapshot is stored, THEN `saves` is `NULL` and is never surfaced as zero.
- EX-P14-03 GIVEN a collection for the same `(publication_id, captured_bucket)`, WHEN it is retried, THEN exactly one row exists.
- EX-P14-04 GIVEN a platform returning partial data, WHEN the collection completes, THEN the available fields plus the full `raw_payload` are stored and the other windows are unaffected.
- EX-P14-05 GIVEN tenants A and B, WHEN A queries performance, THEN no snapshot belonging to B is reachable by any repository path.

**Open questions**
- OQ-P14-01 Whether any cross-platform aggregate is presented at all is a product decision (ASM-PF01); this epic stores per-platform snapshots and takes no presentation decision.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 8/8 mapped; contracts 5/5 actionable entries mapped; examples 5/5 mapped to validations; unresolved gap codes: none.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P14.01` | performance_snapshot with normalized fields and raw payload | 5 | — | P0 |
| `P14.02` | Collection windows scheduled from publication | 5 | `P14.01`, `P13.10` | P0 |
| `P14.03` | Idempotent collection per publication and bucket | 5 | `P14.02` | P0 |
| `P14.04` | Metric fetch and per-platform normalization | 8 | `P14.03`, `P13.07`, `P13.08` | P0 |
| `P14.05` | Partial data and collection-gap handling | 5 | `P14.04` | P0 |
| `P14.06` | Performance read path from snapshots only | 5 | `P14.05` | P0 |
| `P14.07` | FF-16 dashboards never call providers synchronously | 3 | `P14.06` | P0 |
| `P14.08` | Contract, authorization and tenancy coverage for the read path | 3 | `P14.06` | P0 |

**Verification gate (epic exit)**: FF-16 passes; a performance request against the mock provider records zero provider calls; the `(publication_id, captured_bucket)` unique index is asserted and a retried collection produces exactly one row; a platform-absent metric is stored and returned as `NULL`; classes 3, 6, 7 and 10 are green for the performance module.
