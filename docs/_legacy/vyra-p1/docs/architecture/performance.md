# VYRA — Performance & Analytics

- **Authority**: brief §24
- **IMPLEMENTATION NOT STARTED**

## 1. Principle

Platforms do not return the same metrics. VYRA stores a **normalized snapshot
plus the original raw payload**. Absent fields are `NULL`; absence never means
zero (I-PF1).

## 2. Snapshot model

Normalized columns: `views`, `reach`, `likes`, `comments`, `shares`, `saves`,
`watch_time`, `avg_watch_time`, `engagement` — all nullable — plus
`raw_payload jsonb`, `platform`, `content_item_id`, `external_content_id`,
`captured_at`, `captured_bucket`.

`raw_payload` is retained (13 months) so metrics can be re-normalized when
platform semantics change, without refetching (I-PF2).

## 3. Collection windows

Asynchronous, scheduled relative to publication time — not on dashboard open.

| Window | Purpose |
|---|---|
| +1 h | early signal |
| +24 h | primary comparison point |
| +7 d | sustained performance |
| +30 d | long-tail |

`captured_bucket` is the window label. The unique index
`(publication_id, captured_bucket)` makes collection idempotent: a retried
collection updates nothing and inserts nothing twice.

Windows are configuration, not constants.

## 4. Dashboard reads

Dashboards read **only** from `performance_snapshot`. Synchronous provider calls
on dashboard open are forbidden (brief §24, FF-16). This bounds NFR-03 and
prevents dashboard traffic from consuming platform rate limits.

## 5. Failure handling

A platform that returns partial data yields a snapshot with the available fields
and a `raw_payload` for the rest. A failed collection retries within its window
and then records a gap — it never fabricates values and never blocks other
windows.

## 6. Metric semantics caveat

Cross-platform aggregation (e.g. "total views") sums non-equivalent quantities.
The Portal presents metrics **per platform** by default; any aggregate is
explicitly labelled as indicative. Recorded as **ASM-PF01** for product review.
