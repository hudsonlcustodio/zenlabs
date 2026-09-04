# VYRA — Security Architecture

- **Authority**: brief §7, §8, §25, §30, §31, §32, §34, §35
- **IMPLEMENTATION NOT STARTED**

## 1. Authentication (ADR-0005)

**Decision: first-party authentication in `apps/api` using opaque, server-side
sessions in PostgreSQL.** Not Cognito, not JWT-as-session.

- Password hashing: **Argon2id**. Per the OWASP Password Storage Cheat Sheet the
  minimum configurations are `m=47104 (46 MiB), t=1, p=1` **or**
  `m=19456 (19 MiB), t=2, p=1`. VYRA adopts `m=47104, t=1, p=1` and treats the
  parameters as configuration so they can be raised over time.
- Session token: 256-bit CSPRNG value. Stored **hashed** (SHA-256) in `session`;
  the plaintext exists only in the cookie.
- Cookie flags: `HttpOnly`, `Secure`, `SameSite=Lax`, host-only, `Path=/`.
- Absolute session lifetime and idle timeout are configuration; both enforced.
- Rotation on privilege change and on login.
- **Revocation is immediate** — deleting/marking the row ends the session on the
  next request. This is the decisive reason opaque sessions beat JWTs here
  (brief §8 requires session revocation).

### 1.1 MFA

TOTP (RFC 6238) with encrypted secret storage and single-use recovery codes.
**Mandatory** for `SUPER_ADMIN` and `ADMIN` (I-ID2), and required to be
re-asserted for sensitive operations: role changes, consent revocation, usage
adjustments, tenant status changes.

### 1.2 Brute force and rate limiting

- Per-account failed-attempt counter with progressive delay and temporary lock
  (`failed_attempts`, `locked_until`).
- Per-IP and per-account rate limits on authentication endpoints.
- Uniform timing and identical responses for unknown-user vs wrong-password.
- Lockout and rate-limit values are configuration.

### 1.3 CSRF

Session cookies are `SameSite=Lax`, plus a synchroniser token required on all
unsafe methods. `SameSite` alone is not treated as sufficient.

## 2. Authorization

- **RBAC** with the six internal roles plus the client portal role.
- Every route declares required role/capability; evaluation is **server-side in
  the application layer**, before the handler body (FF-17).
- **Object-level authorization** on every read and write: the target's
  `tenant_id` must match the session's tenant context. Mismatch returns `404`.
- Next.js Server Components and route handlers re-check authorization; the web
  tier never trusts client-side routing or hidden UI.
- Internal roles never inherit client data access implicitly — internal access to
  tenant data is explicit, scoped, and audited.

## 3. Tenancy enforcement

Four layers, all mandatory. Full detail in `architecture.md` §5:
RLS with `FORCE ROW LEVEL SECURITY` → `SET LOCAL` per transaction →
`TenantContext` in repositories → object-level authorization.

## 4. Secrets (brief §30)

- No secret is ever versioned. Enforced by FF-19 (secret scanning in CI +
  pre-commit).
- AWS Secrets Manager holds provider keys, database credentials and signing keys.
- KMS provides the CMKs; IAM grants least privilege per role and per environment.
- Application instances receive secrets via instance role, never via baked images
  or `.env` files in the repo.
- Rotation: database credentials and internal signing keys on a schedule;
  provider keys on demand with a documented runbook.
- Provider credentials (HeyGen, ElevenLabs, LLM, Meta, TikTok) are classified at
  the same sensitivity as financial credentials (brief §30).

## 5. Social token encryption

Envelope encryption: a KMS CMK wraps a per-tenant data key; tokens are encrypted
with AES-256-GCM using that data key. Only ciphertext is stored
(`*_ciphertext bytea`). There is no column that can hold a plaintext token
(FF-10). Decryption happens in the worker at call time and the plaintext is
never logged (FF-20).

## 6. Media access (brief §25)

- All buckets private, public access blocked at account and bucket level.
- Object keys are tenant-prefixed: `s3://<bucket>/<env>/<tenantId>/<kind>/<uuid>`.
  Keys are never guessable identifiers of business meaning.
- Delivery via CloudFront **signed URLs** with a short TTL, issued only after an
  authorization check. Signed URL TTL is configuration, measured in minutes.
- Uploads use presigned PUT with enforced `Content-Type` and `Content-Length`
  range; server-side validation re-checks the object after upload.
- No media on host or container filesystem beyond transient streaming buffers
  (FF-21).

## 7. Input validation

- Every request body, query and header is parsed by a Zod schema from
  `packages/contracts`. Unparsed input never reaches a handler.
- Strict schemas reject unknown properties.
- File uploads validated by content sniffing, not extension.
- SQL is parameterised exclusively; string-built SQL is a CI failure (FF-22).

## 8. Egress control

Outbound HTTP from workers goes through an allowlist. Knowledge-source fetching
additionally denies private ranges and cloud metadata endpoints
(`knowledge-engine.md` §5). This is the primary SSRF control.

## 9. Audit (brief §32)

- `audit_record` is **append-only**: the application role has `INSERT` and
  `SELECT` only, no `UPDATE`/`DELETE` (FF-11).
- Audited actions: client creation, plan change, permission change, twin
  provisioning, voice verification, activation, revocation, script approval,
  video approval, generation, publication, automation policy change, sensitive
  administrative access.
- Audit records are distinct from application logs and have their own retention
  (5 years).
- Every record carries actor, role, subject, before/after, correlation id, IP.

## 10. Logging hygiene (brief §35)

Never logged: tokens, secrets, full audio, private documents, complete prompts,
raw model outputs containing client content, password hashes.
A redaction layer in `packages/observability` enforces a denylist and is unit
tested (FF-20).

## 11. Identity abuse controls (brief §31)

- Consent guard before every generation (I-GV1), re-checked immediately before
  provider submission.
- Revocation blocks new generations **before** the API returns success (I-GV2).
- Provider-side revocation propagation tracked and retried; failure alarms but
  never re-enables generation.
- Voice verification is always performed by the provider with the real owner;
  bypass mechanisms are prohibited and are a CI-enforced rule (FF-12).
- Every generation records which identity versions and which consent were active.
