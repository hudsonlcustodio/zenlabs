# ADR-0015 — Policy-driven model routing with configuration-only model ids

**Status**: Accepted · **Authority**: brief §13, §48

## Context
Content quality, cost and availability differ per task. Model identifiers change
frequently. The domain must never be coupled to a model name.

## Decision
A `ModelRouter` resolves a `ModelPolicy` per `(task, tenant/qualityProfile,
environment)` returning an opaque `modelRef` plus fallbacks. `modelRef` maps to a
provider and model id **in configuration only**. Tiers: a cost-controlled
default, a higher-quality secondary, and an optional escalation tier that is
never the default.

Development tooling credentials are never runtime credentials.

## Alternatives rejected
- **Hardcoded model per call site** — rejected: spreads vendor names through the
  domain and makes cost policy unchangeable without deploys.
- **Single model everywhere** — rejected: forfeits the cost/quality trade-off the
  brief requires.
- **Always using the highest tier** — rejected: brief §13 explicitly forbids
  making the escalation tier the default.

## Consequences
- Model ids appear only in configuration; enforced by FF-09.
- Routing changes are configuration changes.
- Token cost is recorded per call in the provider cost ledger.
