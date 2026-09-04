# VYRA — Architecture Fitness Functions

- **Authority**: brief §50 (and §45: no implicit knowledge)
- **Note**: the Neocortex native generators were unavailable (see
  `risks.md` §4). These are hand-written and must be implemented as real
  automated checks.
- **IMPLEMENTATION NOT STARTED** — specifications, not code.

Every entry states: **what** it verifies, **how** it is verified (a runnable
mechanism), and the **failure condition**. No entry says "ensure that" without a
mechanism.

Execution: all functions run in the CI `security/static` stage via
`pnpm fitness`. Any failure fails the build.

---

## Group A — Module boundaries

### FF-01 Every client-owned table has tenancy and RLS
- **Verifies**: no client-owned table exists without `tenant_id`, `ENABLE` +
  `FORCE ROW LEVEL SECURITY`, and an isolation policy.
- **How**: integration test against the migrated ephemeral database:
  ```sql
  SELECT c.relname FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
    AND c.relname NOT IN (SELECT table_name FROM vyra_platform_tables_allowlist)
    AND (NOT c.relrowsecurity OR NOT c.relforcerowsecurity
         OR NOT EXISTS (SELECT 1 FROM pg_policies p
                        WHERE p.tablename = c.relname));
  ```
  Plus a check that each such table has a `tenant_id` column.
- **Fails when**: the query returns any row.
- **Allowlist discipline**: `vyra_platform_tables_allowlist` contains only the
  platform tables named in `database-schema.md` §2, plus `audit_record` and
  `provider_cost_entry`, which use the sanctioned nullable-tenant policy in §2.1.
  A separate assertion checks those two still have `FORCE ROW LEVEL SECURITY` and
  a policy. Adding any other table to the allowlist requires an ADR.

### FF-02 No domain or application layer imports a provider SDK
- **Verifies**: HeyGen, ElevenLabs, OpenAI, DeepSeek, Meta and TikTok SDKs are
  reachable only from `packages/providers`.
- **How**: `dependency-cruiser` rule
  `forbidden: [{ from: { path: "^(apps/api/src/modules/.+/(domain|application))" }, to: { path: "node_modules/(heygen|elevenlabs|openai|@deepseek|facebook-nodejs|tiktok)" } }]`
  plus an ESLint `no-restricted-imports` rule with the same list.
- **Fails when**: any matching import exists.

### FF-03 Domain never references provider-specific types
- **Verifies**: the error taxonomy and DTO boundary hold.
- **How**: `grep -rEn "HeyGen|ElevenLabs|heygen|elevenlabs|x-api-key" apps/api/src/modules/*/domain apps/api/src/modules/*/application` returns nothing; plus a
  `dependency-cruiser` rule forbidding `packages/providers/**/adapters/**` from
  being imported outside `packages/providers`.
- **Fails when**: any match.

### FF-04 Module dependency graph is a DAG with declared edges only
- **Verifies**: no cycles; no undeclared cross-module imports; no imports of
  another module's `infrastructure/`.
- **How**: `dependency-cruiser` with `noCircular` plus an
  `eslint-plugin-boundaries` configuration where each module declares
  `allowedDependencies`.
- **Fails when**: a cycle or an undeclared edge is detected.

---

## Group B — Tenancy and data

### FF-05 Vector retrieval filters tenancy in SQL
- **Verifies**: no application-side post-filtering of embedding results.
- **How**: static check that every query containing `<=>` also contains
  `tenant_id`; plus an integration test seeding two tenants with near-identical
  vectors and asserting tenant B's chunk never appears in tenant A's result
  **and** is not present in the pre-filter result set.
- **Fails when**: the static check finds a `<=>` query without `tenant_id`, or the
  isolation test returns foreign rows.

### FF-22 No string-built SQL
- **Verifies**: all SQL is parameterised.
- **How**: ESLint rule banning template literals passed to `db.execute`/`sql.raw`
  with interpolation; `sql.raw` is allowlisted only in `packages/database/migrations`.
