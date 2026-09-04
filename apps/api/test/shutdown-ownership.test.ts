import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startApi } from '../src/main';

/**
 * Review finding 4 — one owner of the process lifecycle.
 *
 * `app.enableShutdownHooks()` registers its own SIGTERM/SIGINT listeners that
 * call `app.close()`. Combined with the explicit handlers in `startApi`, that
 * made Nest a second owner of the same lifecycle: two listeners per signal, two
 * `app.close()` calls, and no single place deciding the exit code.
 *
 * These tests pin the single-owner property so it cannot regress.
 */

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env.APP_ENV = 'development';
  process.env.PROVIDER_MODE = 'mock';
  process.env.COMMIT_SHA = 'ownersha01';
  process.env.LOG_LEVEL = 'fatal';
  process.env.HOST = '127.0.0.1';
});

afterEach(() => {
  process.env = { ...originalEnv };
});

type Signal = 'SIGTERM' | 'SIGINT';
const SIGNALS: Signal[] = ['SIGTERM', 'SIGINT'];

type ListenerFn = NodeJS.SignalsListener;

/**
 * A snapshot of the signal listeners present before the subject runs.
 *
 * The test runner installs its own SIGTERM/SIGINT listeners, and Vitest relies
 * on them to shut workers down. `process.removeAllListeners()` would tear those
 * out along with ours, so the baseline is captured by identity and only the
 * listeners `startApi` added are detached afterwards.
 */
interface SignalBaseline {
  listeners: Record<Signal, ListenerFn[]>;
  counts: Record<Signal, number>;
}

function captureBaseline(): SignalBaseline {
  const listeners = {} as Record<Signal, ListenerFn[]>;
  const counts = {} as Record<Signal, number>;
  for (const signal of SIGNALS) {
    listeners[signal] = [...(process.listeners(signal) as ListenerFn[])];
    counts[signal] = listeners[signal].length;
  }
  return { listeners, counts };
}

/** Listeners present now that were not present at baseline. */
function addedSince(baseline: SignalBaseline, signal: Signal): ListenerFn[] {
  return (process.listeners(signal) as ListenerFn[]).filter(
    (listener) => !baseline.listeners[signal].includes(listener),
  );
}

/** Detach only what the subject added; never touch a pre-existing listener. */
function detachAdded(baseline: SignalBaseline): void {
  for (const signal of SIGNALS) {
    for (const listener of addedSince(baseline, signal)) {
      process.off(signal, listener);
    }
  }
}

/**
 * Assert the process was left exactly as it was found: same count, and the very
 * same listener functions, in the same order.
 */
function expectBaselineRestored(baseline: SignalBaseline): void {
  for (const signal of SIGNALS) {
    const now = process.listeners(signal) as ListenerFn[];
    expect(now.length, `${signal} listener count drifted from the baseline`).toBe(
      baseline.counts[signal],
    );
    expect(now, `a pre-existing ${signal} listener was removed or reordered`).toEqual(
      baseline.listeners[signal],
    );
  }
}

describe('exactly one owner registers signal listeners', () => {
  it('adds one SIGTERM and one SIGINT listener, not two', async () => {
    const baseline = captureBaseline();
    try {
      const handle = await startApi({
        port: 0,
        installSignalHandlers: true,
        onExit: () => {},
      });

      // One listener each: ours. Nest adds none, because enableShutdownHooks
      // is not called.
      expect(addedSince(baseline, 'SIGTERM')).toHaveLength(1);
      expect(addedSince(baseline, 'SIGINT')).toHaveLength(1);

      await handle.shutdown('cleanup');
    } finally {
      detachAdded(baseline);
    }

    // The runner's own listeners survived intact.
    expectBaselineRestored(baseline);
  }, 60_000);

  it('registers no listener when the caller owns the lifecycle', async () => {
    const baseline = captureBaseline();
    try {
      const handle = await startApi({ port: 0, installSignalHandlers: false });
      expect(addedSince(baseline, 'SIGTERM')).toHaveLength(0);
      expect(addedSince(baseline, 'SIGINT')).toHaveLength(0);
      await handle.shutdown('cleanup');
    } finally {
      detachAdded(baseline);
    }
    expectBaselineRestored(baseline);
  }, 60_000);

  it('leaves pre-existing listeners untouched, including their identity', async () => {
    // A stand-in for the runner's own listener: it must still be attached, and
    // must be the same function object, after the subject has come and gone.
    const sentinel: ListenerFn = () => {};
    process.on('SIGTERM', sentinel);
    process.on('SIGINT', sentinel);

    const baseline = captureBaseline();
    try {
      const handle = await startApi({ port: 0, installSignalHandlers: true, onExit: () => {} });
      await handle.shutdown('cleanup');
    } finally {
      detachAdded(baseline);
    }

    expectBaselineRestored(baseline);
    expect(process.listeners('SIGTERM')).toContain(sentinel);
    expect(process.listeners('SIGINT')).toContain(sentinel);

    process.off('SIGTERM', sentinel);
    process.off('SIGINT', sentinel);
  }, 60_000);
});

