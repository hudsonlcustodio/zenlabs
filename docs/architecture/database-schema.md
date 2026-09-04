# DATABASE SCHEMA V2 — LOGICAL

**Status:** contract-level; migrations not yet authorized.

## Tenant-scoped tables

- tenant
- user
- session
- client
- digital_twin
- consent
- identity_pack
- identity_asset
- voice_profile
- knowledge_source
- production_policy
- production_pack_assignment
- production_request
- production
- chapter
- scene
- shot
- production_budget
- media_job
- media_asset
- qc_record
- production_exception
- client_usage_ledger_entry
- provider_cost_ledger_entry
- publication
- audit_event
- domain_event

## Global/internal tables

- production_pack
- provider
- provider_capability_snapshot
- provider_rate_card
- routing_policy_version

## RLS

Every client-owned table carries `tenant_id`.

Expected pattern:
`SET LOCAL zenlabs.tenant_id = '<uuid>'`

App role:
- does not own tables;
- no BYPASSRLS;
- RLS forced where applicable.

## Ledger rules

### ClientUsageLedger
Append-only:
- reserve;
- commit;
- release;
- adjustment.

Commercial commit semantics: final delivered/approved capacity according to contract.

### ProviderCostLedger
Append-only provider spend:
- submitted/estimated;
- actual;
- adjustment.

A failed/retried render may add provider cost without consuming client minutes.

## Migration principle

Schema change + RLS + indexes + rollback/forward strategy ship together.
