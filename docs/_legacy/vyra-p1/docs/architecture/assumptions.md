# VYRA — Assumptions Register

- **Authority**: brief §45, §53; orchestration instruction to derive Product
  Experience from the brief and mark it as assumptions.
- **Rule**: every item here is **derived, not confirmed**. None is presented as
  fact, and none is a placeholder pretending to be complete.
- **IMPLEMENTATION NOT STARTED**

## 1. Product Experience (derived — server reported these as blockers)

| ID | Assumption | Derived from | Review trigger |
|---|---|---|---|
| ASM-P01 | Persona "The Principal": sole portal user who is also the identity owner | brief §3, §4, §7 | User research |
| ASM-P02 | Persona "The Operator": VYRA internal staff across tenants | brief §4 | User research |
| ASM-P03 | Persona "The Identity Owner": consent subject, modeled separately | brief §31 | Legal + user research |
| ASM-J01..J07 | Jobs to be done | brief §3, §16 | User research |
| ASM-JR01..JR06 | Critical journeys | brief §3, §17 | UX design |
| ASM-BP01 | 11-stage service blueprint | brief §3 pipeline | UX design |
| ASM-IA01 | Information architecture and screen seeds | brief §4, §24 | UX design |
| ASM-M01..M06 | Success metrics (no targets set) | brief §24 | Commercial decision |
| ASM-BR01 | No canonical branding exists; tokens are placeholders | repository inspection | Branding delivery |

Product Experience remains **incomplete** by the server's own assessment;
`canGenerateBackend` and feature generation stay gated there. These derivations
unblock architecture without pretending the product research was done.

## 2. Technical assumptions

| ID | Assumption | Basis | Review trigger |
|---|---|---|---|
| ASM-HG01 | Avatar V is not universally supported across looks | brief §10 | Capability query at integration |
| ASM-MT01 | Meta rate limits and PPA behaviour are operational config | brief §48 | Integration |
| ~~ASM-UL01~~ | **RESOLVED** — ingestion decoupled from billability | user decision; ADR-0034 | closed |
| ASM-PF01 | Cross-platform metric aggregation is indicative only; per-platform is default | brief §24 non-parity | Product review |
| ASM-CR01 | Only `objective` and `channel` are mandatory on a content request | brief §16 "do not over-require" | Product review (OQ-01) |
| ~~ASM-QA01~~ | **RESOLVED** — MVP QA policy is `HUMAN_REQUIRED` | user decision; ADR-0033 | closed |
| ASM-EMB01 | Embedding dimensionality fits `halfvec` HNSW limits | pgvector docs | Model selection |

## 2.1 Decisions that closed prior assumptions

| Was | Now | Recorded in |
|---|---|---|
| ASM-UL01 (ingestion/billing coupling) | Decoupled — provider outcome alone determines billability | ADR-0034, `usage-ledger.md` §6 |
| ASM-QA01 (QA automation level) | `HUMAN_REQUIRED` canonical in MVP | ADR-0033, `workflows-state-machines.md` §2.5 |
| OQ-02 (email vendor) | Deliberately deferred; ports defined | ADR-0027, GATE-NOTIF01 |

## 3. Assumptions that would change the architecture if wrong

- ~~**ASM-UL01**~~ — **closed by decision** (ADR-0034): billability follows the
  provider outcome alone; ingestion is a separate recovery concern. The former
  coupling has been removed from the state machine and the ledger.
- **ASM-HG01** — if Avatar V were universal, the capability registry could be
  simplified; it is retained because the brief forbids assuming support.
- ~~**ASM-QA01**~~ — **closed by decision** (ADR-0033): MVP QA is
  `HUMAN_REQUIRED`. `AI_ASSISTED` remains modeled and would add an intelligence
  task and pre-populated findings, but no new state and no new transition.

## 4. Explicitly NOT assumed

The following were left as gates rather than assumptions, because guessing them
would violate brief §48: HeyGen webhook contract (GATE-HG04), TikTok AIGC
disclosure field (GATE-TT02), Meta scope names (GATE-MT02), per-provider cost
fields (GATE-COST01), ElevenLabs workspace requirements (GATE-EL01), the email
delivery vendor (GATE-NOTIF01), and all provider prices, rate limits and quotas.
