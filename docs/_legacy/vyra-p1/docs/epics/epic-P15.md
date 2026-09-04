---
id: P15
title: "Surfaces: Portal, Studio and Control"
status: generated
depends_on: [P3, P5, P6, P7, P8, P9, P10, P11, P12, P13, P14, P18, P19, P20]
---

# Epic P15 — Surfaces: Portal, Studio and Control

- **Epic ID**: `P15`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 14
- **Status**: `generated`
- **Wave**: 10
- **Priority**: P0
- **Depends on**: `P3`, `P5`, `P6`, `P7`, `P8`, `P9`, `P10`, `P11`, `P12`, `P13`, `P14`, `P18`, `P19`, `P20`
- **Blocks**: `P16`, `P21`, `P22`, `P23`
- **Story points (epic total)**: 122
- **Stories**: 22
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Render the three logical surfaces of `prd.md` §5 as one authorized web application, so that every screen is a view over a server-enforced permission rather than a place where permissions are decided.

**Scope boundary with `P18`–`P24`.** This epic owns **route, authorization and data binding**. The design system is `P18`, the library-backed component families are `P19`, the shell is `P20`, and the surface **experience** — hierarchy, interaction depth, media, approvals, onboarding, state coverage — is `P21` (Portal), `P22` (Studio) and `P23` (Control), verified product-wide by `P24`. Neither side re-implements the other, and each epic's non-goals state the boundary from its own direction.

**Goals**
- G1 `apps/web` consumes the `P18` design system: theme wiring, per-surface density, font loading and the token→Tailwind bridge, so no surface invents a visual decision (ADR-0003, ADR-0028, ADR-0035, NFR-14).
- G2 One Next.js App Router application hosting Portal, Studio and Control behind role-based routing, rendered into the `P20` shell (ADR-0003).
- G3 Every screen contracted in `api-contracts.md` §3, §4 and §5 rendered and bound, against the blueprints fixed in `VYRA_PRODUCT_EXPERIENCE.md` §31–§33.
- G4 Screen-level rendering rules derived from the P3.07 route manifest, so a hidden control and a denied route can never disagree.
- G5 FF-17 green for every rendered route, not only for `apps/api` routes.

**Non-goals**
- NG1 No Storybook page-stories; ADR-0028 rejects them for this stack and records the acceptance as RISK-05 / GATE-UX01. The sanctioned substitute is built in `P18.16` and `P24.07`.
- NG2 No design-system primitive is built here. Tokens, primitives, motion, iconography and the state components are `P18`; charts, grids, the editor, the player and drag are `P19`.
- NG3 No third-party component framework adopted wholesale; shadcn/ui is vendored and owned (ADR-0003), and the five sanctioned libraries are bounded by ADR-0035.
- NG4 No new API resource; this epic consumes the contracts fixed in `api-contracts.md` and adds none.
- NG5 No client-side authorization; `api-contracts.md` §2 makes UI hiding a presentation concern only.
- NG6 No shell. The topbar, rail, command palette, notification centre and global surfaces are `P20`; this epic renders route groups **into** that shell.
- NG7 No surface experience depth. Interaction, media, approval, onboarding, calendar and state coverage are `P21`/`P22`/`P23`.

**Acceptance evidence**
- AE1 A rendered route added without a guard declaration turns FF-17 red, naming the route.
- AE2 Calling a route directly, bypassing the screen that hides its control, is denied server-side.
- AE3 Opening the performance screen makes zero provider calls (FF-16, FR-PF05).

**Assumptions**
- ASM-P15-01 **Superseded by ADR-0035.** The charting library is Recharts via shadcn Charts, wrapped in `packages/ui` by `P19.01`. `OQ-P15-02` is closed.
- ASM-P15-02 **Superseded by `VYRA_PRODUCT_EXPERIENCE.md` §31–§33**, which fixes screen composition as canonical blueprints rather than derived seeds. `ASM-IA01` and `OQ-P15-03` are closed with it.
- ASM-P15-03 **Superseded.** The wave-9 co-scheduling of `P15` and `P14` created a story-level dependency (`P15.10`, `P15.16` → `P14`) inside a single wave, which the wave rule forbids. `P15` now sits at wave 10 and every dependency it declares is strictly earlier. Audit tension §13.1 is resolved as **option B**, and the ten epic-level edges its header previously omitted are now declared.
- ASM-P15-04 `ASM-BR01` and `RISK-10` are closed by `VYRA_PRODUCT_EXPERIENCE.md`: canonical branding now exists and `P18.01`/`P18.02` implement it. `OQ-P15-01` is closed with them.

