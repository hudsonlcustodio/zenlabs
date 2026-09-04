# VYRA — Data Model & Database Schema

- **Authority**: brief §6, §7, §14, §19, §20, §40
- **Engine**: PostgreSQL 16+ with `pgvector`
- **Access layer**: Drizzle ORM (ADR-0008)
- **IMPLEMENTATION NOT STARTED** — this is a specification, not a migration.

## 1. Conventions

- Primary keys: `uuid` generated application-side (UUIDv7 preferred for locality).
- Timestamps: `timestamptz`, UTC, `created_at` / `updated_at` on all mutable tables.
- Money/duration: durations in **integer seconds**; never floats.
- Every client-owned table carries `tenant_id uuid NOT NULL REFERENCES tenant(id)`.
- Soft delete only where governance requires history; otherwise hard delete.
- Enumerations are PostgreSQL native `ENUM` types (migration-checked) — not free text.

## 2. Tenancy enforcement

Every client-owned table:

```sql
ALTER TABLE <t> ENABLE ROW LEVEL SECURITY;
ALTER TABLE <t> FORCE ROW LEVEL SECURITY;
CREATE POLICY <t>_tenant_isolation ON <t>
  USING      (tenant_id = current_setting('vyra.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('vyra.tenant_id')::uuid);
```

- `FORCE ROW LEVEL SECURITY` is mandatory so the table owner is also constrained.
- The application role has no `BYPASSRLS` and is not the owner.
- Transactions begin with `SET LOCAL vyra.tenant_id = $1` (transaction-scoped,
  pooling-safe).
- A dedicated `vyra_migrator` role owns DDL; `vyra_app` holds only DML grants.

Platform-owned tables (no `tenant_id`, no RLS): `tenant`, `user`, `plan`,
`prompt_template`, `prompt_version`, `model_policy`, `provider_capability_snapshot`.

### 2.1 Tables with a nullable `tenant_id`

`audit_record` and `provider_cost_entry` carry a **nullable** `tenant_id`, because
some records are platform-level (internal administrative actions; unallocable
infrastructure cost). The simple isolation policy would make those rows invisible
to everyone, so these two tables use a distinct policy:

```sql
CREATE POLICY audit_record_isolation ON audit_record
  USING (
    tenant_id = current_setting('vyra.tenant_id', true)::uuid
    OR (tenant_id IS NULL AND current_setting('vyra.scope', true) = 'platform')
  );
```

`vyra.scope` is set to `'platform'` only by internal/administrative code paths
that have already passed an internal-role authorization check. Client requests
never set it. Both tables remain `FORCE ROW LEVEL SECURITY` and append-only.

This is the **only** sanctioned deviation from the uniform policy, and the
FF-01 allowlist names these two tables explicitly so the deviation cannot spread
silently.

## 3. Core tables (abridged specification)

### 3.1 Identity

```
tenant(id, name, slug UNIQUE, status, created_at, updated_at)
"user"(id, email CITEXT UNIQUE, password_hash, status, type,
       mfa_enrolled, mfa_secret_encrypted, failed_attempts, locked_until,
       created_at, updated_at)
membership†(id, tenant_id, user_id, role, created_at)
   UNIQUE (tenant_id, user_id)
session(id, user_id, tenant_id NULL, issued_at, expires_at, revoked_at NULL,
        ip inet, user_agent, last_seen_at)
   INDEX (user_id) WHERE revoked_at IS NULL
```

`session.id` is an opaque 256-bit random token stored **hashed** (SHA-256); the
raw value lives only in the cookie.

### 3.2 Identity assets & governance

