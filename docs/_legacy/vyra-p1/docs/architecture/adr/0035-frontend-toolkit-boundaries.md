# ADR-0035 — Frontend toolkit: sanctioned libraries and their boundaries

**Status**: Accepted · **Authority**: brief §6; `docs/product/VYRA_PRODUCT_EXPERIENCE.md`
· **Supersedes**: the "charting library chosen at implementation time" clause of
ADR-0003 and the assumptions `ASM-P15-01` / `OQ-P15-02` that depended on it.

## Context

ADR-0003 fixed **Next.js App Router + TypeScript + Tailwind + shadcn/ui +
Lucide** and deliberately left the charting library open. ADR-0028 removed
Storybook and made `packages/ui` a project-owned design system.

`VYRA_PRODUCT_EXPERIENCE.md` now specifies interaction surfaces that plain
primitives cannot deliver honestly: analytics with gap-preserving series, dense
cross-tenant grids with pinning, selection and virtualisation, a constrained
rich script editor, drag-based pipeline and calendar scheduling, and orchestrated
motion. Building each of those from scratch is not restraint, it is cost with no
architectural return. Adopting a full component framework is the thing brief §6
and ADR-0003 explicitly reject.

The open question is therefore not *whether* to use libraries, but **which ones
and under what boundary**.

## Decision

The canonical stack is unchanged: **Next.js App Router · TypeScript · Tailwind
CSS · shadcn/ui (vendored into `packages/ui`) · Lucide**.

Five additional libraries are sanctioned, each for one named purpose:

| Library | Purpose | Boundary |
|---|---|---|
| **Motion for React** | Orchestrated motion and gesture-driven interaction: drawer, dialog, list reflow, drag affordance | Consumed only inside `packages/ui` motion primitives. Simple state transitions stay CSS. A component never animates the same property with both. |
| **Recharts**, via **shadcn Charts** | Analytics rendering | Wrapped by `packages/ui` chart primitives. No screen imports Recharts. The chart primitive owns the palette, the axis style, the tooltip and the gap semantics. |
| **TanStack Table** (headless) | Complex data grids: sorting, filtering, column control, pinning, selection, virtualisation | Wrapped by `packages/ui` data-grid primitives. Headless only — it contributes no markup and no style. Simple tables use the plain table primitive. |
| **dnd-kit** | Drag-and-drop for pipeline lanes and calendar scheduling | Wrapped by `packages/ui` interaction primitives. Every drag exposes the keyboard equivalent required by the product experience document §26.4. A drag expresses **intent**; the workflow engine decides (FF-06). |
| **Tiptap** | Rich script editing | Wrapped by a `packages/ui` editor primitive over a **VYRA-owned document schema** (product experience §25.2). The schema cannot express visual styling. Portal is read-only. |

### The governing rule

**These libraries are tools. None of them is the VYRA Design System.**

Concretely:

1. Every one is consumed **only** through a `packages/ui` primitive. A screen
   importing one of these packages directly is a boundary violation and is
   caught by the same dependency lint that enforces FF-04.
2. None of them may introduce its own visual language. Their default stylesheets
   are either not imported or fully overridden by VYRA tokens.
3. Replacing any one of them must be a change inside `packages/ui` and nowhere
   else. That is the test of whether the boundary is real.
4. Every one must degrade correctly under `prefers-reduced-motion` and must not
   remove keyboard operability.

## Alternatives rejected

- **MUI, Ant Design, Chakra, Mantine or any full component framework** —
  rejected for the third time in this repository (ADR-0003, ADR-0028, here).
  They produce the generic administrative appearance brief §6 rules out and they
  invert control of the design system. This rejection is not revisitable within
  the MVP.
- **Building charts, grids, drag and rich text from scratch** — rejected: it
  spends a large amount of engineering on solved problems and would in practice
  produce *worse* accessibility than the sanctioned headless libraries, which
  ship tested keyboard and ARIA behaviour.
- **Chart.js / Victory / visx instead of Recharts** — rejected: shadcn Charts is
  already the idiom of the vendored primitive set, so Recharts arrives with the
  wrapper layer we would otherwise write ourselves.
- **AG Grid** — rejected: heavyweight, opinionated visually, and licence-encumbered
  for the features we would want.
- **Framer Motion's layout engine for everything** — rejected as a default:
  CSS transitions are cheaper and sufficient for the majority of state changes.
  Motion is used where orchestration or gesture actually exists.
- **A decorative dependency of any kind** (icon packs beyond Lucide, animation
  presets, illustration sets, particle or 3D libraries, additional font
  services) — rejected. If a dependency's only contribution is decoration, it is
  refused.

## Consequences

- `OQ-P15-02` and `ASM-P15-01` are closed: the charting library is Recharts.
- `packages/ui` gains five wrapper families; its dependency list grows and is
  asserted by the package graph snapshot from `P1.02`, so an unwrapped import
  fails CI.
- The design system remains ours. A library upgrade cannot restyle the product.
- Bundle cost is real and is budgeted: the editor, grid and chart primitives are
  dynamically imported at the route level so a Portal user never downloads the
  Studio script editor.
- `ADR-0028` is unaffected: verification remains targeted component tests plus
  the running application, now joined by the conformance suite in the product
  experience document §23.6 and §34.
