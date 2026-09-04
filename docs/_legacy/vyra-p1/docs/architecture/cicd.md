# VYRA — CI/CD

- **Authority**: brief §39, §27
- **Platform**: GitHub Actions
- **IMPLEMENTATION NOT STARTED** — no workflow file is created by this document.

## 1. Pipeline stages

```
lint → typecheck → unit → integration → security/static → build
     → container build → migration validation → deploy → smoke
```

Every stage is blocking. No stage may be skipped on the default branch.

| Stage | Content | Fails on |
|---|---|---|
| lint | ESLint + import-boundary rules (FF-01..FF-04) | any error |
| typecheck | `tsc --noEmit` across the workspace | any error |
| unit | domain, state machine, ledger, validators | failure or coverage below threshold on domain packages |
| integration | ephemeral PostgreSQL + LocalStack; RLS, migrations, queues, idempotency, webhook replay | failure |
| security/static | dependency audit, secret scan, SAST, fitness functions | any finding at or above the configured severity |
| build | app builds | failure |
| container build | images tagged `<service>:<commit-sha>` pushed to ECR | failure |
| migration validation | forward migration on a restored staging snapshot + destructive-change detection | any unguarded destructive change |
| deploy | environment-targeted rollout | health check failure |
| smoke | post-deploy critical-path checks | failure triggers rollback |

## 2. Provider safety in CI

`PROVIDER_MODE=mock` is forced in CI. No job may hold live HeyGen, ElevenLabs,
LLM, Meta or TikTok credentials. **No standard suite may consume real provider
credit** (brief §38). Enforced by FF-08.

Live-provider tests are a separate, manually dispatched workflow, explicitly
labelled, budget-capped, and never on the default-branch path.

## 3. Image traceability

Images are tagged by commit SHA (never only `latest`). The running SHA is
exposed on a health endpoint so a deployed artifact is always traceable to a
commit (brief §39).

## 4. Migration safety

- Migrations are forward-only and reviewed.
- **Destructive changes are never applied automatically.** A migration
  containing `DROP`, destructive `ALTER ... TYPE`, or `NOT NULL` without a
  default is flagged by the validator and requires the expand/contract procedure
  in `migrations.md` §3.
- Production migrations run as a distinct, gated step with a recorded operator.

## 5. Environment gates

| Environment | Trigger | Gate |
|---|---|---|
| development | push to any branch | pipeline green |
| staging | merge to `main` | pipeline green |
| production | manual dispatch | staging smoke green + migration plan reviewed + human approval |

Production additionally requires the security/static stage to be green on the
exact SHA being deployed.

## 6. Secrets in CI

GitHub OIDC federation to a least-privilege AWS role per environment. No
long-lived AWS keys in repository secrets. CI never reads production
application secrets.
