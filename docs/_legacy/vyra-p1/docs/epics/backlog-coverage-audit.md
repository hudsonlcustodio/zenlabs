# VYRA — Backlog Coverage Audit

- **Subject**: `docs/epics/` (24 epics) + `docs/stories/` (253 stories, 1 443 points).
- **Reference corpus**: `docs/architecture/` (35 ADRs + 27 architecture documents)
  and `docs/product/VYRA_PRODUCT_EXPERIENCE.md` (canonical UX/UI source).
- **Method**: mechanical enumeration. Every identifier universe below was extracted
  from its source document with `grep`, then each identifier was checked against
  `docs/epics/` and `docs/stories/`. No count in this document is an estimate.
- **Revision**: this is the **corrective revision**. The previous audit reported
  three real gaps (`G-01`, `G-02`, `G-03`), one incorrect reference, five tensions
  and six debts, and — per its own constraint — corrected none of them. This
  revision applies the corrections and re-runs every count. §16 lists what changed.
- **Status**: `generated` — **IMPLEMENTATION NOT STARTED**.
- **Index**: [`README.md`](./README.md).

---

## 1. Method and its limits

Each axis is enumerated as: *universe* (identifiers present in the canonical
source) → *coverage* (epic/story files whose text matches the identifier) →
*status*.

| Status | Meaning |
|---|---|
| `cited` / `gated` / `covered` | The identifier appears literally in an epic or story. Traceability is machine-checkable. |
| `semantic` | No story cites the identifier, but a named story demonstrably implements the requirement. Coverage is real; **traceability is not machine-checkable**. |
| `GAP` | No story implements it. |

**Limit disclosed up front.** A literal-match audit proves a *reference* exists,
not that the reference is *correct*. The previous revision found one incorrect
reference this way (`epic-P1.md` citing `RISK-19` with the wrong description);
it is corrected in this revision and recorded in §14.

### 1.1 Structural integrity, verified first

All checks pass. Every one is reproducible from §17.

| Check | Result |
|---|---|
| Story files on disk | 253 |
| Story rows in epic story-tables | 253 |
| Rows with no file / files with no row | 0 / 0 |
| References to a non-existent story id (any epic or story file) | 0 |
| Story `Epic:` header disagreeing with its filename | 0 |
| Story `Wave:` disagreeing with its epic's `Wave:` | 0 |
| Story points in an epic table disagreeing with the story file | 0 |
| Story priority in an epic table disagreeing with the story file | 0 |
| Story `Depends on:` in an epic table disagreeing with the story file | 0 |
| Story `Depends on:` naming a non-existent story or epic | 0 |
| Per-epic Σ(story file points) vs epic declared total | 24/24 equal |
| Per-epic Σ(story table points) vs epic declared total | 24/24 equal |
| Σ(all story points) | 1 443 |
| Epic `Blocks: Y` without the reciprocal `Y depends on X` | 0 |
| Epic `Depends on: X` without the reciprocal `X blocks Y` | 0 |
| Epic wave < wave of any declared dependency | 0 |
| **Cross-epic story dependency inside the same or a later wave** | **0** |
| Epics sitting at their minimum feasible wave | **24/24** |

The last two rows are the material change from the previous revision, which
reported one wave-breaking edge (`P15 → P14`) and 15 of 16 epics at their
minimum wave.

---

## 2. Coverage summary

| Axis | Universe | Source | Covered | Gaps |
|---|---|---|---|---|
| a) Functional requirements | 94 (`FR-*`) | `prd.md` §5, §8, §9 | **94/94 cited** | 0 |
| b) Non-functional requirements | 15 (`NFR-*`) | `prd.md` §10 | **15/15** | 0 |
| c) Architecture decision records | **35** (`ADR-*`) | `docs/architecture/adr/` | **35/35** | **0** |
| d) Fitness functions | 33 (`FF-*`) | `fitness-functions.md` | **33/33**, all inside a verification gate | **0** |
| e) Workflow transitions | 26 (`T##`) | `workflows-state-machines.md` §2.2 | **26/26** | 0 |
| f) Implementation phases | 16 | `implementation-sequencing.md` | **16/16** with mirrored gates | 0 |
| g) External gates | 12 (`GATE-*`) | `risks.md` §3 | **12/12** registered | 0 (all open by design) |
| h) Test classes | 14 | `testing-strategy.md` §1 | **14/14** exercised | 0 |
| i) Risks | 20 (`RISK-*`) | `risks.md` §1 | **20/20** referenced | 0 |
| j) Product design principles | 10 (`PD-*`) | `VYRA_PRODUCT_EXPERIENCE.md` §1 | **10/10** | 0 |
| k) Screen blueprints | 41 screens + 3 shells | `VYRA_PRODUCT_EXPERIENCE.md` §31–§33 | **44/44** owned | 0 |
| l) Conformance criteria | 14 (`C-*`) | `VYRA_PRODUCT_EXPERIENCE.md` §34 | **14/14** bound to a check | 0 |

