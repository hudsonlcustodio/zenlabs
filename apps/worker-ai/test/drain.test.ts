import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { startWorker } from '../src/runtime';
import { manifest } from '../src/manifest';

/**
 * P1.09 AC-3 — "stops accepting new work, drains in-flight work within a
 * bounded timeout, and exits zero. A test asserts the exit code and the drain
 * bound."
 *
 * The spawned-process tests in test/workers/lifecycle.test.mjs prove the exit
 * code on a real SIGTERM. They cannot prove the *drain*, because an idle shell
 * has nothing in flight. These in-process tests drive the drain directly.
 */

const DRAIN_MS = 300;

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env.APP_ENV = 'development';
  process.env.PROVIDER_MODE = 'mock';
  process.env.COMMIT_SHA = 'abc1234def';
  process.env.LOG_LEVEL = 'fatal'; // keep test output quiet
  process.env.SHUTDOWN_DRAIN_TIMEOUT_MS = String(DRAIN_MS);
});

afterEach(() => {
  process.env = { ...originalEnv };
});

const boot = () => startWorker({ manifest, installSignalHandlers: false });

describe('graceful drain (AC-3)', () => {
  it('starts alive and accepting, with nothing in flight', () => {
    const worker = boot();
    expect(worker.liveness().status).toBe('alive');
    expect(worker.accepting()).toBe(true);
    expect(worker.inFlight()).toBe(0);
  });

  it('exits zero immediately when idle', async () => {
    const worker = boot();
    const started = Date.now();
    await expect(worker.shutdown('SIGTERM')).resolves.toBe(0);
    expect(Date.now() - started).toBeLessThan(DRAIN_MS);
  });

  it('stops accepting new work as soon as shutdown begins', async () => {
    const worker = boot();
    const draining = worker.shutdown('SIGTERM');

    expect(worker.accepting()).toBe(false);
    expect(worker.liveness().status).toBe('draining');
    expect(() => worker.beginWork()).toThrow(/accepts no new work/);

    await draining;
  });

  it('waits for in-flight work to finish, then exits zero', async () => {
    const worker = boot();
    worker.beginWork();
    expect(worker.inFlight()).toBe(1);

    // Finish the work part-way through the drain budget.
    setTimeout(() => worker.endWork(), DRAIN_MS / 3);

    const started = Date.now();
    const code = await worker.shutdown('SIGTERM');
    const elapsed = Date.now() - started;

    expect(code).toBe(0);
    expect(worker.inFlight()).toBe(0);
    // It genuinely waited...
    expect(elapsed).toBeGreaterThanOrEqual(DRAIN_MS / 4);
    // ...but did not burn the whole budget.
    expect(elapsed).toBeLessThan(DRAIN_MS);
  });

  it('is bounded: work that never finishes does not hang the process', async () => {
    const worker = boot();
    worker.beginWork(); // never ended

    const started = Date.now();
    const code = await worker.shutdown('SIGTERM');
    const elapsed = Date.now() - started;

    // Exits zero rather than hanging past the orchestrator's SIGKILL grace.
    expect(code).toBe(0);
    expect(elapsed).toBeGreaterThanOrEqual(DRAIN_MS - 50);
    expect(elapsed).toBeLessThan(DRAIN_MS * 4);
    expect(worker.inFlight()).toBe(1);
  });

  it('honours the configured drain bound rather than a hard-coded one', async () => {
    process.env.SHUTDOWN_DRAIN_TIMEOUT_MS = '80';
    const worker = boot();
    worker.beginWork();

    const started = Date.now();
    await worker.shutdown('SIGTERM');
    const elapsed = Date.now() - started;

    expect(elapsed).toBeLessThan(DRAIN_MS);
    expect(elapsed).toBeGreaterThanOrEqual(60);
  });

  it('is idempotent — a second signal does not restart the drain', async () => {
    const worker = boot();
    await worker.shutdown('SIGTERM');
    await expect(worker.shutdown('SIGTERM')).resolves.toBe(0);
  });
});

describe('liveness signal (AC-4)', () => {
  it('carries the running commit SHA and the process name', () => {
    const worker = boot();
    const signal = worker.liveness();
    expect(signal.commitSha).toBe('abc1234def');
    expect(signal.process).toBe('worker-ai');
    expect(signal.uptimeMs).toBeGreaterThanOrEqual(0);
    expect(Date.parse(signal.startedAt)).not.toBeNaN();
  });

  it('reports draining once shutdown has begun', async () => {
    const worker = boot();
    const draining = worker.shutdown('SIGTERM');
    expect(worker.liveness().status).toBe('draining');
    await draining;
  });
});
