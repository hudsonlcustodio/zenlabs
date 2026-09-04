/**
 * Review findings 1 and 2 — one validation authority, and one *schema* authority.
 *
 * P1.04 AC-1 makes Zod the single schema authority; P1.08 AC-3 binds the request
 * pipeline to `packages/contracts` schemas. Those only hold together if:
 *
 *   a. a contracted input cannot be bound without naming a schema, and
 *   b. that schema comes from `packages/contracts` rather than being invented
 *      inside the route that consumes it.
 *
 * (b) is the sharper rule. Forbidding a bare `@Body()` stops an unvalidated
 * input, but a product module could still write `const localSchema = z.object(…)`
 * and bind it — re-creating the contract fork that `packages/contracts` exists to
 * prevent, and silently detaching the route from the published OpenAPI (FF-18).
 *
 * These are static checks so a regression fails a gate rather than review.
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, afterEach } from 'vitest';

const ROOT = process.cwd();
const API_SRC = join(ROOT, 'apps', 'api', 'src');

/**
 * Strictly technical exceptions, each justified:
 *
 * - the pipe implementation and the decorator factory are *how* contracts
 *   schemas are applied; they are generic over `z.ZodTypeAny` and cannot be
 *   written without importing zod;
 * - `health/` is the platform liveness route of `cicd.md` §3, not a product
 *   resource: epic P1 NG4 makes it the one route with no domain module, and it
 *   binds no client input at all;
 * - `openapi/` is the build-time generator.
 *
 * Nothing under `modules/` — where every product route lives per
 * `architecture.md` §4 — may be added to this list.
 */
const PLATFORM_EXCEPTIONS = [
  'common/pipes/zod-validation.pipe.ts',
  'common/pipes/contract.ts',
  'health/health.contract.ts',
  'health/health.controller.ts',
];
const PLATFORM_PREFIXES = ['openapi/'];

const CONTRACT_DECORATORS = ['ContractBody', 'ContractQuery', 'ContractParam'];

const normalise = (p) => p.split(/[\\/]/).join('/');

/** A product route file: anything under modules/, or any non-platform controller. */
export function isProductRouteFile(relativePath) {
  const rel = normalise(relativePath);
  if (PLATFORM_PREFIXES.some((prefix) => rel.startsWith(prefix))) return false;
  if (PLATFORM_EXCEPTIONS.includes(rel)) return false;
  return rel.startsWith('modules/') || rel.endsWith('.controller.ts');
}

/** Names imported from `@zenlabs/contracts`, including `as` aliases. */
function contractsImports(text) {
  const names = new Set();
  // `[^}]*` rather than a lazy `[\s\S]*?`: the lazy form backtracks across an
  // earlier import's closing brace and swallows two statements at once.
  const re = /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]@zenlabs\/contracts['"]/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    for (const raw of match[1].split(',')) {
      const piece = raw.trim();
      if (!piece) continue;
      const alias = piece.split(/\s+as\s+/).pop().trim();
      if (alias) names.add(alias.replace(/^type\s+/, ''));
    }
  }
  return names;
}

/** Text inside the parentheses opened at `openIndex`, balancing nesting. */
function balanced(text, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < text.length; i += 1) {
    if (text[i] === '(') depth += 1;
    else if (text[i] === ')') {
      depth -= 1;
      if (depth === 0) return text.slice(openIndex + 1, i);
    }
  }
  return null;
}

