---
id: P8
title: "Workflow engine"
status: generated
depends_on: [P5, P6, P7]
---

# Epic P8 — Workflow engine

- **Epic ID**: `P8`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 7
- **Status**: `generated`
- **Wave**: 5
- **Priority**: P0
- **Depends on**: `P5`, `P6`, `P7`
- **Blocks**: `P11`, `P12`, `P13`, `P15`, `P16`
- **Story points (epic total)**: 67
- **Stories**: 12
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Make content state unwritable outside the engine. Every one of the T01-T23 transitions declares its actor, precondition, effect, event, retry, compensation and idempotency, and the engine is the only thing allowed to apply them.

**Goals**
- G1 `ContentRequest` and `ContentItem` aggregates with the state vocabulary of `workflows-state-machines.md` §2.1.
- G2 A transition engine implementing the full T01-T23 table including T11a, T11b and T11c.
- G3 Guards G-1 to G-4 (`workflows-state-machines.md` §2.3).
- G4 Per-tenant MANUAL/AUTO approval policies that never weaken VYRA QA.
- G5 Domain event emission through the P7 outbox.

**Non-goals**
- NG1 No provider calls; T08 to T11 create attempts and the P11 adapters execute them.
- NG2 No QA record implementation; T13 and T14 are wired here but QA is P12.
- NG3 No UI.

**Acceptance evidence**
- AE1 A write to content state outside the engine fails FF-06.
- AE2 Every transition is covered for allowed actor, denied actor, precondition violation and replay (class 5).
- AE3 An `AUTO` tenant policy cannot produce a `READY` item without a human QA verdict.

**Assumptions**
- ASM-CR01 Only `objective` and `channel` are mandatory on a content request (`prd.md` FR-CR03, `domain-model.md` §6); remains open for product confirmation as OQ-01.

---

## Architecture Spec Summary

**Affected surfaces**: Modules `content`, `workflow`; `tests/workflow/`.

**Integration points**: None directly. The engine enqueues work that P9, P10, P11 and P13 execute.

**Risks**
- A state field writable from a repository would silently defeat the entire transition table; FF-06 is the structural answer.
- Transition retry and compensation implemented per call site rather than declared per transition would drift; the table is the single source.
- RISK-04 double consumption is reachable through T08 to T11 if idempotency keys are not applied exactly as specified.

**References (by path)**
- `docs/architecture/workflows-state-machines.md` §1, §2.1, §2.2, §2.3, §2.4, §2.5
- `docs/architecture/domain-model.md` §6, §7
- `docs/architecture/database-schema.md` §3.4
- `docs/architecture/prd.md` §8.1, §8.2, §8.3
- `docs/architecture/fitness-functions.md` FF-06

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | Content request creation, item listing, approval and rejection routes | `api-contracts.md` §3.1, §3.2 |
| DB | `content_request`, `content_item`, script versions, `generation_attempt` references | `database-schema.md` §3.4 |
| UI | [N/A] | Portal and Studio screens are P15. |
| Env/Config | `maxScriptRevisions`, per-transition retry budgets, approval policy defaults | FF-13 |
| Event | `ContentRequested`, `BriefingGenerated`, `ScriptGenerated`, `ScriptApproved`, `ScriptRejected`, `RenderRequested`, `RenderCompleted`, `RenderFailed`, `MediaIngested`, `MediaIngestionFailed`, `QAPassed`, `QAFailed`, `VideoApproved`, `VideoRejected`, `PublicationScheduled`, `PublicationCompleted`, `PublicationFailed` | Emitted via the P7.01 outbox |
| Build | Transition engine as the sole writer of content state | Enforced by FF-06 |

---

## ADR / NFR Notes

