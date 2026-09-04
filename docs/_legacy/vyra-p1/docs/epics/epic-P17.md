---
id: P17
title: "Infrastructure as Code, environments and delivery pipeline"
status: generated
depends_on: [P1, P2]
---

# Epic P17 — Infrastructure as Code, environments and delivery pipeline

- **Epic ID**: `P17`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → **new track**, derived from `aws-topology.md` and `cicd.md` §1 stages 6–10 (see ADR / NFR Notes)
- **Status**: `generated`
- **Wave**: 3
- **Priority**: P0
- **Depends on**: `P1`, `P2`
- **Blocks**: `P16`
- **Story points (epic total)**: 70
- **Stories**: 12
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Turn `aws-topology.md` from a description into provisioned, reproducible, environment-separated infrastructure, and complete the five `cicd.md` §1 stages the backlog never built — build, container build, migration validation, deploy and smoke. This epic exists to close gap **G-03**: `P16.09` runs load tests "against staging" and `P16.10` verifies a production deployment gate, while no story created staging or the deployment.

**Goals**
- G1 Every resource in `aws-topology.md` §2 exists as code, in `sa-east-1` (ADR-0019), with no resource the topology marks as deliberately absent (ADR-0020, ADR-0021).
- G2 Three environments — development, staging, production — sharing no database, bucket, queue, secret, credential, token or provider key (`NFR-12`, `aws-topology.md` §7).
- G3 `cicd.md` §1 stages 6–10 built and blocking, with the environment gates of `cicd.md` §5 enforced by the pipeline rather than by convention.
- G4 A deploy that is traceable to a commit SHA and reversible to the previous image (`cicd.md` §3, `aws-topology.md` §3).
- G5 Least-privilege access by construction: an instance profile that can reach only its own environment's S3 prefixes, queues, secrets and KMS keys.
- G6 No promotion beyond the lean baseline: introducing a service whose gate in `scalability-gates.md` has not fired fails the infrastructure check.

**Non-goals**
- NG1 No change to the canonical architecture. This epic **implements** `aws-topology.md`; it does not re-decide it. Every deliberately-absent service (Kubernetes, EKS, ECS, ALB, Redis, EventBridge, multi-AZ RDS, service mesh, data lake) stays absent.
- NG2 No observability content — dashboards, alarms and runbooks are `P16`. This epic creates the log groups, metric namespace and alarm substrate they need, and nothing more.
- NG3 No application behaviour. The only thing deployed at this wave is what exists: the health routes from `P1.08` and `P1.09`.
- NG4 No production launch. Provisioning production is not launching it; the launch gate register is `P16.10`.
- NG5 No secrets **values**. This epic provisions secret containers, keys and policies; `P4.11` owns the resolver and the runtime path.

**Acceptance evidence**
- AE1 A destroyed and re-applied non-production environment reaches an identical, working state from code alone.
- AE2 A resource created outside code is detected as drift and reported by the infrastructure CI lane.
- AE3 A policy that grants one environment access to another environment's bucket, queue, secret or key fails the separation check naming both environments.
- AE4 A merge to `main` deploys to staging and runs smoke; a red smoke rolls back to the previous image automatically.
- AE5 A migration containing an unguarded destructive change fails the migration-validation stage before any environment is touched.
- AE6 A pull request adding an ALB, an ElastiCache cluster or an EKS resource fails the promotion-gate check citing `scalability-gates.md`.

**Assumptions**
- ASM-P17-01 Terraform is the IaC tool. `aws-topology.md` names no tool; this epic selects one and records it in `P17.01`, on the same basis `P1.01` selected pnpm. A different tool may be substituted only by amending `P17.01`.
- ASM-P17-02 Three separated AWS accounts are the target; `aws-topology.md` §7 permits "at minimum, separated resource sets with no shared identity" as the fallback. `P17.02` implements whichever the account structure allows and asserts the separation property either way.
- ASM-P17-03 This epic is placed at wave 3 because its real dependencies are the repository (`P1`) and the migration tooling (`P2`), not the domain. It is deliberately far earlier than `P16`, which consumes it.

---

## Architecture Spec Summary

**Affected surfaces**: `infra/` (new workspace root), `.github/workflows/`, `apps/*` container definitions, `docs/api/openapi.yaml` publication step.

**Integration points**: AWS (`sa-east-1`), GitHub Actions via OIDC federation. No product provider is contacted by this epic.

