# EXCEPTION-DRIVEN PRODUCTION

**Status:** [DECISÃO APROVADA]

## Principle

O caminho normal é automático.

Humano não acompanha 100% das produções. O sistema envia ao Production Supervisor somente itens que exigem julgamento.

## Exception classes

- `IDENTITY_RISK`
- `CONSENT_BLOCK`
- `CONTENT_RISK`
- `LOW_QC_CONFIDENCE`
- `LIPSYNC_FAILURE`
- `VOICE_FAILURE`
- `CONTINUITY_FAILURE`
- `BUDGET_GUARD`
- `PROVIDER_EXHAUSTED`
- `PROVIDER_OUTAGE`
- `ASSEMBLY_FAILURE`
- `POLICY_VIOLATION`
- `PUBLICATION_FAILURE`

## Exception record

- severity;
- tenantId;
- productionId;
- shotId?;
- reasonCode;
- evidence;
- recommendedAction;
- retryCostEstimate?;
- SLA;
- status;
- assignedSupervisor?;
- resolution;
- audit timestamps.

## Supervisor workspace

A superfície interna deve priorizar:

- exceptions requiring attention;
- SLA risk;
- budget holds;
- identity risk;
- provider incidents;
- sampling audits.

Não deve exigir abrir todas as produções normais.
