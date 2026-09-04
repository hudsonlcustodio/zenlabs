# ADR-0001 — Modular monolith

**Status**: Accepted · **Authority**: brief §5, §26, §44

## Context
Greenfield platform, one team, unproven load, 23 domain modules. Brief forbids
microservices without proven need and forbids Kubernetes.

## Decision
Build a **modular monolith**: one codebase, strict module boundaries, deployed
as five processes (`web`, `api`, `worker-ai`, `worker-media`, `worker-social`)
that share the same code and database.

## Alternatives rejected
- **Microservices** — rejected: no measured scaling divergence, and it would add
  distributed transactions to a system whose hardest requirement (ledger
  correctness) is far easier with a single ACID database.
- **Single process for everything** — rejected: render polling and knowledge
  ingestion are long-running and would compete with API latency (NFR-01/02).
- **Serverless functions** — rejected: long-running renders and polling loops fit
  poorly, and cold starts threaten NFR-03.

## Consequences
- Module extraction stays possible; gate G-G governs it.
- Boundaries must be machine-enforced or they will erode → FF-01..FF-04.
- One database means RLS can be the tenancy backstop.
