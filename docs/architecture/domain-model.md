# DOMAIN MODEL V2

## Aggregates / core entities

### Tenant
Security and billing boundary.

### Client
Commercial/operational account inside tenant context.

### DigitalTwin
Canonical synthetic identity owned by ZENLABS domain.

Fields conceptually:
- id;
- tenantId;
- ownerIdentity;
- status;
- consentState;
- activeIdentityPackVersion;
- activeVoiceProfileVersion;
- brandProfile;
- knowledgePolicy;
- createdAt/updatedAt.

### IdentityPack
Versioned visual identity reference set.

Contains:
- source assets;
- front/left/right references;
- identity master;
- character sheet;
- canonical views;
- appearance rules;
- provenance;
- calibration evidence.

### VoiceProfile
Versioned voice representation.

Contains:
- source samples;
- provider bindings;
- pronunciation dictionary;
- performance profile;
- consent linkage.

### ProductionRequest
Intent and constraints.

### ProductionAnalysis
Probabilistic structured analysis.

### ProductionPack
Versioned recipe.

### ProductionPolicy
Deterministic tenant/client policy.

### Production
Final audiovisual work unit.

### Chapter / Scene / Shot
Hierarchical production plan.

### ProductionBudget
Cost authorization boundary.

### MediaJob
Provider execution attempt.

### ProviderCapabilitySnapshot
Time/version-scoped provider capability record.

### QCRecord
Quality evidence and verdict.

### ProductionException
Human-attention work item.

### MediaAsset
ZENLABS-owned canonical file metadata.

### ClientUsageLedgerEntry
Commercial capacity accounting.

### ProviderCostLedgerEntry
Internal COGS/provider spend.

### Publication
Distribution state.

### AuditEvent
Security/governance trail.

## Ownership rule

Provider references are never aggregate identity.

`DigitalTwin.id` remains stable if every provider is replaced.

## Sensitivity

High sensitivity:
- source photos/video;
- voice samples;
- IdentityPack;
- provider credentials;
- consent evidence.

Operational:
- production plan;
- provider jobs;
- cost;
- QC.

Client-visible:
- calendar;
- final content;
- published content;
- selected performance/billing information.
