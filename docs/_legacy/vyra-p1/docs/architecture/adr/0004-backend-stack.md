# ADR-0004 — Backend: NestJS + REST + OpenAPI

**Status**: Accepted · **Authority**: brief §6, §41

## Context
Modular backend with rigorous input validation and documented contracts.

## Decision
**NestJS + TypeScript**, one module per domain, **REST** resource-oriented API,
OpenAPI generated from `packages/contracts` Zod schemas.

## Alternatives rejected
- **GraphQL** — rejected: a single-tenant-user portal with well-known screens
  gains little; it complicates per-field authorization and makes rate limiting and
  caching harder.
- **tRPC** — rejected: it couples client and server types tightly, which is
  convenient but weakens the published-contract discipline the brief requires,
  and complicates future non-TypeScript consumers.
- **Express/Fastify bare** — rejected: module structure and DI would be
  hand-rolled; NestJS gives the modular boundary the architecture depends on.

## Consequences
- Approval actions are resource sub-actions, not generic RPC (brief §41).
- OpenAPI is a build artifact; drift is a CI failure (FF-18).
