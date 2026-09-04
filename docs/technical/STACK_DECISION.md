# DECISÃO DE STACK — COUNCIL

## Alternativas avaliadas

### A — Preservar tudo
Node 22 + pnpm 9 + Next 15 + React 19.0 + Nest 11 + TS 5.

**Prós:** menor mudança imediata.  
**Contras:** Next 15 já está em Maintenance LTS e pnpm 9 está duas gerações atrás.

### B — Modernização seletiva — RECOMENDADA
Node 24 + pnpm 11 + Next 16 + React 19.2; preservar Nest 11, TS 5.9, Vitest 3 e Zod 3 no primeiro slice.

**Prós:** atualiza lifecycle/runtime e frontend sem misturar migrações de backend/contracts/test runner.  
**Contras:** cria um segundo gate futuro para Nest 12 / TS 7 / Zod 4 / Vitest 4.

### C — Full current-major
Node 24 + pnpm 12 + Next 16 + React 19.2 + Nest 12 + TS 7 + Vitest 4 + Zod 4.

**Prós:** stack totalmente atual.  
**Contras:** pnpm 12 é rewrite recente; Nest 12 foi recém-lançado; TS 7 é nova implementação; maior superfície de falha sem valor de produto imediato.

## Recomendação

**B — Modernização seletiva.**

É a opção com melhor relação entre lifecycle, segurança, reversibilidade e tempo para o primeiro vertical slice.
