import { z } from 'zod';

/**
 * Canonical header names from `api-contracts.md` §1.
 *
 * Declared here so no app spells a header differently. `apps/api` binds its
 * correlation middleware (P1.08 AC-3, EX-P1-05) to these constants.
 */
export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const IDEMPOTENCY_KEY_HEADER = 'idempotency-key';

/** API base path — `api-contracts.md` §1 "Base | /api/v1". */
export const API_BASE_PATH = '/api/v1';

/** Additive changes only within v1. */
export const API_VERSION = 'v1';

/**
 * A correlation id is accepted from the client and echoed, or generated when
 * absent. It is opaque and bounded so it can never become a log-injection or
 * unbounded-header vector.
 */
export const correlationIdSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9_.:-]+$/, 'correlation id must be url-safe');

/**
 * `Idempotency-Key` is required on POSTs that create billable or external
 * effects (`api-contracts.md` §1, architecture.md §7).
 */
export const idempotencyKeySchema = z.string().min(8).max(255);
