import { z } from 'zod';

const uuid = z.string().uuid();
const timestamp = z.string().datetime({ offset: true });

export const tenantSchema = z.object({
  id: uuid,
  name: z.string().trim().min(1).max(160),
  createdAt: timestamp,
});

export const clientSchema = z.object({
  id: uuid,
  tenantId: uuid,
  name: z.string().trim().min(1).max(160),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'ARCHIVED']),
  createdAt: timestamp,
});

export const consentSchema = z
  .object({
    id: uuid,
    tenantId: uuid,
    clientId: uuid,
    scope: z.array(z.enum(['DIGITAL_TWIN', 'IDENTITY_PACK', 'VOICE', 'MEDIA_GENERATION'])).min(1),
    status: z.enum(['GRANTED', 'REVOKED']),
    evidenceRef: z.string().trim().min(1).max(500),
    grantedAt: timestamp,
    revokedAt: timestamp.nullable(),
  })
  .superRefine((value, context) => {
    if (value.status === 'GRANTED' && value.revokedAt !== null) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['revokedAt'], message: 'granted consent cannot have revokedAt' });
    }
    if (value.status === 'REVOKED' && value.revokedAt === null) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['revokedAt'], message: 'revoked consent requires revokedAt' });
    }
  });

export const digitalTwinSchema = z.object({
  id: uuid,
  tenantId: uuid,
  clientId: uuid,
  consentId: uuid,
  status: z.enum(['DRAFT', 'ENROLLING', 'CALIBRATING', 'ACTIVE', 'SUSPENDED', 'RETIRED']),
  activeIdentityPackVersion: z.number().int().positive().nullable(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const identityPackSchema = z.object({
  id: uuid,
  tenantId: uuid,
  digitalTwinId: uuid,
  version: z.number().int().positive(),
  status: z.enum(['DRAFT', 'VALIDATING', 'CALIBRATED', 'ACTIVE', 'REJECTED', 'SUPERSEDED']),
  assetRefs: z.array(z.string().trim().min(1).max(500)).min(1),
  createdAt: timestamp,
});

export const auditEventSchema = z.object({
  eventId: uuid,
  tenantId: uuid,
  actorType: z.enum(['CLIENT', 'HUMAN', 'SYSTEM', 'AI']),
  action: z.string().trim().min(1).max(120),
  entityType: z.enum(['TENANT', 'CLIENT', 'CONSENT', 'DIGITAL_TWIN', 'IDENTITY_PACK']),
  entityId: uuid,
  occurredAt: timestamp,
  metadata: z.record(z.unknown()),
});

export type Tenant = z.infer<typeof tenantSchema>;
export type Client = z.infer<typeof clientSchema>;
export type Consent = z.infer<typeof consentSchema>;
export type DigitalTwin = z.infer<typeof digitalTwinSchema>;
export type IdentityPack = z.infer<typeof identityPackSchema>;
export type AuditEvent = z.infer<typeof auditEventSchema>;
