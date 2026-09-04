# VYRA — Observability

- **Authority**: brief §35, §28
- **IMPLEMENTATION NOT STARTED**

## 1. Structured logging

JSON only. Mandatory fields on every record:

`timestamp`, `level`, `service`, `env`, `correlationId`, `requestId`,
`jobId?`, `tenantId?`, `actorId?`, `module`, `event`, `durationMs?`,
`provider?`, `errorClass?`, `retryCount?`.

- `tenantId` is included because it is an opaque UUID, not personal data.
- **Never logged**: tokens, secrets, full audio, private documents, complete
  prompts, raw model output containing client content, password hashes
  (brief §35). Enforced by the redaction layer in `packages/observability` and
  unit-tested (FF-20).
- Request/response bodies are never logged wholesale.

## 2. Correlation

- `correlationId` enters at the edge (accepted via `X-Correlation-Id` or
  generated) and propagates through HTTP → outbox event → SQS message → worker →
  provider call.
- `causationId` links an event to the event that caused it.
- A published video is therefore traceable back through publication → approval →
  render attempt → voice synthesis → script → context snapshot → knowledge chunks.

## 3. Metrics

| Domain | Metrics |
|---|---|
| API | request rate, error rate by code, P50/P95/P99 latency by route class |
| Queues | depth, oldest-message age, in-flight, DLQ depth, receive count distribution |
| Generation | attempts started/succeeded/failed by kind, duration, failure class distribution |
| Ingestion | pending, retrying, succeeded, failed; committed-without-asset count |
| QA | queue depth, oldest age, pass/fail rate, reviewer throughput |
| Providers | call rate, latency, error class, retry count, breaker state, rate-limit hits |
| Usage | reservations held, commits, releases, adjustments |
| Cost | provider cost per period, per tenant, per attempt |
| Publication | scheduled, published, failed by platform and error class |
| Knowledge | ingestion throughput, failures by stage, embedding latency |
| Identity | active twins, revocations, propagation failures |
| Auth | login success/failure, lockouts, MFA challenges |

## 4. Alarms

| Alarm | Condition | Severity |
|---|---|---|
| DLQ non-empty | any message | high |
| Queue oldest-message age | > 60 s for 10 min | high |
| API 5xx rate | > 1% for 5 min | high |
| API P95 latency | read > 500 ms / write > 800 ms for 15 min | medium |
| Compute CPU/memory | > 60% / > 75% for 15 min | medium |
| RDS CPU / connections | ≈ 60%+ for 15 min | medium |
| Disk | > 70% | medium |
| Provider breaker open | any | high |
| Provider auth error | any | critical |
| Provider low balance | below configured threshold | high |
| Consent revocation propagation failed | any | critical |
| Render stuck in `RENDERING` | beyond timeout, reconciler unable | high |
| Ingestion failed after retry budget | any `BLOCKED(ingestion_failed)` | high |
| Committed generation without ingested asset | age > threshold | high |
| QA queue oldest item age | above configured threshold (RISK-18) | medium |
| Usage commit constraint violation rate | above baseline | high — indicates retry pathology |
| Secret scan finding | any | critical |

"Sustained" windows above define the `scalability-gates.md` §1 thresholds.

## 5. Dashboards

1. **Pipeline health** — items by state, generation success rate, queue ages.
2. **Provider health** — per-provider latency, error classes, breaker, balance.
3. **Commercial** — usage vs entitlement per tenant, provider cost, contribution.
4. **Platform** — CPU, memory, RDS, disk, API latency, availability.
5. **Security** — auth failures, lockouts, authorization denials, secret findings.
6. **Governance** — active consents, revocations, propagation state.

## 6. Tracing

Correlation-ID-based log linking at MVP. Distributed tracing (OpenTelemetry) is
deferred; its trigger is the introduction of a second deployable service via
gate G-G, at which point log-only correlation stops being sufficient.

## 7. Audit vs logs

`audit_record` is a governance artifact with a 5-year retention and append-only
grants. Application logs are operational, shorter-lived, and redacted. They are
never conflated (brief §32).
