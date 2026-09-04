# ADR-0024 — Append-only audit trail with consent as a first-class aggregate

**Status**: Accepted · **Authority**: brief §31, §32

## Context
Digital Twin and Voice Clone are sensitive identity assets. Governance is a P0
product requirement, not a later enhancement.

## Decision
`Consent` is a **first-class aggregate** with scope, prohibited uses, validity,
version and evidence reference. Generation is guarded by an active consent check
re-evaluated immediately before provider submission. Revocation blocks new
generations **before** the API reports success, is irreversible, and propagates
to providers with tracked state. `audit_record` is **append-only** with
insert/select-only grants and 5-year retention, distinct from application logs.

## Alternatives rejected
- **Consent as a boolean on the twin** — rejected: cannot express scope,
  prohibited uses, validity windows, versioning or evidence.
- **Reversible revocation** — rejected: revocation must be a hard stop;
  re-enabling requires new, freshly recorded consent.
- **Audit derived from application logs** — rejected: logs are redacted,
  short-lived and mutable in practice; brief §32 requires them separate.
- **Best-effort provider propagation with no tracking** — rejected: a silent
  propagation failure would leave an external system able to generate.

## Consequences
- Every generation records the identity versions and consent that authorised it.
- A propagation failure alarms and requires operator action but never re-enables.
- Dual approval for the most sensitive admin actions is deferred (RISK-11).
