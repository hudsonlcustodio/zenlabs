---
id: P4
title: "Provider framework"
status: generated
depends_on: [P1]
---

# Epic P4 — Provider framework

- **Epic ID**: `P4`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 3
- **Status**: `generated`
- **Wave**: 2
- **Priority**: P0
- **Depends on**: `P1`
- **Blocks**: `P5`, `P9`, `P10`, `P11`, `P13`, `P16`
- **Story points (epic total)**: 55
- **Stories**: 11
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Make every external system a replaceable adapter behind a port, with mocks complete enough that architecture, local development and CI are never blocked by an unsigned contract or a missing credential.

**Goals**
- G1 `packages/providers` ports for every external capability (`provider-architecture.md` §1).
- G2 A shared error taxonomy (§5) that adapters map onto, so the domain never sees a vendor error.
- G3 Retry, backoff and circuit breaking as framework behaviour rather than per-adapter code.
- G4 A capability registry (§2) so generation queries capability instead of assuming it.
- G5 Every port has a deterministic mock with success and failure fixtures, switched by `PROVIDER_MODE`.
- G6 One resolver owns every runtime credential and FF-14 bans the direct-environment path by lint, before ten adapters exist (`P4.11`, ADR-0022).

**Non-goals**
- NG1 No live provider call and no real adapter behaviour; HeyGen and ElevenLabs implementations are P11, Meta and TikTok are P13, LLMs are P10.
- NG2 No `PaymentProvider` implementation - ADR-0029 permits the extension point only (delivered in P6.07).
- NG3 No `EmailProvider` implementation - ADR-0027 and GATE-NOTIF01 (P16.06).

**Acceptance evidence**
- AE1 A domain or application file importing a provider SDK fails FF-02.
- AE2 A domain type referencing a provider-specific shape fails FF-03.
- AE3 The full test suite runs with `PROVIDER_MODE` set to mock and spends no provider credit (FF-08).

**Assumptions**
- ASM-HG01 Avatar V capability is not universal across looks; the capability registry exists because of this (`prd.md` §9.1).
- ASM-P4-01 Provisional fixtures are marked as such wherever a contract is gated (GATE-HG04, GATE-TT02, GATE-MT02, GATE-COST01) rather than asserting a guessed shape.

---

## Architecture Spec Summary

**Affected surfaces**: `packages/providers`, `packages/config` provider keys, `tests/providers/`.

**Integration points**: All external systems, by definition - but only as port shapes and mocks in this epic.

**Risks**
- RISK-02 HeyGen Enterprise contract unsigned (GATE-HG01). Mock-first is the mitigation and this epic delivers it.
- RISK-08 provider unavailability breaking critical flows; the breaker and error taxonomy are the structural answer.
- Fixtures invented from imagination rather than recorded shapes would encode a fiction into every later test; `testing-strategy.md` §3 forbids it.

**References (by path)**
- `docs/architecture/provider-architecture.md` §1, §2, §5, §6, §9
- `docs/architecture/testing-strategy.md` class 4, §3
- `docs/architecture/adr/0011-provider-abstraction.md`
- `docs/architecture/fitness-functions.md` FF-02, FF-03, FF-08, FF-13

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | [N/A] | Ports are internal; webhook intake is P7.06. |
| DB | [N/A] | Provider job records belong to P11; cost entries to P6. |
| UI | [N/A] | Provider health screen is P15.18. |
| Env/Config | `PROVIDER_MODE`, per-provider limits, timeouts, breaker thresholds | FF-13: limits are configuration, never constants |
| Event | [N/A] | - |
| Build | Port interfaces and error taxonomy exported from `packages/providers` | Only sanctioned path to any external system |

---

## ADR / NFR Notes

