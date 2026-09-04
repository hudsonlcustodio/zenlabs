import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  API_BASE_PATH,
  API_VERSION,
  CORRELATION_ID_HEADER,
  PROBLEM_CONTENT_TYPE,
  problemDetailsSchema,
  validationIssueSchema,
} from '@zenlabs/contracts';
import { healthResponseSchema } from '../health/health.contract';

extendZodWithOpenApi(z);

/**
 * The OpenAPI route registry (P1.10 AC-1).
 *
 * The published document is **generated** from `apps/api` route metadata and
 * `packages/contracts` Zod schemas — never hand-written. ADR-0004 and ADR-0032
 * make OpenAPI the published contract, and FF-18 fails the build when the
 * committed document and the regenerated one differ.
 *
 * Every epic that adds a route registers it here, so the check grows
 * automatically. It ships against an empty product route set on purpose: a
 * generate-and-diff check added after fifty routes exist produces an unpayable
 * diff, while the same check added at zero routes is free and stays free.
 */

export function buildRegistry(): OpenAPIRegistry {
  const registry = new OpenAPIRegistry();

  /**
   * The problem-details schema, registered **from the canonical schema** in
   * packages/contracts rather than restated here.
   *
   * This is the whole point of P1.10 AC-1: the published document is generated
   * from the contracts package, so changing `problemDetailsSchema` necessarily
   * changes the generated OpenAPI. A second, manually maintained copy would let
   * the two drift while FF-18 stayed green — the exact failure FF-18 exists to
   * prevent. The `code` enum therefore tracks `ERROR_CODES` automatically
   * (AC-4, EX-P1-10).
   */
  registry.register(
    'ValidationIssue',
    validationIssueSchema.openapi({
      description: 'A single field-level failure, located by JSON Pointer.',
    }),
  );

  const problemDetails = registry.register(
    'ProblemDetails',
    problemDetailsSchema.openapi({
      description:
        'RFC 9457 problem details. `code` is the stable machine-readable discriminator (api-contracts.md §1.1).',
    }),
  );

  const health = registry.register(
    'HealthResponse',
    healthResponseSchema.openapi({
      description: 'Liveness of the api process, carrying the running commit SHA (cicd.md §3).',
    }),
  );

  /** api-contracts.md §1 — accepted and echoed; generated when absent. */
  const correlationHeader = z.string().optional().openapi({
    description: 'Correlation id. Echoed on every response; generated when absent.',
  });

  registry.registerPath({
    method: 'get',
    path: `${API_BASE_PATH}/health`,
    summary: 'Process liveness',
    description:
      'Returns the running commit SHA so a deployed artifact is traceable to a commit. Performs no database, queue or provider call.',
    tags: ['platform'],
    request: {
      headers: z.object({ [CORRELATION_ID_HEADER]: correlationHeader }),
    },
    responses: {
      200: {
        description: 'The process is alive.',
        content: { 'application/json': { schema: health } },
      },
      500: {
        description: 'Unmapped internal failure.',
        content: { [PROBLEM_CONTENT_TYPE]: { schema: problemDetails } },
      },
    },
  });

  return registry;
}

export const OPENAPI_INFO = {
  title: 'ZENLABS API',
  version: API_VERSION,
  description:
    'Generated from packages/contracts Zod schemas and apps/api route metadata (ADR-0004, ADR-0032). Do not edit by hand — FF-18 regenerates and diffs this document in CI.',
} as const;
