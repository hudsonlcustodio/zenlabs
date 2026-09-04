---
id: P5
title: "Governance and identity assets"
status: generated
depends_on: [P3, P4]
---

# Epic P5 — Governance and identity assets

- **Epic ID**: `P5`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 4
- **Status**: `generated`
- **Wave**: 4
- **Priority**: P0
- **Depends on**: `P3`, `P4`
- **Blocks**: `P8`, `P15`, `P16`
- **Story points (epic total)**: 51
- **Stories**: 9
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Make consent, identity ownership and revocation structural preconditions of generation, so that revocation blocks generation before the API returns success and every generation path is consent-guarded.

**Goals**
- G1 The consent aggregate with consent versioning, authorized scope, prohibited uses and validity.
- G2 The identity owner modelled distinctly from the portal user, even when they are the same human.
- G3 Digital identity as a composition of independently versioned elements.
- G4 Digital Twin and Voice Clone lifecycles per `workflows-state-machines.md` §3 and §4.
- G5 Revocation with propagation tracking to external providers.

**Non-goals**
- NG1 No generation; this epic only guards it (P11).
- NG2 No bypass of provider identity verification - forbidden by FR-ID06 and FF-12.
- NG3 No multiple Digital Twins per client (`prd.md` §12.2).

**Acceptance evidence**
- AE1 Revocation blocks generation before the API returns success.
- AE2 A generation path lacking a consent guard fails FF-30.
- AE3 No code path can mark a voice clone verified without the provider's own verification result (FF-12).

**Assumptions**
- ASM-P5-01 In MVP the identity owner and the portal user are normally the same human (ASM-P03); the model does not depend on that remaining true.

---

## Architecture Spec Summary

**Affected surfaces**: Modules `governance`, `digital-identity`, `digital-twin`, `voice-identity`, `client`; `tests/security/`.

**Integration points**: HeyGen (twin binding) and ElevenLabs (voice verification) through the P4 ports and mocks only.

**Risks**
- RISK-03 voice misuse or consent bypass on identity assets - Critical. `security-architecture.md` §11 is the mitigation and this epic implements it.
- Revocation reported complete before propagation is tracked would be a governance falsehood; module 21's invariant forbids it.

**References (by path)**
- `docs/architecture/domain-model.md` §2, §3, §4
- `docs/architecture/workflows-state-machines.md` §3, §4
- `docs/architecture/security-architecture.md` §11
- `docs/architecture/database-schema.md` §3.2
- `docs/architecture/prd.md` §8.9, §9.2
- `docs/architecture/adr/0024-audit-and-governance.md`
- `docs/architecture/fitness-functions.md` FF-12, FF-30

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | Consent grant/revoke, twin status, voice clone status; Studio twin and voice management | `api-contracts.md` §3.2, §4 |
| DB | `consent`, `identity_owner`, `digital_identity` + element versions, `digital_twin`, `voice_clone`, revocation propagation records | `database-schema.md` §3.2 |
| UI | [N/A] | Twin status and Studio screens are P15.11 and P15.13. |
| Env/Config | Revocation propagation retry budget | Configuration per FF-13 |
| Event | `TwinRevoked`, `VoiceRevoked`, `ConsentRevoked` | Consumed by T22; outbox delivery is P7 |
| Build | Consent guard primitive consumed by every generation path | Enforced by FF-30 |

---

## ADR / NFR Notes

- ADR-0024 governs audit and governance. FR-ID06 forbids designing any bypass of provider identity verification; FF-12 makes that mechanical.
- GATE-HG02 (API twin provisioning) and GATE-EL01 (PVC workspace requirements) are recorded; neither blocks this epic because P4 mocks stand in.
- Revocation is a governance guarantee, so its audit record is written in the same transaction as the state change.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| `domain-model.md` §3 / FR-ID02 | consent aggregate | `P5.01` | AC-1..5 | integration + class 13 | - |
| `prd.md` §3.1 / FR-ID02 | identity owner | `P5.02` | AC-1..3 | integration | - |
| `domain-model.md` §2 / FR-ID01 | identity element versioning | `P5.03` | AC-1..4 | integration | - |
| `workflows-state-machines.md` §3 | twin lifecycle | `P5.04` | AC-1..5 | class 5 subset | - |
| `workflows-state-machines.md` §4 / `prd.md` §9.2 | voice clone lifecycle | `P5.05` | AC-1..5 | class 5 subset + class 4 | - |
| FR-ID04, FR-ID05 | revocation + propagation | `P5.06` | AC-1..5 | integration + class 13 | - |
| FF-30 | consent guard | `P5.07` | AC-1..4 | FF-30 in CI | - |
| FF-12 / FR-ID06 | verification integrity | `P5.08` | AC-1..3 | FF-12 in CI | - |
| FR-ID03 / `security-architecture.md` §9 | governance audit | `P5.09` | AC-1..3 | FF-11 + integration | - |

**BDD example IDs**
- EX-P5-01 GIVEN consent revoked between script approval and render, WHEN the render is attempted, THEN the item moves to BLOCKED and no provider submission occurs.
- EX-P5-02 GIVEN a new generation entry point without a consent guard, WHEN CI runs, THEN FF-30 fails naming the path.
- EX-P5-03 GIVEN a voice clone whose provider verification has not returned success, WHEN code attempts to mark it ready, THEN the attempt fails.
- EX-P5-04 GIVEN a revocation whose provider propagation has not been confirmed, WHEN revocation status is read, THEN it reports propagation pending rather than complete.

**Open questions**
- OQ-P5-01 Whether PVC or IVC is the default for a given tenant is a commercial policy; both paths are modelled (`prd.md` §9.2).

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 9/9 mapped; contracts 5/5 actionable entries mapped; examples 4/4 mapped to validations; unresolved gap codes: none.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P5.01` | Consent aggregate with versioning and scope | 8 | — | P0 |
| `P5.02` | Identity owner distinct from portal user | 3 | `P5.01` | P0 |
| `P5.03` | Digital identity composition with element versioning | 5 | `P5.02` | P0 |
| `P5.04` | Digital Twin lifecycle | 8 | `P5.03`, `P4.04` | P0 |
| `P5.05` | Voice Clone lifecycle and verification state | 8 | `P5.03`, `P4.05` | P0 |
| `P5.06` | Revocation with propagation tracking | 8 | `P5.04`, `P5.05` | P0 |
| `P5.07` | FF-30 consent enforced before every generation | 5 | `P5.06` | P0 |
| `P5.08` | FF-12 no bypass of provider voice verification | 3 | `P5.05` | P0 |
| `P5.09` | Governance audit records | 3 | `P5.06`, `P3.08` | P0 |

**Verification gate (epic exit)**: FF-12 and FF-30 pass; governance tests green; revocation blocks generation before the API returns success; every generation path is consent-guarded.
