# VYRA — AWS Topology

- **Authority**: brief §25, §26, §27, §29, §30
- **Principle**: start lean; grow only when a gate in `scalability-gates.md` fires.
- **IMPLEMENTATION NOT STARTED** — no AWS resource is created by this document.

## 1. Region

**`sa-east-1` (São Paulo)** — ADR-0019.

Rationale: the initial customer base and the identity owners are predominantly in
Brazil; latency for the interactive Portal (NFR-03 < 3 s) is dominated by
round-trips, and `sa-east-1` minimises them. Data residency for personal data
(voice, likeness, documents) stays in-country, which simplifies the governance
posture. All services in the baseline below are available in `sa-east-1`.

Trade-off accepted: `sa-east-1` has higher unit costs than `us-east-1` and later
service availability. Provider APIs (HeyGen, ElevenLabs, LLMs, Meta, TikTok) are
external and unaffected by region choice. Recorded explicitly rather than chosen
silently (brief §29).

## 2. Baseline topology (MVP)

```
Route53 ──▶ CloudFront ──▶ ┌─ /_next static, media (signed URLs) ─▶ S3 (private, OAC)
                           └─ dynamic ─────────────────────────────▶ EC2 (Docker)
                                                                     ├ apps/web
                                                                     ├ apps/api
                                                                     ├ worker-ai
                                                                     ├ worker-media
                                                                     └ worker-social
EC2 ──▶ RDS PostgreSQL (Single-AZ, pgvector)
EC2 ──▶ SQS (+ DLQ per queue)
EC2 ──▶ S3 (media, knowledge)
EC2 ──▶ Secrets Manager / KMS
EC2 ──▶ CloudWatch (logs, metrics, alarms)
ECR ◀── GitHub Actions (image build, tagged by commit SHA)
```

**Deliberately absent**: Kubernetes, EKS, ECS, ALB, Redis/ElastiCache,
EventBridge, multi-AZ RDS, service mesh, data lake. Each has a documented
promotion trigger in `scalability-gates.md`. Introducing any of them before its
gate fires is an architecture violation.

### 2.1 Why no load balancer at MVP

A single EC2 instance with CloudFront in front serves the availability target
(≥ 99.5%). An ALB is introduced together with the second instance, not before —
see gate G-A.

### 2.2 Why no Redis

Brief §26 requires a clear justification. The needs commonly served by Redis are
met without it:

| Need | MVP solution |
|---|---|
| Job queue | SQS |
| Scheduling | PostgreSQL table + dispatcher (`workflows-state-machines.md` §6) |
| Session store | PostgreSQL `session` table (needed anyway for revocation) |
| Idempotency keys | PostgreSQL unique indexes |
| Rate limiting | PostgreSQL counters at MVP volume |
| Caching | CloudFront + in-process memoisation |

Redis enters only via gate G-E.

## 3. Compute

- EC2 with Docker Compose, images from ECR tagged by commit SHA.
- Instance profile grants least-privilege access to S3 prefixes, SQS queues,
  Secrets Manager paths and KMS keys **for that environment only**.
- Processes are stateless; a terminated instance loses nothing.
- Deployment: pull new image, health-check, cut over, keep previous image for
  rollback.

## 4. Data

- **RDS PostgreSQL** with `pgvector`, Single-AZ at MVP.
- Automated backups with point-in-time recovery; retention per environment.
- Two roles: `vyra_migrator` (DDL owner) and `vyra_app` (DML only, no
  `BYPASSRLS`, not table owner).
- Connection pooling in-process; `SET LOCAL` makes pooling tenant-safe.
- Restore drills are a scheduled operational exercise, not an assumption.

## 5. Storage

- Buckets per environment: `vyra-<env>-media`, `vyra-<env>-knowledge`.
- Block Public Access at account and bucket level. No object is ever public.
- CloudFront Origin Access Control; signed URLs with short TTL for delivery.
- Key layout: `<env>/<tenantId>/<kind>/<uuid>` — tenant-prefixed, non-semantic.
- Versioning enabled on media; MFA-delete not required at MVP.
- Lifecycle: transition source/intermediate artifacts to infrequent access after
  90 days; expire per the retention table in `database-schema.md` §5.
- SSE-KMS encryption at rest.

## 6. Messaging

Standard SQS queues, each with a dedicated DLQ and `maxReceiveCount`:

| Queue | Consumer |
|---|---|
| `knowledge-ingest` | worker-ai |
| `content-generate` | worker-ai |
| `voice-synthesize` | worker-media |
| `video-render` | worker-media |
| `media-ingest` | worker-media |
| `publish` | worker-social |
| `metrics-collect` | worker-social |
| `webhook-process` | worker-media / worker-social |
| `notification-send` | worker-social |

- Visibility timeout ≥ 6× the p99 handler duration (SQS allows 0s–12h).
- SQS delivery delay is capped at **15 minutes**, which is why editorial
  scheduling uses a database table rather than queue delay (ADR-0010).
- Standard (not FIFO) queues: ordering is not required because every handler is
  idempotent and state transitions are guarded. This avoids FIFO throughput
  limits and the 5-minute content-based deduplication window, which is too short
  to be a correctness mechanism for VYRA anyway.

## 7. Environments (brief §27)

Three fully separated AWS accounts or, at minimum, separated resource sets with
no shared identity: development, staging, production. No shared database,
bucket, queue, secret, credential, token or provider key. Provider mode is
`mock` outside production unless an explicit, time-boxed live test is authorised.

## 8. Cost posture

The baseline is deliberately small: one EC2 instance, one Single-AZ RDS, S3,
SQS, CloudFront, CloudWatch. Every promotion has an owner and a trigger. Paying
for future scale in advance is treated as an architecture defect.
