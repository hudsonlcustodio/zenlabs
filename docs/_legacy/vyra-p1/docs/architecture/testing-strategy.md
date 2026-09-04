# VYRA — Testing Strategy

- **Authority**: brief §38
- **Workflow**: test-after (per `.neocortex/architecture-policy.json`)
- **IMPLEMENTATION NOT STARTED**

## 1. Required test classes

All fourteen classes from brief §38 are mandatory. Each has a named location and
a definition of done.

| # | Class | Location | Definition of done |
|---|---|---|---|
| 1 | Unit | `**/*.spec.ts` beside source | Domain invariants I-* each have a test |
| 2 | Integration | `tests/integration/` | Runs against ephemeral PostgreSQL + LocalStack |
| 3 | API contract | `tests/contract/` | Every documented route validates request/response against the Zod schema |
| 4 | Provider adapter | `tests/providers/` | Every adapter maps each provider failure fixture to the correct error class |
| 5 | State machine | `tests/workflow/` | Every transition T01–T23 **including T11/T11a/T11b/T11c**: allowed actor passes, unauthorized actor denied, precondition violation denied, repeat trigger is a no-op |
| 6 | Authorization | `tests/authz/` | Every route × every role, expected allow/deny |
| 7 | Tenancy isolation | `tests/tenancy/` | For every client-owned table, tenant A cannot read/write tenant B by any repository path |
| 8 | Migration | `tests/migrations/` | Forward migration on a restored snapshot; destructive-change detector |
| 9 | Queue/retry | `tests/queue/` | Retry, backoff, DLQ routing per error class |
| 10 | Idempotency | `tests/idempotency/` | Every key in `architecture.md` §7 double-invoked, single effect asserted |
| 11 | Webhook replay | `tests/webhooks/` | Same `provider_event_id` twice ⇒ one effect; unsigned ⇒ no state transition |
| 12 | End-to-end | `tests/e2e/` | Request → script → approve → voice → render → QA → approve → schedule → publish, fully mocked |
| 13 | Security | `tests/security/` | SSRF denial, malicious upload rejection, prompt-injection containment, brute-force lockout, signed-URL expiry |
| 14 | Load | `tests/load/` | Executed before production launch against staging; NFR-01/02/03 verified |

## 2. Highest-value tests

These four exist because their failure modes are the most expensive:

1. **Consumption correctness** (`tests/idempotency/usage.spec.ts`)
   - three successful attempts ⇒ exactly three commits;
   - provider terminal failure with **no completed generation** ⇒ zero commits,
     reservation released;
   - **provider completed but ingestion failed ⇒ commit stands, zero releases,
     zero additional provider submissions, item in `BLOCKED(ingestion_failed)`**;
   - operator ingestion retry (T11c) ⇒ still exactly one commit and one submission;
   - duplicate webhook for the same attempt ⇒ still one commit;
   - approval of attempt 3 does **not** create a fourth commit.
2. **Tenancy isolation** — table-driven across every client-owned table, so a new
   table without RLS fails the suite (paired with FF-01).
3. **Consent enforcement** — revocation between approval and render diverts to
   `BLOCKED`; no generation starts after revocation.
3a. **QA cannot be skipped** — for tenant approval policy `AUTO` and `MANUAL`,
   an item without a passing human `QARecord` can never reach `READY` (FF-33).
4. **Duplicate submission** — retry after a stored `providerJobId` polls rather
   than resubmitting.

## 3. Provider isolation

- Every port has a deterministic mock with success **and** failure fixtures for
  each error class.
- Fixtures are recorded shapes, never invented endpoints. Where a provider
  contract is unconfirmed (GATE-HG04, GATE-TT02, GATE-MT02, GATE-COST01) the
  fixture is marked provisional and the corresponding adapter test is skipped
  with an explicit gate reference rather than asserting a guessed shape.
- **No standard suite consumes real provider credit** (FF-08).

## 4. Test data

- Synthetic only. No production data in any lower environment.
- Tenant fixtures always create **at least two tenants** so isolation is
  observable by default.
- Media fixtures are tiny generated files, never real client assets.

## 5. Coverage policy

Coverage is enforced where it means something: `domain/` layers and
`packages/contracts` carry a high threshold; infrastructure adapters are covered
by integration and contract tests instead. A global percentage target is not
used, because it rewards testing trivial code.

## 6. CI wiring

Classes 1–11 and 13 run on every pipeline. Class 12 runs on merge to `main`.
Class 14 runs before production launch and after any gate promotion.
