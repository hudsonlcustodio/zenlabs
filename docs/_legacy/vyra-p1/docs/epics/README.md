# VYRA — MVP Backlog Index

- **Scope**: the complete MVP backlog derived from `docs/architecture/` and from
  `docs/product/VYRA_PRODUCT_EXPERIENCE.md`.
- **Contents**: **24 epics, 253 stories, 1 443 story points, 13 execution waves**.
- **Status**: `generated` — **IMPLEMENTATION NOT STARTED**.
- **Companion**: [`backlog-coverage-audit.md`](./backlog-coverage-audit.md) proves,
  identifier by identifier, that this backlog covers the canonical architecture
  and the canonical product experience.
- **Authority**: `docs/architecture/implementation-sequencing.md` fixes the phase
  order for `P1`…`P16`. `P17`…`P24` extend the plan; §1.1 records why and how.

> This file is an index. It introduces no requirement, no story and no decision.
> Where it disagrees with an epic, the disagreement is recorded in the audit,
> not silently resolved here.

---

## 1. Master epic table

`P(n)` maps to `implementation-sequencing.md` → `Phase (n-1)` for n ∈ [1,16].
`P17`…`P24` are extensions — see §1.1. `Depends on` / `Blocks` are reproduced
verbatim from each epic header and are now **fully reciprocal** in both
directions (0 asymmetries).

| Epic | Title | Source phase | Wave | Priority | Depends on | Blocks | Stories | Points |
|---|---|---|---|---|---|---|---|---|
| [`P1`](./epic-P1.md) | Foundation — monorepo, boundaries, CI | Phase 0 | 1 | P0 | — | `P2`, `P4`, `P16`, `P17`, `P18` | 10 | 52 |
| [`P2`](./epic-P2.md) | Data foundation and tenancy | Phase 1 | 2 | P0 | `P1` | `P3`, `P6`, `P7`, `P9`, `P16`, `P17` | 11 | 48 |
| [`P4`](./epic-P4.md) | Provider framework | Phase 3 | 2 | P0 | `P1` | `P5`, `P9`, `P10`, `P11`, `P13`, `P16` | 11 | 55 |
| [`P18`](./epic-P18.md) | VYRA Design System foundation | Phase 14 (extracted) | 2 | P0 | `P1` | `P15`, `P16`, `P19`, `P20` | 16 | 94 |
| [`P3`](./epic-P3.md) | Identity and authorization | Phase 2 | 3 | P0 | `P2` | `P5`, `P15`, `P16`, `P20` | 10 | 47 |
| [`P6`](./epic-P6.md) | Ledgers, plans and subscription | Phase 5 | 3 | P0 | `P2` | `P8`, `P10`, `P11`, `P15`, `P16`, `P23` | 9 | 48 |
| [`P7`](./epic-P7.md) | Async backbone | Phase 6 | 3 | P0 | `P2` | `P8`, `P9`, `P11`, `P13`, `P15`, `P16` | 10 | 49 |
| [`P17`](./epic-P17.md) | Infrastructure as Code, environments and delivery | **extension** | 3 | P0 | `P1`, `P2` | `P16` | 12 | 70 |
| [`P19`](./epic-P19.md) | Experience component families | Phase 14 (extracted) | 3 | P0 | `P18` | `P15`, `P16`, `P20`, `P21`, `P22`, `P23` | 9 | 60 |
| [`P5`](./epic-P5.md) | Governance and identity assets | Phase 4 | 4 | P0 | `P3`, `P4` | `P8`, `P15`, `P16` | 9 | 51 |
| [`P9`](./epic-P9.md) | Knowledge engine | Phase 8 | 4 | P0 | `P2`, `P4`, `P7` | `P10`, `P15`, `P16` | 10 | 51 |
| [`P20`](./epic-P20.md) | Application shell, navigation and global experience | Phase 14 (extracted) | 4 | P0 | `P3`, `P18`, `P19` | `P15`, `P16`, `P21`, `P22`, `P23` | 8 | 46 |
| [`P8`](./epic-P8.md) | Workflow engine | Phase 7 | 5 | P0 | `P5`, `P6`, `P7` | `P11`, `P12`, `P13`, `P15`, `P16` | 12 | 67 |
| [`P10`](./epic-P10.md) | Intelligence engine | Phase 9 | 5 | P0 | `P4`, `P6`, `P9` | `P11`, `P15`, `P16`, `P23` | 9 | 52 |
| [`P11`](./epic-P11.md) | Voice and video generation | Phase 10 | 6 | P0 | `P4`, `P6`, `P7`, `P8`, `P10` | `P12`, `P15`, `P16` | 11 | 62 |
| [`P12`](./epic-P12.md) | QA and approvals | Phase 11 | 7 | P0 | `P8`, `P11` | `P13`, `P15`, `P16` | 6 | 30 |
| [`P13`](./epic-P13.md) | Calendar and publishing | Phase 12 | 8 | P0 | `P4`, `P7`, `P8`, `P12` | `P14`, `P15`, `P16`, `P22` | 12 | 67 |
| [`P14`](./epic-P14.md) | Performance | Phase 13 | 9 | P0 | `P13` | `P15`, `P16`, `P21` | 8 | 39 |
| [`P15`](./epic-P15.md) | Surfaces: routes, authorization and data binding | Phase 14 | 10 | P0 | `P3`, `P5`, `P6`, `P7`, `P8`, `P9`, `P10`, `P11`, `P12`, `P13`, `P14`, `P18`, `P19`, `P20` | `P16`, `P21`, `P22`, `P23` | 22 | 122 |
| [`P21`](./epic-P21.md) | VYRA Portal experience | Phase 14 (client half) | 11 | P0 | `P14`, `P15`, `P20` | `P16`, `P24` | 11 | 79 |
| [`P22`](./epic-P22.md) | VYRA Studio experience | Phase 14 (operations half) | 11 | P0 | `P13`, `P15`, `P20` | `P16`, `P24` | 11 | 76 |
| [`P23`](./epic-P23.md) | VYRA Control experience | Phase 14 (governance half) | 11 | P0 | `P6`, `P10`, `P15`, `P20` | `P16`, `P24` | 9 | 63 |
| [`P24`](./epic-P24.md) | Experience conformance | Phase 14 (verification half) | 12 | P0 | `P21`, `P22`, `P23` | `P16` | 7 | 47 |
| [`P16`](./epic-P16.md) | Operations: observability, retention, notifications and load | Phase 15 | 13 | P0 | `P1`…`P15`, `P17`…`P24` | — | 10 | 68 |
| | | | | | | **Total** | **253** | **1 443** |

