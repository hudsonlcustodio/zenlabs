/**
 * P1.03 — verification gate: "FF-04 passes on the clean tree and fails on each
 * seeded violation."
 *
 * Every case below seeds one concrete violation into a throwaway repository and
 * asserts FF-04 turns red for that specific reason. A check that has never been
 * observed failing is not a check.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, afterEach } from 'vitest';

import {
  analyzeAll,
  analyzeWorkspaceGraph,
  analyzeModuleGraph,
  findCycles,
  extractImports,
} from '../../scripts/fitness/lib/graph.mjs';

const REPO_ROOT = process.cwd();
const temporary = [];

afterEach(() => {
  while (temporary.length) rmSync(temporary.pop(), { recursive: true, force: true });
});

/** Build a throwaway repository tree and return its root. */
function seedRepo({ packages = {}, apps = {}, modules = null } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'zenlabs-ff04-'));
  temporary.push(root);

  const writePkg = (area, name, spec) => {
    const dir = join(root, area, name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify(
        {
          name: `@zenlabs/${name}`,
          version: '0.0.0',
          private: true,
          zenlabs:
            spec.manifest === false
              ? undefined
              : {
                  kind: area === 'apps' ? 'app' : 'package',
                  architectureRef: area === 'apps' ? 'architecture.md §2.1' : 'architecture.md §2.2',
                  allowedDependencies: (spec.allowed ?? []).map((d) => `@zenlabs/${d}`),
                },
          dependencies: Object.fromEntries(
            (spec.deps ?? []).map((d) => [`@zenlabs/${d}`, 'workspace:*']),
          ),
        },
        null,
        2,
      ),
    );
  };

  for (const [name, spec] of Object.entries(packages)) writePkg('packages', name, spec);
  for (const [name, spec] of Object.entries(apps)) writePkg('apps', name, spec);

  if (modules) {
    for (const [name, spec] of Object.entries(modules)) {
      const dir = join(root, 'apps', 'api', 'src', 'modules', name);
      mkdirSync(dir, { recursive: true });
      if (spec.manifest !== false) {
        writeFileSync(
          join(dir, 'module.manifest.json'),
          JSON.stringify({ name, allowedDependencies: spec.allowed ?? [] }, null, 2),
        );
      }
      for (const [relPath, contents] of Object.entries(spec.files ?? {})) {
        const filePath = join(dir, relPath);
        mkdirSync(join(filePath, '..'), { recursive: true });
        writeFileSync(filePath, contents);
      }
    }
  }
  return root;
}

const rules = (violations) => violations.map((v) => v.rule);