---

## Architecture Spec Summary

**Affected surfaces**: `packages/ui`, `apps/web` (Portal, Studio and Control route groups), the P3.07 route manifest, `tests/authz/`.

**Integration points**: None external. Media delivery uses CloudFront signed URLs issued by the API (`security-architecture.md` §6); no surface calls a provider directly.

**Risks**
- Authorization expressed only in the rendered tree passes a demo and fails a breach. `api-contracts.md` §2 and FF-17 make the server the sole control, and P15.20 and P15.22 are the mechanical checks.
- RISK-05 / GATE-UX01: no Storybook adapter exists for this stack, so the usual component catalogue is absent. ADR-0028 sanctions targeted component tests plus the running application as the substitute; nothing else may be invented.
- RISK-10 / ASM-BR01 are **closed**: `docs/product/VYRA_PRODUCT_EXPERIENCE.md` is now the canonical visual system, implemented by `P18`. Inventing a visual decision outside that document is what remains forbidden.
- A dashboard that fetches on open would breach FR-PF05 and FF-16; the performance screens read snapshots only (`performance.md` §4).

**References (by path)**
- `docs/product/VYRA_PRODUCT_EXPERIENCE.md` §31, §32, §33, §34
- `docs/architecture/adr/0035-frontend-toolkit-boundaries.md`
- `docs/architecture/prd.md` §5.1, §5.2, §5.3, §7, NFR-03, NFR-14
- `docs/architecture/adr/0003-frontend-stack.md`
- `docs/architecture/adr/0028-design-system-without-page-stories.md`
- `docs/architecture/api-contracts.md` §2, §3, §4, §5
- `docs/architecture/fitness-functions.md` FF-16, FF-17
- `docs/architecture/security-architecture.md` §2, §6
- `docs/architecture/risks.md` RISK-05, RISK-10, GATE-UX01

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | Portal, Studio and Control routes consumed as already contracted; no new resource | `api-contracts.md` §3, §4, §5 |
| DB | [N/A] | Surfaces read through module application services; no table is added. |
| UI | Route-group compositions binding contracted routes to `P18`/`P19`/`P20` components, per the blueprints in `VYRA_PRODUCT_EXPERIENCE.md` §31–§33 | ADR-0003 (owned primitives), ADR-0028 (no page-stories), ADR-0035 (toolkit boundaries) |
| Env/Config | Signed-URL TTL, per-surface density, breakpoint set | Configuration per `security-architecture.md` §6; the visual system is `P18` |
| Event | [N/A] | Surfaces emit no domain event. |
| Build | Rendered-route entries in the P3.07 manifest, consumed by FF-17 | `fitness-functions.md` FF-17; P3.07 AC-3 already reserves `apps/web` |

---

## ADR / NFR Notes

