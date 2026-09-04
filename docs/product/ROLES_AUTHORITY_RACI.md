# ROLES, AUTHORITY & RACI

## ROLE-001 — Client / Knowledge Owner
Dono da intenção, conhecimento, contexto e autorização de identidade.

Não é responsável por provider, shot routing, retry, QC técnico ou operação de publicação.

## ROLE-002 — ZENLABS Human Production Supervisor
Dono da carteira operacional, políticas, exceções, risco, calibração, auditoria e overrides autorizados.

Não é operador manual de cada job.

## ROLE-003 — ZENLABS AI Production Director
Dono do planejamento probabilístico e recomendações.

Pode:
- analisar roteiro;
- recomendar pack;
- criar Scene Graph;
- propor direction;
- sugerir repair.

Não pode:
- autorizar gasto;
- alterar billing;
- ignorar consentimento;
- conceder permissão;
- publicar sem policy;
- declarar verdade transacional.

## ROLE-004 — ZENLABS Production System
Autoridade determinística de:
- estado;
- policy;
- budget;
- idempotência;
- queues/jobs;
- security;
- audit;
- cost;
- execution.

## Regra de autoridade

> Cliente: intenção e conhecimento.  
> IA: recomendação e planejamento.  
> Sistema: autorização transacional e execução.  
> Humano: políticas, risco, exceções e overrides.

## RACI

| Etapa | Cliente | Supervisor | IA | Sistema |
|---|---|---|---|---|
| Demanda/contexto | R | C | C | A |
| Validar consent/entitlement | I | C | — | A/R |
| Analisar roteiro | C | C | R | A(schema) |
| Recomendar pack | I | A quando policy exige | R | C |
| Cost estimate | I | C | — | A/R |
| Auto-approval | I | policy owner | — | A/R |
| Scene Graph | I | C | R | A(schema) |
| Voice direction | I | C | R | A |
| Media routing | — | C | C | A/R |
| Render/jobs | — | — | — | A/R |
| Auto-QC | — | C | R | A |
| Repair/fallback | — | exception | C | A/R |
| Final release | I | A quando policy exige | C | A/R por policy |
| Publish | I | A por policy | C | R |
| Performance | I | C | R | A/R |

## Human review modes

- `ALWAYS_HUMAN`
- `EXCEPTION_ONLY`
- `SAMPLE`
- `AUTO_RELEASE`

A policy, e não o LLM, escolhe qual modo é permitido.
