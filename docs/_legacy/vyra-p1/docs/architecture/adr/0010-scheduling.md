# ADR-0010 — Database-backed scheduling with a polling dispatcher

**Status**: Accepted · **Authority**: brief §23

## Context
Editorial publication may be scheduled arbitrarily far ahead and must be
reliable and recoverable after restart.

## Decision
`scheduled_publication.scheduled_for` in PostgreSQL is the source of truth. A
dispatcher runs each minute and claims due rows with `FOR UPDATE SKIP LOCKED`,
enqueuing publish jobs.

## Alternatives rejected
- **SQS delivery delay** — rejected on a hard fact: SQS delay is capped at
  **15 minutes**, which cannot express an editorial calendar.
- **EventBridge Scheduler one-time `at()` schedules** — rejected at MVP: viable
  technically, but each one-time schedule counts against an account quota until
  explicitly deleted, adding lifecycle management and a second source of truth for
  no benefit at current volume. Reconsider if scheduling volume grows.
- **In-process cron/timers** — rejected: state lost on restart.

## Consequences
- Restart-safe by construction; the calendar lives in the database.
- Scheduling granularity is one minute — acceptable for editorial publishing.
- The dispatcher is a reconciliation loop like the others.
