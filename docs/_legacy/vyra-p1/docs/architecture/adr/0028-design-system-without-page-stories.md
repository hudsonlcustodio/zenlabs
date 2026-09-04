# ADR-0028 — Owned design-system primitives; no Storybook page-stories

**Status**: Accepted · **Authority**: brief §6; orchestration constraint

## Context
The orchestration server reported `ux-storybook-adapter-unsupported`: no explicit
Storybook adapter supports Next.js App Router + Tailwind + shadcn/ui in that
tooling. No canonical VYRA branding material exists in the repository.

## Decision
Build the design system on **project-owned primitives** in `packages/ui`
(shadcn/ui components vendored and owned). **Proceed without Storybook
page-stories.** Component-level visual verification uses the running application
plus targeted component tests.

The stack is **not** changed to accommodate a Storybook adapter, and no
unsupported adapter is invented.

## Alternatives rejected
- **Change the frontend stack to fit an adapter** — rejected: brief §6 fixes the
  stack; tooling must not drive architecture.
- **Invent/force an unsupported adapter** — rejected: would encode a guess.
- **Adopt a full third-party component library** — rejected: produces the generic
  admin appearance the brief rules out.

## Consequences
- Recorded as RISK-05 and GATE-UX01; revisit when adapter support exists.
- Component documentation lives in code and tests rather than a story catalogue.
- No definitive visual identity is invented (ASM-BR01); tokens are placeholders
  until branding is delivered.
