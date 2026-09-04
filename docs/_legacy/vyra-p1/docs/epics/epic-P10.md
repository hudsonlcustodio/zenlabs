---
id: P10
title: "Intelligence engine"
status: generated
depends_on: [P4, P6, P9]
---

# Epic P10 — Intelligence engine

- **Epic ID**: `P10`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 9
- **Status**: `generated`
- **Wave**: 5
- **Priority**: P0
- **Depends on**: `P4`, `P6`, `P9`
- **Blocks**: `P11`, `P15`, `P16`, `P23`
- **Story points (epic total)**: 52
- **Stories**: 9
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Produce briefings, scripts, captions and compliance verdicts without the domain ever learning a model name, and without retrieved client text ever reaching the instruction region of a prompt.

**Goals**
- G1 A context builder with an explicit trust boundary (`intelligence-engine.md` §4, §4.1).
- G2 Versioned prompt templates, with every generated script traceable to the version that produced it.
- G3 A model router resolving per task, tenant or quality profile, cost, availability, fallback and environment.
- G4 An output validator gating what the workflow engine is allowed to present.
- G5 Token cost recorded into the provider cost ledger per generation.

**Non-goals**
- NG1 No model identifier fixed in code or in this backlog; identifiers are configuration (FR-IN04, FF-09).
- NG2 No voice or video generation; that is P11.
- NG3 No automated QA verdict; MVP QA is `HUMAN_REQUIRED` (ADR-0033).

**Acceptance evidence**
- AE1 A model identifier appearing outside configuration fails FF-09.
- AE2 Retrieved client text never appears in the instruction region of a prompt (FF-27).
- AE3 Every generated script names the prompt version and context that produced it.

**Assumptions**
- ASM-P10-01 `prd.md` §9.5 names a default high-volume option and a higher-quality alternative as commercial guidance; no identifier is recorded as an architectural constant.

---

## Architecture Spec Summary

**Affected surfaces**: Module `intelligence`, `apps/worker-ai`, `tests/security/`.

**Integration points**: LLM providers through the P4 ports and mocks; knowledge retrieval through P9.05.

**Risks**
- RISK-06 prompt injection via client knowledge sources - High. §4.1's trust boundary and FF-27 are the mitigation.
- A model identifier leaking into the domain would make routing decorative; FF-09 prevents it.
- An unvalidated output reaching T04 would present a broken script as a real one; the validator is a T04 precondition.

**References (by path)**
- `docs/architecture/intelligence-engine.md` §1-§7
- `docs/architecture/prd.md` §8.8, §9.5
- `docs/architecture/adr/0015-ai-model-routing.md`
- `docs/architecture/workflows-state-machines.md` T02, T03, T04, T05
- `docs/architecture/fitness-functions.md` FF-09, FF-27

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | [N/A] | Generation is triggered by workflow events, not by a public route. |
| DB | Prompt template versions, generation provenance, retrieval trace links | `database-schema.md` §3.4 |
| UI | [N/A] | Script review is P15.06. |
| Env/Config | Model identifiers, routing policy, quality profiles, cost ceilings, task-to-model mapping | FF-09 and FF-13 |
| Event | `BriefingGenerated`, `ScriptGenerated` emitted by the engine transitions | Consumed from P8.10 |
| Build | Context builder as the sole prompt assembly path | Enforced by FF-27 |

---

## ADR / NFR Notes

- ADR-0015 fixes model routing. FR-IN04 keeps identifiers in configuration; FF-09 enforces it.
- FR-IN06 separates development-time tooling credentials from runtime product credentials; no development key may be reachable at runtime.
- FR-IN05 requires prompt-version traceability, which is what makes an off-brand output diagnosable.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| `intelligence-engine.md` §4, §4.1 | context builder + trust boundary | `P10.01` | AC-1..5 | class 13 + FF-27 | - |
| `intelligence-engine.md` §5 / FR-IN05 | prompt versioning | `P10.02` | AC-1..4 | integration | - |
| `intelligence-engine.md` §3 / ADR-0015 | model router | `P10.03` | AC-1..5 | integration + class 4 | - |
| `intelligence-engine.md` §6 | output validator | `P10.04` | AC-1..4 | integration + class 5 | - |
| `intelligence-engine.md` §2 / FR-IN03 | task taxonomy | `P10.05` | AC-1..4 | integration | - |
| `prd.md` FR-AP03 / §2 | brand compliance task | `P10.06` | AC-1..4 | class 5 | - |
| `intelligence-engine.md` §7 / FR-PC02 | token cost recording | `P10.07` | AC-1..3 | integration | - |
| FF-09 / FR-IN04 | model identifier isolation | `P10.08` | AC-1..3 | FF-09 in CI | - |
| FF-27 / RISK-06 | injection containment | `P10.09` | AC-1..4 | class 13 + FF-27 | - |

**BDD example IDs**
- EX-P10-01 GIVEN a knowledge chunk containing instruction-shaped text, WHEN a prompt is assembled, THEN that text appears only in the data region and never as an instruction.
- EX-P10-02 GIVEN a model identifier written into a domain file, WHEN CI runs, THEN FF-09 fails naming the file.
- EX-P10-03 GIVEN the primary model unavailable, WHEN routing resolves, THEN the declared fallback is used and the choice is recorded.
- EX-P10-04 GIVEN a generated script, WHEN its provenance is read, THEN the prompt version, model choice and retrieval trace are all identifiable.
- EX-P10-05 GIVEN an output failing validation, WHEN T04 is evaluated, THEN the script is not presented for review.

**Open questions**
- OQ-03 Numeric targets for success metrics remain a commercial decision and do not block routing policy.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 9/9 mapped; contracts 4/4 actionable entries mapped; examples 5/5 mapped to validations; unresolved gap codes: none.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P10.01` | Context builder with trust boundary | 8 | — | P0 |
| `P10.02` | Prompt template versioning | 5 | `P10.01` | P0 |
| `P10.03` | Model router and policies | 8 | `P10.02`, `P4.03` | P0 |
| `P10.04` | Output validator | 5 | `P10.03` | P0 |
| `P10.05` | Task taxonomy implementations | 8 | `P10.04`, `P9.05` | P0 |
| `P10.06` | Brand compliance task | 5 | `P10.05` | P0 |
| `P10.07` | Token cost recording | 5 | `P10.03`, `P6.04` | P0 |
| `P10.08` | FF-09 no model identifier outside configuration | 3 | `P10.03` | P0 |
| `P10.09` | FF-27 prompt injection containment | 5 | `P10.01` | P0 |

**Verification gate (epic exit)**: FF-09 and FF-27 pass; injection containment verified; no model id outside configuration; retrieved text never reaches the instruction region.
