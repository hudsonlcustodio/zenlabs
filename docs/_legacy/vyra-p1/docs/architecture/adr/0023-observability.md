# ADR-0023 — CloudWatch with structured logs and correlation IDs

**Status**: Accepted · **Authority**: brief §35

## Context
Need traceability from a published video back to the script, context and
knowledge that produced it, without logging sensitive content.

## Decision
**CloudWatch** for logs, metrics, dashboards and alarms. JSON structured logging
with mandatory correlation fields. A redaction layer in
`packages/observability` enforces the never-log denylist. Distributed tracing is
deferred until a second deployable service exists (gate G-G).

## Alternatives rejected
- **Datadog/New Relic** — rejected at MVP: recurring cost not yet justified;
  CloudWatch is already in the baseline and meets the requirements.
- **Self-hosted ELK/Grafana stack** — rejected: stateful infrastructure to
  operate against the lean baseline.
- **OpenTelemetry tracing now** — deferred: correlation-ID log linking is
  sufficient within a single deployable; revisit at G-G.

## Consequences
- Correlation ID propagation is mandatory across HTTP, outbox, SQS and workers.
- Redaction is unit-tested (FF-20); logging sensitive content is a build failure.
- Audit records remain separate from logs.