- ADR-0003 fixes one application hosting three logical surfaces; three separate applications are rejected there explicitly.
- ADR-0028 forbids Storybook page-stories for this stack and names the sanctioned verification: targeted component tests plus the running application.
- ADR-0035 closes the charting question ADR-0003 left open and bounds the five sanctioned libraries; every one is consumed through `packages/ui` and never imported by a screen.
- NFR-14 makes responsiveness and accessibility architectural rather than later polish. `P15.21` asserts it for the routes **this** epic renders; the product-wide conformance suite across all three surfaces is `P24`.
- NFR-03 sets critical screen load below 3 s; `scalability-gates.md` §1 treats ≥ 3 s as an investigation trigger, and the measurement itself is executed in P16.09.
- `api-contracts.md` §1 fixes cursor pagination and RFC 9457 problem responses; screens render the stable `code` values from §1.1 rather than provider or vendor text.
- `api-contracts.md` §2 returns `404` rather than `403` on an object-scope mismatch; screens must not disclose existence by rendering a distinguishable state.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| ADR-0003 / ADR-0035 / `P18` | design-system integration in `apps/web` | `P15.01` | AC-1..5 | integration + token lint | - |
| ADR-0003 / `prd.md` §5 | one app, three surfaces | `P15.02` | AC-1..4 | class 6 + integration | - |
| `security-architecture.md` §1, §1.1 | auth screens | `P15.03` | AC-1..4 | class 13 + class 6 | - |
| `prd.md` FR-P01 | Portal dashboard | `P15.04` | AC-1..4 | integration | - |
| `prd.md` FR-P02 / `api-contracts.md` §3.1 | request submission screen | `P15.05` | AC-1..4 | class 3 + integration | - |
| `prd.md` FR-P04 / T05, T06 | script approval screen | `P15.06` | AC-1..4 | class 3 + class 6 | - |
| `prd.md` FR-P05 / T15, T16 | video approval screen | `P15.07` | AC-1..4 | class 3 + class 6 | - |
| `prd.md` FR-P03, FR-P06 / `api-contracts.md` §3.3 | tracking + calendar screens | `P15.08` | AC-1..4 | integration | - |
| `prd.md` FR-P07 / `api-contracts.md` §3.4 | library screen | `P15.09` | AC-1..4 | integration + class 13 | - |
| `prd.md` FR-P08, FR-PF05 / FF-16 | performance screen | `P15.10` | AC-1..4 | FF-16 in CI | - |
| `prd.md` FR-P09, FR-P10, FR-P11 | plan, twin and consent screens | `P15.11` | AC-1..5 | integration | - |
| `prd.md` FR-S03 / `knowledge-engine.md` §4 | Studio knowledge + trace screen | `P15.12` | AC-1..4 | integration | - |
| `prd.md` FR-S04, FR-S05 / `api-contracts.md` §4 | Studio generation + identity screens | `P15.13` | AC-1..5 | class 6 + integration | - |
| `prd.md` FR-S06 / T13, T14 | Studio QA screen | `P15.14` | AC-1..4 | class 6 + class 5 | - |
| `prd.md` FR-S01, FR-S02, FR-S07 | Studio client + script screens | `P15.15` | AC-1..4 | class 6 + integration | - |
| `prd.md` FR-S08, FR-S09 | Studio publishing + cross-tenant performance | `P15.16` | AC-1..4 | class 6 + FF-16 | - |
| `prd.md` FR-C03, FR-C04, FR-C05 | Control commercial screens | `P15.17` | AC-1..5 | class 6 + integration | - |
| `prd.md` FR-C06, FR-C07 | Control provider health + audit screens | `P15.18` | AC-1..4 | class 6 + integration | - |
| `prd.md` FR-C01, FR-C02, FR-C08, FR-C09 | Control administration screens | `P15.19` | AC-1..4 | class 6 + FF-23 | - |
| FF-17 / P3.07 manifest | screen-level rendering rules | `P15.20` | AC-1..4 | class 6 + integration | - |
| NFR-14 / NFR-03 | responsiveness + accessibility | `P15.21` | AC-1..4 | component + a11y suite | - |
| FF-17 | rendered-route conformance | `P15.22` | AC-1..3 | FF-17 in CI | - |

**BDD example IDs**
- EX-P15-01 GIVEN a `QA_REVIEWER` session, WHEN a Control screen route is requested, THEN the server denies it rather than rendering a filtered view.
- EX-P15-02 GIVEN a screen that hides an action for a role, WHEN the underlying route is called directly, THEN the server denies it.
- EX-P15-03 GIVEN a rejection submitted without a reason, WHEN the approval screen posts it, THEN the API refuses it and the screen renders the stable `validation_failed` code.
- EX-P15-04 GIVEN the performance screen is opened, WHEN it renders, THEN zero provider calls are recorded against the mock.
- EX-P15-05 GIVEN a media asset in the library, WHEN it is viewed, THEN delivery uses a short-TTL signed URL and never a public object.
- EX-P15-06 GIVEN a rendered route added without a guard declaration, WHEN CI runs, THEN FF-17 fails naming the route.
- EX-P15-07 GIVEN the smallest supported breakpoint, WHEN a critical screen renders, THEN it stays operable and the accessibility assertions pass.
- EX-P15-08 GIVEN a revoked Digital Twin, WHEN the twin-status screen renders, THEN it reports `revoked` and exposes no generation action.
- EX-P15-09 GIVEN a content item owned by another tenant, WHEN its identifier is requested from a Portal screen, THEN the response is `404` and the screen renders a not-found state indistinguishable from a nonexistent item.

