import { z } from 'zod';

/**
 * The health response schema.
 *
 * Declared as a Zod schema like every other contract, so P1.10 can generate the
 * OpenAPI document from it rather than from a hand-written specification
 * (ADR-0004, FF-18).
 */
export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  /** cicd.md §3 — the running commit SHA. */
  commitSha: z.string().min(1),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
