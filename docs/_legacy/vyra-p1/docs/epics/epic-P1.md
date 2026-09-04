---
id: P1
title: "Foundation — monorepo, boundaries, CI"
status: generated
---

# Epic P1 — Foundation — monorepo, boundaries, CI

- **Epic ID**: `P1`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 0
- **Status**: `generated`
- **Wave**: 1
- **Priority**: P0
- **Depends on**: —
- **Blocks**: `P2`, `P4`, `P16`, `P17`, `P18`
- **Story points (epic total)**: 52
- **Stories**: 10
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Establish the executable substrate on which every later epic is verified. No product behaviour ships here; what ships is the ability to reject non-conforming code automatically.

**Goals**
- G1 Monorepo skeleton with the package set fixed by `architecture.md` §2.2.
- G2 Boundary rules encoded as lint so `architecture.md` §4.1 is enforced, not merely documented.
- G3 `packages/contracts` and `packages/config` exist as the only zero-I/O roots.
- G4 CI pipeline stages 1-5 green on an application-free repository.
- G5 Secret scanning blocking on every pipeline run.
- G6 The five processes fixed by `architecture.md` §2.1 exist as bootstrapped shells, so that no later epic has to invent a process. `apps/api` materialises ADR-0004 (`P1.08`); the three workers materialise the remaining §2.1 rows (`P1.09`); `apps/web` is filled in P15.
- G7 The published OpenAPI document is generated from code and diffed in CI from the first commit, so FF-18 can never accumulate an unpayable drift (`P1.10`).

**Non-goals**
- NG1 No domain module, no database, no provider adapter (P2 / P4).
- NG2 No AWS resource provisioning beyond what CI itself needs. Provisioning and the deploy path are epic `P17`.
- NG3 No UI primitives; `packages/ui` is scaffolded empty and filled by epic `P18`.
- NG4 No product route. `apps/api` ships a health route only; every functional route belongs to the epic that owns its module.
- NG5 No queue consumption. `P1.09` creates worker shells; the harness, tenant context and consumption are `P7.04`.

**Acceptance evidence**
- AE1 `pnpm lint typecheck test` green with zero application code.
- AE2 A deliberately introduced dependency cycle turns FF-04 red in CI.
- AE3 A deliberately committed fake secret turns FF-19 red in CI.
- AE4 All five `architecture.md` §2.1 processes boot and shut down cleanly in CI with zero product behaviour.
- AE5 A route response schema edited without regenerating the specification turns FF-18 red naming the route.

**Assumptions**
- ASM-P1-01 pnpm workspaces is the workspace manager implied by ADR-0002. [TBD - confirm in P1.01]

---

## Architecture Spec Summary

**Affected surfaces**: Repository root, `packages/*`, all five `apps/*` processes, `docs/api/openapi.yaml`, CI configuration.

**Integration points**: None external. CI is the only consumer of this epic's output.

**Risks**
- Boundary lint added after modules exist turns violations into debt that is never paid; this epic is first precisely to prevent that.
- Agent-executed implementation without machine-checkable boundaries. This is the stated rationale for the epic and carries **no `RISK-*` id**; `risks.md` §1 registers no such risk. (An earlier revision cited `RISK-19` here, which is *"ingestion failure leaves a committed generation with no VYRA-side asset"* and belongs to `P16.01`/`P16.03`, not to `P1`.)

**References (by path)**
- `docs/architecture/architecture.md` §2.2, §4.1, §4.2
- `docs/architecture/fitness-functions.md` FF-04, FF-19
- `docs/architecture/cicd.md`
- `docs/architecture/adr/0001-modular-monolith.md`
- `docs/architecture/adr/0002-monorepo.md`

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | [N/A] | No route ships in P1. |
| DB | [N/A] | Schema begins in P2. |
| UI | [N/A] | `packages/ui` scaffolded empty only. |
| Env/Config | `packages/config` environment schema skeleton; `PROVIDER_MODE` key reserved | Typed loading, fail-fast on missing keys; populated in P4. Secret resolution is `P4.11`. |
| Event | [N/A] | Domain events begin in P8. |
| Build | `packages/contracts` export surface; per-module `allowedDependencies` manifest; `docs/api/openapi.yaml` generated artifact; per-worker queue manifest | Consumed by FF-04 (manifest), FF-18 (spec), `P7.04` and `P17.06` (queue manifest). |

---

## ADR / NFR Notes

