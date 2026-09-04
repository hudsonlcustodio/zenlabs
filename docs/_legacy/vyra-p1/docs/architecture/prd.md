# VYRA — Product Requirements Document (PRD)

- **Artifact**: `docs/architecture/prd.md`
- **Stage**: A01 / `*arch-prd` (`step-bfc88e08`), status after: `prd-done`
- **Project mode**: greenfield
- **Status**: canonical for downstream architecture stages
- **Implementation status**: IMPLEMENTATION NOT STARTED

## 0. Document control

### 0.1 Source precedence

Per §2 of the canonical brief, authority resolves in this order:

1. `docs/product/VYRA_ARCH_PLAN_BRIEF.md` (canonical brief, sections 1–54)
2. `docs/product/VYRA_DECISOES_CANONICAS_MVP.md` (approved product decisions)
3. Commercial dossier (none present in repository at this time)
4. Official and current provider documentation
5. `README.md` and auxiliary documents

Conflicts are never resolved silently. Divergences are recorded in §14 of this document.

### 0.2 Scope of this document

This PRD defines **what** VYRA must do and **why**. It does not define module
boundaries, schemas, endpoints, or infrastructure — those belong to the sibling
artifacts listed in `README.md`.

This document contains no application code and authorizes none.

### 0.3 Notation

- `FR-*` — functional requirement (testable)
- `NFR-*` — non-functional requirement (measurable)
- `ASM-*` — assumption (derived, not confirmed; requires review)
- `GATE-*` — external verification gate (blocks production, not architecture)
- `RISK-*` — risk carried into the risk register

---

## 1. Executive vision

VYRA is a **Digital Twin as a Service** platform delivering a *managed*
audiovisual content operation.

The product is not an avatar generator. VYRA converts a durable composite —
identity, voice, knowledge, positioning, brand rules and context — into a
**continuous capability to produce and publish audiovisual content**.

The canonical operating loop (brief §3):

```
knowledge -> briefing -> agenda -> script -> approval -> voice -> video
   -> QA -> approval -> calendar -> publication -> performance
```

**Core product principle**: the client never operates prompts, AI engines,
HeyGen, ElevenLabs, queues, renderers, APIs or technical processes. All of that
complexity belongs to VYRA. The client experiences requesting, approving, and
observing results.

---

## 2. Problem statement

Organizations that need consistent executive/founder-led video presence face a
structural bottleneck: the identity holder's time. Producing on-brand video at
cadence requires scripting, recording, editing, publishing and measurement —
each a separate discipline.

Existing avatar tools solve only the rendering step and push every other
burden — prompt engineering, provider credits, queue failures, brand
consistency, publishing, measurement — back onto the customer.

VYRA's thesis: deliver the **entire operation as a managed service**, where
generation is an internal implementation detail rather than a user-facing tool.

### 2.1 Architectural problem being addressed (Q-001 / Q-002 intake answers)

The repository is greenfield with no application code, and implementation will
be executed largely by agents. Without canonical boundaries fixed first, the
concrete risks are:

- cross-tenant data leakage in a system where every entity is client-owned;
- incorrect or duplicated minute accounting — the rule *"three successful
  generation attempts consume three charges; a provider technical failure
  consumes nothing"* cannot be retrofitted onto a `remaining_minutes` counter;
- provider payload coupling that blocks substitution of HeyGen / ElevenLabs / LLMs;
- misuse of Digital Twin and Voice Clone identity assets without consent,
  revocation and audit designed in from the first schema.

---

## 3. Actors and personas

### 3.1 Actors (confirmed — brief §4, §8, §31)

