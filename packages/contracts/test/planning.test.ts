import { describe, expect, it } from 'vitest';
import { productionBudgetSchema, productionRequestSchema } from '../src/production/planning';

const id = 'a3d1a2c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
const now = '2026-09-04T12:00:00.000Z';

describe('Wave 2 planning contracts', () => {
  it('captures the production request planning inputs', () => {
    expect(productionRequestSchema.parse({ id, tenantId: id, clientId: id, objective: 'Launch', material: 'Script', audience: 'Clients', deadline: now, qualityPreference: 'STANDARD', status: 'DRAFT', createdAt: now })).toMatchObject({ tenantId: id, status: 'DRAFT' });
  });
  it('rejects a budget whose reservation exceeds its hard limit', () => {
    const result = productionBudgetSchema.safeParse({ id, tenantId: id, productionRequestId: id, hardLimitMinor: 100, reservedMinor: 101, currency: 'BRL', status: 'AUTHORIZED' });
    expect(result.success).toBe(false);
  });
});
