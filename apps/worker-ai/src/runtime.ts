import { loadConfigOrExit } from '@zenlabs/config';
import { createLogger, newCorrelationId, withCorrelation } from '@zenlabs/observability';

/**
 * Worker process lifecycle (P1.09).
 *
 * A process shell only: boot with typed configuration, expose a liveness
 * signal, drain on SIGTERM, exit zero. There is no queue consumer, no handler
 * and no tenant context here — `P7.04` owns the worker harness and fills these
 * shells.
 *
 * This module is intentionally identical in all three worker apps. The three
 * copies are asserted byte-identical by `test/workers/lifecycle.test.mjs`, so
 * they cannot drift before `P7.04` consolidates them into one harness. A shared package is not an
 * option: `architecture.md` §2.2 fixes the package set at seven, and adding an
 * eighth would be an architecture change rather than a story decision.
 */

export interface QueueManifest {
  /** Process name as it appears in architecture.md §2.1. */
  readonly process: string;
  /** Responsibility, verbatim from architecture.md §2.1. */
  readonly responsibility: string;
  /** Queues this process consumes, per aws-topology.md §6. */
  readonly queues: readonly string[];
}

export interface LivenessSignal {
  readonly status: 'alive' | 'draining';
  readonly process: string;
  /** cicd.md §3 — the running commit SHA, so a process is traceable to a commit. */
  readonly commitSha: string;
  readonly startedAt: string;
  readonly uptimeMs: number;
}

export interface WorkerHandle {
  readonly liveness: () => LivenessSignal;
  /** Resolves once the drain completes. Exposed for tests; SIGTERM calls it. */
  readonly shutdown: (signal: string) => Promise<number>;
  /**
   * In-flight accounting used by the graceful drain.
   *
   * A shell starts no work of its own; `P7.04`'s harness wraps each message
   * handler in `beginWork()`/`endWork()` so shutdown waits for real work. The
   * accounting lives here rather than in the harness so the drain bound is a
   * property of the process, not of whatever runs inside it.
   */
  readonly beginWork: () => void;
  readonly endWork: () => void;
  readonly inFlight: () => number;
  /** False once shutdown has begun: the harness must stop accepting messages. */
  readonly accepting: () => boolean;
}

export interface StartWorkerOptions {
  manifest: QueueManifest;
  /** Injected in tests so no real signal handler is installed. */
  installSignalHandlers?: boolean;
  /** Injected in tests. */
  onExit?: (code: number) => void;
}

/**
 * Boot a worker process.
 *
 * Configuration is loaded once, before anything else: a missing key exits
 * non-zero here rather than surfacing later (P1.09 AC-1, EX-P1-03).
 */
export function startWorker(options: StartWorkerOptions): WorkerHandle {
  const { manifest } = options;
  const config = loadConfigOrExit({ kind: 'worker' });

  const logger = createLogger({
    service: manifest.process,
    level: config.LOG_LEVEL,
    commitSha: config.COMMIT_SHA,
  });

  const startedAt = new Date();
  let draining = false;
  /** In-flight units of work, maintained by beginWork()/endWork(). */
  let inFlightCount = 0;

  const beginWork = () => {
    if (draining) {
      // Stopped accepting new work is the first half of AC-3; enforcing it here
      // means a harness cannot accidentally start work during a drain.
      throw new Error(`${manifest.process} is draining and accepts no new work`);
    }
    inFlightCount += 1;
  };
  const endWork = () => {
    if (inFlightCount > 0) inFlightCount -= 1;
  };

  const liveness = (): LivenessSignal => ({
    status: draining ? 'draining' : 'alive',
    process: manifest.process,
    commitSha: config.COMMIT_SHA,
    startedAt: startedAt.toISOString(),
    uptimeMs: Date.now() - startedAt.getTime(),
  });

  /**
   * Graceful shutdown (AC-3): stop accepting new work, drain in-flight work
   * within a bounded timeout, exit zero.
   */
  const shutdown = async (signal: string): Promise<number> => {
    if (draining) return 0;
    draining = true;

    const bound = config.SHUTDOWN_DRAIN_TIMEOUT_MS;
    logger.info('shutdown requested', { signal, drainTimeoutMs: bound });

    const deadline = Date.now() + bound;
    while (inFlightCount > 0 && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    const drained = inFlightCount === 0;
    if (!drained) {
      // Bounded, not unbounded: exceeding the drain budget is reported, and the
      // process still exits rather than hanging past the SIGKILL grace period.
      logger.warn('drain budget exceeded', { inFlight: inFlightCount, drainTimeoutMs: bound });
    }

    logger.info('shutdown complete', { signal, drained });
    return 0;
  };

  // Signal handlers are installed *before* readiness is announced. Announcing
  // first leaves a window in which an orchestrator's SIGTERM finds no listener
  // and kills the process uncleanly — which is exactly the ungraceful shutdown
  // AC-3 exists to prevent.
  if (options.installSignalHandlers !== false) {
    const exit = options.onExit ?? ((code: number) => process.exit(code));
    for (const signal of ['SIGTERM', 'SIGINT'] as const) {
      process.on(signal, () => {
        void shutdown(signal).then(exit);
      });
    }
    // A shell has no work loop; hold the event loop open so the process is
    // genuinely long-running and SIGTERM has something to interrupt.
    const keepAlive = setInterval(() => {}, 1 << 30);
    process.on('exit', () => clearInterval(keepAlive));
  }

  withCorrelation({ correlationId: newCorrelationId() }, () => {
    logger.info('worker started', {
      responsibility: manifest.responsibility,
      queues: manifest.queues,
      providerMode: config.PROVIDER_MODE,
      appEnv: config.APP_ENV,
    });
  });

  return {
    liveness,
    shutdown,
    beginWork,
    endWork,
    inFlight: () => inFlightCount,
    accepting: () => !draining,
  };
}
