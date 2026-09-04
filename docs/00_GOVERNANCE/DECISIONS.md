# DECISIONS — ZENLABS V2

## DEC-ZEN-001 — Nome
**Status:** [DECISÃO APROVADA]  
Produto: `ZENLABS | Laboratório de Clones`.

## DEC-ZEN-002 — Repositório
**Status:** [DECISÃO APROVADA]  
`hudsonlcustodio/zenlabs` é o target canônico. O repositório VYRA não será continuado.

## DEC-ZEN-003 — Estratégia de migração
**Status:** [DECISÃO APROVADA]  
Reaproveitar scaffold técnico do ZIP. Arquivar decisões/documentação VYRA como legado.

## DEC-ZEN-004 — Arquitetura de mídia
**Status:** [DECISÃO APROVADA]  
Multi-modelo, provider-agnostic, routing por capacidade/qualidade/custo/saúde.

## DEC-ZEN-005 — Identidade
**Status:** [DECISÃO APROVADA]  
Identidade pertence à ZENLABS. IDs de providers são bindings substituíveis.

## DEC-ZEN-006 — Exception-Driven Production
**Status:** [DECISÃO APROVADA]  
Caminho normal deve ser automático. Humano entra por política, risco, exceção ou amostragem.

## DEC-ZEN-007 — Production Pods
**Status:** [DECISÃO APROVADA]  
Referência inicial: ~100 clientes por Production Supervisor, ~120h/mês disponíveis.

## DEC-ZEN-008 — Automação
**Status:** [DECISÃO APROVADA]  
Nunca automatizar menos porque há um humano disponível.

## DEC-ZEN-009 — Autoridade da IA
**Status:** [DECISÃO APROVADA]  
IA planeja/recomenda; não autoriza gasto, billing, consentimento, permissão, truth transactional ou publicação irrestrita.

## DEC-ZEN-010 — Autoridade do sistema
**Status:** [DECISÃO APROVADA]  
Sistema controla estado, política, orçamento, jobs, segurança, idempotência e auditoria.

## DEC-ZEN-011 — Papel do cliente
**Status:** [DECISÃO APROVADA]  
Cliente fornece intenção, conhecimento, contexto e autorização; acompanha resultado. Não opera provider, render, retry ou QC técnico.

## DEC-ZEN-012 — Supervisão humana
**Status:** [DECISÃO APROVADA]  
Production Supervisor governa carteira, políticas, exceções, risco, calibração, auditoria e overrides autorizados.

## DEC-ZEN-013 — Arquitetura de aplicação
**Status:** [PROPOSTA PRESERVADA DO ZIP]  
Monólito modular + workers assíncronos. Revisar apenas mediante gatilho concreto.

## DEC-ZEN-014 — Persistência
**Status:** [PROPOSTA PRESERVADA DO ZIP]  
PostgreSQL como store transacional, tenant_id + RLS como backstop.

## DEC-ZEN-015 — Processamento assíncrono
**Status:** [PROPOSTA PRESERVADA DO ZIP]  
Durable queue + transactional outbox. SQS permanece candidato inicial, sujeito ao Technical Gate.

## DEC-ZEN-016 — Client Usage Ledger & Provider Cost Ledger
**Status:** [DECISÃO APROVADA]  
`ClientUsageLedger` e `ProviderCostLedger` são independentes. Retries/provider spend não consomem automaticamente minutos comerciais.

## DEC-ZEN-017 — Production Packs
**Status:** [PROPOSTA]  
Catálogo inicial: PRESENTER, DYNAMIC, PREMIUM, SIGNATURE. Recipes versionadas.

## DEC-ZEN-018 — Autonomia
**Status:** [PROPOSTA]  
Começar em AUTONOMY-2 para fluxos novos; política pode evoluir por cliente/pack para exception-only/sample/auto-release com evidência.

## DEC-ZEN-019 — Retry
**Status:** [PROPOSTA]  
Máximo automático inicial por shot: 3 attempts, sempre subordinado ao budget guard.

## DEC-ZEN-020 — UI
**Status:** [DECISÃO APROVADA]  
White premium; provider internals somente em superfícies internas avançadas.

## DEC-ZEN-021 — Versões técnicas
**Status:** [DECISÃO PENDENTE]  
A migração preserva o lockfile/version set do scaffold para evitar uma atualização major não validada. `GATE-TECH-001` decide modernização.

## DEC-ZEN-022 — Compact, low-text product UI
**Status:** [DECISÃO APROVADA]  
ZENLABS uses a compact, intuitive UI with little permanent explanatory text. Default desktop operational typography is 13–14px, metadata 12px, with progressive disclosure for technical detail. No meaningful interface text below 12px.

## DEC-ZEN-023 — Brand boards as UI authority
**Status:** [DECISÃO APROVADA]  
The approved ZenLabs branding and logo supplied on 2026-09-01 are the visual source of truth. Electric Lime denotes action/progress; Signal Violet denotes AI/Clone intelligence.

## DEC-ZEN-024 — Progressive disclosure
**Status:** [DECISÃO APROVADA]  
Provider details, raw diagnostics, advanced routing, technical QC evidence and rarely used controls remain hidden from the primary workflow and appear only on demand or in advanced/internal surfaces.

## DEC-ZEN-025 — Interface visível em Português do Brasil
**Status:** [DECISÃO APROVADA]  
Todo conteúdo visível na interface comum deve usar Português do Brasil. Termos técnicos em inglês podem existir apenas em código, logs e documentação de engenharia.

## DEC-ZEN-026 — Direção de refinamento visual
**Status:** [DECISÃO APROVADA]  
A interface deve ser intuitiva, com pouco texto, tipografia compacta e refinada, inspirada nas referências visuais aprovadas pelo usuário.

## DEC-ZEN-027 — UI/UX canônica V1
**Status:** [DECISÃO APROVADA]  
O pacote `docs/uiux/` e o protótipo `prototypes/uiux-canonica/` são a proposta canônica pronta para revisão visual final antes da implementação do frontend.

## DEC-ZEN-028 — Estratégia do Technical Foundation Gate
**Status:** [PROPOSTA]  
Adotar modernização seletiva: atualizar runtime/frontend para linhas atuais de suporte, manter backend/contratos/testes em majors já validados até o primeiro vertical slice, e separar modernização de NestJS/TypeScript/Zod/Vitest em um gate posterior.

## DEC-ZEN-029 — Banco e acesso a dados
**Status:** [PROPOSTA]  
PostgreSQL 17 em Amazon RDS, acesso via `pg` + Drizzle ORM, migrations SQL revisáveis, RLS como defense-in-depth e transactional outbox no mesmo banco.

## DEC-ZEN-030 — Autenticação
**Status:** [PROPOSTA]  
Amazon Cognito User Pools para autenticação; autorização, memberships, roles e tenant ownership permanecem no domínio ZENLABS. Sessão web opaca e revogável armazenada no PostgreSQL.

## DEC-ZEN-031 — Execução assíncrona e mídia
**Status:** [PROPOSTA]  
Amazon SQS Standard + DLQ, processamento at-least-once com idempotência obrigatória, S3 privado como storage canônico e provider URLs apenas temporárias.

## DEC-ZEN-032 — Deploy
**Status:** [PROPOSTA]  
Amazon ECS/Fargate + ECR para web/API/workers, GitHub Actions com OIDC para AWS, Secrets Manager/KMS e OpenTelemetry para traces/métricas.
