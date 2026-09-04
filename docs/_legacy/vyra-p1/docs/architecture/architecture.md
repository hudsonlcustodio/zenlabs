# VYRA — Architecture

- **Artifact**: `docs/architecture/architecture.md`
- **Authority**: `docs/product/VYRA_ARCH_PLAN_BRIEF.md` §5, §6, §7, §42
- **Status**: canonical
- **IMPLEMENTATION NOT STARTED**

## 1. Executive vision

VYRA delivers a *managed* audiovisual content operation as a product. The client
requests, approves and observes; VYRA owns every technical process. See
`prd.md` §1 for the product framing.

Architecturally this produces three obligations:

1. **The domain must not know its providers.** HeyGen, ElevenLabs, DeepSeek,
   OpenAI, Meta and TikTok are replaceable adapters behind ports.
2. **Every client-owned row must be tenant-scoped and enforced by the database**,
   not by developer discipline.
3. **Money-shaped effects must be ledgers**, not counters — client minutes and
   VYRA provider cost are independent append-only records.

## 2. Architectural style

**Modular monolith** (ADR-0001), deployed as a small number of processes from a
single monorepo (ADR-0002). No microservices, no Kubernetes (brief §5, §26,
§44). Module boundaries are drawn so that a module *could* be extracted later,
but extraction happens only when a scale gate in `scalability-gates.md` fires.

### 2.1 Processes

| Process | Responsibility | Scaling trigger |
|---|---|---|
| `apps/web` | Next.js App Router. Portal + Studio + Control surfaces. Server-side authorization on every route. | NFR-03 |
| `apps/api` | NestJS modular HTTP API. Command/query entry point. Owns transactions. | NFR-01, NFR-02 |
| `apps/worker-ai` | Briefing, script, caption, brand-compliance generation; knowledge ingestion and embedding. | queue age |
| `apps/worker-media` | Voice synthesis, video render submission, provider polling, media ingestion to S3. | queue age |
| `apps/worker-social` | Publication, token refresh, performance collection. | queue age |

All processes are stateless (brief §26). No process may persist product data on
local disk.

### 2.2 Packages

| Package | Contents | May depend on |
|---|---|---|
| `packages/contracts` | Zod schemas, DTOs, domain event payloads, error codes. No I/O. | — |
| `packages/database` | Drizzle schema, migrations, RLS helpers, repository primitives. | contracts |
| `packages/providers` | Provider ports + adapters + capability registry + error taxonomy. | contracts |
| `packages/security` | AuthN/AuthZ primitives, crypto, token envelope encryption. | contracts |
| `packages/observability` | Structured logger, correlation context, metric emitters. | contracts |
| `packages/config` | Environment schema and typed configuration loading. | contracts |
| `packages/ui` | Design system primitives and components. | contracts |

## 3. System context

```
                    ┌──────────────────────────────┐
   Portal user ────▶│                              │
   Internal staff ─▶│        apps/web (Next.js)    │
                    └──────────────┬───────────────┘
                                   │ HTTPS, session cookie
                    ┌──────────────▼───────────────┐
                    │        apps/api (NestJS)     │
                    └───┬──────────┬───────────┬───┘
                        │          │           │
              ┌─────────▼──┐  ┌────▼─────┐  ┌──▼─────────┐
              │ PostgreSQL │  │   SQS    │  │    S3      │
              │ + pgvector │  │  + DLQ   │  │  private   │
              └────────────┘  └────┬─────┘  └──▲─────────┘
                                   │           │
              ┌────────────────────▼───────────┴─────────┐
              │  worker-ai │ worker-media │ worker-social │
              └────┬───────────────┬──────────────┬───────┘
                   │               │              │
              ┌────▼────┐   ┌──────▼──────┐  ┌────▼──────────┐
              │ LLM     │   │ ElevenLabs  │  │ Meta / TikTok │
              │ DeepSeek│   │ HeyGen      │  │               │
              │ OpenAI  │   └─────────────┘  └───────────────┘
              └─────────┘
                   ▲ inbound provider webhooks ──▶ apps/api
```