**Risks**
- Infrastructure created by hand and described afterwards is infrastructure nobody can rebuild. AE1 and AE2 exist to make that failure mode loud.
- A deploy path built after fifteen waves of application code is a deploy path built under pressure. This epic is at wave 3 for the same reason `P1` is at wave 1.
- RISK-13 (`sa-east-1` unit cost above US regions) is accepted by ADR-0019 and is not re-litigated here.
- Over-provisioning is treated as an architecture defect (`aws-topology.md` §8); G6 makes that machine-checkable.

**References (by path)**
- `docs/architecture/aws-topology.md` §1–§8
- `docs/architecture/cicd.md` §1, §3, §4, §5, §6
- `docs/architecture/scalability-gates.md`
- `docs/architecture/migrations.md` §3, §4
- `docs/architecture/adr/0019-aws-region.md`
- `docs/architecture/adr/0020-aws-initial-topology.md`
- `docs/architecture/adr/0021-scaling-gates.md`
- `docs/architecture/adr/0022-secrets-management.md`
- `docs/architecture/adr/0026-no-redis-at-mvp.md`
- `docs/architecture/prd.md` NFR-11, NFR-12, NFR-13

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | [N/A] | No route ships in P17. |
| DB | RDS instance, `vyra_migrator` / `vyra_app` roles, `pgvector` extension | Schema itself is `P2`; this creates the server and the roles it needs. |
| UI | [N/A] | — |
| Env/Config | Per-environment resource identifiers surfaced to `packages/config`; Secrets Manager paths composed per environment | Consumed by `P4.11`'s resolver. |
| Event | [N/A] | — |
| Build | `infra/` module set + state backend; GitHub Actions stages 6–10; ECR repositories per process | Consumed by `cicd.md` §5 gates and by `P16.09`/`P16.10`. |

---

## ADR / NFR Notes

- **Why this epic is not in `implementation-sequencing.md`.** The omission is inherited: Phase 0 scopes "CI pipeline stages 1–5" and Phase 15 scopes operations, so no phase ever scoped provisioning. The audit recorded this as `G-03` and offered two resolutions — add infrastructure to the plan, or declare it an out-of-band track. **The owner chose to add it to the plan.** This epic therefore extends the phase set rather than reinterpreting it; `implementation-sequencing.md` is unchanged, and `docs/epics/README.md` §1 records `P17` as the one epic with no source phase.
- ADR-0019 fixes `sa-east-1`; the region appears in code exactly once, in the provider configuration, and is asserted.
- ADR-0020 fixes the lean baseline and ADR-0021 fixes the promotion gates; G6 turns "introducing a service before its gate fires is an architecture violation" into a check.
- ADR-0026 (no Redis) is enforced by the same check.
- `NFR-12` is the property this epic exists to make true rather than to promise; `P16.10` verifies it independently at wave 13.
- `NFR-13` (CI never spends provider credit) is preserved: `PROVIDER_MODE=mock` is forced in every environment except production, per `aws-topology.md` §7.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| ASM-P17-01 / `cicd.md` §6 | IaC tooling, state backend, OIDC role | `P17.01` | AC-1..5 | infra CI lane green | closes G-03 (a) |
| `aws-topology.md` §7 / NFR-12 | three separated environments | `P17.02` | AC-1..5 | separation check | closes G-03 (b) |
| `aws-topology.md` §2, §2.1 | Route53 + CloudFront + OAC | `P17.03` | AC-1..4 | plan snapshot + smoke |  - |
| `aws-topology.md` §5 | S3 media and knowledge buckets | `P17.04` | AC-1..6 | public-access + encryption assertions | - |
| `aws-topology.md` §4 / ADR-0007 | RDS PostgreSQL + pgvector + roles | `P17.05` | AC-1..6 | role privilege assertions | - |
| `aws-topology.md` §6 | SQS queues + DLQs | `P17.06` | AC-1..5 | queue manifest reconciliation | - |
| ADR-0022 / FF-14 | Secrets Manager, KMS, instance profile | `P17.07` | AC-1..5 | least-privilege assertions | - |
| `aws-topology.md` §3 | EC2 + Docker runtime + rollback | `P17.08` | AC-1..5 | cutover + rollback drill | - |
| `cicd.md` §1 stages 6–7, §3 | build + container build to ECR | `P17.09` | AC-1..5 | image tagged by SHA | closes G-03 (c) |
| `cicd.md` §1 stage 8, §4 / `migrations.md` §3 | migration validation | `P17.10` | AC-1..5 | destructive-change detection | closes G-03 (d) |
| `cicd.md` §1 stages 9–10, §5 | deploy + smoke + rollback | `P17.11` | AC-1..6 | staging deploy + red-smoke rollback | closes G-03 (e) |
| `observability.md` / ADR-0023 | log groups, metric namespace, alarm substrate | `P17.12` | AC-1..4 | substrate assertions | hands off to P16 |

