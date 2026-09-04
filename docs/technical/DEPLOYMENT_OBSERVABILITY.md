# DEPLOYMENT E OBSERVABILIDADE

## Runtime

Amazon ECS com AWS Fargate.

Serviços iniciais:
- `zenlabs-web`
- `zenlabs-api`
- `zenlabs-worker-ai`
- `zenlabs-worker-media`
- `zenlabs-worker-social`

## Imagens

Amazon ECR.

Tag humana não é identidade de deploy.

Artefato imutável deve registrar:
- git SHA;
- image digest;
- build timestamp;
- lockfile checksum.

## Rede

Produção:
- ALB público;
- tasks em subnets privadas;
- RDS privado;
- security groups deny-by-default.

## CI/CD

GitHub Actions → AWS por OIDC.

Sem credenciais AWS long-lived em GitHub Secrets.

Fluxo:

```text
PR
→ validate
→ lint
→ typecheck
→ tests
→ fitness
→ security scan
→ build image

main
→ staging
→ smoke
→ migration gate
→ aprovação de produção
→ deploy
→ smoke
→ rollback se necessário
```

## Observabilidade

### OpenTelemetry
Usar para:
- traces;
- metrics.

No JavaScript, traces e metrics são stable; logs ainda não são o canal canônico do projeto.

### Logs
JSON estruturado em stdout:
- timestamp;
- level;
- service;
- environment;
- correlationId;
- tenantId quando seguro;
- productionId/jobId;
- error code.

Nunca logar:
- access token;
- refresh token;
- provider secret;
- conteúdo sensível completo;
- identidade/voz raw.

## Alertas iniciais
- API availability;
- API p95;
- queue oldest age;
- DLQ > 0;
- worker failure rate;
- provider error rate;
- budget hold;
- RDS health;
- S3 ingest failure.
