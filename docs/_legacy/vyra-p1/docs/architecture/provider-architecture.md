# VYRA — Provider Architecture

- **Authority**: brief §10, §11, §12, §34, §36, §48
- **IMPLEMENTATION NOT STARTED**

## 1. Ports

All external systems sit behind ports in `packages/providers`. The domain never
sees a provider DTO (FF-02, FF-03).

```
VideoProvider            submit(RenderRequest) -> ProviderJobRef
                         poll(ProviderJobRef)  -> ProviderJobState
                         fetchAsset(ProviderJobRef) -> AssetStream
AvatarProvider           provision(AvatarSpec) -> ProviderAvatarRef
                         getCapabilities(ProviderAvatarRef) -> CapabilitySet
                         revoke(ProviderAvatarRef) -> RevocationResult
VoiceProvider            createClone(CloneSpec) -> ProviderVoiceRef
                         getCloneState(ProviderVoiceRef) -> CloneState
                         synthesize(SynthesisRequest) -> AssetStream
                         revoke(ProviderVoiceRef) -> RevocationResult
IntelligenceProvider     complete(ModelRequest) -> ModelResponse
                         embed(EmbedRequest) -> Vector[]
PublishingProvider       publish(PublishRequest) -> ExternalPostRef
                         fetchMetrics(ExternalPostRef) -> RawMetrics
                         refreshToken(ConnectionRef) -> TokenSet
ProviderCapabilityRegistry
                         resolve(providerRef) -> CapabilitySet
                         assertSupports(providerRef, requirement) -> void
NotificationProvider     send(NotificationRequest) -> DeliveryRef
PaymentProvider          (interface only — no implementation, brief §21)
```

Adapters: `HeyGenProvider`, `ElevenLabsProvider`, `DeepSeekProvider`,
`OpenAIProvider`, `MetaPublishingProvider`, `TikTokPublishingProvider`, plus a
`Mock*` implementation of every port.

## 2. Capability registry (brief §10)

Avatar V is never assumed. Before T10 the engine calls
`assertSupports(providerRef, { engine: 'avatar-v' })`. The registry reads a
stored `ProviderCapabilitySnapshot`, refreshed on provisioning and on a TTL.

If the capability is absent or unknown, the item goes to `BLOCKED` with
`reason_code = capability_unsupported`. It never silently downgrades the engine.

## 3. HeyGen adapter

Confirmed against official HeyGen developer documentation:

- Video creation selects the engine via an `engine` field; Avatar III, IV and V
  are selectable.
- Avatar video may be driven by a text script + voice id, **or** by external
  audio for lip-sync supplied as `audio_url` **or** `audio_asset_id` —
  exactly one; supplying both or neither is an error.
- The Upload Asset API accepts image/video/audio and returns an asset id.
- Authentication uses an API key in the `x-api-key` header.

### 3.1 Voice → video pipeline (brief §12)

```
approved script → ElevenLabs synthesis → audio bytes
   → ingest to VYRA S3 (private, canonical copy)
   → hand audio to HeyGen via audio_asset_id (preferred) or a short-lived audio_url
   → HeyGen renders Avatar V + audio
   → VYRA ingests the produced video into private S3
   → QA
```

**Decision**: prefer `audio_asset_id` via Upload Asset. Rationale: it avoids
exposing a VYRA presigned URL to a third party and removes the dependency
between provider fetch timing and URL TTL. `audio_url` with a short-lived
presigned URL is the documented fallback when upload is impractical (ADR-0013).

**Provider URLs are never treated as storage** (brief §12). Every produced asset
is ingested into VYRA-owned S3 before the item leaves `RENDERING`. `MediaAsset`
never stores a provider URL as its canonical location.

### 3.2 Gates

- **GATE-HG01** Enterprise contract and live credentials pending. Mock-first
  development is mandatory and sufficient.
- **GATE-HG02** API-based Digital Twin provisioning must be confirmed against the
  signed Enterprise contract.