**Real gaps: 0.** The three the previous revision found are closed in §15.1.
**Known debts: 0** (down from 6), closed in §15.2. Every axis above is 100% **cited**,
not merely covered: no identifier relies on `semantic` traceability.

---

## 3. Axis (a) — Functional requirements

`prd.md` uses **two** functional-requirement schemes. There is no `FR-<NN>`
identifier anywhere in the corpus; a naive `grep -oE 'FR-[0-9]+'` returns 15
false positives by matching the tail of `NFR-01`…`NFR-15`. The real universe is
94: 65 domain-scoped (`FR-<XX><NN>`, §8/§9) plus 29 surface-scoped
(`FR-<P|S|C><NN>`, §5).

**94/94 cited.** The eight requirements the previous revision recorded as
implemented-but-uncited (`FR-AP02`, `FR-BL02`, `FR-CR04`, `FR-IN01`, `FR-KN02`,
`FR-UC01`, `FR-UC06`, `FR-WF01`) now carry their id in the story that implements
them — debt **D-01** is closed, see §15.2.

### 3.1 Surface requirements now have two owners each

The 29 surface requirements (`FR-P01`…`FR-P11`, `FR-S01`…`FR-S09`,
`FR-C01`…`FR-C09`) are now covered twice, deliberately:

| Layer | Epic | Owns |
|---|---|---|
| Route, authorization, data binding | `P15` | The contracted route is rendered and the server decides |
| Experience, interaction, state coverage | `P21` / `P22` / `P23` | What the operator or client actually experiences |

Each epic's non-goals state the boundary from its own side (`epic-P15` NG6/NG7;
`epic-P21` NG5; `epic-P22` NG4; `epic-P23` NG4), so the duplication is a declared
division of labour and not an unnoticed overlap.

---

## 4. Axis (b) — Non-functional requirements

**15/15 present.** Two changes from the previous revision:

- `NFR-03` (critical screen load < 3 s) now has **two** owners at two altitudes:
  `P24.06` measures a client-side budget to the first meaningful region at
  wave 12, and `P16.09` measures end-to-end against staging at wave 13. The
  previous plan had only the second, which meant the first signal of a screen
  performance regression arrived at the last wave.
- `NFR-12` (environment isolation) is now **implemented** by `P17.02` and
  independently **verified** by `P16.10`. Previously only the verification
  existed.

Debt **D-05** is closed: `P16.08` AC-5 records `NFR-04`'s SLO with its measurement
window and breach action, and records `NFR-05` as a maturity target explicitly out
of MVP scope with no alarm against it.

---

## 5. Axis (c) — Architecture decision records

**Universe: 35** (34 previously, plus `ADR-0035`). **35/35 covered — 0 gaps.**

| ADR | Subject | Owning story | Status |
|---|---|---|---|
| `ADR-0004` | Backend: NestJS + REST + OpenAPI | **`P1.08`** (bootstrap), **`P1.10`** (OpenAPI) | **closed — was GAP G-01** |
| `ADR-0019` | Primary region `sa-east-1` | **`P17.02`** AC-6 | **closed — was GAP G-03** |
| `ADR-0020` | Lean EC2 + RDS + S3 + SQS baseline | **`P17.03`–`P17.08`** | **closed — was GAP G-03** |
| `ADR-0021` | Scaling gates | `P17.01` AC-6 promotion-gate check | cited |
| `ADR-0022` | Secrets Manager + KMS + IAM | **`P4.11`** (runtime), **`P17.07`** (resources) | **closed — was GAP G-02** |
| `ADR-0032` | API style: REST | `P1.10` | cited (was debt D-02) |
| `ADR-0035` | Frontend toolkit boundaries | `P19.01`, `P19.03`, `P19.05`, `P19.07`, `P19.08`, `P24.06` | cited (new) |
| all others | — | as previously | cited |

