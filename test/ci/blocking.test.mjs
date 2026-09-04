/**
 * P1.06 AC-1 / EX-P1-06a — "GIVEN a failing lint rule, WHEN the pipeline runs,
 * THEN later stages do not report success."
 *
 * The blocking rule is tested directly with an injected executor. The pipeline's
 * own stage 3 is `pnpm test`, so a test can never invoke the real pipeline
 * without recursing into itself.
 *
 * The end-to-end evidence (a real seeded `any` turning stage 1 red and skipping
 * stages 2-5) is produced by `pnpm pipeline --json`, and in CI by the `needs`
 * graph asserted in pipeline.test.mjs.
 */
import { describe, it, expect } from 'vitest';
import { runPipeline } from '../../scripts/ci/run-pipeline.mjs';
import { STAGES } from '../../scripts/ci/stages.mjs';

const allGreen = () => 0;

describe('every stage is blocking (cicd.md §1)', () => {
  it('reports green when every stage passes', () => {
    const summary = runPipeline(STAGES, allGreen);
    expect(summary.passed).toBe(true);
    expect(summary.failedStage).toBeNull();
    expect(summary.stages.map((s) => s.outcome)).toEqual(Array(STAGES.length).fill('passed'));
  });

  it('EX-P1-06a: a failing lint stage leaves every later stage unrun, never passed', () => {
    const summary = runPipeline(STAGES, (stage) => (stage.id === 'lint' ? 1 : 0));

    expect(summary.passed).toBe(false);
    expect(summary.failedStage).toBe('lint');

    const outcomes = Object.fromEntries(summary.stages.map((s) => [s.id, s.outcome]));
    expect(outcomes.lint).toBe('failed');
    for (const later of ['typecheck', 'unit', 'integration', 'security-static']) {
      expect(outcomes[later], `${later} must not report success`).toBe('skipped');
    }
    expect(summary.stages.some((s) => s.outcome === 'passed')).toBe(false);
  });

  it('never executes a stage after a failure', () => {
    const executed = [];
    runPipeline(STAGES, (stage) => {
      executed.push(stage.id);
      return stage.id === 'unit' ? 1 : 0;
    });
    expect(executed).toEqual(['lint', 'typecheck', 'unit']);
  });

  it.each(STAGES.map((s) => s.id))('a failure in %s turns the whole pipeline red', (stageId) => {
    const summary = runPipeline(STAGES, (stage) => (stage.id === stageId ? 1 : 0));
    expect(summary.passed).toBe(false);
    expect(summary.failedStage).toBe(stageId);
  });

  it('runs the stages in the documented cicd.md §1 order', () => {
    const executed = [];
    runPipeline(STAGES, (stage) => {
      executed.push(stage.id);
      return 0;
    });
    expect(executed).toEqual(['lint', 'typecheck', 'unit', 'integration', 'security-static']);
  });
});
