#!/usr/bin/env node
/**
 * Runs the `cicd.md` §1 pipeline locally, in the documented order.
 *
 * "Every stage is blocking. No stage may be skipped on the default branch."
 * A stage failure stops the run, so later stages cannot report success on top
 * of an earlier failure (P1.06 AC-1, EX-P1-06a).
 *
 * Usage:
 *   node scripts/ci/run-pipeline.mjs            # stages 1-5
 *   node scripts/ci/run-pipeline.mjs --json     # machine-readable summary
 */

import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STAGES, CI_ENVIRONMENT } from './stages.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * The blocking rule, isolated from process spawning so it can be tested
 * directly. Stage 3 of the pipeline *is* the test suite, so a test may never
 * invoke the real pipeline — it would recurse.
 *
 * @param stages ordered stage list
 * @param execute (stage) => exit code
 */
export function runPipeline(stages, execute) {
  const results = [];
  let failed = null;

  for (const stage of stages) {
    if (failed) {
      results.push({ order: stage.order, id: stage.id, outcome: 'skipped' });
      continue;
    }
    const status = execute(stage);
    const outcome = status === 0 ? 'passed' : 'failed';
    results.push({ order: stage.order, id: stage.id, outcome, status });
    if (outcome === 'failed') failed = stage;
  }

  return { passed: !failed, failedStage: failed?.id ?? null, stages: results };
}

function main() {
  const asJson = process.argv.includes('--json');

  const summary = runPipeline(STAGES, (stage) => {
    if (!asJson) {
      process.stdout.write(`\n──── stage ${stage.order} ${stage.id} — ${stage.title}\n`);
    }
    const run = spawnSync('pnpm', ['run', stage.script], {
      cwd: ROOT,
      stdio: asJson ? 'pipe' : 'inherit',
      env: { ...process.env, ...CI_ENVIRONMENT },
      shell: false,
    });
    return run.status;
  });

  if (asJson) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  } else {
    process.stdout.write('\n════ pipeline summary (cicd.md §1 stages 1-5)\n');
    for (const r of summary.stages) {
      process.stdout.write(`  ${r.outcome.toUpperCase().padEnd(8)} ${r.order}. ${r.id}\n`);
    }
    process.stdout.write(
      summary.passed ? '\npipeline GREEN.\n' : `\npipeline RED — stage "${summary.failedStage}" failed.\n`,
    );
  }

  process.exit(summary.passed ? 0 : 1);
}

// Only run when invoked directly, so importing this module in a test is inert.
if (process.argv[1] && process.argv[1].endsWith('run-pipeline.mjs')) main();