`ADR-0012` (`P11.05`), `ADR-0014` (`P11.01`, previously cited only by file path),
`ADR-0021` (`P17.01`), `ADR-0023` (`P17.12`) and `ADR-0032` (`P1.10`) are now all
cited by id. Debt **D-02** is closed.

---

## 6. Axis (d) — Fitness functions

**33/33 referenced, and — for the first time — 33/33 sit inside an explicit
verification gate.** The two that did not are closed:

| FF | Previous state | Owner now |
|---|---|---|
| `FF-14` Runtime credentials come from Secrets Manager | **GAP G-02** — named twice, both as *out of scope*, deferring to an epic that never claimed it | **`P4.11`**, wave 2, inside `epic-P4`'s exit gate. `P1.05` and `P1.07` now defer to `P4.11` by id instead of to "epic P16". |
| `FF-18` OpenAPI matches the contracts | **GAP G-01** — asserted for one route in `P14.08` | **`P1.10`**, wave 1, inside `epic-P1`'s exit gate, as a generate-and-diff check that ships against an empty route set. |

The placement of both follows the argument `epic-P1.md` already made for boundary
lint: a check added when the violation surface is empty is free and stays free;
the same check added at wave 10 is unpayable debt.

`FF-16` and `FF-17` now additionally appear in the experience epics
(`P21.08`, `P22.05`, `P22.10`, `P20.02`, `P20.03`), and `FF-15`, `FF-32`, `FF-33`,
`FF-10`, `FF-11`, `FF-20`, `FF-27`, `FF-30` each acquired a screen-level owner
that renders the guarantee visible to a human rather than only true in the code.

---

## 7. Axis (e) — Workflow transitions

**26/26 covered**, unchanged. Two additions worth naming:

- `T11b` / `T11c` (ingestion failure and operator ingestion retry) now have a
  **user-visible** owner in `P21.05` AC-4 and `P22.05` AC-4. `ADR-0034` and
  `FF-32` guarantee usage stays committed and no automatic re-render occurs;
  the backlog previously guaranteed that in code and said nothing to the user
  it happens to. It now says both, in the Portal and in the queue console, and
  asserts the absence of a re-render control.
- `T22` gains a screen-level statement of its five reasons and their next
  actions (`P18.13` AC-5, `P21.05` AC-4).

---

## 8. Axis (f) — Implementation phases

**16/16 covered with mirrored gates**, unchanged for `P1`…`P16`.

`P17` has **no source phase** — that is the whole of gap `G-03`. The previous
audit stated the choice: add infrastructure to the plan, or record it as an
out-of-band track. The owner chose to add it. `implementation-sequencing.md` is
unchanged; `epic-P17` records the extension explicitly in its ADR/NFR Notes and
`README.md` §1.1 records it in the index.

`P18`–`P24` all derive from **Phase 14**, whose declared scope —
"`packages/ui` primitives, Portal, Studio, Control; responsiveness and
accessibility from the start; no page-stories" — covers every one of them. Phase
14 is now realised by 6 epics and 82 stories instead of 1 epic and 22 stories,
which is a decomposition of the same scope, not an expansion of it.

---

## 9. Axis (g) — External gates

**12/12 registered; all 12 open.** That is the correct state for a backlog that
has not started (`implementation-sequencing.md` §Rules 4: external gates never
block a phase, only the production launch of the affected capability).

New in this revision: every gate now has a **screen** that states its condition,
so an open gate is visible to the people it affects rather than only to the
launch register.

