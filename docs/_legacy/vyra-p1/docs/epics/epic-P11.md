---
id: P11
title: "Voice and video generation"
status: generated
depends_on: [P4, P6, P7, P8, P10]
---

# Epic P11 — Voice and video generation

- **Epic ID**: `P11`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 10
- **Status**: `generated`
- **Wave**: 6
- **Priority**: P0
- **Depends on**: `P4`, `P6`, `P7`, `P8`, `P10`
- **Blocks**: `P12`, `P15`, `P16`
- **Story points (epic total)**: 62
- **Stories**: 11
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Execute the voice-to-video pipeline through provider adapters, with the ingestion step separated from billing so that a retry polls rather than resubmits and an ingestion failure never causes a second render.

**Goals**
- G1 ElevenLabs synthesis and S3 ingestion of the produced audio.
- G2 HeyGen upload-asset handoff so the render is driven by our audio (`provider-architecture.md` §3.1).
- G3 Idempotent render submission with polling, plus webhook acceleration where available.
- G4 The `INGESTING` state with its retry budget and reconciler (ADR-0034).
- G5 Media assets with private storage and signed URL issuance.

**Non-goals**
- NG1 No live provider credentials; GATE-HG01 and GATE-EL01 remain open and mocks stand in.
- NG2 No bypass of provider identity verification (FR-ID06, FF-12).
- NG3 No live or realtime avatar (`prd.md` §12.2).

**Acceptance evidence**
- AE1 A retry polls the stored `providerJobId` instead of resubmitting.
- AE2 No media is written to local disk at any point (FF-21).
- AE3 An ingestion failure keeps the usage commit, preserves the provider reference and triggers no second render (FF-32).

**Assumptions**
- ASM-HG01 Avatar V capability is not universal; the P4.04 registry is consulted before every submission (`prd.md` §9.1).

---

## Architecture Spec Summary

**Affected surfaces**: Modules `render`, `media`, `voice-identity`; `apps/worker-media`; `tests/e2e/`.

**Integration points**: ElevenLabs and HeyGen through the P4 ports; S3 for media; inbound webhooks through P7.06.

**Risks**
- RISK-02 HeyGen Enterprise contract unsigned (GATE-HG01) - the epic completes against mocks and production is gated.
- RISK-04 double consumption - reachable if a retry resubmits; `provider-architecture.md` §6 and FF-28 prevent it.
- An ingestion failure treated as a generation failure would release a commit the provider already earned; ADR-0034 and FF-32 forbid it.

**References (by path)**
- `docs/architecture/provider-architecture.md` §3, §3.1, §3.2, §4, §6, §7
- `docs/architecture/workflows-state-machines.md` T08-T12, T11a-c
- `docs/architecture/usage-ledger.md` §4, §6
- `docs/architecture/adr/0013-voice-video-audio-handoff.md`
- `docs/architecture/adr/0034-ingestion-decoupled-from-billing.md`
- `docs/architecture/adr/0016-media-storage.md`
- `docs/architecture/security-architecture.md` §6
- `docs/architecture/fitness-functions.md` FF-21, FF-28, FF-32

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | Signed URL issuance for approved media; no public media route | `api-contracts.md` §3.4 |
| DB | `generation_attempt`, `media_asset`, provider job references, ingestion retry counters | `database-schema.md` §3.4 |
| UI | [N/A] | Library and Studio generation screens are P15.09 and P15.13. |
| Env/Config | Ingestion retry budget, polling interval, signed URL expiry, provider timeouts | FF-13 |
| Event | `VoiceGenerated`, `RenderRequested`, `RenderCompleted`, `MediaIngested`, `MediaIngestionFailed`, `UsageCommitted`, `ProviderCostRecorded` | Emitted by the P8 engine |
| Build | Media access exclusively through signed URLs | Enforced by FF-21 and `security-architecture.md` §6 |

---

## ADR / NFR Notes

