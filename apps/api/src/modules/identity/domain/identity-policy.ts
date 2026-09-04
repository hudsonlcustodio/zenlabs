import type { Consent, DigitalTwin, IdentityPack } from '@zenlabs/contracts';

export function assertConsentAllowsIdentity(consent: Consent): void {
  if (consent.status !== 'GRANTED' || !consent.scope.includes('DIGITAL_TWIN')) {
    throw new Error('consent_required');
  }
}

export function assertCanActivate(
  twin: DigitalTwin,
  consent: Consent,
  pack: IdentityPack,
): void {
  if (twin.tenantId !== consent.tenantId || twin.clientId !== consent.clientId || twin.consentId !== consent.id || pack.digitalTwinId !== twin.id || pack.tenantId !== twin.tenantId) {
    throw new Error('tenant_scope_violation');
  }
  assertConsentAllowsIdentity(consent);
  if (pack.status !== 'CALIBRATED') {
    throw new Error('identity_pack_not_calibrated');
  }
}
