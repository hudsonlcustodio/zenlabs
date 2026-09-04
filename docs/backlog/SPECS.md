# SPECS — ZENLABS V2

## SPEC-Z001 — Canonical identity
DigitalTwin and IdentityPack IDs remain stable across provider replacement.

## SPEC-Z002 — Tenant isolation
All client-owned records and jobs carry tenant scope.

## SPEC-Z003 — Consent guard
Every identity-bearing external call validates active consent.

## SPEC-Z004 — Production request
Request captures objective, material/script, audience, deadline and quality preference.

## SPEC-Z005 — Schema-bound AI
AI analysis/plans must validate against machine-readable schema.

## SPEC-Z006 — Pack versioning
Every production stores productionPackId + version.

## SPEC-Z007 — Scene hierarchy
Production contains Chapters, Scenes and Shots.

## SPEC-Z008 — Provider isolation
Shot never uses providerJobId as creative identity.

## SPEC-Z009 — Routing class
Every generated shot declares a routingClass.

## SPEC-Z010 — Capability registry
Router only selects currently eligible capabilities.

## SPEC-Z011 — Rate card version
Every estimate/job cost references a rate card version.

## SPEC-Z012 — Budget
Every billable provider call belongs to an authorized budget.

## SPEC-Z013 — Hard stop
AI cannot exceed ProductionBudget.hardLimit.

## SPEC-Z014 — Idempotency
Provider submission is idempotent/reconciled before resubmission.

## SPEC-Z015 — Bounded retry
Automatic retries are limited by attempts and budget.

## SPEC-Z016 — Fallback
Fallback cannot violate quality floor, tenant policy or budget.

## SPEC-Z017 — Canonical storage
Provider URL is never final storage.

## SPEC-Z018 — QC result
QC produces PASS, REPAIR, REGENERATE or HUMAN_REVIEW.

## SPEC-Z019 — QC evidence
QC stores dimensions, evidence, model/check versions and timestamps.

## SPEC-Z020 — Human review policy
Support ALWAYS_HUMAN, EXCEPTION_ONLY, SAMPLE, AUTO_RELEASE.

## SPEC-Z021 — Exception reason
Every human escalation has reasonCode and severity.

## SPEC-Z022 — Exception SLA
Exception queue supports due/SLA priority.

## SPEC-Z023 — Client portal isolation
Client never sees provider credentials/internal routing.

## SPEC-Z024 — Usage ledger
Commercial usage is append-only and distinct from provider cost.

## SPEC-Z025 — Provider cost ledger
Every billable provider outcome can be attributed to tenant/production/job.

## SPEC-Z026 — Long-form voice
Prefer continuous Voice Master/timeline before video segmentation when supported.

## SPEC-Z027 — Deterministic visuals
Use charts/slides/graphics deterministically when they communicate better than generative video.

## SPEC-Z028 — Capacity scheduling
Prioritize by deadline/SLA/capacity/health/budget.

## SPEC-Z029 — Backpressure
Provider saturation must not cause unbounded submissions.

## SPEC-Z030 — Circuit breaker
Repeated provider unavailability can temporarily disable route.

## SPEC-Z031 — Sampling
SAMPLE policy produces auditable selection, not ad-hoc human review.

## SPEC-Z032 — Auto-release
Requires explicit policy + quality conditions.

## SPEC-Z033 — Kill switch
Twin suspension/revocation prevents new jobs immediately.

## SPEC-Z034 — Audit
Policy changes, overrides and release decisions are auditable.

## SPEC-Z035 — AI authority
AI cannot grant role/permission, commit billing or override consent.

## SPEC-Z036 — Mock mode
CI/provider tests default to deterministic mocks.

## SPEC-Z037 — Contract drift
OpenAPI/contracts drift fails CI.

## SPEC-Z038 — Architecture drift
Forbidden dependency/provider imports fail fitness/lint.

## SPEC-Z039 — Scale KPI
STP, Exception Rate, Human Touch, Human Minutes/Final Hour and Cost/Approved Minute are measurable.

## SPEC-Z040 — Pod ratio
Supervisor:client ratio is operational config/forecast, not application invariant.

## SPEC-Z041 — Provider health
Routing decision records health/capability snapshot used.

## SPEC-Z042 — Production provenance
Production plan records AI/template/model version and source refs.

## SPEC-Z043 — Content risk
Sensitive/high-risk content can force HUMAN_REVIEW independent of media QC.

## SPEC-Z044 — No automatic downgrade
Unsupported premium route blocks/reroutes only inside approved quality constraints.

## SPEC-Z045 — Asset provenance
Identity/motion/reference assets store ownership/provenance metadata.

## SPEC-Z046 — Retention
Deletion/retention can be executed by asset class and tenant.

## SPEC-Z047 — Financial variance
Estimate vs actual cost measurable by production/pack/provider.

## SPEC-Z048 — Provider contracts
Adapters map provider-specific errors to a stable internal taxonomy.
