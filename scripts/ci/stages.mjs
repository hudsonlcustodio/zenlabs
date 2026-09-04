/**
 * The CI pipeline stages of `cicd.md` §1, in their documented order.
 *
 * This is the single definition. `scripts/ci/run-pipeline.mjs` executes it and
 * `test/ci/pipeline.test.mjs` asserts the GitHub Actions workflow matches it,
 * so the runnable pipeline and the committed workflow cannot drift.
 *
 * P1.06 wires stages 1-5. Stage 6 (`build`) onward — container build, migration
 * validation, deploy, smoke — belong to P17 and are deliberately absent rather
 * than stubbed.
 */

export const STAGES = [
  {
    order: 1,
    id: 'lint',
    title: 'ESLint + import-boundary rules (FF-01..FF-04)',
    script: 'lint',
    failsOn: 'any error',
  },
  {
    order: 2,
    id: 'typecheck',
    title: 'tsc --noEmit across the workspace',
    script: 'typecheck',
    failsOn: 'any error',
  },
  {
    order: 3,
    id: 'unit',
    title: 'domain, state machine, ledger, validators',
    script: 'test',
    failsOn: 'failure or coverage below threshold on domain packages',
  },
  {
    order: 4,
    id: 'integration',
    title: 'ephemeral PostgreSQL + LocalStack; RLS, migrations, queues, idempotency, webhook replay',
    script: 'test:integration',
    failsOn: 'failure',
  },
  {
    order: 5,
    id: 'security-static',
    title: 'dependency audit, secret scan, SAST, fitness functions',
    script: 'fitness',
    failsOn: 'any finding at or above the configured severity',
  },
];

/**
 * cicd.md §2 — "PROVIDER_MODE=mock is forced in CI. No job may hold live
 * HeyGen, ElevenLabs, LLM, Meta or TikTok credentials."
 *
 * This is the FF-08 precondition asserted by P1.06 AC-5.
 */
export const CI_ENVIRONMENT = Object.freeze({
  APP_ENV: 'development',
  PROVIDER_MODE: 'mock',
  CI: 'true',
});

/** Credential-shaped names no CI job may reference (AC-5, cicd.md §2). */
export const FORBIDDEN_CI_SECRET_PATTERNS = [
  /HEYGEN[_A-Z]*(KEY|TOKEN|SECRET)/i,
  /ELEVENLABS[_A-Z]*(KEY|TOKEN|SECRET)/i,
  /OPENAI[_A-Z]*(KEY|TOKEN|SECRET)/i,
  /DEEPSEEK[_A-Z]*(KEY|TOKEN|SECRET)/i,
  /\bMETA[_A-Z]*(KEY|TOKEN|SECRET)/i,
  /TIKTOK[_A-Z]*(KEY|TOKEN|SECRET)/i,
  /AWS_SECRET_ACCESS_KEY/i,
  /AWS_ACCESS_KEY_ID/i,
];
