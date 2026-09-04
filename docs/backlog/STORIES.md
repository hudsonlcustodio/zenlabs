# USER STORIES — ZENLABS V2

## EPIC-Z01
### STORY-Z001 — Seed blank target repo with migrated scaffold
**Acceptance:** A nova repo recebe scaffold renomeado, legacy archive e Foundation V2.

### STORY-Z002 — Enforce documentation precedence
**Acceptance:** Agente/CI consegue distinguir canonical vs legacy.

### STORY-Z003 — Validate no runtime VYRA namespace
**Acceptance:** Nenhum código/config ativo usa @vyra ou branding antigo.

### STORY-Z004 — Record migration provenance
**Acceptance:** ZIP source hash e migration ledger ficam auditáveis.

## EPIC-Z02
### STORY-Z005 — Bootstrap secure sessions
**Acceptance:** Usuário autentica com sessão server-side revogável.

### STORY-Z006 — Enforce staff MFA
**Acceptance:** Papéis sensíveis exigem MFA.

### STORY-Z007 — Authorize every command
**Acceptance:** API aplica role/object authorization.

### STORY-Z008 — Revoke sessions
**Acceptance:** Admin consegue revogar sessão imediatamente.

## EPIC-Z03
### STORY-Z009 — Create tenant
**Acceptance:** Sistema cria tenant sem cross-tenant visibility.

### STORY-Z010 — Create client
**Acceptance:** Operação cria client dentro do tenant.

### STORY-Z011 — Enforce RLS context
**Acceptance:** Queries sem tenant context falham/isolam.

### STORY-Z012 — Assign Production Supervisor
**Acceptance:** Cliente pode ter owner operacional sem virar workflow dependency.

## EPIC-Z04
### STORY-Z013 — Record consent
**Acceptance:** Consentimento inclui owner, scope, evidence e timestamp.

### STORY-Z014 — Revoke consent
**Acceptance:** Revogação bloqueia novas gerações.

### STORY-Z015 — Kill switch Twin
**Acceptance:** Operação suspende Twin com audit.

### STORY-Z016 — Audit identity access
**Acceptance:** Acesso/uso crítico de identidade é rastreável.

## EPIC-Z05
### STORY-Z017 — Create Digital Twin DRAFT
**Acceptance:** Twin nasce sem provider binding obrigatório.

### STORY-Z018 — Create IdentityPack
**Acceptance:** Assets de referência têm provenance/version.

### STORY-Z019 — Calibrate IdentityPack
**Acceptance:** Pack recebe calibration evidence.

### STORY-Z020 — Activate Twin
**Acceptance:** Só ACTIVE + consent permite produção.

## EPIC-Z06
### STORY-Z021 — Upload voice samples
**Acceptance:** Samples privados vinculados a consent.

### STORY-Z022 — Define pronunciation dictionary
**Acceptance:** Nomes/termos têm pronúncia controlada.

### STORY-Z023 — Create VoiceProfile version
**Acceptance:** Performance profile é versionado.

### STORY-Z024 — Bind optional voice provider
**Acceptance:** Provider binding é substituível.

## EPIC-Z07
### STORY-Z025 — Ingest knowledge source
**Acceptance:** Source tem provenance/ACL.

### STORY-Z026 — Define brand profile
**Acceptance:** Tom/brand constraints ficam versionados.

### STORY-Z027 — Define content policy
**Acceptance:** Claims/topics sensíveis são governados.

### STORY-Z028 — Retrieve grounded context
**Acceptance:** AI recebe apenas sources autorizadas.

## EPIC-Z08
### STORY-Z029 — Create ProductionRequest
**Acceptance:** Objetivo/roteiro/audience/deadline persistidos.

### STORY-Z030 — Upload script/material
**Acceptance:** Arquivos são validados e armazenados privadamente.

### STORY-Z031 — Select quality preference
**Acceptance:** Menor custo/equilíbrio/máxima qualidade/recomendado.

### STORY-Z032 — Validate request readiness
**Acceptance:** Sistema indica gaps antes de análise.

## EPIC-Z09
### STORY-Z033 — Analyze script to schema
**Acceptance:** AI devolve ProductionAnalysis válido.

### STORY-Z034 — Recommend pack alternatives
**Acceptance:** IA apresenta eficiente/recomendado/premium quando aplicável.

