# ZENLABS UX/UI FOUNDATION V1

**Status:** [PROPOSTA CANÔNICA PARA GATE]  
**Date:** 2026-09-01  
**Gate:** `GATE-UX-FOUNDATION-001`

## Direção aprovada

A interface ZENLABS deve ser:

- intuitiva;
- compacta;
- com pouco texto;
- visualmente limpa;
- orientada a ação;
- densa o suficiente para operação profissional;
- sem parecer complexa;
- sem UI “de IA” decorativa.

## Princípio central

> Mostrar primeiro o que o usuário precisa decidir.  
> Esconder detalhe técnico até ele ser necessário.

## Regra de densidade

Compacto não significa minúsculo.

### Desktop
- Page title: 20–22px
- Section title: 14–16px
- Body: 13–14px
- Table/control text: 13px
- Metadata/caption: 12px
- KPI number: 22–28px
- Control height: 36–40px
- Table row: 42–46px

### Mobile
- Body/control text: mínimo prático 14px
- Primary action: 44px mínimo de altura
- Operação mobile é resumida; edição pesada permanece desktop-first.

## Texto na interface

Evitar:
- parágrafos;
- explicações longas;
- instruções permanentes;
- jargão de provider.

Preferir:
- labels curtas;
- números;
- estados;
- ícones reconhecíveis;
- tooltips;
- progressive disclosure;
- side panels/drawers para detalhes.

## Semântica de cor

- Lime = ação, progresso, aprovado, foco operacional.
- Violet = IA, Clone, recomendação, inteligência.
- Red = bloqueio/erro/risco.
- Amber = atenção.
- Neutros = estrutura.

## Regra de telas

Toda tela deve responder rapidamente:
1. Onde estou?
2. O que está acontecendo?
3. O que precisa da minha atenção?
4. Qual é a próxima ação?

## Densidade por superfície

### Control Tower
Alta densidade, baixa verbosidade.

### Produção
Média-alta densidade, progressive disclosure.

### Digital Twin
Média densidade, identidade visual forte.

### Client Portal
Baixa-média densidade, leitura simples.

## Anti-patterns

Não usar:
- cards para tudo;
- textos de ajuda repetidos;
- badges demais;
- tooltips para informação crítica;
- modais em cascata;
- 6+ ações com mesmo peso;
- ícones sem label quando ambíguos;
- fontes abaixo de 12px;
- provider name no fluxo normal;
- dashboard com 20 KPIs sem hierarquia.
