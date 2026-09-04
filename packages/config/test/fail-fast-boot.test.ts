import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

/**
 * P1.05 verification gate — "Fail-fast boot test green; FF-20 precondition
 * (no value echoing) respected."
 *
 * These spawn a real process. A unit test proving `loadConfig` throws is not
 * the same claim as a process actually exiting non-zero, and EX-P1-03 is about
 * the process.
 */

const FIXTURE = join(__dirname, 'fixtures', 'boot.ts');
const TSX = join(process.cwd(), 'node_modules', '.bin', 'tsx');

function boot(env: NodeJS.ProcessEnv, kind = 'api') {
  return spawnSync(TSX, [FIXTURE, kind], {
    // A bare env: inheriting the developer's shell would mask a missing key.
    env: { PATH: process.env.PATH ?? '', ...env },
    encoding: 'utf8',
    timeout: 60_000,
  });
}

describe('a correctly configured process boots', () => {
  it('exits zero and reports its environment', () => {
    const result = boot({ APP_ENV: 'development', PORT: '3000' });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('BOOTED development mock');
  });

  it('boots a worker with its drain bound', () => {
    const result = boot({ APP_ENV: 'development', SHUTDOWN_DRAIN_TIMEOUT_MS: '2000' }, 'worker');
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('BOOTED development');
  });
});

describe('EX-P1-03 — a missing required key exits non-zero', () => {
  it('exits non-zero when APP_ENV is absent', () => {
    const result = boot({});
    expect(result.status).not.toBe(0);
    expect(result.status).toBe(1);
    expect(result.stdout).not.toContain('BOOTED');
  });

  it('logs the key name', () => {
    const result = boot({});
    expect(result.stderr).toContain('APP_ENV');
    expect(result.stderr).toContain('required but not set');
  });

  it('logs the key name without its value', () => {
    // Built at runtime — see FF-19 (P1.07): no credential-shaped literal is
    // ever committed, not even a fake one.
    const SECRET = ['sk', 'live', 'do', 'not', 'log', 'me', '4a91b7'].join('-');
    const result = boot({ APP_ENV: 'staging', PORT: SECRET });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('PORT');
    // FF-20 precondition: the value must not reach the log stream.
    expect(result.stderr).not.toContain(SECRET);
    expect(result.stdout).not.toContain(SECRET);
  });

  it('rejects a malformed environment rather than defaulting to one', () => {
    const result = boot({ APP_ENV: 'prod' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('development | staging | production');
  });

  it('rejects a foreign-environment resource identifier (NFR-12)', () => {
    // PROVIDER_MODE is valid; APP_ENV disagrees with the literal-bound schema.
    const result = boot({ APP_ENV: 'production', PROVIDER_MODE: 'nonsense' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('PROVIDER_MODE');
  });
});
