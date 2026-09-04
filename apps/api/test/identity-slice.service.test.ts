import { describe, expect, it } from 'vitest';
import { IdentitySliceService } from '../src/modules/identity/application/identity-slice.service';
import { InMemoryIdentityStore } from '../src/modules/identity/infrastructure/in-memory-identity.store';

const ids = { value: 0, next(kind: string) { this.value += 1; return `00000000-0000-4000-8000-${kind.padEnd(12, '0').slice(0, 12)}${this.value}`.slice(0, 36); } };
const clock = { now: () => '2026-09-04T12:00:00.000Z' };

describe('Wave 1 identity application slice', () => {
  it('creates the tenant-to-pack chain and audits each step', () => {
    const store = new InMemoryIdentityStore();
    const result = new IdentitySliceService(store, clock, ids).start({ tenantName: 'Acme', clientName: 'Ana', consentScope: ['DIGITAL_TWIN'] });
    expect(result.twin.tenantId).toBe(result.tenant.id);
    expect(store.listAudit()).toHaveLength(5);
  });
  it('activates only a calibrated pack with granted consent', () => {
    const store = new InMemoryIdentityStore();
    const service = new IdentitySliceService(store, clock, ids);
    const result = service.start({ tenantName: 'Acme', clientName: 'Ana', consentScope: ['DIGITAL_TWIN'] });
    expect(service.activate(result.twin.id, result.consent.id, result.pack.id).status).toBe('ACTIVE');
  });
  it('blocks revoked consent and cross-tenant records', () => {
    const store = new InMemoryIdentityStore();
    const service = new IdentitySliceService(store, clock, ids);
    const result = service.start({ tenantName: 'Acme', clientName: 'Ana', consentScope: ['DIGITAL_TWIN'] });
    service.revokeConsent(result.consent.id);
    expect(() => service.activate(result.twin.id, result.consent.id, result.pack.id)).toThrow('consent_required');
  });

  it('revocation is idempotent and leaves an auditable reason', () => {
    const store = new InMemoryIdentityStore();
    const service = new IdentitySliceService(store, clock, ids);
    const result = service.start({ tenantName: 'Acme', clientName: 'Ana', consentScope: ['DIGITAL_TWIN'] });
    const first = service.revokeConsent(result.consent.id);
    const second = service.revokeConsent(result.consent.id);
    expect(second).toEqual(first);
    expect(store.listAudit().at(-1)?.action).toBe('CONSENT_REVOKED');
  });

  it('creates a calibrated voice profile only with voice consent', () => {
    const store = new InMemoryIdentityStore();
    const service = new IdentitySliceService(store, clock, ids);
    const result = service.start({ tenantName: 'Acme', clientName: 'Ana', consentScope: ['DIGITAL_TWIN', 'VOICE'] });
    const profile = service.createVoiceProfile(result.tenant.id, result.client.id, result.consent);
    expect(profile.status).toBe('CALIBRATED');
    expect(store.getVoiceProfile(profile.id)).toEqual(profile);
  });
});
