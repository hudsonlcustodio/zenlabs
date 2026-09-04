# VYRA — Threat Model

- **Authority**: brief §33 (all 24 listed threats), §34
- **Method**: asset-centric. Assets: identity (face/voice), client knowledge,
  provider credentials, social tokens, media, usage/cost ledgers, audit trail.
- **Notation**: threats are hyphenated (`T-01`). Workflow transitions are not
  (`T01`, see `workflows-state-machines.md` §2.2). They are different sequences.
- **IMPLEMENTATION NOT STARTED**

Every threat below has a **named architectural mitigation** and a verification
reference. "Verified by" points to a fitness function (`fitness-functions.md`) or
a test class (`testing-strategy.md`).

| ID | Threat | Mitigation | Verified by |
|---|---|---|---|
| T-01 | **Account takeover** | Argon2id (`m=47104,t=1,p=1`); per-account + per-IP rate limits; progressive lockout; uniform error/timing; mandatory TOTP MFA for `ADMIN`/`SUPER_ADMIN`; session rotation on login and privilege change; immediate server-side revocation | FF-23, security tests |
| T-02 | **Broken authorization** | Declarative `(role, objectScope)` per route evaluated server-side in the application layer before the handler; UI hiding never authorizes; deny-by-default | FF-17, authorization tests |
| T-03 | **Tenant escape** | Four layers: RLS with `FORCE ROW LEVEL SECURITY`, `SET LOCAL vyra.tenant_id` per transaction, `TenantContext`-only repositories, object-level checks. App role lacks `BYPASSRLS` and table ownership | FF-01, FF-04, tenancy isolation tests |
| T-04 | **IDOR** | Client-facing endpoints never accept `tenantId`; target `tenant_id` compared to session context; mismatch returns `404` not `403` to avoid existence disclosure | FF-17, authorization tests |
| T-05 | **API key leakage** | Secrets Manager + KMS + least-privilege IAM; no `.env` in repo; secret scanning in CI and pre-commit; instance-role delivery; redaction layer prevents log emission | FF-19, FF-20 |
| T-06 | **Provider token leakage** | Same as T-05 plus provider credentials classified at financial-credential sensitivity; separate secrets per environment | FF-19, FF-14 |
| T-07 | **OAuth token theft** | Envelope encryption (KMS CMK → per-tenant data key → AES-256-GCM); ciphertext-only columns; decryption at call time in the worker; never logged; OAuth `state` bound to session; exact-match redirect URI | FF-10, FF-20 |
| T-08 | **Webhook replay** | `(provider, provider_event_id)` unique index; already-processed events return `2xx` without re-processing; state transitions independently idempotent | FF-24, webhook replay tests |
| T-09 | **Webhook spoofing** | Signature verification where the provider offers one; **unsigned webhooks are untrusted hints that may only trigger a poll**, never a direct state transition or usage commit | FF-24, webhook tests |
| T-10 | **SSRF** | Egress allowlist proxy for all outbound worker HTTP; knowledge fetcher denies RFC1918, link-local and `169.254.169.254`; no redirect-following to denied targets; DNS pinning; non-http(s) schemes rejected | FF-25, security tests |
| T-11 | **Malicious upload** | Content-sniffed MIME (not extension); size and page/duration caps; archive and macro rejection; antivirus gate before parsing; sandboxed resource-limited parser; decompression-ratio limits | FF-26, security tests |
| T-12 | **Prompt injection** | Two-region prompt: VYRA-authored **instruction region** vs delimited **data region**; retrieved and client content only ever enters the data region; injection-marker detection at ingestion and on output; `OutputValidator` schema conformance; model output can never itself trigger a state transition — transitions are made by the workflow engine after validation | FF-27, intelligence tests |
| T-13 | **Poisoned knowledge source** | Provenance on every chunk (`source_id`, `ordinal`); `RetrievalTrace` per generation makes contamination traceable and revocable; source deletion cascades to chunks/embeddings; per-tenant isolation prevents cross-tenant poisoning | FF-05, knowledge tests |
| T-14 | **Quota bypass** | Reservation acquired at T08 **before** any billable provider call; guard G-2 diverts to `BLOCKED` when capacity is insufficient; balance is a ledger fold, never a mutable counter a bug could inflate | FF-07, ledger tests |
| T-15 | **Duplicate generation** | Deterministic `idempotencyKey` persisted **before** submission; unique index `(tenant_id, idempotency_key)`; retries poll an existing `providerJobId` instead of resubmitting | FF-28, idempotency tests |
| T-16 | **Duplicate charge** | Partial unique index `usage_commit_once (tenant_id, generation_attempt_id) WHERE entry_type='commit'`; unique `(provider, provider_ref, cost_type)` on cost entries; commit handlers treat unique violation as success | FF-07, ledger tests |
| T-17 | **Unauthorized publication** | Publication requires `READY` state, a valid connection, an authorized actor, and active consent re-checked at dispatch; partial unique index `(content_item_id, channel_id)` prevents duplicates; every publication audited | FF-29, publishing tests |
| T-18 | **Identity misuse** | Consent guard I-GV1 before every generation, re-checked immediately before provider submission; `generation_attempt` records the exact identity versions and consent used; scope and prohibited uses stored and enforced | FF-30, governance tests |
| T-19 | **Voice misuse** | Voice clone bound to a consent record; provider-side owner verification is mandatory and never simulated; revocation blocks synthesis; PVC restricted to the owner's own voice per provider policy | FF-12, governance tests |
| T-20 | **Consent bypass** | Revocation applied before the API reports success; propagation state tracked and retried; a failed propagation alarms but never re-enables; revocation is irreversible — re-enabling needs a new consent record | FF-30, governance tests |
| T-21 | **Privilege escalation** | Role changes require `SUPER_ADMIN` + re-asserted MFA + audit; no self-service role elevation; internal roles do not implicitly inherit client data access; session rotates on privilege change | FF-17, authorization tests |
| T-22 | **Signed URL leakage** | Short TTL measured in minutes; issued only after authorization; tenant-prefixed non-semantic object keys; URLs never logged; buckets private with public access blocked at account level; URL issuance audited for sensitive assets | FF-21, FF-20 |
| T-23 | **Log leakage** | Redaction denylist in `packages/observability` covering tokens, secrets, prompts, model output, documents, audio; unit-tested; structured logging only; no raw request/response body logging | FF-20, observability tests |
| T-24 | **Excessive data retention** | Explicit retention table (`database-schema.md` §5); S3 lifecycle policies; real deletion on offboarding including chunks and embeddings; `raw_payload` capped at 13 months; audit retained deliberately at 5 years as a governance decision | FF-31, retention tests |

## Residual risks accepted

| # | Residual | Why accepted |
|---|---|---|
| R-1 | A compromised internal `SUPER_ADMIN` with MFA can revoke consent or adjust usage | Audited and alarmed; further control (dual approval) deferred, recorded as RISK-11 |
| R-2 | Provider-side breach exposing avatar/voice assets | Outside VYRA's control; mitigated contractually and by revocation propagation |
| R-3 | Model output quality/brand drift | QA gate + brand compliance task; not a security control |
| R-4 | Unaudited TikTok app restricts reach | GATE-TT01; product-level, not security |

## Trust boundaries

1. Browser ↔ `apps/web` — session cookie, CSRF, no tenant input.
2. `apps/web` ↔ `apps/api` — server-side session validation on every call.
3. `apps/api`/workers ↔ PostgreSQL — RLS boundary, non-superuser role.
4. Workers ↔ external providers — egress allowlist, credential boundary.
5. Providers ↔ `apps/api` webhooks — signature boundary; unsigned = untrusted.
6. Client-uploaded content ↔ model prompts — **data region boundary** (T-12).
