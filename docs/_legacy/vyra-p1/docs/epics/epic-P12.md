---
id: P12
title: "QA and approvals"
status: generated
depends_on: [P8, P11]
---

# Epic P12 — QA and approvals

- **Epic ID**: `P12`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 11
- **Status**: `generated`
- **Wave**: 7
- **Priority**: P0
- **Depends on**: `P8`, `P11`
- **Blocks**: `P13`, `P15`, `P16`
- **Story points (epic total)**: 30
- **Stories**: 6
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Separate VYRA's quality gate from the client's acceptance, and make it structurally impossible for a tenant setting to skip the human QA verdict.

**Goals**
- G1 `QARecord` carrying an explicit human verdict under the MVP `HUMAN_REQUIRED` policy.
- G2 QA reviewer endpoints implementing T13 and T14.
- G3 Client approval endpoints implementing T05, T06, T15 and T16.
- G4 A tenant MANUAL/AUTO policy that applies to client acceptance only.
- G5 FF-33 proving QA cannot be skipped by any approval setting.

**Non-goals**
- NG1 No automated QA policy; ADR-0033 makes `HUMAN_REQUIRED` the MVP policy and FR-AP07 states no automated policy is an MVP requirement.
- NG2 No UI; the QA and approval screens are P15.06, P15.07 and P15.14.

**Acceptance evidence**
- AE1 An item reaching `READY` always has a human QA verdict.
- AE2 A tenant `AUTO` setting never skips VYRA QA.
- AE3 `AUTO` never bypasses brand compliance.

**Assumptions**
- ASM-P12-01 `QAPolicy` remains extensible to `AI_ASSISTED` and a future automated policy without either being implemented (FR-AP07).

---

## Architecture Spec Summary

**Affected surfaces**: Modules `content`, `workflow`; QA and approval routes; `tests/authz/`, `tests/workflow/`.

**Integration points**: None external.

**Risks**
- A tenant convenience setting silently weakening a quality gate is the exact failure FR-AP04 forbids; FF-33 is the mechanical answer.
- Conflating VYRA QA with client acceptance would make the distinction in §2.5 unenforceable.

**References (by path)**
- `docs/architecture/workflows-state-machines.md` §2.5, T05, T06, T13-T16
- `docs/architecture/prd.md` §8.3 FR-AP01-FR-AP07
- `docs/architecture/adr/0033-qa-policy.md`
- `docs/architecture/api-contracts.md` §3.2, §4
- `docs/architecture/fitness-functions.md` FF-33

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | Script approve/reject, video approve/reject, QA verdict submission | `api-contracts.md` §3.2, §4 |
| DB | `qa_record` with verdict, reviewer, reason and timestamp | `database-schema.md` §3.4 |
| UI | [N/A] | P15.06, P15.07, P15.14. |
| Env/Config | Tenant approval policy defaults | Policy values, not gates |
| Event | `QAPassed`, `QAFailed`, `ScriptApproved`, `ScriptRejected`, `VideoApproved`, `VideoRejected` | Emitted by the P8 engine |
| Build | `QAPolicy` type extensible but with one active value in MVP | ADR-0033 |

---

## ADR / NFR Notes

- ADR-0033 fixes MVP QA as `HUMAN_REQUIRED` and not tenant-configurable, resolving former OQ-04.
- FR-AP04 states automation must never remove security or governance requirements; FF-33 converts that into a build failure.
- FR-AP06 restricts a tenant's AUTO video setting to the tenant's own acceptance step only.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| ADR-0033 / FR-AP05 | `QARecord` | `P12.01` | AC-1..4 | integration + class 5 | - |
| `workflows-state-machines.md` T13, T14 | QA endpoints | `P12.02` | AC-1..4 | class 3 + class 6 | - |
| `workflows-state-machines.md` T05, T06, T15, T16 | approval endpoints | `P12.03` | AC-1..4 | class 3 + class 6 | - |
| FR-AP06 / §2.5 | tenant acceptance policy | `P12.04` | AC-1..4 | class 5 | - |
| FF-33 / FR-AP05 | QA cannot be skipped | `P12.05` | AC-1..4 | FF-33 in CI | - |
| `testing-strategy.md` classes 5, 6 | approval test coverage | `P12.06` | AC-1..4 | classes 5, 6 | - |

**BDD example IDs**
- EX-P12-01 GIVEN a tenant with AUTO video approval, WHEN no human QA verdict exists, THEN the item cannot reach READY, SCHEDULED or PUBLISHED.
- EX-P12-02 GIVEN an actor who is not a `QA_REVIEWER`, WHEN they submit a QA verdict, THEN it is denied.
- EX-P12-03 GIVEN a rejection without a reason, WHEN it is submitted, THEN it is refused.
- EX-P12-04 GIVEN a tenant with AUTO script approval and a failing brand verdict, WHEN T05 is evaluated, THEN system approval is refused.

**Open questions**
- OQ-P12-01 Whether `AI_ASSISTED` QA becomes a post-MVP policy is a product decision; the type is extensible and no implementation exists (ASM-P12-01).

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 6/6 mapped; contracts 5/5 actionable entries mapped; examples 4/4 mapped to validations; unresolved gap codes: none.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P12.01` | QARecord with human verdict | 5 | — | P0 |
| `P12.02` | QA reviewer endpoints (T13, T14) | 5 | `P12.01` | P0 |
| `P12.03` | Client approval endpoints (T05, T06, T15, T16) | 5 | `P12.01` | P0 |
| `P12.04` | Tenant MANUAL/AUTO policy for client acceptance only | 5 | `P12.03` | P0 |
| `P12.05` | FF-33 VYRA QA cannot be skipped | 5 | `P12.04` | P0 |
| `P12.06` | Authorization and state machine coverage for approval transitions | 5 | `P12.05` | P0 |

**Verification gate (epic exit)**: FF-33 passes; authorization and state machine tests green for T05, T06, T13, T14, T15 and T16; every item reaching READY has a human QA verdict.
