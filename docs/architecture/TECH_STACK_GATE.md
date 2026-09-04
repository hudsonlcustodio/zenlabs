# TECHNICAL STACK GATE

## Inherited executable baseline from ZIP

- Node: `22.23.2`
- pnpm: `9.15.9`
- Next.js: `15.5.24`
- React: `19.0.8`
- NestJS: `11.2.3`
- TypeScript: `5.9.3`
- Vitest: `3.2.7`

These versions are **migration baseline**, not a claim that they are the best current versions.

## Freshness evidence checked 2026-09-01

Official/current sources observed:
- Node 24 is LTS; Node 22 is also still LTS.
- Next.js 16.3 is stable/current.
- React 19.2.x is current.
- NestJS 12.0.1 was published only days before this foundation.
- pnpm 12 is stable but is a recent Rust rewrite; pnpm 11 is also mature/current.
- TypeScript 7 is current.

## Decision for REPO-MIGRATION
Do not combine domain migration with major framework migration.

## GATE-TECH-001 must decide explicitly
Options to compare:
1. Preserve exact baseline for first vertical slice.
2. Upgrade Node/Next/React but retain Nest 11.
3. Full current-major modernization.

Evaluate:
- security advisories;
- compatibility;
- migration surface;
- CI time;
- ecosystem stability;
- team familiarity.

No production feature branch begins until the selected option has install/lint/typecheck/test/build evidence.
