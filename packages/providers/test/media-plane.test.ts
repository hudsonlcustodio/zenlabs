import { describe, expect, it } from 'vitest';
import { IdempotentMediaQueue, MediaRouter, MockMediaAdapter, ProviderCapabilityRegistry } from '../src';

const job = { id: 'job-1', tenantId: 'tenant-1', capability: 'VIDEO' as const, routingClass: 'mock.presenter', idempotencyKey: 'idem-12345678' };
describe('Wave 3 media plane', () => {
  it('routes only eligible capabilities to a mock adapter', () => {
    const router = new MediaRouter(new ProviderCapabilityRegistry([{ provider: 'mock-media', capability: 'VIDEO', routingClass: 'mock.presenter', qualityTier: 'STANDARD', eligible: true }]), new Map([['mock-media', new MockMediaAdapter()]]));
    expect(router.submit(job, 'STANDARD').status).toBe('COMPLETED');
  });
  it('deduplicates at-least-once delivery by tenant and idempotency key', () => {
    const queue = new IdempotentMediaQueue(); let calls = 0;
    const execute = () => { calls += 1; return { providerJobRef: 'mock:job-1', status: 'ACCEPTED' as const }; };
    queue.enqueue(job, execute); queue.enqueue(job, execute);
    expect(calls).toBe(1);
  });
  it('rejects unsupported capability routing', () => {
    expect(() => new ProviderCapabilityRegistry([]).resolve('VOICE', 'missing', 'STANDARD')).toThrow('capability_unsupported');
  });
});