```
client†(id, tenant_id, profile jsonb, positioning jsonb, prohibited_topics text[])
identity_owner†(id, tenant_id, full_name, contact_ref)
digital_identity†(id, tenant_id, status, created_at)
identity_version†(id, tenant_id, digital_identity_id, element, version_number,
                  payload jsonb, active_from, active_to NULL)
   UNIQUE (digital_identity_id, element, version_number)
   EXCLUDE USING gist (digital_identity_id WITH =, element WITH =,
                       tstzrange(active_from, active_to) WITH &&)
consent†(id, tenant_id, identity_owner_id, scope jsonb, prohibited_uses jsonb,
         consent_version, evidence_ref, valid_from, valid_until NULL,
         granted_at, granted_by, revoked_at NULL, revocation_reason,
         propagation_state)
digital_twin†(id, tenant_id, provider_ref, engine, status,
              capability_snapshot_id, consent_id, created_at)
voice_clone†(id, tenant_id, provider_ref, kind, status, consent_id,
             verification_state, created_at)
```

The `EXCLUDE` constraint enforces I-DI1 (one active version per element) in the
database rather than in application code.

### 3.3 Knowledge

```
knowledge_source†(id, tenant_id, kind, origin, status, version, content_hash,
                  byte_size, uploaded_by, superseded_by NULL, created_at)
   UNIQUE (tenant_id, content_hash) WHERE superseded_by IS NULL
knowledge_chunk†(id, tenant_id, source_id, ordinal, text, token_count,
                 embedding halfvec(N))
   INDEX USING hnsw (embedding halfvec_cosine_ops) WITH (m=16, ef_construction=64)
   INDEX (tenant_id, source_id)
retrieval_trace†(id, tenant_id, content_item_id, chunk_ids uuid[], scores real[],
                 retrieved_at)
```

`halfvec` is chosen over `vector` because pgvector's HNSW index supports up to
2000 dimensions for `vector` but up to 4000 for `halfvec`, and `halfvec` halves
the working set. `N` is configuration driven by the selected embedding model and
is **not** an architectural constant (brief §48). Changing `N` requires a new
column plus backfill, never an in-place type change — see `migrations.md` §4.

### 3.4 Content & generation

```
content_request†(id, tenant_id, objective, subject NULL, channel, campaign_id NULL,
                 references jsonb, guidance NULL, format NULL, priority,
                 desired_date NULL, requested_by, created_at)
content_item†(id, tenant_id, request_id, state, current_script_id NULL,
              current_render_job_id NULL, media_asset_id NULL, campaign_id NULL,
              blocked_reason_code NULL, state_entered_at, created_at, updated_at)
   INDEX (tenant_id, state)
briefing†(id, tenant_id, request_id, body, prompt_version_id, context_snapshot_id)
script†(id, tenant_id, content_item_id, version_number, body, word_count,
        estimated_duration_seconds, status, context_snapshot_id, created_at)
   UNIQUE (content_item_id, version_number)
context_snapshot†(id, tenant_id, content_item_id, identity_version_refs jsonb,
                  retrieval_trace_id, prompt_version_id, model_policy_id,
                  channel, objective, created_at)
generation_attempt†(id, tenant_id, content_item_id, attempt_number, kind,
                    status, idempotency_key, provider_job_id NULL,
                    provider_asset_ref NULL, identity_version_ref jsonb,
                    started_at, completed_at NULL,
                    produced_duration_seconds NULL, failure_class NULL)
   UNIQUE (tenant_id, idempotency_key)
   UNIQUE (content_item_id, kind, attempt_number)
render_job†(id, tenant_id, attempt_id, provider_ref, engine, submitted_at,
            provider_status, last_polled_at)
asset_ingestion†(id, tenant_id, attempt_id, provider_asset_ref, state,
                 attempts, last_error, media_asset_id NULL, created_at,
                 updated_at)
   UNIQUE (tenant_id, attempt_id)
   INDEX (state) WHERE state IN ('pending','retrying')
qa_record†(id, tenant_id, content_item_id, attempt_id, policy, reviewer_id,
           verdict, findings jsonb, decided_at)
   UNIQUE (attempt_id)
media_asset†(id, tenant_id, kind, s3_key, bytes, duration_seconds, checksum,
             created_at)
   UNIQUE (tenant_id, s3_key)
```

