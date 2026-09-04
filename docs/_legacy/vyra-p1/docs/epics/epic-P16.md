---
id: P16
title: "Operations: observability, retention, notifications and load"
status: generated
depends_on: [P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13, P14, P15, P17, P18, P19, P20, P21, P22, P23, P24]
---

# Epic P16 — Operations: observability, retention, notifications and load

- **Epic ID**: `P16`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 15
- **Status**: `generated`
- **Wave**: 13
- **Priority**: P0
- **Depends on**: `P1`, `P2`, `P3`, `P4`, `P5`, `P6`, `P7`, `P8`, `P9`, `P10`, `P11`, `P12`, `P13`, `P14`, `P15`, `P17`, `P18`, `P19`, `P20`, `P21`, `P22`, `P23`, `P24`
- **Blocks**: —
- **Story points (epic total)**: 68
- **Stories**: 10
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Turn the operational contract already written in `observability.md` into running mechanism, and close the four deferrals earlier epics deliberately parked here — retention enforcement, balance polling, runbooks and notification dispatch — so nothing reaches production as an unowned promise.

**Goals**
- G1 Structured logging with correlation propagation and a redaction layer that FF-20 proves works.
- G2 Every metric domain in `observability.md` §3 emitted, including the routing, relay and reconciliation signals earlier stories declared they would expose.
- G3 Every alarm in `observability.md` §4 defined, and every alarm carrying a runbook — the phase's definition of done.
- G4 Retention enforced for every dataset in `database-schema.md` §5, proved by FF-31.
- G5 `NotificationProvider` delivering in-app only, with `EmailProvider` left unimplemented behind GATE-NOTIF01.
- G6 Class 14 load tests executed against staging and meeting NFR-01, NFR-02 and NFR-03. **Staging is provisioned and deployed by `P17`**; before that epic existed, this goal referenced an environment no story created.

**Non-goals**
- NG1 No email delivery. ADR-0027 defers the vendor and GATE-NOTIF01 blocks email at launch, not the architecture.
- NG2 No distributed tracing. `observability.md` §6 defers OpenTelemetry until gate G-G introduces a second deployable service.
- NG3 No new AWS service. `implementation-sequencing.md` rule 3 forbids introducing one without a fired promotion gate in `scalability-gates.md` §2.
- NG4 No autoscaling. `scalability-gates.md` states its thresholds are analysis and promotion triggers, never autoscaling rules.
- NG5 No provisioning and no deploy path. Infrastructure as code, the three environments and `cicd.md` §1 stages 6–10 are epic `P17`, at wave 3. This epic **consumes** the log groups, metric namespace and alarm target `P17.12` creates, the staging environment `P17.11` deploys to, and the deploy record `P17.11` writes.
- NG6 No `FF-14`. `P1.05` and `P1.07` once deferred the Secrets Manager fitness function to this epic, which never claimed it. It is now owned by `P4.11` at wave 2, where the credential paths are first written.

**Acceptance evidence**
- AE1 A sensitive fixture pushed through the logger does not survive redaction (FF-20).
- AE2 Every dataset in `database-schema.md` §5 has a retention mechanism FF-31 can find.
- AE3 Every alarm in `observability.md` §4 resolves to a runbook entry.
- AE4 The load suite meets NFR-01, NFR-02 and NFR-03 on staging.

**Assumptions**
- ASM-P16-01 Alarms and dashboards are CloudWatch constructs per `aws-topology.md` §2; no observability vendor is introduced, because none is named in any artifact and choosing one here would be arbitrary.
- ASM-P16-02 Retention of `audit_record` is executed by a privileged maintenance role, not by `vyra_app`, because FF-11 denies the application role `DELETE` and that denial is the point of the table.
- ASM-P16-03 This epic sits at wave 13 rather than wave 10 because it depends on every other epic, and the epic set now includes `P17` (infrastructure, wave 3) and `P18`–`P24` (design system, components, shell, three surface experiences and conformance, waves 2–12). Its position at the end of the plan is unchanged; only the number moved.

---

## Architecture Spec Summary

**Affected surfaces**: `packages/observability`, module 20 `notifications`, scheduled maintenance jobs, `docs/runbooks/`, `tests/load/`, CloudWatch alarm and dashboard definitions.

**Integration points**: HeyGen credit balance read via the existing `provider-architecture.md` §1 port for the hourly sync in `workflows-state-machines.md` §7. No new external system.

**Risks**
- RISK-15 / RISK-20: the email vendor is undecided. ADR-0027 makes in-app the MVP channel so the deferral is a recorded decision rather than a gap discovered at launch.
- An alarm without a runbook is an alarm that trains people to ignore alarms; `implementation-sequencing.md` Phase 15 makes the pairing the definition of done, which is why P16.03 is sized against P16.02 one-for-one.
- A retention job with `DELETE` on `audit_record` granted to `vyra_app` would quietly undo FF-11. ASM-P16-02 and P16.04 keep the grant with the migrator role.
- RISK-14 / GATE-COST01: where a provider does not expose a per-job cost, cost dashboards read `estimated` entries. The gap is displayed, never smoothed over.

