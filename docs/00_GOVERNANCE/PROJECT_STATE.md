# PROJECT STATE — ZENLABS FOUNDATION V2

**Product:** ZENLABS | Laboratório de Clones  
**Date:** 2026-09-04  
**Gate Zero:** GZ-C + GZ-D — evolução estrutural + auditoria/migração de repositório  
**Mode:** FOUNDATION / ARCHITECTURE / REPO-AUDIT  
**Current gate:** `GATE-TECH-FOUNDATION-001 = APROVADO`
**Wave 1:** `IDENTITY-SLICE-001 = IMPLEMENTADA EM MEMÓRIA`

## Estado real

[FATO VERIFICADO] O repositório GitHub alvo `hudsonlcustodio/zenlabs` estava vazio na verificação de 2026-09-01.

[FATO VERIFICADO] O snapshot VYRA contém scaffold técnico útil: monorepo, API, web shell, workers, contracts, config, observability, CI, tests e fitness functions.

[FATO VERIFICADO] O snapshot ainda não implementa os módulos de negócio centrais além da fatia de identidade da Wave 1.

[FATO VERIFICADO] A Wave 1 implementa contratos e regras de aplicação para Tenant,
Client, Consent, DigitalTwin, IdentityPack e AuditEvent, incluindo ativação
condicionada a consentimento, revogação idempotente e isolamento por tenant.

[DECISÃO APROVADA] O repositório VYRA original não será utilizado como origem do novo produto.

[DECISÃO APROVADA] O ZIP VYRA será somente seed técnico e evidência histórica.

[DECISÃO APROVADA] Produto passa a se chamar `ZENLABS | Laboratório de Clones`.

[DECISÃO APROVADA] A produção é multi-modelo e provider-agnostic.

[DECISÃO APROVADA] A operação alvo é Exception-Driven Production.

[DECISÃO APROVADA] O modelo organizacional inicial usa Production Pods com referência de ~100 clientes por Production Supervisor e ~120h/mês disponíveis, sem converter isso em dependência estrutural permanente.

## Drift encerrado nesta V2

- HeyGen como provider primário.
- QA humano obrigatório em todo vídeo.
- cliente como aprovador técnico/operacional.
- consumo comercial por cada tentativa de render.
- dark UI como visual canônico.
- Voice → single-provider render → video como única pipeline.

## Gaps abertos

- GATE-MEDIA-001: benchmark de providers.
- GATE-QC-001: calibrar thresholds de QC.
- GATE-LOAD-001: workload model real.
- GATE-LEGAL-001: revisão jurídica/privacidade da identidade sintética.
- GATE-CLOUD-001: confirmar região/topologia de produção.
- GATE-PACK-001: calibrar recipes de packs em conteúdo real.

## Próxima ação

Preparar o contrato HTTP autenticado da fatia de identidade e o repositório
tenant-scoped antes de qualquer provider real.

## Gate de UX aprovado

[DECISÃO APROVADA] `GATE-UX-FOUNDATION-001 = APROVADO`.

A UI/UX Canônica V1, incluindo a correção dos ícones do menu, é a referência oficial para implementação.
