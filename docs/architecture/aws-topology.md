# AWS TOPOLOGY — V2 PROPOSAL

**Status:** [PROPOSTA HERDADA / GATE-CLOUD-001]

AWS permanece uma opção compatível com o scaffold. Região/topologia final precisa ser confirmada antes de produção.

## 1. Logical services

- web/API compute;
- PostgreSQL/RDS;
- private S3;
- SQS + DLQ;
- Secrets Manager/KMS;
- CloudWatch/OTel export.

## 2. No local state

Media e job state não dependem de disk local.

## 3. Outbox

PostgreSQL transaction writes domain change + outbox row.

Relay publishes to queue.

## 4. Backpressure

Capacity Scheduler observa:
- queue age;
- provider concurrency;
- provider health;
- deadline;
- budget;
- tenant priority.

## 5. DLQ

Cada queue crítica possui DLQ e alert.

## 6. Messaging

| Queue | Consumer | Purpose |
|---|---|---|
| `knowledge-ingest` | worker-ai | knowledge ingestion |
| `content-generate` | worker-ai | script/content tasks |
| `production-analyze` | worker-ai | production analysis |
| `production-plan` | worker-ai | pack/scene planning |
| `qc-evaluate` | worker-ai | probabilistic quality evaluation |
| `voice-synthesize` | worker-media | voice generation |
| `media-generate` | worker-media | talking/motion/cinematic media jobs |
| `media-ingest` | worker-media | copy provider assets to canonical storage |
| `media-repair` | worker-media | repair/retry/fallback |
| `assembly` | worker-media | deterministic final assembly |
| `webhook-process` | worker-media / worker-social | async webhook processing |
| `publish` | worker-social | publication |
| `metrics-collect` | worker-social | performance |
| `notification-send` | worker-social | notifications |

## 7. Promotion

Start lean. Scale consumers before extracting services.
