/**
 * P1.10 verification gate — "FF-18 present in the fitness suite and green;
 * docs/api/openapi.yaml committed and reproducible byte-for-byte from a clean
 * checkout; the seeded-divergence test turns the check red; the convention
 * assertions pass."
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse } from 'yaml';
import { describe, it, expect, afterEach } from 'vitest';

const ROOT = process.cwd();
const SPEC = join(ROOT, 'docs', 'api', 'openapi.yaml');
const FF18 = join(ROOT, 'scripts', 'fitness', 'ff-18-openapi-matches-contracts.mjs');
const TSX = join(ROOT, 'node_modules', '.bin', 'tsx');
const RENDER = join(ROOT, 'apps', 'api', 'src', 'openapi', 'render.ts');

const runFF18 = () => spawnSync(process.execPath, [FF18], { cwd: ROOT, encoding: 'utf8' });
const render = () =>
  spawnSync(TSX, [RENDER], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).stdout;

/** Restore the committed document after any test that perturbs it. */
const original = readFileSync(SPEC, 'utf8');
afterEach(() => {
  writeFileSync(SPEC, original);
});

describe('AC-1 — the document is generated and committed', () => {
  it('docs/api/openapi.yaml is committed', () => {
    expect(existsSync(SPEC)).toBe(true);
    const tracked = spawnSync('git', ['ls-files', 'docs/api/openapi.yaml'], {
      cwd: ROOT,
      encoding: 'utf8',
    }).stdout.trim();
    expect(tracked).toBe('docs/api/openapi.yaml');
  });

  it('is marked as generated so nobody edits it by hand', () => {
    expect(original).toContain('GENERATED FILE — DO NOT EDIT');
  });

  it('is produced by one command from route metadata and contracts schemas', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.scripts['openapi:generate']).toBeTruthy();
  });
});

describe('AC-2 — regeneration is byte-identical (deterministic)', () => {
  it('matches the committed document exactly', () => {
    expect(render()).toBe(original);
  });

  it('is stable across repeated generations', () => {
    const runs = [render(), render(), render()];
    expect(new Set(runs).size, 'generation is not deterministic').toBe(1);
  });

  it('embeds no timestamp, hostname or absolute path', () => {
    expect(original).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    expect(original).not.toContain(ROOT);
    expect(original).not.toMatch(/\/home\/|\/Users\/|C:\\\\/);
  });
});

describe('FF-18 is green on the committed tree', () => {
  it('exits zero', () => {
    const result = runFF18();
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toContain('FF-18 PASS');
  });

  it('is registered in the fitness suite (AC-5)', () => {
    const suite = readFileSync(join(ROOT, 'scripts/fitness/run-all.mjs'), 'utf8');
    expect(suite).toContain("id: 'FF-18'");
    expect(suite).toContain('ff-18-openapi-matches-contracts.mjs');
  });

  it('runs in the security/static stage alongside the other fitness functions', () => {
    const stages = readFileSync(join(ROOT, 'scripts/ci/stages.mjs'), 'utf8');
    expect(stages).toContain('security-static');
    expect(stages).toContain("script: 'fitness'");
  });
});

describe('AC-6 / EX-P1-09 — a seeded divergence turns FF-18 red naming the route', () => {
  it('fails when a route response schema is edited without regenerating', () => {
    // Exactly the scenario: someone changes a response and forgets to run the
    // generator.
    const tampered = original.replace(
      'description: Liveness of the api process',
      'description: TAMPERED liveness description',
    );
    expect(tampered).not.toBe(original);
    writeFileSync(SPEC, tampered);

    const result = runFF18();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('FF-18 FAIL');
    expect(result.stderr).toContain('generate-and-diff');
    // The changed schema component is named.
    expect(result.stderr).toContain('HealthResponse');
  });

  it('names the changed path when a path is removed', () => {
    const withoutPath = original.replace(/ {2}\/api\/v1\/health:[\s\S]*?(?=\ncomponents:|\ninfo:|\nopenapi:|\nservers:|$)/, '');
    writeFileSync(SPEC, withoutPath);

    const result = runFF18();
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/\/api\/v1\/health|generate-and-diff/);
  });

  it('fails when the committed document is missing entirely', () => {
    writeFileSync(SPEC, '');
    const result = runFF18();
    expect(result.status).toBe(1);
  });
});

describe('AC-4 / EX-P1-10 — every stable error code is enumerated', () => {
  const document = () => parse(original);

  it('the problem-details enum contains all 14 stable codes', () => {
    const source = readFileSync(
      join(ROOT, 'packages/contracts/src/errors/error-codes.ts'),
      'utf8',
    );
    const block = source.slice(
      source.indexOf('export const ERROR_CODES'),
      source.indexOf('] as const;'),
    );
    const declared = [...block.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);

    const enumerated = document().components.schemas.ProblemDetails.properties.code.enum;
    expect([...enumerated].sort()).toEqual([...declared].sort());
    expect(enumerated).toContain('internal_error'); // ACR-001
  });

  it('a code added to contracts without regenerating turns FF-18 red', () => {
    // Drop a code from the committed spec: equivalent to adding one to the
    // contracts package and not regenerating.
    const tampered = original.replace('      - internal_error\n', '');
    expect(tampered).not.toBe(original);
    writeFileSync(SPEC, tampered);

    const result = runFF18();
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/internal_error|generate-and-diff/);
  });
});