- **Fails when**: an interpolated query is found outside the allowlist.

### FF-11 Ledgers and audit are append-only
- **Verifies**: the app role cannot mutate history.
- **How**: integration assertion:
  ```sql
  SELECT has_table_privilege('vyra_app','audit_record','UPDATE')
      OR has_table_privilege('vyra_app','audit_record','DELETE')
      OR has_table_privilege('vyra_app','usage_ledger_entry','UPDATE')
      OR has_table_privilege('vyra_app','usage_ledger_entry','DELETE');
  ```
- **Fails when**: the expression returns true.

### FF-31 Retention policies exist for every retained dataset
- **Verifies**: each table/bucket prefix in `database-schema.md` §5 has an
  implemented expiry.
- **How**: a test comparing the retention table to configured S3 lifecycle rules
  and scheduled purge jobs.
- **Fails when**: a dataset has no retention mechanism.

---

## Group C — Consumption and idempotency

### FF-07 All consumption is derived from the ledger
- **Verifies**: no stored mutable balance is authoritative.
- **How**: (a) `grep -rEn "remaining_minutes|remainingMinutes\s*=" apps packages`
  finds no assignment outside a clearly named cache projection;
  (b) the unique index `usage_commit_once` exists;
  (c) property test: for random sequences of reserve/commit/release/adjustment,
  the ledger fold equals the independently computed expectation.
- **Fails when**: any of (a)–(c) fails.

### FF-28 Every generation is idempotent
- **Verifies**: duplicate submission cannot produce two billable renders.
- **How**: integration test invoking the render use case twice with the same
  input; asserts exactly one `generation_attempt`, one provider submission
  recorded in the mock, and one `commit` entry. Plus a static check that
  `GenerationAttempt` is persisted before any `submit()` call in the adapter path.
- **Fails when**: more than one submission or commit is observed.

### FF-24 Every webhook is idempotent and signature-gated
- **Verifies**: replay protection and spoofing resistance.
- **How**: test posts the same `provider_event_id` twice ⇒ single effect;
  posts an unsigned/invalid-signature event ⇒ no state transition and no usage
  commit; asserts the `(provider, provider_event_id)` unique index exists.
- **Fails when**: a second effect occurs or an unsigned event mutates state.

---

## Group D — Secrets, credentials, media

### FF-19 No secret is committed
- **Verifies**: no key, token, password or signing secret in git.
- **How**: `gitleaks detect --no-git=false --redact` in CI plus a pre-commit
  hook; `.env*` files (except `.env.example`) are gitignored and an explicit test
  asserts they are not tracked: `git ls-files | grep -E '^\.env' | grep -v example`.
- **Fails when**: gitleaks reports a finding or a tracked `.env` file exists.

### FF-14 Runtime credentials come from Secrets Manager
- **Verifies**: no provider key is read from a repo file or hardcoded.
- **How**: static check that provider adapters obtain credentials only through
  `packages/config`'s secret resolver; ESLint bans `process.env.<PROVIDER>_API_KEY`
  outside that resolver.
- **Fails when**: a direct env or literal credential read is found.

### FF-10 Every social token is encrypted at rest
- **Verifies**: no plaintext token column and no plaintext write path.
- **How**: schema assertion that `social_connection` exposes only
  `*_ciphertext bytea` and has no `access_token`/`refresh_token` text column;
  integration test reads the raw row after connecting and asserts the bytes do
  not contain the known fixture token.
- **Fails when**: a plaintext column exists or fixture bytes are found.

### FF-20 Logs never contain sensitive material
- **Verifies**: the redaction layer works and is used.
- **How**: unit tests feeding tokens, prompts, document text and signed URLs
  through the logger and asserting redaction; ESLint bans `console.*` outside
  `packages/observability`; a test asserts no logger call site passes a raw
  request body.
- **Fails when**: any sensitive fixture survives redaction or a banned call exists.

