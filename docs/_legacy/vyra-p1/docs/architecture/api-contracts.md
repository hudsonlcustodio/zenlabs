# VYRA — API Contracts

- **Authority**: brief §41, §42
- **Style**: REST, resource-oriented, OpenAPI-documented (ADR-0004)
- **IMPLEMENTATION NOT STARTED** — contracts only, no controllers.

## 1. Conventions

| Concern | Rule |
|---|---|
| Base | `/api/v1` |
| Auth | session cookie (`HttpOnly; Secure; SameSite=Lax`) + CSRF token on unsafe methods |
| Tenant | derived **server-side** from the session. Never accepted from client input. |
| Idempotency | `Idempotency-Key` header required on all POST that create billable or external effects |
| Pagination | cursor-based: `?cursor=&limit=` → `{ data, nextCursor }`. No offset pagination on large sets. |
| Filtering | explicit allowlisted query params per resource |
| Errors | RFC 9457 `application/problem+json` with a stable `code` |
| Correlation | `X-Correlation-Id` accepted and echoed; generated when absent |
| Versioning | additive changes only within `v1` |

**Tenant scoping rule**: no endpoint accepts `tenantId` in path, query or body
for client-facing routes. This structurally removes a whole IDOR class (T-04).

### 1.1 Error codes (stable)

`unauthenticated`, `forbidden`, `not_found`, `validation_failed`, `conflict`,
`idempotency_key_reuse`, `entitlement_exhausted`, `consent_revoked`,
`capability_unsupported`, `provider_unavailable`, `rate_limited`,
`connection_invalid`, `state_transition_not_allowed`, `internal_error`.

`internal_error` renders **HTTP 500** and is the only code for an internal or
otherwise unmapped exception (ACR-001). It carries **no** exception-derived
`detail`: no stack trace, exception class, internal message, SQL, or path ever
reaches the client. Only the fixed title and the correlation id are returned, so
FF-20 holds by construction. Adding it is additive and therefore compatible with
the "additive changes only within `v1`" rule above.

## 2. Authorization model

Every endpoint declares `(requiredRole | requiredCapability, objectScope)`.
Authorization is evaluated server-side in the application layer before the
handler body. UI hiding is never an authorization mechanism (brief §8, FF-17).

Object-scope check: load target → compare `tenant_id` to session context →
`404` (not `403`) when mismatched, to avoid existence disclosure.

## 3. Client-facing resources (Portal)

### 3.1 Content requests
```
POST   /content-requests            create           portal user   Idempotency-Key
GET    /content-requests            list             portal user
GET    /content-requests/{id}       read             portal user
```
Body (create): `objective*`, `channel*`, `subject?`, `campaignId?`,
`references?[]`, `guidance?`, `format?`, `priority?`, `desiredDate?`.
Only `objective` and `channel` are required (brief §16, FR-CR03).

### 3.2 Content items and approvals
```
GET    /content-items                       list (filter: state, campaignId, channel)
GET    /content-items/{id}                  read
POST   /content-items/{id}/script/approve   T05   portal user   Idempotency-Key
POST   /content-items/{id}/script/reject    T06   portal user   body: reason*
POST   /content-items/{id}/video/approve    T15   portal user   Idempotency-Key
POST   /content-items/{id}/video/reject     T16   portal user   body: reason*
POST   /content-items/{id}/cancel           T21   portal user
```
Approval actions are **resource sub-actions**, not a generic RPC endpoint
(brief §41). Each maps to exactly one state-machine transition.

### 3.3 Calendar
```
GET    /calendar?from=&to=                  list scheduled publications
POST   /content-items/{id}/schedule         T17   body: channelId*, scheduledFor*, mode
DELETE /scheduled-publications/{id}         cancel schedule
```

### 3.4 Library and media
```
GET    /media-assets/{id}                   metadata only
POST   /media-assets/{id}/download-url      issue short-lived signed URL
```
Media bytes are never proxied through the API and never served from a public
bucket (`aws-topology.md` §5).