### 3.5 Ledgers

See `usage-ledger.md` §3 and `provider-cost-ledger.md` §2 for full column
semantics and the constraints that make double-charging impossible.

```
usage_ledger_entry†(id, tenant_id, cycle_id, entry_type, seconds, direction,
                    generation_attempt_id NULL, reservation_id NULL,
                    reason_code, created_at, created_by)
   UNIQUE (tenant_id, generation_attempt_id) WHERE entry_type = 'commit'
usage_reservation†(id, tenant_id, cycle_id, content_item_id, seconds, status,
                   expires_at, created_at)
provider_cost_entry†(id, tenant_id NULL, provider, cost_type, provider_ref,
                     generation_attempt_id NULL, amount_micros, currency,
                     recorded_at, source)
   UNIQUE (provider, provider_ref, cost_type)
```

### 3.6 Publishing & performance

```
campaign†(id, tenant_id, name, window_start, window_end, objective)
social_connection†(id, tenant_id, platform, external_account_ref, scopes text[],
                   access_token_ciphertext bytea, refresh_token_ciphertext bytea,
                   token_expires_at, status, connected_at)
scheduled_publication†(id, tenant_id, content_item_id, channel_id, scheduled_for,
                       mode, status, external_post_id NULL, attempt_count,
                       last_error_class NULL)
   UNIQUE (content_item_id, channel_id) WHERE status <> 'cancelled'
   INDEX (scheduled_for) WHERE status = 'scheduled'
performance_snapshot†(id, tenant_id, publication_id, platform, external_content_id,
                      captured_at, captured_bucket, views NULL, reach NULL,
                      likes NULL, comments NULL, shares NULL, saves NULL,
                      watch_time NULL, avg_watch_time NULL, engagement NULL,
                      raw_payload jsonb)
   UNIQUE (publication_id, captured_bucket)
```

### 3.7 Platform infrastructure tables

```
domain_event(id, tenant_id NULL, type, payload jsonb, occurred_at,
             correlation_id, causation_id, schema_version,
             published_at NULL, attempts)
   INDEX (published_at) WHERE published_at IS NULL      -- outbox drain
webhook_event(id, provider, provider_event_id, signature_verified,
              received_at, processed_at NULL, payload jsonb)
   UNIQUE (provider, provider_event_id)
idempotency_key(key, actor_id, route, request_hash, response_snapshot jsonb,
                created_at, expires_at)
   PRIMARY KEY (key, actor_id, route)
audit_record†(id, tenant_id NULL, actor_id, actor_role, action, subject_type,
              subject_id, occurred_at, before jsonb, after jsonb,
              correlation_id, ip inet)
notification†(id, tenant_id, kind, recipient_ref, payload jsonb, status,
              sent_at NULL, attempts)
```

## 4. Indexing principles

- Every foreign key used in a filter has an index.
- Every `(tenant_id, <hot column>)` access path is a composite index with
  `tenant_id` leading — RLS adds the predicate, so the index must serve it.
- Partial indexes for queue-like scans (`WHERE published_at IS NULL`,
  `WHERE status = 'scheduled'`).
- HNSW for vectors; `lists`-based IVFFlat is not used because rebuild cost on
  incremental ingestion is worse for this workload.

## 5. Retention

| Data | Retention | Basis |
|---|---|---|
| `audit_record` | 5 years | governance |
| `performance_snapshot.raw_payload` | 13 months | re-normalization window |
| `webhook_event.payload` | 90 days | replay/debug |
| `domain_event` published rows | 30 days | outbox hygiene |
| `knowledge_chunk` of revoked tenant | deleted on offboarding | brief §33 excessive retention |
| media assets | S3 lifecycle, see `aws-topology.md` §5 | cost |
