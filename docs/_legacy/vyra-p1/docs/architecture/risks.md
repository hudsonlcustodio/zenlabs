# VYRA — Risk Register

- **Authority**: brief §33, §49, §54
- **IMPLEMENTATION NOT STARTED**

## 1. Classification

Severity = impact if it materialises. Likelihood = at current evidence.

| ID | Risk | Sev | Lik | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| RISK-01 | TikTok app unaudited ⇒ posts restricted to `SELF_ONLY`; public reach impossible | High | **Certain** until audited | GATE-TT01; Portal states the restriction; channel launch gated | Commercial | Open |
| RISK-02 | HeyGen Enterprise contract unsigned ⇒ no live credentials, unverified contract details | High | Certain now | GATE-HG01; mock-first (ADR-0011); polling-first (ADR-0012) | Commercial | Open |
| RISK-03 | Identity/voice misuse or consent bypass | **Critical** | Low | Consent aggregate, guard at T08/T10, irreversible revocation, FF-12/FF-30 | Engineering | Mitigated by design |
| RISK-04 | Double or missing minute consumption | **Critical** | Low | Append-only ledger, `usage_commit_once`, reserve/commit/release points (ADR-0018) | Engineering | Mitigated by design |
| RISK-05 | No Storybook adapter for the chosen stack | Medium | Certain | ADR-0028; proceed without page-stories; GATE-UX01 | Engineering | Accepted |
| RISK-06 | Prompt injection via client knowledge | High | Medium | Data-region isolation, FF-27, output validation | Engineering | Mitigated by design |
| RISK-07 | Cross-tenant leakage incl. embeddings | **Critical** | Low | RLS + `SET LOCAL` + repository context + object checks; FF-01/FF-05 | Engineering | Mitigated by design |
| RISK-08 | Provider unavailability breaks critical flows | High | Medium | Error taxonomy, bounded retries, breaker, reconciliation | Engineering | Mitigated by design |
| RISK-09 | TikTok AIGC disclosure mechanism unconfirmed | Medium | Certain now | GATE-TT02; publication blocked rather than guessed | Engineering | Open |
| RISK-10 | No canonical branding | Low | Certain | ASM-BR01; owned primitives; placeholder tokens | Product | Open |
| RISK-11 | Compromised internal `SUPER_ADMIN` can revoke consent or adjust usage | High | Low | MFA re-assertion + audit + alarms; dual approval deferred | Engineering | Accepted residual |
| RISK-12 | First-party authentication carries implementation risk versus a managed IdP | Medium | Low | ADR-0005 rationale; concrete parameters; FF-23; security tests | Engineering | Accepted |
| RISK-13 | `sa-east-1` unit costs exceed US regions | Low | Certain | ADR-0019; accepted for latency and residency | Commercial | Accepted |
| RISK-14 | Provider cost per job not exposed by every provider | Medium | Medium | GATE-COST01; entries marked `estimated`, never invented | Engineering | Open |
| RISK-15 | Email/notification vendor undecided (see RISK-20 for the launch view) | Medium | Certain | ADR-0027; GATE-NOTIF01 | Product | Open |
| RISK-16 | Embedding dimension change requires backfill | Low | Medium | `halfvec`; expand/contract procedure (`migrations.md` §4) | Engineering | Mitigated |
| RISK-17 | Meta PPA/2FA/account-type prerequisites block onboarding | Medium | Medium | Pre-flight connection health checks; explicit onboarding copy | Product | Open |
| RISK-18 | Human QA (`HUMAN_REQUIRED`) becomes a throughput bottleneck as tenants scale | Medium | Medium | ADR-0033; `AI_ASSISTED` pre-population is the modeled relief path; QA queue age is an observed metric | Operations | Accepted |
| RISK-19 | Ingestion failure leaves a committed generation with no VYRA-side asset | Medium | Low | ADR-0034; `INGESTING` retries, preserved provider ref, manual recovery runbook; never auto re-render (FF-32) | Engineering | Mitigated by design |
| RISK-20 | Email delivery vendor undecided at launch | Medium | Certain | ADR-0027; in-app notifications ship first; GATE-NOTIF01 | Product | Open |

