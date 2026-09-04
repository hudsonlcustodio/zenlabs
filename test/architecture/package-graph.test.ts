/**
 * P1.02 — verification gate: "Package graph snapshot matches architecture.md §2.2."
 *
 * This file is the executable transcription of architecture.md §2.1 and §2.2.
 * If the architecture tables change, this snapshot must change with them in the
 * same commit — that is the point.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

// Vitest resolves cwd to the directory of the root vitest.config.ts.
const ROOT = process.cwd();

/** architecture.md §2.2 — "Package | May depend on", verbatim. */
const PACKAGE_GRAPH: Record<string, string[]> = {
  '@zenlabs/contracts': [],
  '@zenlabs/database': ['@zenlabs/contracts'],
  '@zenlabs/providers': ['@zenlabs/contracts'],
  '@zenlabs/security': ['@zenlabs/contracts'],
  '@zenlabs/observability': ['@zenlabs/contracts'],
  '@zenlabs/config': ['@zenlabs/contracts'],
  '@zenlabs/ui': ['@zenlabs/contracts'],
};

/** architecture.md §2.1 — the five processes. */
const PROCESSES = [
  '@zenlabs/web',
  '@zenlabs/api',
  '@zenlabs/worker-ai',
  '@zenlabs/worker-media',
  '@zenlabs/worker-social',
];

interface VyraManifest {
  kind: 'package' | 'app';
  architectureRef: string;
  allowedDependencies: string[];
  bootstrappedBy?: string;
}

interface PackageJson {
  name: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  zenlabs?: VyraManifest;
}

function readPackageJson(dir: string, name: string): PackageJson {
  const path = join(ROOT, dir, name, 'package.json');
  expect(existsSync(path), `${dir}/${name}/package.json must exist`).toBe(true);
  return JSON.parse(readFileSync(path, 'utf8')) as PackageJson;
}

const shortName = (workspaceName: string) => workspaceName.replace('@zenlabs/', '');

/** Workspace-internal dependency edges actually declared by a package.json. */
function workspaceEdges(pkg: PackageJson): string[] {
  return Object.keys(pkg.dependencies ?? {})
    .filter((d) => d.startsWith('@zenlabs/'))
    .sort();
}

describe('architecture.md §2.2 — package set', () => {
  it.each(Object.keys(PACKAGE_GRAPH))('%s exists and is buildable (AC-1)', (name) => {
    const pkg = readPackageJson('packages', shortName(name));
    expect(pkg.name).toBe(name);
    expect(pkg.scripts?.build, 'build must be wired').toBeTruthy();
    expect(pkg.scripts?.typecheck, 'typecheck must be wired').toBeTruthy();
  });

  it('contains exactly the seven packages of §2.2 — no more, no fewer', () => {
    const onDisk = readdirSync(join(ROOT, 'packages'), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => `@zenlabs/${e.name}`)
      .sort();
    expect(onDisk).toEqual(Object.keys(PACKAGE_GRAPH).sort());
  });

  it.each(Object.entries(PACKAGE_GRAPH))(
    '%s declares its permitted dependencies exactly as tabulated (AC-2)',
    (name, allowed) => {
      const pkg = readPackageJson('packages', shortName(name));
      expect(pkg.zenlabs?.kind).toBe('package');
      expect(pkg.zenlabs?.architectureRef).toBe('architecture.md §2.2');
      expect([...(pkg.zenlabs?.allowedDependencies ?? [])].sort()).toEqual([...allowed].sort());
    },
  );

  it.each(Object.entries(PACKAGE_GRAPH))(
    '%s declares no workspace edge outside its permitted set (AC-2)',
    (name, allowed) => {
      const pkg = readPackageJson('packages', shortName(name));
      for (const edge of workspaceEdges(pkg)) {
        expect(allowed, `${name} -> ${edge} is an undeclared edge`).toContain(edge);
      }
    },
  );
});

describe('architecture.md §2.2 — packages/contracts is the zero-I/O root', () => {
  const contracts = () => readPackageJson('packages', 'contracts');

  it('names no sibling package (EX-P1-02a)', () => {
    expect(workspaceEdges(contracts())).toEqual([]);
    expect(contracts().zenlabs?.allowedDependencies).toEqual([]);
  });

  it('declares no runtime dependency that performs I/O (AC-3)', () => {
    // A dependency performs I/O if it can reach the network, the filesystem,
    // a database or a cloud SDK. contracts is schemas only; the only runtime
    // dependency it may ever hold is a pure validation library.
    const IO_CAPABLE = [
      /^aws-sdk$/,
      /^@aws-sdk\//,
      /^drizzle-orm$/,
      /^pg$/,
      /^postgres$/,
      /^axios$/,
      /^node-fetch$/,
      /^got$/,
      /^undici$/,
      /^fs-extra$/,
      /^ioredis$/,
      /^redis$/,
      /^@nestjs\//,
      /^next$/,
      /^express$/,
      /openai/i,
      /heygen/i,
      /elevenlabs/i,
      /deepseek/i,
    ];
    for (const dep of Object.keys(contracts().dependencies ?? {})) {
      for (const pattern of IO_CAPABLE) {
        expect(pattern.test(dep), `contracts must not depend on I/O-capable "${dep}"`).toBe(false);
      }
    }
  });
});

describe('architecture.md §2.1 — the five processes exist (AC-4)', () => {
  it.each(PROCESSES)('%s exists as a buildable workspace', (name) => {
    const pkg = readPackageJson('apps', shortName(name));
    expect(pkg.name).toBe(name);
    expect(pkg.scripts?.build).toBeTruthy();
    expect(pkg.scripts?.typecheck).toBeTruthy();
    expect(pkg.zenlabs?.kind).toBe('app');
    expect(pkg.zenlabs?.architectureRef).toBe('architecture.md §2.1');
  });

  it('contains exactly the five processes of §2.1 — no more, no fewer', () => {
    const onDisk = readdirSync(join(ROOT, 'apps'), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => `@zenlabs/${e.name}`)
      .sort();
    expect(onDisk).toEqual([...PROCESSES].sort());
  });

  it.each(PROCESSES)('%s declares no workspace edge outside its permitted set', (name) => {
    const pkg = readPackageJson('apps', shortName(name));
    const allowed = pkg.zenlabs?.allowedDependencies ?? [];
    for (const edge of workspaceEdges(pkg)) {
      expect(allowed, `${name} -> ${edge} is an undeclared edge`).toContain(edge);
    }
  });
});