**References (by path)**
- `docs/architecture/observability.md` §1, §2, §3, §4, §5, §6, §7
- `docs/architecture/database-schema.md` §5, §3.7
- `docs/architecture/fitness-functions.md` FF-11, FF-20, FF-31
- `docs/architecture/adr/0027-notifications.md`
- `docs/architecture/provider-cost-ledger.md` §5
- `docs/architecture/workflows-state-machines.md` §7
- `docs/architecture/testing-strategy.md` class 14, §6
- `docs/architecture/prd.md` §8.13, NFR-01, NFR-02, NFR-03, NFR-12
- `docs/architecture/aws-topology.md` §2, §5, §7
- `docs/architecture/scalability-gates.md` §1, §2

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | No new client resource; `GET /control/provider-health` and `GET /control/provider-balance` are the existing reads | `api-contracts.md` §5; the in-app notification read path is OQ-P16-02 |
| DB | `notification`; `provider_balance`; retention enforcement over `audit_record`, `domain_event` published rows, `webhook_event.payload`, `performance_snapshot.raw_payload`, `idempotency_key`, revoked-tenant `knowledge_chunk` | `database-schema.md` §3.7, §5; `provider-cost-ledger.md` §5 |
| UI | [N/A] | Operational screens are `P15.18`; dashboards are CloudWatch per `aws-topology.md` §2. |
| Env/Config | Alarm thresholds and windows, retention horizons, per-provider low-balance thresholds, notification channel enablement, load profile | Configuration per `observability.md` §4 and `provider-cost-ledger.md` §5 |
| Event | FR-NT01 triggers routed through `NotificationProvider`, consumed off the `notification-send` queue | ADR-0027; `aws-topology.md` §6 |
| Build | `pnpm fitness` gains FF-20 and FF-31; class 14 suite wired per `testing-strategy.md` §6 | `fitness-functions.md`; `cicd.md` §1 |

---

## ADR / NFR Notes

- ADR-0027 defines both `NotificationProvider` and `EmailProvider` and defers only the vendor; MVP ships in-app because in-app needs no vendor. Every FR-NT01 trigger routes through the port so enabling email later is implementing one adapter.
- FR-NT02 forbids choosing an email vendor without an ADR, which is exactly what GATE-NOTIF01 holds open.
- `observability.md` §7 forbids conflating `audit_record` with application logs; they have different retentions and different grants, and P16.04 must not treat them as one dataset.
- `observability.md` §6 defers OpenTelemetry with a named trigger (gate G-G); correlation-ID linking is the MVP mechanism.
- NFR-12 requires that environments share no database, bucket, queue, secret, credential, token or provider key. `epic-P1.md` records that this is only fully verifiable once real resources exist, and names this epic as the place.
- `implementation-sequencing.md` rule 4 states external gates never block a phase; they block production launch of the affected capability. P16.10 makes that register explicit rather than tribal.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| `observability.md` §3 | metric emission | `P16.01` | AC-1..5 | integration + metric assertions | - |
| `observability.md` §4 | alarm definitions | `P16.02` | AC-1..4 | alarm-inventory test | - |
| `implementation-sequencing.md` Phase 15 DoD | runbook per alarm | `P16.03` | AC-1..5 | runbook-index test + drill | - |
| `database-schema.md` §5 / FF-31 | retention jobs | `P16.04` | AC-1..5 | FF-31 in CI | resolves OQ-P2-01 |
| `provider-cost-ledger.md` §5 / `workflows-state-machines.md` §7 | balance sync loop | `P16.05` | AC-1..4 | integration + class 4 | resolves OQ-P4-01 |
| ADR-0027 / FR-NT01, FR-NT02 | `NotificationProvider` in-app | `P16.06` | AC-1..5 | integration + class 9 | GATE-NOTIF01 |
| `observability.md` §1, §2 / FF-20 | logger + redaction | `P16.07` | AC-1..5 | FF-20 in CI | - |
| `observability.md` §5 | operational dashboards | `P16.08` | AC-1..4 | dashboard-inventory test | GATE-COST01 |
| NFR-04 / NFR-05 | availability SLO recorded; maturity target marked out of scope | `P16.08` | AC-5 | dashboard content assertion | closes D-05 |
| `testing-strategy.md` class 14 / NFR-01..03 | load suite | `P16.09` | AC-1..4 | class 14 on staging | - |
| NFR-12 / `risks.md` §3 | environment separation + gate register | `P16.10` | AC-1..4 | integration + register review | external gates |

