---
id: P21
title: "VYRA Portal experience"
status: generated
depends_on: [P14, P15, P20]
---

# Epic P21 — VYRA Portal experience

- **Epic ID**: `P21`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 14 (Surfaces), client-facing half
- **Status**: `generated`
- **Wave**: 11
- **Priority**: P0
- **Depends on**: `P14`, `P15`, `P20`
- **Blocks**: `P16`, `P24`
- **Story points (epic total)**: 79
- **Stories**: 11
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Make the Portal feel like a premium managed service rather than an administrative panel. `P15` renders the client-facing routes against server-enforced permissions; **this epic owns what the client actually experiences** — the hierarchy, the interactions, the media, the approvals, the onboarding and the four other screens every screen has.

The division is explicit and is asserted in both directions: `P15` owns route, authorization and data binding; `P21` owns experience, interaction and state coverage. Neither re-implements the other.

**Goals**
- G1 Every Portal screen blueprint in `VYRA_PRODUCT_EXPERIENCE.md` §31 realised, with its stated objective, primary action, hierarchy, regions, components and states.
- G2 The approval experience (§28) built as the most careful surface in the product, because it is the only mandatory client action and the moment usage becomes billable.
- G3 Onboarding and Digital Twin state (§30) as a first-class surface that never gives the client false agency over steps VYRA owns.
- G4 Pipeline and calendar interaction (§26, §27) where a drag is intent and the workflow engine decides (`FF-06`).
- G5 Media and video presentation (§24) with non-suppressible AI disclosure (`FF-15`) and signed-URL-only delivery.
- G6 Performance dashboards that read snapshots only and say how old they are (§29, `FF-16`, `FR-PF05`).
- G7 Complete loading, empty, error and denied coverage for every Portal screen (PD-09).

**Non-goals**
- NG1 No new API resource; `api-contracts.md` §3 is consumed as contracted (`epic-P15` NG4).
- NG2 No client-side authorization; every rule here is presentation (`FF-17`, `api-contracts.md` §2).
- NG3 No provider vocabulary anywhere in the Portal (PD-01): no prompt, model, queue, provider name, job id or retry count.
- NG4 No script editing in the Portal; the client approves or requests revision (§25.1, `FR-P04`).
- NG5 No re-implementation of `P15` route wiring, and no new primitive — everything composes `P18`, `P19` and `P20`.
- NG6 No self-serve plan upgrade; `ADR-0029` leaves payment an extension point and the UI states it as a deliberate absence, not as "coming soon".

**Acceptance evidence**
- AE1 Every Portal blueprint in §31 passes the 14-point conformance checklist of §34.
- AE2 A client can complete an approval end-to-end on a 320px viewport using only the keyboard.
- AE3 No Portal screen renders a provider name, model identifier, queue, job id or retry count — asserted by a vocabulary lint over the Portal route group.
- AE4 Opening the Portal performance screen records zero provider calls against the mock (`FF-16`, `EX-P15-04`).
- AE5 A revoked Digital Twin exposes no generation action anywhere in the Portal (`EX-P15-08`).
- AE6 Every Portal screen has an implemented loading, empty, error and denied state, enumerated by a coverage check against the blueprint list.

**Assumptions**
- ASM-P21-01 `VYRA_PRODUCT_EXPERIENCE.md` §31 is canonical for Portal screen composition, superseding the derived screen seeds of `prd.md` §7 (`ASM-IA01`) and `epic-P15`'s `ASM-P15-02`.
- ASM-P21-02 The Portal has exactly one user per tenant at MVP (`prd.md` §5.1), a policy limit rather than a schema limit. No screen assumes a second user and none forbids one.
- ASM-P21-03 The channel minimum-interval used for calendar conflict warnings is configuration per channel with a documented default (`OQ-PX-03`).

---

## Architecture Spec Summary

**Affected surfaces**: `apps/web` `(portal)` route group; no package gains a new export.

**Integration points**: Portal routes from `api-contracts.md` §3; media through CloudFront signed URLs issued by the API (`security-architecture.md` §6). No surface calls a provider.