External systems are reached **only** through `packages/providers`.

## 4. Module architecture

23 domain modules (brief §5). Each lives under `apps/api/src/modules/<name>`
with `domain/`, `application/`, `infrastructure/` layers.

| # | Module | Owns | Key invariant |
|---|---|---|---|
| 1 | `identity` | Users, credentials, sessions, MFA | A session is revocable server-side at any time |
| 2 | `tenancy` | Tenants, membership, tenant context | No client-owned row exists without `tenant_id` |
| 3 | `client` | Client profile, positioning, channels | One tenant ↔ one client in MVP |
| 4 | `digital-identity` | Composite identity + versions | Every element is independently versioned |
| 5 | `digital-twin` | Twin lifecycle, provider binding | A revoked twin can never start a generation |
| 6 | `voice-identity` | Voice clones, verification state | A voice clone requires recorded owner consent |
| 7 | `knowledge` | Sources, chunks, embeddings | Retrieval is always tenant-filtered in SQL |
| 8 | `content` | Requests, briefings, scripts, items | State changes only via the state machine |
| 9 | `intelligence` | Model routing, prompts, validation | No model id appears outside config |
| 10 | `workflow` | Transition engine, guards, effects | Every transition is idempotent |
| 11 | `render` | Render jobs, attempts, provider job ids | One attempt ↔ one provider submission |
| 12 | `media` | Assets, S3 keys, signed URL issuance | Media is private by default |
| 13 | `calendar` | Scheduled publications | A schedule survives process restart |
| 14 | `social-publishing` | Connections, tokens, publications | Tokens are encrypted at rest |
| 15 | `performance` | Snapshots + raw payloads | Dashboards never call providers synchronously |
| 16 | `plans` | Plan catalogue, entitlements | Entitlement is derived, never hand-edited |
| 17 | `subscription` | Subscription, billing cycle, payment status | No gateway integration exists |
| 18 | `usage` | Usage ledger, reservations, commits | Balance is a fold over the ledger |
| 19 | `provider-cost` | Provider cost ledger | Client usage and VYRA cost never share a row |
| 20 | `notifications` | Notification dispatch | Delivery vendor is behind a port |
| 21 | `governance` | Consent, scope, revocation | Revocation propagates before it is reported done |
| 22 | `audit` | Audit trail | Audit records are append-only |
| 23 | `administration` | Internal admin operations | Every action is audited |

`observability` is cross-cutting infrastructure (`packages/observability`), not a
domain module.

### 4.1 Dependency rules (enforced — see `fitness-functions.md` FF-01..FF-04)

1. A module may depend only on its own `domain/`, on `packages/*`, and on
   modules listed in its `allowedDependencies`.
2. No module may import another module's `infrastructure/` or `domain/` internals.
   Cross-module communication is via published application services or domain events.
3. No domain layer may import a provider SDK, `aws-sdk`, or `drizzle` directly.
4. No cycles. The graph is a DAG.

### 4.2 Layering

```
domain/         pure. entities, value objects, invariants, state machine rules.
                imports: contracts only.
application/    use cases, transactions, event emission, authorization checks.
                imports: domain, ports.
infrastructure/ repositories, provider adapters, queue publishers, controllers.
                imports: application, packages/*.
```

## 5. Multi-tenancy (brief §7)

**Shared database, shared schema, `tenant_id` on every client-owned table,
enforced by PostgreSQL Row-Level Security** (ADR-0006).

Defence in depth, all four layers mandatory:

1. **Database**: RLS policy on every client-owned table using
   `current_setting('vyra.tenant_id')`. The application role is **not** the table
   owner and does **not** have `BYPASSRLS`.
