# REPO-MIGRATION REPORT — VYRA ZIP → ZENLABS FOUNDATION V2

## Source

File: `vyra-main-FERNANDO-2.zip`  
SHA256: `fedd2ec39f431f687db023652c6064143f3c2170bb785abe7535198f127dce2d`  
Entries audited: `480` files.

## Target

GitHub: `https://github.com/hudsonlcustodio/zenlabs`

The target repository was verified as empty on 2026-09-01 before this migration package was produced.

## Strategy

1. Preserve useful technical scaffold.
2. Rename active technical namespace `@vyra/*` → `@zenlabs/*`.
3. Preserve exact VYRA documentation under `docs/_legacy/vyra-p1`.
4. Replace product/architecture authority with Foundation V2.
5. Explicitly triage legacy ADRs.
6. Do not silently major-upgrade framework/runtime versions during the domain migration.
7. Add Foundation V2 gates before feature implementation.

## Migration counts

- **ARCHIVED_INDEX**: 1
- **ARCHIVED_LEGACY_BACKLOG**: 279
- **ARCHIVED_REFERENCE**: 27
- **ARCHIVED_SUPERSEDED_PRODUCT**: 3
- **MIGRATED_COMPATIBILITY**: 1
- **PRESERVED_RENAMED**: 131
- **PRESERVE_CONCEPT**: 9
- **PRESERVE_EXPAND_V2**: 4
- **PRESERVE_EXTENSION_POINT**: 1
- **PRESERVE_LATER**: 2
- **PRESERVE_REVIEW_NEED**: 1
- **PRESERVE_REVIEW_SECURITY**: 1
- **PRESERVE_REVIEW_TECH**: 1
- **PRESERVE_UNTIL_TRIGGER**: 1
- **PRESERVE_WITH_LEDGER_SPLIT**: 1
- **REFACTOR_DESIGN_V2**: 2
- **REFACTOR_PROVIDER_OPTIONAL**: 1
- **REFACTOR_SCALE_V2**: 1
- **REFACTOR_V2**: 3
- **REVIEW_CLOUD_GATE**: 2
- **REVIEW_TECH_GATE**: 2
- **SUPERSEDED**: 5
- **SUPERSEDED_COMMERCIAL_SEMANTICS**: 1

## Critical supersessions

### HeyGen primary
Legacy ADR-0012 is superseded.
V2 is multi-model/capability-routed.

### Human QA required
Legacy ADR-0033 is superseded.
V2 supports ALWAYS_HUMAN / EXCEPTION_ONLY / SAMPLE / AUTO_RELEASE under deterministic policy.

### Usage semantics
Legacy ADR-0018 commercial semantics are superseded.
Provider costs and client usage are separate ledgers.

### Client approval
Legacy client-as-operational-approver model is superseded.
Client owns intent/knowledge; operational quality belongs to ZENLABS.

### Visual direction
Legacy dark product experience is superseded by White ZENLABS design contract.

## Preserved high-value technical assets

- monorepo/workspace structure;
- modular boundaries;
- API and worker bootstraps;
- Zod contracts baseline;
- config/logging/correlation;
- architecture fitness;
- OpenAPI drift gate;
- secret scan;
- idempotency/outbox concepts;
- RLS concept;
- provider port boundary;
- private media concept;
- audit/consent discipline.

## What is NOT evidence yet

- dependency installation after migration;
- green full test suite;
- build;
- database migrations;
- live queue;
- live providers;
- QC thresholds;
- scale capacity.

See `GATE-TECH-FOUNDATION-001`.
