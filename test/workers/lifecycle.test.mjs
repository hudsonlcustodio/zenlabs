/**
 * P1.09 verification gate — "All three processes boot and shut down cleanly in
 * CI; ... the fail-fast boot test exits non-zero on a missing key."
 *
 * These spawn the real processes. A worker that shuts down cleanly in a unit
 * test but hangs on a real SIGTERM has not satisfied AC-3.
 */
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = process.cwd();
const WORKERS = ['worker-ai', 'worker-media', 'worker-social'];
const TSX = join(ROOT, 'node_modules', '.bin', 'tsx');

const DRAIN_MS = 1500;

const baseEnv = (extra = {}) => ({
  PATH: process.env.PATH ?? '',
  APP_ENV: 'development',
  PROVIDER_MODE: 'mock',
  COMMIT_SHA: 'abc1234def',
  SHUTDOWN_DRAIN_TIMEOUT_MS: String(DRAIN_MS),
  ...extra,
});

/** Boot a worker, wait for its "worker started" line, then send `signal`. */
function bootThenSignal(worker, signal = 'SIGTERM', env = baseEnv()) {
  return new Promise((resolve) => {
    const child = spawn(TSX, [join(ROOT, 'apps', worker, 'src', 'main.ts')], {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let signalled = false;
    const started = Date.now();

    child.stdout.on('data', (chunk) => {
      stdout += chunk;
      if (!signalled && stdout.includes('worker started')) {
        signalled = true;
        child.kill(signal);
      }
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    child.on('close', (code, closedBy) => {
      resolve({ code, closedBy, stdout, stderr, elapsedMs: Date.now() - started });
    });

    setTimeout(() => child.kill('SIGKILL'), 45_000);
  });
}

describe.each(WORKERS)('%s — boot and graceful shutdown', (worker) => {
  it('boots with typed configuration and announces its queues (AC-1, AC-2)', async () => {
    const result = await bootThenSignal(worker);
    const lines = result.stdout.trim().split('\n').map((l) => JSON.parse(l));
    const startLine = lines.find((l) => l.msg === 'worker started');

    expect(startLine, result.stdout).toBeDefined();
    expect(startLine.service).toBe(worker);
    expect(startLine.queues.length).toBeGreaterThan(0);
    expect(startLine.providerMode).toBe('mock');
  });

  it('EX-P1-07: exits zero on SIGTERM within the configured drain bound (AC-3)', async () => {
    const result = await bootThenSignal(worker, 'SIGTERM');

    expect(result.code, `stderr: ${result.stderr}`).toBe(0);
    expect(result.closedBy).toBeNull();
    expect(result.stdout).toContain('shutdown complete');
    // Idle, so it must not consume the drain budget.
    expect(result.elapsedMs).toBeLessThan(30_000);
  });

  it('stops accepting work before draining, and reports the signal', async () => {
    const result = await bootThenSignal(worker, 'SIGTERM');
    const lines = result.stdout.trim().split('\n').map((l) => JSON.parse(l));

    const requested = lines.findIndex((l) => l.msg === 'shutdown requested');
    const complete = lines.findIndex((l) => l.msg === 'shutdown complete');
    expect(requested).toBeGreaterThanOrEqual(0);
    expect(complete).toBeGreaterThan(requested);
    expect(lines[requested].signal).toBe('SIGTERM');
    expect(lines[requested].drainTimeoutMs).toBe(DRAIN_MS);
    expect(lines[complete].drained).toBe(true);
  });

  it('exits zero on SIGINT as well', async () => {
    const result = await bootThenSignal(worker, 'SIGINT');
    expect(result.code).toBe(0);
  });

  it('AC-4: the liveness line carries the running commit SHA (cicd.md §3)', async () => {
    const result = await bootThenSignal(worker);
    const lines = result.stdout.trim().split('\n').map((l) => JSON.parse(l));
    for (const line of lines) {
      expect(line.commitSha).toBe('abc1234def');
    }
  });

  it('AC-4: binds no HTTP port', async () => {
    const result = await bootThenSignal(worker);
    // A worker exposes liveness through its log stream and process exit code,
    // never by serving product data over HTTP.
    const source = readFileSync(join(ROOT, 'apps', worker, 'src', 'runtime.ts'), 'utf8');
    expect(source).not.toMatch(/createServer|\.listen\(|express|fastify/);
    expect(result.stdout).not.toContain('listening');
  });

  it('AC-1 / EX-P1-03: exits non-zero when a required key is absent', () => {
    const result = spawnSync(TSX, [join(ROOT, 'apps', worker, 'src', 'main.ts')], {
      env: { PATH: process.env.PATH ?? '' },
      encoding: 'utf8',
      timeout: 60_000,
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('APP_ENV');
    expect(result.stdout).not.toContain('worker started');
  });
});

describe('AC-5 — the workers are stateless (NFR-11)', () => {
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

  it.each(WORKERS)('%s writes nothing to local disk during boot or an idle cycle', async (worker) => {
    const workerDir = join(ROOT, 'apps', worker);
    const before = snapshot(workerDir);
    await bootThenSignal(worker);
    const after = snapshot(workerDir);
    expect(after).toEqual(before);
  });

  it.each(WORKERS)('%s contains no filesystem write call', (worker) => {
    const source = readFileSync(join(ROOT, 'apps', worker, 'src', 'runtime.ts'), 'utf8');
    expect(source).not.toMatch(/writeFile|appendFile|createWriteStream|mkdir|rmSync|unlink/);
  });
});

describe('AC-6 — the P1.03 dependency assertion covers all three processes', () => {
  const manifestOf = (worker) =>
    JSON.parse(readFileSync(join(ROOT, 'apps', worker, 'package.json'), 'utf8'));

  it.each(WORKERS)('%s may depend only on packages/config and packages/observability', (worker) => {
    const pkg = manifestOf(worker);
    expect([...pkg.zenlabs.allowedDependencies].sort()).toEqual([
      '@zenlabs/config',
      '@zenlabs/observability',
    ]);
  });

  it.each(WORKERS)('%s declares no workspace edge outside that set', (worker) => {
    const pkg = manifestOf(worker);
    const edges = Object.keys(pkg.dependencies ?? {}).filter((d) => d.startsWith('@zenlabs/'));
    expect(edges.sort()).toEqual(['@zenlabs/config', '@zenlabs/observability']);
  });

  it('FF-04 is green for the worker processes on the current tree', () => {
    const result = spawnSync(
      process.execPath,
      [join(ROOT, 'scripts', 'fitness', 'ff-04-dependency-graph.mjs')],
      { encoding: 'utf8' },
    );
    expect(result.status, result.stdout + result.stderr).toBe(0);
  });
});

describe('the three runtimes cannot drift before P7.04 consolidates them', () => {
  it('runtime.ts is byte-identical across all three workers', () => {
    const [first, ...rest] = WORKERS.map((w) =>
      readFileSync(join(ROOT, 'apps', w, 'src', 'runtime.ts'), 'utf8'),
    );
    for (const [index, other] of rest.entries()) {
      expect(other, `${WORKERS[index + 1]} has drifted from ${WORKERS[0]}`).toBe(first);
    }
  });
});
