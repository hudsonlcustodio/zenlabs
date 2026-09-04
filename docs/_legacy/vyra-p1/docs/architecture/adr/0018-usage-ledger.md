# ADR-0018 — Append-only usage ledger as the sole source of consumption

**Status**: Accepted · **Authority**: brief §19, §37

## Context
The critical commercial rule: every successfully completed generation consumes
capacity, including regenerations; a provider technical failure that produced no
completed generation consumes nothing. Brief explicitly forbids
`remaining_minutes` as the canonical source.

## Decision
An **append-only `usage_ledger_entry`** with `reserve | commit | release |
adjustment`. Remaining capacity is a fold. Reserve at T08 before any billable
call; **commit at T11 on the provider reporting a completed billable
generation**; release only on a provider terminal failure that produced no
completed generation, on cancel, on block, or on reservation expiry.

**Ingestion is explicitly decoupled from billability.** Copying the asset into
VYRA storage is an operational step (T11a/T11b/T11c), not a billing precondition.
A commit is never reversed because ingestion failed.

The decisive constraint:
```sql
CREATE UNIQUE INDEX usage_commit_once
  ON usage_ledger_entry (tenant_id, generation_attempt_id)
  WHERE entry_type = 'commit';
```

## Alternatives rejected
- **Mutable `remaining_minutes` counter** — rejected by the brief and by
  correctness: no audit trail, and any retry bug silently corrupts billing.
- **Commit at approval time** — rejected: it would make three successful
  generations consume once, contradicting the rule.
- **Commit at submission time** — rejected: a provider failure would charge the
  client for nothing.
- **Commit only after successful ingestion** — rejected: it would make a VYRA-side
  operational failure erase a generation the provider actually performed and
  charged for, and it would create pressure to re-render (a second billable
  event) merely to obtain a copy of an asset that already exists.
- **Event-sourcing the whole domain** — rejected: disproportionate; ledger
  semantics are needed for usage and cost, not for every entity.

## Consequences
- Duplicate charging is structurally impossible, not merely unlikely.
- An un-ingested asset is a recovery task, never a re-render trigger (G-5, FF-32).
- A cached balance may exist for dashboards but is never authoritative (FF-07).
- Corrections are compensating entries, never updates.
