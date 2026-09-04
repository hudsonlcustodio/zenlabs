# ADR-0007 — PostgreSQL with pgvector for the Knowledge Engine

**Status**: Accepted · **Authority**: brief §6, §14

## Context
Knowledge retrieval must be tenant-isolated and transactional with the rest of
the domain. Brief requires pgvector unless a strong documented reason exists
otherwise.

## Decision
**PostgreSQL with `pgvector`**, `halfvec` storage, HNSW index with cosine
distance. No separate vector database.

`halfvec` is chosen because pgvector's HNSW index supports up to 2000 dimensions
for `vector` but up to 4000 for `halfvec`, and `halfvec` halves the working set —
this keeps future embedding-model choice open. Dimension count is configuration.

## Alternatives rejected
- **Pinecone/Weaviate/Qdrant** — rejected: a second datastore means tenancy is
  enforced twice, in two different ways, with no transactional link to the
  source-of-truth row. Cross-store consistency would be a permanent risk for the
  exact isolation property that matters most.
- **IVFFlat instead of HNSW** — rejected: rebuild cost under continuous
  incremental ingestion is worse for this workload.

## Consequences
- Retrieval participates in the same RLS boundary as everything else.
- Vector index memory becomes an RDS sizing input (gate G-C).
- Dimension changes require expand/contract (`migrations.md` §4).