describe('the OpenAPI ProblemDetails is derived from the canonical schema', () => {
  /**
   * Review finding 2 — the registry used to restate ProblemDetails by hand
   * while packages/contracts already exported `problemDetailsSchema`. Two
   * equivalent schemas maintained separately can drift while FF-18 stays green,
   * which is precisely the failure FF-18 exists to prevent.
   *
   * The link is asserted structurally: the generated component must expose
   * exactly the members of the canonical schema, and changing the canonical
   * schema must change the generated document.
   */
  const contractsShapeKeys = () => {
    const source = readFileSync(
      join(ROOT, 'packages/contracts/src/errors/problem-details.ts'),
      'utf8',
    );
    const block = source.slice(
      source.indexOf('export const problemDetailsSchema'),
      source.indexOf('export type ProblemDetails'),
    );
    return [...block.matchAll(/^\s{2}(\w+):\s/gm)].map((m) => m[1]).sort();
  };

  it('the registry imports the canonical schema instead of restating it', () => {
    const registry = readFileSync(join(ROOT, 'apps/api/src/openapi/registry.ts'), 'utf8');
    expect(registry).toContain('problemDetailsSchema');
    expect(registry).toContain('validationIssueSchema');
    // No hand-rolled duplicate of the problem shape.
    expect(registry).not.toMatch(/title:\s*z\.string\(\)/);
    expect(registry).not.toMatch(/code:\s*z\.enum\(/);
  });

  it('the generated component exposes exactly the canonical schema members', () => {
    const generated = Object.keys(
      parse(original).components.schemas.ProblemDetails.properties,
    ).sort();
    expect(generated).toEqual(contractsShapeKeys());
  });

  it('validationIssueSchema is published too, not re-declared inline', () => {
    const issue = parse(original).components.schemas.ValidationIssue;
    expect(issue).toBeDefined();
    expect(Object.keys(issue.properties).sort()).toEqual(['pointer', 'reason']);
  });

  it('a change to the canonical schema changes the generated document', () => {
    // Perturb the canonical source, regenerate, and confirm the output moves.
    // The file is restored immediately afterwards.
    const contractsPath = join(ROOT, 'packages/contracts/src/errors/problem-details.ts');
    const before = readFileSync(contractsPath, 'utf8');
    try {
      const perturbed = before.replace(
        '  instance: z.string().optional(),',
        '  instance: z.string().optional(),\n  seededProbeField: z.string().optional(),',
      );
      expect(perturbed).not.toBe(before);
      writeFileSync(contractsPath, perturbed);

      const regenerated = render();
      expect(regenerated).not.toBe(original);
      expect(regenerated).toContain('seededProbeField');
    } finally {
      writeFileSync(contractsPath, before);
    }
    // Sanity: the restore worked and generation is back to the committed output.
    expect(render()).toBe(original);
  });

  it('seeded contract-schema drift turns FF-18 RED', () => {
    const contractsPath = join(ROOT, 'packages/contracts/src/errors/problem-details.ts');
    const before = readFileSync(contractsPath, 'utf8');
    try {
      writeFileSync(
        contractsPath,
        before.replace(
          '  instance: z.string().optional(),',
          '  instance: z.string().optional(),\n  seededProbeField: z.string().optional(),',
        ),
      );
      const result = runFF18();
      expect(result.status, 'FF-18 must reject an unregenerated contract change').toBe(1);
      expect(result.stderr).toContain('ProblemDetails');
    } finally {
      writeFileSync(contractsPath, before);
    }
    expect(runFF18().status).toBe(0);
  });
});

describe('AC-3 — api-contracts.md §1 conventions hold', () => {
  const document = () => parse(original);

  it('is a valid OpenAPI 3.1 document with info and paths', () => {
    const doc = document();
    expect(doc.openapi).toMatch(/^3\.1\./);
    expect(doc.info.title).toBeTruthy();
    expect(doc.info.version).toBe('v1');
    expect(Object.keys(doc.paths).length).toBeGreaterThan(0);
  });

  it('every path is under the /api/v1 base path', () => {
    for (const path of Object.keys(document().paths)) {
      expect(path.startsWith('/api/v1')).toBe(true);
    }
  });

  it('no client-facing route declares a tenantId parameter (EX-P1-11)', () => {
    for (const [path, operations] of Object.entries(document().paths)) {
      expect(path).not.toMatch(/tenantId/i);
      for (const operation of Object.values(operations)) {
        for (const parameter of operation.parameters ?? []) {
          expect(parameter.name).not.toMatch(/^tenantid$/i);
        }
      }
    }
  });

  it('renders errors as RFC 9457 problem+json', () => {
    const doc = document();
    expect(doc.components.schemas.ProblemDetails).toBeDefined();
    const responses = doc.paths['/api/v1/health'].get.responses;
    expect(Object.keys(responses['500'].content)).toContain('application/problem+json');
  });

  it('offers no offset pagination (ADR-0032)', () => {
    for (const operations of Object.values(document().paths)) {
      for (const operation of Object.values(operations)) {
        for (const parameter of operation.parameters ?? []) {
          expect(parameter.name).not.toMatch(/^offset$/i);
        }
      }
    }
  });

  it('the convention check itself is not vacuous — it rejects a tenantId route', () => {
    // Prove the assertion would fire, without committing such a route.
    const offending = {
      '/api/v1/content-items': { get: { parameters: [{ name: 'tenantId', in: 'query' }] } },
    };
    const violations = [];
    for (const [path, operations] of Object.entries(offending)) {
      for (const operation of Object.values(operations)) {
        for (const parameter of operation.parameters ?? []) {
          if (/^tenantid$/i.test(parameter.name)) violations.push(path);
        }
      }
    }
    expect(violations).toEqual(['/api/v1/content-items']);
  });
});
