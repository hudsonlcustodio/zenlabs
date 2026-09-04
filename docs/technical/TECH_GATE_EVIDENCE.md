# EVIDÊNCIA — TECHNICAL FOUNDATION

**Data:** 2026-09-02

## Checks executados neste ambiente

```text
$ node scripts/foundation/validate.mjs
ZENLABS FOUNDATION VALIDATION PASS — schemas=11 epics=28 stories=112 queues=14

$ node scripts/uiux/validar.mjs
VALIDAÇÃO UI/UX APROVADA — idioma=pt-BR telas=9 tipografia=refinada prototipo=clicavel

$ node scripts/fitness/ff-04-dependency-graph.mjs
FF-04  workspaces=12  modules=0  violations=0
FF-04 PASS — graph is a DAG and every edge is declared.

$ node scripts/fitness/ff-19-no-committed-secret.mjs
FF-19  scope=tracked  files=0  trackedEnv=0  findings=0  gitleaks=unavailable
FF-19 note: gitleaks binary not present; history scan runs in CI.
FF-19 PASS — no committed secret.

$ node scripts/tech/validate-foundation-decision.mjs
TECH DECISION VALIDATION PASS — selective-modernization data=postgres17 auth=cognito queue=sqs compute=ecs-fargate
```

## Ambiente observado

- Node disponível: `22.16.0`
- pnpm: indisponível localmente
- registry npm: indisponível no ambiente de artefato

## Consequência

A decisão técnica e os artefatos estáticos estão validados.

O `GATE-TECH-FOUNDATION-001` **continua aberto**, porque ainda faltam evidências dependentes do toolchain alvo e instalação de dependências.

## Comando de execução em ambiente habilitado

```bash
node scripts/tech/apply-candidate-baseline.mjs
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --no-frozen-lockfile

# revisar e commitar pnpm-lock.yaml

pnpm tech:gate
```

Depois, em checkout limpo:

```bash
pnpm install --frozen-lockfile
pnpm tech:gate
```
