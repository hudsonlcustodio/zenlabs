# CORE SCREEN SPECS

## SCR-OPS-001 — Operação / Control Tower

### Objetivo
Mostrar apenas saúde da operação e atenção necessária.

### Above the fold
- Produções ativas
- STP Rate
- Exception Rate
- SLA risk
- lista de exceções críticas/altas

### Filtros
- período
- cliente
- supervisor
- severity
- status

### Não mostrar por padrão
- provider IDs
- prompts
- raw logs
- todos os jobs normais

### Primary action
Nenhuma ação global obrigatória.

A tela é attention-first.

---

## SCR-PROD-001 — Nova Produção

### Campos visíveis
- Cliente
- Digital Twin
- Objetivo
- Roteiro/material
- Preferência de qualidade

### Primary action
`Analisar`

### Advanced
Drawer:
- canal
- idioma
- resolução
- deadline
- special constraints

Não poluir formulário principal.

---

## SCR-PROD-002 — Production Analysis

Mostrar:
- duração
- capítulos
- complexidade
- composição
- pack recomendado
- custo estimado
- risk flags

### Primary action
`Usar recomendação`

### Secondary
`Comparar packs`

---

## SCR-PROD-003 — Pack Comparison

Máximo 3 opções:
- Econômico
- Recomendado
- Premium

Comparar:
- presenter %
- visuals %
- motion %
- qualidade
- custo
- tempo estimado

Provider invisível.

---

## SCR-PROD-004 — Production Plan

Default:
- chapters collapsed
- scene count
- shots count
- duration
- composition
- total estimate

Expand:
Chapter → Scene → Shot

Provider só em Advanced.

---

## SCR-PROD-005 — Production Monitor

Header:
- status
- % geral
- accepted / generating / QC / waiting
- cost consumed
- budget remaining

Timeline:
- Chapters
- expandable shots
- errors highlighted

Atenção apenas em warnings/exceptions.

---

## SCR-EXC-001 — Exception Queue

Table/list, não Kanban.

Colunas:
- severity
- tipo
- cliente
- produção
- item
- SLA
- custo de retry
- owner
- ação

Quick actions:
- Revisar
- Reprocessar
- Alterar rota
- Escalar

Detalhe abre em drawer.

---

## SCR-CLIENT-001 — Clients

Colunas:
- cliente
- Twin
- produção ativa
- status
- supervisor

Filtros compactos.

---

## SCR-TWIN-001 — Digital Twin

Tabs:
- Overview
- Identity
- Voice
- Knowledge
- Brand
- Policies
- Calibration
- History

Header:
- portrait
- nome
- status
- versão IdentityPack
- último calibration

---

## SCR-PORTAL-001 — Client Portal Overview

Mostrar:
- próximos conteúdos
- publicados recentes
- minutos do plano
- performance resumida
- billing status

Sem:
- provider
- render
- retry
- technical QC
- internal exceptions