- **GATE-HG03** API credits vs Studio credits semantics to be confirmed.
- **GATE-HG04** Webhook availability, event catalogue and signature scheme are
  **not confirmed** in this stage. The architecture therefore supports **polling
  as the baseline** and treats webhooks as an optimisation activated only after
  verification. No webhook payload shape is invented.

## 4. ElevenLabs adapter

Confirmed against official ElevenLabs documentation:

- **IVC** uses short samples (roughly 1–5 minutes) and is effectively immediate,
  with no training wait.
- **PVC** needs ~30 minutes minimum, 2–3 hours recommended, and creation takes
  minutes rather than seconds.
- **PVC permits cloning only the speaker's own voice**, and requires completing a
  verification process before the fine-tuning request is submitted.
- Verification uses voice-captcha technology to confirm the submitter is the
  voice owner — an ethical/legal safeguard, not a synthesis requirement.

### 4.1 Consequences for VYRA

- IVC is the default path; PVC is a premium option (brief §11).
- The architecture routes the **identity owner** personally through the
  provider's verification flow. VYRA stores the resulting state only.
- No mechanism that bypasses, proxies or simulates verification may be built.
  This is a hard prohibition, expressed as fitness function FF-12.
- **GATE-EL01** workspace/Enterprise requirements for PVC at scale to be confirmed.

## 5. Error taxonomy (brief §36)

```
ProviderError                 (base)
├── ProviderTimeout           retryable
├── ProviderRateLimit         retryable, honour Retry-After
├── ProviderUnavailable       retryable, breaker-eligible
├── ProviderAuthenticationError   NOT retryable, alarm
├── ProviderQuotaExceeded     NOT retryable, alarm
└── ProviderRejected          NOT retryable, terminal for the attempt
```

Every adapter maps provider-specific failures into exactly one of these. The
domain handles only this taxonomy (FF-03).

Concurrency limits, rate limits and retry budgets are **configuration per
provider per environment**, never hardcoded (brief §10, FF-13).

Circuit breaker: opens after N consecutive `ProviderUnavailable`, half-opens
after a cooldown. N and cooldown are configuration.

## 6. Idempotent submission

1. Compute the attempt's deterministic `idempotencyKey` before any call.
2. Persist `GenerationAttempt` with that key (unique index) **before** submitting.
3. Submit. Store `providerJobId` on first success.
4. On retry, if `providerJobId` is already present, **poll instead of
   resubmitting**. This is what prevents a retry storm from producing duplicate
   billable renders.

## 7. Reconciliation & crash recovery

- Attempts in a non-terminal state past their timeout are re-polled, never
  resubmitted.
- If the provider reports a completed job VYRA never recorded, the reconciler
  drives T11 (commit) and then ingestion — so a crash between provider completion
  and local commit cannot lose a paid render.
- If the commit exists but the asset was never ingested, the reconciler retries
  **ingestion only** (T11a). It must never resubmit a render to obtain the asset:
  the generation already happened and re-rendering would bill the client twice
  (guard G-5, FF-32).
- If the provider has no record of `providerJobId`, the attempt is failed with
  `ProviderRejected` and the reservation released.

## 8. Webhooks (brief §34)

Applies to any provider webhook activated after verification.

1. Verify signature where the provider offers one; reject unverified.
2. Persist raw event keyed by `(provider, provider_event_id)` — unique index
   gives replay protection and deduplication.
3. Respond `2xx` immediately. Never process heavy work in the request
   (brief §34).
4. Enqueue processing; process asynchronously with DLQ.
5. Reconcile independently, so a permanently lost webhook is still recovered by
   polling.

Unsigned or unverifiable webhooks are treated as **untrusted hints**: they may
trigger a poll, but may never directly cause a state transition or a usage
commit. This defeats webhook spoofing (T-09) and replay (T-08).

## 9. Mock mode

Every port has a deterministic mock returning fixture data, including failure
fixtures for each error class. `PROVIDER_MODE=mock` is the default outside
production. CI never runs `live` (FF-08).
