# ZENLABS — SOFTWARE ARCHITECTURE V2

**Status:** [PROPOSTA CANÔNICA PARA GATE]

## 1. Architecture style

Monólito modular para control plane + processos assíncronos especializados.

Não adotar microservices sem trigger concreto de scale, deploy autonomy, ownership ou fault isolation.

## 2. Runtime topology

### 2.1 Processes

| Process | Responsibility |
|---|---|
| `apps/web` | Next.js application. Internal operations, production control and read-only client portal. |
| `apps/api` | NestJS modular HTTP API. Command/query entry point, policy enforcement and transactions. |
| `apps/worker-ai` | Production analysis, planning, content intelligence, knowledge ingestion and AI quality evaluation. |
| `apps/worker-media` | Media routing, voice/media generation, provider reconciliation, ingestion, repair and assembly. |
| `apps/worker-social` | Publication, token refresh, performance collection and notifications. |

### 2.2 Packages

| Package | Responsibility |
|---|---|
| `@zenlabs/contracts` | schemas/DTOs/events/errors; zero I/O |
| `@zenlabs/config` | typed runtime config |
| `@zenlabs/observability` | logs/correlation/telemetry |
| `@zenlabs/database` | schema/migrations/RLS/repositories |
| `@zenlabs/providers` | ports/adapters/capability registry |
| `@zenlabs/security` | auth/authz/crypto primitives |
| `@zenlabs/ui` | project-owned design primitives |

## 3. Control Plane vs Production Plane

### Control Plane
- tenants;
- users;
- clients;
- Digital Twins;
- consent;
- IdentityPack;
- policies;
- packs;
- budgets;
- scheduling;
- audit;
- billing/usage.

### Production Plane
- queues;
- workers;
- media jobs;
- providers;
- QC;
- repair;
- assembly.

É separação conceitual. Não exige microservices agora.

## 4. Domain boundaries

- Identity & Consent
- Clients & Tenancy
- Knowledge & Brand
- Content & Scripts
- Production Intelligence
- Production Policy
- Production Execution
- Media & Providers
- Quality & Exceptions
- Calendar & Publishing
- Performance
- Usage & Cost
- Audit & Governance

## 4.1 Boundary rules

1. Cada módulo declara dependencies.
2. Domain não importa infrastructure/provider SDK.
3. Cross-module communication usa application ports/events.
4. Grafo deve permanecer acíclico.
5. Provider IDs nunca são entity primary keys.
6. AI tasks não executam transações de autoridade.

## 5. Tenancy

Shared schema + tenant_id em records client-owned + RLS como defense-in-depth.

Jobs carregam tenant context explicitamente.

## 6. Events

Domain events são persistidos via transactional outbox para efeitos externos.

Envelope:
- eventId;
- tenantId;
- occurredAt;
- correlationId;
- causationId;
- schemaVersion.

## 7. Asynchrony

Nenhum provider long-running deve bloquear HTTP request.

API:
`command → transaction/outbox → accepted`

Worker:
`consume → idempotency check → side effect → state update/outbox`

## 8. Provider abstraction

Ports por capability, não `GenericAIProvider`.

- VoiceProvider
- ImageProvider
- TalkingAvatarProvider
- MotionProvider
- CinematicVideoProvider
- LipSyncRepairProvider
- PublishingProvider

MediaRouter resolve adapters através de ProviderCapabilityRegistry.

## 9. Storage

- PostgreSQL: transactional truth.
- Object storage: canonical private media.
- Provider URL: temporary reference only.
- Queue: durable async transport.
- Cache/Redis: somente com trigger.

## 10. Production flow

`Request → Analysis → Pack → SceneGraph → Cost → Policy → Schedule → Route → Generate → QC → Repair → Assembly → Release`

## 11. Reliability

- idempotency before provider call;
- reconciliation after crash;
- bounded retries;
- circuit breakers;
- DLQ;
- provider health;
- budget hard stops;
- backpressure.

## 12. Scale

500–1.000 clients is a design target, not workload evidence.

Scale workers horizontally first.

Do not promote to distributed architecture before measured gates.
