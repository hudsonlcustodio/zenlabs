---
id: P18
title: "VYRA Design System foundation"
status: generated
depends_on: [P1]
---

# Epic P18 — VYRA Design System foundation

- **Epic ID**: `P18`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 14 (Surfaces), **extracted forward**: the design system's only real dependency is the repository, not the domain
- **Status**: `generated`
- **Wave**: 2
- **Priority**: P0
- **Depends on**: `P1`
- **Blocks**: `P15`, `P16`, `P19`, `P20`
- **Story points (epic total)**: 94
- **Stories**: 16
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Build `packages/ui` as the VYRA Design System — the token layer, the primitives, the state vocabulary and the conformance harness that every surface consumes and none re-invents. `ADR-0028` removed Storybook; this epic replaces it with something stronger: a verification harness that makes accessibility, contrast, motion and token discipline machine-checkable.

**Goals**
- G1 A two-layer token system (primitive → semantic) as the single source of every colour, size, space, radius, duration and shadow in the product, bridged into Tailwind so a component can only express sanctioned values (`VYRA_PRODUCT_EXPERIENCE.md` §4).
- G2 The carbon theme as canonical and the light theme as a pure token remap, both passing the same contrast contract (§4.6, §5.5).
- G3 Owned primitives — controls, forms, surfaces, overlays, feedback, states — vendored from shadcn/ui and governed by VYRA tokens, per ADR-0003 and ADR-0028.
- G4 The status language of `workflows-state-machines.md` §2.1 rendered by one component family sourced from one string table, so no screen can paraphrase a state (§21).
- G5 Loading, empty, error and denied as first-class primitives shipped with the design system, not improvised per screen (§18–§20, PD-09).
- G6 A conformance harness — axe, keyboard, contrast, reduced-motion, screen-reader semantics and token lint — that runs in CI and is the substitute ADR-0028 sanctioned.

**Non-goals**
- NG1 No screen. This epic builds primitives; screens are `P15`, `P21`, `P22`, `P23`.
- NG2 No application shell — the shell is `P20`, which composes these primitives.
- NG3 No library-backed component family — charts, data grids, the script editor, the media player and drag-and-drop are `P19`, which wraps sanctioned libraries per ADR-0035.
- NG4 No third-party component framework, for the third time in this repository (ADR-0003, ADR-0028, ADR-0035).
- NG5 No Storybook page-story (`ADR-0028`, `GATE-UX01`).
- NG6 No decorative dependency: no icon pack beyond Lucide, no illustration set, no animation preset library, no external font host (ADR-0035).

**Acceptance evidence**
- AE1 A component referencing a raw colour, an off-scale spacing value or a primitive token directly fails the token lint naming the file and the value.
- AE2 Every semantic foreground/background pair passes the `VYRA_PRODUCT_EXPERIENCE.md` §5.5 contrast contract in **both** themes, computed without a browser.
- AE3 Every interactive primitive is operable by keyboard, has an accessible name, and shows a visible focus ring on every surface it can be placed on.
- AE4 Under `prefers-reduced-motion`, no animation exceeds 1ms except the sanctioned opacity fades.
- AE5 A state label rendered from anything other than the single status string table fails the string-source test.
- AE6 `git ls-files` shows no Storybook page-story file.

**Assumptions**
- ASM-P18-01 `VYRA_PRODUCT_EXPERIENCE.md` is canonical for every visual and interaction decision in this epic. It supersedes `ASM-BR01`, `RISK-10`, `OQ-P15-01`, `ASM-IA01` and `ASM-P15-02`; this epic implements it and re-decides none of it.
- ASM-P18-02 This epic sits at wave 2 because `packages/ui` depends only on `packages/contracts` (`architecture.md` §2.2). Nothing about a token, a button or a skeleton needs the API, the database or the workflow engine. Building it at wave 2 removes 94 points from the wave-10 surface bottleneck and gives every later surface epic a finished substrate.
- ASM-P18-03 pt-BR is the first authored locale; the string layer is built for two from day one and only pt-BR is authored at MVP (`OQ-PX-01`).

---

## Architecture Spec Summary

**Affected surfaces**: `packages/ui` in full; `packages/contracts` for the status vocabulary and stable error codes it renders.

**Integration points**: None external. This epic makes no network call of any kind — including no font request, which is why the faces are self-hosted.

