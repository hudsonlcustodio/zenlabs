---
id: P9
title: "Knowledge engine"
status: generated
depends_on: [P2, P4, P7]
---

# Epic P9 — Knowledge engine

- **Epic ID**: `P9`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 8
- **Status**: `generated`
- **Wave**: 4
- **Priority**: P0
- **Depends on**: `P2`, `P4`, `P7`
- **Blocks**: `P10`, `P15`, `P16`
- **Story points (epic total)**: 51
- **Stories**: 10
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Turn client material into retrievable, tenant-filtered knowledge, while treating every ingested document as hostile until proven otherwise.

**Goals**
- G1 The pipeline source to ingestion to parsing to chunking to embeddings to retrieval (`knowledge-engine.md` §1).
- G2 Versioning, provenance, processing status, reprocessing, deletion, deduplication, limits and failure handling (FR-KN04).
- G3 pgvector retrieval that filters tenancy in SQL rather than after the fact (FF-05).
- G4 SSRF, upload and content controls (FR-KN05, FF-25, FF-26).
- G5 Retrieval traces so a generated script can name what informed it.

**Non-goals**
- NG1 No prompt construction or model calls; that is P10.
- NG2 No data lake or analytics store (`prd.md` §12.2).
- NG3 No cross-tenant knowledge sharing of any kind.

**Acceptance evidence**
- AE1 A retrieval query without a tenancy filter in the SQL fails FF-05.
- AE2 A hostile URL is refused by the egress control rather than fetched.
- AE3 A malformed or oversized upload is rejected before parsing.

**Assumptions**
- ASM-P9-01 Accepted input types follow `knowledge-engine.md` §2; extending them requires revisiting the upload validation rules rather than loosening them.

---

## Architecture Spec Summary

**Affected surfaces**: Module `knowledge`, `apps/worker-ai` ingestion jobs, S3 upload path, `tests/security/`.

**Integration points**: Embedding provider through the P4 LLM port; S3 for source storage; outbound HTTP for link ingestion, under egress control.

**Risks**
- RISK-06 prompt injection via client knowledge sources - High. Containment is enforced in P10.09 but originates here: retrieved text must be carried as data, never as instruction.
- RISK-07 cross-tenant leakage including embedding retrieval - Critical. FF-05 is the specific mitigation.
- Link ingestion is an SSRF vector by construction; `security-architecture.md` §8 is mandatory rather than advisory.

**References (by path)**
- `docs/architecture/knowledge-engine.md` §1-§6
- `docs/architecture/security-architecture.md` §7, §8
- `docs/architecture/database-schema.md` §3.3
- `docs/architecture/domain-model.md` §5
- `docs/architecture/prd.md` §8.7
- `docs/architecture/adr/0007-postgresql-pgvector.md`
- `docs/architecture/fitness-functions.md` FF-05, FF-25, FF-26

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | Knowledge source upload, listing, reprocess and delete | `api-contracts.md` §3.6 |
| DB | `knowledge_source`, `knowledge_chunk` with embedding, provenance and processing status | `database-schema.md` §3.3; retention on offboarding per §5 |
| UI | [N/A] | Studio knowledge screen is P15.12. |
| Env/Config | Upload size and type limits, chunk parameters, egress allowlist, embedding model reference | FF-13 and FF-09 |
| Event | `KnowledgeSourceIngested`, `KnowledgeSourceFailed` | Via the P7 outbox |
| Build | Retrieval API that cannot be called without a tenant filter | Enforced by FF-05 |

---

## ADR / NFR Notes

- ADR-0007 fixes PostgreSQL with pgvector, so retrieval is a SQL query subject to RLS rather than an external index outside the tenancy boundary. That is the reason FF-05 is achievable at all.
- FR-KN03 requires all operations to be tenant-scoped including embedding retrieval; the shared-index shortcut is unavailable by design.
- `database-schema.md` §5 deletes `knowledge_chunk` rows of a revoked tenant on offboarding, addressing the excessive-retention threat.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| `knowledge-engine.md` §1, §2 | upload + source storage | `P9.01` | AC-1..4 | integration + class 13 | - |
| `knowledge-engine.md` §1, §2 | parsing | `P9.02` | AC-1..4 | integration | - |
| `knowledge-engine.md` §3 | chunking, versioning, dedup | `P9.03` | AC-1..4 | integration | - |
| `knowledge-engine.md` §1 | embeddings | `P9.04` | AC-1..4 | integration + class 4 | - |
| FF-05 / FR-KN03 | tenant-filtered retrieval | `P9.05` | AC-1..4 | FF-05 + class 7 | - |
| `security-architecture.md` §8 / FF-25 | SSRF controls | `P9.06` | AC-1..4 | class 13 | - |
| `security-architecture.md` §7 / FF-26 | upload validation | `P9.07` | AC-1..4 | class 13 | - |
| `knowledge-engine.md` §4 | retrieval traces | `P9.08` | AC-1..3 | integration | - |
| `knowledge-engine.md` §6 / FR-KN04 | lifecycle + failure semantics | `P9.09` | AC-1..5 | integration | - |
| FF-05, FF-25, FF-26 | knowledge fitness functions | `P9.10` | AC-1..4 | CI | - |

**BDD example IDs**
- EX-P9-01 GIVEN a retrieval query, WHEN its SQL omits the tenancy filter, THEN FF-05 fails naming the query.
- EX-P9-02 GIVEN a link pointing at a private network address, WHEN ingestion attempts to fetch it, THEN the egress control refuses.
- EX-P9-03 GIVEN an upload whose declared type does not match its content, WHEN it is received, THEN it is rejected before parsing.
- EX-P9-04 GIVEN two tenants with identical documents, WHEN tenant A retrieves, THEN no chunk belonging to tenant B is returned.
- EX-P9-05 GIVEN a source deleted by its tenant, WHEN retrieval runs, THEN its chunks are no longer reachable.

**Open questions**
- OQ-P9-01 Embedding model selection is configuration under FF-09; the specific identifier is an operational choice, not an architectural constant.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 10/10 mapped; contracts 5/5 actionable entries mapped; examples 5/5 mapped to validations; unresolved gap codes: none.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P9.01` | Knowledge source upload and storage | 5 | — | P0 |
| `P9.02` | Parsing pipeline | 8 | `P9.01` | P0 |
| `P9.03` | Chunking, versioning, provenance and deduplication | 5 | `P9.02` | P0 |
| `P9.04` | Embedding generation | 5 | `P9.03`, `P4.01` | P0 |
| `P9.05` | pgvector retrieval filtered in SQL | 5 | `P9.04` | P0 |
| `P9.06` | SSRF controls and egress allowlist | 5 | `P9.01` | P0 |
| `P9.07` | Upload validation controls | 5 | `P9.01` | P0 |
| `P9.08` | Retrieval traces | 3 | `P9.05` | P1 |
| `P9.09` | Source lifecycle and failure semantics | 5 | `P9.03` | P0 |
| `P9.10` | FF-05, FF-25 and FF-26 checks | 5 | `P9.05`, `P9.06`, `P9.07` | P0 |

**Verification gate (epic exit)**: FF-05, FF-25 and FF-26 pass; knowledge and security tests green; retrieval is tenant-filtered in SQL; hostile fetches and uploads are refused.
