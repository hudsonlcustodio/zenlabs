---
id: P23
title: "VYRA Control experience"
status: generated
depends_on: [P6, P10, P15, P20]
---

# Epic P23 — VYRA Control experience

- **Epic ID**: `P23`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 14 (Surfaces), administration and governance half
- **Status**: `generated`
- **Wave**: 11
- **Priority**: P0
- **Depends on**: `P6`, `P10`, `P15`, `P20`
- **Blocks**: `P16`, `P24`
- **Story points (epic total)**: 63
- **Stories**: 9
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Make administration and governance legible and deliberate. Control is where tenants are suspended, entitlements are changed, ledgers are read and consent history is inspected — so every surface here must make the append-only nature of the record obvious, make every dangerous action require a second act, and never present an estimate as a fact.

`P15` owns route, authorization and data binding for the Control routes; `P23` owns the experience, the grid depth and the state coverage.

**Goals**
- G1 Every Control screen blueprint in `VYRA_PRODUCT_EXPERIENCE.md` §33 realised against its stated objective, hierarchy, regions, components and states.
- G2 Ledger surfaces that are visibly append-only: no edit affordance anywhere, corrections expressed as adjustments, and the reserve/commit/release chain readable per entry (`FF-11`, `FF-07`, ADR-0018).
- G3 Cost and contribution surfaces where a **reported** cost and an **estimated** cost are visually distinct in every view (`GATE-COST01`, `RISK-14`, ADR-0025).
- G4 Provider health, balance and integration surfaces that state gate-dependent conditions plainly and never display a token value (`FF-10`).
- G5 An audit explorer over virtualised, filterable, correlation-id-searchable records where redacted fields render as `[redacted]` rather than as blank (`FF-20`).
- G6 MFA re-assertion on every sensitive Control action (`RISK-11`), with the dangerous path always requiring a second deliberate act.

**Non-goals**
- NG1 No new API resource; `api-contracts.md` §5 is consumed as contracted.
- NG2 No client-side authorization (`FF-17`).
- NG3 No ledger mutation. Ledgers are append-only; an "edit" affordance is a defect, not a feature (`FF-11`).
- NG4 No new primitive; everything composes `P18`, `P19` and `P20`.
- NG5 No mobile Control; below `md` the designed refusal applies, and `md` is read-only (§22.1).
- NG6 No payment gateway; `ADR-0029` leaves it an extension point and the plan screens say so.

**Acceptance evidence**
- AE1 Every Control blueprint in §33 passes the 14-point conformance checklist of §34.
- AE2 No ledger or audit surface exposes an edit or delete affordance; a seeded one fails the append-only assertion.
- AE3 An estimated provider cost is visually distinct from a reported one in every view that renders it, and a mixed set never aggregates into a single unqualified number.
- AE4 No screen displays a social or provider token value, in whole or in part.
- AE5 Every sensitive action requires MFA re-assertion and produces an audit record visible in the audit explorer.
- AE6 A redacted audit field renders as `[redacted]` and never as an empty cell.

**Assumptions**
- ASM-P23-01 `VYRA_PRODUCT_EXPERIENCE.md` §33 is canonical for Control screen composition.
- ASM-P23-02 The set of "sensitive actions" requiring MFA re-assertion is configuration derived from the `P3.08` audit-write list, not a hand-maintained UI list.
- ASM-P23-03 All twelve `GATE-*` are open at MVP by design (`implementation-sequencing.md` §Rules 4); the gate register renders that as the correct state, not as a defect.

---

## Architecture Spec Summary

**Affected surfaces**: `apps/web` `(control)` route group.

**Integration points**: Control routes from `api-contracts.md` §5. No surface calls a provider (`FF-16` applies to every read path).

**Risks**
- `RISK-11`: a compromised internal `SUPER_ADMIN` can revoke consent or adjust usage. MFA re-assertion plus audit plus alarms is the accepted mitigation; the UI must make both the re-assertion and the audit visible so the mitigation is felt, not merely configured.
- `RISK-14` / `GATE-COST01`: not every provider exposes a per-job cost. Presenting an estimate as a fact would corrupt every downstream commercial decision; AE3 is the control.
- An append-only ledger with an edit-looking UI teaches operators to expect mutation that cannot happen. AE2 keeps the affordance honest.

**References (by path)**
- `docs/product/VYRA_PRODUCT_EXPERIENCE.md` §14, §29.4, §33, §34
- `docs/architecture/prd.md` §5.3, FR-C01…FR-C09, NFR-14
- `docs/architecture/api-contracts.md` §5
- `docs/architecture/usage-ledger.md`
- `docs/architecture/provider-cost-ledger.md` §5
- `docs/architecture/observability.md` §4
- `docs/architecture/adr/0018-usage-ledger.md`
- `docs/architecture/adr/0025-provider-cost-ledger.md`
- `docs/architecture/adr/0024-audit-and-governance.md`
- `docs/architecture/fitness-functions.md` FF-07, FF-10, FF-11, FF-16, FF-17, FF-20
- `docs/architecture/risks.md` RISK-11, RISK-14, GATE-COST01

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | `api-contracts.md` §5 consumed as contracted | No new resource. |
| DB | [N/A] | — |
| UI | Control screen compositions per `VYRA_PRODUCT_EXPERIENCE.md` §33 | Built from `P18`/`P19`/`P20` primitives only. |
| Env/Config | Sensitive-action set, balance warning thresholds, ledger page size | Configuration. |
| Event | [N/A] | — |
| Build | Append-only affordance assertion; token-display assertion; Control blueprint coverage check | Consumed by `P24.07`. |

