/**
 * P1.08 verification gate — "`apps/api` boots in CI; the health route returns
 * the commit SHA; ... a fail-fast boot test exits non-zero on a missing key."
 *
 * Spawns the real process, like the other four §2.1 processes.
 */
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = process.cwd();
const API = join(ROOT, 'apps', 'api');
const TSX = join(ROOT, 'node_modules', '.bin', 'tsx');
const PORT = 34611;

const env = (extra = {}) => ({
  PATH: process.env.PATH ?? '',
  APP_ENV: 'development',
  PROVIDER_MODE: 'mock',
  COMMIT_SHA: 'apisha7788',
  LOG_LEVEL: 'info',
  PORT: String(PORT),
  HOST: '127.0.0.1',
  ...extra,
});

function bootThenSignal(probe, signal = 'SIGTERM', childEnv = env()) {
  return new Promise((resolve) => {
    const child = spawn(TSX, [join(API, 'src', 'main.ts')], {
      cwd: API,
      env: childEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let acted = false;
    let probeResult = null;

    child.stdout.on('data', async (chunk) => {
      stdout += chunk;
      if (!acted && stdout.includes('api started')) {
        acted = true;
        if (probe) {
          try {
            probeResult = await probe();
          } catch (error) {
            probeResult = { error: String(error) };
          }
        }
        child.kill(signal);
      }
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    child.on('close', (code, closedBy) => resolve({ code, closedBy, stdout, stderr, probeResult }));
    setTimeout(() => child.kill('SIGKILL'), 60_000);
  });
}

describe('AC-1 — apps/api boots as a NestJS application with typed configuration', () => {
  it('boots and announces its environment', async () => {
    const result = await bootThenSignal(null);
    const started = result.stdout
      .trim()
      .split('\n')
      .map((l) => JSON.parse(l))
      .find((l) => l.msg === 'api started');

    expect(started, result.stdout + result.stderr).toBeDefined();
    expect(started.service).toBe('api');
    expect(started.providerMode).toBe('mock');
    expect(started.commitSha).toBe('apisha7788');
  }, 90_000);

  it('exits zero on SIGTERM', async () => {
    const result = await bootThenSignal(null, 'SIGTERM');
    expect(result.code, result.stderr).toBe(0);
    expect(result.closedBy).toBeNull();
    expect(result.stdout).toContain('shutdown complete');
  }, 90_000);

  it('exits zero on SIGINT', async () => {
    const result = await bootThenSignal(null, 'SIGINT');
    expect(result.code).toBe(0);
  }, 90_000);
});

describe('EX-P1-04 — a missing key exits non-zero BEFORE binding a port', () => {
  it('exits 1 and never reports readiness', () => {
    const result = spawnSync(TSX, [join(API, 'src', 'main.ts')], {
      cwd: API,
      env: { PATH: process.env.PATH ?? '' },
      encoding: 'utf8',
      timeout: 60_000,
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('APP_ENV');
    expect(result.stdout).not.toContain('api started');
  }, 90_000);

  it('leaves the port unbound', async () => {
    const probePort = 34612;
    const result = spawnSync(TSX, [join(API, 'src', 'main.ts')], {
      cwd: API,
      env: { PATH: process.env.PATH ?? '', PORT: String(probePort) },
      encoding: 'utf8',
      timeout: 60_000,
    });
    expect(result.status).toBe(1);

    // Nothing is listening: configuration is parsed before the framework starts.
    await expect(
      fetch(`http://127.0.0.1:${probePort}/api/v1/health`, {
        signal: AbortSignal.timeout(2000),
      }),
    ).rejects.toThrow();
  }, 90_000);
});

describe('AC-4 — the health route returns the running commit SHA over HTTP', () => {
  it('serves GET /api/v1/health', async () => {
    const result = await bootThenSignal(async () => {
      const response = await fetch(`http://127.0.0.1:${PORT}/api/v1/health`);
      return { status: response.status, body: await response.json() };
    });

    expect(result.probeResult?.status).toBe(200);
    expect(result.probeResult?.body).toEqual({ status: 'ok', commitSha: 'apisha7788' });
  }, 90_000);
});

describe('AC-5 — apps/api depends only on contracts, config and observability', () => {
  it('declares exactly that set', () => {
    const pkg = JSON.parse(readFileSync(join(API, 'package.json'), 'utf8'));
    expect([...pkg.zenlabs.allowedDependencies].sort()).toEqual([
      '@zenlabs/config',
      '@zenlabs/contracts',
      '@zenlabs/observability',
    ]);
  });

  it('has no workspace edge outside that set', () => {
    const pkg = JSON.parse(readFileSync(join(API, 'package.json'), 'utf8'));
    const edges = Object.keys(pkg.dependencies).filter((d) => d.startsWith('@zenlabs/'));
    expect(edges.sort()).toEqual(['@zenlabs/config', '@zenlabs/contracts', '@zenlabs/observability']);
  });

  it('imports neither packages/database nor packages/providers — they do not exist yet', () => {
    const source = readdirSync(join(API, 'src'), { recursive: true })
      .filter((f) => typeof f === 'string' && f.endsWith('.ts'))
      .map((f) => readFileSync(join(API, 'src', f), 'utf8'))
      .join('\n');
    expect(source).not.toContain('@zenlabs/database');
    expect(source).not.toContain('@zenlabs/providers');
  });

  it('FF-04 covers apps/* and is green', () => {
    const result = spawnSync(
      process.execPath,
      [join(ROOT, 'scripts', 'fitness', 'ff-04-dependency-graph.mjs')],
      { encoding: 'utf8' },
    );
    expect(result.status, result.stdout + result.stderr).toBe(0);
  });
});

describe('AC-6 — apps/api is stateless (NFR-11, precursor to FF-21)', () => {
  const snapshot = (dir) => {
    const out = [];
    const walk = (d) => {
      for (const entry of readdirSync(d, { withFileTypes: true })) {
        if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
        const full = join(d, entry.name);
        if (entry.isDirectory()) walk(full);
        else out.push(`${full}:${statSync(full).size}`);
      }
    };
    walk(dir);
    return out.sort();
  };

  it('writes nothing to local disk during boot or a health request', async () => {
    const before = snapshot(API);
    await bootThenSignal(async () => {
      await fetch(`http://127.0.0.1:${PORT}/api/v1/health`);
      return null;
    });
    expect(snapshot(API)).toEqual(before);
  }, 90_000);

  /**
   * `src/openapi/` is build-time tooling: `pnpm openapi:generate` writes
   * docs/api/openapi.yaml. It is never reachable from the server, which the
   * next test proves — so excluding it here is an exclusion, not a loophole.
   */
  const RUNTIME_SOURCE = (file) => file.endsWith('.ts') && !file.startsWith('openapi/');

  it('contains no filesystem write call in any runtime source file', () => {
    const files = readdirSync(join(API, 'src'), { recursive: true }).filter(
      (f) => typeof f === 'string' && RUNTIME_SOURCE(f),
    );
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = readFileSync(join(API, 'src', file), 'utf8');
      expect(source, `${file} writes to disk`).not.toMatch(
        /writeFile|appendFile|createWriteStream|mkdirSync|useStaticAssets/,
      );
    }
  });

  it('the OpenAPI generator is not reachable from the running application', () => {
    // Walk the import graph from main.ts. If src/openapi/ never appears, the
    // generator's writeFileSync cannot execute inside the server process.
    const seen = new Set();
    const visit = (relative) => {
      if (seen.has(relative)) return;
      seen.add(relative);
      const path = join(API, 'src', relative);
      if (!existsSync(path)) return;
      const source = readFileSync(path, 'utf8');
      for (const match of source.matchAll(/from\s+'(\.[^']+)'/g)) {
        const target = join(relative, '..', match[1]).replace(/\\/g, '/');
        visit(target.endsWith('.ts') ? target : `${target}.ts`);
      }
    };
    visit('main.ts');

    const reachable = [...seen];
    expect(reachable, 'main.ts must not reach the generator').not.toContain(
      'openapi/generate.ts',
    );
    expect(reachable.some((f) => f.startsWith('openapi/'))).toBe(false);
    // Sanity: the walk actually traversed something.
    expect(reachable).toContain('app.module.ts');
  });
});

describe('AC-2 — the module layout is declared and Wave 1 is isolated', () => {
  it('has a single documented domain-module registration point', () => {
    const appModule = readFileSync(join(API, 'src', 'app.module.ts'), 'utf8');
    expect(appModule).toContain('DOMAIN_MODULES');
    expect(existsSync(join(API, 'src', 'modules', 'README.md'))).toBe(true);
  });

  it('keeps the Wave 1 identity slice out of Nest registration until its HTTP contract is ready', () => {
    const appModule = readFileSync(join(API, 'src', 'app.module.ts'), 'utf8');
    expect(appModule).toMatch(/DOMAIN_MODULES[^=]*=\s*\[\s*\]/);

    const modules = readdirSync(join(API, 'src', 'modules'), { withFileTypes: true }).filter((e) =>
      e.isDirectory(),
    );
    expect(modules.map((entry) => entry.name)).toEqual(['identity']);
    expect(existsSync(join(API, 'src', 'modules', 'identity', 'module.manifest.json'))).toBe(true);
  });
});