- ADR-0033 fixes the QA policy as `HUMAN_REQUIRED` for MVP; ADR-0034 separates ingestion from billing, which is why `INGESTING` and T11a/T11b/T11c exist.
- NFR-15 idempotency is satisfied per transition using the keys in the T01-T23 table, enforced by the P7.05 table.
- FR-WF04 requires every transition to define actor, preconditions, effects, emitted events, retry policy, compensation and idempotency; the engine's transition declaration must carry all seven fields or fail to compile.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| `prd.md` §8.1 / ASM-CR01 | `ContentRequest` | `P8.01` | AC-1..4 | integration + class 3 | - |
| `workflows-state-machines.md` §2.1 | `ContentItem` states | `P8.02` | AC-1..4 | class 5 | - |
| FR-WF04 / §1 | transition engine core | `P8.03` | AC-1..5 | class 5 | - |
| `workflows-state-machines.md` T01-T07 | request to script review | `P8.04` | AC-1..4 | class 5 | - |
| `workflows-state-machines.md` T08-T12, T11a-c | generation and ingestion | `P8.05` | AC-1..6 | class 5 + class 10 | - |
| `workflows-state-machines.md` T13-T16 | QA and approval transitions | `P8.06` | AC-1..4 | class 5 | - |
| `workflows-state-machines.md` T17-T23 | publication and terminal transitions | `P8.07` | AC-1..5 | class 5 | - |
| `workflows-state-machines.md` §2.3 | guards G-1..G-4 | `P8.08` | AC-1..4 | class 5 + FF-30 | - |
| `prd.md` §8.3 / ADR-0033 | approval policies | `P8.09` | AC-1..4 | class 5 + FF-33 precondition | - |
| `architecture.md` §7 | domain event emission | `P8.10` | AC-1..3 | integration | - |
| FF-06 | engine-only state writes | `P8.11` | AC-1..3 | FF-06 in CI | - |
| `testing-strategy.md` class 5 | transition suite | `P8.12` | AC-1..4 | class 5 suite | - |

**BDD example IDs**
- EX-P8-01 GIVEN a repository writing `content_item.state` directly, WHEN CI runs, THEN FF-06 fails naming the write.
- EX-P8-02 GIVEN a transition triggered twice with the same idempotency key, WHEN both execute, THEN the second is a no-op.
- EX-P8-03 GIVEN an actor not listed for a transition, WHEN they trigger it, THEN it is denied rather than silently ignored.
- EX-P8-04 GIVEN a provider that completed a billable generation, WHEN T11 fires, THEN usage is committed and no compensation path exists to reverse it.
- EX-P8-05 GIVEN the ingestion retry budget exhausted, WHEN T11b fires, THEN the item is BLOCKED with the provider reference preserved and no second render is submitted.

**Open questions**
- OQ-01 Mandatory versus optional content-request fields remains open for product confirmation; ASM-CR01 is the working resolution.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 12/12 mapped; contracts 5/5 actionable entries mapped; examples 5/5 mapped to validations; unresolved gap codes: none.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P8.01` | ContentRequest aggregate | 5 | — | P0 |
| `P8.02` | ContentItem aggregate and state vocabulary | 5 | `P8.01` | P0 |
| `P8.03` | Transition engine core | 8 | `P8.02`, `P7.05` | P0 |
| `P8.04` | Transitions T01-T07: request to script review | 5 | `P8.03` | P0 |
| `P8.05` | Transitions T08-T12 and T11a/T11b/T11c | 8 | `P8.04`, `P6.03` | P0 |
| `P8.06` | Transitions T13-T16: QA and approval | 5 | `P8.05` | P0 |
| `P8.07` | Transitions T17-T23: scheduling, publication and terminal states | 5 | `P8.06` | P0 |
| `P8.08` | Guards G-1 to G-4 | 5 | `P8.05` | P0 |
| `P8.09` | Per-tenant approval policies | 5 | `P8.06` | P0 |
| `P8.10` | Domain event emission | 3 | `P8.03`, `P7.01` | P0 |
| `P8.11` | FF-06 content state changes only via the engine | 5 | `P8.03` | P0 |
| `P8.12` | State machine test suite (class 5) | 8 | `P8.07`, `P8.08`, `P8.09` | P0 |

**Verification gate (epic exit)**: FF-06 passes; state machine tests (class 5) cover every transition for allowed actor, denied actor, precondition violation and replay; state is unwritable outside the engine.
