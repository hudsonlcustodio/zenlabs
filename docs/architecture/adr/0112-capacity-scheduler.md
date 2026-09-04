# ADR-0112 — Capacity Scheduler and backpressure

**Status:** Proposed

## Decision
Jobs are prioritized using deadline/SLA, tenant priority, provider health/capacity, cost/budget and retry state.

Provider saturation must reduce/reroute/queue work rather than create retry storms.
