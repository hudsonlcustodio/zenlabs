# VYRA — Knowledge Engine

- **Authority**: brief §14
- **IMPLEMENTATION NOT STARTED**

## 1. Pipeline

```
KnowledgeSource → Ingestion → Parsing → Chunking → Embeddings → pgvector → Retrieval
```

Each stage is a queue-driven step with its own DLQ. Status is tracked on
`knowledge_source.status`: `received → parsing → chunking → embedding → ready`,
plus `failed` and `superseded`.

## 2. Accepted inputs

Documents, PDFs, presentations, FAQs, methodologies, offers, links, plain text,
audio, prior content, institutional knowledge (brief §14).

Audio sources are transcribed before chunking. Link sources are fetched under
the SSRF controls in §5.

## 3. Versioning, provenance, deduplication

- `content_hash` deduplicates: re-uploading identical bytes marks the prior row
  `superseded` rather than creating a duplicate (I-KN2).
- Every chunk carries `source_id` and `ordinal`, so any retrieved fragment is
  attributable to a specific client document and position — this is the
  provenance requirement.
- `RetrievalTrace` records which chunks and scores fed each generation, giving
  end-to-end traceability from published video back to source document.
- Deletion of a source cascades to its chunks and embeddings. Deletion is real,
  not a flag, for offboarding (brief §33 excessive retention).

## 4. Retrieval

```sql
SELECT id, source_id, text, 1 - (embedding <=> $1) AS score
FROM knowledge_chunk
WHERE tenant_id = current_setting('vyra.tenant_id')::uuid
ORDER BY embedding <=> $1
LIMIT $2;
```

- Tenant predicate is **in SQL**, reinforced by RLS. Application-side filtering
  after retrieval is forbidden (FF-05).
- HNSW index with cosine distance. `halfvec` storage — see `database-schema.md` §3.3.
- Embedding dimension is configuration; changing it is a backfill migration.

## 5. Security controls (brief §14, §33)

| Risk | Control |
|---|---|
| Prompt injection in documents | data-region isolation (`intelligence-engine.md` §4.1); injection-marker detection at ingestion; retrieved text never joins the instruction region |
| Malicious file content | MIME sniffing by content not extension; size cap; archive/macro rejection; antivirus scan gate before parsing |
| Oversized documents | hard byte cap and page/duration cap; oversize → `failed` with reason, never partial silent truncation |
| Hostile URLs / SSRF | fetch only via an egress allowlist proxy; deny RFC1918, link-local, metadata endpoints (169.254.169.254), and non-http(s) schemes; no redirect following to a denied target; DNS re-resolution pinned |
| Malformed uploads | parser sandboxed in the worker, resource-limited, failure isolated to the source |
| Zip/decompression bombs | expansion ratio and absolute size limits |

Limits are configuration per plan, not constants.

## 6. Failure semantics

A failed source never blocks the tenant's other sources or content pipeline.
`knowledge_source.status = failed` carries a machine-readable reason; reprocessing
is an explicit operator or client action that creates a new version.
