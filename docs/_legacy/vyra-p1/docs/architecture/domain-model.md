# VYRA — Domain Model

- **Authority**: brief §9, §14, §16, §19, §20, §31
- **IMPLEMENTATION NOT STARTED**

Notation: **AR** = aggregate root. `†` = client-owned (carries `tenant_id`).

## 1. Tenancy & identity

- **Tenant** (AR) — id, name, slug, status(`active|suspended|closed`), createdAt.
- **User** (AR) — id, email, passwordHash, status, mfaEnrolled, type(`client|internal`).
- **Membership** † — userId, tenantId, role. MVP policy: max 1 `client` membership per tenant.
- **Session** — id (opaque), userId, tenantId?, issuedAt, expiresAt, revokedAt, ip, userAgent.
- **InternalRole** — `SUPER_ADMIN|ADMIN|OPERATIONS_MANAGER|CONTENT_STRATEGIST|QA_REVIEWER|PUBLISHER`.

**Invariants**
- I-ID1 A `Session` with `revokedAt != null` authorizes nothing.
- I-ID2 An internal user holding `SUPER_ADMIN` or `ADMIN` must have `mfaEnrolled = true` (brief §8).

## 2. Client & digital identity

- **Client** † (AR) — profile, positioning, tone, audience, prohibited topics.
- **DigitalIdentity** † (AR) — composite root; status; currentVersionId.
  - **VisualIdentity** † — version, twin binding.
  - **VoiceIdentity** † — version, voice clone binding.
  - **KnowledgeIdentity** † — version, active knowledge set.
  - **BrandIdentity** † — version, brand rules.
  - **BehavioralRules** † — version, communication constraints.
- **IdentityVersion** † — element, versionNumber, payload, activeFrom, activeTo.

**Invariants**
- I-DI1 Exactly one version per element is active at any instant.
- I-DI2 A generation records **which version of each element** was active
  (`generation_attempt.identity_version_ref`), so output is reproducible.

## 3. Governance (P0 — brief §31)

- **Consent** † (AR) — id, identityOwnerId, scope, prohibitedUses, validFrom,
  validUntil, consentVersion, evidenceRef, grantedAt, grantedBy.
- **ConsentRevocation** † — consentId, revokedAt, revokedBy, reason, propagationState.
- **IdentityOwner** † — person who owns face/voice; distinct from portal user.

**Invariants**
- I-GV1 No `GenerationAttempt` may start unless an active, unexpired `Consent`
  covers the requested scope. Enforced as a guard, not a UI check.
- I-GV2 `ConsentRevocation` sets twin/voice to `revoked` **before** the API
  reports success. Provider-side propagation is tracked by `propagationState`
  (`pending|succeeded|failed`) and retried; a `failed` propagation raises an alarm
  but never re-enables generation.
- I-GV3 Revocation is irreversible. Re-enabling requires a **new** consent record.

## 4. Digital Twin & Voice

- **DigitalTwin** † (AR) — id, providerRef, engine, status
  (`draft|provisioning|active|suspended|revoked|failed`), capabilitySnapshotId.
- **VoiceClone** † (AR) — id, providerRef, kind(`INSTANT|PROFESSIONAL`), status
  (`draft|awaiting_verification|training|ready|suspended|revoked|failed`).
- **ProviderCapabilitySnapshot** — providerRef, capabilities JSON, fetchedAt.

**Invariants**
- I-TW1 A twin may only enter `active` when a capability snapshot exists and
  consent is active.
- I-TW2 Avatar V support is never assumed; it is read from the snapshot (brief §10).
- I-VC1 `PROFESSIONAL` requires provider-side owner verification to have
  completed. VYRA never simulates or bypasses it (brief §11).

## 5. Knowledge

- **KnowledgeSource** † (AR) — id, kind, origin, status
  (`received|parsing|chunking|embedding|ready|failed|superseded`), version, contentHash, uploadedBy.
- **KnowledgeChunk** † — sourceId, ordinal, text, tokenCount, embedding `halfvec`.
- **RetrievalTrace** † — contentItemId, chunkIds, scores, retrievedAt.

**Invariants**
- I-KN1 A chunk inherits `tenant_id` from its source; retrieval filters in SQL (FF-05).
- I-KN2 Re-ingesting an identical `contentHash` supersedes rather than duplicates.
- I-KN3 Chunk text is **untrusted input**. It is delivered to models inside a
  data envelope, never concatenated into the instruction region (see `threat-model.md` T-12).

## 6. Content

