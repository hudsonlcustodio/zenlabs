---
id: P3
title: "Identity and authorization"
status: generated
depends_on: [P2]
---

# Epic P3 — Identity and authorization

- **Epic ID**: `P3`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 2
- **Status**: `generated`
- **Wave**: 3
- **Priority**: P0
- **Depends on**: `P2`
- **Blocks**: `P5`, `P15`, `P16`, `P20`
- **Story points (epic total)**: 47
- **Stories**: 10
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Turn the identity tables from P2 into enforced authentication and authorization, so that every route declares a guard and a revoked session is rejected on the next request.

**Goals**
- G1 Argon2id credentials, opaque server-side sessions and TOTP MFA (ADR-0005).
- G2 Brute-force lockout, rate limiting and CSRF protection.
- G3 RBAC guards covering the eight actors in `prd.md` §3.1, with a route manifest that makes an unguarded route impossible.
- G4 Audit writes on every sensitive action, landing in the append-only table built in P2.07.
- G5 The authorization matrix (class 6) green for every route by every role.

**Non-goals**
- NG1 No Enterprise SSO - explicitly out of scope (`prd.md` §12.2).
- NG2 No multi-user-per-tenant behaviour; the MVP limit stays a policy.
- NG3 No UI; login and permission screens are P15.

**Acceptance evidence**
- AE1 A route added without a declared guard fails FF-17.
- AE2 A session revoked server-side is rejected on the next request.
- AE3 Repeated failed logins produce lockout rather than unlimited attempts.

**Assumptions**
- ASM-P3-01 TOTP is the MFA factor implied by `security-architecture.md` §1.1; no SMS or push factor is introduced.

---

## Architecture Spec Summary

**Affected surfaces**: `packages/security`, `apps/api` guards and middleware, route manifest, `tests/authz/`, `tests/security/`.

**Integration points**: None external. MFA is local TOTP; no identity provider is integrated.

**Risks**
- An unguarded internal route is the cheapest possible privilege escalation; FF-17 exists to make it a build failure.
- Authorization enforced only in the UI would satisfy a demo and fail a breach; server-side enforcement is the acceptance condition.

**References (by path)**
- `docs/architecture/security-architecture.md` §1, §1.1, §1.2, §1.3, §2, §9
- `docs/architecture/api-contracts.md` §2, §8
- `docs/architecture/adr/0005-authentication-strategy.md`
- `docs/architecture/fitness-functions.md` FF-17, FF-23

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | Login, logout, MFA enrol/challenge, session refresh; guard declaration on every route | `api-contracts.md` §2; error codes from §1.1 |
| DB | Credential hash, MFA secret, lockout counters, session revocation marker | Extends the P2.04 tables |
| UI | [N/A] | Login and admin screens are P15. |
| Env/Config | Argon2id parameters, lockout thresholds, rate-limit windows | Configuration, not constants |
| Event | [N/A] | - |
| Build | Route manifest consumed by FF-17 | Machine-readable, not prose |

---

## ADR / NFR Notes

- ADR-0005 fixes Argon2id plus opaque server-side sessions. No new ADR expected.
- NFR-15 idempotency does not apply to login, but MFA enrolment must be replay-safe.
- Rate limits are configuration per `api-contracts.md` §8, never hard-coded constants.

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| `security-architecture.md` §1 | credential hashing | `P3.01` | AC-1..4 | unit + class 13 | - |
| ADR-0005 | opaque session lifecycle | `P3.02` | AC-1..4 | integration + class 13 | - |
| `security-architecture.md` §1.1 | TOTP MFA | `P3.03` | AC-1..4 | integration | - |
| `security-architecture.md` §1.2 | lockout + rate limiting | `P3.04` | AC-1..4 | class 13 | - |
| `security-architecture.md` §1.3 | CSRF | `P3.05` | AC-1..3 | class 13 | - |
| `prd.md` §3.1 / `security-architecture.md` §2 | RBAC guards | `P3.06` | AC-1..5 | class 6 | - |
| FF-17 | route manifest | `P3.07` | AC-1..4 | FF-17 in CI | - |
| `security-architecture.md` §9 | audit on sensitive actions | `P3.08` | AC-1..3 | FF-11 + integration | - |
| `testing-strategy.md` class 6 | authorization matrix | `P3.09` | AC-1..4 | class 6 suite | - |
| FF-23 | auth hardening check | `P3.10` | AC-1..3 | FF-23 in CI | - |

**BDD example IDs**
- EX-P3-01 GIVEN a session revoked by an administrator, WHEN the holder issues the next request, THEN it is rejected.
- EX-P3-02 GIVEN a route added without a guard declaration, WHEN CI runs, THEN FF-17 fails naming the route.
- EX-P3-03 GIVEN repeated failed logins beyond the threshold, WHEN another attempt is made, THEN it is locked out rather than evaluated.
- EX-P3-04 GIVEN a `QA_REVIEWER` token, WHEN a Control-only route is called, THEN the response is a deny, not a filtered success.

**Open questions**
- OQ-P3-01 MFA recovery-code policy for a locked-out sole portal user - product decision, does not block the guard work.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 10/10 mapped; contracts 4/4 actionable entries mapped; examples 4/4 mapped to validations; unresolved gap codes: none.

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P3.01` | Argon2id credential storage and password policy | 5 | — | P0 |
| `P3.02` | Opaque server-side sessions with revocation | 5 | `P3.01` | P0 |
| `P3.03` | TOTP MFA enrolment and challenge | 5 | `P3.02` | P0 |
| `P3.04` | Brute-force lockout and rate limiting | 5 | `P3.02` | P0 |
| `P3.05` | CSRF protection | 3 | `P3.02` | P0 |
| `P3.06` | RBAC guards and the role model | 8 | `P3.02` | P0 |
| `P3.07` | Route manifest and FF-17 | 5 | `P3.06` | P0 |
| `P3.08` | Audit writes on sensitive actions | 3 | `P3.06`, `P2.07` | P0 |
| `P3.09` | Authorization matrix tests (class 6) | 5 | `P3.07` | P0 |
| `P3.10` | FF-23 authentication hardening check | 3 | `P3.04`, `P3.05` | P1 |

**Verification gate (epic exit)**: FF-17 and FF-23 pass; authorization matrix (class 6) green; every route declares a guard; a revoked session is rejected on the next request.