describe('FF-04 — the real repository (clean tree)', () => {
  it('passes: the graph is a DAG and every edge is declared', () => {
    const { violations } = analyzeAll(REPO_ROOT);
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
});

describe('FF-04 — seeded workspace violations turn it red', () => {
  it('AC-4 / EX-P1-01: a cycle between two packages fails and names both edges', () => {
    const root = seedRepo({
      packages: {
        contracts: { allowed: [], deps: [] },
        alpha: { allowed: ['beta'], deps: ['beta'] },
        beta: { allowed: ['alpha'], deps: ['alpha'] },
      },
    });
    const { violations } = analyzeWorkspaceGraph(root);
    const cycles = violations.filter((v) => v.rule === 'cycle');
    expect(cycles).toHaveLength(1);

    // "the failure names both edges" — literally both, not just the cycle head.
    expect(cycles[0].edges).toEqual(
      expect.arrayContaining(['@zenlabs/alpha -> @zenlabs/beta', '@zenlabs/beta -> @zenlabs/alpha']),
    );
    expect(cycles[0].message).toContain('@zenlabs/alpha -> @zenlabs/beta');
    expect(cycles[0].message).toContain('@zenlabs/beta -> @zenlabs/alpha');
  });

  it('AC-1: an undeclared workspace edge fails', () => {
    const root = seedRepo({
      packages: {
        contracts: { allowed: [], deps: [] },
        database: { allowed: [], deps: ['contracts'] }, // consumes it without declaring it
      },
    });
    const { violations } = analyzeWorkspaceGraph(root);
    const undeclared = violations.filter((v) => v.rule === 'undeclared-edge');
    expect(undeclared).toHaveLength(1);
    expect(undeclared[0].message).toContain('@zenlabs/database -> @zenlabs/contracts');
  });

  it('AC-1: a workspace with no allowedDependencies manifest fails', () => {
    const root = seedRepo({ packages: { rogue: { manifest: false } } });
    expect(rules(analyzeWorkspaceGraph(root).violations)).toContain('missing-manifest');
  });

  it('a three-package cycle is reported with all three edges', () => {
    const root = seedRepo({
      packages: {
        a: { allowed: ['b'], deps: ['b'] },
        b: { allowed: ['c'], deps: ['c'] },
        c: { allowed: ['a'], deps: ['a'] },
      },
    });
    const cycle = analyzeWorkspaceGraph(root).violations.find((v) => v.rule === 'cycle');
    expect(cycle.edges).toHaveLength(3);
  });
});

describe('FF-04 — seeded module violations turn it red (architecture.md §4.1)', () => {
  it('AC-1: an undeclared cross-module edge fails', () => {
    const root = seedRepo({
      modules: {
        content: {
          allowed: [], // does not declare workflow
          files: {
            'application/create.ts': `import { Engine } from '../../workflow/application/engine';\nexport const x = Engine;\n`,
          },
        },
        workflow: { allowed: [], files: { 'application/engine.ts': 'export const Engine = 1;\n' } },
      },
    });
    const undeclared = analyzeModuleGraph(root).violations.filter(
      (v) => v.rule === 'undeclared-edge',
    );
    expect(undeclared).toHaveLength(1);
    expect(undeclared[0].message).toContain('content -> workflow');
  });

  it('AC-1: the same edge passes once it is declared', () => {
    const root = seedRepo({
      modules: {
        content: {
          allowed: ['workflow'],
          files: {
            'application/create.ts': `import { Engine } from '../../workflow/application/engine';\nexport const x = Engine;\n`,
          },
        },
        workflow: { allowed: [], files: { 'application/engine.ts': 'export const Engine = 1;\n' } },
      },
    });
    expect(analyzeModuleGraph(root).violations).toEqual([]);
  });

  it("AC-2 / EX-P1-03a: importing another module's infrastructure/ fails", () => {
    const root = seedRepo({
      modules: {
        content: {
          allowed: ['workflow'], // declared, but internals are still unreachable
          files: {
            'application/create.ts': `import { Repo } from '../../workflow/infrastructure/repo';\nexport const x = Repo;\n`,
          },
        },
        workflow: { allowed: [], files: { 'infrastructure/repo.ts': 'export const Repo = 1;\n' } },
      },
    });
    const found = analyzeModuleGraph(root).violations.filter(
      (v) => v.rule === 'cross-module-internals',
    );
    expect(found).toHaveLength(1);
    expect(found[0].message).toContain("workflow's infrastructure/");
  });

  it("AC-2: importing another module's domain/ fails", () => {
    const root = seedRepo({
      modules: {
        content: {
          allowed: ['workflow'],
          files: {
            'application/create.ts': `import { Item } from '../../workflow/domain/item';\nexport const x = Item;\n`,
          },
        },
        workflow: { allowed: [], files: { 'domain/item.ts': 'export const Item = 1;\n' } },
      },
    });
    const found = analyzeModuleGraph(root).violations.filter(
      (v) => v.rule === 'cross-module-internals',
    );
    expect(found).toHaveLength(1);
    expect(found[0].message).toContain("workflow's domain/");
  });

  it.each([
    ['a provider SDK', `import OpenAI from 'openai';\nexport const x = OpenAI;\n`],
    ['aws-sdk', `import { S3 } from '@aws-sdk/client-s3';\nexport const x = S3;\n`],
    ['the ORM', `import { eq } from 'drizzle-orm';\nexport const x = eq;\n`],
    ['packages/database', `import { db } from '@zenlabs/database';\nexport const x = db;\n`],
  ])('AC-3: domain/ importing %s fails', (_label, source) => {
    const root = seedRepo({
      modules: { content: { allowed: [], files: { 'domain/item.ts': source } } },
    });
    const found = analyzeModuleGraph(root).violations.filter(
      (v) => v.rule === 'domain-forbidden-import',
    );
    expect(found).toHaveLength(1);
  });

  it('AC-3: the same import from infrastructure/ is allowed', () => {
    const root = seedRepo({
      modules: {
        content: {
          allowed: [],
          files: { 'infrastructure/repo.ts': `import { eq } from 'drizzle-orm';\nexport const x = eq;\n` },
        },
      },
    });
    expect(analyzeModuleGraph(root).violations).toEqual([]);
  });

  it('AC-4: a module cycle fails and names both edges', () => {
    const root = seedRepo({
      modules: {
        content: {
          allowed: ['workflow'],
          files: {
            'application/a.ts': `import { W } from '../../workflow/application/b';\nexport const x = W;\n`,
          },
        },
        workflow: {
          allowed: ['content'],
          files: {
            'application/b.ts': `import { C } from '../../content/application/a';\nexport const W = C;\n`,
          },
        },
      },
    });
    const cycle = analyzeModuleGraph(root).violations.find((v) => v.rule === 'cycle');
    expect(cycle).toBeDefined();
    expect(cycle.edges).toEqual(
      expect.arrayContaining(['content -> workflow', 'workflow -> content']),
    );
  });

  it('AC-1: a module with no manifest fails', () => {
    const root = seedRepo({
      modules: { rogue: { manifest: false, files: { 'domain/x.ts': 'export const x = 1;\n' } } },
    });
    expect(rules(analyzeModuleGraph(root).violations)).toContain('missing-manifest');
  });
});

describe('FF-04 — import extraction', () => {
  it('sees static imports, re-exports, require and dynamic import', () => {
    const specs = extractImports(`
      import a from 'alpha';
      import { b } from "beta";
      export { c } from 'gamma';
      const d = require('delta');
      const e = await import('epsilon');
    `);
    expect(specs).toEqual(expect.arrayContaining(['alpha', 'beta', 'gamma', 'delta', 'epsilon']));
  });

  it('ignores commented-out imports so dead code is not reported', () => {
    const specs = extractImports(`
      // import x from 'aws-sdk';
      /* import y from 'drizzle-orm'; */
      import z from 'zod';
    `);
    expect(specs).toEqual(['zod']);
  });

  it('does not mistake a URL in code for a comment', () => {
    const specs = extractImports(`const u = 'https://example.com';\nimport z from 'zod';`);
    expect(specs).toEqual(['zod']);
  });
});

describe('FF-04 — cycle detection', () => {
  it('reports nothing for a DAG', () => {
    expect(findCycles({ a: ['b'], b: ['c'], c: [] })).toEqual([]);
  });

  it('reports a self-edge', () => {
    expect(findCycles({ a: ['a'] })).toEqual([['a', 'a']]);
  });

  it('reports each distinct cycle once', () => {
    expect(findCycles({ a: ['b'], b: ['a'] })).toHaveLength(1);
  });
});
