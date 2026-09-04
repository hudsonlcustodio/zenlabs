# CI/CD V2

## Blocking
- foundation validator;
- no legacy namespace in runtime;
- lint;
- typecheck;
- unit tests;
- integration tests where environment exists;
- architecture fitness;
- OpenAPI diff;
- secret scan;
- dependency scan;
- build.

## Artifact provenance
Production deploys should record:
- git SHA;
- build timestamp;
- dependency lock;
- migration version;
- config version;
- pack/policy schema version.

## Rollout
Start with staging and pilot tenants.
Any migration affecting identity/usage/billing requires rollback/forward plan and evidence.
