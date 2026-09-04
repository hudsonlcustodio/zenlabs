# ADR-0034 — Ingestion is decoupled from billability

**Status**: Accepted · **Authority**: brief §19; user decision closing ASM-UL01

## Context
VYRA ingests provider-produced media into its own S3 (brief §12: provider URLs
are not storage). An earlier draft made the usage commit conditional on
*provider completion **and** successful ingestion*.

That coupling was wrong in two ways. It let a VYRA-side operational failure erase
a generation the provider actually performed and charged for; and it created
pressure to re-render — a second billable event — merely to obtain a copy of an
asset that already existed.

## Decision
**Billability is determined solely by the provider outcome.**

- Provider render `FAILED` (no completed generation) ⇒ **no minutes consumed**;
  reservation released (T12).
- Provider render **completed** ⇒ **minutes consumed**, commit written at T11.
- This remains true **even if ingestion of the asset into VYRA storage later
  fails.**

On ingestion failure the system must: keep the `GenerationAttempt` as a completed
generation; keep the `UsageCommit`; retry ingestion under a retry budget
(T11a); preserve the provider job id and asset reference; **never automatically
trigger another billable render because the asset is not yet ingested**; and
escalate to manual recovery when the budget is exhausted (T11b → T11c).

A dedicated `INGESTING` state carries this, so "generated" and "stored" are
distinguishable in the state machine rather than implied.

## Alternatives rejected
- **Commit only after successful ingestion** — rejected: see Context.
- **Release the commit on ingestion failure** — rejected: the provider performed
  and charged for the work; releasing would misstate consumption and cost.
- **Auto re-render on ingestion failure** — rejected outright: it converts a copy
  failure into a duplicate charge. Forbidden by guard G-5 and FF-32.
- **Route ingestion failure to `FAILED`** — rejected: `FAILED` implies no billable
  generation, which is untrue here. `BLOCKED(ingestion_failed)` is accurate.

## Consequences
- The `usage_commit_once` unique index is unchanged and still correct — the
  commit key was always `generation_attempt_id`, never the asset.
- `MediaAsset` is null until ingestion succeeds; `ContentItem.mediaAssetId` is
  nullable through `INGESTING`.
- An ingestion reconciler is mandatory infrastructure.
- Manual recovery is an operational runbook, not an automated path (RISK-19).