**Risks**
- A design system built alongside screens becomes a folder of screen fragments. Building it at wave 2, before any screen exists, is the structural defence.
- A token layer that components can bypass is decoration. AE1 is the check that makes it load-bearing.
- RISK-05 / GATE-UX01 remain open and accepted: no Storybook adapter exists for this stack. The conformance harness (`P18.16`) is the sanctioned substitute, and it is stricter than a story catalogue because it fails CI.
- RISK-10 is **closed** by `VYRA_PRODUCT_EXPERIENCE.md`: canonical branding now exists, and `P18.01`/`P18.02` implement it.

**References (by path)**
- `docs/product/VYRA_PRODUCT_EXPERIENCE.md` §1, §4–§21, §23, §34
- `docs/architecture/adr/0003-frontend-stack.md`
- `docs/architecture/adr/0028-design-system-without-page-stories.md`
- `docs/architecture/adr/0035-frontend-toolkit-boundaries.md`
- `docs/architecture/architecture.md` §2.2
- `docs/architecture/api-contracts.md` §1.1
- `docs/architecture/workflows-state-machines.md` §2.1
- `docs/architecture/prd.md` NFR-03, NFR-14
- `docs/architecture/risks.md` RISK-05, RISK-10, GATE-UX01

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | [N/A] | This epic makes no request. |
| DB | [N/A] | — |
| UI | The complete `packages/ui` export surface: tokens, theme, typography, primitives, state components, status components | Consumed by `P15`, `P19`, `P20`, `P21`, `P22`, `P23`. |
| Env/Config | Theme default, density per surface, locale set, reduced-motion override | Configuration, never a constant. |
| Event | [N/A] | — |
| Build | Tailwind preset; token export in CSS and TS; conformance harness commands wired into the `security/static` stage | Consumed by `cicd.md` §1 and by `P24`. |

---

## ADR / NFR Notes

- ADR-0003 is implemented, not amended: Next.js App Router, TypeScript, Tailwind, shadcn/ui vendored and owned, Lucide.
- ADR-0028's consequence — "component documentation lives in code and tests rather than a story catalogue" — is what `P18.16` delivers.
- ADR-0035 draws the boundary this epic must not cross: the five sanctioned libraries are wrapped in `P19`, and `P18` primitives take no dependency on them.
- `NFR-14` makes responsiveness and accessibility architectural. This epic is where that becomes true, which is why `P18.16` is 8 points and not a cleanup task.
- `NFR-03` is served here structurally: self-hosted variable fonts remove a render-blocking third-party request, and the token layer ships as CSS custom properties rather than a runtime theming engine.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| PX §4, §5 | token layer + Tailwind bridge | `P18.01` | AC-1..6 | token lint + export snapshot | closes ASM-BR01 |
| PX §4.6, §5.5 | theme system + contrast contract | `P18.02` | AC-1..5 | contrast test, both themes | - |
| PX §6 | typography + font hosting + i18n strings | `P18.03` | AC-1..5 | metric + string-source tests | OQ-PX-01 |
| PX §7, §8 | spacing, grid, breakpoints, density | `P18.04` | AC-1..5 | scale lint + viewport tests | - |
| PX §9 | radius, border, elevation | `P18.05` | AC-1..4 | elevation snapshot | - |
| PX §10 | motion system + reduced motion | `P18.06` | AC-1..5 | reduced-motion test | - |
| PX §11 | iconography wrappers over Lucide | `P18.07` | AC-1..4 | icon-name + a11y tests | - |
| PX §13.2 | control primitives | `P18.08` | AC-1..6 | keyboard + focus + axe | - |
| PX §13 | form system + error mapping | `P18.09` | AC-1..6 | per-code fixtures | - |
| PX §15 | surface primitives + nesting rule | `P18.10` | AC-1..5 | nesting-depth lint | - |
| PX §16 | overlay primitives | `P18.11` | AC-1..6 | focus-trap + return tests | - |
| PX §17 | feedback primitives + live regions | `P18.12` | AC-1..5 | live-region assertions | - |
| PX §21 / `workflows-state-machines.md` §2.1 | status language components | `P18.13` | AC-1..6 | string-source + shape tests | - |
| PX §18, §19, §20 | loading, empty, error primitives | `P18.14` | AC-1..6 | per-kind, per-scope fixtures | - |
| PX §14 (simple) | table primitive + cursor pagination | `P18.15` | AC-1..5 | semantics + keyboard tests | - |
| PX §23.6, §34 / ADR-0028 | conformance harness | `P18.16` | AC-1..7 | harness green in CI | GATE-UX01 |

