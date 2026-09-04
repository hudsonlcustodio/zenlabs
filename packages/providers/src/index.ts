// @zenlabs/providers
// Provider ports + adapters + capability registry + error taxonomy.
// architecture.md §2.2 — may depend on: contracts.

export type CapabilityKind = 'VOICE' | 'VIDEO' | 'IMAGE';
export interface ProviderCapability { provider: string; capability: CapabilityKind; routingClass: string; qualityTier: 'STANDARD' | 'HIGH' | 'PREMIUM'; eligible: boolean; }
export interface MediaJob { id: string; tenantId: string; capability: CapabilityKind; routingClass: string; idempotencyKey: string; }
export interface ProviderResult { providerJobRef: string; status: 'ACCEPTED' | 'COMPLETED'; }
export interface MediaAdapter { readonly name: string; submit(job: MediaJob): ProviderResult; }

export class ProviderCapabilityRegistry {
  constructor(private readonly capabilities: ProviderCapability[]) {}
  resolve(capability: CapabilityKind, routingClass: string, qualityTier: ProviderCapability['qualityTier']): ProviderCapability {
    const found = this.capabilities.find((item) => item.eligible && item.capability === capability && item.routingClass === routingClass && item.qualityTier === qualityTier);
    if (!found) throw new Error('capability_unsupported');
    return found;
  }
}

export class MediaRouter {
  constructor(private readonly registry: ProviderCapabilityRegistry, private readonly adapters: Map<string, MediaAdapter>) {}
  submit(job: MediaJob, qualityTier: ProviderCapability['qualityTier']): ProviderResult {
    const capability = this.registry.resolve(job.capability, job.routingClass, qualityTier);
    const adapter = this.adapters.get(capability.provider);
    if (!adapter) throw new Error('provider_unavailable');
    return adapter.submit(job);
  }
}

export class IdempotentMediaQueue {
  private readonly seen = new Map<string, ProviderResult>();
  enqueue(job: MediaJob, execute: () => ProviderResult): ProviderResult {
    const prior = this.seen.get(`${job.tenantId}:${job.idempotencyKey}`);
    if (prior) return prior;
    const result = execute();
    this.seen.set(`${job.tenantId}:${job.idempotencyKey}`, result);
    return result;
  }
}

export class MockMediaAdapter implements MediaAdapter {
  readonly name = 'mock-media';
  submit(job: MediaJob): ProviderResult { return { providerJobRef: `mock:${job.id}`, status: 'COMPLETED' }; }
}
