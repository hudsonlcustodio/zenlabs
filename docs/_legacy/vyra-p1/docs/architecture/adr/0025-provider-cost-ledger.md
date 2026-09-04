# ADR-0025 — Provider cost ledger separate from client usage

**Status**: Accepted · **Authority**: brief §20

## Context
What the client consumes and what VYRA pays are different quantities with
different rules. A failed render may cost VYRA while consuming no client minutes.

## Decision
A separate append-only `provider_cost_entry`, keyed uniquely on
`(provider, provider_ref, cost_type)`, recorded for successes **and** failures
where the provider charged. Unit prices live in effective-dated configuration,
never in code. Amounts are integer micros.

## Alternatives rejected
- **One ledger for both** — rejected: the asymmetry (failure costs money but
  consumes no client capacity) would require conditional rows in a single table
  and invite incorrect billing joins.
- **Deriving cost from client usage** — rejected: structurally wrong; they differ.
- **Floating-point amounts** — rejected: rounding errors in money.
- **Full double-entry accounting** — rejected: out of MVP scope per brief §20.

## Consequences
- Margin is computable per attempt, tenant and period.
- GATE-COST01 covers providers that do not expose per-job cost; those entries are
  marked `estimated` rather than invented.