| Gate | Backlog behaviour when unresolved | Screen that states it |
|---|---|---|
| `GATE-TT01` | Publish as `SELF_ONLY`, flag, inform | `P21.07` AC-6 (before scheduling), `P22.07` AC-5 (both directions) |
| `GATE-TT02` | **Block publication rather than guess** the wire mapping | `P22.07` AC-4 |
| `GATE-MT01` | Build against recorded shapes; launch gated | `P22.07` AC-6, `P23.08` AC-6 |
| `GATE-MT02` | Resolve scopes from configuration; name the missing scope | `P22.07` AC-6, `P23.08` AC-6 |
| `GATE-HG01`…`04`, `GATE-EL01` | Mock-first, polling-first; provisioning states VYRA ownership | `P21.02` AC-2, `P22.09` AC-4/AC-5 (twins and voices) |
| `GATE-COST01` | Entries marked `estimated`, never invented | `P23.07` AC-2/AC-3 |
| `GATE-UX01` | Proceed without page-stories; targeted tests substitute | `P18.16`, `P24.07` AC-6 |
| `GATE-NOTIF01` | In-app only; the UI must not imply email | `P20.04` AC-3 |

---

## 10. Axis (h) — Test classes

**14/14 exercised.** Debt **D-04** (class 2 never cited by number) is unchanged.

The conformance suites added by `P18.16` and `P24` are not a new test class;
they are class 1 (component) and class 6 (authorization) assertions plus a new
category of **token and lint assertions** that require no browser. Where they run
is fixed: the `security/static` stage of `cicd.md` §1, blocking.

---

## 11. Axis (i) — Risks

**20/20 referenced.** Two state changes:

| Risk | Previous | Now |
|---|---|---|
| `RISK-10` No canonical branding | Open — `ASM-BR01`, placeholder tokens | **Closed.** `docs/product/VYRA_PRODUCT_EXPERIENCE.md` is the canonical visual system; `P18.01` and `P18.02` implement it. `ASM-BR01`, `OQ-P15-01`, `ASM-IA01` and `ASM-P15-02` are superseded with it. |
| `RISK-05` No Storybook adapter | Accepted, mitigation "targeted tests" | **Still accepted, now delivered.** The substitute is `P18.16` (six checks over primitives) plus `P24.07` (14 criteria × 41 screens), both blocking in CI. `GATE-UX01` stays open by design. |

`RISK-12` (first-party authentication risk) and `RISK-16` (embedding-dimension
backfill) were implemented but uncited; they are now cited in `P3.01` and `P9.05`
respectively. `RISK-19`'s citation defect is corrected — see §14.1. `RISK-13` still has no
backlog mitigation because it implies no engineering work; `risks.md` marks it
`Accepted`, and `ADR-0019` is now nonetheless implemented by `P17.02` AC-6.

---

## 12. Axes (j), (k), (l) — the product experience

New axes in this revision, from `docs/product/VYRA_PRODUCT_EXPERIENCE.md`.

### 12.1 Product design principles — 10/10

All ten `PD-*` principles are cited by id in at least one story. Four
(`PD-03`, `PD-05`, `PD-08`, `PD-10`) were semantic-only in the first pass of this
revision and were given explicit citations in `P18.01`, `P18.03`, `P18.04`,
`P18.16` and `P21.03` rather than left uncited.

### 12.2 Screen blueprints — 44/44 owned

41 screens plus 3 surface shells, each with a declared objective, primary action,
hierarchy, regions, key components, states, responsive behaviour and
desktop/mobile note.

| Surface | Blueprints | Route/authorization owner | Experience owner |
|---|---|---|---|
| Portal | 1 shell + 17 screens | `P15.02`…`P15.11`, `P15.20` | `P21.01`…`P21.11` |
| Studio | 1 shell + 14 screens | `P15.12`…`P15.16` | `P22.01`…`P22.11` |
| Control | 1 shell + 10 screens | `P15.17`…`P15.19` | `P23.01`…`P23.09` |

`P24.07` AC-1 reconciles the blueprint list against the routes `apps/web` renders
in **both directions**, so a screen without a blueprint and a blueprint without a
screen are both CI failures.

### 12.3 Conformance criteria — 14/14 bound

Each of the 14 criteria in §34 is bound to a concrete check in `P24.07` AC-2,
and each check is owned by a named story. C-01 is the only criterion that cannot
be fully automated; `P24.07` AC-5 binds its checkable half to structural
assertions and records the remainder as a reviewed item with a named reviewer,
rather than silently skipping it.

---

## 13. Tensions — status after correction