- ADR-0013 fixes the voice-to-video audio handoff; `prd.md` §9.1 confirms HeyGen accepts `audio_url` or `audio_asset_id`, exactly one of the two.
- ADR-0034 separates ingestion from billing, which is why `INGESTING`, T11a, T11b and T11c exist and why FF-32 is testable.
- ADR-0016 fixes media storage; NFR-11 forbids media on host or container disk, enforced by FF-21.
- GATE-HG01, GATE-HG02, GATE-HG03, GATE-HG04 and GATE-EL01 are recorded; none blocks this epic, all block production launch of the affected capability.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| `provider-architecture.md` §4 / `prd.md` §9.2 | ElevenLabs adapter | `P11.01` | AC-1..5 | class 4 | - |
| ADR-0016 / NFR-11 | audio S3 ingestion | `P11.02` | AC-1..4 | integration + FF-21 | - |
| `provider-architecture.md` §3.1 / ADR-0013 | HeyGen asset handoff | `P11.03` | AC-1..4 | class 4 | - |
| `provider-architecture.md` §6 / FF-28 | idempotent submission | `P11.04` | AC-1..5 | class 10 | - |
| `provider-architecture.md` §7, §8 | polling + webhook reconciliation | `P11.05` | AC-1..4 | class 11 + integration | - |
| ADR-0034 / T11a-c | INGESTING + reconciler | `P11.06` | AC-1..6 | class 5 + integration | - |
| `security-architecture.md` §6 / ADR-0016 | media assets + signed URLs | `P11.07` | AC-1..4 | class 13 | - |
| `usage-ledger.md` §4 / T11 | commit exactly once | `P11.08` | AC-1..3 | class 10 | - |
| FF-21 / NFR-11 | no local media | `P11.09` | AC-1..3 | FF-21 in CI | - |
| FF-32 / FR-UC04a | no billable re-render | `P11.10` | AC-1..4 | FF-32 + class 10 | - |
| `testing-strategy.md` class 12 | end-to-end flow | `P11.11` | AC-1..4 | class 12 | - |

**BDD example IDs**
- EX-P11-01 GIVEN an attempt with a stored `providerJobId`, WHEN a retry occurs, THEN it polls the existing job and submits nothing.
- EX-P11-02 GIVEN a completed render whose asset copy fails until the budget is exhausted, WHEN T11b fires, THEN usage stays committed, the provider reference is preserved and no second render is submitted.
- EX-P11-03 GIVEN any generation path, WHEN media is handled, THEN nothing is written to local disk.
- EX-P11-04 GIVEN an operator retrying ingestion after T11b, WHEN T11c runs, THEN exactly one commit and one submission still exist.
- EX-P11-05 GIVEN an approved video, WHEN it is accessed, THEN access is by expiring signed URL rather than a public object.

**Open questions**
- OQ-P11-01 Whether HeyGen exposes webhooks with a verifiable signature is GATE-HG04; polling remains the primary path either way.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 11/11 mapped; contracts 5/5 actionable entries mapped; examples 5/5 mapped to validations; unresolved gap codes: gate-dependent-provider-contract (GATE-HG01..04, GATE-EL01), tracked and expected.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P11.01` | ElevenLabs synthesis adapter | 8 | — | P0 |
| `P11.02` | Audio ingestion to S3 | 5 | `P11.01` | P0 |
| `P11.03` | HeyGen upload-asset handoff | 5 | `P11.02`, `P4.04` | P0 |
| `P11.04` | Idempotent render submission | 8 | `P11.03` | P0 |
| `P11.05` | Polling and webhook reconciliation | 5 | `P11.04`, `P7.06` | P0 |
| `P11.06` | INGESTING state with retry budget and reconciler | 8 | `P11.05` | P0 |
| `P11.07` | Media assets and signed URL issuance | 5 | `P11.06` | P0 |
| `P11.08` | Usage commit exactly once per completed attempt | 5 | `P11.06`, `P6.03` | P0 |
| `P11.09` | FF-21 no media on the local filesystem | 3 | `P11.02` | P0 |
| `P11.10` | FF-32 an ingestion failure never causes a billable re-render | 5 | `P11.06`, `P11.08` | P0 |
| `P11.11` | End-to-end generation against mocks | 5 | `P11.07`, `P11.10` | P0 |

**Verification gate (epic exit)**: FF-21, FF-28 and FF-32 pass; end-to-end generation green against mocks including the forced-ingestion-failure path; a retry polls instead of resubmitting; no media on local disk; usage commits exactly once per completed attempt.
