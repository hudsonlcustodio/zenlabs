# VYRA — Social Publishing

- **Authority**: brief §22, §23
- **IMPLEMENTATION NOT STARTED**

## 1. Scope

MVP channels: Instagram, Facebook, TikTok — official APIs only. YouTube and
LinkedIn are out of scope (brief §44); the `PublishingProvider` port is the
extension point, and no adapter for them is written.

## 2. Meta (Instagram + Facebook)

Confirmed against official Meta developer documentation:

- Content publishing requires an **Instagram Business or Creator account linked
  to a Facebook Page**.
- The app user must be able to perform **admin-equivalent tasks** on the linked Page.
- **Page Publishing Authorization (PPA)** may be required; where required,
  publishing fails until PPA is completed.
- If the Page enforces **two-factor authentication**, the user must have
  completed 2FA or the request fails.
- Instagram enforces a limit of **100 API-published posts per rolling 24 hours**.

### 2.1 Product consequences

- **Personal Instagram accounts are not supported.** Onboarding states this
  explicitly rather than failing at publish time (FR-SP03/FR-SP05).
- Connection health checks surface *before* scheduling: missing PPA, missing 2FA,
  insufficient Page role, and expiring tokens are all pre-flight validations.
- The 100-post/24h ceiling is stored as **operational configuration** and used
  for admission control, not hardcoded (ASM-MT01).

### 2.2 Token lifecycle

`connect → active → expiring → refreshed | revoked | invalid`

- OAuth authorization code flow with the minimum scope set required for
  publishing and metrics. Exact scope names are confirmed at integration time
  (**GATE-MT02**) — none are invented here.
- Access and refresh tokens are stored **only as ciphertext** (envelope
  encryption, `security-architecture.md` §5). FF-10 verifies no plaintext column.
- An hourly job refreshes tokens approaching expiry and notifies the tenant when
  refresh fails.
- Revocation at the platform is detected on the next call and moves the
  connection to `invalid`, blocking scheduling with a clear remediation message.
- **GATE-MT01** Meta App Review must be completed before production.

## 3. TikTok

Confirmed against official TikTok developer documentation:

- **Unaudited clients are restricted to `SELF_ONLY` viewership** — posted content
  is private.
- Unaudited clients may allow **up to 5 users to post per 24-hour window**, and
  those accounts must be private at time of posting.
- An **audit** is required to lift the visibility restriction.
- A Content Disclosure Setting exists covering self-promotion / brand / branded
  content.

### 3.1 Product consequences

- **GATE-TT01 (production launch gate)**: until the app audit passes, TikTok
  publishing is functionally private-only. The Portal must state this rather than
  implying public reach. This blocks the TikTok channel's launch, not the
  architecture.
- Creator information is queried before posting so that the UI reflects the
  account's real posting eligibility.
- **GATE-TT02**: the specific AIGC / AI-generated-content disclosure mechanism
  for the Content Posting API was **not confirmed** in official documentation
  during this stage. Per brief §48 no field or flag is invented. The adapter
  defines a `declareAiGenerated(...)` capability whose wire mapping is resolved
  at integration time, and the publication is **blocked** if the mapping is
  unresolved and the content is AI-generated.

### 3.2 AI disclosure is mandatory

All VYRA output is AI-generated. Where a platform provides an official
disclosure mechanism, VYRA uses it. **No mechanism that hides or omits the
AI-generated nature may be built** (brief §22). This is enforced as FF-15.

## 4. Publication flow

```
SCHEDULED --(dispatcher, §6 of workflows)--> PUBLISHING
   pre-flight: token valid, connection healthy, quota available,
               AI disclosure resolvable, consent still active
   publish (idempotent on content_item_id + channel_id)
   store external_post_id  --> PUBLISHED
   schedule metric collection windows
```

Idempotency: the partial unique index on `(content_item_id, channel_id)` where
status ≠ cancelled makes a duplicate publish impossible. A retry that finds an
existing `external_post_id` returns success without re-posting (mitigates T-17
unauthorized/duplicate publication).

## 5. Failure classes

| Class | Handling |
|---|---|
| token invalid/expired | connection → `invalid`, notify tenant, item back to `READY` |
| platform rate limit | reschedule with backoff inside the publication window |
| content rejected by platform | terminal `FAILED` with platform reason surfaced |
| PPA / 2FA missing (Meta) | pre-flight block with remediation text |
| unaudited restriction (TikTok) | publish proceeds as `SELF_ONLY`, item flagged, tenant informed |

## 6. Extension point

Adding a channel means implementing `PublishingProvider` and registering a
capability descriptor. No domain module changes. This is verified by FF-02.