### FF-21 No media persists on the local filesystem
- **Verifies**: media lives in S3 only.
- **How**: ESLint `no-restricted-imports` on `node:fs` write APIs within
  `modules/media` and the media workers, allowing only a streaming temp path
  helper; plus an integration test that runs a full ingest and asserts the
  configured temp directory is empty afterwards.
- **Fails when**: a disallowed `fs` write is found or temp files remain.

---

## Group E — Authorization and governance

### FF-17 Every administrative route is authorized server-side
- **Verifies**: no route relies on UI hiding.
- **How**: a route-manifest test enumerating every registered route and asserting
  each declares a role/capability guard; plus a generated authorization matrix
  test that calls every `/control/*` and `/studio/*` route with each role and
  asserts the expected allow/deny.
- **Fails when**: a route lacks a declared guard or the matrix mismatches.

### FF-12 No mechanism bypasses provider voice verification
- **Verifies**: VYRA never simulates or proxies ElevenLabs verification.
- **How**: `grep -rEni "skip.?verif|bypass.?verif|fake.?captcha|mock.?owner" apps packages --include=*.ts`
  outside `tests/` returns nothing; plus a check that `voice_clone.verification_state`
  is only written from the provider adapter's state mapper, never from a use case.
- **Fails when**: any match or an unauthorized write path exists.

### FF-30 Consent is enforced before every generation
- **Verifies**: the consent guard cannot be skipped.
- **How**: state-machine test asserting T08 and T10 both call the consent guard;
  a mutation-style test that disabling the guard makes a dedicated test fail;
  integration test revoking consent between approval and render asserts `BLOCKED`.
- **Fails when**: a generation path reaches provider submission without the guard.

### FF-29 Publication is authorized and deduplicated
- **Verifies**: no duplicate or unauthorized publication.
- **How**: asserts the partial unique index on `(content_item_id, channel_id)`;
  test double-publishes and asserts one `external_post_id` and one platform call;
  authorization test for the schedule/publish routes.
- **Fails when**: two calls or two post ids occur.

### FF-15 AI disclosure is never suppressed
- **Verifies**: AI-generated content uses official disclosure where available.
- **How**: test asserting the publish request builder sets the disclosure
  capability for every AI-generated item; a guard test asserting publication is
  **blocked** when the platform requires disclosure and the mapping is
  unresolved (GATE-TT02); `grep` ban on config keys matching
  `disableAiDisclosure|hideAiGenerated`.
- **Fails when**: disclosure is absent, suppressed, or silently skipped.

---

## Group F — Runtime discipline

### FF-06 Content state changes only via the workflow engine
- **How**: static check that `content_item.state` is written only by
  `modules/workflow`; ESLint boundary rule plus a repository-level assertion that
  the state column has no setter outside the transition executor.
- **Fails when**: another module writes the column.

### FF-09 No model identifier appears outside configuration
- **How**: `grep -rEn "(gpt|deepseek|claude|gemini)[-_][a-z0-9.]+" apps packages --include=*.ts`
  excluding `packages/config` and fixtures returns nothing.
- **Fails when**: any match.

### FF-13 Provider limits are configuration, not constants
- **How**: static check banning numeric literals assigned to identifiers matching
  `maxConcurrency|rateLimit|retryBudget|timeoutMs` inside `packages/providers`
  outside the config schema; they must resolve from `packages/config`.
- **Fails when**: a literal is found.

### FF-16 Dashboards never call providers synchronously
- **How**: `dependency-cruiser` rule forbidding `modules/performance/**` request
  handlers from importing `PublishingProvider`; plus a test asserting the
  performance endpoint makes zero provider calls against the mock.
- **Fails when**: an import or a call is observed.

### FF-08 CI performs no billable provider call
- **How**: CI asserts `PROVIDER_MODE=mock`; adapters throw if constructed with
  `live` while `CI=true`; a network-egress guard in the test harness fails any
  outbound request to a provider host during standard suites.
- **Fails when**: a live adapter is constructed or an outbound provider request is attempted.

### FF-18 OpenAPI matches the contracts
- **How**: regenerate `docs/api/openapi.yaml` from `packages/contracts` in CI and
  `git diff --exit-code` it.