**BDD example IDs**
- EX-P16-01 GIVEN a log record carrying a token, a complete prompt and document text, WHEN it passes the redaction layer, THEN none of the fixtures survive.
- EX-P16-02 GIVEN any alarm listed in `observability.md` §4, WHEN the runbook index is checked, THEN a runbook entry exists for it and names an owner action.
- EX-P16-03 GIVEN any dataset listed in `database-schema.md` §5, WHEN FF-31 runs, THEN it finds a scheduled purge job or an S3 lifecycle rule for it.
- EX-P16-04 GIVEN a provider credit balance below its configured threshold, WHEN the hourly sync runs, THEN the low-balance alarm fires and affected items move to `BLOCKED` via T22 rather than failing repeatedly.
- EX-P16-05 GIVEN a script awaiting approval, WHEN the notification is dispatched, THEN it is delivered in-app through `NotificationProvider` and no `EmailProvider` implementation is invoked.
- EX-P16-06 GIVEN staging under the declared load profile, WHEN the class 14 suite runs, THEN P95 read latency is under 500 ms, P95 write latency is under 800 ms and critical screen load is under 3 s.
- EX-P16-07 GIVEN a message resting in a DLQ, WHEN the redrive runbook is followed, THEN the message is reprocessed with a single effect under the P7.05 keys.
- EX-P16-08 GIVEN an `audit_record` beyond its five-year horizon, WHEN the retention job runs, THEN the row is expired by the maintenance role and `vyra_app` still holds neither UPDATE nor DELETE.
- EX-P16-09 GIVEN a correlation identifier accepted at the edge, WHEN the work traverses HTTP, outbox, queue and worker, THEN every emitted record carries the same identifier.

**Open questions**
- OQ-P16-01 GATE-NOTIF01 stays open by design. It blocks email delivery at production launch, not this epic and not in-app notifications (ADR-0027, RISK-20).
- OQ-P16-02 `api-contracts.md` §5 documents no route for reading in-app notifications. The `notification` table and the `notification-send` queue both exist, so the read path is a documented contract gap to be closed as an additive `v1` change under `api-contracts.md` §1; it is recorded here rather than invented.
- OQ-P16-03 The load profile itself — concurrent tenants, request mix and duration — is not fixed in any artifact. `testing-strategy.md` class 14 fixes when the suite runs and what it verifies, not its shape; the profile is an operational decision recorded in `P16.09`.
- OQ-P16-04 `prd.md` §11 records that success-metric thresholds require a commercial decision (OQ-03). Dashboards therefore display the series without a target line.
- OQ-P16-05 `provider-cost-ledger.md` §5 states that a depleted balance moves affected items to `BLOCKED` via T22, but the T22 precondition list in `workflows-state-machines.md` names consent revocation, twin/voice revocation, subscription suspension and entitlement exhaustion without naming balance depletion. `P16.05` follows the balance document, which is the specific authority; the transition table wording is a documentation gap to be reconciled, not a behavioural choice made here.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 10/10 mapped; contracts 5/5 actionable entries mapped; examples 9/9 mapped to validations; unresolved gap codes: GATE-NOTIF01 (email only), GATE-COST01 (estimated cost entries), OQ-P16-05 (T22 precondition wording).

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P16.01` | Metric emission across every observability domain | 8 | — | P0 |
| `P16.02` | Alarms for every condition in `observability.md` §4 | 5 | `P16.01` | P0 |
| `P16.03` | A runbook for every alarm, including DLQ redrive, ingestion recovery and production restore | 8 | `P16.02` | P0 |
| `P16.04` | Retention jobs for every dataset and FF-31 | 8 | — | P0 |
| `P16.05` | Provider balance sync loop and low-balance handling | 5 | `P16.01` | P0 |
| `P16.06` | `NotificationProvider` with in-app delivery; `EmailProvider` deferred | 8 | — | P0 |
| `P16.07` | Structured logging, correlation propagation and the redaction layer | 8 | — | P0 |
| `P16.08` | Operational dashboards | 5 | `P16.01` | P1 |
| `P16.09` | Load tests against NFR-01, NFR-02 and NFR-03 | 8 | `P16.08` | P0 |
| `P16.10` | Environment separation verification and the production gate register | 5 | `P16.03` | P1 |

**Verification gate (epic exit)**: `pnpm fitness` green with FF-20 and FF-31 both passing; the alarm inventory test shows every condition in `observability.md` §4 defined and every one resolving to a runbook entry; the class 14 suite executed against staging meets NFR-01, NFR-02 and NFR-03; a redaction fixture run confirms no token, prompt, document text or signed URL survives the logger; `EmailProvider` has no implementation and GATE-NOTIF01 is recorded as open in the launch register. Additionally, the load suite runs against the staging environment provisioned and deployed by `P17`, and the production gate register is populated from the durable deploy record `P17.11` AC-6 writes rather than from a manual list.
