import type { CostEstimate, ProductionBudget, ProductionPlan, ProductionPolicy, ProductionRequest } from '@zenlabs/contracts';
import { costEstimateSchema, productionPlanSchema } from '@zenlabs/contracts';

export interface MockPlanResult { plan: ProductionPlan; budget: ProductionBudget; estimate: CostEstimate; }

export class MockProductionPlanner {
  plan(request: ProductionRequest, budget: ProductionBudget): MockPlanResult {
    if (request.tenantId !== budget.tenantId || request.id !== budget.productionRequestId) throw new Error('tenant_scope_violation');
    const estimatedMinor = request.qualityPreference === 'PREMIUM' ? 900 : 500;
    if (estimatedMinor > budget.hardLimitMinor) throw new Error('budget_guard_triggered');
    const shotId = 'a3d1a2c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
    const plan = productionPlanSchema.parse({
      id: 'b4e2b3d5-6f70-4b8c-9d0e-1f2a3b4c5d6e', tenantId: request.tenantId, productionRequestId: request.id,
      productionPackId: 'mock-starter', productionPackVersion: 1, estimatedDurationSeconds: 10,
      chapters: [{ id: 'c5f3c4e6-7081-4c9d-0e1f-2a3b4c5d6e7f', order: 0, title: request.objective, scenes: [{ id: 'd6a4d5f7-8192-4dae-1f20-3b4c5d6e7f80', order: 0, shots: [{ id: shotId, tenantId: request.tenantId, productionId: request.id, sceneId: 'd6a4d5f7-8192-4dae-1f20-3b4c5d6e7f80', order: 0, type: 'PRESENTER', targetDurationSeconds: 10, routingClass: 'mock.presenter', qualityTier: request.qualityPreference === 'PREMIUM' ? 'PREMIUM' : 'STANDARD', status: 'READY' }] }] }],
      provenance: { planner: 'zenlabs.mock-planner', model: 'deterministic', templateVersion: 'wave2.v1', sourceRefs: [request.id] },
    });
    return { plan, budget: { ...budget, reservedMinor: estimatedMinor, status: 'AUTHORIZED' }, estimate: costEstimateSchema.parse({ id: 'e7b5e6f8-92a3-4ebf-2031-4c5d6e7f8091', tenantId: request.tenantId, productionRequestId: request.id, planId: plan.id, amountMinor: estimatedMinor, currency: budget.currency, rateCardVersion: 'mock.v1', status: 'AUTHORIZED' }) };
  }

  approve(request: ProductionRequest, plan: ProductionPlan, budget: ProductionBudget, policy: ProductionPolicy): ProductionRequest {
    if (request.tenantId !== plan.tenantId || request.tenantId !== budget.tenantId || policy.tenantId !== request.tenantId) throw new Error('tenant_scope_violation');
    if (plan.estimatedDurationSeconds && plan.estimatedDurationSeconds > policy.maxDurationSeconds) throw new Error('policy_blocked');
    if (budget.reservedMinor > budget.hardLimitMinor) throw new Error('budget_guard_triggered');
    return { ...request, status: 'APPROVED' };
  }
}
