---
id: P22
title: "VYRA Studio experience"
status: generated
depends_on: [P13, P15, P20]
---

# Epic P22 — VYRA Studio experience

- **Epic ID**: `P22`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 14 (Surfaces), internal-operations half
- **Status**: `generated`
- **Wave**: 11
- **Priority**: P0
- **Depends on**: `P13`, `P15`, `P20`
- **Blocks**: `P16`, `P24`
- **Story points (epic total)**: 76
- **Stories**: 11
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Give the internal operator a dense, keyboard-first workspace that makes a managed content operation possible at scale — script authoring, knowledge curation, queue control, QA, publishing and cross-tenant observation — without ever letting a screen become the place where a permission or a state transition is decided.

As with `P21`, the division is explicit: `P15` owns route, authorization and data binding for the Studio routes; `P22` owns the experience, the interaction depth and the state coverage.

**Goals**
- G1 Every Studio screen blueprint in `VYRA_PRODUCT_EXPERIENCE.md` §32 realised against its stated objective, hierarchy, regions, components and states.
- G2 A script workspace (§25) whose editor cannot express visual styling and whose inspector makes runtime, revision budget, brand compliance and knowledge provenance continuously visible.
- G3 A generation queue console (§32.10) that surfaces queue age against `NFR-07` and **never offers a retry that `FF-32` forbids**.
- G4 A QA workspace (§32.11) where an explicit human verdict is structurally required (`ADR-0033`, T13) and AI assistance is visibly a suggestion.
- G5 A publishing board (§32.13) that states gate-dependent restrictions before and after publication and blocks rather than guesses where a mechanism is unconfirmed (`FF-15`, `GATE-TT02`).
- G6 A persistent client scope that makes "which client am I in" impossible to lose, and an `Acting on behalf of` banner wherever `FR-S07` applies.
- G7 Complete loading, empty, error and denied coverage for every Studio screen, including the designed refusal below `md` (§22.1).

**Non-goals**
- NG1 No new API resource; `api-contracts.md` §4 is consumed as contracted.
- NG2 No client-side authorization (`FF-17`).
- NG3 No state transition performed outside the workflow engine; every operator action is a request (`FF-06`).
- NG4 No new primitive; everything composes `P18`, `P19` and `P20`.
- NG5 No mobile Studio. Below `md` the surface renders a designed refusal, which is a state and not a broken layout (§22.1).
- NG6 No QA automation that replaces the human verdict at MVP (`ADR-0033`, `FF-33`).

**Acceptance evidence**
- AE1 Every Studio blueprint in §32 passes the 14-point conformance checklist of §34.
- AE2 An operator can drive every Studio screen using only the keyboard, including the board, the calendar, the grid and the editor.
- AE3 No queue or job surface offers a control that would create a new billable render from an ingestion failure (`FF-32`, guard G-5).
- AE4 A QA verdict cannot be recorded without an explicit human decision, and AI-assisted pre-population is visibly a suggestion (`FF-33`).
- AE5 Every action taken on a tenant's behalf renders the `Acting on behalf of` banner and appears in that item's history (`FR-S07`).
- AE6 Below `md`, every Studio route renders the designed refusal with a link to the Portal, and it passes the conformance harness like any other screen.

**Assumptions**
- ASM-P22-01 `VYRA_PRODUCT_EXPERIENCE.md` §32 is canonical for Studio screen composition, superseding `prd.md` §7's derived seeds.
- ASM-P22-02 The tenant's words-per-minute for runtime estimation is configuration with a documented default (`OQ-PX-02`), never a constant.
- ASM-P22-03 Script editing is single-writer at MVP; concurrent editing is a take-over with an audit record rather than real-time collaboration.

---

## Architecture Spec Summary

**Affected surfaces**: `apps/web` `(studio)` route group.

**Integration points**: Studio routes from `api-contracts.md` §4; media through signed URLs; the retrieval trace from `knowledge-engine.md` §4. No surface calls a provider.

