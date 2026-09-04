# ADR-0031 — Unsigned webhooks are untrusted hints

**Status**: Accepted · **Authority**: brief §34, §33

## Context
Webhook availability and signature schemes are unconfirmed for HeyGen
(GATE-HG04). Webhook spoofing and replay are named threats (T-08, T-09).

## Decision
Webhooks are received, signature-verified where a provider offers one, persisted
uniquely by `(provider, provider_event_id)`, acknowledged with `2xx` immediately,
and processed asynchronously.

**An unsigned or unverifiable webhook may only trigger a poll.** It may never
directly cause a state transition or a usage commit. Polling and reconciliation
remain the authoritative completion mechanism.

## Alternatives rejected
- **Trust unsigned webhooks** — rejected: a forged completion event could trigger
  a usage commit — a direct financial attack.
- **Process synchronously in the request** — rejected: brief §34 forbids holding
  the HTTP response for heavy work.
- **Webhooks as the only completion path** — rejected: a lost webhook would strand
  a paid render.

## Consequences
- Reconciliation is mandatory infrastructure, not a fallback.
- Webhooks are a latency optimisation, never a correctness dependency.
