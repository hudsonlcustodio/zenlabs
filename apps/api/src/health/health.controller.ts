import { Controller, Get, Inject } from '@nestjs/common';
import { API_BASE_PATH } from '@zenlabs/contracts';
import { healthResponseSchema, type HealthResponse } from './health.contract';
import { COMMIT_SHA } from './health.tokens';

/**
 * The only route `apps/api` ships in wave 1 (P1.08 AC-4).
 *
 * `cicd.md` §3: "The running SHA is exposed on a health endpoint so a deployed
 * artifact is always traceable to a commit."
 *
 * It performs no database, queue or provider call — there is nothing to call
 * yet, and a health route that depends on downstream systems reports the
 * downstream, not the process.
 */
@Controller(`${API_BASE_PATH}/health`)
export class HealthController {
  constructor(@Inject(COMMIT_SHA) private readonly commitSha: string) {}

  @Get()
  read(): HealthResponse {
    return healthResponseSchema.parse({
      status: 'ok',
      commitSha: this.commitSha,
    });
  }
}