Every epic is priority `P0`. Priority varies at story level only:
**241 × P0, 11 × P1, 1 × P2** (`P6.07` PaymentProvider extension point).

### 1.1 Why there are 24 epics and not 16

Three additions, each with a recorded cause.

| Epics | Cause | Authority |
|---|---|---|
| `P17` | Closes audit gap **G-03**. `implementation-sequencing.md` Phase 0 scoped "CI pipeline stages 1–5" and Phase 15 scoped operations, so **no phase ever scoped provisioning**. `P16.09` measured against a staging environment nothing created and `P16.10` verified a production gate nothing built. The owner chose to add infrastructure to the plan rather than declare it out-of-band. | `aws-topology.md`, `cicd.md` §1 stages 6–10, ADR-0019/0020/0021/0022 |
| `P18`, `P19`, `P20` | `docs/product/VYRA_PRODUCT_EXPERIENCE.md` became the canonical UX/UI source and closed `ASM-BR01`. The design system, the library-backed component families and the application shell depend on the repository and on identity — **not on the domain** — so they are extracted forward to waves 2, 3 and 4 instead of sitting inside the wave-10 surface bottleneck. | `VYRA_PRODUCT_EXPERIENCE.md`, ADR-0003, ADR-0028, ADR-0035 |
| `P21`, `P22`, `P23`, `P24` | The surface **experience** is distributed by surface — Portal, Studio, Control — with one conformance epic, rather than collapsed into a single generic "UI" epic. `P15` keeps route, authorization and data binding; each experience epic owns its surface's interaction depth and state coverage. | `VYRA_PRODUCT_EXPERIENCE.md` §31–§34 |

`implementation-sequencing.md` is **unchanged**. `P17` is the one epic with no
source phase; `P18`–`P24` all derive from Phase 14, which the sequencing document
scopes as "`packages/ui` primitives, Portal, Studio, Control; responsiveness and
accessibility from the start" — a scope wide enough that one epic could not carry
it and a boundary honest enough that splitting it needs no amendment.

