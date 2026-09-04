# FITNESS FUNCTIONS V2

Inherited functions remain valuable and should be extended.

## Existing baseline
- dependency graph / no cycles;
- OpenAPI generate-and-diff;
- no committed secrets.

## V2 additions

### FF-Z01 — No provider SDK in domain
Blocking.

### FF-Z02 — No legacy namespace in active runtime
`@vyra/*` or active VYRA branding fails.

### FF-Z03 — Production budget required
Any billable MediaJob must reference ProductionBudget.

### FF-Z04 — AI cannot perform authority actions
AI worker cannot call billing/permission/consent mutation ports directly.

### FF-Z05 — Tenant scope
Every client-owned aggregate/job/event carries tenantId.

### FF-Z06 — Consent guard
Identity-bearing jobs require active consent evidence.

### FF-Z07 — Auto-release policy
READY without human verdict is possible only under explicit final review policy.

### FF-Z08 — Exception reason
Human escalation/override requires reasonCode.

### FF-Z09 — Provider internals hidden from client contracts
No provider credentials/job IDs in client-facing DTOs.

### FF-Z10 — Ledger separation
Provider cost commit cannot mutate client usage ledger implicitly.

Implement each fitness function when its corresponding domain enters executable code.
