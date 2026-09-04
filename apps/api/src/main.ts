import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import { loadConfigOrExit } from '@zenlabs/config';
import { createLogger, type Logger } from '@zenlabs/observability';
import { AppModule } from './app.module';
import { ProblemDetailsFilter } from './common/filters/problem-details.filter';

/**
 * apps/api — NestJS modular HTTP API (architecture.md §2.1, ADR-0004).
 *
 * Command/query entry point; owns transactions. Wave 1 ships the process, the
 * module layout and the request pipeline — no product route, no guard, no
 * domain module (epic P1 NG4).
 */

export interface ApiHandle {
  readonly app: INestApplication;
  readonly port: number;
  readonly shutdown: (signal: string) => Promise<number>;
}

export interface StartApiOptions {
  installSignalHandlers?: boolean;
  onExit?: (code: number) => void;
  /** Bind an ephemeral port. Used by tests. */
  port?: number;
  logger?: Logger;
}

export async function startApi(options: StartApiOptions = {}): Promise<ApiHandle> {
  // Configuration is parsed once, before the framework is touched, so a missing
  // key exits non-zero *before a port is bound* (AC-1, EX-P1-04).
  const config = loadConfigOrExit({ kind: 'api' });

  const logger =
    options.logger ??
    createLogger({ service: 'api', level: config.LOG_LEVEL, commitSha: config.COMMIT_SHA });

  const app = await NestFactory.create(AppModule.register({ commitSha: config.COMMIT_SHA }), {
    // Nest's own logger would emit unstructured text alongside our JSON lines.
    logger: false,
  });

  // AC-3 — one renderer for every failure, bound globally so no handler can
  // return an ad-hoc error shape.
  app.useGlobalFilters(new ProblemDetailsFilter(logger));

  // NFR-11 / AC-6: nothing is written to local disk, so no static asset or
  // upload directory is configured here.
  //
  // `app.enableShutdownHooks()` is deliberately NOT called. It registers its own
  // SIGTERM/SIGINT listeners that call `app.close()`, which would make Nest a
  // second owner of a lifecycle this function already owns: two listeners per
  // signal, two `app.close()` calls, and no single place deciding the exit code.
  // Module `onModuleDestroy` / `onApplicationShutdown` hooks still run, because
  // they are triggered by `app.close()` itself rather than by the signal
  // listeners that `enableShutdownHooks` adds.

  const port = options.port ?? config.PORT;
  await app.listen(port, config.HOST);

  const url = await app.getUrl();
  const boundPort = Number(new URL(url.replace('[::1]', '127.0.0.1')).port) || port;

  // The single owner of this process's shutdown. Guarded so a second signal —
  // or a test calling it twice — can never close the application twice.
  let closing: Promise<number> | null = null;
  const shutdown = (signal: string): Promise<number> => {
    if (closing) return closing;
    closing = (async () => {
      logger.info('shutdown requested', { signal });
      await app.close();
      logger.info('shutdown complete', { signal, drained: true });
      return 0;
    })();
    return closing;
  };

  // Installed before readiness is announced: announcing first leaves a window
  // in which an orchestrator's SIGTERM finds no listener and kills the process
  // uncleanly.
  if (options.installSignalHandlers !== false) {
    const exit = options.onExit ?? ((code: number) => process.exit(code));
    for (const signal of ['SIGTERM', 'SIGINT'] as const) {
      process.on(signal, () => {
        void shutdown(signal).then(exit);
      });
    }
  }

  logger.info('api started', {
    appEnv: config.APP_ENV,
    port: boundPort,
    providerMode: config.PROVIDER_MODE,
  });

  return { app, port: boundPort, shutdown };
}

if (require.main === module) {
  void startApi();
}