---

## 2. Dependency graph by wave

Wave `w` may start only when every epic in waves `< w` has its exit gate green
(`implementation-sequencing.md` §Rules 1). Epics on the same line are
**independent of each other** and may be executed in parallel.

```
wave  1   P1                                       52 pts  ─ nothing may run before this
           │
           ├──────────────┬──────────────┐
wave  2   P2             P4             P18       197 pts  ─ 3-way parallel, disjoint
           │              │              │
           ├────┬────┬────┤              │
wave  3   P3   P6   P7   P17            P19       274 pts  ─ 5-way parallel
           │    │    │                   │
           ├────┼────┼───────────────────┤
wave  4   P5   P9                       P20       148 pts  ─ P5←(P3,P4) P9←(P2,P4,P7) P20←(P3,P18,P19)
           │    │                        │
           └────┴────┐                   │
wave  5   P8        P10                           119 pts
           │          │
           └────┬─────┘
wave  6       P11                                  62 pts
                │
wave  7       P12                                  30 pts
                │
wave  8       P13                                  67 pts
                │
wave  9       P14                                  39 pts
                │
wave 10       P15                                 122 pts  ─ P15←(11 domain epics + P18,P19,P20)
                │
           ┌────┼────┐
wave 11   P21  P22  P23                           218 pts  ─ 3-way parallel by surface
           └────┼────┘
wave 12       P24                                  47 pts
                │
wave 13       P16                                  68 pts  ─ P16←all
```

| Wave | Epics | Parallelism | Stories | Points | Cumulative |
|---|---|---|---|---|---|
| 1 | `P1` | 1 | 10 | 52 | 52 |
| 2 | `P2`, `P4`, `P18` | 3 | 38 | 197 | 249 |
| 3 | `P3`, `P6`, `P7`, `P17`, `P19` | 5 | 50 | 274 | 523 |
| 4 | `P5`, `P9`, `P20` | 3 | 27 | 148 | 671 |
| 5 | `P8`, `P10` | 2 | 21 | 119 | 790 |
| 6 | `P11` | 1 | 11 | 62 | 852 |
| 7 | `P12` | 1 | 6 | 30 | 882 |
| 8 | `P13` | 1 | 12 | 67 | 949 |
| 9 | `P14` | 1 | 8 | 39 | 988 |
| 10 | `P15` | 1 | 22 | 122 | 1 110 |
| 11 | `P21`, `P22`, `P23` | 3 | 31 | 218 | 1 328 |
| 12 | `P24` | 1 | 7 | 47 | 1 375 |
| 13 | `P16` | 1 | 10 | 68 | 1 443 |

**Every one of the 24 epics sits at its minimum feasible wave** — verified
mechanically against the declared graph. There is no epic scheduled later than
its dependencies require, and therefore no undocumented scheduling slack.

Wave 3 is the widest (5 epics, 274 pts, 19.0% of the backlog) and wave 11 the
second heaviest (218 pts) but perfectly disjoint: `P21`, `P22` and `P23` touch
three separate route groups and share only the primitives that shipped in wave 2.

---

## 3. Critical path

Longest path through the declared epic graph, by story points **and** by node
count. They agree.

```
P1 → P2 → P3 → P5 → P8 → P11 → P12 → P13 → P14 → P15 → P21 → P24 → P16
52   48   47   51   67    62    30    67    39   122    79    47    68
                                                        = 779 pts / 13 epics
```

### 3.1 What changed from the 16-epic plan

The previous critical path was
`P1 → P2 → P3 → P5 → P8 → P11 → P12 → P13 → P14 → P16` — 513 pts, 10 epics —
and it was **understated**, because `P15` sat in the same wave as `P14` while two
of its stories depended on `P14`. The audit recorded that as tension §13.1 with
two options. Option **B** is now taken: `P15` moved to wave 10 and the epics that
follow it moved with it. The path grew by three nodes for three reasons:

| Delta | Cause |
|---|---|
| `P15` enters the path (+122) | The `P14 → P15` edge that already existed at story level is now declared at epic level. This is the correction, not an addition of work. |
| `P21` enters the path (+79) | The Portal experience genuinely follows the Portal routes. |
| `P24` enters the path (+47) | Conformance genuinely follows the screens it verifies. |
| `P16` moves from wave 10 to 13 | It depends on everything, and there are now three more waves. |

