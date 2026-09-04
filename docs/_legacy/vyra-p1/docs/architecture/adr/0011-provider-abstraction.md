# ADR-0011 — Ports and adapters for all external providers, mock by default

**Status**: Accepted · **Authority**: brief §10, §11, §13, §36, §48

## Context
HeyGen Enterprise is not yet contracted; credentials are unavailable. Providers
must be replaceable, and development, testing and CI must never be blocked or
consume credit.

## Decision
Every external system sits behind a port in `packages/providers` with a real
adapter and a **deterministic mock** covering success and every failure class.
`PROVIDER_MODE` is per-environment and defaults to `mock` everywhere except
production. A common error taxonomy is mandatory.

## Alternatives rejected
- **Direct SDK calls from services** — rejected: couples the domain to provider
  DTOs and makes substitution and testing impossible.
- **A single generic "AI provider" abstraction** — rejected: video, voice and
  language have genuinely different lifecycles; one interface would leak.
- **Recorded HTTP fixtures only (VCR-style)** — rejected as the primary
  mechanism: fixtures of unconfirmed contracts would encode guesses; explicit
  mocks make the unknowns visible as gates.

## Consequences
- Unconfirmed provider contracts become explicit gates (GATE-HG04, GATE-TT02,
  GATE-MT02, GATE-COST01) rather than invented endpoints.
- CI is credit-safe by construction (FF-08).
- Concurrency and rate limits are configuration, never constants (FF-13).
