# ADR-0002 — pnpm workspace monorepo

**Status**: Accepted · **Authority**: brief §6

## Context
Frontend, backend, workers and shared contracts must not drift. Contracts are
the main coupling risk.

## Decision
Single repository, **pnpm workspaces**, with `apps/*` and `packages/*` as
specified in `architecture.md` §2. Contracts are a first-class package consumed
by every app.

## Alternatives rejected
- **Polyrepo** — rejected: contract drift between API and web is the exact
  failure this project cannot afford; cross-repo versioning adds toil for one team.
- **npm/yarn workspaces** — rejected: pnpm's strict node_modules layout prevents
  accidental phantom dependencies, which directly supports FF-02.
- **Nx/Turborepo now** — deferred: added build orchestration is not yet justified;
  revisit when CI wall-clock becomes the bottleneck.

## Consequences
- One lockfile, atomic cross-cutting changes.
- Import boundaries must be enforced by tooling, not convention.
