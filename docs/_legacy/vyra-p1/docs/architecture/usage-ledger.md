# VYRA — Usage Ledger (client plan consumption)

- **Authority**: brief §19 (critical rule), §37
- **IMPLEMENTATION NOT STARTED**

## 1. Principle

`remaining_minutes` is **not** a stored field. Remaining capacity is a fold over
an append-only ledger:

```sql
SELECT e.entitlement_seconds
     - COALESCE(SUM(l.seconds) FILTER (WHERE l.entry_type = 'commit'),     0)
     + COALESCE(SUM(l.seconds) FILTER (WHERE l.entry_type = 'adjustment'), 0)
     - COALESCE((SELECT SUM(r.seconds) FROM usage_reservation r
                  WHERE r.tenant_id = e.tenant_id
                    AND r.cycle_id  = e.cycle_id
                    AND r.status    = 'held'), 0)                AS remaining_seconds
FROM entitlement e
LEFT JOIN usage_ledger_entry l
       ON l.tenant_id = e.tenant_id AND l.cycle_id = e.cycle_id
WHERE e.tenant_id = current_setting('vyra.tenant_id')::uuid
  AND e.cycle_id  = $1
GROUP BY e.entitlement_seconds, e.tenant_id, e.cycle_id;
```

Held reservations are subtracted from `usage_reservation` (the table that owns
`status`), not from the ledger — `release` entries already neutralise settled
reservations, so counting both would double-subtract. `adjustment` entries keep `seconds` as a
positive magnitude (consistent with §3) and carry `direction`; the fold above
shows the credit case, and a debit adjustment is subtracted instead. The
production query filters on `direction` rather than assuming a sign.

A cached projection may exist for dashboards but is never authoritative (FF-07).

## 2. The critical rule, restated precisely

> Every **successfully completed** video generation consumes capacity, including
> regenerations. A provider technical failure that produced no completed
> generation consumes nothing.

**Billability is determined solely by the provider outcome.** Whether VYRA
subsequently succeeded in copying the asset into its own storage is a separate
operational concern and never changes what the client consumed.

| Scenario | Commits | Client minutes consumed |
|---|---|---|
| Attempt 1 success, approved | 1 | 1× |
| Attempt 1 success, rejected; attempt 2 success, approved | 2 | 2× |
| Attempts 1–3 all succeed, only 3 approved | 3 | 3× |
| Attempt 1 provider timeout (no asset), attempt 2 success | 1 | 1× |
| Attempt 1 succeeded, later deleted by user | 1 | 1× (deletion is not a refund) |
| Provider render completed, VYRA ingestion failed | 1 | 1× — the generation was performed and is billable (see §6) |

**Approval is never a consumption trigger.** Consumption is triggered by
completed generation only.

## 3. Ledger schema semantics

`usage_ledger_entry`

| Column | Meaning |
|---|---|
| `entry_type` | `reserve` \| `commit` \| `release` \| `adjustment` |
| `seconds` | always positive magnitude |
| `direction` | `debit` \| `credit` (derived from `entry_type`, stored for auditability) |
| `generation_attempt_id` | set on `commit` and on the matching `release` |
| `reservation_id` | set on `reserve` / `release` |
| `reason_code` | machine-readable, e.g. `render_completed`, `provider_timeout`, `operator_goodwill` |
| `cycle_id` | the billing cycle the entry belongs to |
| `created_by` | actor id or `system` |

**Constraints that make double-charging impossible:**

```sql
-- one commit per generation attempt, forever
CREATE UNIQUE INDEX usage_commit_once
  ON usage_ledger_entry (tenant_id, generation_attempt_id)
  WHERE entry_type = 'commit';

-- one live reservation per content item
CREATE UNIQUE INDEX usage_reservation_live
  ON usage_reservation (tenant_id, content_item_id)
  WHERE status = 'held';
```

The commit index is the single most important constraint in the system: a retry
storm, duplicate webhook, or replayed message cannot produce a second charge.

## 4. Lifecycle points (exact)

| Point | When | Amount | Failure behaviour |
|---|---|---|---|
| **reserve** | T08, before any billable provider call | `max(estimatedDurationSeconds, minimumBillableSeconds)` | insufficient capacity → T22 `BLOCKED`, no entry written |
| **commit** | T11, when the provider reports a **completed billable generation**. Ingestion is *not* a precondition. | `max(producedDurationSeconds, minimumBillableSeconds)` | constraint violation ⇒ already committed ⇒ treat as success (idempotent) |
| **release** | T12 (provider terminal failure with **no completed generation**), T21 (cancel), T22 (block), reservation expiry | reserved amount | idempotent: releasing an already-released reservation is a no-op |
| **never released** | ingestion failure (T11b) | — | a commit is final; ingestion is a separate recovery concern |
| **adjustment** | manual operator credit/debit | explicit | requires `ADMIN`, reason code and audit record |

`minimumBillableSeconds` defaults to 60 and is **configuration per plan**, not a
constant (brief §19).

### 4.1 Reserve → commit is not a transfer

The reservation is released and the commit is written as **two entries** in the
same transaction at T11. The ledger therefore shows the full history:
`reserve(held) → release(reservation_settled) + commit(render_completed)`.

## 5. Idempotency

| Operation | Key | Enforcement |
|---|---|---|
| reserve | `content_item_id` | partial unique index on live reservations |
| commit | `generation_attempt_id` | partial unique index on commits |
| release | `reservation_id` | status transition guard `held → released` |
| adjustment | `Idempotency-Key` header | `idempotency_key` table |

All four operations are safe to call repeatedly. Handlers must catch the unique
violation and return success rather than surfacing an error (FF-07 verifies a
test exists for this).

## 6. Failure edge cases

- **Provider completed but ingestion failed — CANONICAL RULE.** The generation was
  performed and is billable. Therefore:
  1. the `GenerationAttempt` remains a **completed generation**;
  2. the **`UsageCommit` stands** and is never reversed or released;
  3. the `providerJobId` and provider asset reference are **preserved**;
  4. the item enters `INGESTING` retry/reconciliation (T11a), not `FAILED`;
  5. **no new billable render is ever triggered automatically** because an asset
     is missing (guard G-5, FF-32);
  6. when the ingestion retry budget is exhausted the item moves to `BLOCKED`
     with `reason_code = ingestion_failed` and escalates to **manual recovery**
     (T11b), from which only ingestion may be retried (T11c).

  An operator may still issue a goodwill `adjustment`, but that is a commercial
  gesture, not an automatic entitlement. This is a **decided rule**, not an
  assumption.
- **Cycle boundary during generation.** The entry belongs to the cycle that was
  current at **reserve** time; `cycle_id` is captured at reservation and carried
  to the commit, so a long render cannot straddle cycles.
- **Plan change mid-cycle.** Creates a new `Entitlement` row; historical entries
  are never rewritten.
- **Enterprise custom capacity.** Modeled as an entitlement value, not a special case.

## 7. Separation from provider cost

`usage_ledger_entry` answers *"what did the client consume?"*.
`provider_cost_entry` answers *"what did VYRA pay?"*.

They are never joined for billing, only for margin analysis. A provider failure
writes **no** usage entry but **may** write a cost entry (a failed render can
still cost credits) — this asymmetry is intentional and is the reason the two
ledgers exist.
