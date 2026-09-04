import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as contracts from '../src/index';

/**
 * P1.04 AC-4 — "The package's public export surface is snapshot-tested so a
 * breaking change is visible in review."
 *
 * The snapshot is written inline rather than in a `.snap` file: a reviewer sees
 * the removed symbol in the diff of this file, which is the entire point. An
 * addition is a one-line diff; a removal or rename is a breaking change and
 * must be argued for in review.
 */

/** Runtime (value) exports. Type-only exports are asserted separately below. */
const EXPECTED_RUNTIME_EXPORTS = [
  'API_BASE_PATH',
  'API_VERSION',
  'CORRELATION_ID_HEADER',
  'DOMAIN_EVENT_NAMES',
  'ERROR_CODES',
  'ERROR_CODE_STATUS',
  'IDEMPOTENCY_KEY_HEADER',
  'PAGINATION_DEFAULT_LIMIT',
  'PAGINATION_MAX_LIMIT',
  'PROBLEM_CONTENT_TYPE',
  'correlationIdSchema',
  'cursorPageSchema',
  'cursorPaginationQuerySchema',
  'domainEventEnvelopeSchema',
  'domainEventNameSchema',
  'domainEventSchema',
  'errorCodeSchema',
  'idempotencyKeySchema',
  'isErrorCode',
  'problemDetailsSchema',
  'validationIssueSchema',
];

/** Type-only exports, asserted against the source of the barrel file. */
const EXPECTED_TYPE_EXPORTS = [
  'CursorPage',
  'CursorPaginationQuery',
  'DomainEvent',
  'DomainEventEnvelope',
  'DomainEventName',
  'DomainEventPayloads',
  'ErrorCode',
  'PayloadOf',
  'ProblemDetails',
  'ValidationIssue',
];

describe('public export surface snapshot (AC-4)', () => {
  it('exports exactly the expected runtime symbols', () => {
    expect(Object.keys(contracts).sort()).toEqual(EXPECTED_RUNTIME_EXPORTS);
  });

  it('exports exactly the expected types', () => {
    const barrel = readFileSync(join(__dirname, '..', 'src', 'index.ts'), 'utf8');
    const declared = [...barrel.matchAll(/\btype\s+(\w+),?/g)].map((m) => m[1]).sort();
    expect([...new Set(declared)]).toEqual(EXPECTED_TYPE_EXPORTS);
  });

  it('every runtime export is defined', () => {
    for (const name of EXPECTED_RUNTIME_EXPORTS) {
      expect(
        (contracts as Record<string, unknown>)[name],
        `${name} is exported but undefined`,
      ).toBeDefined();
    }
  });
});

describe('Zod is the single schema authority (AC-1)', () => {
  it('no workspace depends on a parallel validation library', () => {
    const PARALLEL = [
      'joi',
      'yup',
      'ajv',
      'superstruct',
      'io-ts',
      'valibot',
      'class-validator',
      'class-transformer',
      'runtypes',
      'myzod',
      '@sinclair/typebox',
    ];
    const roots = ['packages/contracts', 'packages/config', 'apps/api'];
    for (const root of roots) {
      const pkg = JSON.parse(
        readFileSync(join(process.cwd(), root, 'package.json'), 'utf8'),
      ) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
      const all = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const lib of PARALLEL) {
        expect(
          Object.keys(all),
          `${root} must not introduce "${lib}" alongside Zod (P1.04 AC-1)`,
        ).not.toContain(lib);
      }
    }
  });

  it('contracts depends on zod and on nothing else', () => {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), 'packages/contracts/package.json'), 'utf8'),
    ) as { dependencies?: Record<string, string> };
    expect(Object.keys(pkg.dependencies ?? {})).toEqual(['zod']);
  });
});
