#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';

const required = [
  'docs/technical/TECHNICAL_FOUNDATION_V1.md',
  'docs/technical/STACK_DECISION.md',
  'docs/technical/DATABASE_STORAGE_QUEUE.md',
  'docs/technical/AUTH_SECURITY.md',
  'docs/technical/DEPLOYMENT_OBSERVABILITY.md',
  'docs/technical/DEV_TEST_ENVIRONMENT.md',
  'docs/technical/GATE_TECH_FOUNDATION_001.md',
  'docs/technical/technical-baseline-candidate.json',
  'scripts/tech/apply-candidate-baseline.mjs',
  'scripts/tech/check-candidate-baseline.mjs',
  'scripts/tech/run-gate.mjs',
];

const failures = [];
for (const file of required) {
  if (!existsSync(file)) failures.push(`missing ${file}`);
}

const candidate = JSON.parse(readFileSync('docs/technical/technical-baseline-candidate.json','utf8'));
if (candidate.runtime.node !== '24.20.0') failures.push('candidate Node mismatch');
if (candidate.runtime.pnpm !== '11.25.0') failures.push('candidate pnpm mismatch');
if (candidate.frontend.next !== '16.3.4') failures.push('candidate Next mismatch');
if (candidate.frontend.react !== '19.2.8') failures.push('candidate React mismatch');
if (candidate.preserveFirstSlice.nestjs !== '11.2.3') failures.push('Nest preservation mismatch');
if (candidate.data.database !== 'PostgreSQL 17') failures.push('database decision mismatch');

const state = readFileSync('docs/00_GOVERNANCE/PROJECT_STATE.md','utf8');
if (!state.includes('GATE-TECH-FOUNDATION-001')) failures.push('project state is not on tech gate');
if (!state.includes('GATE-UX-FOUNDATION-001 = APROVADO')) failures.push('UX approval not recorded');

if (failures.length) {
  console.error(`TECH DECISION VALIDATION FAIL (${failures.length})`);
  failures.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}
console.log('TECH DECISION VALIDATION PASS — selective-modernization data=postgres17 auth=cognito queue=sqs compute=ecs-fargate');
