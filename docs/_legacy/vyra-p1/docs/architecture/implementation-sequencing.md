# VYRA — Implementation Sequencing

- **Authority**: brief §45, §51
- **Audience**: implementing agents. Each phase states dependencies, scope,
  acceptance gate and definition of done.
- **IMPLEMENTATION NOT STARTED** — this is the plan, not the execution.

## Rules

1. A phase may not start until every dependency's **acceptance gate** is green.
2. Every phase ends with its fitness functions passing in CI.
3. No phase introduces an AWS service that lacks a fired promotion gate.
4. External gates (GATE-*) never block a phase; they block production launch of
   the affected capability.

---

## Phase 0 — Foundation
**Depends on**: nothing.
**Scope**: monorepo skeleton, TypeScript config, lint with boundary rules,
`packages/contracts`, `packages/config`, CI pipeline stages 1–5, secret scanning.
**Acceptance gate**: FF-04, FF-19 pass; empty pipeline green.
**DoD**: `pnpm lint typecheck test` green; no application code yet.

## Phase 1 — Data foundation & tenancy
**Depends on**: 0.
**Scope**: `packages/database`, Drizzle setup, migration tooling, `tenant`,
`user`, `membership`, `session`, `audit_record`; RLS policies and roles
(`vyra_migrator`, `vyra_app`); `TenantContext` repository primitive.
**Acceptance gate**: **FF-01, FF-11, FF-22 pass**; tenancy isolation tests
(class 7) green with two seeded tenants.
**DoD**: it is impossible to add a client-owned table without RLS and have CI pass.

> This phase is deliberately first. Tenancy retrofitted later is a breach.

## Phase 2 — Identity & authorization
**Depends on**: 1.
**Scope**: Argon2id auth, opaque sessions, TOTP MFA, lockout, rate limiting,
CSRF, RBAC guards, route manifest, audit writes on sensitive actions.
**Acceptance gate**: FF-17, FF-23 pass; authorization matrix (class 6) green.
**DoD**: every route declares a guard; revoked session rejected on next request.

## Phase 3 — Provider framework
**Depends on**: 0.  *(parallel with 1–2)*
**Scope**: `packages/providers` ports, error taxonomy, retry/backoff/breaker,
capability registry, **all mocks with success and failure fixtures**,
`PROVIDER_MODE` switching.
**Acceptance gate**: FF-02, FF-03, FF-08, FF-13 pass; adapter tests (class 4) green.
**DoD**: every port has a mock; no domain path can import a provider SDK.

## Phase 4 — Governance & identity assets
**Depends on**: 2, 3.
**Scope**: consent aggregate, identity owner, digital identity versioning,
digital twin and voice clone lifecycles, revocation with propagation tracking.
**Acceptance gate**: FF-12, FF-30 pass; governance tests green.
**DoD**: revocation blocks generation before the API returns success; every
generation path is consent-guarded.

## Phase 5 — Ledgers
**Depends on**: 1.
**Scope**: `usage_ledger_entry`, `usage_reservation`, `provider_cost_entry`,
plans, subscription, entitlement derivation, reserve/commit/release/adjustment
operations with their unique indexes.
**Acceptance gate**: **FF-07 passes**; consumption-correctness tests green,
including the three-successful-attempts case and the provider-failure case.
**DoD**: no mutable balance is authoritative; duplicate commit is impossible.

> Phases 4 and 5 precede any generation code on purpose: both guard it.

## Phase 6 — Async backbone
**Depends on**: 1.
**Scope**: transactional outbox, relay, SQS queues + DLQs, worker harness with
tenant context, idempotency table, webhook intake endpoint, reconciliation loops.
**Acceptance gate**: FF-24, FF-28 pass; queue/retry (class 9), idempotency
(class 10), webhook replay (class 11) tests green.
**DoD**: an unsigned webhook cannot cause a transition; replays are single-effect.

## Phase 7 — Workflow engine
**Depends on**: 4, 5, 6.
**Scope**: content request, content item, the T01–T23 transition table, guards
G-1..G-4, approval policies, domain events.
**Acceptance gate**: FF-06 passes; state machine tests (class 5) cover every
transition for allowed actor, denied actor, precondition violation and replay.
**DoD**: state is unwritable outside the engine.

