/**
 * apps/web — architecture.md §2.1, ADR-0003 (Next.js App Router).
 *
 * A custom server entry rather than bare `next start`, so the web process has
 * the same lifecycle contract as the other four §2.1 processes: typed
 * configuration loaded once at boot, a liveness signal carrying the running
 * commit SHA (cicd.md §3), and a bounded graceful shutdown that exits zero.
 *
 * Process shell only (P1.02 AC-4). The Portal / Studio / Control surfaces are
 * P15 onward and the design system is P18; neither is anticipated here.
 */
import { createServer, type Server } from 'node:http';
import { parse } from 'node:url';
import next from 'next';
import { loadConfigOrExit } from '@zenlabs/config';
import { createLogger } from '@zenlabs/observability';

export interface WebHandle {
  readonly server: Server;
  readonly shutdown: (signal: string) => Promise<number>;
  readonly port: number;
}

export async function startWeb(
  options: { installSignalHandlers?: boolean; onExit?: (code: number) => void } = {},
): Promise<WebHandle> {
  const config = loadConfigOrExit({ kind: 'web' });

  const logger = createLogger({
    service: 'web',
    level: config.LOG_LEVEL,
    commitSha: config.COMMIT_SHA,
  });

  const dev = config.APP_ENV === 'development';
  const app = next({ dev, dir: `${__dirname}/..` });
  const handle = app.getRequestHandler();
  await app.prepare();

  const server = createServer((req, res) => {
    void handle(req, res, parse(req.url ?? '/', true));
  });

  await new Promise<void>((resolve) => server.listen(config.PORT, config.HOST, resolve));

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : config.PORT;

  let closing = false;
  const shutdown = async (signal: string): Promise<number> => {
    if (closing) return 0;
    closing = true;
    logger.info('shutdown requested', { signal });

    await new Promise<void>((resolve) => server.close(() => resolve()));
    await app.close();

    logger.info('shutdown complete', { signal, drained: true });
    return 0;
  };

  // Signal handlers are installed *before* readiness is announced. Announcing
  // first leaves a window in which an orchestrator's SIGTERM finds no listener
  // and kills the process uncleanly — which is exactly the ungraceful shutdown
  // this contract exists to prevent.
  if (options.installSignalHandlers !== false) {
    const exit = options.onExit ?? ((code: number) => process.exit(code));
    for (const signal of ['SIGTERM', 'SIGINT'] as const) {
      process.on(signal, () => {
        void shutdown(signal).then(exit);
      });
    }
  }

  logger.info('web started', { appEnv: config.APP_ENV, port, providerMode: config.PROVIDER_MODE });

  return { server, shutdown, port };
}

// Only boot when executed directly, so tests can import startWeb.
if (require.main === module) {
  void startWeb();
}
