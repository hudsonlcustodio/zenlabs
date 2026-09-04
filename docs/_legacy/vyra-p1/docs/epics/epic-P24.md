---
id: P24
title: "Experience conformance: responsive, accessibility, motion and state"
status: generated
depends_on: [P21, P22, P23]
---

# Epic P24 — Experience conformance: responsive, accessibility, motion and state

- **Epic ID**: `P24`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 14 (Surfaces), verification half; the substitute ADR-0028 owes the project
- **Status**: `generated`
- **Wave**: 12
- **Priority**: P0
- **Depends on**: `P21`, `P22`, `P23`
- **Blocks**: `P16`
- **Story points (epic total)**: 47
- **Stories**: 7
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Prove, mechanically and across all three surfaces, that the product actually holds the commitments `VYRA_PRODUCT_EXPERIENCE.md` makes. `P18.16` proved it for primitives; this epic proves it for **screens**, which is where the commitments are usually lost.

`NFR-14` makes responsiveness and accessibility architectural. `ADR-0028` removed Storybook and owes the project a substitute. This epic is the second half of that substitute and it is deliberately a gate, not a report.

**Goals**
- G1 Responsive conformance against the per-surface commitment matrix of §22.1, at every breakpoint each surface commits to.
- G2 Keyboard operability and focus-return conformance for every screen, every overlay and every complex interaction — grid, board, calendar, editor, player.
- G3 Screen-reader semantics and axe conformance across all three route groups at the same thresholds as `P18.16`.
- G4 Contrast and theme conformance for composed screens in both themes, extending the token-level proof to real compositions.
- G5 Reduced-motion and motion-budget conformance across every screen.
- G6 Screen performance budgets against `NFR-03`, measured to the first meaningful region.
- G7 A blueprint conformance audit applying the 14-point checklist of §34 to every screen in §31, §32 and §33.

**Non-goals**
- NG1 No new screen, no new primitive, no visual change. A failure found here is fixed in the owning story's epic, not patched here.
- NG2 No Storybook and no visual-regression screenshot suite; `ADR-0028` and `GATE-UX01` stand, and the checks here are assertions rather than image comparisons.
- NG3 No load testing; `P16.09` owns `NFR-01`, `NFR-02` and the staging measurement. This epic measures the **client-side** budget only.
- NG4 No manual audit substituting for an automated one. Every criterion here runs in CI.

**Acceptance evidence**
- AE1 Every screen in §31, §32 and §33 has a recorded result for all 14 criteria of §34, and every result is green.
- AE2 A regression in any criterion on any screen fails CI naming the screen and the criterion.
- AE3 The Portal is fully operable at 320px, keyboard-only, for the complete request → approve → schedule journey.
- AE4 Studio and Control render their designed refusal below `md` and their degraded mode at `md`, both conformance-tested.
- AE5 No screen exceeds the `NFR-03` client budget to first meaningful region.
- AE6 Under `prefers-reduced-motion`, no screen animates beyond the sanctioned opacity fades.

**Assumptions**
- ASM-P24-01 This epic verifies; it does not implement. A defect it finds is fixed in `P21`, `P22`, `P23`, `P20`, `P19` or `P18` — whichever owns the screen or primitive — and this epic's job is to make the defect impossible to ship silently.
- ASM-P24-02 `NFR-03`'s "< 3s for critical screens" is measured client-side here to the **first meaningful region**, consistent with the streaming model of §18.3. The end-to-end measurement against staging remains `P16.09`.
- ASM-P24-03 The screen inventory is derived from the blueprint list in `VYRA_PRODUCT_EXPERIENCE.md` §31–§33, so a screen added without a blueprint fails the inventory reconciliation.

---

## Architecture Spec Summary

**Affected surfaces**: `apps/web` (all three route groups) as subject; the conformance harness in `packages/ui` and `tests/` as instrument.

**Integration points**: None external. Every check runs offline with `PROVIDER_MODE=mock` (`FF-08`).

**Risks**
- A conformance epic scheduled last becomes a conformance epic descoped last. It is `P0`, it blocks `P16`, and every check it contains already exists at primitive level from `P18.16` — so this epic extends coverage rather than inventing a mechanism under time pressure.
- RISK-05 / GATE-UX01 remain accepted and open: no Storybook adapter exists. This epic is the reason that acceptance is defensible.
- A checklist without a machine behind it is a document. AE2 is the difference.

**References (by path)**
- `docs/product/VYRA_PRODUCT_EXPERIENCE.md` §22, §23, §31, §32, §33, §34
- `docs/architecture/adr/0028-design-system-without-page-stories.md`
- `docs/architecture/adr/0003-frontend-stack.md`
- `docs/architecture/testing-strategy.md`
- `docs/architecture/cicd.md` §1
- `docs/architecture/prd.md` NFR-03, NFR-14
- `docs/architecture/risks.md` RISK-05, GATE-UX01

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | [N/A] | Every check runs against fixtures and mocks. |
| DB | [N/A] | — |
| UI | No new component. The screen inventory becomes a machine-readable artifact. | Consumed by CI. |
| Env/Config | Breakpoint matrix, per-screen performance budgets, criterion thresholds | Configuration. |
| Event | [N/A] | — |
| Build | The screen conformance suite wired into `security/static`, blocking | Consumed by `cicd.md` §1 and by the `P16` exit gate. |