| # | Tension (previous revision §13) | Resolution |
|---|---|---|
| 13.1 | Wave 9 carried `P14` and `P15` simultaneously while `P15.10`/`P15.16` depended on `P14` | **Resolved — option B.** `P15` → wave 10; `P21`/`P22`/`P23` → 11; `P24` → 12; `P16` → 13. Critical path grows from 513/10 to 779/13. The 125 points were never optional; the previous plan simply hid the edge. |
| 13.2 | 18 epic edges implied by stories, absent from headers | **Resolved.** Every epic header now declares its full induced dependency set, reciprocal in both directions. `README.md` §5.4 rule 4 changed from a warning to a guarantee. |
| 13.3 | `P15.11` carries four unrelated concerns | **Mitigated without renumbering.** `P15.11` keeps its id and its route binding; `P21.10` gives the four concerns distinct experience surfaces and separates the consent **write** path (AC-6, AC-7) from the three read-only presentations (AC-1…AC-5). Renumbering `P15.12`…`P15.22` was rejected as costlier than the defect. |
| 13.4 | Four external gates unresolved inside `P13` | **Open by design, now visible.** See §9. |
| 13.5 | `OQ-P16-05` — `T22` precondition divergence | **Open. Still the earliest decision in the register**: required before wave 5 (`P8.07`), not wave 13. Now also surfaced as `OQ-P23-01` in `epic-P23`, so the person building the provider screen meets the same open question. |

---

## 14. Defects in source artifacts — corrected in this revision

### 14.1 `epic-P1.md` cited `RISK-19` with the wrong description — **corrected**

`epic-P1.md` described *"agent-executed implementation without machine-checkable
boundaries"* and labelled it `RISK-19`, which in `risks.md` §1 is *"ingestion
failure leaves a committed generation with no VYRA-side asset"*.

**Correction applied**: the `RISK-19` label is removed. The sentence stays as an
unlabelled rationale and now states explicitly that it carries no `RISK-*` id and
that `RISK-19` belongs to `P16.01`/`P16.03`. No new risk was registered in
`risks.md`, because doing so would amend the canonical architecture to fix a
citation defect in the backlog.

### 14.2 `apps/*` processes named but never created — **corrected**

| Process | Previously | Now |
|---|---|---|
| `apps/web` | `P15.02` | `P15.02` (unchanged) |
| `apps/api` | **no story** | **`P1.08`** |
| `apps/worker-ai` | `P7.04` (generic harness) | **`P1.09`** bootstrap + `P7.04` harness |
| `apps/worker-media` | `P7.04` (generic harness) | **`P1.09`** bootstrap + `P7.04` harness |
| `apps/worker-social` | **no story; never named anywhere** | **`P1.09`** bootstrap + `P7.04` harness |

`P1.02` AC-4 was added so the `apps/*` workspaces exist before anything is asked
to live in them, and `P1.09` AC-2 makes each worker's queue set a machine-readable
manifest that `P17.06` AC-2 reconciles three ways.

### 14.3 `cicd.md` defines ten stages; the backlog built five — **corrected**

| Stage | Owner |
|---|---|
| 1–5 lint, typecheck, unit, integration, security/static | `P1.06`, `P1.07` |
| 6–7 build, container build | **`P17.09`** |
| 8 migration validation | **`P17.10`** |
| 9–10 deploy, smoke | **`P17.11`** |

`cicd.md` §5's environment gates are now enforced by the pipeline
(`P17.11` AC-3, AC-4) rather than verified by `P16.10` against nothing.

### 14.4 `FF-14` deferred to an epic that never claimed it — **corrected**

`P1.05` and `P1.07` now defer to `P4.11` by id. `epic-P16` NG6 records explicitly
that it does not own `FF-14` and why, so the forward reference cannot silently
re-form.

---

## 15. Gaps and known debts

### 15.1 Real gaps — all three closed

#### G-01 — ADR-0004 unmaterialised, `FF-18` unowned → **CLOSED**

