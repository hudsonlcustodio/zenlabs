# ADR-0107 — Production budget as hard execution guard

**Status:** Accepted in principle

## Decision
Every billable external call must belong to an authorized ProductionBudget. Retries and premium fallback consume budget. Hard limit cannot be overridden by an AI task.
