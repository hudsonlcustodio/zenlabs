# ADR-0033 — VYRA QA is `HUMAN_REQUIRED` in MVP, distinct from client approval

**Status**: Accepted · **Authority**: brief §18; user decision closing OQ-04

## Context
Brief §18 makes *client* approval of script and final video configurable per
tenant (`MANUAL` / `AUTO`), and states that QA may later be human, automated or
AI-assisted — while also requiring that automation never removes security or
governance requirements.

An earlier draft conflated the two: it allowed T13 (QA) to be satisfied by the
system when the tenant's approval policy was `AUTO`. That would have let a
customer setting disable VYRA's own quality and governance gate.

## Decision
**VYRA QA and client approval are separate gates.**

- The final-video QA policy in MVP is **`HUMAN_REQUIRED`** and is **not
  tenant-configurable**. A human `QA_REVIEWER` verdict is mandatory before a
  content item may reach `READY`, `SCHEDULED` or `PUBLISHED`.
- Client approval of script (T05/T06) and video (T15/T16) remains **configurable
  `MANUAL` or `AUTO`** per tenant. `AUTO` skips only the tenant's acceptance.
- `QAPolicy` is an extensible enumeration: `HUMAN_REQUIRED` (default and the only
  value in MVP use), `AI_ASSISTED` (modeled, not enabled), `AUTOMATED`
  (reserved). **No fully automated QA policy is an MVP requirement.**

## Alternatives rejected
- **Tenant-configurable QA** — rejected: it lets a commercial setting disable a
  governance control on synthetic identity media. Brief §18 forbids automation
  removing governance.
- **Fully automated QA in MVP** — rejected: not required by the brief, and no
  validated automated check exists for likeness/voice fidelity or brand fit.
- **No QA gate at all when client approval is `AUTO`** — rejected: this is the
  exact defect this ADR corrects.
- **Merging QA into client approval** — rejected: different owner, different
  purpose, different failure consequence.

## Consequences
- T13 requires a human verdict; `QARecord` carries reviewer and verdict.
- Adding `AI_ASSISTED` later introduces an intelligence task and pre-populated
  findings but **no new state and no new transition** — the human verdict remains.
- QA reviewer throughput becomes an operational capacity concern (RISK-18).
- Verified by FF-33.