**Risks**
- The Portal is where the product's premium claim is either true or obviously false. A generic administrative appearance here invalidates ADR-0003's whole rationale; §34's checklist is the mechanical defence.
- Approval commits usage. A confusing approval surface produces either paralysis or accidental spend; §28.4's consequence statement and §28.5's idempotency are the controls.
- `RISK-18` (human QA as a throughput bottleneck) surfaces to the client as waiting. The Portal must always say who is acting and never leave an item silently in flight.
- `RISK-19` / `ADR-0034`: an ingestion failure leaves a committed generation with no asset. §21.3 requires the Portal to say the item is being recovered **and** that it will not be re-billed — silence here reads as a bug and generates support load.

**References (by path)**
- `docs/product/VYRA_PRODUCT_EXPERIENCE.md` §21, §24, §26, §27, §28, §29.2, §30, §31, §34
- `docs/architecture/prd.md` §5.1, FR-P01…FR-P11, NFR-03, NFR-14
- `docs/architecture/api-contracts.md` §1, §2, §3
- `docs/architecture/workflows-state-machines.md` §2.1, §2.2, §2.3
- `docs/architecture/security-architecture.md` §6
- `docs/architecture/fitness-functions.md` FF-06, FF-15, FF-16, FF-17, FF-30, FF-32, FF-33
- `docs/architecture/adr/0029-payment-provider-extension-point.md`
- `docs/architecture/adr/0034-ingestion-decoupled-from-billing.md`
- `docs/architecture/risks.md` RISK-18, RISK-19

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | `api-contracts.md` §3 consumed as contracted | No new resource. |
| DB | [N/A] | — |
| UI | Portal screen compositions per `VYRA_PRODUCT_EXPERIENCE.md` §31 | Built from `P18`/`P19`/`P20` primitives only. |
| Env/Config | Channel minimum interval, approval consequence thresholds, performance period defaults | Configuration. |
| Event | [N/A] | Screens emit no domain event. |
| Build | Portal vocabulary lint; Portal blueprint coverage check | Consumed by `P24.07`. |

---

## ADR / NFR Notes

- ADR-0003's premium-finish rationale is what this epic delivers; ADR-0035's toolkit is what makes it affordable.
- `FF-16`/`FR-PF05` shape `P21.08` entirely: no refresh control exists because no synchronous read path exists.
- `FF-30` and guard G-1 shape `P21.09` and `P21.10`: consent is re-checked immediately before provider submission, so the approval control must already be disabled when consent is inactive.
- `FF-32` and guard G-5 shape `P21.05`: an ingestion failure never offers a re-render, and the Portal says why.
- `ADR-0029` shapes `P21.10`: the payment extension point is deliberately unimplemented and the UI must not promise it.
- `NFR-14` is why AE2 is an epic-level gate: approval on a phone by keyboard is the hardest accessibility path in the product.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| PX §31.0 / `prd.md` §5.1 | Portal chrome, density, IA | `P21.01` | AC-1..5 | vocabulary lint + IA test | - |
| PX §30, §31.2 / FR-P11 | onboarding activation | `P21.02` | AC-1..6 | step-state fixtures | - |
| PX §31.3 / FR-P01 | dashboard | `P21.03` | AC-1..6 | region boundary tests | - |
| PX §31.4 / FR-P02 / §3.1 | request composer | `P21.04` | AC-1..6 | guard-disabled fixtures | - |
| PX §26, §31.5, §31.6 / FR-P03 | pipeline and tracking | `P21.05` | AC-1..6 | lane + blocked-reason tests | RISK-19 surfaced |
| PX §24, §31.10 / FR-P07 / FF-15 | media and library | `P21.06` | AC-1..6 | signed-URL + disclosure | - |
| PX §27, §31.9 / FR-P06 / T17 | calendar and scheduling | `P21.07` | AC-1..6 | drag + keyboard + timezone | OQ-PX-03 |
| PX §29.2, §31.11 / FR-P08 / FF-16 | performance dashboards | `P21.08` | AC-1..6 | zero-provider-call assertion | - |
| PX §28, §31.7, §31.8 / FR-P04, FR-P05 | approval experience | `P21.09` | AC-1..8 | consequence + idempotency | - |
| PX §30.2, §30.3, §31.12…§31.15 / FR-P09…FR-P11 | plan, twin, consent | `P21.10` | AC-1..7 | revoked-twin assertion | - |
| PX §18, §19, §20 / PD-09 | Portal state coverage | `P21.11` | AC-1..5 | blueprint coverage check | - |

