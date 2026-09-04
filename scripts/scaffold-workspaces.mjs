#!/usr/bin/env node
// One-shot scaffolder used by P1.02 to materialise the workspace set fixed by
// architecture.md §2.1 (processes) and §2.2 (packages).
//
// It is idempotent: it never overwrites a file that already exists, so later
// stories (P1.04, P1.05, P1.08, P1.09) can fill these shells in place and this
// script can still be re-run to prove the set is complete.

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// architecture.md §2.2 — "May depend on" column, verbatim.
const PACKAGES = [
  ['contracts', 'Zod schemas, DTOs, domain event payloads, error codes. No I/O.', []],
  ['database', 'Drizzle schema, migrations, RLS helpers, repository primitives.', ['contracts']],
  ['providers', 'Provider ports + adapters + capability registry + error taxonomy.', ['contracts']],
  ['security', 'AuthN/AuthZ primitives, crypto, token envelope encryption.', ['contracts']],
  ['observability', 'Structured logger, correlation context, metric emitters.', ['contracts']],
  ['config', 'Environment schema and typed configuration loading.', ['contracts']],
  ['ui', 'Design system primitives and components.', ['contracts']],
];

// architecture.md §2.1 — the five processes.
const APPS = [
  ['web', 'Next.js App Router. Portal + Studio + Control surfaces.', 'P15.02'],
  ['api', 'NestJS modular HTTP API. Command/query entry point. Owns transactions.', 'P1.08'],
  ['worker-ai', 'Briefing, script, caption, brand-compliance generation; knowledge ingestion and embedding.', 'P1.09'],
  ['worker-media', 'Voice synthesis, video render submission, provider polling, media ingestion to S3.', 'P1.09'],
  ['worker-social', 'Publication, token refresh, performance collection.', 'P1.09'],
];

function write(path, contents) {
  const abs = join(ROOT, path);
  if (existsSync(abs)) return false;
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, contents);
  return true;
}

const tsconfig = (extraExclude = []) =>
  `${JSON.stringify(
    {
      extends: '../../tsconfig.base.json',
      compilerOptions: { rootDir: 'src', outDir: 'dist' },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', ...extraExclude],
    },
    null,
    2,
  )}\n`;

let created = 0;

for (const [name, contents, allowed] of PACKAGES) {
  const pkg = {
    name: `@zenlabs/${name}`,
    version: '0.0.0',
    private: true,
    description: contents,
    license: 'UNLICENSED',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: {
      build: 'tsc -p tsconfig.json',
      typecheck: 'tsc --noEmit -p tsconfig.json',
    },
    // Machine-readable boundary manifest consumed by FF-04 (P1.03).
    // Mirrors architecture.md §2.2 exactly.
    zenlabs: {
      kind: 'package',
      architectureRef: 'architecture.md §2.2',
      allowedDependencies: allowed.map((d) => `@zenlabs/${d}`),
    },
    dependencies: Object.fromEntries(allowed.map((d) => [`@zenlabs/${d}`, 'workspace:*'])),
  };
  created += write(`packages/${name}/package.json`, `${JSON.stringify(pkg, null, 2)}\n`);
  created += write(`packages/${name}/tsconfig.json`, tsconfig());
  created += write(
    `packages/${name}/src/index.ts`,
    `// @zenlabs/${name}\n// ${contents}\n// architecture.md §2.2 — may depend on: ${
      allowed.length ? allowed.join(', ') : 'nothing'
    }.\n\nexport {};\n`,
  );
}

for (const [name, responsibility, filledBy] of APPS) {
  const pkg = {
    name: `@zenlabs/${name}`,
    version: '0.0.0',
    private: true,
    description: responsibility,
    license: 'UNLICENSED',
    main: 'dist/main.js',
    scripts: {
      build: 'tsc -p tsconfig.json',
      typecheck: 'tsc --noEmit -p tsconfig.json',
    },
    zenlabs: {
      kind: 'app',
      architectureRef: 'architecture.md §2.1',
      // Placeholders own no workspace edge yet. P1.08 / P1.09 declare the real
      // sets and FF-04 enforces them from that point on.
      allowedDependencies: [],
      bootstrappedBy: filledBy,
    },
    dependencies: {},
  };
  created += write(`apps/${name}/package.json`, `${JSON.stringify(pkg, null, 2)}\n`);
  created += write(`apps/${name}/tsconfig.json`, tsconfig());
  created += write(
    `apps/${name}/src/main.ts`,
    `// @zenlabs/${name}\n// ${responsibility}\n// architecture.md §2.1. Bootstrapped by ${filledBy}.\n\nexport {};\n`,
  );
}

console.log(`scaffold: ${created} file(s) created`);
