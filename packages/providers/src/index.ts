// @zenlabs/providers
// Provider ports + adapters + capability registry + error taxonomy.
// architecture.md §2.2 — may depend on: contracts.

export type CapabilityKind = 'VOICE' | 'VIDEO' | 'IMAGE';
export interface ProviderCapability { provider: string; capability: CapabilityKind; routingClass: string; qualityTier: 'STANDARD' | 'HIGH' | 'PREMIUM'; eligible: boolean; }
export interface MediaJob { id: string; tenantId: string; capability: CapabilityKind; routingClass: string; idempotencyKey: string; }
export interface ProviderResult { providerJobRef: string; status: 'ACCEPTED' | 'COMPLETED'; }
export interface MediaAdapter { readonly name: string; submit(job: MediaJob): ProviderResult; }
export interface ProviderSubmission { job: MediaJob; consentValid: boolean; budgetAvailableMinor: number; projectedCostMinor: number; }
export interface ProviderJobStatus extends ProviderResult { outputRef?: string; actualCostMinor?: number; }
export interface VoiceProvider extends MediaAdapter { readonly capability: 'VOICE'; reconcile(providerJobRef: string): ProviderJobStatus; }
export interface TalkingAvatarProvider extends MediaAdapter { readonly capability: 'VIDEO'; reconcile(providerJobRef: string): ProviderJobStatus; }
export interface MotionProvider extends MediaAdapter { readonly capability: 'VIDEO'; reconcile(providerJobRef: string): ProviderJobStatus; }
export interface CinematicVideoProvider extends MediaAdapter { readonly capability: 'VIDEO'; reconcile(providerJobRef: string): ProviderJobStatus; }
export interface LipSyncRepairProvider extends MediaAdapter { readonly capability: 'VIDEO'; reconcile(providerJobRef: string): ProviderJobStatus; }
export interface ImageProvider extends MediaAdapter { readonly capability: 'IMAGE'; reconcile(providerJobRef: string): ProviderJobStatus; }

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

abstract class SimulatedAdapter implements MediaAdapter {
  abstract readonly name: string;
  private readonly jobs = new Map<string, ProviderJobStatus>();
  submit(job: MediaJob): ProviderResult {
    const providerJobRef = `${this.name}:${job.id}`;
    this.jobs.set(providerJobRef, { providerJobRef, status: 'ACCEPTED' });
    return { providerJobRef, status: 'ACCEPTED' };
  }
  reconcile(providerJobRef: string): ProviderJobStatus {
    const existing = this.jobs.get(providerJobRef);
    if (!existing) throw new Error('provider_job_not_found');
    const completed = { ...existing, status: 'COMPLETED' as const, outputRef: `canonical-pending://${providerJobRef}`, actualCostMinor: 100 };
    this.jobs.set(providerJobRef, completed);
    return completed;
  }
}

export class SimulatedElevenLabsAdapter extends SimulatedAdapter implements VoiceProvider { readonly name = 'elevenlabs'; readonly capability = 'VOICE' as const; }
export class SimulatedHeyGenAdapter extends SimulatedAdapter implements TalkingAvatarProvider { readonly name = 'heygen'; readonly capability = 'VIDEO' as const; }
export class SimulatedRunwayAdapter extends SimulatedAdapter implements CinematicVideoProvider, MotionProvider { readonly name = 'runway'; readonly capability = 'VIDEO' as const; }
export class SimulatedRunwayImageAdapter extends SimulatedAdapter implements ImageProvider { readonly name = 'runway-image'; readonly capability = 'IMAGE' as const; }
export class SimulatedSyncLabsAdapter extends SimulatedAdapter implements LipSyncRepairProvider { readonly name = 'sync-labs'; readonly capability = 'VIDEO' as const; }
export class SimulatedKlingAdapter extends SimulatedAdapter implements TalkingAvatarProvider, LipSyncRepairProvider, CinematicVideoProvider, MotionProvider { readonly name = 'kling'; readonly capability = 'VIDEO' as const; }
export class SimulatedVeoAdapter extends SimulatedAdapter implements CinematicVideoProvider { readonly name = 'veo'; readonly capability = 'VIDEO' as const; }

export class GuardedProviderExecutor {
  constructor(private readonly queue = new IdempotentMediaQueue()) {}
  execute(adapter: MediaAdapter, submission: ProviderSubmission): ProviderResult {
    if (!submission.consentValid) throw new Error('consent_revoked');
    if (submission.projectedCostMinor > submission.budgetAvailableMinor) throw new Error('budget_guard_triggered');
    return this.queue.enqueue(submission.job, () => adapter.submit(submission.job));
  }
}
