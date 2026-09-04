---
id: P19
title: "Experience component families: charts, grids, editor, media and drag"
status: generated
depends_on: [P18]
---

# Epic P19 — Experience component families: charts, grids, editor, media and drag

- **Epic ID**: `P19`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 14 (Surfaces), **extracted forward** with `P18`
- **Status**: `generated`
- **Wave**: 3
- **Priority**: P0
- **Depends on**: `P18`
- **Blocks**: `P15`, `P16`, `P20`
- **Story points (epic total)**: 60
- **Stories**: 9
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Wrap the five libraries sanctioned by `ADR-0035` into `packages/ui` primitives that speak only VYRA tokens, so that analytics, dense grids, the script editor, media playback and drag-based scheduling arrive as design-system components rather than as five foreign visual languages inside our product.

**Goals**
- G1 Chart primitives over shadcn Charts + Recharts, owning the palette, the axis style, the tooltip and — the part that matters most — the **gap semantics** that `performance.md` §5 requires (`VYRA_PRODUCT_EXPERIENCE.md` §12).
- G2 Data-grid primitives over headless TanStack Table with sorting, filtering, column control, pinning, selection, virtualisation and cursor pagination (§14).
- G3 A media player primitive that delivers only through short-TTL signed URLs, carries a non-suppressible AI disclosure, and is fully keyboard-operable (§24, `FF-15`, `security-architecture.md` §6).
- G4 A script editor primitive over Tiptap constrained by a **VYRA-owned document schema** that cannot express visual styling (§25.2).
- G5 Drag-and-drop primitives over dnd-kit where every drag expresses **intent** and has a keyboard equivalent (§26.3, §26.4, `FF-06`).
- G6 Calendar primitives with explicit timezone rendering (§27).
- G7 The ADR-0035 boundary made real: replacing any of the five libraries is a change inside `packages/ui` and nowhere else.

**Non-goals**
- NG1 No screen, no route, no data fetch. These are primitives with props.
- NG2 No provider call and no API call from any primitive. The media primitive receives a signed URL; it never mints one.
- NG3 No authorization decision. A drag primitive renders permitted targets from a prop; the server decides (`FF-17`, `FF-06`).
- NG4 No library's default stylesheet. Each is either not imported or fully overridden by VYRA tokens (ADR-0035).
- NG5 No sixth library, and no decorative dependency.

**Acceptance evidence**
- AE1 A screen importing Recharts, TanStack Table, dnd-kit, Tiptap or Motion directly fails the boundary lint naming the file.
- AE2 A performance series with a missing bucket renders a **discontinuity**, never a zero and never an interpolation.
- AE3 Every drag interaction completes end-to-end using only the keyboard, with each step announced.
- AE4 The script editor's schema cannot express a font, a colour, a size, a table, an image or arbitrary HTML — attempting it is a schema rejection, not a style override.
- AE5 The media primitive refuses to render a bucket URL and refreshes an expired signed URL transparently.
- AE6 Every primitive in this epic passes the `P18.16` conformance harness with the same thresholds as a `P18` primitive.

**Assumptions**
- ASM-P19-01 `ADR-0035` is canonical for library selection. This epic implements the boundary it draws and selects nothing further.
- ASM-P19-02 These primitives are route-level dynamic imports, so a Portal user never downloads the Studio script editor (ADR-0035 consequences).
- ASM-P19-03 This epic sits at wave 3 because it depends only on `P18`. Every library here is presentational; none needs the API, the database or the workflow engine.

---

## Architecture Spec Summary

**Affected surfaces**: `packages/ui` — chart, grid, media, editor, interaction and calendar primitive families.

**Integration points**: None external at build or runtime. The media primitive consumes a signed URL string; the URL is issued by the API (`P11.07`, `P15.09`).

**Risks**
- A wrapper that leaks its library's props is not a boundary. Each family exposes a VYRA-shaped API and the boundary lint proves screens cannot reach past it.
- A chart that renders a missing metric as zero is a lie with a chart around it. `performance.md` §5 and `P14.05` make gaps a first-class outcome; AE2 is the check.
- Drag-and-drop without keyboard equivalence excludes users and fails `NFR-14`. AE3 makes it a gate, not a nice-to-have.
- Bundle weight is the real cost of this epic; ASM-P19-02 and a per-route budget in `P24.06` are the controls.

**References (by path)**
- `docs/product/VYRA_PRODUCT_EXPERIENCE.md` §12, §14, §24, §25, §26, §27
- `docs/architecture/adr/0035-frontend-toolkit-boundaries.md`
- `docs/architecture/adr/0003-frontend-stack.md`
- `docs/architecture/adr/0028-design-system-without-page-stories.md`
- `docs/architecture/performance.md` §4, §5
- `docs/architecture/security-architecture.md` §6
- `docs/architecture/fitness-functions.md` FF-06, FF-15, FF-16, FF-21
- `docs/architecture/prd.md` NFR-03, NFR-14

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | [N/A] | No primitive makes a request. |
| DB | [N/A] | — |
| UI | Chart, data-grid, media, editor, interaction and calendar primitive families | Consumed by `P15`, `P20`, `P21`, `P22`, `P23`. |
| Env/Config | Signed-URL refresh margin, virtualisation threshold, editor autosave interval, drag long-press delay | Configuration, never constants. |
| Event | [N/A] | Primitives emit callbacks, never domain events. |
| Build | Per-family dynamic import boundaries and their route-level budgets | Consumed by `P24.06`. |