**Risks**
- A queue console is the most tempting place to build a "just retry it" button. `FF-32` and guard G-5 forbid exactly that for ingestion failures, and AE3 makes the absence verifiable.
- `RISK-18`: human QA becomes a throughput bottleneck. The QA workspace must make queue age visible so the bottleneck is measured rather than felt.
- `RISK-06` / `FF-27`: prompt injection through client knowledge. The knowledge screens must make data-region isolation visible so an operator can see which tenant a source belongs to.
- Acting on behalf of a client without a visible marker is an audit failure waiting to happen; AE5 is the control.

**References (by path)**
- `docs/product/VYRA_PRODUCT_EXPERIENCE.md` §14, §25, §26, §27, §32, §34
- `docs/architecture/prd.md` §5.2, FR-S01…FR-S09, NFR-07, NFR-14
- `docs/architecture/api-contracts.md` §4
- `docs/architecture/knowledge-engine.md` §4
- `docs/architecture/workflows-state-machines.md` §2.2, §2.3, §5
- `docs/architecture/adr/0033-qa-policy.md`
- `docs/architecture/adr/0034-ingestion-decoupled-from-billing.md`
- `docs/architecture/fitness-functions.md` FF-06, FF-12, FF-15, FF-27, FF-32, FF-33
- `docs/architecture/risks.md` RISK-06, RISK-18, GATE-TT01, GATE-TT02, GATE-MT01, GATE-MT02

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | `api-contracts.md` §4 consumed as contracted | No new resource. |
| DB | [N/A] | — |
| UI | Studio screen compositions per `VYRA_PRODUCT_EXPERIENCE.md` §32 | Built from `P18`/`P19`/`P20` primitives only. |
| Env/Config | Words-per-minute default, queue-age warning thresholds, client-scope persistence | Configuration. |
| Event | [N/A] | — |
| Build | Studio blueprint coverage check; the no-rerender-control assertion | Consumed by `P24.07`. |

---

## ADR / NFR Notes

- `ADR-0033` fixes `HUMAN_REQUIRED` QA at MVP with `AI_ASSISTED` pre-population as the modelled relief path; `P22.06` renders exactly that distinction.
- `ADR-0034` and `FF-32` fix the no-auto-rerender guarantee; `P22.05` renders an ingestion failure as recoverable **by ingestion only**.
- `FF-12` fixes that no mechanism bypasses provider voice verification; `P22.09` therefore offers no override and states why.
- `NFR-07` (oldest message age > 60s sustained) is a review trigger; `P22.05` surfaces it per queue.
- `NFR-14` applies in full to Studio at `lg` and above; below `md` the commitment is a designed refusal, itself conformance-tested.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| PX §32.0 / `prd.md` §5.2 | Studio chrome, client scope, density | `P22.01` | AC-1..6 | scope + refusal tests | - |
| PX §25, §32.5 / FR-S02 | script workspace | `P22.02` | AC-1..7 | editor + autosave tests | OQ-PX-02 |
| PX §25.4, §32.5 / T07 | versions, diff, revision budget | `P22.03` | AC-1..6 | diff + budget fixtures | - |
| PX §32.6, §32.7 / FR-S03 / FF-27 | knowledge workspace and trace | `P22.04` | AC-1..6 | isolation + trace tests | RISK-06 |
| PX §32.10 / FR-S05 / FF-32 | generation queue console | `P22.05` | AC-1..7 | no-rerender assertion | - |
| PX §32.11 / FR-S06 / ADR-0033 | QA workspace | `P22.06` | AC-1..7 | human-verdict assertion | RISK-18 |
| PX §32.13 / FR-S08 / FF-15 | publishing board | `P22.07` | AC-1..7 | gate-state fixtures | GATE-TT01/TT02/MT01/MT02 |
| PX §27, §32.12 / FR-S08 | cross-client calendar | `P22.08` | AC-1..5 | drag + keyboard tests | - |
| PX §32.2, §32.3, §32.4, §32.8, §32.9 / FR-S01, FR-S04, FR-S07 | clients, requests, identity assets | `P22.09` | AC-1..7 | acting-on-behalf audit | - |
| PX §32.14 / FR-S09 / FF-16 | cross-tenant performance | `P22.10` | AC-1..5 | zero-provider-call | - |
| PX §18, §19, §20, §22.1 | Studio state coverage and refusal | `P22.11` | AC-1..5 | blueprint coverage check | - |

