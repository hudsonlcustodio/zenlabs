# RELIABILITY & OBSERVABILITY V2

## Workload model
Not yet verified. Before production load test:
- active tenants;
- productions/day;
- shots/production;
- final minutes/day;
- job duration distribution;
- provider concurrency;
- payload sizes;
- storage growth;
- geography;
- target SLO.

## Core SLIs
- API availability/latency;
- queue age;
- job success;
- provider latency/error;
- ingest success;
- assembly success;
- production lead time;
- STP Rate;
- exception backlog age.

## Correlation
Every request/job/event carries:
- correlationId;
- causationId where relevant;
- tenantId;
- productionId where relevant;
- mediaJobId where relevant.

## Provider observability
Per provider/model/version:
- success rate;
- p50/p95 latency;
- rate limits;
- quality acceptance;
- actual cost;
- retries;
- circuit state.

## Failure behavior
- graceful degradation;
- bounded retry;
- DLQ;
- reconciliation;
- circuit breaker;
- fallback only if policy/quality/budget permit.

## Backups
PostgreSQL backup/restore and object storage protection require tested RTO/RPO before production readiness.
