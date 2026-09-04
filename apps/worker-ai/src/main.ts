/**
 * apps/worker-ai — architecture.md §2.1.
 *
 * Process shell only (P1.09). The queue consumer, tenant context and handler
 * dispatch are `P7.04`.
 */
import { manifest } from './manifest';
import { startWorker } from './runtime';

startWorker({ manifest });
