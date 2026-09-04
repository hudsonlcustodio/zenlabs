#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

function load(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
function save(path, value) {
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
}

const root = load('package.json');
root.packageManager = 'pnpm@11.25.0';
root.engines = { node: '>=24.20.0 <25', pnpm: '>=11.25.0 <12' };
if (root.devDependencies?.['@types/node']) {
  root.devDependencies['@types/node'] = '24.13.3';
}
save('package.json', root);

const web = load('apps/web/package.json');
web.dependencies.next = '16.3.4';
web.dependencies.react = '19.2.8';
web.dependencies['react-dom'] = '19.2.8';
save('apps/web/package.json', web);

writeFileSync('.nvmrc', '24.20.0\n');

console.log('Candidate baseline applied to manifests.');
console.log('Next: corepack enable && corepack prepare pnpm@11.25.0 --activate');
console.log('Then: pnpm install --no-frozen-lockfile');
console.log('Do not merge until scripts/tech/run-gate.mjs passes on a fresh checkout.');
