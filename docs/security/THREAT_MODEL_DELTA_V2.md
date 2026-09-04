# THREAT MODEL DELTA — FOUNDATION V2

This file records threats introduced or materially changed by the V2 multi-model production architecture.

| Threat | Impact | Primary controls |
|---|---|---|
| Clone used without active consent | critical | consent guard, kill switch, audit |
| Cross-tenant identity use | critical | RLS, tenant context, object authorization |
| AI bypasses budget/policy | high | deterministic policy engine, no AI authority |
| Provider gets wrong identity asset | high | scoped job payload, tenant binding, adapter validation |
| Retry storm creates COGS runaway | high | idempotency, budget guard, bounded retry, breaker |
| Webhook spoof changes state | high | signature/dedupe/reconciliation |
| Provider output URL expires | medium/high | canonical ingestion |
| Prompt injection from knowledge | high | provenance, tool isolation, allowlisted actions |
| QC false-negative at scale | high | thresholds, sample audit, human exception |
| Motion reference rights unclear | high | provenance/licensing field and policy |
| Legacy docs drive agent incorrectly | medium/high | precedence + legacy isolation + validator |