2. **Transaction**: every request and job opens its transaction with
   `SET LOCAL vyra.tenant_id = $1`. `SET LOCAL` is transaction-scoped, so a
   pooled connection cannot leak context to the next borrower.
3. **Application**: repositories accept a `TenantContext` object; there is no
   repository method that omits it.
4. **Authorization**: object-level checks resolve the target's `tenant_id`
   against the actor's context before any mutation (mitigates IDOR).

### 5.1 Job tenancy

Every queue message carries `tenantId`. The worker's first action is to open the
transaction and set the tenant GUC. A message without `tenantId` is rejected to
the DLQ without processing — never processed under a default tenant.

### 5.2 Knowledge retrieval tenancy

Vector search is a plain SQL predicate, not a post-filter:

```sql
SELECT ... FROM knowledge_chunk
WHERE tenant_id = current_setting('vyra.tenant_id')::uuid
ORDER BY embedding <=> $1 LIMIT $2;
```

Post-filtering in application code is forbidden (FF-05): it would let another
tenant's vectors influence ranking before removal.

### 5.3 MVP policy limits

One portal user and one Digital Twin per tenant are **policy constraints**
enforced in the application layer, not schema constraints. The schema models
`1..n` so the limit can be lifted without migration. No multi-user or multi-twin
*features* are built (brief §7, §44).

## 6. Domain events (brief §42)

Events are **in-process** by default, published inside the same transaction as
the state change via a transactional outbox (`domain_event` table). A relay
drains the outbox to SQS only for work that must run asynchronously.

This avoids distributed event-driven architecture (brief §42) while guaranteeing
that an event is never emitted for a rolled-back transaction.

Canonical events: `ContentRequested`, `BriefingGenerated`, `ScriptGenerated`,
`ScriptApproved`, `ScriptRejected`, `VoiceGenerated`, `RenderRequested`,
`RenderCompleted`, `RenderFailed`, `MediaIngested`, `MediaIngestionFailed`,
`QAPassed`, `QAFailed`, `VideoApproved`,
`VideoRejected`, `PublicationScheduled`, `PublicationCompleted`,
`PublicationFailed`, `UsageReserved`, `UsageCommitted`, `UsageReleased`,
`ProviderCostRecorded`, `TwinActivated`, `TwinRevoked`, `VoiceCloneReady`,
`ConsentGranted`, `ConsentRevoked`.

Every event payload carries `eventId`, `tenantId`, `occurredAt`,
`correlationId`, `causationId`, `schemaVersion`.

## 7. Idempotency (brief §37)

Cross-cutting. Rules in `usage-ledger.md` §5 and `provider-architecture.md` §6.

| Surface | Key | Storage |
|---|---|---|
| Client mutation API | `Idempotency-Key` header + actor + route | `idempotency_key` table, unique |
| Voice synthesis | `sha256(scriptVersionId + voiceCloneId + params)` | `generation_attempt.idempotency_key` |
| Video render | `sha256(attemptId)` | `render_job.idempotency_key` |
| Usage commit | `generation_attempt_id` | unique index on `usage_ledger_entry` |
| Provider cost | `(provider, provider_ref, cost_type)` | unique index |
| Inbound webhook | provider `event_id` | `webhook_event` table, unique |
| Social publication | `content_item_id + channel_id` | unique partial index |
| Performance snapshot | `(publication_id, captured_at_bucket)` | unique index |

## 8. Configuration and environments

Three isolated environments (brief §27): development, staging, production. No
shared database, bucket, queue, secret, credential, token or provider key.

Provider mode is per-environment: `mock | live`. `mock` is the default
everywhere except production (ADR-0011). CI runs `mock` only (FF-08).

## 9. Related artifacts

`domain-model.md`, `database-schema.md`, `workflows-state-machines.md`,
`provider-architecture.md`, `usage-ledger.md`, `security-architecture.md`,
`aws-topology.md`, `fitness-functions.md`, `adr/`.
