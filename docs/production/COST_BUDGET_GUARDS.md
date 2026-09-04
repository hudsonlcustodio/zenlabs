# COST ENGINE & BUDGET GUARDS

## Principle

LLM pode sugerir composição. Somente o sistema calcula e autoriza custo.

## ProductionBudget

- `estimatedMin`
- `estimatedMax`
- `approvedBudget`
- `consumed`
- `retryBudget`
- `premiumBudget`
- `hardLimit`
- `currency`
- `rateCardVersion`

## Estimate

```text
Σ(
  expected duration
  × provider/routing rate
  × expected attempts
)
+ voice
+ images
+ deterministic rendering
+ repair allowance
+ assembly
+ storage/egress estimate
```

## Rules

1. Todo ProductionPlan recebe CostEstimate antes de execução.
2. Retry não é ilimitado.
3. Premium fallback exige budget disponível.
4. `hardLimit` nunca é ultrapassado automaticamente.
5. Alteração de rate card não altera estimativa já aprovada sem nova versão.
6. Actual cost é apurado por MediaJob/ProviderCostLedger.

## Budget hold

Quando custo projetado ultrapassa limite:

`RUNNING → BUDGET_HOLD → HUMAN_REVIEW`

O agente não pode sobrescrever.
