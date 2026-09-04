# ADR-0012 — HeyGen as the initial video provider, polling-first

**Status**: Accepted · **Authority**: brief §10, §12, §48

## Context
Avatar V is the desired engine. Not every look supports it. Enterprise
contracting is pending. Webhook availability and signature scheme are not
confirmed in official documentation at this stage.

## Decision
`HeyGenProvider` implements `VideoProvider` and `AvatarProvider`. Engine
selection uses the documented `engine` field. **Capability is always queried
before generation**; Avatar V is never assumed. **Polling is the baseline**
completion mechanism; webhooks are an optimisation enabled only after
verification (GATE-HG04).

## Alternatives rejected
- **Assume Avatar V for all looks** — rejected: explicitly forbidden by brief §10
  and unverifiable.
- **Webhook-first** — rejected: the webhook contract is unconfirmed; building on
  it would mean inventing a payload shape, which brief §48 forbids.
- **Driving generation from the HeyGen dashboard** — rejected: brief §10 requires
  API-first production operation.

## Consequences
- A reconciler is mandatory, not optional.
- Capability snapshots are stored and refreshed.
- Unsupported capability yields `BLOCKED`, never a silent engine downgrade.
