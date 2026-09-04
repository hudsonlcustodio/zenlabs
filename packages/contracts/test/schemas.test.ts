import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import { problemDetailsSchema, PROBLEM_CONTENT_TYPE } from '../src/errors/problem-details';
import {
  cursorPageSchema,
  cursorPaginationQuerySchema,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
} from '../src/http/pagination';
import { correlationIdSchema, idempotencyKeySchema, API_BASE_PATH } from '../src/http/headers';
import {
  DOMAIN_EVENT_NAMES,
  domainEventEnvelopeSchema,
  domainEventSchema,
} from '../src/events/domain-event';
import {
  auditEventSchema,
  clientSchema,
  consentSchema,
  digitalTwinSchema,
  identityPackSchema,
  tenantSchema,
} from '../src/identity/identity-slice';

describe('problem details — RFC 9457 (api-contracts.md §1)', () => {
  it('uses the problem+json media type', () => {
    expect(PROBLEM_CONTENT_TYPE).toBe('application/problem+json');
  });

  it('accepts a well-formed problem and defaults type to about:blank', () => {
    const parsed = problemDetailsSchema.parse({
      title: 'Not Found',
      status: 404,
      code: 'not_found',
    });
    expect(parsed.type).toBe('about:blank');
    expect(parsed.code).toBe('not_found');
  });

  it('rejects a non-stable code', () => {
    const result = problemDetailsSchema.safeParse({
      title: 'Teapot',
      status: 418,
      code: 'teapot',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a success status — a problem is always 4xx/5xx', () => {
    expect(
      problemDetailsSchema.safeParse({ title: 'ok', status: 200, code: 'conflict' }).success,
    ).toBe(false);
  });

  it('carries field-level issues only as structured pointers', () => {
    const parsed = problemDetailsSchema.parse({
      title: 'Unprocessable Entity',
      status: 422,
      code: 'validation_failed',
      errors: [{ pointer: '/channel', reason: 'required' }],
    });
    expect(parsed.errors).toEqual([{ pointer: '/channel', reason: 'required' }]);
  });
});

describe('cursor pagination (api-contracts.md §1, ADR-0032)', () => {
  it('defaults the limit and accepts a cursor', () => {
    expect(cursorPaginationQuerySchema.parse({})).toEqual({ limit: PAGINATION_DEFAULT_LIMIT });
    expect(cursorPaginationQuerySchema.parse({ cursor: 'abc', limit: '10' })).toEqual({
      cursor: 'abc',
      limit: 10,
    });
  });

  it('caps the limit', () => {
    expect(cursorPaginationQuerySchema.safeParse({ limit: PAGINATION_MAX_LIMIT + 1 }).success).toBe(
      false,
    );
  });

  it('has no offset member — offset pagination is inexpressible', () => {
    const parsed = cursorPaginationQuerySchema.parse({ offset: 40, limit: 10 } as never) as Record<
      string,
      unknown
    >;
    expect(parsed.offset).toBeUndefined();
  });

  it('renders { data, nextCursor } with an explicit null on the last page', () => {
    const page = cursorPageSchema(z.object({ id: z.string() }));
    expect(page.parse({ data: [{ id: 'a' }], nextCursor: null })).toEqual({
      data: [{ id: 'a' }],
      nextCursor: null,
    });
    expect(page.safeParse({ data: [] }).success).toBe(false);
  });
});

describe('headers (api-contracts.md §1)', () => {
  it('fixes the v1 base path', () => {
    expect(API_BASE_PATH).toBe('/api/v1');
  });

  it('accepts a url-safe correlation id and rejects an injectable one', () => {
    expect(correlationIdSchema.parse('abc-123_x.y:z')).toBe('abc-123_x.y:z');
    expect(correlationIdSchema.safeParse('bad value\nlog-injection').success).toBe(false);
    expect(correlationIdSchema.safeParse('x'.repeat(129)).success).toBe(false);
    expect(correlationIdSchema.safeParse('').success).toBe(false);
  });

  it('requires a non-trivial idempotency key', () => {
    expect(idempotencyKeySchema.safeParse('short').success).toBe(false);
    expect(idempotencyKeySchema.safeParse('a'.repeat(16)).success).toBe(true);
  });
});

describe('domain events (architecture.md §6) — AC-3', () => {
  it('declares the 27 canonical event names', () => {
    expect(DOMAIN_EVENT_NAMES).toHaveLength(27);
    expect(DOMAIN_EVENT_NAMES).toContain('ContentRequested');
    expect(DOMAIN_EVENT_NAMES).toContain('ConsentRevoked');
    expect(new Set(DOMAIN_EVENT_NAMES).size).toBe(DOMAIN_EVENT_NAMES.length);
  });

  const envelope = {
    eventId: '0f0c2e2e-2f4a-4d64-9a3f-0a0f6f1c1b21',
    tenantId: 'b3d1a2c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    occurredAt: '2026-01-01T00:00:00.000Z',
    correlationId: 'corr-1',
    causationId: null,
    schemaVersion: 1,
  };

  it('requires every field architecture.md §6 mandates', () => {
    expect(domainEventEnvelopeSchema.parse(envelope)).toEqual(envelope);
    for (const field of Object.keys(envelope)) {
      const partial: Record<string, unknown> = { ...envelope };
      delete partial[field];
      expect(
        domainEventEnvelopeSchema.safeParse(partial).success,
        `${field} must be mandatory`,
      ).toBe(false);
    }
  });

  it('cannot express a tenant-less event (architecture.md §5)', () => {
    expect(domainEventEnvelopeSchema.safeParse({ ...envelope, tenantId: null }).success).toBe(false);
    expect(domainEventEnvelopeSchema.safeParse({ ...envelope, tenantId: '' }).success).toBe(false);
  });

  it('rejects an event name outside the canonical set', () => {
    expect(
      domainEventSchema.safeParse({ ...envelope, name: 'SomethingInvented', payload: {} }).success,
    ).toBe(false);
    expect(
      domainEventSchema.safeParse({ ...envelope, name: 'ScriptApproved', payload: {} }).success,
    ).toBe(true);
  });
});

describe('Wave 1 identity vertical slice contracts', () => {
  const tenantId = 'b3d1a2c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
  const clientId = 'c3d1a2c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
  const twinId = 'd3d1a2c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
  const consentId = 'e3d1a2c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
  const packId = 'f3d1a2c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
  const now = '2026-09-04T12:00:00.000Z';

  it('requires tenant scope on every client-owned identity record', () => {
    const records = [
      clientSchema,
      consentSchema,
      digitalTwinSchema,
      identityPackSchema,
      auditEventSchema,
    ];
    for (const schema of records) {
      expect(schema.safeParse({}).success).toBe(false);
    }
    expect(tenantSchema.parse({ id: tenantId, name: 'Acme', createdAt: now }).id).toBe(tenantId);
  });

  it('accepts the complete tenant → client → consent → twin → pack → audit chain', () => {
    expect(clientSchema.parse({ id: clientId, tenantId, name: 'Ana', status: 'ACTIVE', createdAt: now })).toMatchObject({ tenantId });
    expect(consentSchema.parse({ id: consentId, tenantId, clientId, scope: ['DIGITAL_TWIN', 'IDENTITY_PACK'], status: 'GRANTED', evidenceRef: 'consent:e3', grantedAt: now, revokedAt: null })).toMatchObject({ tenantId, clientId });
    expect(digitalTwinSchema.parse({ id: twinId, tenantId, clientId, consentId, status: 'DRAFT', activeIdentityPackVersion: null, createdAt: now, updatedAt: now })).toMatchObject({ tenantId, consentId });
    expect(identityPackSchema.parse({ id: packId, tenantId, digitalTwinId: twinId, version: 1, status: 'DRAFT', assetRefs: ['s3://private/ref-front'], createdAt: now })).toMatchObject({ tenantId, digitalTwinId: twinId });
    expect(auditEventSchema.parse({ eventId: 'a3d1a2c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d', tenantId, actorType: 'SYSTEM', action: 'identity_pack.created', entityType: 'IDENTITY_PACK', entityId: packId, occurredAt: now, metadata: { version: 1 } })).toMatchObject({ tenantId, entityId: packId });
  });

  it('rejects revoked consent as active and rejects provider IDs as identity', () => {
    expect(consentSchema.safeParse({ id: consentId, tenantId, clientId, scope: ['DIGITAL_TWIN'], status: 'REVOKED', evidenceRef: 'consent:e3', grantedAt: now, revokedAt: null }).success).toBe(false);
    expect(digitalTwinSchema.safeParse({ id: twinId, tenantId, clientId, consentId, providerId: 'provider-123', status: 'DRAFT', activeIdentityPackVersion: null, createdAt: now, updatedAt: now }).success).toBe(true);
    expect(digitalTwinSchema.parse({ id: twinId, tenantId, clientId, consentId, providerId: 'provider-123', status: 'DRAFT', activeIdentityPackVersion: null, createdAt: now, updatedAt: now })).not.toHaveProperty('providerId');
  });
});
