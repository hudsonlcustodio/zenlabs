# ADR-0005 — First-party authentication with opaque server-side sessions

**Status**: Accepted · **Authority**: brief §8

## Context
Requirements: secure sessions, server-side authorization, real RBAC, CSRF
protection, HttpOnly/Secure/SameSite cookies, mandatory MFA for sensitive admin
roles, rate limiting, brute-force protection, secure session management and
**session revocation**. The brief forbids assuming Cognito *or* first-party auth
without analysis.

## Decision
**First-party authentication in `apps/api` using opaque, server-side sessions
stored in PostgreSQL**, with Argon2id password hashing and TOTP MFA. Full
parameters in `security-architecture.md` §1.

Deciding factor: **immediate revocation**. Revocation is an explicit requirement,
and opaque sessions revoke by deleting a row. Stateless JWTs require a
denylist — which is a session table with extra steps and worse failure modes.

## Alternatives rejected
- **AWS Cognito** — rejected: revocation and RBAC would straddle two systems;
  tenancy/role data still lives in our database, so authorization logic would be
  split; adds a per-request dependency and cross-service latency in `sa-east-1`;
  customising MFA and lockout semantics is constrained. Cognito's real benefit
  (managed user pools at scale) is not needed for one user per tenant.
- **JWT access tokens as the session** — rejected: cannot satisfy immediate
  revocation without a server-side denylist.
- **Auth0/Clerk/WorkOS** — rejected: recurring cost and an external dependency on
  the critical login path for a small user population; Enterprise SSO is
  explicitly out of scope (brief §44), removing the main reason to buy.
- **Keycloak self-hosted** — rejected: an additional stateful service to operate,
  contradicting the lean AWS baseline.

## Consequences
- We own password hashing, lockout, MFA and session hygiene — each is specified
  concretely and verified by FF-23, not left to judgement.
- One database round-trip per authenticated request; acceptable within NFR-01.
- If Enterprise SSO ever enters scope, this ADR is revisited; the session
  abstraction is the seam.