- **ContentRequest** † (AR) — objective, subject, channel, campaignId, references,
  guidance, format, priority, desiredDate, requestedBy.
  Mandatory subset: `objective`, `channel`. All others optional (brief §16).
- **Briefing** † — requestId, content, promptVersionId, contextSnapshotId.
- **Script** † (AR) — contentItemId, versionNumber, body, wordCount,
  estimatedDurationSeconds, status.
- **ContentItem** † (AR) — the workflow-carrying entity. state, currentScriptId,
  currentRenderJobId, mediaAssetId (null until ingested), campaignId.
- **QARecord** † — contentItemId, attemptId, policy (`HUMAN_REQUIRED` in MVP),
  reviewerId, verdict (`pass|fail`), findings, decidedAt.
- **ContextSnapshot** † — the exact assembled context (refs, not payload copies)
  used for a generation, plus `promptVersionId` and `modelPolicyId`.

**Invariants**
- I-CT1 `ContentItem.state` changes only through the workflow engine.
- I-CT3 A `QARecord` with an explicit human verdict is required before
  `VIDEO_REVIEW` in MVP, regardless of the tenant's client-approval policy.
- I-CT2 Every `Script` is traceable to the `ContextSnapshot` and `PromptVersion`
  that produced it (brief §15).

## 7. Generation & media

- **GenerationAttempt** † (AR) — contentItemId, attemptNumber, kind(`voice|video`),
  status, idempotencyKey, providerJobId, startedAt, completedAt,
  producedDurationSeconds, identityVersionRef, failureClass.
- **RenderJob** † — attemptId, providerRef, engine, submittedAt, provider status.
- **AssetIngestion** † — attemptId, providerAssetRef, state
  (`pending|retrying|succeeded|failed`), attempts, lastError, mediaAssetId?.
- **MediaAsset** † (AR) — id, kind(`audio|video|thumbnail`), s3Key, bytes,
  durationSeconds, checksum, visibility(`private`).

**Invariants**
- I-GA1 One `GenerationAttempt` maps to at most one provider submission.
  Retries reuse the same `idempotencyKey` (see `provider-architecture.md` §6).
- I-GA2 `producedDurationSeconds` is set **only** when the provider reported a
  completed billable generation. It is the sole input to usage commit, and it is
  **independent of whether the asset was ingested** into VYRA storage.
- I-GA3 A `GenerationAttempt` that reached completed status is never rewritten to
  a failed status by an ingestion problem. Ingestion state is tracked separately
  (`ingestion_state`, `provider_asset_ref`).
- I-GA4 An ingestion failure never creates a new `GenerationAttempt` (guard G-5).
- I-MA1 No media asset is served directly; access is via short-lived signed URLs.

## 8. Calendar & publishing

- **Campaign** † — name, window, objective.
- **ScheduledPublication** † (AR) — contentItemId, channelId, scheduledFor,
  mode(`auto|manual`), status, externalPostId, attemptCount.
- **SocialConnection** † (AR) — platform, externalAccountRef, scopes,
  encryptedAccessToken, encryptedRefreshToken, expiresAt, status.

**Invariants**
- I-SP1 Tokens are stored only as ciphertext (FF-10).
- I-SP2 `externalPostId` is written exactly once per publication (I-9 idempotency).

## 9. Performance

- **PerformanceSnapshot** † — platform, contentItemId, externalContentId,
  capturedAt, views, reach, likes, comments, shares, saves, watchTime,
  avgWatchTime, engagement, rawPayload JSONB.

**Invariants**
- I-PF1 Any normalized field may be null; absence ≠ zero (brief §24).
- I-PF2 `rawPayload` is retained for re-normalization without refetching.

## 10. Commercial

- **Plan** — code, minutesPerCycle, features.
- **Subscription** † (AR) — planId, cycleStart, cycleEnd, status, paymentStatus
  (`pending|paid|overdue|suspended`), externalPaymentRef, notes.
- **Entitlement** † — derived: minutes granted for the current cycle.
- **UsageLedgerEntry** † — see `usage-ledger.md`.
- **ProviderCostEntry** † — see `provider-cost-ledger.md`.

**Invariants**
- I-CM1 `Entitlement` is derived from `Plan` + `Subscription`, never hand-edited.
- I-CM2 No payment gateway code exists (brief §21, §44).

## 11. Audit

- **AuditRecord** † — actorId, actorRole, action, subjectType, subjectId,
  tenantId, occurredAt, before, after, correlationId, ip.

**Invariants**
- I-AU1 Append-only. No UPDATE or DELETE grant on the table for the app role (FF-11).
- I-AU2 Audit records are distinct from application logs (brief §32).
