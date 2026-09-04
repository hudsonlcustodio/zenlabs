# VYRA — Scalability Gates

- **Authority**: brief §28
- These are **analysis and promotion triggers**, never autoscaling rules.
- **IMPLEMENTATION NOT STARTED**

## 1. Observation thresholds

| Signal | Threshold | Meaning |
|---|---|---|
| Compute CPU | > 60% sustained | reassess capacity |
| Compute memory | > 75% sustained | reassess capacity |
| API read latency | P95 ≥ 500 ms | investigate |
| API write latency | P95 ≥ 800 ms | investigate |
| Queue oldest-message age | > 60 s sustained | investigate/scale consumers |
| Database CPU / connections | ≈ 60%+ sustained | investigate capacity |
| Disk (where local storage matters) | alert before 70% | act |
| Critical screen load | ≥ 3 s | investigate |
| Availability | < 99.5% | incident review |

"Sustained" means the condition holds over a rolling window defined in
`observability.md` §4 — a single spike is not a trigger.

## 2. Promotion gates

Each promotion states its trigger, action, and what must be true first.

| Gate | Trigger | Promotion | Precondition |
|---|---|---|---|
| **G-A** | CPU > 60% or memory > 75% sustained, or availability < 99.5% attributable to single-instance restarts | Add **ALB + second EC2 instance** | Sessions already server-side (yes); no local state (verified by FF-21) |
| **G-B** | Sustained multi-instance operation and deploy friction becomes the dominant toil | Move to **ECS/Fargate** | Images already SHA-tagged and stateless |
| **G-C** | RDS CPU/connections ≈ 60%+ sustained, or restore-time objective unmet | **Scale RDS instance class**, then read replica for analytics | Query plans reviewed first; index work exhausted |
| **G-D** | Availability target raised to ≥ 99.9%, or a single-AZ outage becomes unacceptable | **RDS Multi-AZ** | Cost approved; failover drill defined |
| **G-E** | A measured need PostgreSQL/SQS cannot serve: rate limiting at a volume where DB counters contend, or a hot cache with a proven hit-rate benefit | **ElastiCache/Redis** | Evidence recorded; brief §26 requires a clear requirement |
| **G-F** | Queue oldest-message age > 60 s sustained with consumers healthy | Scale worker concurrency, then split the queue | Provider rate limits checked first — the bottleneck is often external |
| **G-G** | One module's scaling profile diverges sharply and is measured, not assumed | Extract that module to its own process | Module boundary already clean (FF-01) |
| **G-H** | Media egress cost or latency becomes material | CloudFront tuning, then regional edge strategy | Cost data recorded |

## 3. Anti-gates

The following are **not** justifications for promotion:

- "It will scale later" without a measurement.
- A single traffic spike.
- Vendor or conference recommendation.
- Anticipated customer growth not yet in the metrics.

## 4. Review cadence

Gates are reviewed monthly against CloudWatch dashboards. A promotion requires:
the triggering metric series, the decision, and an ADR amendment. Promotions
executed without a recorded trigger are architecture violations.
