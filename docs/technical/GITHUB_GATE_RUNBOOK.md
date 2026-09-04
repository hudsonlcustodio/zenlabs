# RUNBOOK — EXECUTAR O TECHNICAL FOUNDATION GATE NO GITHUB

## Objetivo

Usar o próprio GitHub Actions para executar o gate em ambiente com:
- Node alvo;
- pnpm alvo;
- acesso ao npm registry;
- runner limpo.

## Workflow

`.github/workflows/tech-foundation-candidate.yml`

Execução manual:
`Actions → Technical Foundation Candidate → Run workflow`

## O workflow faz

1. Node 24.20.0.
2. pnpm 11.25.0.
3. valida a Foundation/UI/decisões.
4. aplica o baseline candidato em memória de trabalho.
5. regenera `pnpm-lock.yaml`.
6. executa lint.
7. executa typecheck.
8. executa tests.
9. executa build.
10. executa fitness.
11. executa audit.
12. gera artifact com patch + manifests + lockfile.

## Se ficar verde

Não copiar arquivos cegamente.

Revisar o artifact:
- diff de manifests;
- lockfile;
- warnings;
- audit.

Depois criar commit explícito:

`chore: adopt technical foundation baseline`

E rodar novamente em checkout com:

`pnpm install --frozen-lockfile`

## Se falhar

Classificar:
- incompatibilidade Next/React;
- incompatibilidade pnpm;
- dependency peer mismatch;
- lint/type issue;
- test regression;
- build regression;
- security finding.

Não contornar o gate removendo teste ou reduzindo rigor.
