import type { AuditEvent, Client, Consent, DigitalTwin, IdentityPack, Tenant } from '@zenlabs/contracts';
import { assertCanActivate, assertConsentAllowsIdentity } from '../domain/identity-policy';

export interface IdentityStore {
  save(record: Tenant | Client | Consent | DigitalTwin | IdentityPack): void;
  getTenant(id: string): Tenant | undefined;
  getClient(id: string): Client | undefined;
  getConsent(id: string): Consent | undefined;
  getTwin(id: string): DigitalTwin | undefined;
  getPack(id: string): IdentityPack | undefined;
  appendAudit(event: AuditEvent): void;
  listAudit(): AuditEvent[];
}

export interface IdentitySliceClock { now(): string; }
export interface IdentitySliceIds { next(kind: string): string; }

export interface StartIdentitySliceInput {
  tenantName: string;
  clientName: string;
  consentScope: Consent['scope'];
}

export interface IdentitySliceResult {
  tenant: Tenant;
  client: Client;
  consent: Consent;
  twin: DigitalTwin;
  pack: IdentityPack;
}

export class IdentitySliceService {
  constructor(private readonly store: IdentityStore, private readonly clock: IdentitySliceClock, private readonly ids: IdentitySliceIds) {}

  start(input: StartIdentitySliceInput): IdentitySliceResult {
    const createdAt = this.clock.now();
    const tenant: Tenant = { id: this.ids.next('tenant'), name: input.tenantName, createdAt };
    const client: Client = { id: this.ids.next('client'), tenantId: tenant.id, name: input.clientName, status: 'ACTIVE', createdAt };
    const consent: Consent = { id: this.ids.next('consent'), tenantId: tenant.id, clientId: client.id, scope: input.consentScope, status: 'GRANTED', evidenceRef: 'wave1-initial-consent', grantedAt: createdAt, revokedAt: null };
    assertConsentAllowsIdentity(consent);
    const twin: DigitalTwin = { id: this.ids.next('twin'), tenantId: tenant.id, clientId: client.id, consentId: consent.id, status: 'DRAFT', activeIdentityPackVersion: null, createdAt, updatedAt: createdAt };
    const pack: IdentityPack = { id: this.ids.next('pack'), tenantId: tenant.id, digitalTwinId: twin.id, version: 1, status: 'CALIBRATED', assetRefs: ['wave1:synthetic-placeholder'], createdAt };
    [tenant, client, consent, twin, pack].forEach((record) => this.store.save(record));
    [
      ['TENANT_CREATED', tenant.id], ['CLIENT_CREATED', client.id], ['CONSENT_GRANTED', consent.id],
      ['DIGITAL_TWIN_CREATED', twin.id], ['IDENTITY_PACK_CALIBRATED', pack.id],
    ].forEach(([action, entityId]) => this.audit(action!, entityId!, tenant.id, createdAt));
    return { tenant, client, consent, twin, pack };
  }

  activate(twinId: string, consentId: string, packId: string): DigitalTwin {
    const twin = this.store.getTwin(twinId);
    const consent = this.store.getConsent(consentId);
    const pack = this.store.getPack(packId);
    if (!twin || !consent || !pack) throw new Error('identity_records_not_found');
    assertCanActivate(twin, consent, pack);
    const active: DigitalTwin = { ...twin, status: 'ACTIVE', activeIdentityPackVersion: pack.version, updatedAt: this.clock.now() };
    this.store.save(active);
    this.audit('DIGITAL_TWIN_ACTIVATED', active.id, active.tenantId, active.updatedAt);
    return active;
  }

  private audit(action: string, entityId: string, tenantId: string, occurredAt: string): void {
    const entityType = action.startsWith('TENANT') ? 'TENANT' : action.startsWith('CLIENT') ? 'CLIENT' : action.startsWith('CONSENT') ? 'CONSENT' : action.startsWith('IDENTITY') ? 'IDENTITY_PACK' : 'DIGITAL_TWIN';
    this.store.appendAudit({ eventId: this.ids.next('audit'), tenantId, actorType: 'SYSTEM', action, entityType, entityId, occurredAt, metadata: {} });
  }
}
