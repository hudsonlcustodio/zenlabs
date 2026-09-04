#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const failures = [];
const root = JSON.parse(readFileSync('package.json', 'utf8'));
const web = JSON.parse(readFileSync('apps/web/package.json', 'utf8'));
const nvmrc = readFileSync('.nvmrc', 'utf8').trim();

const expected = {
  node: '24.20.0',
  packageManager: 'pnpm@11.25.0',
  next: '16.3.4',
  react: '19.2.8',
  reactDom: '19.2.8',
};

if (nvmrc !== expected.node) failures.push(`.nvmrc=${nvmrc}, expected ${expected.node}`);
if (root.packageManager !== expected.packageManager) failures.push(`packageManager=${root.packageManager}`);
if (root.engines?.node !== '>=24.20.0 <25') failures.push(`engines.node=${root.engines?.node}`);
if (root.engines?.pnpm !== '>=11.25.0 <12') failures.push(`engines.pnpm=${root.engines?.pnpm}`);
if (web.dependencies?.next !== expected.next) failures.push(`next=${web.dependencies?.next}`);
if (web.dependencies?.react !== expected.react) failures.push(`react=${web.dependencies?.react}`);
if (web.dependencies?.['react-dom'] !== expected.reactDom) failures.push(`react-dom=${web.dependencies?.['react-dom']}`);

for (const [name, value] of Object.entries({
  nest: JSON.parse(readFileSync('apps/api/package.json','utf8')).dependencies?.['@nestjs/core'],
  typescript: root.devDependencies?.typescript,
  vitest: root.devDependencies?.vitest,
  zod: JSON.parse(readFileSync('packages/contracts/package.json','utf8')).dependencies?.zod,
})) {
  const wanted = { nest:'11.2.3', typescript:'5.9.3', vitest:'3.2.7', zod:'3.25.76' }[name];
  if (value !== wanted) failures.push(`${name}=${value}, expected preserved ${wanted}`);
}

if (failures.length) {
  console.error(`TECH BASELINE CHECK FAIL (${failures.length})`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log('TECH BASELINE CHECK PASS');