| Field | Value |
|---|---|
| **Identifiers** | `ADR-0004`, `FF-18`, `architecture.md` §2.1 |
| **Closed by** | `P1.08` (`apps/api` NestJS bootstrap, 8 pts), `P1.09` (three worker bootstraps, 5 pts), `P1.10` (OpenAPI generate-and-diff, 5 pts) |
| **Wave** | 1 — earlier than the audit's `EC-1` deadline of wave 2 |
| **Evidence of closure** | `grep -rl 'ADR-0004' docs/epics docs/stories` → non-empty. `FF-18` appears in `epic-P1`'s exit gate. `apps/worker-social` is named in `P1.09` and in `epic-P1`'s affected surfaces. `P3.06`'s assumption that guards "run server-side in `apps/api`" now rests on a story that creates it. |
| **Residual** | None. `P1.10` ships against an empty route set by design; the check grows with each route-adding epic. |

#### G-02 — `FF-14` had no owning story → **CLOSED**

| Field | Value |
|---|---|
| **Identifiers** | `FF-14`, `ADR-0022` |
| **Closed by** | `P4.11` — Runtime credential resolver and FF-14 (5 pts), plus `P17.07` for the resources it reads through |
| **Wave** | 2 — exactly the audit's `EC-2` recommendation, and before `P4`'s ten adapter stories, `P11`'s live media adapters and `P13`'s live social adapters exist |
| **Evidence of closure** | `FF-14` is in `epic-P4`'s exit gate; `P1.05` and `P1.07` defer to `P4.11`; `epic-P16` NG6 declines it explicitly |
| **Residual** | None. Populating secret **values** stays an operational act outside the repository (`P17.07` out-of-scope), which is correct. |

#### G-03 — no infrastructure and no deploy path → **CLOSED**

| Field | Value |
|---|---|
| **Identifiers** | `ADR-0019`, `ADR-0020`, `cicd.md` §1 stages 6–10 |
| **Closed by** | **Epic `P17`** — 12 stories, 70 points, wave 3 |
| **Decision taken** | The audit offered two resolutions. The owner chose **add infrastructure to the plan**, not "record it as an out-of-band track". |
| **Evidence of closure** | `grep -rn 'sa-east-1'` over the backlog → `P17.02`. `grep -rni 'terraform\|IaC'` → `P17.01`. Staging exists (`P17.02`, `P17.11`) before `P16.09` measures against it. The production gate `P16.10` AC-4 verifies is built by `P17.11` AC-3/AC-4. |
| **Boundary held** | `P17` implements `aws-topology.md`; it re-decides nothing. Every deliberately-absent service stays absent, enforced by the promotion-gate check in `P17.01` AC-6. Observability **content** stays in `P16`; `P17.12` creates only its substrate and asserts zero alarm and zero dashboard resources in its own plan. |
| **Residual** | `OQ-P17-01` (three accounts vs three separated resource sets) is an operational choice; the separation **property** is asserted identically either way, so it blocks nothing. |

### 15.2 Known debts — 0 remaining (was 6)

Every debt the previous revision carried is closed. Each was closed by adding the
missing **citation** to the story that already implements the requirement — not by
adding work, and not by weakening a check.

| # | Debt | How it was closed |
|---|---|---|
| **D-01** | 8 functional requirements implemented but never cited by id | **Closed.** `FR-CR04`→`P8.01`, `FR-WF01`→`P8.02`, `FR-AP02`→`P12.04`, `FR-UC01`/`FR-UC06`→`P6.01`, `FR-BL02`→`P6.06`, `FR-KN02`→`P9.01`, `FR-IN01`→`P10.03`, each cited in its owning story's Architecture references with the requirement text. |
| **D-02** | 4 ADRs materialised without citation | **Closed.** `ADR-0021`→`P17.01`, `ADR-0023`→`P17.12`, `ADR-0032`→`P1.10`, `ADR-0012`→`P11.05`. `ADR-0014` was cited only by file path and now carries its id in `P11.01`. All 35 ADRs are cited by id. |
| **D-03** | 17 epic dependency edges implied but not declared | **Closed.** §13.2. Every header declares its full induced set, reciprocal both ways. |
| **D-04** | Test class 2 (Integration) never cited by its number | **Closed.** `P2.01`'s verification gate now names class 2 explicitly and records that it establishes the harness every later integration gate reuses. All 14 classes are cited by number. |
| **D-05** | `NFR-04` / `NFR-05` availability never asserted | **Closed.** `P16.08` AC-5 records `NFR-04`'s SLO with its measurement window and breach action on the platform dashboard, and records `NFR-05` as a maturity target **explicitly out of MVP scope** with no alarm against it — because an SLO nobody has committed to is an alarm nobody will answer. |
| **D-06** | `ASM-P8-*`, `ASM-P11-*`, `ASM-P13-*`, `ASM-P14-*` do not exist | **Closed as a naming question.** The eight new epics all use epic-scoped ids (`ASM-P17-*`…`ASM-P24-*`), so the convention is now the clear majority and the four exceptions are visibly exceptions rather than an ambiguous split. |

