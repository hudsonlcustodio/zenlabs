# EVIDÊNCIA — TECHNICAL FOUNDATION

**Data:** 2026-09-04

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

## Evidência final

- Bootstrap: `f0d991e2c1272ff12d7e3a75e6a01568271af370`.
- Baseline adotado: `813d8bac434e77ca1208b519e6efdba5c0118c07`.
- CI limpa e congelada: `https://github.com/hudsonlcustodio/zenlabs/actions/runs/33889942506`.
- Technical Foundation Candidate final: `https://github.com/hudsonlcustodio/zenlabs/actions/runs/33890719234`.
- Node.js 24.20.0; pnpm 11.25.0; Next.js 16.3.4; React 19.2.8.
- Install, lint, typecheck, 330 testes, build, fitness, audit e smokes: aprovados.
- Dependency audit: 0 critical, 0 high, 2 moderate em `qs@6.15.3`, risco provisoriamente aceito pelo usuário.

## Consequência

`GATE-TECH-FOUNDATION-001 = APROVADO`.

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
