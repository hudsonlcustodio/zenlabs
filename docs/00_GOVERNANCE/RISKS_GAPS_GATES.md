# RISKS, GAPS & GATES

## RSK-001 — Synthetic identity misuse
Mitigações: consent, authorization, kill switch, audit, tenant isolation, policy engine.

## RSK-002 — Provider drift
Mitigações: capability registry, adapters, rate cards versionados, contract tests.

## RSK-003 — Cost runaway
Mitigações: ProductionBudget, hard limit, retry budget, premium budget, no unbounded retry.

## RSK-004 — Quality drift at scale
Mitigações: automatic QC, sampling, calibration, golden sets, exception queue, pack version metrics.

## RSK-005 — Human bottleneck
Mitigações: STP Rate, Human Touch Rate, exception-only flows, pods e capacity planning.

## RSK-006 — Queue/provider saturation
Mitigações: backpressure, capacity scheduler, circuit breakers, provider health routing.

## RSK-007 — Long-form inconsistencies
Mitigações: Voice Master, scene graph, canonical identity assets, chapter/shot assembly, targeted QC.

## RSK-008 — Legacy authority confusion
Mitigação: `docs/_legacy` nunca canônico; migration ledger e precedence rules.

## GATE-FOUNDATION-V2
Passa quando:
- identidade/nome sincronizados;
- PRD V2 existe;
- roles e authority model existem;
- ProductionPolicy, Packs, SceneGraph, Routing, Cost/Budget, QC e ExceptionQueue definidos;
- state machines e contracts definidos;
- backlog/ondas V2 definidos;
- legacy isolado;
- validator local passa.

## GATE-TECH-FOUNDATION-001
Passa quando:
- runtime escolhido;
- package manager escolhido;
- dependências revisitadas;
- install reproduzível;
- lint verde;
- typecheck verde;
- tests verdes;
- build verde;
- fitness verde;
- dependency/security scan revisado.

## GATE-IDENTITY-SLICE-001
Passa quando:
- contratos tenant-scoped publicados;
- consentimento obrigatório para ativação;
- revogação idempotente bloqueia novas ativações;
- IdentityPack calibrado é pré-condição de ativação;
- auditoria cobre criação, ativação e revogação;
- testes, typecheck, lint e FF-04 verdes.

Status: **APROVADO EM MEMÓRIA**. Persistência, autenticação HTTP e integração
com providers permanecem fora deste gate.

## GATE-MEDIA-001
Benchmark com mesma pessoa/voz/scripts mede:
- identidade;
- lip-sync;
- naturalidade;
- movimento;
- first-pass acceptance;
- latency;
- cost per approved minute;
- provider reliability.

## GATE-PRODUCTION-PILOT-001
Um cliente real percorre:
`request → plan → cost → approval → mock/real media → QC → assembly → READY`.

## GATE-SCALE-001
Antes de declarar escala:
- workload real registrado;
- queue age/throughput;
- provider limits;
- STP Rate;
- Exception Rate;
- Human Minutes per Final Hour;
- Cost per Approved Minute;
- failure drills.

## GATE-UX-FOUNDATION-001
Passa quando:
- brand authority is recorded;
- compact typography/density is fixed;
- App Shell is specified;
- core components are inventoried;
- Operação wireframe exists;
- Nova Produção wireframe exists;
- Analysis/Packs wireframe exists;
- Production Monitor wireframe exists;
- Exception Queue wireframe exists;
- Clients/Digital Twin wireframes exist;
- responsive/accessibility rules exist;
- interactive prototype is reviewed;
- any material UX changes are recorded before frontend implementation.

## GATE-UX-FOUNDATION-001 — APROVADO
Aprovado pelo usuário após revisão do protótipo canônico e correção dos ícones da navegação.

## GATE-TECH-FOUNDATION-001 — APROVADO
Aprovado em 2026-09-04 no baseline Node.js 24.20.0, pnpm 11.25.0, Next.js 16.3.4 e React 19.2.8. Install congelado, lint, typecheck, 330 testes, build, fitness, audit e smokes passaram. Risco residual aceito: duas vulnerabilidades moderadas em `qs@6.15.3`, sem finding alto ou crítico.