**Every identifier in every universe in §2 is now cited literally in at least one
epic or story.** There is no `semantic` row left in this audit: coverage that was
real but unprovable by grep has been made provable.

### 15.3 What is *not* a gap

- **All 12 `GATE-*` are open.** By design; see §9.
- **`RISK-13`** implies no engineering work; `risks.md` marks it `Accepted`.
- **`P6.07`** is the only P2-priority story and delivers 2 points of deliberately-
  unimplemented interface, per `FR-BL05` and `ADR-0029`. Correct — and `P23.05`
  AC-4 now requires the UI to state that absence as a decision rather than as
  pending work.
- **No `QAPolicy` automation, no email vendor, no payment gateway, no Storybook.**
  Four recorded refusals with an ADR behind each (`ADR-0033`, `ADR-0027`,
  `ADR-0029`, `ADR-0028`). Each now also has a screen that states the refusal
  honestly: `P22.06` AC-3, `P20.04` AC-3, `P23.05` AC-4, `P24.07` AC-6.
- **No MUI, Ant Design or full component framework.** Refused for the third time
  in `ADR-0035`, and the refusal is not revisitable within the MVP.

---

## 16. Verdict

### 16.1 What changed in this revision

| Dimension | Before | After |
|---|---|---|
| Epics | 16 | **24** |
| Stories | 166 | **253** |
| Story points | 888 | **1 443** |
| Waves | 10 | **13** |
| Critical path | 513 pts / 10 epics | **779 pts / 13 epics** |
| Real gaps | 3 | **0** |
| Known debts | 6 | **0** |
| Incorrect references | 1 | **0** |
| Same-wave dependencies | 1 | **0** |
| Missing epic edges | 18 | **0** |
| Epics at minimum feasible wave | 15/16 | **24/24** |
| ADRs | 34 | **35** |
| Fitness functions inside a gate | 31/33 | **33/33** |
| Identifiers covered only semantically | 12 | **0** |

New stories: **87**. Of those, **17** close audit gaps (`P1.08`–`P1.10`, `P4.11`,
`P17.01`–`P17.12`, plus `P1.02` AC-4) and **70** deliver the product experience
(`P18`–`P24`).

### 16.2 Is the backlog fit to begin implementation?

**Yes, and the three entry conditions of the previous revision are all met.**

| # | Previous entry condition | Status |
|---|---|---|
| **EC-1** | Close G-01 before wave 2 | **Met at wave 1** (`P1.08`, `P1.09`, `P1.10`) |
| **EC-2** | Close G-02 before wave 2; recommended home `P4.06` | **Met at wave 2** (`P4.11`, depending on `P4.06`) |
| **EC-3** | Close G-03 as a decision before wave 1 | **Met**: infrastructure added to the plan as `P17` at wave 3 |

The evidence for "yes":

- Structural integrity is perfect across a backlog 52% larger than the one
  audited previously: 253/253 stories reconcile against 24/24 epic tables in both
  directions, 1 443 points reconcile in both directions, zero dangling references,
  zero orphans, zero wave violations, zero reciprocity asymmetries, and — the one
  the previous revision could not claim — **zero dependencies inside the same wave**.
- Every ADR, every fitness function, every transition, every gate, every test
  class, every functional requirement, every design principle, every screen
  blueprint and every conformance criterion has an owner.
- Every epic sits at its minimum feasible wave, so the plan contains no
  undocumented slack and no hidden serialisation.
- The gaps that existed were at the edges of the system — application bootstrap,
  infrastructure, one credential check, one contract check — and are now closed
  at the earliest wave where each is buildable rather than at the latest wave
  where each is discoverable.

