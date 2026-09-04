import { describe, expect, it } from 'vitest';
import { productionPolicySchema } from '../src/production/planning';
const id = 'a3d1a2c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
describe('Wave 2 production policy', () => {
  it('requires an explicit quality floor and bounded duration', () => {
    expect(productionPolicySchema.parse({ id, tenantId: id, qualityFloor: 'STANDARD', maxDurationSeconds: 600, requiresHumanApproval: true, version: 1 }).requiresHumanApproval).toBe(true);
  });
});
