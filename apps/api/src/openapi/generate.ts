import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { stringify } from 'yaml';
import { buildRegistry, OPENAPI_INFO } from './registry';

/**
 * Generates `docs/api/openapi.yaml` (P1.10 AC-1).
 *
 * Determinism is the whole point: FF-18 regenerates this document in CI and
 * diffs it against the committed copy, so generation must be byte-identical
 * from a clean checkout. Nothing here may depend on the clock, the environment,
 * a random value or key insertion order.
 */

export const OPENAPI_PATH = join('docs', 'api', 'openapi.yaml');

const BANNER = `# GENERATED FILE — DO NOT EDIT.
#
# Produced by \`pnpm openapi:generate\` from packages/contracts Zod schemas and
# apps/api route metadata (ADR-0004, ADR-0032). FF-18 regenerates this document
# in CI and fails the build when it differs from the committed copy.
`;

/** Recursively sort object keys so output order never depends on insertion order. */
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

export function generateDocument(): Record<string, unknown> {
  const generator = new OpenApiGeneratorV31(buildRegistry().definitions);
  const document = generator.generateDocument({
    openapi: '3.1.0',
    info: OPENAPI_INFO,
    servers: [{ url: 'https://api.zenlabs.example', description: 'Placeholder — set per environment.' }],
  });
  return sortKeys(document) as Record<string, unknown>;
}

export function renderYaml(): string {
  return (
    BANNER +
    stringify(generateDocument(), {
      // Fixed formatting so the diff is about content, never layout.
      indent: 2,
      lineWidth: 100,
      sortMapEntries: true,
    })
  );
}

export function writeDocument(root: string = process.cwd()): string {
  const yaml = renderYaml();
  writeFileSync(join(root, OPENAPI_PATH), yaml);
  return yaml;
}

if (require.main === module) {
  writeDocument();
  process.stdout.write(`wrote ${OPENAPI_PATH}\n`);
}
