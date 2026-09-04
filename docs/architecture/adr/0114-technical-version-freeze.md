# ADR-0114 — Preserve dependency baseline during repository migration

**Status:** Accepted for migration; expires at GATE-TECH-001

## Context
The VYRA scaffold has an existing lockfile and unimplemented business core. Several ecosystem major versions have advanced.

## Decision
Repository migration changes product/domain authority and namespace but does not silently major-upgrade the runtime stack.

`GATE-TECH-001` explicitly reviews Node, pnpm, Next, React, Nest, TypeScript and security advisories before feature implementation.

## Reason
Migration correctness and framework modernization are separate risk surfaces.