### 3.5 Performance, plan, account
```
GET    /performance?contentItemId=&platform=&window=   snapshots only, no provider call
GET    /usage/current-cycle                            derived from ledger fold
GET    /subscription                                   plan, cycle, paymentStatus
GET    /digital-twin/status                            twin + voice state
```

### 3.6 Knowledge
```
POST   /knowledge-sources/upload-url        presigned upload target
POST   /knowledge-sources                   register uploaded object
GET    /knowledge-sources                   list with processing status
DELETE /knowledge-sources/{id}              real delete incl. chunks
```
Upload is direct-to-S3 via presigned URL with enforced content-length and
content-type; the API never receives large bodies.

### 3.7 Social connections
```
GET    /social-connections                  list with health
POST   /social-connections/{platform}/start OAuth start (state parameter bound to session)
GET    /social-connections/callback         OAuth callback
DELETE /social-connections/{id}             disconnect
```

## 4. Internal resources (Studio) — internal roles only

```
GET    /studio/tenants                                    ADMIN, OPERATIONS_MANAGER
GET    /studio/content-items?tenantId=                    OPERATIONS_MANAGER
POST   /studio/content-items/{id}/requeue                 OPERATIONS_MANAGER
POST   /studio/content-items/{id}/qa                      QA_REVIEWER   T13/T14
       body: verdict* (pass|fail), findings?  -- human verdict, always required
POST   /studio/content-items/{id}/ingestion/retry          OPERATIONS_MANAGER  T11c
       retries asset copy only; never triggers a render (G-5)
POST   /studio/generation-attempts/{id}/reconcile         OPERATIONS_MANAGER
GET    /studio/queues                                     OPERATIONS_MANAGER
POST   /studio/digital-twins/{id}/provision               OPERATIONS_MANAGER
POST   /studio/voice-clones/{id}/verify-start             OPERATIONS_MANAGER
GET    /studio/knowledge-sources?tenantId=                CONTENT_STRATEGIST
```

Internal routes accept an explicit `tenantId` **and** require an internal role
**and** write an audit record on every mutation.

## 5. Control resources — administration

```
GET    /control/tenants                       ADMIN
POST   /control/tenants                       SUPER_ADMIN
PATCH  /control/tenants/{id}/status           ADMIN            audited
GET    /control/plans                         ADMIN
POST   /control/subscriptions                 ADMIN
PATCH  /control/subscriptions/{id}/payment    ADMIN            body: paymentStatus, externalRef, note
GET    /control/usage?tenantId=&cycleId=      ADMIN
POST   /control/usage/adjustments             ADMIN   Idempotency-Key, reason*  audited
GET    /control/provider-costs                ADMIN
GET    /control/provider-health               ADMIN
GET    /control/provider-balance              ADMIN
GET    /control/audit?subjectType=&actorId=   SUPER_ADMIN
POST   /control/users/{id}/roles              SUPER_ADMIN      audited, MFA required
POST   /control/consents/{id}/revoke          SUPER_ADMIN      audited, MFA required
```

`POST /control/usage/adjustments` is the **only** write path into the usage
ledger outside the workflow engine, and it is audited and idempotent.

## 6. Webhook endpoints

```
POST /webhooks/{provider}      no session; signature-verified; returns 2xx immediately
```
Behaviour is specified in `provider-architecture.md` §8. These endpoints perform
no business logic inline and never mutate content state directly.

## 7. OpenAPI

`docs/api/openapi.yaml` is the machine-readable contract, generated from the
`packages/contracts` Zod schemas so that the spec and validation cannot drift
(FF-18). It is a build output, not a hand-maintained file.

## 8. Rate limiting

| Scope | Limit basis |
|---|---|
| authentication endpoints | per IP + per account, with lockout |
| mutation endpoints | per session |
| upload URL issuance | per tenant |
| internal/control routes | per user |

Values are configuration per environment.