**BDD example IDs**
- EX-P18-01 GIVEN a component using a raw hex colour, WHEN the token lint runs, THEN it fails naming the file and the value.
- EX-P18-02 GIVEN the light theme, WHEN the contrast test runs over every semantic pair, THEN every pair meets its §5.5 minimum.
- EX-P18-03 GIVEN `prefers-reduced-motion: reduce`, WHEN any primitive animates, THEN no duration exceeds 1ms except a sanctioned opacity fade.
- EX-P18-04 GIVEN an icon-only button without an accessible name, WHEN the a11y test runs, THEN it fails naming the component.
- EX-P18-05 GIVEN a dialog is opened and closed, WHEN focus is inspected, THEN it returns to the invoking element.
- EX-P18-06 GIVEN a state label rendered from a literal string, WHEN the string-source test runs, THEN it fails naming the component.
- EX-P18-07 GIVEN an RFC 9457 problem response with code `entitlement_exhausted`, WHEN the form renders it, THEN it renders the VYRA sentence, the code chip and the correlation id, and no `detail` text.
- EX-P18-08 GIVEN a card nested three levels deep, WHEN the nesting lint runs, THEN it fails naming the outermost card.
- EX-P18-09 GIVEN a skeleton whose geometry differs from its loaded content, WHEN the geometry test runs, THEN it fails naming the component.

**Open questions**
- OQ-P18-01 The exact set of geometric empty-state marks (§19.2, `OQ-PX-05`) is fixed in `P18.14`; the constraint — token-built, no stock illustration — is already canonical.
- OQ-P18-02 Whether the light theme is a launch commitment is a product decision (`OQ-PX-04`); the token layer and the contrast test cover it either way, so the decision does not block this epic.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 16/16 mapped; contracts 3/3 actionable entries mapped; examples 9/9 mapped to validations; unresolved gap codes: GATE-UX01 (accepted, ADR-0028).

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P18.01` | Design token layer: primitives, semantics and the Tailwind bridge | 8 | — | P0 |
| `P18.02` | Theme system: carbon canonical, light remap, contrast conformance | 5 | `P18.01` | P0 |
| `P18.03` | Typography system, self-hosted variable fonts and the string layer | 5 | `P18.01` | P0 |
| `P18.04` | Spacing, grid, breakpoint and density system | 5 | `P18.01` | P0 |
| `P18.05` | Radius, border and elevation primitives | 3 | `P18.01` | P0 |
| `P18.06` | Motion system and the reduced-motion contract | 5 | `P18.01` | P0 |
| `P18.07` | Iconography layer over Lucide with semantic wrappers | 3 | `P18.01` | P0 |
| `P18.08` | Core control primitives | 8 | `P18.04`, `P18.05`, `P18.06` | P0 |
| `P18.09` | Form system, validation and stable-code error mapping | 8 | `P18.08` | P0 |
| `P18.10` | Surface primitives and the card-nesting rule | 5 | `P18.05` | P0 |
| `P18.11` | Overlay primitives: dialog, drawer, sheet, popover, tooltip | 8 | `P18.08`, `P18.06` | P0 |
| `P18.12` | Feedback primitives: toast, banners and live regions | 5 | `P18.11` | P0 |
| `P18.13` | Status language components and the single string source | 5 | `P18.03`, `P18.07` | P0 |
| `P18.14` | Loading, empty and error state primitives | 8 | `P18.10`, `P18.13` | P0 |
| `P18.15` | Table primitive and cursor pagination controls | 5 | `P18.10`, `P18.14` | P0 |
| `P18.16` | Design-system conformance harness | 8 | `P18.15`, `P18.12` | P0 |

**Verification gate (epic exit)**: the conformance harness is green in the `security/static` stage with all six checks enabled — axe (zero serious/critical), keyboard traversal, contrast in both themes, reduced motion, screen-reader name/role/value snapshots and the token lint; a seeded raw colour, a seeded off-scale spacing value, a seeded literal state label, a seeded unnamed icon-button and a seeded card nested three deep each turn their own check red; every semantic foreground/background pair passes §5.5 in both themes; `git ls-files` shows no Storybook page-story file (ADR-0028); the `packages/ui` dependency set still matches `architecture.md` §2.2 and takes no dependency on any ADR-0035 library.