## Phase 8 — Knowledge engine
**Depends on**: 1, 6.
**Scope**: upload flow, parsing, chunking, embeddings, pgvector retrieval,
SSRF and upload controls, provenance and retrieval traces.
**Acceptance gate**: FF-05, FF-25, FF-26 pass; knowledge and security tests green.
**DoD**: retrieval is tenant-filtered in SQL; hostile fetches and uploads refused.

## Phase 9 — Intelligence engine
**Depends on**: 3, 8.
**Scope**: context builder, prompt templates and versions, model router and
policies, output validator, brand compliance task, token cost recording.
**Acceptance gate**: FF-09, FF-27 pass; injection containment verified.
**DoD**: no model id outside config; retrieved text never reaches the
instruction region.

## Phase 10 — Voice & video generation
**Depends on**: 7, 9.
**Scope**: ElevenLabs synthesis, S3 ingestion, HeyGen upload-asset handoff,
render submission and polling, the `INGESTING` state with its retry budget and
reconciler, media assets, signed URL issuance.
**Acceptance gate**: **FF-21, FF-28, FF-32 pass**; end-to-end generation green
against mocks, including the forced-ingestion-failure path.
**DoD**: a retry polls instead of resubmitting; no media on local disk; usage
commits exactly once per completed attempt; an ingestion failure keeps the commit,
preserves the provider reference, and triggers **no** second render.
**External gates**: GATE-HG01..04, GATE-EL01 (production only).

## Phase 11 — QA & approvals
**Depends on**: 7, 10.
**Scope**: `QARecord` with human verdict (`HUMAN_REQUIRED`), client approval
endpoints, tenant `MANUAL`/`AUTO` policy for client acceptance only.
**Acceptance gate**: **FF-33 passes**; authorization + state machine tests for
T05/T06/T13/T14/T15/T16.
**DoD**: a tenant `AUTO` setting never skips VYRA QA; `AUTO` never bypasses brand
compliance; every item reaching `READY` has a human QA verdict.

## Phase 12 — Calendar & publishing
**Depends on**: 11.
**Scope**: campaigns, scheduled publications, dispatcher, Meta and TikTok
adapters, OAuth flows, encrypted token storage, refresh, AI disclosure.
**Acceptance gate**: **FF-10, FF-15, FF-29 pass**; publishing tests green.
**DoD**: no plaintext token column; duplicate publication impossible; disclosure
present or publication blocked.
**External gates**: GATE-TT01, GATE-TT02, GATE-MT01, GATE-MT02.

## Phase 13 — Performance
**Depends on**: 12.
**Scope**: collection windows, normalized snapshots + raw payload, dashboards
reading only from snapshots.
**Acceptance gate**: FF-16 passes.
**DoD**: opening a dashboard makes zero provider calls.

## Phase 14 — Surfaces
**Depends on**: 2, and the modules each screen needs.
**Scope**: `packages/ui` primitives, Portal, Studio, Control; responsiveness and
accessibility from the start; no page-stories (ADR-0028).
**Acceptance gate**: FF-17 passes for every rendered route.
**DoD**: no screen relies on hidden UI for authorization.

## Phase 15 — Operations
**Depends on**: all.
**Scope**: dashboards, alarms, runbooks (including the ingestion manual-recovery
runbook), retention jobs, provider balance sync, `NotificationProvider` with
in-app delivery only (`EmailProvider` left unimplemented, GATE-NOTIF01), load tests.
**Acceptance gate**: FF-20, FF-31 pass; load tests meet NFR-01/02/03.
**DoD**: every alarm in `observability.md` §4 exists and has a runbook.

---

## Critical path

```
0 → 1 → 2 ─┐
0 → 3 ─────┼→ 4 ─┐
    1 → 5 ─┴─────┼→ 7 → 10 → 11 → 12 → 13 → 15
    1 → 6 ───────┘        ▲
    1 → 8 → 9 ────────────┘
                     2 → 14
```

## Definition of done for the whole architecture phase

Every §46 topic has an artifact; ≥23 ADRs each record one chosen option; the
state machine specifies actor, precondition, effect, event, retry, compensation
and idempotency per transition; both ledgers specify exact lifecycle points and
idempotency keys; every §33 threat has a named mitigation; every §50 rule has an
automatable fitness function; risks are classified; assumptions are marked; and
no contradiction remains between artifacts.
