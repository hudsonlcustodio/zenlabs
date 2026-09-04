# TEST STRATEGY V2

## Risk-based layers

### Unit
- state transitions;
- cost calculation;
- budget guard;
- routing eligibility;
- policy evaluation;
- usage/cost ledger;
- retry decisions.

### Contract
- provider adapters;
- events;
- APIs;
- JSON/Zod schemas;
- OpenAPI drift.

### Integration
- Postgres/RLS;
- outbox;
- queue;
- object storage;
- auth/session.

### E2E
- client/twin/consent;
- request/plan/cost;
- approval;
- mock execution;
- exception flow;
- release.

### Security
- IDOR/tenant escape;
- role elevation;
- consent bypass;
- webhook replay/spoof;
- secret leakage.

### Performance
- queue backlog;
- scheduler;
- worker concurrency;
- provider throttling;
- long-form assembly.

### AI evals
- production plan quality;
- schema adherence;
- grounding;
- adversarial prompt injection;
- QC precision/recall;
- false auto-release.

## Provider tests
CI uses mocks by default.
Live tests are explicit, budgeted and isolated.