| Actor | Type | Description |
|---|---|---|
| Tenant portal user | External | The single client-side user in MVP. Requests content, approves scripts and videos, observes calendar/performance/consumption. |
| Identity owner | External, consent subject | The person whose face and voice are cloned. **Distinct from the portal user** even when they are the same human. Holds consent, revocation and deletion rights. |
| `SUPER_ADMIN` | Internal | Full platform governance. |
| `ADMIN` | Internal | Tenant, plan and user administration. |
| `OPERATIONS_MANAGER` | Internal | Runs the content pipeline and queues. |
| `CONTENT_STRATEGIST` | Internal | Agenda, briefing and script curation. |
| `QA_REVIEWER` | Internal | Video quality gate. |
| `PUBLISHER` | Internal | Scheduling and publication. |
| Platform operator | Internal | Consumes observability dashboards and scale gates. |

### 3.2 Personas (ASM — derived from brief, require review)

- **ASM-P01 — "The Principal"** (portal-approver): the founder/executive who is
  both sole portal user and identity owner. Success = on-brand content shipping
  at cadence with minimal time spent. Primary interaction: approve/reject.
- **ASM-P02 — "The Operator"** (vyra-operator): VYRA internal staff running the
  pipeline across many tenants. Success = throughput with low failure/rework.
- **ASM-P03 — "The Identity Owner"** (identity-owner): in MVP normally the same
  human as ASM-P01, but modeled separately so consent, revocation and audit
  remain coherent if the roles diverge.

> **Assumption basis**: derived from brief §3, §4, §31 and
> `VYRA_DECISOES_CANONICAS_MVP.md` (1 portal user, 1 Digital Twin per client).
> Not validated with real users. Carried as ASM per instruction.

---

## 4. Jobs to be done (ASM — derived)

- **ASM-J01**: Request on-brand video content without operating prompts, queues
  or provider dashboards.
- **ASM-J02**: Approve or reject a script before any generation cost is incurred.
- **ASM-J03**: Approve or reject a finished video before publication.
- **ASM-J04**: Publish on a predictable schedule across Instagram, Facebook and TikTok.
- **ASM-J05**: Understand plan consumption before it is exhausted.
- **ASM-J06**: Understand whether published content performed.
- **ASM-J07** (identity owner): Grant, scope, and revoke use of my likeness and voice.

---

## 5. Product surfaces

