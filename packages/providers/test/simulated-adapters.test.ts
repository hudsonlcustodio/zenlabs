import { describe, expect, it } from 'vitest';
import { GuardedProviderExecutor, SimulatedElevenLabsAdapter, SimulatedHeyGenAdapter, SimulatedKlingAdapter, SimulatedRunwayAdapter, SimulatedRunwayImageAdapter, SimulatedSyncLabsAdapter, SimulatedVeoAdapter } from '../src';

const job = { id: 'job-1', tenantId: 'tenant-1', capability: 'VIDEO' as const, routingClass: 'TALKING_STANDARD', idempotencyKey: 'idem-12345678' };
const adapters = [new SimulatedElevenLabsAdapter(), new SimulatedHeyGenAdapter(), new SimulatedRunwayAdapter(), new SimulatedRunwayImageAdapter(), new SimulatedSyncLabsAdapter(), new SimulatedKlingAdapter(), new SimulatedVeoAdapter()];

describe('Wave 3 simulated provider contracts', () => {
  it.each(adapters)('$name submits and reconciles without external I/O', (adapter) => {
    const accepted = adapter.submit({ ...job, capability: adapter.capability });
    expect(accepted.status).toBe('ACCEPTED');
    expect(adapter.reconcile(accepted.providerJobRef)).toMatchObject({ status: 'COMPLETED', actualCostMinor: 100 });
  });
  it('revalidates consent immediately before the provider side effect', () => {
    expect(() => new GuardedProviderExecutor().execute(new SimulatedHeyGenAdapter(), { job, consentValid: false, budgetAvailableMinor: 100, projectedCostMinor: 10 })).toThrow('consent_revoked');
  });
  it('reserves budget before submission and blocks overspend', () => {
    expect(() => new GuardedProviderExecutor().execute(new SimulatedHeyGenAdapter(), { job, consentValid: true, budgetAvailableMinor: 9, projectedCostMinor: 10 })).toThrow('budget_guard_triggered');
  });
  it('deduplicates delayed delivery before the provider side effect', () => {
    const executor = new GuardedProviderExecutor(); const adapter = new SimulatedHeyGenAdapter();
    const first = executor.execute(adapter, { job, consentValid: true, budgetAvailableMinor: 100, projectedCostMinor: 10 });
    const second = executor.execute(adapter, { job, consentValid: true, budgetAvailableMinor: 100, projectedCostMinor: 10 });
    expect(second.providerJobRef).toBe(first.providerJobRef);
  });
});
