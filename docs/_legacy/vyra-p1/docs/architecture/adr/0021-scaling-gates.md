# ADR-0021 — Metric-triggered promotion gates instead of anticipatory scaling

**Status**: Accepted · **Authority**: brief §28

## Context
The brief supplies thresholds but warns they must not become blind autoscaling.

## Decision
Thresholds are **analysis triggers**. Each infrastructure promotion (G-A..G-H in
`scalability-gates.md`) has an objective trigger, a precondition, and requires a
recorded metric series plus an ADR amendment before execution.

## Alternatives rejected
- **Autoscaling on the same thresholds** — rejected: the brief forbids it, and
  the common bottleneck (external provider rate limits) is not fixed by adding
  instances — it would just increase spend and provider throttling.
- **Fixed capacity forever** — rejected: no path to the maturity availability target.
- **Scaling on intuition** — rejected: the anti-gates list exists precisely to
  block this.

## Consequences
- Promotions are auditable decisions with evidence.
- Monthly gate review is an operational obligation.
