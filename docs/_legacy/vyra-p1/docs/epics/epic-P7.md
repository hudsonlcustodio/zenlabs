---
id: P7
title: "Async backbone"
status: generated
depends_on: [P2]
---

# Epic P7 — Async backbone

- **Epic ID**: `P7`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 6
- **Status**: `generated`
- **Wave**: 3
- **Priority**: P0
- **Depends on**: `P2`
- **Blocks**: `P8`, `P9`, `P11`, `P13`, `P15`, `P16`
- **Story points (epic total)**: 49
- **Stories**: 10
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Give the platform a reliable asynchronous spine: a transactional outbox, queues with dead letters, workers that carry tenant context, an idempotency table, and a webhook intake that cannot be driven by an unsigned request.

**Goals**
- G1 Transactional outbox and relay so an event is never emitted without its state change.
- G2 SQS queues and DLQs per worker with retry and backoff per `workflows-state-machines.md` §5.
- G3 A worker harness that opens tenant context exactly as HTTP requests do.
- G4 An idempotency table implementing ADR-0030 for every key in `architecture.md` §7.
- G5 A webhook intake endpoint that is signature-gated and replay-safe (ADR-0031).
- G6 Reconciliation loops per `provider-architecture.md` §7 and `workflows-state-machines.md` §7.

**Non-goals**
- NG1 No Redis - excluded by ADR-0026.
- NG2 No provider-specific webhook handlers; those ship with their adapters (P11, P13).
- NG3 No workflow transitions; the engine is P8.

**Acceptance evidence**
- AE1 An unsigned webhook causes no state transition.
- AE2 The same `provider_event_id` delivered twice produces exactly one effect.
- AE3 A job that fails its retry budget lands in a DLQ rather than disappearing.

**Assumptions**
- ASM-P7-01 Webhook signature schemes are provider-specific and gated (GATE-HG04); the intake verifies through a port so an unconfirmed scheme does not block the endpoint.

---

## Architecture Spec Summary

**Affected surfaces**: Modules and infrastructure for outbox, queues, workers; `apps/worker-*` harness; `tests/queue/`, `tests/idempotency/`, `tests/webhooks/`.

**Integration points**: SQS and DLQs via LocalStack in tests; inbound provider webhooks reach `apps/api`.

**Risks**
- An event emitted outside the state transaction produces phantom effects; the outbox exists to make that impossible.
- ADR-0031 treats webhooks as untrusted hints; an implementation that trusts payload contents would reintroduce the risk.
- RISK-08 provider unavailability - reconciliation loops are the recovery path when a webhook never arrives.

**References (by path)**
- `docs/architecture/architecture.md` §7
- `docs/architecture/workflows-state-machines.md` §5, §7
- `docs/architecture/provider-architecture.md` §7, §8
- `docs/architecture/adr/0009-asynchronous-processing.md`
- `docs/architecture/adr/0026-no-redis-at-mvp.md`
- `docs/architecture/adr/0030-idempotency-strategy.md`
- `docs/architecture/adr/0031-webhooks-untrusted-hints.md`
- `docs/architecture/fitness-functions.md` FF-24, FF-28

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | Webhook intake endpoints | `api-contracts.md` §6 |
| DB | `domain_event` outbox, idempotency table, DLQ bookkeeping | `database-schema.md` §3.7; outbox retention 30 days per §5 |
| UI | [N/A] | Queue observation is Studio, P15.13. |
| Env/Config | Queue names, retry budgets, backoff parameters, visibility timeouts | FF-13: configuration not constants |
| Event | Outbox envelope shared by every domain event | Payload types from `packages/contracts` |
| Build | Worker harness exported with tenant context wiring | Reuses the P2.06 primitive |

---

## ADR / NFR Notes

- ADR-0009 fixes asynchronous processing; ADR-0026 forbids Redis at MVP so no queue or lock may assume it.
- ADR-0030 fixes the idempotency strategy; `architecture.md` §7 enumerates the keys that class 10 must double-invoke.
- ADR-0031 treats webhooks as untrusted hints: a webhook may prompt a check but never supply authoritative state.
- GATE-HG04 (HeyGen webhook availability and signature scheme) is recorded; the intake is built against the port, not the vendor.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| `architecture.md` §7 / ADR-0009 | outbox table | `P7.01` | AC-1..4 | integration | - |
| ADR-0009 | outbox relay | `P7.02` | AC-1..4 | integration + class 9 | - |
| `workflows-state-machines.md` §5 | queues + DLQs | `P7.03` | AC-1..4 | class 9 | - |
| `architecture.md` §5, §2.1 | worker harness | `P7.04` | AC-1..4 | class 7 + class 9 | - |
| ADR-0030 / `architecture.md` §7 | idempotency table | `P7.05` | AC-1..4 | class 10 | - |
| ADR-0031 / `provider-architecture.md` §8 | webhook intake | `P7.06` | AC-1..5 | class 11 | - |
| `provider-architecture.md` §7 / §7 workflows | reconciliation loops | `P7.07` | AC-1..4 | integration | - |
| FF-24 | webhook fitness function | `P7.08` | AC-1..3 | FF-24 in CI | - |
| FF-28 | generation idempotency check | `P7.09` | AC-1..3 | FF-28 in CI | - |
| `testing-strategy.md` classes 9-11 | queue/idempotency/webhook suites | `P7.10` | AC-1..4 | classes 9, 10, 11 | - |

**BDD example IDs**
- EX-P7-01 GIVEN a state change whose transaction rolls back, WHEN the relay runs, THEN no event is published.
- EX-P7-02 GIVEN the same `provider_event_id` delivered twice, WHEN both are processed, THEN exactly one effect occurs.
- EX-P7-03 GIVEN a webhook with an invalid signature, WHEN it is received, THEN no state transition occurs and the request is rejected.
- EX-P7-04 GIVEN a job exceeding its retry budget, WHEN the final attempt fails, THEN the message lands in the DLQ with its error class recorded.
- EX-P7-05 GIVEN a worker job, WHEN it runs, THEN it executes inside a tenant-scoped transaction exactly as an HTTP request would.

**Open questions**
- OQ-P7-01 Whether HeyGen exposes webhooks at all is GATE-HG04; polling remains the primary path and the webhook is an accelerator (`provider-architecture.md` §7).

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 10/10 mapped; contracts 5/5 actionable entries mapped; examples 5/5 mapped to validations; unresolved gap codes: gate-dependent-webhook-scheme (GATE-HG04), tracked and expected.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P7.01` | Transactional outbox table | 5 | — | P0 |
| `P7.02` | Outbox relay | 5 | `P7.01` | P0 |
| `P7.03` | SQS queues and dead-letter queues | 5 | `P7.02` | P0 |
| `P7.04` | Worker harness with tenant context | 5 | `P7.03`, `P2.06` | P0 |
| `P7.05` | Idempotency table and key strategy | 5 | `P7.04` | P0 |
| `P7.06` | Webhook intake with signature verification | 8 | `P7.05` | P0 |
| `P7.07` | Reconciliation loops | 5 | `P7.06` | P0 |
| `P7.08` | FF-24 webhook idempotent and signature-gated | 3 | `P7.06` | P0 |
| `P7.09` | FF-28 generation idempotency check | 3 | `P7.05` | P0 |
| `P7.10` | Queue, idempotency and webhook replay suites | 5 | `P7.03`, `P7.05`, `P7.06` | P0 |

**Verification gate (epic exit)**: FF-24 and FF-28 pass; queue/retry (class 9), idempotency (class 10) and webhook replay (class 11) tests green; an unsigned webhook cannot cause a transition; replays are single-effect.
