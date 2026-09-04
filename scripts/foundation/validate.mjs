#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = process.cwd();
const failures = [];
const notes = [];

const required = [
  'README.md',
  'START_HERE_WORK_DESKTOP.md',
  'AGENTS.md',
  'docs/00_GOVERNANCE/PROJECT_STATE.md',
  'docs/00_GOVERNANCE/DECISIONS.md',
  'docs/00_GOVERNANCE/MIGRATION_REPORT.md',
  'docs/product/PRD_ZENLABS_V2.md',
  'docs/product/ROLES_AUTHORITY_RACI.md',
  'docs/production/PRODUCTION_INTELLIGENCE.md',
  'docs/production/EXCEPTION_DRIVEN_PRODUCTION.md',
  'docs/architecture/architecture.md',
  'docs/architecture/domain-model.md',
  'docs/architecture/workflows-state-machines.md',
  'docs/backlog/EPICS.md',
  'docs/backlog/SPECS.md',
  'docs/backlog/STORIES.md',
  'docs/backlog/WAVES.md',
  'design-systems/zenlabs/DESIGN.md',
  'docs/_legacy/vyra-p1/README_VYRA_BASELINE.md',
];

for (const path of required) {
  if (!existsSync(join(ROOT, path))) failures.push(`missing required file: ${path}`);
}

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
if (pkg.name !== 'zenlabs') failures.push(`root package name must be "zenlabs", got "${pkg.name}"`);

for (const area of ['apps', 'packages']) {
  const base = join(ROOT, area);
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const packagePath = join(base, entry.name, 'package.json');
    if (!existsSync(packagePath)) continue;
    const data = JSON.parse(readFileSync(packagePath, 'utf8'));
    if (!String(data.name ?? '').startsWith('@zenlabs/')) {
      failures.push(`${relative(ROOT, packagePath)} package name must use @zenlabs/*`);
    }
    if (!data.zenlabs || !Array.isArray(data.zenlabs.allowedDependencies)) {
      failures.push(`${relative(ROOT, packagePath)} missing zenlabs.allowedDependencies manifest`);
    }
  }
}

function walk(dir) {
  const result = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) result.push(...walk(p));
    else result.push(p);
  }
  return result;
}

const technicalRoots = [
  'apps', 'packages', 'scripts', 'test', '.github'
].map((x) => join(ROOT, x)).filter(existsSync);

for (const dir of technicalRoots) {
  for (const file of walk(dir)) {
    if (relative(ROOT, file).replaceAll('\\', '/') === 'scripts/foundation/validate.mjs') continue;
    if (!['.ts','.tsx','.js','.mjs','.cjs','.json','.yaml','.yml','.md'].includes(extname(file))) continue;
    const text = readFileSync(file, 'utf8');
    if (text.includes('@vyra/') || /\bVYRA\b/.test(text) || /\bvyra\b/.test(text)) {
      failures.push(`legacy brand/namespace found in active technical file: ${relative(ROOT, file)}`);
    }
  }
}

const schemaDir = join(ROOT, 'docs/contracts/schemas');
let schemaCount = 0;
for (const file of readdirSync(schemaDir)) {
  if (!file.endsWith('.json')) continue;
  JSON.parse(readFileSync(join(schemaDir, file), 'utf8'));
  schemaCount += 1;
}
if (schemaCount < 10) failures.push(`expected >=10 machine-readable schemas, found ${schemaCount}`);

const decisions = readFileSync(join(ROOT, 'docs/00_GOVERNANCE/DECISIONS.md'), 'utf8');
for (const requiredDecision of [
  'Exception-Driven Production',
  'Production Pods',
  'Client Usage Ledger',
  'Provider Cost Ledger',
  'ZENLABS | Laboratório de Clones',
]) {
  if (!decisions.includes(requiredDecision)) failures.push(`decision text missing: ${requiredDecision}`);
}

const architecture = readFileSync(join(ROOT, 'docs/architecture/architecture.md'), 'utf8');
for (const term of [
  'Production Intelligence',
  'ProviderCapabilityRegistry',
  'MediaRouter',
  'Production Plane',
]) {
  if (!architecture.includes(term)) failures.push(`architecture missing V2 concept: ${term}`);
}

const queueDoc = readFileSync(join(ROOT, 'docs/architecture/aws-topology.md'), 'utf8');
const canonicalQueues = [...queueDoc.matchAll(/^\|\s*`([a-z-]+)`\s*\|\s*([^|]+?)\s*\|/gm)]
  .map((m) => ({ queue: m[1], consumers: m[2].split('/').map((v) => v.trim()) }));

for (const worker of ['worker-ai','worker-media','worker-social']) {
  const source = readFileSync(join(ROOT, 'apps', worker, 'src', 'manifest.ts'), 'utf8');
  const block = source.match(/queues:\s*\[([\s\S]*?)\]/)?.[1] ?? '';
  const queues = [...block.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]);
  for (const queue of queues) {
    const def = canonicalQueues.find((x) => x.queue === queue);
    if (!def) failures.push(`${worker} references unknown queue ${queue}`);
    else if (!def.consumers.includes(worker)) failures.push(`${queue} does not list ${worker} as consumer`);
  }
}

const stories = readFileSync(join(ROOT, 'docs/backlog/STORIES.md'), 'utf8');
const storyCount = (stories.match(/^### STORY-Z\d+/gm) ?? []).length;
if (storyCount < 100) failures.push(`expected >=100 V2 stories, found ${storyCount}`);

const epics = readFileSync(join(ROOT, 'docs/backlog/EPICS.md'), 'utf8');
const epicCount = (epics.match(/^## EPIC-Z\d+/gm) ?? []).length;
if (epicCount < 20) failures.push(`expected >=20 V2 epics, found ${epicCount}`);

notes.push(`schemas=${schemaCount}`);
notes.push(`epics=${epicCount}`);
notes.push(`stories=${storyCount}`);
notes.push(`queues=${canonicalQueues.length}`);

if (failures.length) {
  console.error(`ZENLABS FOUNDATION VALIDATION FAIL (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`ZENLABS FOUNDATION VALIDATION PASS — ${notes.join(' ')}`);
