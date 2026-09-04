# DRIFT DE ATUALIDADE — 2026-09-02

## [DRIFT] pnpm

Em 01/09 o baseline candidato registrava `pnpm 11.24.0`.

Na verificação de 02/09, a linha 11 já publicou `11.25.0`. O candidato foi atualizado para `11.25.0`.

A linha 12 também já existe, mas permanece fora do gate inicial por ser uma migração maior/rewrite recente.

## [DRIFT] Next.js

Em 01/09 o baseline candidato registrava `Next.js 16.3.3`.

Na verificação de 02/09, `16.3.4` aparece como versão stable publicada. O candidato foi atualizado para `16.3.4`.

## Sem drift material

- Node 24.20.0 continua LTS.
- React/React DOM 19.2.8 continuam stable.
- NestJS 12.0.1 continua recém-lançado; manter Nest 11 no primeiro vertical slice permanece recomendado.
- TypeScript 7 continua uma migração própria, não misturada ao gate inicial.
- PostgreSQL 17.11 continua suportado no RDS.

## Política

Nenhum novo patch deve alterar silenciosamente o baseline depois que o lockfile for congelado para o gate.

Depois disso:
- patches entram por PR;
- security fixes têm prioridade;
- upgrades continuam com evidência.
