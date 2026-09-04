# FINOPS V2

## Commercial unit
Final delivered/approved audiovisual minutes according to contract.

## Technical unit
**Cost per Approved Minute**.

## Two ledgers

### ClientUsageLedger
Commercial capacity:
- reserve;
- commit;
- release;
- adjustment.

### ProviderCostLedger
Internal COGS:
- provider;
- model/version;
- rate card version;
- duration/units;
- actual amount;
- attempt;
- production/shot;
- adjustment.

## Required metrics
- cost per approved minute;
- cost per pack;
- cost per routing class;
- retry cost;
- repair cost;
- provider cost variance;
- gross margin by plan/client;
- egress/storage;
- AI/token cost;
- observability cost.

## Rule
A provider can charge ZENLABS for a failed-to-be-delivered attempt. That is COGS, not automatically client usage.

## Budget
ProductionBudget is the execution guard. Commercial plan is entitlement. Do not conflate them.
