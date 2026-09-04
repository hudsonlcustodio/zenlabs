import { z } from 'zod';

/**
 * The declared home for domain event payload types (P1.04 AC-3).
 *
 * No event is emitted until P8 — this package only fixes *where* payloads live
 * and *what envelope* every one of them carries, so P8 cannot invent a second
 * shape and the workers cannot drift from the API.
 *
 * architecture.md §6: events are in-process by default, published inside the
 * same transaction as the state change via a transactional outbox.
 */

/** architecture.md §6 — the canonical event names, verbatim and closed. */
export const DOMAIN_EVENT_NAMES = [
  'ContentRequested',
  'BriefingGenerated',
  'ScriptGenerated',
  'ScriptApproved',
  'ScriptRejected',
  'VoiceGenerated',
  'RenderRequested',
  'RenderCompleted',
  'RenderFailed',
  'MediaIngested',
  'MediaIngestionFailed',
  'QAPassed',
  'QAFailed',
  'VideoApproved',
  'VideoRejected',
  'PublicationScheduled',
  'PublicationCompleted',
  'PublicationFailed',
  'UsageReserved',
  'UsageCommitted',
  'UsageReleased',
  'ProviderCostRecorded',
  'TwinActivated',
  'TwinRevoked',
  'VoiceCloneReady',
  'ConsentGranted',
  'ConsentRevoked',
] as const;

export type DomainEventName = (typeof DOMAIN_EVENT_NAMES)[number];

export const domainEventNameSchema = z.enum(DOMAIN_EVENT_NAMES);

/**
 * architecture.md §6: "Every event payload carries `eventId`, `tenantId`,
 * `occurredAt`, `correlationId`, `causationId`, `schemaVersion`."
 *
 * `tenantId` is non-nullable by construction: an event that is not attributable
 * to a tenant cannot be expressed (architecture.md §5).
 */
export const domainEventEnvelopeSchema = z.object({
  eventId: z.string().uuid(),
  tenantId: z.string().uuid(),
  occurredAt: z.string().datetime({ offset: true }),
  correlationId: z.string().min(1),
  /** The event or command that caused this one. Null at the root of a chain. */
  causationId: z.string().min(1).nullable(),
  schemaVersion: z.number().int().positive(),
});

export type DomainEventEnvelope = z.infer<typeof domainEventEnvelopeSchema>;

/**
 * A domain event is its envelope plus a name-specific payload.
 *
 * P8 registers concrete payload schemas by augmenting `DomainEventPayloads`
 * from inside this package. Until then the registry is intentionally empty and
 * `payload` is validated as an object only.
 */
export const domainEventSchema = domainEventEnvelopeSchema.extend({
  name: domainEventNameSchema,
  payload: z.record(z.unknown()),
});

export type DomainEvent = z.infer<typeof domainEventSchema>;

/**
 * Payload registry. Empty by design until P8.
 *
 * Declaring a payload here — rather than beside a module — is what keeps the
 * API, the workers and the UI reading one definition.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DomainEventPayloads {}

/** The payload type for a registered event, or `unknown` while P8 is pending. */
export type PayloadOf<N extends DomainEventName> = N extends keyof DomainEventPayloads
  ? DomainEventPayloads[N]
  : unknown;
