# ADR-0122 — SQS Standard, DLQ and idempotent consumers

**Status:** Proposed

## Decision
Use Amazon SQS Standard by default.

Delivery is treated as at-least-once. Every external side effect must be idempotent and reconcilable.

FIFO is introduced only when a concrete workflow proves strict queue ordering is required.
