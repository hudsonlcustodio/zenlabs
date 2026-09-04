# ADR-0003 — Frontend: Next.js App Router + Tailwind + shadcn/ui

**Status**: Accepted · **Authority**: brief §6

## Context
Three logical surfaces (Portal, Studio, Control) with premium SaaS finish, not a
generic admin panel. Authorization must be server-side. No canonical branding
exists yet.

## Decision
**Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Lucide**, one
web application hosting all three surfaces behind role-based routing. Charts via
a dedicated charting library chosen at implementation time. Motion used only
where it communicates state.

The design system is built on **project-controlled primitives**: shadcn/ui
components are vendored into `packages/ui` and owned, not consumed as an opaque
dependency.

## Alternatives rejected
- **Three separate applications** — rejected: brief §4 explicitly warns against
  building three systems; they share auth, design system and contracts.
- **SPA + separate API only** — rejected: server components let authorization and
  data access stay server-side, which supports FF-17.
- **A full component library (MUI/AntD)** — rejected: produces the generic admin
  look the brief rules out, and inverts control of the design system.

## Consequences
- Server-side authorization is natural; client-side hiding is never the control.
- Responsiveness and accessibility are architectural requirements from day one.
- No definitive visual identity is invented; branding gap tracked as ASM-BR01.
