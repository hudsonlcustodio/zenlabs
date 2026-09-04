# VYRA — ADR Index

35 ADRs. Every ADR records **one chosen option**; none leaves alternatives open.
Format: context · decision · alternatives rejected with reason · consequences.

| ADR | Decision | Brief §47 requirement |
|---|---|---|
| [0001](0001-modular-monolith.md) | Modular monolith | modular monolith |
| [0002](0002-monorepo.md) | pnpm workspace monorepo | monorepo |
| [0003](0003-frontend-stack.md) | Next.js App Router + Tailwind + shadcn/ui | frontend stack |
| [0004](0004-backend-stack.md) | NestJS + REST + OpenAPI | backend stack |
| [0005](0005-authentication-strategy.md) | First-party auth, opaque server-side sessions | **authentication strategy** |
| [0006](0006-tenancy-isolation.md) | Shared schema + PostgreSQL RLS | tenancy isolation |
| [0007](0007-postgresql-pgvector.md) | PostgreSQL + pgvector (`halfvec`, HNSW) | PostgreSQL + vector strategy |
| [0008](0008-orm-data-access.md) | **Drizzle ORM** + drizzle-kit | **ORM/data access** |
| [0009](0009-asynchronous-processing.md) | SQS workers + transactional outbox | asynchronous processing |
| [0010](0010-scheduling.md) | DB-backed scheduling + dispatcher | (scheduling) |
| [0011](0011-provider-abstraction.md) | Ports/adapters, mock by default | provider abstraction |
| [0012](0012-heygen-integration.md) | HeyGen, capability-checked, polling-first | HeyGen integration |
| [0013](0013-voice-video-audio-handoff.md) | Audio handoff via `audio_asset_id` | (voice→video) |
| [0014](0014-elevenlabs-integration.md) | ElevenLabs, IVC default / PVC premium | ElevenLabs integration |
| [0015](0015-ai-model-routing.md) | Policy-driven routing, config-only model ids | AI provider/model routing |
| [0016](0016-media-storage.md) | Private S3 + CloudFront signed URLs | media storage |
| [0017](0017-social-publishing.md) | Official APIs, disclosure + audit gates | social publishing |
| [0018](0018-usage-ledger.md) | Append-only usage ledger | usage ledger |
| [0019](0019-aws-region.md) | Region `sa-east-1` | (AWS region) |
| [0020](0020-aws-initial-topology.md) | EC2 + RDS + S3 + SQS baseline | AWS initial topology |
| [0021](0021-scaling-gates.md) | Metric-triggered promotion gates | scaling/promotion gates |
| [0022](0022-secrets-management.md) | Secrets Manager + KMS + IAM | secrets management |
| [0023](0023-observability.md) | CloudWatch + structured logs | observability |
| [0024](0024-audit-and-governance.md) | Append-only audit, consent aggregate | audit/governance |
| [0025](0025-provider-cost-ledger.md) | Separate provider cost ledger | provider cost ledger |
| [0026](0026-no-redis-at-mvp.md) | No Redis at MVP | (justification required by §26) |
| [0027](0027-notifications.md) | Notification port, vendor deferred | (notifications, §43) |
| [0028](0028-design-system-without-page-stories.md) | Owned primitives, no page-stories | (Storybook divergence) |
| [0029](0029-payment-provider-extension-point.md) | Interface only, no gateway | (billing, §21) |
| [0030](0030-idempotency-strategy.md) | DB-enforced idempotency per effect | (idempotency, §37) |
| [0031](0031-webhooks-untrusted-hints.md) | Unsigned webhooks are hints only | (webhooks, §34) |
| [0032](0032-api-style-rest.md) | Resource-oriented REST | (API contracts, §41) |
| [0033](0033-qa-policy.md) | VYRA QA `HUMAN_REQUIRED`, distinct from client approval | (approvals, §18) |
| [0034](0034-ingestion-decoupled-from-billing.md) | Ingestion decoupled from billability | (consumption, §19) |
| [0035](0035-frontend-toolkit-boundaries.md) | Sanctioned frontend libraries and their boundaries | (design system, §6) |

All 23 §47-mandated topics are covered; 12 additional ADRs record decisions the
brief required but did not enumerate. `ADR-0035` supersedes the "charting library
chosen at implementation time" clause of `ADR-0003` and closes `OQ-P15-02`.
