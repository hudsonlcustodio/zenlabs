#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const commands = [
  ['node', ['scripts/tech/check-candidate-baseline.mjs']],
  ['pnpm', ['install', '--frozen-lockfile']],
  ['pnpm', ['lint']],
  ['pnpm', ['typecheck']],
  ['pnpm', ['test']],
  ['pnpm', ['build']],
  ['pnpm', ['fitness']],
  ['pnpm', ['audit', '--audit-level', 'high']],
];

for (const [command, args] of commands) {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    console.error(`GATE-TECH-FOUNDATION-001 FAIL at: ${command} ${args.join(' ')}`);
    process.exit(result.status ?? 1);
  }
}

console.log('\nGATE-TECH-FOUNDATION-001 AUTOMATED CHECKS PASS');
console.log('Still required: runtime smoke, gitleaks/history scan, review of audit findings and deployment evidence.');
