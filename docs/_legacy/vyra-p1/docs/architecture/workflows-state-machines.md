# VYRA — Workflows & State Machines

- **Authority**: brief §17, §18, §23, §31, §36, §37
- **IMPLEMENTATION NOT STARTED**

## 1. Engine rules

1. `ContentItem.state` is mutated **only** by the workflow engine
   (`modules/workflow`). Direct writes are forbidden (FF-06).
2. A transition executes inside **one** database transaction that covers: guard
   evaluation, state write, side-effect record, outbox event insert.
3. Every transition is **idempotent**: re-delivering the same trigger with the
   same `causationId` is a no-op returning the current state.
4. External calls never happen inside the transaction. They are triggered by the
   outbox relay after commit.
5. A transition with no authorized actor match fails closed with `403`.

## 2. Content state machine

### 2.1 States

`REQUESTED` → `BRIEFING` → `SCRIPTING` → `SCRIPT_REVIEW` → `SCRIPT_APPROVED`
→ `VOICE_GENERATION` → `RENDER_QUEUED` → `RENDERING` → `INGESTING` → `QA`
→ `VIDEO_REVIEW`
→ `READY` → `SCHEDULED` → `PUBLISHING` → `PUBLISHED` → `ARCHIVED`

Alternate: `REVISION_REQUESTED`, `REJECTED`, `FAILED`, `CANCELLED`, `BLOCKED`.

Names are retained from the brief; no better vocabulary was identified.

### 2.2 Transition table

> Transition ids are unhyphenated (`T01`). Hyphenated `T-01` ids refer to
> threats in `threat-model.md`.

Legend — **A**: authorized actor · **P**: precondition · **E**: effect ·
**Ev**: event · **R**: retry · **C**: compensation · **I**: idempotency key.

| # | From → To | A | P | E | Ev | R | C | I |
|---|---|---|---|---|---|---|---|---|
| T01 | — → `REQUESTED` | portal user, `CONTENT_STRATEGIST` | subscription active; consent active | create `ContentRequest` + `ContentItem` | `ContentRequested` | n/a | delete item | `Idempotency-Key` |
| T02 | `REQUESTED` → `BRIEFING` | system | request valid | enqueue briefing job | — | 3×, exp backoff | → `FAILED` | `contentItemId+briefing` |
| T03 | `BRIEFING` → `SCRIPTING` | system | briefing persisted | enqueue script job | `BriefingGenerated` | 3× | → `FAILED` | `briefingId` |
| T04 | `SCRIPTING` → `SCRIPT_REVIEW` | system | script v_n persisted + `OutputValidator` passed | present script | `ScriptGenerated` | 3× | → `FAILED` | `scriptId` |
| T05 | `SCRIPT_REVIEW` → `SCRIPT_APPROVED` | portal user; or system when policy = AUTO **and** brand-compliance passed | script current | mark approved | `ScriptApproved` | n/a | → `SCRIPT_REVIEW` | `scriptId+approve` |
| T06 | `SCRIPT_REVIEW` → `REVISION_REQUESTED` | portal user | reason present | store feedback | `ScriptRejected` | n/a | — | `scriptId+reject` |
| T07 | `REVISION_REQUESTED` → `SCRIPTING` | system | revisions < `maxScriptRevisions` | new script version | — | 3× | → `BLOCKED` | `scriptId+revision` |
| T08 | `SCRIPT_APPROVED` → `VOICE_GENERATION` | system | voice clone `ready`; consent active; **usage reservation acquired** | create `GenerationAttempt(voice)` | `UsageReserved` | — | release reservation | `sha256(scriptVersionId+voiceCloneId+params)` |
| T09 | `VOICE_GENERATION` → `RENDER_QUEUED` | system | audio asset ingested to S3 | create `GenerationAttempt(video)` | `VoiceGenerated` | 3× | release reservation → `FAILED` | `attemptId` |
| T10 | `RENDER_QUEUED` → `RENDERING` | system | twin `active`; capability supports engine | submit render; store `providerJobId` | `RenderRequested` | 5×, jittered | release reservation | `sha256(attemptId)` |
| T11 | `RENDERING` → `INGESTING` | system (poll or verified webhook) | provider reports a **completed billable generation** | set `producedDurationSeconds`; **commit usage**; record provider cost; persist `providerJobId` + provider asset ref | `RenderCompleted`, `UsageCommitted`, `ProviderCostRecorded` | n/a | **none — commit is final** | `attemptId` |
| T11a | `INGESTING` → `QA` | system | asset copied into VYRA-owned S3 and checksum verified | create `MediaAsset` | `MediaIngested` | ingestion retry budget, exp backoff | none | `attemptId+ingest` |
| T11b | `INGESTING` → `BLOCKED` | system | ingestion retry budget exhausted | preserve `providerJobId` and provider asset ref; raise `ingestion_failed`; escalate to manual recovery. **Usage stays committed. No release. No automatic re-render.** | `MediaIngestionFailed` | manual only | none | `attemptId+ingestfail` |
| T11c | `BLOCKED`(`ingestion_failed`) → `INGESTING` | `OPERATIONS_MANAGER` | operator retry of ingestion only | re-attempt copy using the preserved provider ref | — | manual | none | `attemptId+ingestretry` |
| T12 | `RENDERING` → `FAILED` | system | provider terminal failure — **no completed billable generation** | **release reservation** | `RenderFailed`, `UsageReleased` | per §5 | — | `attemptId` |
| T13 | `QA` → `VIDEO_REVIEW` | **`QA_REVIEWER` only** (MVP policy `HUMAN_REQUIRED`) | QA record exists with an explicit human verdict | attach QA result | `QAPassed` | n/a | → `QA` | `attemptId+qa` |
| T14 | `QA` → `REVISION_REQUESTED` | `QA_REVIEWER` | reason present | store QA failure | `QAFailed` | n/a | — | `attemptId+qafail` |
| T15 | `VIDEO_REVIEW` → `READY` | portal user; or system when policy = AUTO | video asset present | mark ready | `VideoApproved` | n/a | → `VIDEO_REVIEW` | `attemptId+approve` |
| T16 | `VIDEO_REVIEW` → `REVISION_REQUESTED` | portal user | reason present | store feedback | `VideoRejected` | n/a | — | `attemptId+reject` |
| T17 | `READY` → `SCHEDULED` | portal user, `PUBLISHER` | channel connected; `scheduledFor` future | create `ScheduledPublication` | `PublicationScheduled` | n/a | cancel schedule | `contentItemId+channelId` |
| T18 | `SCHEDULED` → `PUBLISHING` | system | schedule due; token valid | enqueue publish job | — | — | → `SCHEDULED` | `publicationId` |
| T19 | `PUBLISHING` → `PUBLISHED` | system | platform returned post id | store `externalPostId`; schedule metric windows | `PublicationCompleted` | n/a | none | `publicationId` |
| T20 | `PUBLISHING` → `FAILED` | system | terminal platform rejection | record error class | `PublicationFailed` | 3× then DLQ | revert to `READY` on operator action | `publicationId` |
| T21 | any → `CANCELLED` | portal user, `OPERATIONS_MANAGER` | not `PUBLISHED` | release reservations | — | n/a | — | `contentItemId+cancel` |
| T22 | any → `BLOCKED` | system | consent revoked; twin/voice revoked; subscription suspended; entitlement exhausted. **Excludes `ingestion_failed`, which is reached only via T11b.** | freeze; release *held* reservations only — **never** reverse a commit | `TwinRevoked` etc. | n/a | manual unblock | `contentItemId+block` |
| T23 | `PUBLISHED` → `ARCHIVED` | system, `OPERATIONS_MANAGER` | retention window elapsed | archive | — | n/a | — | `contentItemId+archive` |

