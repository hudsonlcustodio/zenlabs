---
id: P13
title: "Calendar and publishing"
status: generated
depends_on: [P4, P7, P8, P12]
---

# Epic P13 — Calendar and publishing

- **Epic ID**: `P13`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 12
- **Status**: `generated`
- **Wave**: 8
- **Priority**: P0
- **Depends on**: `P4`, `P7`, `P8`, `P12`
- **Blocks**: `P14`, `P15`, `P16`, `P22`
- **Story points (epic total)**: 67
- **Stories**: 12
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Turn an approved item into a published post through official platform APIs only, with the schedule living in PostgreSQL, the tokens living only as ciphertext, and the AI-generated nature of every post disclosed or the publication blocked.

**Goals**
- G1 Campaigns and an editorial calendar carrying channel, date, time, campaign, status, mode and external post id (FR-CA01).
- G2 OAuth acquisition, refresh and revocation with envelope-encrypted token storage (FR-SP02, `security-architecture.md` §5).
- G3 A database-backed schedule with a polling dispatcher that survives restart (ADR-0010, FR-CA02).
- G4 `MetaPublishingProvider` and `TikTokPublishingProvider` behind the `PublishingProvider` port (`provider-architecture.md` §1, ADR-0017).
- G5 AI disclosure through the official mechanism where one exists, and a block where the mapping is unresolved (FR-SP04, FF-15, GATE-TT02).

**Non-goals**
- NG1 No YouTube or LinkedIn adapter; they are out of scope and the port is the extension point (`social-publishing.md` §1).
- NG2 No unofficial API or browser automation; ADR-0017 rejects both.
- NG3 No support for personal Instagram accounts (FR-SP05).
- NG4 No UI; the calendar, connection and publishing screens are P15.
- NG5 No notification delivery; the `NotificationProvider` with in-app delivery is P16 (`implementation-sequencing.md` Phase 15).

**Acceptance evidence**
- AE1 No plaintext token column exists in the schema or in any write path.
- AE2 A duplicate publication is impossible.
- AE3 Disclosure is present or the publication is blocked.

**Assumptions**
- ASM-MT01 Meta rate limits and PPA behaviour are operational configuration, not architectural constants (`assumptions.md`, `prd.md` §9.4).

---

## Architecture Spec Summary

**Affected surfaces**: Modules `calendar`, `social-publishing` (`architecture.md` §4 rows 13, 14); `packages/providers` Meta and TikTok adapters; the publication dispatcher worker; `tests/providers/`, `tests/idempotency/`, `tests/authz/`, `tests/e2e/`.

**Integration points**: Meta Graph publishing and TikTok Content Posting through the P4 ports; the P7 queues, idempotency table and reconciliation harness; the P8 transitions T17-T21; KMS for envelope encryption.

**Risks**
- RISK-01 the TikTok app is unaudited, so posts are `SELF_ONLY` until GATE-TT01 clears; this gates the channel's launch, not the architecture.
- RISK-09 the TikTok AIGC disclosure mechanism is unconfirmed; GATE-TT02 means the publication is blocked rather than guessed.
- RISK-17 Meta PPA, 2FA and account-type prerequisites block onboarding; pre-flight connection health checks move the failure before scheduling.
- T-17 unauthorized or duplicate publication is the headline threat; the partial unique index plus FF-29 is the mechanical answer.

**References (by path)**
- `docs/architecture/social-publishing.md` §2, §2.1, §2.2, §3, §3.1, §3.2, §4, §5, §6
- `docs/architecture/workflows-state-machines.md` T17-T21, §6, §7
- `docs/architecture/prd.md` §8.10 FR-SP01-FR-SP05, §8.11 FR-CA01, FR-CA02, §9.4
- `docs/architecture/adr/0017-social-publishing.md`, `docs/architecture/adr/0010-scheduling.md`, `docs/architecture/adr/0030-idempotency-strategy.md`
- `docs/architecture/security-architecture.md` §5
- `docs/architecture/database-schema.md` §3.6
- `docs/architecture/fitness-functions.md` FF-10, FF-15, FF-29

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | `GET /calendar`, `POST /content-items/{id}/schedule`, `DELETE /scheduled-publications/{id}`, the four `/social-connections` routes | `api-contracts.md` §3.3, §3.7 |
| DB | `campaign`, `social_connection`, `scheduled_publication` with its partial unique index and its `scheduled_for` partial index | `database-schema.md` §3.6 |
| UI | [N/A] | Calendar, connection and publishing screens are P15. |
| Env/Config | Platform rate limits, posting quotas, dispatcher cadence, token refresh window, OAuth scope set | Configuration, not constants (ASM-MT01, FF-13) |
| Event | `PublicationScheduled`, `PublicationCompleted`, `PublicationFailed` | Emitted by the P8 engine |
| Build | `PublishingProvider` port with `publish`, `fetchMetrics` and `refreshToken`; adding a channel changes no domain module | `provider-architecture.md` §1, `social-publishing.md` §6, FF-02 |

---

## ADR / NFR Notes

