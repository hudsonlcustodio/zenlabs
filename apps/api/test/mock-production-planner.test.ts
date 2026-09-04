import { describe, expect, it } from 'vitest';
import { MockProductionPlanner } from '../src/planning/mock-production-planner';

const id = 'a3d1a2c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
const now = '2026-09-04T12:00:00.000Z';
const request = { id, tenantId: id, clientId: id, objective: 'Launch', material: 'Script', audience: 'Clients', deadline: now, qualityPreference: 'STANDARD' as const, status: 'DRAFT' as const, createdAt: now };

describe('Wave 2 mock planner', () => {
  it('creates a deterministic plan and reserves cost under the hard limit', () => {
    const result = new MockProductionPlanner().plan(request, { id, tenantId: id, productionRequestId: id, hardLimitMinor: 500, reservedMinor: 0, currency: 'BRL', status: 'AUTHORIZED' });
    expect(result.plan.provenance.planner).toBe('zenlabs.mock-planner');
    expect(result.budget.reservedMinor).toBe(500);
  });
  it('blocks premium planning above the hard limit', () => {
    expect(() => new MockProductionPlanner().plan({ ...request, qualityPreference: 'PREMIUM' }, { id, tenantId: id, productionRequestId: id, hardLimitMinor: 100, reservedMinor: 0, currency: 'BRL', status: 'AUTHORIZED' })).toThrow('budget_guard_triggered');
  });
  it('approves a plan only within the tenant policy and budget', () => {
    const planner = new MockProductionPlanner();
    const budget = { id, tenantId: id, productionRequestId: id, hardLimitMinor: 500, reservedMinor: 0, currency: 'BRL' as const, status: 'AUTHORIZED' as const };
    const result = planner.plan(request, budget);
    expect(planner.approve(request, result.plan, result.budget, { id, tenantId: id, qualityFloor: 'STANDARD', maxDurationSeconds: 30, requiresHumanApproval: true, version: 1 }).status).toBe('APPROVED');
  });
});
