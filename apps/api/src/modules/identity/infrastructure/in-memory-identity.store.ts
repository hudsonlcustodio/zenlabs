import type { AuditEvent, Client, Consent, DigitalTwin, IdentityPack, Tenant, VoiceProfile } from '@zenlabs/contracts';
import type { IdentityStore } from '../application/identity-slice.service';

export class InMemoryIdentityStore implements IdentityStore {
  private readonly tenants = new Map<string, Tenant>();
  private readonly clients = new Map<string, Client>();
  private readonly consents = new Map<string, Consent>();
  private readonly twins = new Map<string, DigitalTwin>();
  private readonly packs = new Map<string, IdentityPack>();
  private readonly audits: AuditEvent[] = [];
  private readonly voiceProfiles = new Map<string, VoiceProfile>();

  save(record: Tenant | Client | Consent | DigitalTwin | IdentityPack): void {
    if ('activeIdentityPackVersion' in record || ('consentId' in record && 'updatedAt' in record)) this.twins.set(record.id, record as DigitalTwin);
    else if ('digitalTwinId' in record) this.packs.set(record.id, record as IdentityPack);
    else if ('scope' in record) this.consents.set(record.id, record as Consent);
    else if ('tenantId' in record) this.clients.set(record.id, record as Client);
    else this.tenants.set(record.id, record as Tenant);
  }
  getTenant(id: string): Tenant | undefined { return this.tenants.get(id); }
  getClient(id: string): Client | undefined { return this.clients.get(id); }
  getConsent(id: string): Consent | undefined { return this.consents.get(id); }
  getTwin(id: string): DigitalTwin | undefined { return this.twins.get(id); }
  getPack(id: string): IdentityPack | undefined { return this.packs.get(id); }
  saveVoiceProfile(profile: VoiceProfile): void { this.voiceProfiles.set(profile.id, profile); }
  getVoiceProfile(id: string): VoiceProfile | undefined { return this.voiceProfiles.get(id); }
  appendAudit(event: AuditEvent): void { this.audits.push(event); }
  listAudit(): AuditEvent[] { return [...this.audits]; }
}