### STORY-Z035 — Explain recommendation
**Acceptance:** Operador vê rationale sem provider internals.

### STORY-Z036 — Persist planning provenance
**Acceptance:** Model/template/source versions são registradas.

## EPIC-Z10
### STORY-Z037 — Create versioned pack
**Acceptance:** Recipe possui immutable version.

### STORY-Z038 — Enforce pack constraints
**Acceptance:** Scene plan fora de faixa é bloqueado/ajustado.

### STORY-Z039 — Compare pack estimates
**Acceptance:** Operador vê cost/quality/composition trade-off.

### STORY-Z040 — Measure pack outcomes
**Acceptance:** Acceptance/cost/exception rate por versão.

## EPIC-Z11
### STORY-Z041 — Create chapters from script
**Acceptance:** Long-form ganha capítulos coerentes.

### STORY-Z042 — Create scenes
**Acceptance:** Capítulo vira cenas.

### STORY-Z043 — Create shots
**Acceptance:** Cena vira unidades roteáveis.

### STORY-Z044 — Map script/audio ranges
**Acceptance:** Shot carrega ranges/timing estáveis.

## EPIC-Z12
### STORY-Z045 — Create ProductionPolicy
**Acceptance:** Cliente define allowed packs/budget/review.

### STORY-Z046 — Evaluate autoapproval
**Acceptance:** Sistema decide sem LLM.

### STORY-Z047 — Force risk review
**Acceptance:** Sensitive topic pode exigir humano.

### STORY-Z048 — Version policy
**Acceptance:** Toda decisão registra policy version.

## EPIC-Z13
### STORY-Z049 — Estimate production cost
**Acceptance:** Cost Engine usa rates/attempt assumptions.

### STORY-Z050 — Approve budget
**Acceptance:** Humano/policy autoriza limite.

### STORY-Z051 — Stop at hard limit
**Acceptance:** Execução entra BUDGET_HOLD.

### STORY-Z052 — Reconcile estimate vs actual
**Acceptance:** Variance fica mensurável.

## EPIC-Z14
### STORY-Z053 — Register provider capability
**Acceptance:** Capability tem model/version/duration/resolution.

### STORY-Z054 — Register rate card
**Acceptance:** Rate card tem effective dates/version.

### STORY-Z055 — Track provider health
**Acceptance:** Success/latency/limits alimentam router.

### STORY-Z056 — Expire stale capability
**Acceptance:** Snapshot velho não autoriza route silenciosamente.

## EPIC-Z15
### STORY-Z057 — Resolve eligible adapters
**Acceptance:** Hard constraints filtram providers.

### STORY-Z058 — Score eligible route
**Acceptance:** Sistema otimiza qualidade/custo/health.

### STORY-Z059 — Record routing decision
**Acceptance:** Decisão é auditável.

### STORY-Z060 — Reroute on outage
**Acceptance:** Eligible fallback assume sem quebrar policy.

## EPIC-Z16
### STORY-Z061 — Write transactional outbox
**Acceptance:** State + event commit atômico.

### STORY-Z062 — Consume idempotently
**Acceptance:** Duplicate delivery não duplica side effect.

### STORY-Z063 — Reconcile provider jobs
**Acceptance:** Crash não perde job pago.

### STORY-Z064 — DLQ terminal failures
**Acceptance:** Exaustão vira exception/alarm.

## EPIC-Z17
### STORY-Z065 — Run technical QC
**Acceptance:** Codec/duration/audio/file integrity checks.

### STORY-Z066 — Run AI quality eval
**Acceptance:** Identity/lipsync/naturalness dimensions.

### STORY-Z067 — Store QC evidence
**Acceptance:** Verdict possui version/evidence.

### STORY-Z068 — Route QC outcome
**Acceptance:** PASS/REPAIR/REGENERATE/HUMAN_REVIEW.

## EPIC-Z18
### STORY-Z069 — Auto-repair lip-sync
**Acceptance:** Repair evita rerender total quando possível.

### STORY-Z070 — Retry within budget
**Acceptance:** Attempts bounded.

### STORY-Z071 — Fallback provider
**Acceptance:** Fallback respeita constraints.

### STORY-Z072 — Escalate exhausted recovery
**Acceptance:** Exception contém evidence/recommended action.

