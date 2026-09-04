# ADR-0030 — Database-enforced idempotency keyed per effect

**Status**: Accepted · **Authority**: brief §37

## Context
Idempotency is required across voice generation, video generation, minute
consumption, cost recording, webhooks, social publication and metric updates.
At-least-once delivery makes duplicates certain, not hypothetical.

## Decision
Idempotency is enforced by **database constraints**, not by application checks.
Each effect has a declared key and a unique (often partial) index, enumerated in
`architecture.md` §7. Handlers catch the unique violation and return success.

## Alternatives rejected
- **Check-then-act in application code** — rejected: racy under concurrent
  delivery; two workers can both pass the check.
- **Distributed lock (Redis)** — rejected: adds a component (ADR-0026) and is
  weaker than a constraint — a lock can expire mid-operation, a constraint cannot.
- **Relying on SQS FIFO deduplication** — rejected: its window is 5 minutes,
  far shorter than our retry and reconciliation horizon.

## Consequences
- Correctness survives worker crashes, retries, replays and duplicate webhooks.
- Every new effect must declare its key, verified by FF-28 and FF-24.
- Unique-violation handling must be explicit, not an error path.
