# ARCHITECTURE CHANGE REQUEST 001 — no stable error code exists for an unmapped error

- **Raised by**: Wave 1 execution, story `P1.08`
- **Status**: `ACCEPTED — applied 2026-08-26`
- **Raised on**: 2026-08-26
- **Blocks**: `P1.08` (AC-3, verification gate), `P1.10` (AC-4, depends on `P1.08`)
- **Does not block**: `P1.01`–`P1.07`, `P1.09`

---

## The conflict

`P1.08` **AC-3** requires:

> an exception filter that renders **RFC 9457 `application/problem+json`** with a
> stable `code` from `api-contracts.md` §1.1. No handler may return an ad-hoc
> error shape.

`P1.08` **EX-P1-06** requires:

> GIVEN a handler throws an unmapped error, WHEN the response is rendered, THEN
> it is `application/problem+json` with a stable `code` and no stack trace or
> vendor text.

`P1.08`'s **verification gate** requires:

> the problem-details filter is asserted for one mapped and **one unmapped** error.

But `api-contracts.md` §1.1 declares exactly thirteen stable codes:

`unauthenticated`, `forbidden`, `not_found`, `validation_failed`, `conflict`,
`idempotency_key_reuse`, `entitlement_exhausted`, `consent_revoked`,
`capability_unsupported`, `provider_unavailable`, `rate_limited`,
`connection_invalid`, `state_transition_not_allowed`

**None of them denotes an internal or unmapped server failure.** A repository-wide
search finds no `internal_error`, no `internal_server`, and no `500` mapping
anywhere in `docs/architecture/`.

So an unmapped exception — a null dereference in a handler, say — cannot be
rendered with a stable code without either inventing a code or misusing an
existing one.

## Why this was not decided inside the story

Every available resolution changes a canonical contract:

| Option | Why it is not a story-level decision |
|---|---|
| Add `internal_error` to `api-contracts.md` §1.1 | Changes the canonical stable error-code set, which `P1.04` AC-2 pins as "declared here and nowhere else" and which `P1.10` AC-4 enumerates into the published OpenAPI problem-details schema. It is a public API contract change. |
| Reuse `provider_unavailable` | Semantically false. It is a 503 about a *provider*; reporting an internal VYRA bug as a provider outage would corrupt incident triage and the `provider-cost`/`render` retry logic that later epics build on this signal. |
| Reuse `capability_unsupported` | Semantically false — 501 means the capability is not supported, not that the server failed. |
| Render the 500 with **no** `code` member | Directly contradicts AC-3 and EX-P1-06, and reintroduces the ad-hoc error shape AC-3 forbids. |
| Let unmapped errors escape the filter | Contradicts "No handler may return an ad-hoc error shape" and leaks framework default HTML/JSON. |

`ADR-0032` and `ADR-0004` make the OpenAPI document the published contract, so
whichever code is chosen becomes part of the public API surface and is enumerated
by `FF-18`. That makes this an ADR-level decision, not an implementation detail.

## Recommendation

Add a fourteenth stable code to `api-contracts.md` §1.1:

```
internal_error   → HTTP 500
```

with the rule that it carries **no** `detail` derived from the exception — only a
fixed title and the correlation id — so `FF-20` (logs never contain sensitive
material) and EX-P1-06 ("no stack trace or vendor text") both hold by
construction.

This is additive, so it is compatible with `api-contracts.md` §1
("Versioning | additive changes only within `v1`").

## Required to unblock

1. A decision recorded in `api-contracts.md` §1.1 (and an ADR if the reviewers
   consider the error taxonomy ADR-governed).
2. `P1.04` `ERROR_CODES` widened to match, which its AC-2 test will then enforce.
3. `P1.08` AC-3 implemented against the decided code.
4. `P1.10` AC-4 regenerates the problem-details enum, which picks the new code up
   automatically.

## Resolution

Accepted by the coordinator with the minimal correction as recommended.

Applied:

1. `api-contracts.md` §1.1 gains a fourteenth stable code, `internal_error`,
   rendering **HTTP 500**, with the explicit rule that it carries no
   exception-derived `detail` — no stack trace, exception class, internal
   message, SQL or path — and preserves the correlation id.
2. `packages/contracts` `ERROR_CODES` and `ERROR_CODE_STATUS` widened to match;
   the `P1.04` AC-2 tests, which read `api-contracts.md` §1.1 directly, enforce
   the two staying in sync.
3. `P1.08`'s exception filter renders every unmapped exception as
   `internal_error`.
4. `P1.10` regenerates the OpenAPI problem-details enum, which picks the new
   code up automatically (`FF-18`).

No additional codes were invented and no other contract changed.

`P1.08` and `P1.10` are unblocked.