---

## ADR / NFR Notes

- ADR-0028's consequence — component documentation and verification live in code and tests — reaches its full form here. `P18.16` covered primitives; `P24` covers compositions, which is where an accessible primitive is most often used inaccessibly.
- `NFR-14` is satisfied by `P24.01`–`P24.05` collectively; no single story satisfies it alone.
- `NFR-03` is satisfied client-side by `P24.06` and end-to-end by `P16.09`.
- `cicd.md` §1 places these checks in `security/static`, which is blocking on the default branch.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| PX §22 / NFR-14 | responsive conformance matrix | `P24.01` | AC-1..6 | per-surface breakpoint suite | - |
| PX §23.3, §23.6.2 / NFR-14 | keyboard and focus-return conformance | `P24.02` | AC-1..6 | traversal + journey suites | - |
| PX §23.2, §23.6.1, §23.6.5 | screen-reader semantics and axe | `P24.03` | AC-1..5 | axe + SR snapshots | - |
| PX §4.6, §5.5, §23.4 | contrast and theme conformance | `P24.04` | AC-1..5 | composed-screen contrast | - |
| PX §10.4, §23.6.4 | reduced motion and motion budget | `P24.05` | AC-1..5 | reduced-motion suite | - |
| PX §18.3 / NFR-03 | screen performance budgets | `P24.06` | AC-1..5 | budget suite | ASM-P24-02 |
| PX §34 / ADR-0028 | blueprint conformance audit | `P24.07` | AC-1..6 | 14-criterion matrix | GATE-UX01 |

**BDD example IDs**
- EX-P24-01 GIVEN the Portal at 320px with keyboard-only input, WHEN a user requests, approves and schedules content, THEN the whole journey completes.
- EX-P24-02 GIVEN any screen, WHEN a focus-return check runs over every overlay it opens, THEN focus returns to the invoking element in every case.
- EX-P24-03 GIVEN any screen in either theme, WHEN the composed-contrast check runs, THEN every foreground/background pair meets its §5.5 minimum.
- EX-P24-04 GIVEN `prefers-reduced-motion`, WHEN any screen renders and transitions, THEN no animation exceeds 1ms except the sanctioned opacity fades.
- EX-P24-05 GIVEN a critical screen, WHEN it loads under the modelled conditions, THEN the first meaningful region paints within the recorded budget.
- EX-P24-06 GIVEN a screen added without a blueprint entry, WHEN the inventory reconciliation runs, THEN it fails naming the screen.
- EX-P24-07 GIVEN a regression in any §34 criterion on any screen, WHEN CI runs, THEN it fails naming the screen and the criterion.

**Open questions**
- OQ-P24-01 The per-screen performance budgets are configuration with recorded initial values derived from `NFR-03`; tightening them is a deliberate change, not a silent one.
- OQ-P24-02 `GATE-UX01` stays open: revisit adopting a component catalogue when adapter support for this stack exists (`ADR-0028`). This epic makes staying without one defensible in the meantime.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories. Every
check runs against fixtures with `PROVIDER_MODE=mock`.

**Trace coverage**: requirements 7/7 mapped; contracts 2/2 actionable entries mapped; examples 7/7 mapped to validations; unresolved gap codes: GATE-UX01 (accepted, ADR-0028).

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P24.01` | Responsive conformance across the per-surface commitment matrix | 8 | — | P0 |
| `P24.02` | Keyboard operability and focus-return conformance | 8 | — | P0 |
| `P24.03` | Screen-reader semantics and axe conformance | 8 | `P24.02` | P0 |
| `P24.04` | Contrast and theme conformance for composed screens | 5 | — | P0 |
| `P24.05` | Reduced-motion and motion-budget conformance | 5 | — | P0 |
| `P24.06` | Screen performance budgets against NFR-03 | 5 | `P24.01` | P0 |
| `P24.07` | Blueprint conformance audit across all screens | 8 | `P24.01`, `P24.02`, `P24.03`, `P24.04`, `P24.05`, `P24.06` | P0 |

**Verification gate (epic exit)**: the screen conformance suite is wired into `security/static` and blocking; every screen in §31, §32 and §33 has a green recorded result for all 14 criteria of §34; the screen inventory reconciles against the blueprint list with zero difference in both directions; the Portal completes request → approve → schedule at 320px keyboard-only; Studio and Control render their `md` degraded mode and sub-`md` refusal, both conformance-tested; no screen exceeds its recorded `NFR-03` client budget; no screen animates beyond the sanctioned fades under `prefers-reduced-motion`; a seeded regression in any criterion on any screen fails CI naming both.
