---
id: P6
title: "Ledgers, plans and subscription"
status: generated
depends_on: [P2]
---

# Epic P6 — Ledgers, plans and subscription

- **Epic ID**: `P6`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 5
- **Status**: `generated`
- **Wave**: 3
- **Priority**: P0
- **Depends on**: `P2`
- **Blocks**: `P8`, `P10`, `P11`, `P15`, `P16`, `P23`
- **Story points (epic total)**: 48
- **Stories**: 9
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Make consumption a fold over an append-only ledger rather than a mutable counter, so that three successful attempts consume three charges, a provider technical failure consumes nothing, and a duplicate commit is impossible.

**Goals**
- G1 `usage_ledger_entry`, `usage_reservation` and `provider_cost_entry` with their unique indexes.
- G2 Reserve, commit, release and adjustment operations that are idempotent by construction.
- G3 Plan catalogue, subscription, billing cycle and derived entitlement.
- G4 A `PaymentProvider` extension point with no gateway implementation (ADR-0029).
- G5 The consumption-correctness suite, including the three-successful-attempts case and the provider-failure case.

**Non-goals**
- NG1 No payment gateway - explicitly forbidden by FR-BL05 (not Asaas, Stripe, Mercado Pago or Pagar.me).
- NG2 No full financial accounting - out of scope by FR-PC04.
- NG3 No generation; the ledger is called by P11, not by this epic.

**Acceptance evidence**
- AE1 Balance is computed from the ledger; no mutable `remaining_minutes` is authoritative.
- AE2 A duplicate commit for the same attempt is rejected by a unique index, not by application logic alone.
- AE3 A provider terminal failure with no completed generation produces zero commits and releases the reservation.

**Assumptions**
- ASM-P6-01 Minimum billable duration (~60s) is configurable policy per FR-UC08, not a structural constant.

---

## Architecture Spec Summary

**Affected surfaces**: Modules `usage`, `provider-cost`, `plans`, `subscription`; `tests/idempotency/`.

**Integration points**: None external in this epic. Provider cost values arrive from adapters in P10.07 and P11.

**Risks**
- RISK-04 double or missing minute consumption - Critical. ADR-0018 and `usage-ledger.md` are the mitigation; this epic implements them.
- A mutable balance introduced as a performance shortcut would silently defeat FF-07; the fitness function exists for that reason.

**References (by path)**
- `docs/architecture/usage-ledger.md` §1-§7
- `docs/architecture/provider-cost-ledger.md`
- `docs/architecture/domain-model.md` §10
- `docs/architecture/database-schema.md` §3.5
- `docs/architecture/prd.md` §8.4, §8.5, §8.6
- `docs/architecture/adr/0018-usage-ledger.md`
- `docs/architecture/adr/0025-provider-cost-ledger.md`
- `docs/architecture/adr/0029-payment-provider-extension-point.md`
- `docs/architecture/fitness-functions.md` FF-07, FF-11

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | Plan consumption read for Portal; usage and cost ledgers read for Control | `api-contracts.md` §3.5, §5 |
| DB | `usage_ledger_entry`, `usage_reservation`, `provider_cost_entry`, `plan`, `subscription`, entitlement derivation | `database-schema.md` §3.5; unique indexes per `usage-ledger.md` §5 |
| UI | [N/A] | Plan and Control screens are P15.11 and P15.17. |
| Env/Config | Minimum billable duration policy; plan quantities | FR-UC08; configuration not constants |
| Event | `UsageReserved`, `UsageCommitted`, `UsageReleased`, `ProviderCostRecorded` | Emitted by transitions T08-T12 in P8 |
| Build | Ledger operations exported as the sole consumption path | Enforced by FF-07 |

---

## ADR / NFR Notes

- ADR-0018 fixes the usage ledger; ADR-0025 keeps provider cost in a separate ledger so client usage and VYRA cost never share a row (module 19 invariant).
- ADR-0029 permits a `PaymentProvider` extension point and forbids any gateway implementation (FR-BL05).
- NFR-15 idempotency applies directly: `usage-ledger.md` §5 fixes the idempotency keys and the unique indexes that enforce them.
- GATE-COST01 (per-provider cost field availability) is recorded on the cost ledger; the schema accepts a null cost with a reason rather than inventing a value.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| `usage-ledger.md` §3 / FF-11 | usage ledger schema | `P6.01` | AC-1..4 | FF-11 + integration | - |
| `usage-ledger.md` §3, §5 | reservation + unique indexes | `P6.02` | AC-1..4 | class 10 | - |
| `usage-ledger.md` §4, §4.1 | reserve/commit/release/adjust | `P6.03` | AC-1..6 | class 10 | - |
| `provider-cost-ledger.md` / FR-PC01 | provider cost ledger | `P6.04` | AC-1..4 | integration | - |
| `domain-model.md` §10 / FR-UC02 | plans + entitlement | `P6.05` | AC-1..4 | integration | - |
| `prd.md` §8.6 | subscription + payment status | `P6.06` | AC-1..4 | integration | - |
| ADR-0029 / FR-BL05 | PaymentProvider extension point | `P6.07` | AC-1..3 | typecheck + FF-02 | - |
| FF-07 / FR-UC05 | ledger-derived consumption | `P6.08` | AC-1..4 | FF-07 in CI | - |
| `testing-strategy.md` §2.1 | consumption-correctness suite | `P6.09` | AC-1..6 | class 10 suite | - |

**BDD example IDs**
- EX-P6-01 GIVEN three successful generation attempts, WHEN the ledger is folded, THEN exactly three commits exist even though only one was approved.
- EX-P6-02 GIVEN a provider terminal failure with no completed generation, WHEN the attempt ends, THEN zero commits exist and the reservation is released.
- EX-P6-03 GIVEN a completed generation that VYRA failed to ingest, WHEN the ledger is folded, THEN the commit stands and no release occurs.
- EX-P6-04 GIVEN the same attempt committed twice, WHEN the second commit is written, THEN the unique index rejects it.
- EX-P6-05 GIVEN code reading a mutable balance column as authoritative, WHEN CI runs, THEN FF-07 fails.

**Open questions**
- OQ-P6-01 Enterprise custom plan quantity representation - modelled as configuration; commercial confirmation pending.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 9/9 mapped; contracts 5/5 actionable entries mapped; examples 5/5 mapped to validations; unresolved gap codes: gate-dependent-cost-field (GATE-COST01), tracked and expected.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P6.01` | usage_ledger_entry append-only schema | 5 | — | P0 |
| `P6.02` | usage_reservation with unique indexes | 5 | `P6.01` | P0 |
| `P6.03` | Reserve, commit, release and adjustment operations | 8 | `P6.02` | P0 |
| `P6.04` | provider_cost_entry ledger | 5 | `P6.01` | P0 |
| `P6.05` | Plan catalogue and entitlement derivation | 5 | `P6.01` | P0 |
| `P6.06` | Subscription, billing cycle and manual payment status | 5 | `P6.05` | P0 |
| `P6.07` | PaymentProvider extension point without implementation | 2 | `P6.06` | P2 |
| `P6.08` | FF-07 consumption derived from the ledger | 5 | `P6.03`, `P6.05` | P0 |
| `P6.09` | Consumption-correctness test suite | 8 | `P6.03`, `P6.04` | P0 |

**Verification gate (epic exit)**: FF-07 passes; consumption-correctness tests green including the three-successful-attempts case, the provider-failure case and the ingestion-failure case; no mutable balance is authoritative; duplicate commit is impossible.
