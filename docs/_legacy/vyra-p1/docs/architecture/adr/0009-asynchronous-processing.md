# ADR-0009 — SQS workers with a transactional outbox

**Status**: Accepted · **Authority**: brief §26, §36, §42

## Context
Generation, ingestion, publishing and metrics are long-running and must survive
restarts. Events must never be emitted for rolled-back transactions.

## Decision
**Amazon SQS standard queues** with a dedicated DLQ per queue, fed by a
**transactional outbox** (`domain_event` table) drained by a relay.

Standard, not FIFO: ordering is unnecessary because every handler is idempotent
and transitions are guarded. FIFO's content-based deduplication window is 5
minutes, far too short to serve as a correctness mechanism here — our
correctness comes from database unique indexes, not from the queue.

## Alternatives rejected
- **FIFO queues** — rejected: throughput limits and a deduplication window that
  cannot be relied on for our idempotency horizon.
- **Direct publish from application code** — rejected: emits events for
  transactions that later roll back.
- **RabbitMQ/Kafka self-hosted** — rejected: stateful infrastructure to operate,
  contradicting the lean baseline; volume does not justify it.
- **EventBridge as the bus** — rejected at MVP: adds a routing layer with no
  current consumer diversity.

## Consequences
- Visibility timeout must exceed p99 handler duration (SQS allows 0s–12h).
- Every handler must be idempotent — enforced by FF-28, FF-24.
- DLQ depth is a first-class alarm.