---

## ADR / NFR Notes

- ADR-0035 is implemented here in full. Its governing rule — *these libraries are tools; none of them is the VYRA Design System* — is enforced by AE1 and by each story's boundary criterion.
- `FF-06` shapes `P19.08`: the workflow engine is the only mutator, so a drag is a request and its optimistic state must be reversible.
- `FF-15` shapes `P19.05`: AI disclosure is non-suppressible, so it is a structural part of the player rather than a prop the caller may omit.
- `FF-16` shapes `P19.02`: the read path never calls a provider, so the chart must display snapshot age instead of offering a refresh that cannot exist.
- `NFR-03` shapes the whole epic through ASM-P19-02: these are the five heaviest families in the product and they load per route.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| PX §12.1–§12.3 / ADR-0035 | chart primitives over Recharts | `P19.01` | AC-1..6 | boundary lint + render tests | closes OQ-P15-02 |
| PX §12.4, §12.5 / `performance.md` §5 | gap semantics, snapshot age, chart a11y | `P19.02` | AC-1..6 | gap fixtures + a11y table |
| PX §14 / ADR-0035 | data-grid primitives over TanStack | `P19.03` | AC-1..7 | grid behaviour tests | - |
| PX §14.4, §14.5 | virtualisation, grid keyboard, truncation | `P19.04` | AC-1..5 | virtual keyboard test | - |
| PX §24 / FF-15 / `security-architecture.md` §6 | media player primitive | `P19.05` | AC-1..7 | signed-URL + disclosure tests | - |
| PX §24.6, §24.7 | audio waveform and upload primitives | `P19.06` | AC-1..5 | upload state tests | - |
| PX §25.2 / ADR-0035 | script editor over a VYRA schema | `P19.07` | AC-1..7 | schema rejection tests | - |
| PX §26.3, §26.4 / FF-06 | drag primitives with keyboard equivalence | `P19.08` | AC-1..6 | keyboard drag test | - |
| PX §27 | calendar primitives and timezone rendering | `P19.09` | AC-1..5 | timezone render tests | - |

**BDD example IDs**
- EX-P19-01 GIVEN a screen importing Recharts directly, WHEN the boundary lint runs, THEN it fails naming the file.
- EX-P19-02 GIVEN a performance series with a missing bucket, WHEN it renders, THEN the line shows a discontinuity and the table shows a hatched cell.
- EX-P19-03 GIVEN a chart with four series, WHEN it renders, THEN a legend appears and each series is distinguishable by marker as well as colour.
- EX-P19-04 GIVEN a grid of 5,000 rows, WHEN a keyboard user presses `PageDown` past the virtual boundary, THEN focus lands on the correct row and is announced.
- EX-P19-05 GIVEN a signed URL that expires during playback, WHEN the margin is reached, THEN the URL is refreshed transparently and playback does not stop.
- EX-P19-06 GIVEN a paste containing styled HTML, WHEN it enters the script editor, THEN it is reduced to the VYRA schema and no style survives.
- EX-P19-07 GIVEN a drag started with the keyboard, WHEN the user moves between targets, THEN invalid targets are skipped and each valid target is announced.
- EX-P19-08 GIVEN an optimistic drop the server refuses, WHEN the response arrives, THEN the item animates back to origin and a region-level error is shown.
- EX-P19-09 GIVEN a publication time, WHEN it renders on a calendar, THEN it is never displayed without a timezone.

**Open questions**
- OQ-P19-01 The waveform peak array for audio previews is precomputed server-side rather than decoded in the browser (`P19.06` AC-2). Where it is computed is an ingestion concern owned by `P11.07`; this epic only requires that it arrives as data.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 9/9 mapped; contracts 3/3 actionable entries mapped; examples 9/9 mapped to validations; unresolved gap codes: none.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P19.01` | Chart primitives over shadcn Charts and Recharts | 8 | — | P0 |
| `P19.02` | Gap semantics, snapshot age and chart accessibility | 5 | `P19.01` | P0 |
| `P19.03` | Data-grid primitives over TanStack Table | 8 | — | P0 |
| `P19.04` | Grid virtualisation, keyboard navigation and truncation | 5 | `P19.03` | P0 |
| `P19.05` | Media player primitive with signed-URL lifecycle and AI disclosure | 8 | — | P0 |
| `P19.06` | Audio waveform player and upload primitives | 5 | `P19.05` | P0 |
| `P19.07` | Script editor primitive over Tiptap with the VYRA document schema | 8 | — | P0 |
| `P19.08` | Drag-and-drop interaction primitives with keyboard equivalence | 8 | — | P0 |
| `P19.09` | Calendar primitives and timezone rendering | 5 | `P19.08` | P0 |

**Verification gate (epic exit)**: the `P18.16` conformance harness is green for every primitive in this epic at the same thresholds; the boundary lint proves no code outside `packages/ui` imports Recharts, TanStack Table, dnd-kit, Tiptap or Motion, and turns red on a seeded direct import; a seeded missing metric renders as a discontinuity in the chart and a hatched cell in the table, never as zero; every drag interaction completes end-to-end by keyboard with each step announced; the editor schema rejects a styled paste and reduces it to VYRA nodes; the media primitive refuses a non-signed URL and refreshes an expiring one transparently; each family is a route-level dynamic import with a recorded budget.