- Governed by ADR-0001 (modular monolith) and ADR-0002 (monorepo). ADR-0004 (NestJS + REST + OpenAPI) and ADR-0032 (REST API style) are materialised here by `P1.08` and `P1.10`; before this revision no story owned either. No new ADR expected; escalate tooling disputes to an ADR rather than deciding inside a story.
- NFR-12 (environment isolation) is *prepared* here - the config schema must make a shared credential across environments inexpressible - but is only fully verifiable once real resources exist (epic P16).
- NFR-13 (CI never spends provider credit) is structurally satisfied while no provider exists; enforced by FF-08 in P4.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| seq Phase 0 scope | workspace layout | `P1.01` | AC-1..4 | `pnpm -r typecheck` | - |
| `architecture.md` §2.2 | package set | `P1.02` | AC-1..3 | package graph snapshot | - |
| `architecture.md` §4.1 / FF-04 | `allowedDependencies` manifest | `P1.03` | AC-1..5 | FF-04 in CI | - |
| `architecture.md` §4.2 | layering rule | `P1.03` | AC-3 | lint rule unit test | - |
| contracts root | Zod + error-code surface | `P1.04` | AC-1..4 | unit + export snapshot | - |
| config root / NFR-12 | env schema | `P1.05` | AC-1..4 | fail-fast boot test | - |
| `cicd.md` stages 1-5 | pipeline definition | `P1.06` | AC-1..5 | green pipeline | - |
| FF-19 | secret scanning | `P1.07` | AC-1..3 | seeded-secret test | - |
| ADR-0004 / `architecture.md` §2.1 | `apps/api` bootstrap | `P1.08` | AC-1..6 | boot + pipeline tests | closes G-01 (a) |
| `architecture.md` §2.1 / `aws-topology.md` §6 | three worker processes + queue manifest | `P1.09` | AC-1..6 | boot + shutdown + manifest assertion | closes G-01 (b) |
| FF-18 / ADR-0032 | OpenAPI generate-and-diff | `P1.10` | AC-1..6 | FF-18 in CI | closes G-01 (c) |

**BDD example IDs**
- EX-P1-01 GIVEN a package importing another package that imports it back, WHEN CI runs, THEN FF-04 fails naming both edges.
- EX-P1-02 GIVEN a file containing a fake AWS-shaped key, WHEN CI runs, THEN FF-19 fails before any other stage.
- EX-P1-03 GIVEN a required environment key is absent, WHEN a process boots, THEN it exits non-zero rather than warning.
- EX-P1-04 GIVEN a required environment key is absent, WHEN `apps/api` boots, THEN it exits non-zero before binding a port.
- EX-P1-05 GIVEN a request without `X-Correlation-Id`, WHEN it reaches any route, THEN a correlation id is generated and echoed.
- EX-P1-06 GIVEN a handler throws an unmapped error, WHEN the response is rendered, THEN it is `application/problem+json` with a stable `code`.
- EX-P1-07 GIVEN a worker receives `SIGTERM` while idle, WHEN it shuts down, THEN it exits zero within the configured drain bound.
- EX-P1-08 GIVEN a worker manifest names a queue absent from `aws-topology.md` §6, WHEN CI runs, THEN the manifest assertion fails naming the queue.
- EX-P1-09 GIVEN a route response schema changes without regeneration, WHEN CI runs, THEN FF-18 fails naming the route.
- EX-P1-10 GIVEN a new stable error code is added to `packages/contracts`, WHEN the spec is regenerated, THEN the problem-details enum contains it.
- EX-P1-11 GIVEN a client-facing route declares a `tenantId` parameter, WHEN the convention check runs, THEN it fails citing `api-contracts.md` §1.

**Open questions**
- OQ-P1-01 Workspace tool (pnpm assumed) and task runner - resolve in P1.01.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 11/11 mapped; contracts 4/4 actionable entries mapped; examples 11/11 mapped to validations; unresolved gap codes: none. Gap `G-01` is closed here in three parts (`P1.08`, `P1.09`, `P1.10`).

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P1.01` | Monorepo skeleton and workspace tooling | 5 | — | P0 |
| `P1.02` | Package scaffolding per architecture §2.2 | 3 | `P1.01` | P0 |
| `P1.03` | Boundary lint rules and FF-04 dependency-graph check | 8 | `P1.02` | P0 |
| `P1.04` | packages/contracts foundation (Zod, DTOs, error codes) | 5 | `P1.02` | P0 |
| `P1.05` | packages/config typed environment loading | 5 | `P1.04` | P0 |
| `P1.06` | CI pipeline stages 1-5 | 5 | `P1.03` | P0 |
| `P1.07` | Secret scanning and FF-19 | 3 | `P1.06` | P0 |
| `P1.08` | `apps/api` NestJS bootstrap per ADR-0004 | 8 | `P1.05` | P0 |
| `P1.09` | Worker process bootstraps: `worker-ai`, `worker-media`, `worker-social` | 5 | `P1.05` | P0 |
| `P1.10` | OpenAPI generation and the FF-18 generate-and-diff check | 5 | `P1.08` | P0 |

**Verification gate (epic exit)**: FF-04, FF-18 and FF-19 pass in CI; `pnpm lint typecheck test` green; all five `architecture.md` §2.1 processes boot and shut down cleanly with no product behaviour; `docs/api/openapi.yaml` regenerates byte-identically from a clean checkout; the seeded-divergence, seeded-cycle and seeded-secret tests each turn their own check red.