- ADR-0011 fixes the port/adapter abstraction. Vendor-specific ADRs (0012, 0014, 0017) are consumed by later epics.
- NFR-13 CI never spends real provider credit - enforced here by FF-08 rather than by convention.
- GATE-HG01, GATE-HG04, GATE-EL01, GATE-TT02, GATE-MT02, GATE-COST01 are recorded on the affected fixtures; none blocks this epic.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| `provider-architecture.md` §1 | port interfaces | `P4.01` | AC-1..5 | typecheck + class 4 | - |
| `provider-architecture.md` §5 | error taxonomy | `P4.02` | AC-1..4 | class 4 | - |
| `provider-architecture.md` §5, §6 | retry/backoff/breaker | `P4.03` | AC-1..4 | class 4 + class 9 harness | - |
| `provider-architecture.md` §2 / ASM-HG01 | capability registry | `P4.04` | AC-1..4 | class 4 | - |
| `provider-architecture.md` §9 / `testing-strategy.md` §3 | mock adapters + fixtures | `P4.05` | AC-1..5 | class 4 | - |
| `provider-architecture.md` §9 | `PROVIDER_MODE` | `P4.06` | AC-1..3 | integration | - |
| FF-02, FF-03 | SDK and type isolation | `P4.07` | AC-1..4 | FF-02/FF-03 in CI | - |
| FF-13 | limits as configuration | `P4.08` | AC-1..3 | FF-13 in CI | - |
| FF-08 / NFR-13 | no billable call in CI | `P4.09` | AC-1..3 | FF-08 in CI | - |
| `testing-strategy.md` class 4 | adapter test harness | `P4.10` | AC-1..4 | class 4 suite | - |

**BDD example IDs**
- EX-P4-01 GIVEN a file under `domain/`, WHEN it imports a provider SDK, THEN FF-02 fails naming the file.
- EX-P4-02 GIVEN a provider returning a rate-limit response, WHEN the adapter maps it, THEN the domain sees the taxonomy's rate-limit class and never the vendor payload.
- EX-P4-03 GIVEN `PROVIDER_MODE` set to mock, WHEN the full suite runs, THEN no outbound call to a provider host occurs.
- EX-P4-04 GIVEN a look whose capability set excludes the requested engine, WHEN generation is prepared, THEN the registry refuses before submission.

**Open questions**
- OQ-P4-01 Whether provider balance polling belongs to the breaker or to the operations epic - resolved in P16.05; the port shape is fixed here.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 10/10 mapped; contracts 3/3 actionable entries mapped; examples 4/4 mapped to validations; unresolved gap codes: provisional-fixture (GATE-HG04, GATE-TT02, GATE-MT02, GATE-COST01), tracked and expected.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P4.01` | Provider port definitions | 8 | — | P0 |
| `P4.02` | Provider error taxonomy | 5 | `P4.01` | P0 |
| `P4.03` | Retry, backoff and circuit breaker | 5 | `P4.02` | P0 |
| `P4.04` | Capability registry | 5 | `P4.01` | P0 |
| `P4.05` | Mock adapters with success and failure fixtures | 8 | `P4.03`, `P4.04` | P0 |
| `P4.06` | PROVIDER_MODE switching | 3 | `P4.05` | P0 |
| `P4.07` | FF-02 and FF-03 provider isolation checks | 5 | `P4.01` | P0 |
| `P4.08` | FF-13 provider limits as configuration | 3 | `P4.03` | P1 |
| `P4.09` | FF-08 no billable provider call in CI | 3 | `P4.06` | P0 |
| `P4.10` | Adapter test harness (class 4) | 5 | `P4.05` | P0 |
| `P4.11` | Runtime credential resolver and FF-14 (Secrets Manager) | 5 | `P4.06` | P0 |

**Verification gate (epic exit)**: FF-02, FF-03, FF-08, FF-13 and **FF-14** pass; adapter tests (class 4) green; every port has a mock; no domain path can import a provider SDK; a seeded read of a credential-shaped environment key outside the resolver turns FF-14 red naming the file and the key.
