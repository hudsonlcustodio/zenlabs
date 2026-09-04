/**
 * P1.02 AC-4 — `apps/web` is one of the five architecture.md §2.1 processes and
 * must exist as a real, buildable, bootable workspace.
 *
 * Epic P1 AE4 requires all five processes to boot and shut down cleanly with
 * zero product behaviour. These tests spawn the built web process and assert
 * exactly that, plus the absence of any product surface.
 */
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeAll } from 'vitest';

const ROOT = process.cwd();
const WEB = join(ROOT, 'apps', 'web');

/**
 * The web process is the only one of the five that needs a compiled artifact
 * before it can boot. cicd.md §1 puts `build` at stage 6, after the `unit`
 * stage that runs this suite, so the suite builds on demand rather than
 * assuming a build has already happened. On a warm tree this is a no-op.
 */
beforeAll(() => {
  if (existsSync(join(WEB, 'dist', 'main.js')) && existsSync(join(WEB, '.next'))) return;
  // `@zenlabs/web...` (trailing ellipsis) builds web *and its workspace
  // dependencies*: the build config resolves @zenlabs/* from each package's dist,
  // so config and observability must be compiled first.
  const build = spawnSync('pnpm', ['--filter', '@zenlabs/web...', 'build'], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 600_000,
  });
  if (build.status !== 0) {
    throw new Error(`apps/web build failed:\n${build.stdout}\n${build.stderr}`);
  }
}, 600_000);

/** A free-ish high port so the suite never collides with a dev server. */
const PORT = 34517;

const env = (extra = {}) => ({
  PATH: process.env.PATH ?? '',
  APP_ENV: 'staging', // production-like: uses the prebuilt .next output
  PROVIDER_MODE: 'mock',
  COMMIT_SHA: 'websha123',
  LOG_LEVEL: 'info',
  PORT: String(PORT),
  HOST: '127.0.0.1',
  ...extra,
});

/** Boot the built process, wait for "web started", run `probe`, then SIGTERM. */
function bootThenSignal(probe, signal = 'SIGTERM', childEnv = env()) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [join(WEB, 'dist', 'main.js')], {
      cwd: WEB,
      env: childEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let acted = false;
    let probeResult = null;

    child.stdout.on('data', async (chunk) => {
      stdout += chunk;
      if (!acted && stdout.includes('web started')) {
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

    child.on('close', (code, closedBy) =>
      resolve({ code, closedBy, stdout, stderr, probeResult }),
    );

    setTimeout(() => child.kill('SIGKILL'), 60_000);
  });
}

describe('apps/web exists as a real workspace (P1.02 AC-4)', () => {
  it('is a Next.js App Router application (ADR-0003)', () => {
    const pkg = JSON.parse(readFileSync(join(WEB, 'package.json'), 'utf8'));
    expect(pkg.dependencies.next).toBeDefined();
    expect(pkg.dependencies.react).toBeDefined();
    expect(existsSync(join(WEB, 'src', 'app', 'layout.tsx'))).toBe(true);
    expect(existsSync(join(WEB, 'src', 'app', 'page.tsx'))).toBe(true);
  });

  it('is buildable and has produced a build', () => {
    expect(existsSync(join(WEB, '.next')), 'run `pnpm build` first').toBe(true);
    expect(existsSync(join(WEB, 'dist', 'main.js'))).toBe(true);
  });

  it('declares only the workspace edges its manifest permits', () => {
    const pkg = JSON.parse(readFileSync(join(WEB, 'package.json'), 'utf8'));
    expect([...pkg.zenlabs.allowedDependencies].sort()).toEqual([
      '@zenlabs/config',
      '@zenlabs/observability',
    ]);
    const edges = Object.keys(pkg.dependencies).filter((d) => d.startsWith('@zenlabs/'));
    expect(edges.sort()).toEqual(['@zenlabs/config', '@zenlabs/observability']);
  });
});

describe('apps/web boots and shuts down cleanly (epic P1 AE4)', () => {
  it('boots with typed configuration from packages/config', async () => {
    const result = await bootThenSignal(null);
    const started = result.stdout
      .trim()
      .split('\n')
      .map((l) => JSON.parse(l))
      .find((l) => l.msg === 'web started');

    expect(started, result.stdout + result.stderr).toBeDefined();
    expect(started.service).toBe('web');
    expect(started.appEnv).toBe('staging');
    expect(started.commitSha).toBe('websha123');
  }, 90_000);

  it('exits zero on SIGTERM', async () => {
    const result = await bootThenSignal(null, 'SIGTERM');
    expect(result.code, result.stderr).toBe(0);
    expect(result.closedBy).toBeNull();
    expect(result.stdout).toContain('shutdown complete');
  }, 90_000);

  it('exits zero on SIGINT', async () => {
    const result = await bootThenSignal(null, 'SIGINT');
    expect(result.code, result.stderr).toBe(0);
  }, 90_000);

  it('serves a liveness signal carrying the running commit SHA (cicd.md §3)', async () => {
    const result = await bootThenSignal(async () => {
      const response = await fetch(`http://127.0.0.1:${PORT}/api/health`);
      return { status: response.status, body: await response.json() };
    });

    expect(result.probeResult?.status).toBe(200);
    expect(result.probeResult?.body).toMatchObject({
      status: 'ok',
      process: 'web',
      commitSha: 'websha123',
    });
  }, 90_000);

  it('exits non-zero when a required key is absent (EX-P1-03)', () => {
    const result = spawnSync(process.execPath, [join(WEB, 'dist', 'main.js')], {
      cwd: WEB,
      env: { PATH: process.env.PATH ?? '' },
      encoding: 'utf8',
      timeout: 60_000,
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('APP_ENV');
    expect(result.stdout).not.toContain('web started');
  }, 90_000);
});

describe('apps/web mounts zero product behaviour', () => {
  const appFiles = () => {
    const out = [];
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else out.push(full);
      }
    };
    walk(join(WEB, 'src', 'app'));
    return out;
  };

  it('has no ZENLABS product route', () => {
    // Every client-facing resource of api-contracts.md §3 belongs to the epic
    // that owns it. None may appear in a P1 process shell.
    const PRODUCT_ROUTES = [
      'content-requests',
      'content-items',
      'calendar',
      'media-assets',
      'performance',
      'knowledge-sources',
      'subscription',
      'digital-twin',
      'usage',
    ];
    const paths = appFiles().map((f) => f.replace(WEB, ''));
    for (const route of PRODUCT_ROUTES) {
      expect(paths.join('\n'), `product route "${route}" must not exist in P1`).not.toContain(route);
    }
  });

  it('pulls in no design system — packages/ui is P18', () => {
    const pkg = JSON.parse(readFileSync(join(WEB, 'package.json'), 'utf8'));
    const all = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const forbidden of ['@zenlabs/ui', 'tailwindcss', 'lucide-react', 'class-variance-authority']) {
      expect(Object.keys(all), `${forbidden} belongs to P18, not P1`).not.toContain(forbidden);
    }
  });

  it('mounts only the placeholder index and the liveness route', () => {
    const routes = appFiles()
      .map((f) => f.replace(join(WEB, 'src', 'app'), ''))
      .filter((f) => /(page|route)\.tsx?$/.test(f))
      .sort();
    expect(routes).toEqual(['/api/health/route.ts', '/page.tsx']);
  });
});
