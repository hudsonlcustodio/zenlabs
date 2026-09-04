# ADR-0019 — Primary region sa-east-1 (São Paulo)

**Status**: Accepted · **Authority**: brief §29

## Context
Brief requires an explicit, justified region decision — never a silent one.

## Decision
**`sa-east-1`.**

- **Latency**: initial customers and identity owners are predominantly in Brazil;
  the interactive Portal target (NFR-03 < 3 s) is round-trip dominated.
- **Compliance/residency**: personal data of high sensitivity (voice, likeness,
  documents) stays in-country, simplifying the governance posture.
- **Service availability**: every service in the MVP baseline is available there.
- **Operational impact**: single-region operation; providers are external and
  region-independent.

## Alternatives rejected
- **us-east-1** — rejected: lower unit cost and earliest service availability do
  not offset ~100–150 ms of additional round-trip latency for every interactive
  request, plus cross-border transfer of biometric-adjacent personal data.
- **Multi-region active-active** — rejected: disproportionate at MVP; the
  availability target (99.5%) does not require it.

## Consequences
- Higher unit cost than us-east-1 is accepted and budgeted.
- New AWS services may arrive later in this region; the baseline avoids exotic
  services anyway.
- Revisit if the customer base becomes materially non-Brazilian.
