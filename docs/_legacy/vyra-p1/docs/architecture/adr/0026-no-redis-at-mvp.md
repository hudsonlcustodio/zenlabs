# ADR-0026 — No Redis/ElastiCache at MVP

**Status**: Accepted · **Authority**: brief §26

## Context
Brief states Redis is not mandatory and must only be introduced against a clear
requirement PostgreSQL/SQS cannot meet.

## Decision
**No Redis at MVP.** Each need is served otherwise: queueing by SQS; scheduling
by a PostgreSQL table; sessions by the `session` table (required anyway for
revocation); idempotency by unique indexes; rate limiting by database counters at
current volume; caching by CloudFront and in-process memoisation.

## Alternatives rejected
- **Redis for sessions** — rejected: we need durable, queryable, revocable
  sessions; the database row is the requirement, not a cache.
- **Redis for rate limiting** — rejected at current volume; gate G-E governs the
  reconsideration when database counters demonstrably contend.
- **Redis as a job queue** — rejected: SQS is managed and already in the baseline.

## Consequences
- One less stateful component to operate, secure and pay for.
- Rate-limit counter contention is an explicit metric to watch (G-E).
