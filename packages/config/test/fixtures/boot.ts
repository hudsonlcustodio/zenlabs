/**
 * Minimal bootable process used by the P1.05 fail-fast boot test.
 *
 * It does exactly what every real ZENLABS process does at start: load
 * configuration once, or exit non-zero. Nothing else.
 */
import { loadConfigOrExit } from '../../src/load';
import type { ProcessKind } from '../../src/schema';

const kind = (process.argv[2] ?? 'api') as ProcessKind;
const config = loadConfigOrExit({ kind });

// Reached only when configuration is valid.
process.stdout.write(`BOOTED ${config.APP_ENV} ${config.PROVIDER_MODE}\n`);
process.exit(0);