/**
 * `NestFactory.create` returns a Proxy, so spying on `app.close` is not
 * observable from inside `startApi`. The shutdown body is counted instead, via
 * an injected logger — which is the property under test anyway: the shutdown
 * sequence, and therefore `app.close()`, must run exactly once.
 */
function recordingLogger() {
  const lines: Array<{ msg: string; fields?: Record<string, unknown> }> = [];
  const noop = () => {};
  const record = (msg: string, fields?: Record<string, unknown>) => lines.push({ msg, fields });
  return {
    lines,
    logger: {
      fatal: noop,
      error: noop,
      warn: noop,
      info: record,
      debug: noop,
      trace: noop,
      child: () => recordingLogger().logger,
    },
  };
}

const countOf = (lines: Array<{ msg: string }>, msg: string) =>
  lines.filter((l) => l.msg === msg).length;

describe('the shutdown sequence runs exactly once', () => {
  it('a repeated shutdown does not close the application twice', async () => {
    const { lines, logger } = recordingLogger();
    const handle = await startApi({ port: 0, installSignalHandlers: false, logger });

    await handle.shutdown('SIGTERM');
    await handle.shutdown('SIGTERM');
    await handle.shutdown('SIGINT');

    expect(countOf(lines, 'shutdown requested'), 'shutdown must start once').toBe(1);
    expect(countOf(lines, 'shutdown complete'), 'app.close must run once').toBe(1);
  }, 60_000);

  it('SIGTERM executes a single shutdown', async () => {
    const { lines, logger } = recordingLogger();
    const handle = await startApi({ port: 0, installSignalHandlers: false, logger });

    await handle.shutdown('SIGTERM');

    expect(countOf(lines, 'shutdown requested')).toBe(1);
    expect(countOf(lines, 'shutdown complete')).toBe(1);
    expect(lines.find((l) => l.msg === 'shutdown requested')?.fields?.signal).toBe('SIGTERM');
  }, 60_000);

  it('SIGINT executes a single shutdown', async () => {
    const { lines, logger } = recordingLogger();
    const handle = await startApi({ port: 0, installSignalHandlers: false, logger });

    await handle.shutdown('SIGINT');

    expect(countOf(lines, 'shutdown requested')).toBe(1);
    expect(countOf(lines, 'shutdown complete')).toBe(1);
    expect(lines.find((l) => l.msg === 'shutdown requested')?.fields?.signal).toBe('SIGINT');
  }, 60_000);

  it('concurrent signals share a single shutdown', async () => {
    const { lines, logger } = recordingLogger();
    const handle = await startApi({ port: 0, installSignalHandlers: false, logger });

    // Two signals racing, as an orchestrator sending SIGINT then SIGTERM would.
    const codes = await Promise.all([handle.shutdown('SIGTERM'), handle.shutdown('SIGINT')]);

    expect(countOf(lines, 'shutdown complete')).toBe(1);
    expect(codes).toEqual([0, 0]);
  }, 60_000);

  it('returns exit code zero', async () => {
    const handle = await startApi({ port: 0, installSignalHandlers: false });
    await expect(handle.shutdown('SIGTERM')).resolves.toBe(0);
  }, 60_000);
});
