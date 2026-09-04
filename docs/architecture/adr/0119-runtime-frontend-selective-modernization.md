# ADR-0119 — Modernização seletiva de runtime/frontend

**Status:** Proposed for `GATE-TECH-FOUNDATION-001`

## Decision
Target:
- Node 24.20.0 LTS
- pnpm 11.24.0
- Next.js 16.3.3
- React / React DOM 19.2.8

Preserve for first vertical slice:
- NestJS 11.2.3
- TypeScript 5.9.3
- Vitest 3.2.7
- Zod 3.25.76
- zod-to-openapi 7.3.4

## Why
Update support lifecycle where value is immediate, but isolate newly released majors that create independent migration risk.
