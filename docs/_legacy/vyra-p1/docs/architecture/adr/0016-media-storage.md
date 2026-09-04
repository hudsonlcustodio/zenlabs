# ADR-0016 — Private S3 with CloudFront signed URLs

**Status**: Accepted · **Authority**: brief §25

## Context
Media is sensitive (a person's likeness and voice). It must never depend on the
server filesystem and must never be publicly readable.

## Decision
All media in **private S3** with Block Public Access at account and bucket level,
SSE-KMS at rest, tenant-prefixed non-semantic keys
(`<env>/<tenantId>/<kind>/<uuid>`), delivered via **CloudFront signed URLs** with
a short configurable TTL issued only after an authorization check. Uploads use
presigned PUT with enforced content type and length.

## Alternatives rejected
- **Public bucket or public-read objects** — rejected outright: identity assets.
- **Proxying bytes through the API** — rejected: consumes application bandwidth
  and threatens NFR-01/02 for no security gain over signed URLs.
- **Storing media on the instance** — rejected: brief §26 requires stateless
  apps; enforced by FF-21.
- **Long-lived signed URLs** — rejected: a leaked URL becomes durable access (T-22).

## Consequences
- URL issuance is an authorized, auditable operation.
- Lifecycle rules manage cost; retention is explicit.