**Open questions**
- OQ-P15-01 **Closed** by `VYRA_PRODUCT_EXPERIENCE.md` §4–§11: the visual system is canonical and is implemented by `P18`.
- OQ-P15-02 **Closed** by ADR-0035: the charting library is Recharts via shadcn Charts, wrapped by `P19.01`.
- OQ-P15-03 **Closed** by `VYRA_PRODUCT_EXPERIENCE.md` §31–§33: screen composition is now fixed as canonical blueprints. The contracted routes it consumes remain unchanged.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 22/22 mapped; contracts 4/4 actionable entries mapped; examples 9/9 mapped to validations; unresolved gap codes: GATE-UX01 (accepted, ADR-0028).

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P15.01` | Design-system integration and per-surface theming in `apps/web` | 5 | `P18.16` | P0 |
| `P15.02` | Route groups and role-based surface routing in the `P20` shell | 8 | `P15.01`, `P20.02` | P0 |
| `P15.03` | Authentication, MFA and session screens | 5 | `P15.02`, `P3.03` | P0 |
| `P15.04` | Portal dashboard | 5 | `P15.03` | P0 |
| `P15.05` | Portal content request submission | 5 | `P15.04`, `P8.01` | P0 |
| `P15.06` | Portal script approval screen | 5 | `P15.04`, `P12.03` | P0 |
| `P15.07` | Portal video approval screen | 5 | `P15.06`, `P12.03` | P0 |
| `P15.08` | Portal content tracking and editorial calendar | 5 | `P15.04`, `P13` | P0 |
| `P15.09` | Portal library and signed media delivery | 5 | `P15.04`, `P11.07` | P0 |
| `P15.10` | Portal performance screen reading snapshots only | 5 | `P15.04`, `P14` | P1 |
| `P15.11` | Portal plan, consumption, Twin status and consent capture | 8 | `P15.04`, `P5.01`, `P6.01` | P0 |
| `P15.12` | Studio knowledge screen with retrieval-trace view | 5 | `P15.02`, `P9.08` | P1 |
| `P15.13` | Studio generation, queue and identity-asset screens | 8 | `P15.02`, `P7.07`, `P11.06` | P0 |
| `P15.14` | Studio QA screen | 5 | `P15.02`, `P12.02` | P0 |
| `P15.15` | Studio client, request and script management screens | 5 | `P15.13` | P1 |
| `P15.16` | Studio calendar, publishing and cross-tenant performance screens | 5 | `P15.13`, `P13`, `P14` | P1 |
| `P15.17` | Control plans, subscription, usage and contribution screens | 8 | `P15.02`, `P6.05`, `P10.07` | P0 |
| `P15.18` | Control provider health, balance and audit screens | 5 | `P15.02`, `P5.09` | P0 |
| `P15.19` | Control tenants, users, roles, integrations and status screens | 5 | `P15.02`, `P3.06` | P0 |
| `P15.20` | Screen-level rendering rules driven by the route manifest | 5 | `P15.02`, `P3.07` | P0 |
| `P15.21` | Responsiveness and accessibility conformance for rendered routes | 5 | `P15.19` | P0 |
| `P15.22` | FF-17 conformance for every rendered route | 5 | `P15.20`, `P15.21` | P0 |

**Verification gate (epic exit)**: `pnpm fitness` green with FF-17 enumerating every rendered `apps/web` route as well as every `apps/api` route; the class 6 authorization matrix green for rendered routes; a seeded unguarded rendered route turns FF-17 red naming it; FF-16 green with the performance screens making zero provider calls; the accessibility and breakpoint suite green; `git ls-files` shows no Storybook page-story file, per ADR-0028.
