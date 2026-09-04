import { z } from 'zod';

/**
 * The stable API error codes of `api-contracts.md` §1.1.
 *
 * This is their single declaration site in the repository (P1.04 AC-2). Nothing
 * outside this package may define, re-declare or string-literal an error code:
 * `ERROR_CODES` is the only source, and `test/contracts/error-codes.test.ts`
 * asserts the set matches the architecture document.
 *
 * Adding a code here automatically widens the generated OpenAPI problem-details
 * enum (FF-18, P1.10). That coupling is deliberate.
 */
export const ERROR_CODES = [
  'unauthenticated',
  'forbidden',
  'not_found',
  'validation_failed',
  'conflict',
  'idempotency_key_reuse',
  'entitlement_exhausted',
  'consent_revoked',
  'capability_unsupported',
  'provider_unavailable',
  'rate_limited',
  'connection_invalid',
  'state_transition_not_allowed',
  /**
   * Internal or otherwise unmapped server failure (ACR-001).
   *
   * The only code the exception filter may use for an exception it does not
   * recognise. It never carries an exception-derived `detail`: no stack trace,
   * exception class, internal message, SQL or path. See `api-contracts.md` §1.1.
   */
  'internal_error',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const errorCodeSchema = z.enum(ERROR_CODES);

/**
 * The HTTP status each stable code renders as.
 *
 * Kept beside the codes so a handler never picks a status by hand and two
 * routes can never disagree about what `not_found` means.
 */
export const ERROR_CODE_STATUS: Readonly<Record<ErrorCode, number>> = Object.freeze({
  unauthenticated: 401,
  forbidden: 403,
  not_found: 404,
  validation_failed: 422,
  conflict: 409,
  idempotency_key_reuse: 409,
  entitlement_exhausted: 402,
  consent_revoked: 403,
  capability_unsupported: 501,
  provider_unavailable: 503,
  rate_limited: 429,
  connection_invalid: 409,
  state_transition_not_allowed: 409,
  internal_error: 500,
});

export const isErrorCode = (value: unknown): value is ErrorCode =>
  typeof value === 'string' && (ERROR_CODES as readonly string[]).includes(value);
