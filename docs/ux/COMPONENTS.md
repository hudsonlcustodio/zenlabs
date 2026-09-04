# COMPONENT SYSTEM V1

## Foundation components

- `ZenButton`
- `ZenIconButton`
- `ZenInput`
- `ZenTextarea`
- `ZenSelect`
- `ZenSearch`
- `ZenTabs`
- `ZenBadge`
- `ZenStatusDot`
- `ZenTooltip`
- `ZenDropdown`
- `ZenDrawer`
- `ZenModal`
- `ZenToast`
- `ZenTable`
- `ZenPagination`
- `ZenProgress`
- `ZenSkeleton`
- `ZenEmptyState`

## Domain components

### `ZenTwin`
Avatar/identidade + nome + status.

### `ZenPack`
Pack + composição + custo + recomendação.

### `ZenCostEstimate`
Faixa estimada + budget + warning.

### `ZenProductionStatus`
Estado + progresso + tempo.

### `ZenChapter`
Chapter collapsible.

### `ZenScene`
Scene group.

### `ZenShot`
Tipo + duração + estado + QC.

### `ZenQCScore`
Score + confidence + flags.

### `ZenException`
Severity + reason + action.

### `ZenBudgetGuard`
Consumed / approved / hard limit.

### `ZenProviderHealth`
Somente interno/advanced.

### `ZenTimeline`
Produção/assembly timeline.

## Action hierarchy

### Primary
1 por região. Lime.

### Secondary
White / Border.

### Tertiary
Text/icon.

### Destructive
Danger, nunca Lime.

## Card rule

Card só existe quando há um bloco semântico independente.

Não usar card para:
- cada KPI pequeno;
- cada label;
- cada shot em listas extensas.

Preferir rows, sections e grouped panels.