## EPIC-Z19
### STORY-Z073 — Generate Voice Master
**Acceptance:** Long-form mantém prosody/timeline.

### STORY-Z074 — Render deterministic visuals
**Acceptance:** Slides/charts não usam generative video por padrão.

### STORY-Z075 — Assemble timeline
**Acceptance:** Assets viram final deterministicamente.

### STORY-Z076 — Validate final artifact
**Acceptance:** Final technical QC antes de release.

## EPIC-Z20
### STORY-Z077 — Create exception
**Acceptance:** System cria reason/severity/evidence.

### STORY-Z078 — Prioritize exception queue
**Acceptance:** SLA/risk ordenam atenção.

### STORY-Z079 — Resolve with action
**Acceptance:** Supervisor registra decisão.

### STORY-Z080 — Audit override
**Acceptance:** Waive/override exige razão e role.

## EPIC-Z21
### STORY-Z081 — Assign pod portfolio
**Acceptance:** Supervisor vê carteira.

### STORY-Z082 — Measure OLU inputs
**Acceptance:** Volume/complexity/exception data coletados.

### STORY-Z083 — Schedule capacity
**Acceptance:** Jobs priorizados por deadline/capacity.

### STORY-Z084 — Apply backpressure
**Acceptance:** Sistema reduz submissão em saturation.

## EPIC-Z22
### STORY-Z085 — Create schedule
**Acceptance:** READY pode ser agendado.

### STORY-Z086 — Authorize channel
**Acceptance:** Publishing verifica connection/policy.

### STORY-Z087 — Publish idempotently
**Acceptance:** Duplicate execution não duplica post.

### STORY-Z088 — Manual fallback
**Acceptance:** Canal não suportado permite operação rastreada.

## EPIC-Z23
### STORY-Z089 — Collect platform metrics
**Acceptance:** Métricas disponíveis entram normalizadas.

### STORY-Z090 — Attribute to content
**Acceptance:** Performance liga ao production/content.

### STORY-Z091 — Compare pack performance
**Acceptance:** Aprendizado por recipe/version.

### STORY-Z092 — Recommend improvement
**Acceptance:** IA sugere; humano/policy decide promoção.

## EPIC-Z24
### STORY-Z093 — Reserve client capacity
**Acceptance:** Entitlement reservation é auditável.

### STORY-Z094 — Commit delivered usage
**Acceptance:** Minutos finais/contratados seguem commercial policy.

### STORY-Z095 — Record provider cost
**Acceptance:** Cada job billable alimenta COGS.

### STORY-Z096 — Compute cost per approved minute
**Acceptance:** FinOps obtém unit economics.

## EPIC-Z25
### STORY-Z097 — Correlate requests/jobs
**Acceptance:** Correlation atravessa API/outbox/workers.

### STORY-Z098 — Alert queue age
**Acceptance:** SLA risk é visível.

### STORY-Z099 — Detect provider incident
**Acceptance:** Health/circuit state é observável.

### STORY-Z100 — Restore critical state
**Acceptance:** Backup/restore drill produz evidência.

## EPIC-Z26
### STORY-Z101 — Scan committed secrets
**Acceptance:** CI bloqueia secret.

### STORY-Z102 — Restrict media access
**Acceptance:** Private objects + signed access.

### STORY-Z103 — Test tenant escape
**Acceptance:** Security test tenta IDOR/cross-tenant.

### STORY-Z104 — Track retention/deletion
**Acceptance:** Identity assets obedecem lifecycle.

## EPIC-Z27
### STORY-Z105 — Implement ZENLABS tokens
**Acceptance:** UI usa design contract.

### STORY-Z106 — Build application shell
**Acceptance:** Internal nav e permission states.

### STORY-Z107 — Build Production New flow
**Acceptance:** Objetivo/Twin/script/quality.

### STORY-Z108 — Build Exception workspace
**Acceptance:** Supervisor trabalha attention queue.

## EPIC-Z28
### STORY-Z109 — Run foundation validator
**Acceptance:** Canonical files/branding checked.

### STORY-Z110 — Run architecture fitness
**Acceptance:** Forbidden dependency fails CI.

### STORY-Z111 — Run contract drift check
**Acceptance:** OpenAPI mismatch fails.

### STORY-Z112 — Gate production deploy
**Acceptance:** Deploy requires evidence/rollback.
