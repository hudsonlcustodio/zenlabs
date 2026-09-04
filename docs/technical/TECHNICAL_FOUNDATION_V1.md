# ZENLABS — TECHNICAL FOUNDATION V1

**Gate atual:** `GATE-TECH-FOUNDATION-001`  
**Status:** [PROPOSTA EXECUTÁVEL / GATE EM ANDAMENTO]  
**Data de verificação de versões:** 2026-09-02

## Objetivo

Fechar a fundação técnica antes de implementar domínio.

A estratégia escolhida é **modernização seletiva**, porque o repositório ainda tem quase zero domínio implementado, porém alguns majors acabaram de mudar e não justificam introduzir risco simultâneo.

## Baseline candidato

| Camada | Candidato | Decisão |
|---|---|---|
| Node.js | 24.20.0 LTS | atualizar |
| pnpm | 11.25.0 | atualizar |
| Next.js | 16.3.4 Active LTS | atualizar |
| React / React DOM | 19.2.8 | atualizar |
| NestJS | 11.2.3 | preservar inicialmente |
| TypeScript | 5.9.3 | preservar inicialmente |
| Vitest | 3.2.7 | preservar inicialmente |
| Zod | 3.25.76 | preservar inicialmente |
| zod-to-openapi | 7.3.4 | preservar junto com Zod 3 |

## Por que não atualizar tudo

- NestJS 12 foi lançado há poucos dias e traz mudança relevante de distribuição ESM e defaults.
- TypeScript 7 é uma nova implementação nativa e acabou de entrar em stable.
- TypeScript 6/7 mudam defaults/deprecações que devem ser tratados como migração própria.
- Vitest 4 altera semântica de mocks.
- Zod 4 exige migração conjunta do gerador OpenAPI; a própria biblioteca zod-to-openapi direciona Zod 3 para a linha 7.3.4 e Zod 4 para linhas mais novas.

A fundação não deve misturar cinco migrações independentes no mesmo gate.

## Infraestrutura candidata

```text
Internet
   ↓
ALB / HTTPS
   ├── web (ECS/Fargate)
   └── api (ECS/Fargate)
          │
          ├── RDS PostgreSQL 17
          ├── S3 privado
          ├── SQS + DLQ
          ├── Cognito
          └── Secrets Manager/KMS

worker-ai     ─┐
worker-media   ├── ECS/Fargate → SQS → providers
worker-social ─┘
```

## Regras

- sem Redis inicialmente;
- sem Kafka inicialmente;
- sem Kubernetes;
- sem microservices por domínio;
- provider SDK apenas em `@zenlabs/providers`;
- nenhum job externo sem idempotência;
- nenhum gasto sem ProductionBudget;
- PostgreSQL é source-of-truth transacional;
- S3 é source-of-truth de mídia;
- SQS é transporte, não source-of-truth;
- Cognito autentica; ZENLABS autoriza.

## Próximo gate

O baseline só vira canônico quando uma máquina com Node 24.20.0 e acesso ao registry provar:

1. instalação reproduzível;
2. lockfile regenerado e congelado;
3. lint;
4. typecheck;
5. tests;
6. build;
7. fitness;
8. audit de dependências;
9. boot smoke do web/API/workers.
