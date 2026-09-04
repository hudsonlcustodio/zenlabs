# PRD — ZENLABS | Laboratório de Clones

**ID:** PRD-ZENLABS-002  
**Version:** 2.0  
**Status:** [PROPOSTA CANÔNICA PARA GATE]  
**Date:** 2026-09-01

## 1. Problema

Pessoas e empresas dependem de agenda, gravação e produção manual para transformar conhecimento e identidade em vídeo. Ferramentas de avatar isoladas resolvem apenas parte do problema e criam dependência de provider, pouca governança e economics difíceis de controlar.

## 2. Produto

ZENLABS mantém uma identidade digital persistente e transforma demandas em produções audiovisuais através de:

- Digital Twin / IdentityPack;
- VoiceProfile;
- conhecimento e regras;
- AI Production Director;
- Production Packs;
- Scene Graph;
- Media Router multi-modelo;
- Cost/Budget Engine;
- Automatic QC;
- Retry/Repair/Fallback;
- Assembly;
- Exception Queue;
- calendário/publicação/performance.

## 3. Objetivos

### OBJ-001
Reduzir dependência de gravação física.

### OBJ-002
Produzir vídeos curtos e long-form de 60 segundos até 60 minutos ou mais por composição.

### OBJ-003
Manter identidade/voz consistentes independentemente do provider.

### OBJ-004
Automatizar o caminho normal e concentrar humanos em exceções.

### OBJ-005
Operar centenas/milhares de clientes sem headcount crescer linearmente com jobs.

### OBJ-006
Conhecer custo por minuto final aprovado.

## 4. Não objetivos V1

- editor profissional generalista;
- foundation model próprio;
- autopilot irrestrito;
- microservices por domínio;
- multi-region active-active;
- marketplace público de providers;
- cliente operando ferramentas de render;
- aprovação técnica pelo cliente.

## 5. Atores

- Client / Knowledge Owner
- VYRA Human Production Supervisor
- ZENLABS AI Production Director
- ZENLABS Production System
- Admin/Finance/Security internos

## 6. Jornada principal

`Demanda → validação → análise → pack → plan → custo → policy/approval → produção → QC → repair → assembly → release → calendar/publish → performance`

## 7. Requisitos funcionais

### RF-001 Clients
Gerenciar clientes/tenants.

### RF-002 Digital Twin
Criar e governar Digital Twin.

### RF-003 IdentityPack
Manter assets originais, master references e canonical views versionados.

### RF-004 Consent
Registrar consentimento, escopo, revogação e evidência.

### RF-005 VoiceProfile
Manter samples, bindings, pronunciation e performance profile.

### RF-006 ProductionRequest
Receber objetivo, roteiro/material, audience, canal, deadline, quality preference.

### RF-007 Script Analysis
Gerar ProductionAnalysis estruturado.

### RF-008 Production Pack
Recomendar recipe versionada.

### RF-009 Scene Graph
Transformar roteiro em Chapter → Scene → Shot.

### RF-010 Cost Estimate
Calcular faixa antes de produção.

### RF-011 ProductionPolicy
Autoaprovar ou exigir humano conforme risco/cliente/pack/custo.

### RF-012 Budget Guard
Impedir gasto além de limites.

### RF-013 Media Routing
Selecionar execution route sem expor provider no domínio.

### RF-014 Async Jobs
Submeter, reconciliar, retry, fallback e cancelar com idempotência.

### RF-015 Automatic QC
Avaliar integridade técnica e critérios probabilísticos.

### RF-016 Repair
Corrigir lip-sync/shot/asset sem rerender desnecessário.

### RF-017 Exception Queue
Escalar somente exceções relevantes.

### RF-018 Assembly
Compor voice, avatar, b-roll, slide, graphics, captions, music/SFX.

### RF-019 Final QC Policy
Suportar ALWAYS_HUMAN, EXCEPTION_ONLY, SAMPLE e AUTO_RELEASE.

### RF-020 Long-form
Suportar produções de 15–60 min por segmentação e assembly.

### RF-021 Calendar
Planejar entrega/publicação.

### RF-022 Publishing
Publicar quando canal/autorização/policy permitirem, com fallback operacional.

### RF-023 Performance
Coletar métricas disponíveis.

### RF-024 FinOps
Registrar provider costs e client usage separadamente.

### RF-025 Audit
Auditar decisões, approvals, overrides, jobs e policy changes.

### RF-026 Kill Switch
Suspender identidade e impedir novas gerações.

### RF-027 Production Pods
Atribuir carteira a Production Supervisor sem exigir toque por produção.

### RF-028 Capacity Scheduler
Priorizar jobs por deadline, SLA, capacity, budget e provider health.

## 8. RNFs

- Tenant isolation desde o schema.
- Deny-by-default.
- MFA para papéis internos sensíveis.
- Private object storage.
- Idempotência em todo efeito externo.
- No provider URL as canonical storage.
- Structured logging/correlation.
- OpenTelemetry quando infraestrutura estiver conectada.
- WCAG 2.2 AA.
- Backpressure.
- Bounded retries.
- Audit append-only para fatos críticos.
- Cost attribution por tenant/production/job.
- Recovery/reconciliation de jobs longos.
- Sem LLM como fonte de billing/authorization/state truth.

## 9. Métricas

- Straight-Through Production Rate.
- Exception Rate.
- Human Touch Rate.
- Human Minutes per Final Hour.
- Cost per Approved Minute.
- First-Pass Acceptance.
- Auto-Repair Rate.
- Queue Age.
- Production Lead Time.
- Provider success/latency/cost.
- Final approved minutes.

## 10. Commercial accounting

Minutos comerciais representam capacidade final entregue/aprovada conforme contrato.

Tentativas, retries e falhas são provider cost/operational cost e não consumo comercial automático.

## 11. Scale target

500–1.000 clientes é alvo de design, não fato de workload.

A arquitetura deve permitir:
- asynchronous workers;
- horizontal consumer scale;
- provider routing;
- exception-driven human work;
- pod ownership;
- measurable promotion gates.

## 12. Critério de MVP técnico

Um tenant real consegue completar com providers mockados:

`Client → Consent → Twin → IdentityPack → Policy → Request → Plan → Cost → Approval → Audit`

e depois um pilot media completa a pipeline até `READY`.