**BDD example IDs**
- EX-P21-01 GIVEN any Portal screen, WHEN the vocabulary lint runs, THEN no provider name, model identifier, queue, job id or retry count appears.
- EX-P21-02 GIVEN a 320px viewport and keyboard-only input, WHEN a client approves a script, THEN the approval completes end-to-end.
- EX-P21-03 GIVEN an item in `BLOCKED` with reason `ingestion_failed`, WHEN it renders, THEN the Portal states VYRA is recovering it and that it will not be re-billed.
- EX-P21-04 GIVEN consent is not active, WHEN the approval screen renders, THEN Approve is disabled with the consent reason and a link to consent.
- EX-P21-05 GIVEN the performance screen is opened, WHEN it renders, THEN zero provider calls are recorded against the mock.
- EX-P21-06 GIVEN a revoked Digital Twin, WHEN any Portal screen renders, THEN no generation action is exposed anywhere.
- EX-P21-07 GIVEN a double-submitted approval, WHEN the second request arrives, THEN it resolves to the same outcome and renders the resulting state, not an error.
- EX-P21-08 GIVEN a scheduled TikTok item under `GATE-TT01`, WHEN it renders on the calendar, THEN the `SELF_ONLY` restriction is stated before scheduling, not after publication.
- EX-P21-09 GIVEN every Portal blueprint, WHEN the coverage check runs, THEN each has an implemented loading, empty, error and denied state.

**Open questions**
- OQ-P21-01 `OQ-PX-03` — the per-channel minimum interval for conflict warnings is configuration with a documented default; the value is a product decision, the mechanism is not.
- OQ-P21-02 Whether the Portal command palette corpus grows beyond navigation and own content is deferred to post-MVP; `P20.03` AC-4 ships the reduced corpus.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 11/11 mapped; contracts 3/3 actionable entries mapped; examples 9/9 mapped to validations; unresolved gap codes: gate-dependent-provider-contract (GATE-TT01 surfaced in `P21.07`, stated not guessed).

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P21.01` | Portal chrome, density and information architecture | 5 | — | P0 |
| `P21.02` | Onboarding activation checklist experience | 8 | `P21.01` | P0 |
| `P21.03` | Portal dashboard: action rail, metrics, pipeline and consumption | 8 | `P21.01` | P0 |
| `P21.04` | Content request composer experience | 5 | `P21.03` | P0 |
| `P21.05` | Portal pipeline board and content tracking interactions | 8 | `P21.03` | P0 |
| `P21.06` | Portal media, library and video presentation | 8 | `P21.01` | P0 |
| `P21.07` | Portal editorial calendar and scheduling interactions | 8 | `P21.05` | P0 |
| `P21.08` | Portal performance dashboards from snapshots only | 8 | `P21.03` | P0 |
| `P21.09` | Approval experience: script and video decision surfaces | 8 | `P21.06` | P0 |
| `P21.10` | Plan, consumption, Digital Twin state and consent experience | 8 | `P21.02` | P0 |
| `P21.11` | Portal loading, empty, error and denied state coverage | 5 | `P21.04`, `P21.07`, `P21.08`, `P21.09`, `P21.10` | P0 |

**Verification gate (epic exit)**: every Portal blueprint in `VYRA_PRODUCT_EXPERIENCE.md` §31 passes the §34 checklist; the Portal vocabulary lint is green and turns red on a seeded provider name; an approval completes end-to-end at 320px by keyboard alone; the performance screen records zero provider calls against the mock; a revoked twin exposes no generation action anywhere in the Portal; a double-submitted approval resolves idempotently; an `ingestion_failed` item states recovery and non-re-billing; the blueprint coverage check shows loading, empty, error and denied implemented for every screen; the `P18.16` conformance harness is green across the Portal route group.