### 16.3 Decisions still to schedule

| # | Decision | Latest useful moment |
|---|---|---|
| **DC-1** | `OQ-P16-05` / `OQ-P23-01` — reconcile the `T22` precondition list between `workflows-state-machines.md` §2.2 and `provider-cost-ledger.md` §5 | **Before wave 5**, because `P8.07` implements `T22` there and `FF-06` makes the transition unwritable outside the engine afterwards. **This is now the only remaining pre-wave-5 decision.** |
| **DC-2** | `OQ-P17-01` — three AWS accounts or three separated resource sets | Before wave 3. Does not block `P17`; the separation property is asserted either way. |
| **DC-3** | `OQ-P16-02` — document the in-app notification read route as an additive `v1` change in `api-contracts.md` §5 | **Before wave 4**, not wave 13: `P20.04` consumes it. |
| **DC-4** | `OQ-PX-02`, `OQ-PX-03` — words-per-minute default and per-channel minimum interval | Before wave 11; both are configuration with documented defaults. |
| **DC-5** | `OQ-PX-04` — whether the light theme is a launch commitment | Before wave 2 is ideal, but the token layer and contrast test cover it either way. |
| **DC-6** | Open the commercial gates with external lead times — `GATE-MT01`, `GATE-TT01`, `GATE-HG01`, `GATE-EL01` | **Now.** None blocks a wave; all block a launch; all are outside engineering's control. |

### 16.4 Open questions that block implementation

**None.** `DC-1` is the earliest and it is due before wave 5, four waves after
implementation may begin.

**Wave 1 (`P1`, 10 stories, 52 points) may start immediately.** Its only open
question, `OQ-P1-01`, is closed by `P1.01` AC-4 as part of the work itself.

---

## 17. Reproducing this audit

The universes:

```
grep -rhoE '\bFR-[A-Z]{1,2}[0-9]+[a-z]?\b' docs/architecture | sort -u | wc -l   # 94
grep -ohE  'NFR-[0-9]+'  docs/architecture/prd.md              | sort -u | wc -l  # 15
ls docs/architecture/adr/0*.md                                          | wc -l   # 35
grep -ohE  'FF-[0-9]+'   docs/architecture/fitness-functions.md | sort -u | wc -l # 33
grep -ohE  '\bT[0-9]{2}[a-c]?\b' docs/architecture/workflows-state-machines.md | sort -u | wc -l  # 26
grep -cE   '^## Phase '  docs/architecture/implementation-sequencing.md           # 16
grep -rhoE 'GATE-[A-Z0-9]+' docs/architecture                  | sort -u | wc -l  # 12
grep -ohE  'RISK-[0-9]+' docs/architecture/risks.md            | sort -u | wc -l  # 20
grep -ohE  '\bPD-[0-9]{2}\b' docs/product/VYRA_PRODUCT_EXPERIENCE.md | sort -u | wc -l  # 10
grep -ohE  '\bC-[0-9]{2}\b'  docs/product/VYRA_PRODUCT_EXPERIENCE.md | sort -u | wc -l  # 14
grep -cE   '^### 3[123]\.'   docs/product/VYRA_PRODUCT_EXPERIENCE.md               # 44
```

The backlog totals:

```
ls docs/epics/epic-P*.md   | wc -l                                                # 24
ls docs/stories/*.story.md | wc -l                                                # 253
grep -h '^- \*\*Story points\*\*:' docs/stories/*.story.md \
  | grep -oE '[0-9]+' | paste -sd+ | bc                                           # 1443
```

Coverage for any identifier `X`:

```
grep -rlE "\bX\b" docs/epics docs/stories
```

Structural integrity — the checks in §1.1 — is reproduced by parsing each epic
header and story-table row and each story header, then comparing them pairwise.
Every check in that table is a two-sided comparison; a one-sided check would have
missed the `P15 → P14` edge that the previous revision found only by inspecting
story dependencies by hand.

> **Caveat, repeated deliberately.** `grep -oE 'FR-[0-9]+'` on `prd.md` returns 15
> matches. All 15 are false positives — the tail of `NFR-01`…`NFR-15`. There is no
> `FR-<NN>` identifier in this corpus. Use the `\b` anchor and the two-scheme
> universe in §3.