- ADR-0017 fixes official APIs only, pre-flight connection health, and disclosure through official mechanisms; it rejects unofficial APIs, personal Instagram accounts and undisclosed publication.
- ADR-0010 fixes `scheduled_publication.scheduled_for` as the source of truth with a one-minute polling dispatcher, on the hard fact that SQS delivery delay is capped at 15 minutes.
- ADR-0030 makes idempotency a database constraint; the social publication key is `content_item_id + channel_id` (`architecture.md` §7).
- NFR-15 lists social publication as a cross-cutting idempotency surface.
- GATE-TT01, GATE-TT02, GATE-MT01 and GATE-MT02 are recorded; none blocks this epic, all block production launch of the affected channel (`implementation-sequencing.md` rule 4).

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| FR-CA01 / `domain-model.md` §8 | `campaign`, calendar read | `P13.01` | AC-1..4 | class 3 + integration | - |
| FR-SP02 / `security-architecture.md` §5 | OAuth flow + ciphertext columns | `P13.02` | AC-1..5 | class 13 + integration | - |
| `social-publishing.md` §2.2 / FR-NT01 | token refresh and revocation | `P13.03` | AC-1..4 | integration + class 9 | - |
| RISK-17 / FR-SP05 / ASM-MT01 | pre-flight connection health | `P13.04` | AC-1..4 | integration + class 4 | - |
| `workflows-state-machines.md` T17 / FR-CA01 | scheduling endpoint + unique index | `P13.05` | AC-1..4 | class 3 + class 5 | - |
| ADR-0010 / FR-CA02 / §6 | publication dispatcher | `P13.06` | AC-1..5 | integration + class 9 | - |
| `prd.md` §9.4 / ADR-0017 | Meta adapter | `P13.07` | AC-1..5 | class 4 | gate-dependent-provider-contract (GATE-MT02) |
| `social-publishing.md` §3, §3.1 | TikTok adapter | `P13.08` | AC-1..4 | class 4 | gate-dependent-provider-contract (GATE-TT01) |
| FR-SP04 / FF-15 / GATE-TT02 | AI disclosure capability | `P13.09` | AC-1..4 | FF-15 in CI | gate-dependent-provider-contract (GATE-TT02) |
| `workflows-state-machines.md` T19, T20 / §5 | publish result handling | `P13.10` | AC-1..5 | class 5 + class 10 | - |
| FF-10 / I-SP1 | no plaintext token | `P13.11` | AC-1..3 | FF-10 in CI | - |
| FF-29 / T-17 | authorized, deduplicated publication | `P13.12` | AC-1..4 | FF-29 + classes 6, 10, 12 | - |

**BDD example IDs**
- EX-P13-01 GIVEN a connected channel, WHEN the same content item is dispatched to it twice, THEN exactly one `external_post_id` exists and exactly one platform call was made.
- EX-P13-02 GIVEN a stored social connection, WHEN the raw row is read, THEN the known fixture token bytes are absent.
- EX-P13-03 GIVEN an AI-generated item whose platform disclosure mapping is unresolved, WHEN publication is attempted, THEN it is blocked rather than published.
- EX-P13-04 GIVEN due schedules and a dispatcher restart, WHEN the dispatcher resumes, THEN the due rows are still claimed exactly once from the table.
- EX-P13-05 GIVEN a token revoked at the platform, WHEN the next call runs, THEN the connection moves to `invalid`, the item returns to `READY`, and scheduling is blocked with remediation text.
- EX-P13-06 GIVEN a personal Instagram account, WHEN connection is attempted, THEN it is refused at connection time rather than at publish time.

**Open questions**
- OQ-P13-01 The TikTok AIGC disclosure wire mapping is GATE-TT02; the adapter exposes `declareAiGenerated(...)` and blocks the publication while the mapping is unresolved (`social-publishing.md` §3.1).
- OQ-P13-02 The exact Meta OAuth scope names are GATE-MT02; scopes resolve from configuration and the affected adapter test is skipped with an explicit gate reference (`testing-strategy.md` §3).

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 12/12 mapped; contracts 5/5 actionable entries mapped; examples 6/6 mapped to validations; unresolved gap codes: gate-dependent-provider-contract (GATE-TT01, GATE-TT02, GATE-MT01, GATE-MT02), tracked and expected.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P13.01` | Campaign and editorial calendar read model | 5 | — | P0 |
| `P13.02` | Social connection OAuth flow with encrypted token storage | 8 | `P4.01` | P0 |
| `P13.03` | Token refresh, revocation detection and connection health | 5 | `P13.02`, `P7.07` | P0 |
| `P13.04` | Pre-flight connection validation and quota admission control | 5 | `P13.03` | P0 |
| `P13.05` | Scheduling endpoint (T17) and schedule cancellation | 5 | `P13.04`, `P8.07` | P0 |
| `P13.06` | Publication dispatcher (T18) | 8 | `P13.05`, `P7.03` | P0 |
| `P13.07` | Meta publishing adapter for Instagram and Facebook | 8 | `P13.02`, `P4.05` | P0 |
| `P13.08` | TikTok publishing adapter with the unaudited restriction | 5 | `P13.02`, `P4.05` | P0 |
| `P13.09` | AI disclosure capability and blocked publication | 5 | `P13.07`, `P13.08` | P0 |
| `P13.10` | Publication result handling (T19, T20) and failure classes | 5 | `P13.06`, `P13.09` | P0 |
| `P13.11` | FF-10 social tokens encrypted at rest | 3 | `P13.02` | P0 |
| `P13.12` | FF-29 publication is authorized and deduplicated | 5 | `P13.10` | P0 |

**Verification gate (epic exit)**: FF-10, FF-15 and FF-29 pass; publishing tests green across classes 3, 4, 6, 9 and 10, and the class 12 end-to-end path completes through schedule and publish; no plaintext token column exists in the migrated schema; a duplicate publication is impossible; an AI-generated item whose disclosure mechanism is unresolved is blocked rather than published.