/** Split on commas that are not inside brackets, braces or parens. */
function topLevelArgs(argText) {
  const args = [];
  let depth = 0;
  let current = '';
  for (const char of argText) {
    if ('([{'.includes(char)) depth += 1;
    if (')]}'.includes(char)) depth -= 1;
    if (char === ',' && depth === 0) {
      args.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) args.push(current);
  return args.map((a) => a.trim());
}

/**
 * Static analysis of one repository's `apps/api/src`.
 *
 * Exported shape so the seeded-violation tests can drive it against a throwaway
 * tree — a rule that has never been observed failing is not a rule.
 */
export function analyzeSchemaOrigin(apiSrcRoot) {
  const violations = [];
  const files = readdirSync(apiSrcRoot, { recursive: true }).filter(
    (f) => typeof f === 'string' && f.endsWith('.ts'),
  );

  for (const file of files) {
    const rel = normalise(file);
    const text = readFileSync(join(apiSrcRoot, file), 'utf8');

    // A bare binding accepts input with no schema at all.
    if (rel !== 'common/pipes/contract.ts') {
      for (const decorator of ['Body', 'Query', 'Param']) {
        if (new RegExp(`@${decorator}\\(\\s*\\)`).test(text)) {
          violations.push({
            rule: 'bare-binding',
            file: rel,
            message: `${rel}: bare @${decorator}() binds an input with no schema`,
          });
        }
      }
    }

    if (!isProductRouteFile(rel)) continue;

    // A product route may not author schemas: importing zod is how that starts.
    if (/from\s+['"]zod['"]/.test(text)) {
      violations.push({
        rule: 'zod-imported-in-product-route',
        file: rel,
        message: `${rel}: a product route may not import zod — contracted schemas come from @zenlabs/contracts`,
      });
    }

    const imported = contractsImports(text);

    for (const decorator of CONTRACT_DECORATORS) {
      let from = 0;
      for (;;) {
        const at = text.indexOf(`@${decorator}(`, from);
        if (at === -1) break;
        const open = at + decorator.length + 1;
        const inner = balanced(text, open);
        from = at + 1;
        if (inner === null) continue;

        const args = topLevelArgs(inner);
        // ContractParam('id', schema) puts the schema last; the others take it first.
        const schemaExpression = args[args.length - 1] ?? '';
        const base = (schemaExpression.match(/^[A-Za-z_$][\w$]*/) ?? [])[0];

        if (!base || !imported.has(base)) {
          violations.push({
            rule: 'schema-not-from-contracts',
            file: rel,
            decorator,
            schema: schemaExpression.slice(0, 60),
            message:
              `${rel}: @${decorator} is bound to "${schemaExpression.slice(0, 40)}", ` +
              `which is not a schema imported from @zenlabs/contracts`,
          });
        }
      }
    }
  }

  return violations;
}

const temporary = [];
afterEach(() => {
  while (temporary.length) rmSync(temporary.pop(), { recursive: true, force: true });
});

/** A throwaway apps/api/src tree containing `files`. */
function seedApiSrc(files) {
  const root = mkdtempSync(join(tmpdir(), 'zenlabs-schema-origin-'));
  temporary.push(root);
  for (const [rel, contents] of Object.entries(files)) {
    const path = join(root, rel);
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, contents);
  }
  return root;
}

describe('the real apps/api is clean', () => {
  it('has no schema-origin or bare-binding violation', () => {
    const violations = analyzeSchemaOrigin(API_SRC);
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });

  it('the analysis actually inspected files', () => {
    const files = readdirSync(API_SRC, { recursive: true }).filter(
      (f) => typeof f === 'string' && f.endsWith('.ts'),
    );
    expect(files.length).toBeGreaterThan(5);
  });

  it('classifies platform and product paths correctly', () => {
    expect(isProductRouteFile('modules/content/infrastructure/content.controller.ts')).toBe(true);
    expect(isProductRouteFile('modules/content/application/create.ts')).toBe(true);
    expect(isProductRouteFile('health/health.controller.ts')).toBe(false);
    expect(isProductRouteFile('common/pipes/contract.ts')).toBe(false);
    expect(isProductRouteFile('openapi/registry.ts')).toBe(false);
  });

  it('no module may be added to the platform exception list', () => {
    for (const exception of PLATFORM_EXCEPTIONS) {
      expect(exception.startsWith('modules/'), `${exception} exempts a product module`).toBe(false);
    }
  });
});

describe('SEEDED: a product route declaring a local schema turns the check RED', () => {
  const localSchemaController = `
import { Controller, Post } from '@nestjs/common';
import { z } from 'zod';
import { ContractBody } from '../../../common/pipes/contract';

const localSchema = z.object({ objective: z.string(), channel: z.string() });

@Controller('/api/v1/content-requests')
export class ContentRequestController {
  @Post()
  create(@ContractBody(localSchema) body: z.infer<typeof localSchema>) {
    return body;
  }
}
`;

  it('rejects a schema authored inside the module', () => {
    const root = seedApiSrc({
      'modules/content/infrastructure/content.controller.ts': localSchemaController,
    });
    const violations = analyzeSchemaOrigin(root);
    const rules = violations.map((v) => v.rule);

    expect(rules).toContain('schema-not-from-contracts');
    expect(rules).toContain('zod-imported-in-product-route');
    expect(violations.find((v) => v.rule === 'schema-not-from-contracts').message).toContain(
      'localSchema',
    );
  });

  it('rejects an inline z.object() passed straight to the decorator', () => {
    const root = seedApiSrc({
      'modules/content/infrastructure/content.controller.ts': `
import { z } from 'zod';
import { ContractBody } from '../../../common/pipes/contract';
export class C {
  create(@ContractBody(z.object({ a: z.string() })) body: unknown) { return body; }
}
`,
    });
    const rules = analyzeSchemaOrigin(root).map((v) => v.rule);
    expect(rules).toContain('schema-not-from-contracts');
  });

  it('rejects a schema re-exported from a module-local file', () => {
    const root = seedApiSrc({
      'modules/content/infrastructure/schemas.ts': `
import { z } from 'zod';
export const createSchema = z.object({ a: z.string() });
`,
      'modules/content/infrastructure/content.controller.ts': `
import { ContractBody } from '../../../common/pipes/contract';
import { createSchema } from './schemas';
export class C {
  create(@ContractBody(createSchema) body: unknown) { return body; }
}
`,
    });
    const violations = analyzeSchemaOrigin(root);
    // The binding is flagged because createSchema is not imported from
    // @zenlabs/contracts, and the module-local schema file is flagged for
    // authoring schemas at all.
    expect(violations.map((v) => v.rule)).toContain('schema-not-from-contracts');
    expect(violations.map((v) => v.rule)).toContain('zod-imported-in-product-route');
  });

  it('rejects a bare @Body() in a product route', () => {
    const root = seedApiSrc({
      'modules/content/infrastructure/content.controller.ts': `
import { Body, Post } from '@nestjs/common';
export class C {
  create(@Body() body: unknown) { return body; }
}
`,
    });
    expect(analyzeSchemaOrigin(root).map((v) => v.rule)).toContain('bare-binding');
  });

  it('ACCEPTS the same route once the schema comes from @zenlabs/contracts', () => {
    const root = seedApiSrc({
      'modules/content/infrastructure/content.controller.ts': `
import { Controller, Post } from '@nestjs/common';
import { createContentRequestSchema } from '@zenlabs/contracts';
import { ContractBody } from '../../../common/pipes/contract';

@Controller('/api/v1/content-requests')
export class ContentRequestController {
  @Post()
  create(@ContractBody(createContentRequestSchema) body: unknown) {
    return body;
  }
}
`,
    });
    expect(analyzeSchemaOrigin(root)).toEqual([]);
  });

  it('ACCEPTS ContractParam, whose schema is the second argument', () => {
    const root = seedApiSrc({
      'modules/content/infrastructure/content.controller.ts': `
import { contentItemIdSchema } from '@zenlabs/contracts';
import { ContractParam } from '../../../common/pipes/contract';
export class C {
  read(@ContractParam('id', contentItemIdSchema) id: string) { return id; }
}
`,
    });
    expect(analyzeSchemaOrigin(root)).toEqual([]);
  });

  it('ACCEPTS an aliased contracts import', () => {
    const root = seedApiSrc({
      'modules/content/infrastructure/content.controller.ts': `
import { createContentRequestSchema as createSchema } from '@zenlabs/contracts';
import { ContractBody } from '../../../common/pipes/contract';
export class C {
  create(@ContractBody(createSchema) body: unknown) { return body; }
}
`,
    });
    expect(analyzeSchemaOrigin(root)).toEqual([]);
  });

  it('does not police platform paths', () => {
    const root = seedApiSrc({
      'health/health.contract.ts': `
import { z } from 'zod';
export const healthResponseSchema = z.object({ status: z.literal('ok') });
`,
    });
    expect(analyzeSchemaOrigin(root)).toEqual([]);
  });
});

describe('no second validation authority can appear', () => {
  const sourceFiles = () =>
    readdirSync(API_SRC, { recursive: true })
      .filter((f) => typeof f === 'string' && f.endsWith('.ts'))
      .map((f) => ({ file: f, text: readFileSync(join(API_SRC, f), 'utf8') }));

  it('apps/api declares no parallel validation library', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'apps/api/package.json'), 'utf8'));
    const declared = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const parallel of [
      'class-validator',
      'class-transformer',
      'joi',
      'yup',
      'ajv',
      '@nestjs/mapped-types',
      'superstruct',
      'io-ts',
      'valibot',
    ]) {
      expect(Object.keys(declared), `${parallel} is a second validation authority`).not.toContain(
        parallel,
      );
    }
  });

  it('no source file imports a parallel validation library', () => {
    for (const { file, text } of sourceFiles()) {
      expect(text, `${file} imports class-validator`).not.toMatch(
        /from\s+'class-(validator|transformer)'/,
      );
      expect(text, `${file} imports joi/yup/ajv`).not.toMatch(/from\s+'(joi|yup|ajv)'/);
    }
  });

  it('no global ValidationPipe is registered with a single schema for every route', () => {
    const main = readFileSync(join(API_SRC, 'main.ts'), 'utf8');
    expect(main).not.toMatch(/useGlobalPipes\s*\(\s*new\s+ZodValidationPipe/);
    expect(main).not.toMatch(/useGlobalPipes\s*\(\s*new\s+ValidationPipe/);
  });

  it('the contract decorators route through ZodValidationPipe', () => {
    const contract = readFileSync(join(API_SRC, 'common', 'pipes', 'contract.ts'), 'utf8');
    for (const decorator of CONTRACT_DECORATORS) expect(contract).toContain(decorator);
    expect(contract).toContain('new ZodValidationPipe(schema)');
  });
});
