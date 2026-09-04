/**
 * @zenlabs/contracts — the zero-I/O root (architecture.md §2.2).
 *
 * Zod schemas, DTOs, domain event payloads and error codes. This package
 * depends on nothing in the workspace and performs no I/O, which is what lets
 * `apps/api`, the three workers and `apps/web` share one definition instead of
 * three drifting copies (ADR-0002).
 *
 * Everything exported here is public API. The export surface is snapshot-tested
 * (P1.04 AC-4), so a breaking change is visible in review rather than at
 * runtime in another workspace.
 */

// Errors — api-contracts.md §1.1
export {
  ERROR_CODES,
  ERROR_CODE_STATUS,
  errorCodeSchema,
  isErrorCode,
  type ErrorCode,
} from './errors/error-codes';

export {
  PROBLEM_CONTENT_TYPE,
  problemDetailsSchema,
  validationIssueSchema,
  type ProblemDetails,
  type ValidationIssue,
} from './errors/problem-details';

// HTTP conventions — api-contracts.md §1
export {
  API_BASE_PATH,
  API_VERSION,
  CORRELATION_ID_HEADER,
  IDEMPOTENCY_KEY_HEADER,
  correlationIdSchema,
  idempotencyKeySchema,
} from './http/headers';

export {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
  cursorPageSchema,
  cursorPaginationQuerySchema,
  type CursorPage,
  type CursorPaginationQuery,
} from './http/pagination';

// Domain events — architecture.md §6
export {
  DOMAIN_EVENT_NAMES,
  domainEventEnvelopeSchema,
  domainEventNameSchema,
  domainEventSchema,
  type DomainEvent,
  type DomainEventEnvelope,
  type DomainEventName,
  type DomainEventPayloads,
  type PayloadOf,
} from './events/domain-event';

// Wave 1 identity vertical slice — tenant-scoped contracts.
export {
  auditEventSchema,
  clientSchema,
  consentSchema,
  digitalTwinSchema,
  identityPackSchema,
  voiceProfileSchema,
  tenantSchema,
  type AuditEvent,
  type Client,
  type Consent,
  type DigitalTwin,
  type IdentityPack,
  type VoiceProfile,
  type Tenant,
} from './identity/identity-slice';

// Wave 2 planning contracts — mock execution only.
export {
  productionBudgetSchema,
  productionRequestSchema,
  productionPlanSchema,
  productionPolicySchema,
  costEstimateSchema,
  shotSchema,
  type ProductionBudget,
  type ProductionPlan,
  type ProductionPolicy,
  type CostEstimate,
  type ProductionRequest,
  type Shot,
} from './production/planning';
