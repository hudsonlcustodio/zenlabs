# VYRA — Provider Cost Ledger

- **Authority**: brief §20
- **IMPLEMENTATION NOT STARTED**

## 1. Purpose

Record what VYRA pays, per provider, with enough traceability to later compute:

```
contribution = revenue − provider_costs − allocable_infrastructure
```

Full financial accounting is explicitly out of MVP scope (brief §20). This is a
cost *ledger*, not a general ledger.

## 2. Schema semantics

`provider_cost_entry`

| Column | Meaning |
|---|---|
| `provider` | `heygen` \| `elevenlabs` \| `llm` \| `aws` \| future |
| `cost_type` | `video_render` \| `voice_synthesis` \| `llm_tokens` \| `storage` \| `egress` |
| `provider_ref` | provider job id, request id, or usage record id |
| `generation_attempt_id` | nullable link to the attempt that caused the cost |
| `tenant_id` | nullable — some costs are platform-level and unallocable |
| `amount_micros` | integer micros of `currency`; never a float |
| `currency` | ISO 4217 |
| `source` | `provider_api` \| `estimated` \| `manual` |
| `recorded_at` | when VYRA recorded it |

```sql
CREATE UNIQUE INDEX provider_cost_once
  ON provider_cost_entry (provider, provider_ref, cost_type);
```

## 3. Recording points

| Provider | Trigger | Source |
|---|---|---|
| HeyGen | render terminal (success **or** failure) | `provider_api` where the response exposes consumption; otherwise `estimated` |
| ElevenLabs | synthesis completion | character/credit count when available |
| LLM | every model call | token usage from the response |
| AWS | monthly allocation job | `estimated` |

Costs are recorded for **failed** generations too, when the provider charged for
them. This is precisely why client usage and provider cost are separate ledgers.

## 4. Estimation and prices

Unit prices are **operational configuration**, never architectural constants
(brief §48). No price appears in code or in this document. A `provider_price`
configuration table holds effective-dated rates; `amount_micros` is computed at
record time and never recomputed retroactively.

**GATE-COST01** — exact consumption fields exposed by each provider API must be
confirmed at integration time. Where a provider does not expose per-job cost,
`source = 'estimated'` is used and the gap is recorded, not invented.

## 5. Balance monitoring (brief §10)

- HeyGen API credit balance is synced hourly into `provider_balance`.
- Web/Studio credits and API credits are tracked as **distinct** balance kinds
  and never summed (GATE-HG03).
- Low-balance alarm thresholds are configuration per provider.
- A depleted balance moves affected items to `BLOCKED` (T22) rather than failing
  them repeatedly.
