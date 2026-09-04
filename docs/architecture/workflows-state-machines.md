# WORKFLOWS & STATE MACHINES V2

## 1. DigitalTwin

`DRAFT → ENROLLING → CALIBRATING → ACTIVE`

Side states:
- `SUSPENDED`
- `RETIRED`

Rules:
- no generation unless ACTIVE;
- consent revocation blocks new generation immediately;
- RETIRED terminal for new work.

## 2. IdentityPack

`DRAFT → VALIDATING → CALIBRATED → ACTIVE`

Possible:
- `REJECTED`
- `SUPERSEDED`

Only one active version per Twin unless explicitly modeled for use case.

## 3. Production

```text
DRAFT
→ ANALYZING
→ PLAN_READY
→ COSTED
→ AWAITING_POLICY
→ APPROVED
→ PREPARING
→ GENERATING
→ AUTO_QC
→ ASSEMBLING
→ FINAL_QC
→ READY
→ SCHEDULED
→ PUBLISHED
```

Side/exception states:
- `BLOCKED`
- `BUDGET_HOLD`
- `HUMAN_REVIEW`
- `FAILED`
- `CANCELLED`

## 4. Shot

`PLANNED → ROUTABLE → QUEUED → GENERATING → QC → ACCEPTED`

Alternatives:
- `REPAIRING`
- `REGENERATING`
- `HUMAN_REVIEW`
- `FAILED`
- `CANCELLED`

## 5. MediaJob

`QUEUED → SUBMITTED → RUNNING → SUCCEEDED → INGESTED`

Terminal/side:
- `FAILED_RETRYABLE`
- `FAILED_PERMANENT`
- `CANCELLED`
- `QUARANTINED`

Important:
Provider completion and canonical ingestion are distinct.

## 6. QCRecord

`PENDING → EVALUATING → PASS | REPAIR | REGENERATE | HUMAN_REVIEW`

## 7. Exception

`OPEN → ASSIGNED → RESOLVING → RESOLVED`

Alternatives:
- `WAIVED` only with authorized override + reason;
- `ESCALATED`.

## 8. Publication

`DRAFT → SCHEDULED → PUBLISHING → PUBLISHED`

Alternatives:
- `FAILED`
- `CANCELLED`

## Critical guards

### G-01 Consent
Before every identity-bearing provider call.

### G-02 Tenant
Every transaction/job must carry tenant context.

### G-03 Budget
No external billable call without available budget authorization.

### G-04 Policy
Auto-approval/auto-release requires explicit policy.

### G-05 Idempotency
Every external effect has deterministic key.

### G-06 Retry
No infinite retries.

### G-07 Provider fallback
Fallback must satisfy capability/policy/budget; no silent downgrade below quality floor.

### G-08 Usage
Provider completion records provider cost. Client usage is committed only according to commercial delivery policy, not every retry.
