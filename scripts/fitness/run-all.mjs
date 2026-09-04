#!/usr/bin/env node
/**
 * `pnpm fitness` — the CI `security/static` stage entry point (cicd.md §1).
 *
 * fitness-functions.md: "all functions run in the CI security/static stage via
 * `pnpm fitness`. Any failure fails the build."
 *
 * Every check runs even when an earlier one fails, so one pipeline run reports
 * every architectural regression rather than only the first.
 */

import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');

/** The registered fitness functions. Add a story's function here, never inline. */
const CHECKS = [
  {
    id: 'FF-04',
    title: 'Module dependency graph is a DAG with declared edges only',
    story: 'P1.03',
    command: [process.execPath, [join(HERE, 'ff-04-dependency-graph.mjs')]],
  },
  {
    id: 'FF-04/depcruise',
    title: 'Structural boundary rules (dependency-cruiser)',
    story: 'P1.03',
    command: ['pnpm', ['exec', 'depcruise', '--config', '.dependency-cruiser.cjs', 'apps', 'packages']],
  },
  {
    id: 'FF-19',
    title: 'No secret is committed',
    story: 'P1.07',
    command: [process.execPath, [join(HERE, 'ff-19-no-committed-secret.mjs')]],
  },
  {
    id: 'FF-18',
    title: 'OpenAPI matches the contracts',
    story: 'P1.10',
    command: [process.execPath, [join(HERE, 'ff-18-openapi-matches-contracts.mjs')]],
  },
];

const results = [];

for (const check of CHECKS) {
  const [bin, args] = check.command;
  process.stdout.write(`\n──── ${check.id} — ${check.title} (${check.story})\n`);
  const run = spawnSync(bin, args, { cwd: ROOT, stdio: 'inherit', shell: false });
  const ok = run.status === 0;
  results.push({ ...check, ok, status: run.status });
}

const failed = results.filter((r) => !r.ok);

process.stdout.write('\n════ fitness summary\n');
for (const r of results) {
  process.stdout.write(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.id.padEnd(16)} ${r.title}\n`);
}

if (failed.length > 0) {
  process.stderr.write(
    `\nfitness FAILED — ${failed.length} of ${results.length} check(s) red: ${failed
      .map((f) => f.id)
      .join(', ')}\n`,
  );
  process.exit(1);
}

process.stdout.write(`\nfitness PASSED — ${results.length} check(s) green.\n`);
