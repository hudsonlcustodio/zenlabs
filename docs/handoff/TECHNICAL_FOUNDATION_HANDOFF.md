# HANDOFF — TECHNICAL FOUNDATION V1

## Estado

- UI/UX: APROVADA
- Foundation de produto/arquitetura: consolidada
- Technical Foundation: EM ANDAMENTO
- Implementação de domínio: ainda não iniciada

## Baseline candidato

- Node 24.20.0 LTS
- pnpm 11.25.0
- Next 16.3.4
- React 19.2.8
- Nest 11.2.3 preservado
- TypeScript 5.9.3 preservado
- Vitest 3.2.7 preservado
- Zod 3.25.76 preservado

## Infra

- PostgreSQL 17 / RDS
- Drizzle + pg
- Cognito + sessão opaca ZENLABS
- S3 privado / KMS
- SQS Standard + DLQ
- ECS/Fargate + ECR
- GitHub Actions OIDC
- OpenTelemetry traces/metrics + logs JSON

## Próxima ação

Executar o baseline candidato em ambiente com Node 24 e registry, regenerar lockfile e passar `pnpm tech:gate`.

Somente depois iniciar o primeiro vertical slice com providers mockados.