## 2. Critical-risk summary

Four risks are Critical: identity misuse (RISK-03), consumption correctness
(RISK-04), tenant isolation (RISK-07), and — by aggregation — anything that
would let a forged event commit usage (covered by ADR-0031). Each has a
structural mitigation enforced by a fitness function, not by process discipline.

## 3. External gates required before production

| Gate | Blocks | Owner |
|---|---|---|
| GATE-HG01 | HeyGen Enterprise contract + credentials | Commercial |
| GATE-HG02 | API Digital Twin provisioning confirmation | Commercial + integration |
| GATE-HG03 | API vs Studio credit semantics | Integration |
| GATE-HG04 | HeyGen webhook availability/signature scheme | Integration |
| GATE-EL01 | ElevenLabs workspace/PVC requirements | Commercial + integration |
| GATE-TT01 | TikTok app audit (public visibility) | Commercial |
| GATE-TT02 | TikTok AIGC disclosure mechanism | Integration |
| GATE-MT01 | Meta App Review | Commercial |
| GATE-MT02 | Meta scope names confirmation | Integration |
| GATE-COST01 | Per-provider cost field availability | Integration |
| GATE-UX01 | Storybook adapter absence accepted | Engineering |
| GATE-NOTIF01 | Email delivery vendor selection (blocks email only) | Product |

None blocks architecture. All block production launch of the affected capability.

## 4. Appendix — orchestration pipeline notes (operational)

Recorded so the finding is not lost.

### 4.1 `*arch-plan` cannot advance past stage 1 without an epic

`*arch-plan` registers a 15-stage pipeline, but stage 1 (`*arch-prd`) is the only
stage that runs standalone. Invoking stage 2 returns:

```
[NEOCORTEX] ERRO (EPIC_REQUIRED): Epic obrigatorio para *arch-architecture.
Use @epic-<id> ou docs/epics/epic-<id>.md.
```

`*arch-plan` never creates an epic, and creating one is forbidden by brief §52.
The refreshed checkpoint also stayed at `currentStageCommand: arch-prd` with
`completionEvidenceAccepted: false` after `prd.md` was written, so stage
completion was never registered server-side. Consequence: artifacts A02–A12 and
the fitness-function/pact generators were produced **by hand** rather than by the
pipeline. This is a tooling gap, not an architecture decision.

### 4.2 Intake parsing behaviour (reproducible)

- The intent normaliser takes the text between the **first and second `"`
  characters** as `goal`. A brief containing an inner quoted phrase is therefore
  truncated at that inner quote — this, not a length cap, caused the original
  `arch-plan-idea-truncated` blocker.
- Intake answers are accepted as **labelled lines** (`goal:`, `problem:`,
  `actors:`, `surfaces:`, `outcomes:`, `project-mode:`); list values are split on
  **commas**, not semicolons.
- Working payload preserved at `CANDIDATE-v2.args.txt` in the session scratchpad.

### 4.3 Duplicate quota charge

Each `*arch-plan` dispatch created a **new** accounting record and debited 13
quota units, with `previouslyApplied: false` and `priorReceiptCount: 0` every
time — there is no non-charging resume path in the client.

- Invocation 1: `arch-accounting-4f9c6d17-…` / `arch-receipt-20de2602565d9715`
- Invocation 2 (**disputed** — produced nothing, answers not registered):
  `arch-accounting-3bc9d0af-…` / **`arch-receipt-30a9c0cbd6352ff5`**
- Invocations 3–4: `arch-accounting-e5e5c9a3-…`, `arch-accounting-cf99ac15-…`

`*billing` reports tier ENTERPRISE with Unlimited daily invocations, daily steps
and weekly plans, and exposes **no receipt or usage ledger**, so the debits could
not be reconciled from the client. Support contact for a dispute:
`licensing@neocortex.sh`. The GitHub `bugs` URL in the package manifest
(`ornexus-ai/neocortex`) returns 404 and is unusable.