**BDD example IDs**
- EX-P22-01 GIVEN an ingestion failure, WHEN the job drawer renders, THEN no control exists that would create a new billable render.
- EX-P22-02 GIVEN AI-assisted QA pre-population, WHEN the verdict bar renders, THEN the suggestion is visibly a suggestion and a human verdict is still required.
- EX-P22-03 GIVEN an operator acts on a tenant's behalf, WHEN the action completes, THEN the banner was present and the action appears in the item history.
- EX-P22-04 GIVEN a TikTok item whose AIGC disclosure mechanism is unconfirmed, WHEN publication is attempted, THEN it is blocked with the reason stated rather than guessed.
- EX-P22-05 GIVEN a knowledge source, WHEN it renders, THEN its owning tenant is visible and no cross-tenant source appears in the list.
- EX-P22-06 GIVEN a script open in another operator's session, WHEN it is opened, THEN it renders read-only with the holder's name and an audited take-over.
- EX-P22-07 GIVEN a queue whose oldest message exceeds the NFR-07 threshold, WHEN the console renders, THEN the queue tile shows the age and its severity.
- EX-P22-08 GIVEN Studio at 375px, WHEN any route renders, THEN the designed refusal appears and passes the conformance harness.

**Open questions**
- OQ-P22-01 `OQ-PX-02` — the words-per-minute default for runtime estimation is a product decision recorded in configuration; the mechanism is fixed here.
- OQ-P22-02 Whether `AI_ASSISTED` QA pre-population ships at MVP or is deferred is an `ADR-0033` scope decision; `P22.06` builds the surface so that either answer is a configuration change, and the human verdict is required in both.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories. The
knowledge screens render tenant-owned content; no vendor corpus is embedded in
the repository.

**Trace coverage**: requirements 11/11 mapped; contracts 3/3 actionable entries mapped; examples 8/8 mapped to validations; unresolved gap codes: gate-dependent-provider-contract (GATE-TT01, GATE-TT02, GATE-MT01, GATE-MT02 — surfaced and stated, never guessed).

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P22.01` | Studio chrome, client scope and dense density | 5 | — | P0 |
| `P22.02` | Script workspace over the editor primitive | 8 | `P22.01` | P0 |
| `P22.03` | Version rail, diff and revision-budget experience | 8 | `P22.02` | P0 |
| `P22.04` | Knowledge workspace and retrieval-trace experience | 8 | `P22.01` | P0 |
| `P22.05` | Generation queue console | 8 | `P22.01` | P0 |
| `P22.06` | QA workspace with annotation and explicit human verdict | 8 | `P22.05` | P0 |
| `P22.07` | Publishing board and connection health | 8 | `P22.05` | P0 |
| `P22.08` | Cross-client editorial calendar interactions | 5 | `P22.07` | P0 |
| `P22.09` | Clients, requests and identity-asset experience | 8 | `P22.01` | P0 |
| `P22.10` | Cross-tenant performance experience | 5 | `P22.01` | P1 |
| `P22.11` | Studio state coverage and the sub-`md` designed refusal | 5 | `P22.03`, `P22.04`, `P22.06`, `P22.08`, `P22.09`, `P22.10` | P0 |

**Verification gate (epic exit)**: every Studio blueprint in §32 passes the §34 checklist; every screen is fully keyboard-drivable including board, calendar, grid and editor; no queue or job surface exposes a control that would create a billable render from an ingestion failure; a QA verdict cannot be recorded without an explicit human decision and AI assistance renders as a suggestion; every acting-on-behalf action shows the banner and appears in the item history; gate-dependent restrictions are stated and publication is blocked rather than guessed where a mechanism is unconfirmed; the sub-`md` refusal renders for every Studio route and passes the conformance harness; the `P18.16` harness is green across the Studio route group.
