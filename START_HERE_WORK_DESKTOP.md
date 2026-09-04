# START HERE — ZENLABS WORK DESKTOP

Você está trabalhando no produto **ZENLABS | Laboratório de Clones**.

## Contexto

Este repositório nasceu de uma migração controlada do scaffold técnico VYRA P1 para uma nova Foundation V2.

A documentação VYRA em `docs/_legacy/` é somente histórica.

## Precedência

Em conflito:

1. `docs/00_GOVERNANCE/DECISIONS.md`
2. `docs/product/PRD_ZENLABS_V2.md`
3. ADRs V2 em `docs/architecture/adr/01xx-*`
4. contratos V2
5. backlog V2
6. código implementado e testes
7. `docs/_legacy/` somente como evidência histórica

## Decisões obrigatórias

- Nome: ZENLABS | Laboratório de Clones.
- Multi-modelo e provider-agnostic.
- Digital Twin/IdentityPack pertencem à ZENLABS; provider IDs são bindings.
- Exception-Driven Production é o caminho operacional padrão.
- Production Pods começam com referência de ~100 clientes por Production Supervisor e ~120h/mês disponíveis.
- Nunca automatizar menos porque existe um humano disponível.
- Humanos tratam política, risco, exceções, calibração e auditoria.
- IA recomenda e planeja; não autoriza gasto, permissão ou consentimento.
- Sistema é autoridade transacional, de estado, orçamento, segurança e execução.
- Cliente é fonte de intenção, conhecimento e autorização; não opera provider/render/QC técnico.
- Uso comercial e custo de provider são ledgers distintos.
- Provider específico nunca é domínio.
- Monólito modular + workers assíncronos continua sendo o default.

## Próximo trabalho de engenharia

Não implementar provider real primeiro.

Vertical slice recomendado:

`Tenant → Client → Consent → DigitalTwin → IdentityPack → ProductionPolicy → ProductionRequest → ProductionPlan → CostEstimate → Approval/AutoApproval → Audit`

Use mocks para mídia.

## Antes de qualquer feature

Execute:

```bash
node scripts/foundation/validate.mjs
```

Depois de instalar as dependências no runtime correto:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm fitness
```

Não declare `GATE-TECH-FOUNDATION-001` aprovado sem evidência desses comandos.

## UX/UI Foundation V1

Before implementing frontend screens, read:
1. `docs/brand/BRAND_AUTHORITY.md`
2. `docs/ux/UX_UI_FOUNDATION_V1.md`
3. `docs/ux/APP_SHELL.md`
4. `docs/ux/CORE_SCREEN_SPECS.md`
5. `docs/ux/COMPONENTS.md`
6. `docs/ux/UI_STATES.md`
7. `docs/ux/RESPONSIVE_ACCESSIBILITY.md`
8. `docs/ux/WIREFRAMES_CORE.md`

Clickable reference:
`prototypes/ux-foundation/index.html`

UI rule: minimal text, compact hierarchy, provider details by progressive disclosure.


## UI/UX Canônica Refinada

Antes de implementar frontend, ler:
1. `docs/brand/BRAND_AUTHORITY.md`
2. `docs/uiux/README.md`
3. `docs/uiux/00_UIUX_CANONICA.md`
4. `docs/uiux/01_DICIONARIO_PTBR.md`
5. `docs/uiux/02_TIPOGRAFIA.md`
6. `docs/uiux/06_TELAS_CANONICAS.md`
7. `docs/uiux/11_CHECKLIST_IMPLEMENTACAO.md`

Protótipo:
`prototypes/uiux-canonica/index.html`

Regra obrigatória:
- conteúdo visível em PT-BR;
- pouco texto;
- tipografia refinada;
- provider invisível no fluxo comum.