### 2.3 Critical guards

- **G-1 Consent guard** — T08, T10 re-check active consent immediately before
  provider submission. Consent revoked between approval and render **must**
  divert to T22 (I-GV1).
- **G-2 Entitlement guard** — T08 acquires a usage reservation or diverts to T22.
- **G-3 Capability guard** — T10 reads the capability snapshot; Avatar V is never
  assumed (I-TW2).
- **G-5 No-auto-rerender guard** — a missing or un-ingested asset is **never** a
  trigger for a new billable render. Only `INGESTING` retry (T11a) or explicit
  operator action may follow T11b. Creating a new `GenerationAttempt` from an
  ingestion failure path is forbidden and is verified by FF-32.
- **G-4 Approval-policy guard** — AUTO never skips brand-compliance or QA record
  creation (brief §18: automation must not remove governance).

### 2.4 The consumption rule (brief §19) expressed as transitions

- Reservation is taken at **T08** (before any billable provider work).
- Commit happens at **T11**, keyed on `generation_attempt_id`, triggered **solely
  by the provider reporting a completed billable generation**. Ingestion into
  VYRA storage is *not* a precondition of the commit.
- Release happens at **T12**, **T21**, **T22** — a provider technical failure that
  produced no completed generation never consumes client minutes.
- **Ingestion failure does not release usage.** The generation happened and was
  billable; T11b keeps the commit, preserves the provider job/asset reference,
  and escalates to manual recovery (G-5).
- Three successful renders traverse T10→T11 three times, producing **three
  distinct `generation_attempt_id` values** and therefore three commits, even if
  only the third is approved at T15. Approval is not a commit trigger.

## 2.5 QA policy vs client approval — distinct concepts

These are two different gates and must never be conflated.

| | VYRA QA | Client approval |
|---|---|---|
| Owner | VYRA (`QA_REVIEWER`) | Tenant portal user |
| Transition | T13 / T14 | T05 / T06 (script), T15 / T16 (video) |
| MVP policy | **`HUMAN_REQUIRED`** — canonical and non-configurable | **configurable `MANUAL` or `AUTO`** per tenant |
| Purpose | VYRA's own quality and governance gate | Customer acceptance |