Three **logical** surfaces. They may share one web codebase (brief §4: "do not
build three systems unnecessarily"). Physical packaging is decided in `architecture.md` §2 and ADR-0003.

### 5.1 VYRA Portal (client-facing)

FR-P01 Dashboard summarizing pipeline state, consumption and recent performance.
FR-P02 Submit a new content request.
FR-P03 Track in-flight content items and their state.
FR-P04 Approve or reject a script, with a reason on rejection.
FR-P05 Approve or reject a finished video, with a reason on rejection.
FR-P06 View the editorial calendar.
FR-P07 View the content library (approved/published assets).
FR-P08 View performance metrics per published item.
FR-P09 View plan consumption against entitlement.
FR-P10 View account/subscription situation including payment status.
FR-P11 View Digital Twin state (provisioning, active, suspended, revoked).

Constraint: exactly one portal user per tenant in MVP. Multi-user is a **policy**
limit, not a schema limit (brief §7).

### 5.2 VYRA Studio (internal operations)

FR-S01 Manage clients and their configuration.
FR-S02 Manage content requests, agendas, briefings and scripts.
FR-S03 Manage knowledge sources and their processing state.
FR-S04 Manage Digital Twins and Voice Clones lifecycle.
FR-S05 Observe and control generation queues (retry, cancel, requeue).
FR-S06 Perform QA and record QA outcomes.
FR-S07 Manage revisions and approvals on behalf of a tenant where policy allows.
FR-S08 Manage calendar and publication.
FR-S09 Observe performance across tenants.

### 5.3 VYRA Control (administration and governance)

FR-C01 Manage tenants.
FR-C02 Manage internal users and role assignments.
FR-C03 Manage plans, entitlements and subscription state.
FR-C04 View consumption ledgers per tenant.
FR-C05 View provider cost ledgers and derived contribution.
FR-C06 View provider health and provider balance/credits.
FR-C07 View the audit trail.
FR-C08 Manage integrations (social connections, provider configuration).
FR-C09 View operational/security status.

---

## 6. Critical journeys (ASM — derived from brief §3, §16, §17)

- **ASM-JR01 request-content**: portal user submits a request → system produces
  briefing → agenda → script.
- **ASM-JR02 approve-script**: script presented → approved (manual or auto per
  policy) → voice generation authorized.
- **ASM-JR03 approve-video**: rendered video passes QA → presented → approved →
  becomes publishable.
- **ASM-JR04 schedule-publication**: approved video assigned channel, date, time,
  campaign → scheduled.
- **ASM-JR05 review-performance**: published item accrues normalized metrics
  collected asynchronously.
- **ASM-JR06 monitor-plan-consumption**: consumption ledger reflects every
  successful generation.

### 6.1 Service blueprint (ASM)

| # | Stage | Actor | System responsibility |
|---|---|---|---|
| 1 | request-intake | Portal user | Persist request with objective, subject, channel, campaign |
| 2 | briefing | System (AI) | Build context, produce briefing |
| 3 | script-generation | System (AI) | Produce script from briefing + retrieved knowledge |
| 4 | script-approval | Portal user or policy | Manual or auto approval gate |
| 5 | voice-synthesis | System (ElevenLabs) | Produce audio from approved script |
| 6 | video-render | System (HeyGen) | Produce video from avatar + audio |
| 7 | qa | Internal / automated | Quality gate before human approval |
| 8 | video-approval | Portal user or policy | Manual or auto approval gate |
| 9 | scheduling | Publisher / portal user | Assign channel, datetime, campaign |
| 10 | publication | System (Meta/TikTok) | Publish, capture external post id |
| 11 | metrics-collection | System | Asynchronous normalized snapshots |

> Blueprint stages are derived from the brief pipeline; per-stage timing,
> ownership and compensation semantics are specified in
> `workflows-state-machines.md` §2.2.

---

## 7. Information architecture and screen seeds (ASM — derived)

**Portal**: dashboard, content, calendar, library, performance, plan, account, twin-status.
**Studio**: clients, requests, scripts, knowledge, twins, voices, generation, qa, calendar, publishing, performance.
**Control**: tenants, users, roles, plans, entitlements, usage, costs, provider-health, audit, integrations, security, status.

Screen seeds: `portal-dashboard`, `portal-request-content`, `portal-script-approval`,
`portal-video-approval`, `portal-calendar`, `portal-library`, `portal-performance`,
`portal-plan`, `studio-queue`, `studio-qa`, `control-tenants`, `control-usage`.

> **ASM-IA01**: The IA and screen seeds above are derived from brief §4 and §24.
> They are inputs to the design system (ADR-0003, ADR-0028), not validated designs.
> **ASM-BR01**: No canonical branding material exists in the repository. The
> Design System must be built on project-controlled primitives; no definitive
> visual identity may be invented (brief §6). Branding is an open gap.

---

## 8. Functional requirements by domain

### 8.1 Content request (brief §16)

FR-CR01 A content request is a first-class entity, not a free-text note.
FR-CR02 Candidate fields: objective, subject, channel, campaign, references,
additional guidance, format, priority, desired date.
FR-CR03 Only the minimum viable subset is mandatory. Over-requiring fields is
explicitly rejected by the brief. **Decided**: only `objective` and `channel`
are mandatory (see `domain-model.md` §6, ASM-CR01); all other fields optional.
FR-CR04 A request may be transformed by AI into briefing, agenda and script.

### 8.2 Content workflow (brief §17)

FR-WF01 Content progresses through an explicit, rigorous state machine.
FR-WF02 Reference states: requested, briefing, scripting, script review,
script approved, voice generation, render queued, rendering, **ingesting**, QA,
video review, ready, scheduled, publishing, published, archived.
`ingesting` exists so that "generated" (billable) and "stored in VYRA" are
distinguishable states rather than one implied step — see ADR-0034.
FR-WF03 Alternate states must include: revision requested, rejected, failed,
cancelled, blocked.
FR-WF04 Every transition defines authorized actor, preconditions, effects,
emitted events, retry policy, compensation and idempotency.

> The authoritative transition table is in `workflows-state-machines.md` §2.2. This PRD
> fixes the *requirement*, not the final vocabulary.

### 8.3 Approvals (brief §18)

FR-AP01 Script approval mode is configurable per tenant: MANUAL or AUTO.
FR-AP02 Final video approval mode is configurable per tenant: MANUAL or AUTO.
FR-AP03 Minimum quality controls apply even in AUTO mode.
FR-AP04 Automation must never remove security or governance requirements.
FR-AP05 **VYRA QA and client approval are distinct gates.** In MVP the final
video QA policy is **`HUMAN_REQUIRED`** and is not tenant-configurable: a human
`QA_REVIEWER` verdict is mandatory before `READY`, `SCHEDULED` or `PUBLISHED`.
FR-AP06 A tenant's `AUTO` video-approval setting skips only the tenant's own
acceptance step, never VYRA QA.
FR-AP07 `QAPolicy` is extensible to `HUMAN_REQUIRED`, `AI_ASSISTED` and a future
automated policy, but **no fully automated QA policy is an MVP requirement**
(`workflows-state-machines.md` §2.5).

### 8.4 Plan consumption (brief §19) — CRITICAL

FR-UC01 Capacity is measured in **minutes of generated audiovisual content**.
FR-UC02 Plans: Essential 15 min/month, Growth 30 min/month, Scale 60 min/month,
Enterprise custom.
FR-UC03 **Every successfully completed video generation consumes capacity**,
including regenerations. Three successful attempts consume three times, even if
only the third is approved.
FR-UC04 A provider technical failure that produced no completed generation
**must not** consume client minutes.
FR-UC04a Billability is determined **solely by the provider outcome**. If the
generation completed but VYRA failed to ingest the asset, the minutes remain
consumed, the commit stands, and recovery is an ingestion concern — never a
re-render (`usage-ledger.md` §6).
FR-UC05 Consumption is derived from a real ledger. `remaining_minutes` must not
be the canonical source of truth.
FR-UC06 Ledger concepts: usage ledger, generation attempt, reservation, commit,
adjustment. Exact reserve/commit/release/adjustment points are specified in `usage-ledger.md` §4.
FR-UC07 All consumption operations are idempotent.
FR-UC08 Minimum billable duration per piece (~60s in the current commercial
model) is a **configurable policy**, not a structural assumption.

### 8.5 Provider cost (brief §20)

FR-PC01 Client consumption and VYRA cost are separate concepts with separate ledgers.
FR-PC02 Costs are recorded per provider: HeyGen, ElevenLabs, LLM, allocable AWS, future integrations.
FR-PC03 Each generation attempt carries enough traceability to later compute
revenue minus provider cost minus infrastructure allocation.
FR-PC04 Full financial accounting is explicitly out of scope for MVP.

### 8.6 Billing (brief §21)

FR-BL01 No payment gateway in MVP. Payments occur externally.
FR-BL02 Plan, subscription, billing cycle, entitlement and payment status exist internally.
FR-BL03 Admin can manually record: pending, paid, overdue, suspended.
FR-BL04 Activation and suspension behaviors are modeled.
FR-BL05 A future `PaymentProvider` interface may be left as an extension point;
no gateway may be implemented (explicitly: not Asaas, Stripe, Mercado Pago, Pagar.me).

### 8.7 Knowledge (brief §14)

FR-KN01 Ingest client material: documents, PDFs, presentations, FAQs,
methodologies, offers, links, text, audio, prior content, institutional knowledge.
FR-KN02 Pipeline: source → ingestion → parsing → chunking → embeddings → retrieval.
FR-KN03 All operations are tenant-scoped, including embedding retrieval.
FR-KN04 Define versioning, provenance, processing status, reprocessing,
deletion, deduplication, limits and failure handling.
FR-KN05 Mitigate prompt injection in documents, malicious content, oversized
documents, hostile URLs, SSRF and malformed uploads.

### 8.8 Intelligence (brief §13)

FR-IN01 The content engine must not be coupled to specific models.
FR-IN02 Model routing resolves per task, tenant/quality profile, cost,
availability, fallback and environment.
FR-IN03 Task taxonomy includes idea generation, brief generation, script
generation, script review, caption generation, brand compliance.
FR-IN04 Model identifiers are configuration. Model names must never be spread
through the domain.
FR-IN05 Prompt templates are versioned, and each generated script is traceable
to the context and prompt version that produced it.
FR-IN06 Development-time tooling credentials are never runtime product credentials.

### 8.9 Digital identity and governance (brief §9, §31) — P0

FR-ID01 Digital identity is a composition: visual, voice, knowledge, brand, and
behavioral/communication rules. Each element is versioned and can evolve.
FR-ID02 Model consent, consent version, identity owner, authorized scope,
prohibited uses, validity, revocation, suspension, deletion and audit.
FR-ID03 Audit records who approved, when, and which versions were active.
FR-ID04 **Revocation must prevent new generations.**
FR-ID05 Revocation propagation to external providers must be planned.
FR-ID06 Never design any mechanism to bypass provider identity verification.

### 8.10 Social publishing (brief §22)

FR-SP01 MVP channels: Instagram, Facebook, TikTok, via official APIs only.
FR-SP02 OAuth token lifecycle: acquisition, refresh, revocation, encrypted storage.
FR-SP03 Do not promise support for account types the APIs do not serve.
FR-SP04 AI-generated content must use official disclosure mechanisms where the
platform provides them. No mechanism may hide AI-generated nature.

### 8.11 Calendar and publication (brief §23)

FR-CA01 Editorial calendar with channel, date, time, campaign, status,
automatic/manual publication, external post id.
FR-CA02 Scheduling is reliable and recoverable after process restart.

### 8.12 Performance (brief §24)

FR-PF01 Performance is in MVP scope.
FR-PF02 Metrics are stored as a **normalized snapshot plus original raw payload**.
FR-PF03 Fields absent on a given platform may be null. No platform parity assumed.
FR-PF04 Collection is asynchronous in windows after publication.
FR-PF05 Dashboards must not trigger synchronous provider calls on every open.

### 8.13 Notifications (brief §43)

FR-NT01 Notify on: script awaiting approval, video awaiting approval, generation
failed, content published, low HeyGen balance, social integration expiring,
Voice Clone ready, Digital Twin active.
FR-NT02 Email vendor selection requires an ADR; none may be chosen arbitrarily.

---

## 9. Provider premises — technical viability (brief §49)

Validated against official current documentation. Commercial scope unchanged.

### 9.1 HeyGen — VIABLE

Verified from official HeyGen developer documentation:

- The Create Video API supports selecting the engine, including Avatar V, via an
  `engine` field.
- Avatar video generation may be driven either by a text script paired with a
  voice id, **or by an uploaded audio track for lip-sync**, supplied as
  `audio_url` **or** `audio_asset_id` — exactly one of the two.
- The Upload Asset API accepts media (image, video, audio) and returns an asset id.
- Authentication uses an API key in the `x-api-key` header.

**Conclusion**: the voice→video pipeline (brief §12) is canonically supported.
VYRA can synthesize audio externally and drive HeyGen lip-sync with it.

- **ASM-HG01**: Avatar V capability is not assumed for every look/avatar. The
  system must query capabilities before generation (brief §10).
- **GATE-HG01**: HeyGen Enterprise contract not yet signed. Live credentials
  unavailable. A provider mock and per-environment configuration are mandatory
  so architecture, local development and CI are never blocked.
- **GATE-HG02**: API-based Digital Twin provisioning availability must be
  confirmed against the signed Enterprise contract before production.
- **GATE-HG03**: Web/Studio credits and API credits are distinct and must not be
  conflated. Exact balance semantics require verification at integration time.

### 9.2 ElevenLabs — VIABLE with mandatory verification

Verified from official ElevenLabs documentation:

- **Instant Voice Cloning (IVC)**: short samples (roughly 1–5 minutes),
  effectively immediate, no training wait.
- **Professional Voice Cloning (PVC)**: minimum ~30 minutes of audio,
  2–3 hours recommended for best fidelity; creation takes minutes.
- **PVC permits cloning only your own voice**, and requires completing a
  verification process before fine-tuning submission.
- Verification uses voice-captcha technology to confirm the submitter is the
  voice owner. It is an ethical/legal safeguard, not a technical necessity.

**Conclusion**: IVC as default path and PVC as premium option are both viable.

- FR-VC01 The architecture must allow the **identity owner personally** to
  complete provider-required verification.
- **GATE-EL01**: Enterprise/workspace account requirements for PVC at scale must
  be confirmed before production.
- Bypassing verification is prohibited by brief §11 and is not designed for.

### 9.3 TikTok — VIABLE with a hard production gate

Verified from official TikTok developer documentation:

- **Unaudited API clients are restricted to `SELF_ONLY` viewership** — all posted
  content is private.
- Unaudited clients may allow **up to 5 users to post per 24-hour window**, and
  those accounts must be private at time of posting.
- An audit is required to lift the visibility restriction.
- A Content Disclosure Setting exists for self/brand/branded-content promotion.

- **GATE-TT01 (production launch gate)**: TikTok app audit must be completed
  before any public TikTok publishing. Until then, TikTok publication is
  functionally private-only. This is a launch blocker for the TikTok channel,
  **not** an architecture blocker.
- **GATE-TT02**: The specific AIGC/AI-generated-content disclosure mechanism for
  the Content Posting API was **not confirmed** in official documentation during
  this stage. Per brief §48, no endpoint, field or flag may be invented. This is
  recorded as an explicit implementation verification gate to be resolved in
  `social-publishing.md` §3.1 (GATE-TT02)
  (`*arch-api-integrations`) against live official documentation.

### 9.4 Meta (Instagram + Facebook) — VIABLE with account prerequisites

Verified from official Meta developer documentation:

- Content publishing requires an **Instagram Business or Creator account linked
  to a Facebook Page**.
- The app user must hold admin-equivalent permissions on the linked Page.
- **Page Publishing Authorization (PPA)** may be required; if so, publishing
  fails until PPA is completed.
- If the Page enforces two-factor authentication, the user must have completed
  2FA or the request fails.
- Instagram enforces a limit of **100 API-published posts per rolling 24 hours**.

- FR-SP05 Personal Instagram accounts are **not** supported. The product must
  state this requirement during onboarding (satisfies FR-SP03).
- **GATE-MT01**: Meta App Review with the required permissions must be completed
  before production publishing.
- **ASM-MT01**: Rate limits and PPA behavior are operational configuration, not
  architectural constants (brief §48).

### 9.5 AI models

Per brief §13 and §49: DeepSeek V4 Flash as default high-volume/low-cost option;
a higher-quality alternative as secondary; an optional escalation tier for
critical work. Concrete model identifiers are **configuration only** and are
resolved by policy in `intelligence-engine.md` §3. This PRD records no model id as an
architectural constant.

---

## 10. Non-functional requirements (brief §28)

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | API read latency | P95 < 500 ms |
| NFR-02 | API write latency | P95 < 800 ms |
| NFR-03 | Critical screen load | < 3 s under normal conditions |
| NFR-04 | Availability (initial) | ≥ 99.5% |
| NFR-05 | Availability (maturity) | ≥ 99.9% |
| NFR-06 | Compute review trigger | CPU > 60% or memory > 75% sustained |
| NFR-07 | Queue review trigger | oldest message age > 60 s sustained |
| NFR-08 | Database review trigger | sustained CPU/connection pressure ≈ 60%+ |
| NFR-09 | Disk alert | before 70% where local storage is relevant |

These are **analysis and promotion gates**, not autoscaling triggers.

NFR-10 Multi-tenancy from the first schema; every client-owned entity carries
explicit tenancy.
NFR-11 Applications are stateless; media never persists on host/container disk.
NFR-12 Environments development, staging and production share no database,
bucket, queue, secret, credential, token or provider key.
NFR-13 CI never spends real provider credits.
NFR-14 Responsiveness and accessibility are architectural requirements, not
later polish.
NFR-15 Idempotency is a cross-cutting requirement (voice generation, video
generation, minute consumption, cost recording, webhooks, social publication,
metric updates).

---

## 11. Success metrics (ASM — derived)

- **ASM-M01** script-approval turnaround (request → script approved)
- **ASM-M02** video-approval turnaround (script approved → video approved)
- **ASM-M03** generation success rate (successful renders / attempts)
- **ASM-M04** minutes consumed vs entitlement, per tenant per cycle
- **ASM-M05** publication success rate per channel
- **ASM-M06** provider error rate per provider

> Targets are not set. These identify *what to measure*; thresholds require a
> commercial decision and are recorded as an open question (OQ-03).

---

## 12. MVP scope

### 12.1 In scope

Portal, Studio, Control surfaces; content request; AI briefing/agenda/script;
configurable script and video approval; voice synthesis; video generation;
QA; editorial calendar; automatic publication to Instagram, Facebook, TikTok;
performance collection; usage ledger; provider cost ledger; plans, subscription
and entitlements with manual/external payment; knowledge ingestion and retrieval;
identity governance with consent and revocation; audit trail; multi-tenancy;
observability; notifications.

### 12.2 Out of scope (brief §44) — extension points permitted, implementation forbidden

Payment gateway; multiple Digital Twins per client; multiple client users;
YouTube; LinkedIn; native mobile app; professional video editor; live/realtime
avatar; white label; Enterprise SSO; marketplace; Kubernetes; distributed
microservices; data lake; complete accounting system; many equivalent providers;
any feature not justified by the current product.

---

## 13. Assumptions register

| ID | Assumption | Basis | Review trigger |
|---|---|---|---|
| ASM-P01..P03 | Personas | brief §3, §4, §31 | User research |
| ASM-J01..J07 | Jobs to be done | brief §3, §16 | User research |
| ASM-JR01..JR06 | Critical journeys | brief §3, §17 | UX design work |
| ASM-IA01 | IA and screen seeds | brief §4, §24 | Design system work |
| ASM-BR01 | No canonical branding exists | repository inspection | Branding delivery |
| ASM-HG01 | Avatar V not universal across looks | brief §10 | Capability query at integration |
| ASM-MT01 | Meta limits are operational config | brief §48 | Integration |
| ASM-M01..M06 | Success metrics | brief §24 | Commercial decision |

All Product Experience items above are **derived, not confirmed**. Per the
governing instruction they are recorded as assumptions rather than presented as
complete facts.

---

## 14. Divergences from source documents

**DIV-01 — Storybook page-stories.** The orchestration server reports
`ux-storybook-adapter-unsupported`: no explicit Storybook adapter supports the
chosen stack (Next.js App Router + Tailwind + shadcn/ui, brief §6). Decision:
proceed **without page-stories**; do not change the stack to accommodate an
adapter, and do not invent an unsupported adapter. Recorded as RISK-05 and
GATE-UX01. Component-level verification replaces page-stories (ADR-0028).

**DIV-02 — Product Experience completeness.** The server reports
`product-experience-*` blockers and `product-experience-reference-source-unsafe`.
Personas, journeys, blueprint, IA, metrics and screen seeds have been **derived
from the brief and marked as assumptions** (§3, §4, §6, §7, §11) rather than
left blank or filled with complete-looking placeholders. Backend and feature
generation remain gated server-side until these are confirmed.

No conflict was found between the canonical brief and
`VYRA_DECISOES_CANONICAS_MVP.md`. The two are consistent.

---

## 15. Risks

> Canonical register: `risks.md` (17 entries). The table below is the
> product-stage subset, retained for traceability.

| ID | Risk | Severity | Mitigation owner |
|---|---|---|---|
| RISK-01 | TikTok app unaudited → public publishing impossible | High | GATE-TT01 |
| RISK-02 | HeyGen Enterprise contract unsigned → no live credentials | High | GATE-HG01, mock-first |
| RISK-03 | Voice misuse / consent bypass on identity assets | Critical | `security-architecture.md` §11 |
| RISK-04 | Double or missing minute consumption | Critical | `usage-ledger.md` (ADR-0018) |
| RISK-05 | No Storybook adapter for chosen stack | Medium | ADR-0028, GATE-UX01 |
| RISK-06 | Prompt injection via client knowledge sources | High | FR-KN05, FF-27 |
| RISK-07 | Cross-tenant leakage incl. embedding retrieval | Critical | NFR-10, FF-01, FF-05 |
| RISK-08 | Provider unavailability breaking critical flows | High | `provider-architecture.md` §5 |
| RISK-09 | TikTok AIGC disclosure mechanism unconfirmed | Medium | GATE-TT02 |
| RISK-10 | No canonical branding | Low | ASM-BR01, ADR-0028 |

---

## 16. External gates required before production

| Gate | Blocks | Owner |
|---|---|---|
| GATE-HG01 | HeyGen Enterprise contract + live credentials | Commercial |
| GATE-HG02 | API Digital Twin provisioning confirmation | Commercial + Integration |
| GATE-HG03 | API vs Studio credit semantics | Integration |
| GATE-EL01 | ElevenLabs workspace/PVC requirements | Commercial + Integration |
| GATE-TT01 | TikTok app audit (public visibility) | Commercial |
| GATE-TT02 | TikTok AIGC disclosure mechanism verification | Integration |
| GATE-MT01 | Meta App Review permissions | Commercial |
| GATE-HG04 | HeyGen webhook availability + signature scheme | Integration |
| GATE-MT02 | Meta OAuth scope names confirmation | Integration |
| GATE-COST01 | Per-provider cost field availability | Integration |
| GATE-UX01 | Storybook adapter absence accepted | Engineering (ADR-0028) |

None of these block architecture work. All block production launch of the
affected capability. The canonical gate list is `risks.md` §3.

---

## 17. Open questions

- **OQ-01** ~~Mandatory vs optional content-request fields~~ — **resolved**
  as ASM-CR01 (`objective` + `channel` only); remains open for product confirmation.
- **OQ-02** Email/notification vendor — **deliberately deferred** (ADR-0027).
  The abstraction ships; the vendor choice is GATE-NOTIF01.
- **OQ-03** Numeric targets for success metrics — commercial decision.
- ~~**OQ-04** QA policy~~ — **RESOLVED**: MVP QA is `HUMAN_REQUIRED`; see FR-AP05..07
  and ADR-0033.

---

## 18. Traceability

| Brief section | Covered by |
|---|---|
| §3 vision | §1 |
| §4 surfaces | §5 |
| §7 multi-tenancy | NFR-10 |
| §9 digital identity | §8.9 |
| §10 HeyGen | §9.1 |
| §11 ElevenLabs | §9.2 |
| §12 voice→video | §9.1 |
| §13 intelligence | §8.8 |
| §14 knowledge | §8.7 |
| §16 content request | §8.1 |
| §17 workflow | §8.2 |
| §18 approvals | §8.3 |
| §19 consumption | §8.4 |
| §20 provider cost | §8.5 |
| §21 billing | §8.6 |
| §22 social | §8.10, §9.3, §9.4 |
| §23 calendar | §8.11 |
| §24 performance | §8.12 |
| §28 metrics/gates | §10 |
| §31 governance | §8.9 |
| §43 notifications | §8.13 |
| §44 out of scope | §12.2 |
| §49 premises | §9 |

Sections §5, §6, §8, §15, §25–§27, §29, §30, §32–§42, §45–§48, §50–§53 are
architecture concerns delivered by the sibling artifacts in this directory —
see `README.md` for the full topic-to-document map.

---

## 19. Stage completion

- Artifact produced: `docs/architecture/prd.md`
- Status: `prd-done`
- Successor authority: root (never inferred from this document)
- **IMPLEMENTATION NOT STARTED**