- **Fails when**: the committed spec differs from the generated one.

### FF-23 Authentication hardening is present
- **How**: tests asserting Argon2id parameters meet the configured minimum,
  cookies carry `HttpOnly`+`Secure`+`SameSite`, lockout triggers after the
  configured failures, MFA is required for `ADMIN`/`SUPER_ADMIN`, and a revoked
  session is rejected on the next request.
- **Fails when**: any assertion fails.

### FF-25 SSRF controls hold
- **How**: security tests attempting fetches to `127.0.0.1`, `10.0.0.1`,
  `169.254.169.254`, `file://`, and an allowed host that redirects to a denied
  one; all must be refused.
- **Fails when**: any fetch succeeds.

### FF-26 Upload validation holds
- **How**: security tests uploading an extension-spoofed file, an oversized file,
  a macro-bearing document and a decompression bomb; all rejected before parsing.
- **Fails when**: any is accepted.

### FF-27 Prompt injection is contained
- **How**: a corpus of injection payloads is ingested as knowledge and retrieved
  into a generation; assertions: payload text appears only in the data region of
  the assembled prompt, the instruction region is byte-identical to the template,
  and no state transition is triggered by model output.
- **Fails when**: payload text reaches the instruction region or output triggers a transition.

### FF-32 An ingestion failure never causes a billable re-render
- **Verifies**: guard G-5 — a missing or un-ingested asset cannot create a second
  billable generation, and cannot reverse a commit.
- **How**:
  (a) integration test: drive an attempt to `INGESTING`, force ingestion to fail
      past its retry budget, then assert — exactly **one** `GenerationAttempt`,
      exactly **one** `commit` entry still present, **zero** `release` entries for
      that attempt, item in `BLOCKED(ingestion_failed)`, and **zero** additional
      provider `submit()` calls recorded by the mock;
  (b) operator retry (T11c) repeats the assertion — still one submission;
  (c) static check: no code path under the ingestion/reconciliation modules
      constructs a `GenerationAttempt` or calls `VideoProvider.submit`
      (`dependency-cruiser` forbid rule + grep on the ingestion reconciler).
- **Fails when**: a second submission or attempt appears, or the commit is
  released/reversed.

### FF-33 VYRA QA cannot be skipped by a client approval setting
- **Verifies**: T13 requires a human `QA_REVIEWER` verdict regardless of the
  tenant's `MANUAL`/`AUTO` video-approval policy.
- **How**:
  (a) test matrix over tenant approval policy ∈ {`MANUAL`,`AUTO`} × QA record
      ∈ {absent, present-fail, present-pass}: reaching `READY` is possible **only**
      with `present-pass`;
  (b) assert `QARecord.reviewerId` is non-null and `policy = HUMAN_REQUIRED` for
      every item that reached `READY`;
  (c) static check: the T13 guard does not read the client-approval policy —
      grep the transition implementation for the approval-policy symbol and
      expect no match.
- **Fails when**: any `AUTO` combination reaches `READY` without a human verdict,
  or the QA guard references the client approval policy.

---

## Coverage of brief §50

| §50 rule | Function |
|---|---|
| no tenant-owned query without tenant boundary | FF-01, FF-05, FF-22 |
| no secret in git | FF-19 |
| no domain importing HeyGen SDK | FF-02, FF-03 |
| no domain importing ElevenLabs SDK | FF-02, FF-03 |
| every generation idempotent | FF-28 |
| all consumption derived from ledger | FF-07 |
| no persistent media on local filesystem | FF-21 |
| CI performs no billable provider calls | FF-08 |
| every webhook idempotent | FF-24 |
| every social token encrypted | FF-10 |
| every administrative route authorized server-side | FF-17 |

## Additional invariants (beyond §50)

| Invariant | Function |
|---|---|
| ingestion failure never re-renders or reverses a commit | FF-32 |
| VYRA QA cannot be skipped by a tenant setting | FF-33 |