**BDD example IDs**
- EX-P17-01 GIVEN a non-production environment is destroyed, WHEN the code is re-applied, THEN the environment reaches an identical working state with no manual step.
- EX-P17-02 GIVEN a resource is created outside code, WHEN the infra CI lane runs, THEN drift is reported naming the resource.
- EX-P17-03 GIVEN a policy grants staging access to a production bucket, WHEN the separation check runs, THEN it fails naming both environments.
- EX-P17-04 GIVEN an S3 bucket without Block Public Access, WHEN the plan is checked, THEN it fails before apply.
- EX-P17-05 GIVEN a migration containing an unguarded `DROP`, WHEN the migration-validation stage runs, THEN it fails and no environment is touched.
- EX-P17-06 GIVEN a staging deploy whose smoke stage fails, WHEN the pipeline completes, THEN the previous image is running and the failure is reported.
- EX-P17-07 GIVEN a pull request adding an ElastiCache cluster, WHEN the promotion-gate check runs, THEN it fails citing `scalability-gates.md` gate G-E.
- EX-P17-08 GIVEN a production deploy attempted without a green staging smoke on the same SHA, WHEN the gate is evaluated, THEN the deploy is refused.

**Open questions**
- OQ-P17-01 Whether the three environments are three AWS accounts or three separated resource sets in one account is an operational decision (ASM-P17-02). The separation **property** is asserted identically either way, so the decision does not block this epic.
- OQ-P17-02 Backup retention per environment is configuration with a documented default; the production value is a commercial decision recorded at `P17.05` rather than invented here.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories. Secret
**containers** and **policies** are created; secret **values** never appear in
code, in state or in a plan output.

**Trace coverage**: requirements 12/12 mapped; contracts 4/4 actionable entries mapped; examples 8/8 mapped to validations; unresolved gap codes: none.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P17.01` | IaC tooling, remote state and the infrastructure CI lane | 5 | — | P0 |
| `P17.02` | Three separated environments and the NFR-12 separation check | 8 | `P17.01` | P0 |
| `P17.03` | Route53, CloudFront and Origin Access Control | 5 | `P17.02` | P0 |
| `P17.04` | S3 media and knowledge buckets, private with SSE-KMS and lifecycle | 5 | `P17.02` | P0 |
| `P17.05` | RDS PostgreSQL with pgvector, least-privilege roles and PITR | 8 | `P17.02`, `P2.02` | P0 |
| `P17.06` | SQS queues and dead-letter queues per `aws-topology.md` §6 | 5 | `P17.02`, `P1.09` | P0 |
| `P17.07` | Secrets Manager, KMS keys and the least-privilege instance profile | 5 | `P17.02` | P0 |
| `P17.08` | EC2 compute host, container runtime, cutover and rollback | 8 | `P17.03`, `P17.05`, `P17.06`, `P17.07` | P0 |
| `P17.09` | CI stages 6–7: build and container build to ECR tagged by commit SHA | 5 | `P17.01`, `P1.08`, `P1.09` | P0 |
| `P17.10` | CI stage 8: migration validation with destructive-change detection | 5 | `P17.05`, `P2.03` | P0 |
| `P17.11` | CI stages 9–10: environment-gated deploy, smoke and automatic rollback | 8 | `P17.08`, `P17.09`, `P17.10` | P0 |
| `P17.12` | Log groups, metric namespace and alarm substrate | 3 | `P17.08` | P0 |

**Verification gate (epic exit)**: a non-production environment destroyed and re-applied from code reaches an identical working state; the drift check reports a hand-created resource; the `NFR-12` separation check is green and turns red on a seeded cross-environment grant; every S3 bucket asserts Block Public Access and SSE-KMS; the `vyra_app` role is asserted to lack `BYPASSRLS` and table ownership; the queue set reconciles against `aws-topology.md` §6 and against the `P1.09` worker manifests with zero difference; a merge to `main` deploys staging and runs smoke; a seeded red smoke rolls back to the previous image; a seeded unguarded destructive migration fails stage 8; a seeded ALB, ElastiCache or EKS resource fails the promotion-gate check; a production deploy without a green staging smoke on the same SHA is refused.