---

## ADR / NFR Notes

- ADR-0018 and ADR-0025 keep the two ledgers separate concepts; `P23.06` and `P23.07` must never present client entitlement and VYRA provider cost as one number.
- ADR-0024 fixes audit and governance; `P23.09` is its read surface.
- `FF-11` (append-only) is why every correction is an adjustment entry and never an edit.
- `FF-16` applies to Control too: provider health and balance render from polled snapshots (`P16.05`), so the surface states the last successful sync rather than offering a synchronous fetch.
- `NFR-14` applies at `lg` and above; `md` is read-only and below `md` is the designed refusal.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| PX §33.0 / RISK-11 | Control chrome, density, MFA re-assertion | `P23.01` | AC-1..5 | sensitive-action matrix | - |
| PX §33.1 / FR-C09 / `observability.md` §4 | status board and gate register | `P23.02` | AC-1..6 | alarm→runbook resolution | ASM-P23-03 |
| PX §33.2 / FR-C01 | tenancy administration | `P23.03` | AC-1..5 | suspension-impact fixtures | - |
| PX §33.3 / FR-C02 | users, roles and sessions | `P23.04` | AC-1..5 | last-admin protection | - |
| PX §33.4 / FR-C03 / ADR-0029 | plans, entitlements, impact preview | `P23.05` | AC-1..5 | impact-preview fixture | - |
| PX §33.5 / FR-C04 / FF-07, FF-11 | usage ledger experience | `P23.06` | AC-1..6 | append-only assertion | - |
| PX §29.4, §33.6 / FR-C05 / ADR-0025 | cost and contribution | `P23.07` | AC-1..6 | estimated-vs-reported | GATE-COST01 |
| PX §33.7, §33.8 / FR-C06, FR-C08 / FF-10 | provider health, balance, integrations | `P23.08` | AC-1..7 | token-display assertion | GATE-MT01/MT02/TT01 |
| PX §33.9, §33.10 / FR-C07 / ADR-0024, FF-20 | audit explorer, security, state coverage | `P23.09` | AC-1..7 | redaction + coverage check | - |

**BDD example IDs**
- EX-P23-01 GIVEN any ledger or audit surface, WHEN it renders, THEN no edit or delete affordance exists.
- EX-P23-02 GIVEN a provider that does not report per-job cost, WHEN its entries render, THEN they are marked `estimated` and are never aggregated into an unqualified total.
- EX-P23-03 GIVEN any integration surface, WHEN it renders, THEN no token value appears in whole or in part.
- EX-P23-04 GIVEN a sensitive action, WHEN it is attempted, THEN MFA re-assertion is required and the completed action appears in the audit explorer.
- EX-P23-05 GIVEN an audit entry with a redacted field, WHEN it renders, THEN it shows `[redacted]` rather than an empty cell.
- EX-P23-06 GIVEN an entitlement change that would fall below a tenant's current consumption, WHEN it is submitted, THEN an impact preview is shown and explicit acknowledgement is required.
- EX-P23-07 GIVEN all twelve external gates open, WHEN the gate register renders, THEN it presents that as the expected MVP state with each gate's owner.
- EX-P23-08 GIVEN a depleted provider balance, WHEN the provider screen renders, THEN it states the affected item count and links to the runbook.

**Open questions**
- OQ-P23-01 `OQ-P16-05` — `provider-cost-ledger.md` §5 routes a depleted balance to `BLOCKED` via T22 while the T22 precondition list in `workflows-state-machines.md` §2.2 does not name balance depletion. `P23.08` renders whichever behaviour the reconciliation fixes; the divergence must be resolved before wave 5 (`P8.07`), not before this epic.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories. Token
values are never rendered, never copyable and never partially revealed.

**Trace coverage**: requirements 9/9 mapped; contracts 3/3 actionable entries mapped; examples 8/8 mapped to validations; unresolved gap codes: gate-dependent-cost-field (GATE-COST01), gate-dependent-provider-contract (GATE-MT01, GATE-MT02, GATE-TT01) — all surfaced and stated.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P23.01` | Control chrome, density and MFA re-assertion experience | 5 | — | P0 |
| `P23.02` | Control status board: alarms, provider health, pressure and gate register | 8 | `P23.01` | P0 |
| `P23.03` | Tenancy administration experience | 5 | `P23.01` | P0 |
| `P23.04` | Users, roles and session administration experience | 5 | `P23.01` | P0 |
| `P23.05` | Plans and entitlements with change-impact preview | 8 | `P23.03` | P0 |
| `P23.06` | Usage ledger experience with the reservation chain | 8 | `P23.05` | P0 |
| `P23.07` | Cost and contribution with estimated-value distinction | 8 | `P23.06` | P0 |
| `P23.08` | Provider health, balance and integration experience | 8 | `P23.02` | P0 |
| `P23.09` | Audit explorer, security surface and Control state coverage | 8 | `P23.04`, `P23.07`, `P23.08` | P0 |

**Verification gate (epic exit)**: every Control blueprint in §33 passes the §34 checklist; the append-only assertion proves no ledger or audit surface exposes an edit or delete affordance; estimated and reported costs are visually distinct in every view and are never aggregated into an unqualified total; no token value is rendered anywhere; every sensitive action requires MFA re-assertion and produces a visible audit record; redacted fields render as `[redacted]`; the gate register presents twelve open gates as the expected MVP state with owners; the `P18.16` harness is green across the Control route group.
