# DOMAIN EVENTS V2

Candidate canonical events:

## Identity
- `ConsentGranted`
- `ConsentRevoked`
- `TwinActivated`
- `TwinSuspended`
- `IdentityPackActivated`

## Production planning
- `ProductionRequested`
- `ProductionAnalyzed`
- `ProductionPlanCreated`
- `ProductionCostEstimated`
- `ProductionApproved`
- `ProductionAutoApproved`
- `ProductionBlocked`

## Execution
- `ShotQueued`
- `MediaJobSubmitted`
- `MediaJobCompleted`
- `MediaIngested`
- `MediaJobFailed`
- `ProviderCostRecorded`

## Quality
- `QCEvaluated`
- `RepairRequested`
- `RepairCompleted`
- `ProductionExceptionOpened`
- `ProductionExceptionResolved`

## Assembly/release
- `AssemblyCompleted`
- `ProductionReady`
- `ProductionScheduled`
- `PublicationCompleted`
- `PublicationFailed`

## Commercial
- `ClientUsageReserved`
- `ClientUsageCommitted`
- `ClientUsageReleased`

Every event envelope:
- eventId
- tenantId
- occurredAt
- correlationId
- causationId
- schemaVersion

Payload compatibility is additive by default. Breaking change requires new schema version.