`P17`, `P18`, `P19` and `P20` add 270 points to the backlog and **nothing** to the
critical path — they sit on branches that complete long before the chain reaches
them. That is the whole reason they were extracted forward.

### 3.2 Reconciliation with `implementation-sequencing.md`

The source document draws:

```
0 → 1 → 2 ─┐
0 → 3 ─────┼→ 4 ─┐
    1 → 5 ─┴─────┼→ 7 → 10 → 11 → 12 → 13 → 15
    1 → 6 ───────┘        ▲
    1 → 8 → 9 ────────────┘
                     2 → 14
```

Its longest chain is `0 → 1 → 2 → 4 → 7 → 10 → 11 → 12 → 13 → 15`, which under
`P(n) = Phase(n-1)` is exactly the `P1 → … → P14 → … → P16` spine above.
**No divergence in the phases the document covers.** The three inserted nodes
(`P15`, `P21`, `P24`) all live inside its Phase 14 → Phase 15 segment, which the
document draws as a single edge (`2 → 14`, then `14` feeding `15`). The extension
refines that edge; it does not contradict it.

---

## 4. Tensions carried into execution

The previous revision of this index carried five. **Four are now closed.**

| # | Tension | Status |
|---|---|---|
| 1 | Wave 9 contested: `P14` and `P15` shared a wave while `P15.10`/`P15.16` depended on `P14` | **Closed** — option B taken. `P15` → wave 10. Zero same-wave dependencies remain anywhere in the backlog. |
| 2 | Missing graph edges: 18 epic-level edges implied by stories but absent from headers | **Closed** — every epic header now declares its full induced dependency set, and `Depends on` / `Blocks` are reciprocal in both directions with 0 asymmetries. |
| 3 | `P15.11` carries four unrelated concerns | **Mitigated, not renumbered.** The composite `P15` story keeps its id and its route binding; the four concerns get distinct **experience** surfaces in `P21.10`, which is where the governance write path (consent) is separated from the three read-only presentations. Renumbering `P15.12`…`P15.22` was rejected as more expensive than the defect. |
| 4 | Four external gates are unresolved provider contracts in `P13` | **Open by design.** `GATE-TT01`, `GATE-TT02`, `GATE-MT01`, `GATE-MT02` now additionally surface in `P22.07` and `P23.08`, which state each restriction rather than guessing it. `implementation-sequencing.md` §Rules 4: gates block a launch, never a phase. |
| 5 | `OQ-P16-05`: `T22` precondition divergence between two canonical documents | **Open, and still the earliest decision.** Must be reconciled before wave 5 (`P8.07`), not before wave 13. Now also surfaced as `OQ-P23-01`. |

---

## 5. File and identifier conventions

### 5.1 Files

| Artifact | Path | Count |
|---|---|---|
| Epic | `docs/epics/epic-P<n>.md`, n ∈ [1,24] | 24 |
| Story | `docs/stories/P<n>.<NN>.story.md`, NN zero-padded to 2 | 253 |
| Backlog index | `docs/epics/README.md` | this file |
| Coverage audit | `docs/epics/backlog-coverage-audit.md` | 1 |
| Product experience | `docs/product/VYRA_PRODUCT_EXPERIENCE.md` | 1 |

Epic file names are **not** zero-padded (`epic-P1.md`, `epic-P24.md`); story
sequence numbers **are** (`P1.01`, `P24.07`). Sort epic paths with `sort -V`.

Every epic and story file carries YAML frontmatter (`id`, `title`, `status`,
`epic_id`, `depends_on`) so that the Neocortex discovery contract can derive
`.neocortex/state.json` from the filesystem rather than from a parallel list.
See §6.

### 5.2 Identifiers consumed by the backlog