**MVP rule**: the final video **must** pass a human VYRA QA verdict before it can
reach `READY`, `SCHEDULED` or `PUBLISHED`. A tenant setting video approval to
`AUTO` skips only *their* acceptance (T15) — it never skips T13.

`QAPolicy` is modeled as an extensible enumeration:

| Value | MVP | Meaning |
|---|---|---|
| `HUMAN_REQUIRED` | **default, only value in use** | a human `QA_REVIEWER` records the verdict |
| `AI_ASSISTED` | modeled, not enabled | automated checks pre-populate findings; a human still records the verdict |
| `AUTOMATED` | reserved, **not a MVP requirement** | reserved for a future decision; no MVP code path selects it |

Adding `AI_ASSISTED` later introduces an intelligence task and pre-populated
findings, but **no new state and no new transition** — T13 still requires the
human verdict. Enforced by FF-33.

## 3. Digital Twin lifecycle

`draft` → `provisioning` → `active` → (`suspended` ⇄ `active`) → `revoked`
plus `failed`.

| From → To | A | P | E | Ev |
|---|---|---|---|---|
| `draft` → `provisioning` | `OPERATIONS_MANAGER` | consent active; assets uploaded | submit provisioning | — |
| `provisioning` → `active` | system | provider ready **and** capability snapshot stored | enable generation | `TwinActivated` |
| `active` → `suspended` | `ADMIN` | — | block new generations | — |
| any → `revoked` | identity owner, `SUPER_ADMIN` | consent revocation recorded | block generations; start provider propagation | `TwinRevoked` |
| `provisioning` → `failed` | system | terminal provider error | record failure class | — |

`revoked` is terminal (I-GV3).

## 4. Voice Clone lifecycle

`draft` → `awaiting_verification` → `training` → `ready` → (`suspended`) → `revoked`, plus `failed`.

- `INSTANT` may move `awaiting_verification` → `ready` once the provider returns
  a usable voice.
- `PROFESSIONAL` must pass provider-side owner verification before `training`.
  VYRA exposes the provider's verification step to the identity owner and stores
  only the resulting state — never a surrogate (I-VC1).
- **GATE-EL01** applies: exact workspace/verification API semantics are confirmed
  at integration time.

## 5. Retry, backoff and dead-lettering

| Class | Retryable | Policy |
|---|---|---|
| `ProviderTimeout` | yes | 5 attempts, exp backoff base 2s, full jitter, cap 60s |
| `ProviderRateLimit` | yes | honour `Retry-After` when present, else backoff; separate retry budget |
| `ProviderUnavailable` | yes | 5 attempts, circuit breaker after 10 consecutive |
| `ProviderAuthenticationError` | no | DLQ + alarm; never retried blindly |
| `ProviderQuotaExceeded` | no | DLQ + alarm; operator action |
| `ProviderRejected` | no | terminal; T12/T20 |
| `ProviderError` (5xx unclassified) | yes | 3 attempts |

- **No infinite retries** (brief §36). Retry budget is per tenant per hour and
  is configuration, not constant.
- SQS `maxReceiveCount` routes to a per-queue DLQ.
- SQS visibility timeout is set to ≥ 6× the p99 handler duration (SQS permits
  0s–12h).
- Crash recovery: a `RENDERING` item whose attempt has no terminal state and
  whose `last_polled_at` exceeds the reconciliation window is picked up by the
  reconciler (`provider-architecture.md` §7), never abandoned.

## 6. Scheduling reliability (brief §23)

Publication scheduling uses a **database-backed schedule plus a polling
dispatcher**, not queue delay:

- `scheduled_publication.scheduled_for` is the source of truth.
- A dispatcher runs each minute, selecting due rows with
  `FOR UPDATE SKIP LOCKED`, and enqueues publish jobs.
- Rationale: SQS delivery delay is capped at 15 minutes, so it cannot express an
  editorial calendar. EventBridge Scheduler supports one-time `at()` schedules
  but each one-time schedule counts against an account quota until deleted,
  adding lifecycle burden for no benefit at MVP volume (ADR-0010).
- Restart-safe by construction: state lives in PostgreSQL, so a restart resumes
  from the table.

## 7. Reconciliation loops

| Loop | Cadence | Detects |
|---|---|---|
| Render reconciler | 5 min | attempts stuck in `RENDERING` beyond timeout |
| Ingestion reconciler | 5 min | attempts stuck in `INGESTING`; retries copy only, never re-renders |
| Outbox relay | 10 s | unpublished `domain_event` rows |
| Publication dispatcher | 1 min | due `scheduled_publication` |
| Token refresh | hourly | `social_connection` nearing expiry |
| Metric collector | windowed | snapshots due (`performance.md` §3) |
| Provider balance sync | hourly | HeyGen balance / low-credit alarm |
| Reservation expiry | 5 min | reservations past `expires_at` → release |
