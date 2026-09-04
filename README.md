# ZENLABS | Laboratório de Clones

**Repository:** `hudsonlcustodio/zenlabs`  
**Foundation:** V2  
**Status:** FOUNDATION / REPO-MIGRATION  
**Date:** 2026-09-01

ZENLABS é uma plataforma de operação audiovisual baseada em identidade digital persistente, Production Intelligence, orquestração multi-modelo e produção orientada a exceções.

## O que este repositório é

Este repositório é a **ZENLABS Foundation V2**, construída a partir de uma auditoria e migração controlada do snapshot `vyra-main-FERNANDO-2.zip`.

A base técnica reaproveitada inclui:

- monorepo pnpm;
- `apps/web`, `apps/api`, `worker-ai`, `worker-media`, `worker-social`;
- packages de contracts/config/observability/database/providers/security/ui;
- fitness functions;
- CI;
- typed config;
- OpenAPI generate-and-diff;
- boundaries de arquitetura;
- mock-first provider strategy.

A documentação anterior VYRA foi preservada em `docs/_legacy/vyra-p1/` e **não é autoridade canônica**.

## Arquitetura alvo

```text
Client / Internal Demand
        ↓
ProductionRequest
        ↓
AI Production Director
        ↓
ProductionPolicyEngine
        ↓
Production Pack + Scene Graph
        ↓
Cost Engine + Budget Guard
        ↓
Capacity Scheduler
        ↓
Media Router
        ↓
Provider Adapters / Workers
        ↓
Automatic QC
        ↓
Repair / Retry / Fallback
        ↓
Assembly
        ↓
Final QC Policy
        ↓
READY / Exception Queue
```

## Regra operacional

> Automatizar o caminho normal. Humanos governam políticas, risco, exceções e auditoria.

## Nome canônico

- Produto: **ZENLABS | Laboratório de Clones**
- Slug: `zenlabs`
- Namespace: `@zenlabs/*`

## Ordem de leitura

1. `START_HERE_WORK_DESKTOP.md`
2. `docs/00_GOVERNANCE/PROJECT_STATE.md`
3. `docs/00_GOVERNANCE/DECISIONS.md`
4. `docs/product/PRD_ZENLABS_V2.md`
5. `docs/product/ROLES_AUTHORITY_RACI.md`
6. `docs/architecture/architecture.md`
7. `docs/production/PRODUCTION_INTELLIGENCE.md`
8. `docs/production/EXCEPTION_DRIVEN_PRODUCTION.md`
9. `docs/architecture/domain-model.md`
10. `docs/architecture/workflows-state-machines.md`
11. `docs/backlog/EPICS.md`
12. `docs/backlog/WAVES.md`

## Gate atual

`GATE-FOUNDATION-V2`

A Foundation V2 não significa que o produto está production-ready. O próximo gate técnico exige instalação reproduzível, lint, typecheck, tests, build e fitness functions verdes.