| Prefix | Meaning | Canonical source | Universe |
|---|---|---|---|
| `P<n>` | Epic | this directory | 24 |
| `P<n>.<NN>` | Story | `docs/stories/` | 253 |
| `FR-<XX><NN>` | Functional requirement, domain-scoped | `prd.md` §8, §9 | 65 |
| `FR-<P\|S\|C><NN>` | Functional requirement, surface-scoped | `prd.md` §5 | 29 |
| `NFR-<NN>` | Non-functional requirement | `prd.md` §10 | 15 |
| `ADR-<NNNN>` | Architecture decision record | `docs/architecture/adr/` | **35** |
| `FF-<NN>` | Fitness function | `fitness-functions.md` | 33 |
| `T<NN>[a-c]` | Workflow transition | `workflows-state-machines.md` §2.2 | 26 |
| `G-<N>` | Workflow guard | `workflows-state-machines.md` §2.3 | 5 |
| `GATE-<XXNN>` | External gate blocking production launch | `risks.md` §3 | 12 |
| `RISK-<NN>` | Risk | `risks.md` §1 | 20 |
| `PD-<NN>` | Product design principle | `VYRA_PRODUCT_EXPERIENCE.md` §1 | 10 |
| `C-<NN>` | Screen conformance criterion | `VYRA_PRODUCT_EXPERIENCE.md` §34 | 14 |
| `I-<XX><N>` | Domain invariant | `domain-model.md` | — |
| `T-<NN>` | Threat (hyphenated — **not** a transition) | `threat-model.md` | — |
| `class <N>` | Test class | `testing-strategy.md` §1 | 14 |

Backlog-authored identifiers, declared inside epics and stories:

| Prefix | Meaning | Example |
|---|---|---|
| `AC-<N>` | Acceptance criterion, story-local | `AC-3` |
| `G<N>` / `NG<N>` / `AE<N>` | Epic goal / non-goal / acceptance evidence | `G2`, `NG1`, `AE3` |
| `EX-P<n>-<NN>` | BDD example | `EX-P18-02` |
| `ASM-P<n>-<NN>` | Epic-scoped assumption | `ASM-P17-01` |
| `ASM-<XX><NN>` | Architecture-scoped assumption, inherited | `ASM-CR01` |
| `OQ-P<n>-<NN>` | Epic-scoped open question | `OQ-P24-02` |
| `OQ-PX-<NN>` | Product-experience open question | `OQ-PX-03` |
| `OQ-<NN>` | PRD-scoped open question, inherited | `OQ-03` |

### 5.3 Document structure

Every epic file carries, in this order: frontmatter · header block · Feature Spec
Summary (Intent, Goals, Non-goals, Acceptance evidence, Assumptions) ·
Architecture Spec Summary (Affected surfaces, Integration points, Risks,
References) · Contract Inventory · ADR / NFR Notes · Traceability table · BDD
example ids · Open questions · Public-safety exclusions · Trace coverage line ·
Stories table · **Verification gate (epic exit)**.

Every story file carries: frontmatter · header block · User story
(`COMO … QUERO … PARA …`) · Context · Acceptance criteria · BDD examples ·
**Verification gate** · Architecture references · Out of scope · Traceability.

### 5.4 Rules for anyone consuming this backlog

1. A story's `Wave` always equals its epic's `Wave` — verified for all 253.
2. A story's declared points always equal the points in its epic's story table,
   and each epic's declared total equals the sum of its story files — verified
   for all 24 epics and all 253 stories, in both directions.
3. `Depends on` may name a story (`P6.03`) or a whole epic (`P14`). Both forms
   occur and both are load-bearing.
4. Epic-level `Depends on` **is now** the full epic set induced by its stories'
   dependencies. The delta that made rule 4 a warning in the previous revision is
   zero. Reading only the epic header is now safe for scheduling.
5. **No dependency crosses into its own wave or a later one** — verified for all
   253 stories and all 24 epics. Intra-epic story order inside a wave is the only
   ordering a wave does not express.
6. Nothing here may be edited to "fix" an epic or a story. Discrepancies are
   reported in the audit and resolved at the source.

---

## 6. Neocortex state

`.neocortex/state.json` is derived from this directory and `docs/stories/` by the
Neocortex discovery contract (`discoverEpicsFromDir` → `mergeDiscoveredIntoState`),
which reads each file's frontmatter and reconciles epic aggregates. The
filesystem is the source of truth; the state file is a projection of it.

- Regenerate/verify: `neocortex-client invoke --args "*status" --project-root "$(git rev-parse --show-toplevel)"`
- Schema check: `neocortex-client invoke --args "*migrate-state --preview" …`

A divergence between this directory and `state.json` is a bug in the projection,
never a reason to edit an epic.
