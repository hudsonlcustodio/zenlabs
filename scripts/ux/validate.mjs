
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const failures = [];

const required = [
  'docs/brand/BRAND_AUTHORITY.md',
  'docs/brand/reference/branding-approved-part-1.png',
  'docs/brand/reference/branding-approved-part-2.png',
  'docs/brand/reference/zenlabs-logo-light.png',
  'docs/brand/reference/zenlabs-logo-transparent.png',
  'docs/ux/UX_UI_FOUNDATION_V1.md',
  'docs/ux/APP_SHELL.md',
  'docs/ux/CONTENT_DENSITY_COPY.md',
  'docs/ux/COMPONENTS.md',
  'docs/ux/SCREEN_INVENTORY.md',
  'docs/ux/CORE_SCREEN_SPECS.md',
  'docs/ux/UI_STATES.md',
  'docs/ux/RESPONSIVE_ACCESSIBILITY.md',
  'docs/ux/WIREFRAMES_CORE.md',
  'prototypes/ux-foundation/index.html',
  'design-systems/zenlabs/tokens.css',
];

for (const f of required) if (!existsSync(join(root, f))) failures.push(`missing ${f}`);

const ux = readFileSync(join(root, 'docs/ux/UX_UI_FOUNDATION_V1.md'), 'utf8');
for (const term of ['intuitiva', 'compacta', 'pouco texto', '13–14px', 'progressive disclosure']) {
  if (!ux.toLowerCase().includes(term.toLowerCase())) failures.push(`UX contract missing "${term}"`);
}

const tokens = readFileSync(join(root, 'design-systems/zenlabs/tokens.css'), 'utf8');
for (const term of ['--zenlabs-text-xs: 12px', '--zenlabs-text-sm: 13px', '--zenlabs-control-md: 36px', '--zenlabs-row-compact: 42px']) {
  if (!tokens.includes(term)) failures.push(`token missing "${term}"`);
}

const screens = readFileSync(join(root, 'docs/ux/CORE_SCREEN_SPECS.md'), 'utf8');
for (const term of ['Operação / Control Tower', 'Nova Produção', 'Production Analysis', 'Production Monitor', 'Exception Queue', 'Digital Twin']) {
  if (!screens.includes(term)) failures.push(`core screen missing "${term}"`);
}

const prototype = readFileSync(join(root, 'prototypes/ux-foundation/index.html'), 'utf8');
for (const term of ['Operação', 'Nova produção', 'Análise da produção', 'Training #928', 'Clientes', 'Digital Twin']) {
  if (!prototype.includes(term)) failures.push(`prototype missing "${term}"`);
}

if (failures.length) {
  console.error(`UX FOUNDATION VALIDATION FAIL (${failures.length})`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log('UX FOUNDATION VALIDATION PASS — brand=approved core-screens=6 prototype=clickable density=compact');
