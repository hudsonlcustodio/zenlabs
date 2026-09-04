# VYRA — Architecture Documentation Index

**Status: ARCHITECTURE COMPLETE — IMPLEMENTATION NOT STARTED**

Canonical source: `docs/product/VYRA_ARCH_PLAN_BRIEF.md` (§1–§54).
Precedence: brief > `VYRA_DECISOES_CANONICAS_MVP.md` > dossier > official
provider documentation > auxiliary docs. Divergences are recorded in
`prd.md` §14, never resolved silently.

## Artifacts

| Document | Covers (brief §) |
|---|---|
| [prd.md](prd.md) | executive vision, MVP scope, out-of-scope, personas, requirements, provider viability (§3,4,16–24,44,49) |
| [architecture.md](architecture.md) | system context, module architecture, tenancy, events, idempotency (§5,6,7,42) |
| [domain-model.md](domain-model.md) | entities, aggregates, invariants (§9,14,16,19,20,31) |
| [database-schema.md](database-schema.md) | data model, RLS, indexes, retention (§6,7,14,40) |
| [workflows-state-machines.md](workflows-state-machines.md) | content/twin/voice state machines, retries, scheduling (§17,18,23,36) |
| [provider-architecture.md](provider-architecture.md) | ports, capability registry, HeyGen, ElevenLabs, webhooks (§10,11,12,34,36,48) |
| [intelligence-engine.md](intelligence-engine.md) | context builder, model routing, prompts, validation (§13,15) |
| [knowledge-engine.md](knowledge-engine.md) | ingestion, chunking, embeddings, retrieval, controls (§14) |
| [social-publishing.md](social-publishing.md) | Meta, TikTok, tokens, disclosure (§22) |
| [performance.md](performance.md) | normalized snapshots, collection windows (§24) |
| [usage-ledger.md](usage-ledger.md) | plan consumption, the critical rule (§19) |
| [provider-cost-ledger.md](provider-cost-ledger.md) | VYRA cost, margin traceability (§20) |
| [api-contracts.md](api-contracts.md) | resources, authorization, errors, pagination (§41) |
| [security-architecture.md](security-architecture.md) | authn/authz, secrets, media, audit (§8,25,30,32,35) |
| [threat-model.md](threat-model.md) | all 24 threats with named mitigations (§33) |
| [aws-topology.md](aws-topology.md) | region, baseline topology, storage, queues (§25,26,27,29) |
| [scalability-gates.md](scalability-gates.md) | thresholds and promotion gates (§28) |
| [observability.md](observability.md) | logs, metrics, alarms, dashboards (§35) |
| [cicd.md](cicd.md) | pipeline, gates, image traceability (§39) |
| [testing-strategy.md](testing-strategy.md) | 14 test classes (§38) |
| [migrations.md](migrations.md) | versioning, expand/contract, pgvector (§40) |
| [fitness-functions.md](fitness-functions.md) | 31 automatable checks (§50) |
| [risks.md](risks.md) | risk register, external gates, pipeline notes (§33,49) |
| [assumptions.md](assumptions.md) | derived assumptions, explicitly not-assumed (§45,53) |
| [implementation-sequencing.md](implementation-sequencing.md) | 16 phases with acceptance gates (§45,51) |
| [adr/](adr/README.md) | 34 ADRs, one chosen option each (§47) |

## Reading order for implementers

1. `prd.md` — what and why
2. `architecture.md` — boundaries
3. `domain-model.md` + `database-schema.md` — invariants and storage
4. `workflows-state-machines.md` + `usage-ledger.md` — the rules that cost money
5. `security-architecture.md` + `threat-model.md` — non-negotiables
6. `implementation-sequencing.md` — order of work
7. `fitness-functions.md` — what CI will refuse

## Non-negotiable invariants

- No client-owned table without `tenant_id` + RLS.
- No domain code importing a provider SDK.
- No consumption outside the ledger; no commit without a completed generation;
  no commit reversed because ingestion failed; no re-render to recover an asset.
- No generation without active consent.
- No media on local disk; no public bucket.
- No secret in git; no billable provider call in CI.
- No state change outside the workflow engine.
- No tenant setting may skip VYRA QA (`HUMAN_REQUIRED` in MVP).
